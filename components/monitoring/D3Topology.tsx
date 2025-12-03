'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Layers, Network, X } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';
import { TopologyData, NetworkNode, NetworkLink, TopologyViewMode } from '@/types/topology';
import { getNetworkIconSvg } from '@/lib/networkIcons';

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: NetworkNode['type'];
  status: NetworkNode['status'];
  role?: string;
  vlan?: number;
  layer?: number;
  ip?: string;
  bandwidthLabel?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  bandwidth: number;
  utilization: number;
  status: NetworkLink['status'];
  type: NetworkLink['type'];
}

interface D3TopologyProps {
  className?: string;
  data?: TopologyData;
  viewMode?: TopologyViewMode;
  onViewModeChange?: (mode: TopologyViewMode) => void;
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
  editable?: boolean;
}

// VLAN 색상 매핑
const VLAN_COLORS: Record<number, string> = {
  100: '#EF4444', // Red
  101: '#EF4444',
  200: '#F97316', // Orange
  201: '#F97316',
  300: '#22C55E', // Green
  301: '#22C55E',
  400: '#8B5CF6', // Purple
  401: '#8B5CF6',
};

// 상태별 색상
const STATUS_COLORS = {
  active: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  inactive: '#6B7280',
  congested: '#F97316',
  down: '#EF4444',
};

