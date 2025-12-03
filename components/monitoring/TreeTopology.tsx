'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Layers, Network, X } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';
import { TopologyData, NetworkNode, TopologyViewMode } from '@/types/topology';
import { getNetworkIconSvg } from '@/lib/networkIcons';

interface TreeNode {
  id: string;
  label: string;
  type: NetworkNode['type'];
  status: NetworkNode['status'];
  role?: string;
  vlan?: number;
  layer?: number;
  ip?: string;
  bandwidthLabel?: string;
  children?: TreeNode[];
}

interface TreeTopologyProps {
  className?: string;
  data?: TopologyData;
  viewMode?: TopologyViewMode;
  onViewModeChange?: (mode: TopologyViewMode) => void;
  onNodeClick?: (node: NetworkNode) => void;
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
};

// 플랫 데이터를 계층적 트리 구조로 변환 (물리적 뷰)
function buildPhysicalTree(data: TopologyData): TreeNode {
  const nodesMap = new Map<string, NetworkNode>();
  data.nodes.forEach(node => nodesMap.set(node.id, node));

  // 인접 리스트 생성
  const adjacency = new Map<string, Set<string>>();
  data.nodes.forEach(node => adjacency.set(node.id, new Set()));

  data.links.forEach(link => {
    adjacency.get(link.source)?.add(link.target);
    adjacency.get(link.target)?.add(link.source);
  });

  // 계층별로 노드 분류
  const nodesByLayer: Record<number, NetworkNode[]> = {};
  data.nodes.forEach(node => {
    const layer = node.layer || 1;
    if (!nodesByLayer[layer]) nodesByLayer[layer] = [];
    nodesByLayer[layer].push(node);
  });

  // 루트 노드 생성 (가상)
  const rootNode: TreeNode = {
    id: 'root',
    label: 'Network',
    type: 'controller',
    status: 'active',
    children: [],
  };

  // Layer 1 (Spine) 노드들을 루트의 자식으로 추가
  const spineNodes = nodesByLayer[1] || [];

  spineNodes.forEach(spine => {
    const spineTreeNode: TreeNode = {
      id: spine.id,
      label: spine.label,
      type: spine.type,
      status: spine.status,
      role: spine.role,
      ip: spine.ip,
      bandwidthLabel: spine.bandwidthLabel,
      children: [],
    };

    // Layer 2 (Leaf) 연결
    const connectedLeafs = Array.from(adjacency.get(spine.id) || [])
      .map(id => nodesMap.get(id))
      .filter(n => n && n.layer === 2) as NetworkNode[];

    connectedLeafs.forEach(leaf => {
      const leafTreeNode: TreeNode = {
        id: leaf.id,
        label: leaf.label,
        type: leaf.type,
        status: leaf.status,
        role: leaf.role,
        vlan: leaf.vlan,
        ip: leaf.ip,
        bandwidthLabel: leaf.bandwidthLabel,
        children: [],
      };

      // Layer 3 (Group) 연결
      const connectedGroups = Array.from(adjacency.get(leaf.id) || [])
        .map(id => nodesMap.get(id))
        .filter(n => n && n.layer === 3) as NetworkNode[];

      connectedGroups.forEach(group => {
        const groupTreeNode: TreeNode = {
          id: group.id,
          label: group.label,
          type: group.type,
          status: group.status,
          vlan: group.vlan,
          ip: group.ip,
          children: [],
        };

        // Layer 4 연결
        const connectedEndGroups = Array.from(adjacency.get(group.id) || [])
          .map(id => nodesMap.get(id))
          .filter(n => n && n.layer === 4) as NetworkNode[];

        connectedEndGroups.forEach(endGroup => {
          groupTreeNode.children?.push({
            id: endGroup.id,
            label: endGroup.label,
            type: endGroup.type,
            status: endGroup.status,
            vlan: endGroup.vlan,
          });
        });

        leafTreeNode.children?.push(groupTreeNode);
      });

      spineTreeNode.children?.push(leafTreeNode);
    });

    rootNode.children?.push(spineTreeNode);
  });

  return rootNode;
}