export function D3Topology({ className, data, viewMode = 'physical', onViewModeChange, onNodeClick, onLinkClick, editable = false }: D3TopologyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<TopologyViewMode>(viewMode);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [selectedLink, setSelectedLink] = useState<D3Link | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number; direction: 'up' | 'down' } | null>(null);

  const currentViewMode = onViewModeChange ? viewMode : internalViewMode;

  const handleViewModeChange = useCallback((mode: TopologyViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  }, [onViewModeChange]);

  // 데이터 변환
  const { nodes, links } = useMemo(() => {
    if (!data) {
      return { nodes: [], links: [] };
    }

    const d3Nodes: D3Node[] = data.nodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      status: node.status,
      role: node.role,
      vlan: node.vlan,
      layer: node.layer,
      ip: node.ip,
      bandwidthLabel: node.bandwidthLabel,
    }));

    const d3Links: D3Link[] = data.links.map(link => ({
      id: link.id,
      source: link.source,
      target: link.target,
      bandwidth: link.bandwidth,
      utilization: link.utilization,
      status: link.status,
      type: link.type,
    }));

    return { nodes: d3Nodes, links: d3Links };
  }, [data]);

  // 다크 모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // D3 시각화
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 이전 내용 제거
    svg.selectAll('*').remove();

    // 테마 색상
    const colors = isDarkMode
      ? {
          background: '#111827',
          nodeDefault: '#374151',
          nodeBorder: '#4B5563',
          link: '#4B5563',
          linkActive: '#6B7280',
          text: '#E5E7EB',
          textBg: 'rgba(17, 24, 39, 0.9)',
        }
      : {
          background: '#F9FAFB',
          nodeDefault: '#F3F4F6',
          nodeBorder: '#9CA3AF',
          link: '#D1D5DB',
          linkActive: '#9CA3AF',
          text: '#374151',
          textBg: 'rgba(255, 255, 255, 0.9)',
        };

    // 배경
    svg.style('background-color', colors.background);

    // 줌 동작 정의
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        // 줌/팬 시 팝업 닫기
        setSelectedNode(null);
        setSelectedLink(null);
        setPopupPosition(null);
      });

    svg.call(zoom);

    // 배경 클릭 시 팝업 닫기
    svg.on('click', () => {
      setSelectedNode(null);
      setSelectedLink(null);
      setPopupPosition(null);
    });

    // 메인 그룹
    const g = svg.append('g');

    // 딥 카피하여 원본 데이터 보존
    const nodesCopy: D3Node[] = nodes.map(n => ({ ...n }));
    const linksCopy: D3Link[] = links.map(l => ({ ...l }));

    // 물리적 뷰: 계층 기반 레이아웃
    if (currentViewMode === 'physical') {
      const layerHeight = height / 5;
      const nodesByLayer: Record<number, D3Node[]> = {};

      nodesCopy.forEach(node => {
        const layer = node.layer || 1;
        if (!nodesByLayer[layer]) nodesByLayer[layer] = [];
        nodesByLayer[layer].push(node);
      });

      Object.entries(nodesByLayer).forEach(([layer, layerNodes]) => {
        const y = parseInt(layer) * layerHeight;
        const spacing = width / (layerNodes.length + 1);
        layerNodes.forEach((node, i) => {
          node.fx = spacing * (i + 1);
          node.fy = y;
        });
      });
    }

    // Force simulation
    const simulation = d3
      .forceSimulation<D3Node>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(linksCopy)
          .id((d) => d.id)
          .distance(currentViewMode === 'logical' ? 120 : 80)
          .strength(currentViewMode === 'logical' ? 0.5 : 0.8)
      )
      .force('charge', d3.forceManyBody().strength(currentViewMode === 'logical' ? -400 : -200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(currentViewMode === 'logical' ? 50 : 35));

    simulationRef.current = simulation;

    // 물리적 뷰에서는 시뮬레이션 약하게
    if (currentViewMode === 'physical') {
      simulation.alpha(0.1).alphaDecay(0.05);
    }

    // 링크 상태별 스타일
    const getLinkColor = (status: string) => {
      switch (status) {
        case 'active': return isDarkMode ? '#4ADE80' : '#22C55E';
        case 'congested': return '#F97316';
        case 'down': return '#EF4444';
        default: return colors.link;
      }
    };

    // 링크 그리기
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', d => getLinkColor(d.status))
      .attr('stroke-width', d => {
        if (d.status === 'down') return 2;
        return Math.max(2, Math.min(6, d.bandwidth / 10000));
      })
      .attr('stroke-opacity', d => d.status === 'down' ? 0.4 : 0.7)
      .attr('stroke-dasharray', d => d.status === 'down' ? '5,5' : 'none');

    // 링크 utilization 배경
    const linkBg = g
      .append('g')
      .attr('class', 'link-labels-bg')
      .selectAll('rect')
      .data(linksCopy)
      .join('rect')
      .attr('fill', colors.textBg)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('opacity', 0.8);

    // 링크 라벨 (utilization)
    const linkLabel = g
      .append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(linksCopy)
      .join('text')
      .attr('font-size', 9)
      .attr('fill', d => {
        if (d.utilization > 75) return STATUS_COLORS.congested;
        if (d.utilization > 50) return STATUS_COLORS.warning;
        return colors.text;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', 3)
      .text(d => d.status === 'down' ? 'DOWN' : `${Math.round(d.utilization)}%`);

    // 노드 색상 결정
    const getNodeColor = (node: D3Node) => {
      if (currentViewMode === 'logical' && node.vlan) {
        return VLAN_COLORS[node.vlan] || colors.nodeDefault;
      }

      // 물리적 뷰 또는 VLAN 없는 경우 타입 기반 색상
      switch (node.type) {
        case 'controller': return isDarkMode ? '#F59E0B' : '#FCD34D';
        case 'switch': return isDarkMode ? '#3B82F6' : '#60A5FA';
        case 'router': return isDarkMode ? '#8B5CF6' : '#A78BFA';
        case 'host': return isDarkMode ? '#10B981' : '#34D399';
        case 'group': return isDarkMode ? '#6366F1' : '#818CF8';
        default: return colors.nodeDefault;
      }
    };

    // 노드 크기 결정
    const getNodeSize = (node: D3Node) => {
      if (node.role === 'spine') return 28;
      if (node.role === 'leaf') return 24;
      if (node.type === 'controller') return 30;
      if (node.type === 'group') return 18;
      return 20;
    };

    // 노드 테두리 색상 (상태 기반)
    const getNodeBorderColor = (node: D3Node) => {
      switch (node.status) {
        case 'active': return STATUS_COLORS.active;
        case 'warning': return STATUS_COLORS.warning;
        case 'error': return STATUS_COLORS.error;
        case 'inactive': return STATUS_COLORS.inactive;
        default: return colors.nodeBorder;
      }
    };

    // 노드 그룹 생성
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodesCopy)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const popupWidth = 320;
          const popupHeight = 300;
          const padding = 20;

          // 노드의 현재 위치
          const nodeX = d.x || 0;
          const nodeY = d.y || 0;

          // 현재 줌 변환 적용
          const transform = d3.zoomTransform(svgRef.current!);
          const screenX = transform.applyX(nodeX);
          const screenY = transform.applyY(nodeY);

          // X 좌표 조정
          let popupX = screenX;
          if (popupX - popupWidth / 2 < padding) {
            popupX = popupWidth / 2 + padding;
          } else if (popupX + popupWidth / 2 > containerRect.width - padding) {
            popupX = containerRect.width - popupWidth / 2 - padding;
          }

          // Y 좌표 및 방향 결정
          let popupY = screenY - 40;
          let direction: 'up' | 'down' = 'up';

          if (screenY - popupHeight - 40 < 0) {
            popupY = screenY + 50;
            direction = 'down';
          }

          setSelectedNode(d);
          setSelectedLink(null);
          setPopupPosition({ x: popupX, y: popupY, direction });
        }
      });

    // 노드 모양 - SVG 아이콘 이미지 사용
    node.each(function(d) {
      const el = d3.select(this);
      const size = getNodeSize(d);
      const iconSize = size * 2.5;

      // SVG 아이콘 이미지 추가
      const iconUrl = getNetworkIconSvg(
        d.type,
        d.role,
        getNodeColor(d),
        getNodeBorderColor(d),
        isDarkMode
      );

      el.append('image')
        .attr('xlink:href', iconUrl)
        .attr('x', -iconSize / 2)
        .attr('y', -iconSize / 2)
        .attr('width', iconSize)
        .attr('height', iconSize)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    });

    // 노드 라벨
    node
      .append('text')
      .attr('font-size', d => d.type === 'group' ? 9 : 10)
      .attr('fill', colors.text)
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeSize(d) + 14)
      .text(d => d.label);

    // 논리적 뷰에서 VLAN 표시
    if (currentViewMode === 'logical') {
      node
        .filter(d => d.vlan !== undefined)
        .append('text')
        .attr('font-size', 8)
        .attr('fill', colors.text)
        .attr('text-anchor', 'middle')
        .attr('dy', d => getNodeSize(d) + 24)
        .text(d => `VLAN ${d.vlan}`);
    }

    // 물리적 뷰에서 IP 표시
    if (currentViewMode === 'physical') {
      node
        .filter(d => d.ip !== undefined)
        .append('text')
        .attr('font-size', 8)
        .attr('fill', isDarkMode ? '#9CA3AF' : '#6B7280')
        .attr('text-anchor', 'middle')
        .attr('dy', d => getNodeSize(d) + 24)
        .text(d => d.ip || '');
    }

    // Simulation 업데이트
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      const labelX = (d: any) => (d.source.x + d.target.x) / 2;
      const labelY = (d: any) => (d.source.y + d.target.y) / 2;

      linkLabel
        .attr('x', labelX)
        .attr('y', labelY);

      linkBg
        .attr('x', (d: any) => labelX(d) - 18)
        .attr('y', (d: any) => labelY(d) - 8)
        .attr('width', 36)
        .attr('height', 14);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // 드래그 함수
    function dragstarted(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: D3Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0);
      // 물리적 뷰에서는 위치 고정 유지
      if (currentViewMode !== 'physical') {
        d.fx = null;
        d.fy = null;
      }
    }

    // 줌 컨트롤 함수 저장
    (svgRef.current as any).__zoom__ = zoom;
    (svgRef.current as any).__svg__ = svg;

    // 초기 뷰 맞추기
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(0.9);
    svg.call(zoom.transform, initialTransform);

    return () => {
      simulation.stop();
    };
  }, [isDarkMode, nodes, links, currentViewMode]);

  // 줌 컨트롤
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const zoom = (svgRef.current as any).__zoom__;
    if (zoom) {
      svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const zoom = (svgRef.current as any).__zoom__;
    if (zoom) {
      svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    }
  };

  const handleFit = () => {
    const svg = d3.select(svgRef.current);
    const zoom = (svgRef.current as any).__zoom__;
    if (zoom) {
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity.scale(0.9));
    }
  };

  const handleReset = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
    handleFit();
  };

  return (
    <div ref={containerRef} className={cn('relative h-full w-full', className)}>
      {/* 컨트롤 패널 */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* 줌 컨트롤 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-1 border border-gray-200 dark:border-gray-700">
          <Button variant="icon" onClick={handleZoomIn} title="줌 인">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="icon" onClick={handleZoomOut} title="줌 아웃">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="icon" onClick={handleFit} title="화면에 맞추기">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="icon" onClick={handleReset} title="리셋">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* 뷰 모드 토글 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-1 border border-gray-200 dark:border-gray-700">
          <Button
            variant="icon"
            onClick={() => handleViewModeChange('physical')}
            title="물리적 뷰"
            className={currentViewMode === 'physical' ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <Layers className="w-4 h-4" />
          </Button>
          <Button
            variant="icon"
            onClick={() => handleViewModeChange('logical')}
            title="논리적 뷰"
            className={currentViewMode === 'logical' ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <Network className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 범례 */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 max-w-[200px]">
        <div className="text-xs font-medium text-gray-900 dark:text-white mb-2">
          {currentViewMode === 'physical' ? '물리적 뷰' : '논리적 뷰'}
        </div>

        {currentViewMode === 'logical' ? (
          // 논리적 뷰: VLAN 색상 범례
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">VLAN</div>
            {Object.entries(VLAN_COLORS)
              .filter(([vlan]) => parseInt(vlan) % 100 === 0)
              .map(([vlan, color]) => (
                <div key={vlan} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-300">VLAN {vlan}</span>
                </div>
              ))}
          </div>
        ) : (
          // 물리적 뷰: 계층 범례
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">계층</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 clip-hexagon" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Spine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 clip-hexagon" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Leaf</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Group</span>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">상태</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: STATUS_COLORS.active }} />
              <span className="text-xs text-gray-600 dark:text-gray-300">정상</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: STATUS_COLORS.warning }} />
              <span className="text-xs text-gray-600 dark:text-gray-300">경고</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: STATUS_COLORS.error }} />
              <span className="text-xs text-gray-600 dark:text-gray-300">오류</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">링크</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5" style={{ backgroundColor: STATUS_COLORS.active }} />
              <span className="text-xs text-gray-600 dark:text-gray-300">정상</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5" style={{ backgroundColor: STATUS_COLORS.congested }} />
              <span className="text-xs text-gray-600 dark:text-gray-300">혼잡</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: STATUS_COLORS.error }} />
              <span className="text-xs text-gray-600 dark:text-gray-300">다운</span>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 없음 표시 */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            토폴로지 데이터가 없습니다
          </div>
        </div>
      )}

      {/* 노드 팝업 정보 */}
      {selectedNode && popupPosition && (
        <div
          className={cn(
            'absolute z-30 transform -translate-x-1/2',
            popupPosition.direction === 'up' ? '-translate-y-full' : ''
          )}
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[280px] max-w-[360px]">
            {/* 헤더 */}
            <div className={cn(
              'px-4 py-3 flex items-center justify-between',
              selectedNode.status === 'active' && 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-green-500/20',
              selectedNode.status === 'warning' && 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-b border-yellow-500/20',
              selectedNode.status === 'error' && 'bg-gradient-to-r from-red-500/10 to-red-500/5 border-b border-red-500/20',
              selectedNode.status === 'inactive' && 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 border-b border-gray-500/20',
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  selectedNode.status === 'active' && 'bg-green-500/20',
                  selectedNode.status === 'warning' && 'bg-yellow-500/20',
                  selectedNode.status === 'error' && 'bg-red-500/20',
                  selectedNode.status === 'inactive' && 'bg-gray-500/20',
                )}>
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    selectedNode.status === 'active' && 'bg-green-500',
                    selectedNode.status === 'warning' && 'bg-yellow-500',
                    selectedNode.status === 'error' && 'bg-red-500',
                    selectedNode.status === 'inactive' && 'bg-gray-500',
                  )} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedNode.label}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      selectedNode.status === 'active' && 'bg-green-500/20 text-green-600 dark:text-green-400',
                      selectedNode.status === 'warning' && 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                      selectedNode.status === 'error' && 'bg-red-500/20 text-red-600 dark:text-red-400',
                      selectedNode.status === 'inactive' && 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
                    )}>
                      {selectedNode.status === 'active' ? 'Active' : selectedNode.status === 'warning' ? 'Warning' : selectedNode.status === 'error' ? 'Error' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {selectedNode.type}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setPopupPosition(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* 본문 */}
            <div className="px-4 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">ID</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedNode.id}</div>
                </div>
                {selectedNode.role && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">역할</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selectedNode.role}</div>
                  </div>
                )}
              </div>

              {(selectedNode.ip || selectedNode.vlan) && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">네트워크 정보</div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 space-y-2">
                    {selectedNode.ip && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">IP 주소</span>
                        <span className="text-xs font-mono font-medium text-gray-900 dark:text-white">{selectedNode.ip}</span>
                      </div>
                    )}
                    {selectedNode.vlan && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">VLAN</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: VLAN_COLORS[selectedNode.vlan] || '#6B7280' }}
                          />
                          {selectedNode.vlan}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedNode.bandwidthLabel && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">성능 정보</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedNode.bandwidthLabel}</div>
                      <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70">대역폭</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 화살표 포인터 */}
          {popupPosition.direction === 'up' ? (
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-gray-800" />
            </div>
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 -top-2">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white dark:border-b-gray-800" />
            </div>
          )}
        </div>
      )}

      {/* SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />
    </div>
  );
}