// 플랫 데이터를 VLAN 기반 트리 구조로 변환 (논리적 뷰)
function buildLogicalTree(data: TopologyData): TreeNode {
  // VLAN별로 노드 그룹화
  const vlanGroups = new Map<number, NetworkNode[]>();
  const noVlanNodes: NetworkNode[] = [];

  data.nodes.forEach(node => {
    if (node.vlan !== undefined) {
      if (!vlanGroups.has(node.vlan)) {
        vlanGroups.set(node.vlan, []);
      }
      vlanGroups.get(node.vlan)?.push(node);
    } else {
      noVlanNodes.push(node);
    }
  });

  // 루트 노드 생성
  const rootNode: TreeNode = {
    id: 'root',
    label: 'Network Segments',
    type: 'controller',
    status: 'active',
    children: [],
  };

  // VLAN별 서브트리 생성
  Array.from(vlanGroups.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([vlanId, nodes]) => {
      const vlanNode: TreeNode = {
        id: `vlan-${vlanId}`,
        label: `VLAN ${vlanId}`,
        type: 'group',
        status: 'active',
        vlan: vlanId,
        children: [],
      };

      // VLAN 내에서 계층별로 정렬
      const sortedNodes = [...nodes].sort((a, b) => (a.layer || 99) - (b.layer || 99));

      sortedNodes.forEach(node => {
        vlanNode.children?.push({
          id: node.id,
          label: node.label,
          type: node.type,
          status: node.status,
          role: node.role,
          vlan: node.vlan,
          layer: node.layer,
          ip: node.ip,
        });
      });

      rootNode.children?.push(vlanNode);
    });

  // VLAN 없는 노드들 (Infrastructure)
  if (noVlanNodes.length > 0) {
    const infraNode: TreeNode = {
      id: 'infrastructure',
      label: 'Infrastructure',
      type: 'switch',
      status: 'active',
      children: noVlanNodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        status: node.status,
        role: node.role,
        layer: node.layer,
        ip: node.ip,
      })),
    };
    rootNode.children?.unshift(infraNode);
  }

  return rootNode;
}

export function TreeTopology({ className, data, viewMode = 'physical', onViewModeChange, onNodeClick, editable = false }: TreeTopologyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<TopologyViewMode>(viewMode);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number; direction: 'up' | 'down' } | null>(null);

  const currentViewMode = onViewModeChange ? viewMode : internalViewMode;

  const handleViewModeChange = useCallback((mode: TopologyViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  }, [onViewModeChange]);

  // 트리 데이터 생성
  const treeData = useMemo(() => {
    if (!data) return null;
    return currentViewMode === 'physical'
      ? buildPhysicalTree(data)
      : buildLogicalTree(data);
  }, [data, currentViewMode]);

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

  // D3 트리 시각화
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !treeData) return;

    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 이전 내용 제거
    svg.selectAll('*').remove();

    // 테마 색상
    const colors = isDarkMode
      ? {
          background: '#111827',
          nodeBorder: '#4B5563',
          link: '#4B5563',
          text: '#E5E7EB',
          textSecondary: '#9CA3AF',
        }
      : {
          background: '#F9FAFB',
          nodeBorder: '#9CA3AF',
          link: '#D1D5DB',
          text: '#374151',
          textSecondary: '#6B7280',
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
        setPopupPosition(null);
      });

    svg.call(zoom);

    // 배경 클릭 시 팝업 닫기
    svg.on('click', () => {
      setSelectedNode(null);
      setPopupPosition(null);
    });

    // 메인 그룹
    const g = svg.append('g');

    // 트리 레이아웃 생성 - 가로 방향
    const treeLayout = d3.tree<TreeNode>()
      .size([height - 100, width - 300])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

    // 계층 구조 생성
    const root = d3.hierarchy(treeData);

    // 트리 레이아웃 적용
    treeLayout(root);

    // 노드 색상 결정
    const getNodeColor = (d: d3.HierarchyPointNode<TreeNode>) => {
      const node = d.data;

      if (currentViewMode === 'logical' && node.vlan) {
        return VLAN_COLORS[node.vlan] || (isDarkMode ? '#6366F1' : '#818CF8');
      }

      switch (node.type) {
        case 'controller': return isDarkMode ? '#F59E0B' : '#FCD34D';
        case 'switch': return isDarkMode ? '#3B82F6' : '#60A5FA';
        case 'router': return isDarkMode ? '#8B5CF6' : '#A78BFA';
        case 'host': return isDarkMode ? '#10B981' : '#34D399';
        case 'group': return isDarkMode ? '#6366F1' : '#818CF8';
        default: return isDarkMode ? '#374151' : '#F3F4F6';
      }
    };

    // 노드 테두리 색상 (상태 기반)
    const getNodeBorderColor = (node: TreeNode) => {
      switch (node.status) {
        case 'active': return STATUS_COLORS.active;
        case 'warning': return STATUS_COLORS.warning;
        case 'error': return STATUS_COLORS.error;
        case 'inactive': return STATUS_COLORS.inactive;
        default: return colors.nodeBorder;
      }
    };

    // 노드 크기 결정
    const getNodeSize = (node: TreeNode) => {
      if (node.id === 'root') return 25;
      if (node.role === 'spine') return 22;
      if (node.role === 'leaf') return 20;
      if (node.type === 'group') return 15;
      if (node.id.startsWith('vlan-')) return 22;
      return 18;
    };

    // 링크 그리기 (곡선)
    g.selectAll('.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        const sourceX = (d.source as any).y + 150;
        const sourceY = (d.source as any).x + 50;
        const targetX = (d.target as any).y + 150;
        const targetY = (d.target as any).x + 50;

        return `M ${sourceX},${sourceY}
                C ${(sourceX + targetX) / 2},${sourceY}
                  ${(sourceX + targetX) / 2},${targetY}
                  ${targetX},${targetY}`;
      })
      .attr('fill', 'none')
      .attr('stroke', colors.link)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // 노드 그룹
    const nodes = g
      .selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y + 150},${d.x + 50})`)
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        event.stopPropagation();
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const popupWidth = 320;
          const popupHeight = 300;
          const padding = 20;

          // 노드의 위치 (트리 레이아웃에서)
          const nodeX = d.y + 150;
          const nodeY = d.x + 50;

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

          setSelectedNode(d.data);
          setPopupPosition({ x: popupX, y: popupY, direction });
        }
      });

    // 노드 모양 - SVG 아이콘 이미지 사용
    nodes.each(function(d: any) {
      const el = d3.select(this);
      const size = getNodeSize(d.data);
      const nodeData = d.data as TreeNode;
      const iconSize = size * 2.5;

      // SVG 아이콘 이미지 추가
      const iconUrl = getNetworkIconSvg(
        nodeData.type,
        nodeData.role,
        getNodeColor(d),
        getNodeBorderColor(nodeData),
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
    nodes
      .append('text')
      .attr('dy', (d: any) => getNodeSize(d.data) + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => d.data.id === 'root' ? 12 : 10)
      .attr('font-weight', (d: any) => d.data.id === 'root' || d.data.id.startsWith('vlan-') ? 'bold' : 'normal')
      .attr('fill', colors.text)
      .text((d: any) => d.data.label);

    // 물리적 뷰에서 IP 표시
    if (currentViewMode === 'physical') {
      nodes
        .filter((d: any) => d.data.ip)
        .append('text')
        .attr('dy', (d: any) => getNodeSize(d.data) + 24)
        .attr('text-anchor', 'middle')
        .attr('font-size', 8)
        .attr('fill', colors.textSecondary)
        .text((d: any) => d.data.ip);
    }

    // 논리적 뷰에서 레이어 표시
    if (currentViewMode === 'logical') {
      nodes
        .filter((d: any) => d.data.layer && !d.data.id.startsWith('vlan-'))
        .append('text')
        .attr('dy', (d: any) => getNodeSize(d.data) + 24)
        .attr('text-anchor', 'middle')
        .attr('font-size', 8)
        .attr('fill', colors.textSecondary)
        .text((d: any) => `L${d.data.layer}`);
    }

    // 줌 컨트롤 함수 저장
    (svgRef.current as any).__zoom__ = zoom;
    (svgRef.current as any).__svg__ = svg;

    // 초기 뷰 설정 - 트리 중앙 정렬
    const bounds = g.node()?.getBBox();
    if (bounds) {
      const scale = 0.8;
      const translateX = (width - bounds.width * scale) / 2 - bounds.x * scale;
      const translateY = (height - bounds.height * scale) / 2 - bounds.y * scale;
      svg.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
    }
  }, [isDarkMode, treeData, currentViewMode]);

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
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity.scale(0.8));
    }
  };

  const handleReset = () => {
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
          {currentViewMode === 'physical' ? '물리적 트리 뷰' : '논리적 트리 뷰'}
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
          // 물리적 뷰: 노드 타입 범례
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">노드 타입</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Root</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 clip-hexagon" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Spine/Leaf</span>
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
      </div>

      {/* 데이터 없음 표시 */}
      {!treeData && (
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

              {(selectedNode.ip || selectedNode.vlan || selectedNode.layer) && (
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
                    {selectedNode.layer && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">레이어</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">Layer {selectedNode.layer}</span>
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
      <svg ref={svgRef} className="w-full h-full" style={{ cursor: 'grab' }} />
    </div>
  );
}
