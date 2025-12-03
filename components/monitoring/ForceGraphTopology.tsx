'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Layers, Network, X } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';
import { TopologyData, NetworkNode, NetworkLink, TopologyViewMode } from '@/types/topology';
import { drawNetworkIcon } from '@/lib/networkIcons';

// react-force-graph-2d는 SSR을 지원하지 않으므로 dynamic import 사용
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
    </div>
  ),
});

interface ForceGraphNode {
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
  fx?: number;
  fy?: number;
  [key: string]: unknown;
}

interface ForceGraphLink {
  id: string;
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  bandwidth: number;
  utilization: number;
  status: NetworkLink['status'];
  type: NetworkLink['type'];
  [key: string]: unknown;
}

interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}

interface ForceGraphTopologyProps {
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

// 타입별 색상
const TYPE_COLORS: Record<string, { light: string; dark: string }> = {
  controller: { light: '#FCD34D', dark: '#F59E0B' },
  switch: { light: '#60A5FA', dark: '#3B82F6' },
  router: { light: '#A78BFA', dark: '#8B5CF6' },
  host: { light: '#34D399', dark: '#10B981' },
  group: { light: '#818CF8', dark: '#6366F1' },
  firewall: { light: '#FB923C', dark: '#EA580C' },
};

export function ForceGraphTopology({ className, data, viewMode = 'physical', onViewModeChange, onNodeClick, onLinkClick, editable = false }: ForceGraphTopologyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<TopologyViewMode>(viewMode);
  const [selectedNode, setSelectedNode] = useState<ForceGraphNode | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number; direction: 'up' | 'down' } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isMounted, setIsMounted] = useState(false);

  const currentViewMode = onViewModeChange ? viewMode : internalViewMode;

  // 클라이언트에서만 마운트
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleViewModeChange = useCallback((mode: TopologyViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  }, [onViewModeChange]);

  // 데이터 변환
  const graphData: ForceGraphData = useMemo(() => {
    if (!data) {
      return { nodes: [], links: [] };
    }

    const nodes: ForceGraphNode[] = data.nodes.map(node => ({
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

    const links: ForceGraphLink[] = data.links.map(link => ({
      id: link.id,
      source: link.source,
      target: link.target,
      bandwidth: link.bandwidth,
      utilization: link.utilization,
      status: link.status,
      type: link.type,
    }));

    return { nodes, links };
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

  // 컨테이너 크기 감지
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 노드 색상 결정
  const getNodeColor = useCallback((node: ForceGraphNode) => {
    if (currentViewMode === 'logical' && node.vlan) {
      return VLAN_COLORS[node.vlan] || (isDarkMode ? '#374151' : '#F3F4F6');
    }

    const typeColor = TYPE_COLORS[node.type];
    if (typeColor) {
      return isDarkMode ? typeColor.dark : typeColor.light;
    }

    return isDarkMode ? '#374151' : '#F3F4F6';
  }, [currentViewMode, isDarkMode]);

  // 노드 크기 결정
  const getNodeSize = useCallback((node: ForceGraphNode) => {
    if (node.role === 'spine') return 14;
    if (node.role === 'leaf') return 12;
    if (node.type === 'controller') return 15;
    if (node.type === 'group') return 8;
    return 10;
  }, []);

  // 노드 테두리 색상 (상태 기반)
  const getNodeBorderColor = useCallback((node: ForceGraphNode) => {
    return STATUS_COLORS[node.status] || (isDarkMode ? '#4B5563' : '#9CA3AF');
  }, [isDarkMode]);

  // 링크 색상 결정
  const getLinkColor = useCallback((link: ForceGraphLink) => {
    const linkData = link as ForceGraphLink;
    switch (linkData.status) {
      case 'active':
        return isDarkMode ? 'rgba(74, 222, 128, 0.6)' : 'rgba(34, 197, 94, 0.6)';
      case 'congested':
        return 'rgba(249, 115, 22, 0.6)';
      case 'down':
        return 'rgba(239, 68, 68, 0.4)';
      default:
        return isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.6)';
    }
  }, [isDarkMode]);

  // 링크 너비 결정
  const getLinkWidth = useCallback((link: ForceGraphLink) => {
    const linkData = link as ForceGraphLink;
    if (linkData.status === 'down') return 1;
    return Math.max(1, Math.min(4, linkData.bandwidth / 15000));
  }, []);

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((node: ForceGraphNode, event: MouseEvent) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const popupWidth = 320;
      const popupHeight = 300;
      const padding = 20;

      // 클릭 위치 기준으로 팝업 위치 계산
      let popupX = event.clientX - containerRect.left;
      let popupY = event.clientY - containerRect.top;

      // X 좌표 조정
      if (popupX - popupWidth / 2 < padding) {
        popupX = popupWidth / 2 + padding;
      } else if (popupX + popupWidth / 2 > containerRect.width - padding) {
        popupX = containerRect.width - popupWidth / 2 - padding;
      }

      // Y 좌표 및 방향 결정
      let direction: 'up' | 'down' = 'up';
      if (popupY - popupHeight - 40 < 0) {
        popupY = popupY + 30;
        direction = 'down';
      } else {
        popupY = popupY - 20;
      }

      setSelectedNode(node);
      setPopupPosition({ x: popupX, y: popupY, direction });
    }
  }, []);

  // 배경 클릭 핸들러
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setPopupPosition(null);
  }, []);

  // 노드 캔버스 커스텀 렌더링
  const nodeCanvasObject = useCallback((node: ForceGraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = getNodeSize(node);
    const nodeX = node.x || 0;
    const nodeY = node.y || 0;
    const fillColor = getNodeColor(node);
    const borderColor = getNodeBorderColor(node);

    // 스케일에 맞게 크기 조정
    const scaledSize = size * Math.max(1, 1.5 / globalScale);

    // 네트워크 장비 아이콘 그리기
    drawNetworkIcon(
      ctx,
      nodeX,
      nodeY,
      scaledSize,
      node.type,
      node.role,
      fillColor,
      borderColor,
      isDarkMode
    );

    // 라벨 그리기
    const fontSize = Math.max(10 / globalScale, 3);
    ctx.font = `bold ${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isDarkMode ? '#E5E7EB' : '#374151';
    ctx.fillText(node.label, nodeX, nodeY + scaledSize + 6 / globalScale);

    // 논리적 뷰에서 VLAN 표시
    if (currentViewMode === 'logical' && node.vlan) {
      const vlanFontSize = Math.max(8 / globalScale, 2);
      ctx.font = `${vlanFontSize}px Sans-Serif`;
      ctx.fillStyle = isDarkMode ? '#9CA3AF' : '#6B7280';
      ctx.fillText(`VLAN ${node.vlan}`, nodeX, nodeY + scaledSize + 6 / globalScale + fontSize + 2);
    }

    // 물리적 뷰에서 IP 표시
    if (currentViewMode === 'physical' && node.ip) {
      const ipFontSize = Math.max(8 / globalScale, 2);
      ctx.font = `${ipFontSize}px Sans-Serif`;
      ctx.fillStyle = isDarkMode ? '#9CA3AF' : '#6B7280';
      ctx.fillText(node.ip, nodeX, nodeY + scaledSize + 6 / globalScale + fontSize + 2);
    }
  }, [getNodeSize, getNodeColor, getNodeBorderColor, isDarkMode, currentViewMode]);

  // 링크 캔버스 커스텀 렌더링
  const linkCanvasObject = useCallback((link: ForceGraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const source = link.source as ForceGraphNode;
    const target = link.target as ForceGraphNode;

    if (!source.x || !source.y || !target.x || !target.y) return;

    const startX = source.x;
    const startY = source.y;
    const endX = target.x;
    const endY = target.y;

    // 링크 그리기
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = getLinkColor(link);
    ctx.lineWidth = getLinkWidth(link);

    if (link.status === 'down') {
      ctx.setLineDash([5 / globalScale, 5 / globalScale]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // utilization 라벨 그리기
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const fontSize = Math.max(9 / globalScale, 2.5);

    const labelText = link.status === 'down' ? 'DOWN' : `${Math.round(link.utilization)}%`;

    // 배경 박스
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(labelText).width;
    const padding = 4 / globalScale;

    ctx.fillStyle = isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(midX - textWidth / 2 - padding, midY - fontSize / 2 - padding, textWidth + padding * 2, fontSize + padding * 2);

    // 라벨 텍스트
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (link.utilization > 75) {
      ctx.fillStyle = STATUS_COLORS.congested;
    } else if (link.utilization > 50) {
      ctx.fillStyle = STATUS_COLORS.warning;
    } else {
      ctx.fillStyle = isDarkMode ? '#E5E7EB' : '#374151';
    }
    ctx.fillText(labelText, midX, midY);
  }, [getLinkColor, getLinkWidth, isDarkMode]);

  // 줌 컨트롤
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.3, 300);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 0.7, 300);
    }
  };

  const handleFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.d3ReheatSimulation();
      graphRef.current.zoomToFit(400, 50);
    }
  };

  // 물리적 뷰에서 초기 위치 설정
  useEffect(() => {
    if (currentViewMode === 'physical' && graphRef.current && graphData.nodes.length > 0) {
      // 계층 기반 초기 위치 설정
      const layerHeight = dimensions.height / 5;
      const nodesByLayer: Record<number, ForceGraphNode[]> = {};

      graphData.nodes.forEach(node => {
        const layer = node.layer || 1;
        if (!nodesByLayer[layer]) nodesByLayer[layer] = [];
        nodesByLayer[layer].push(node);
      });

      Object.entries(nodesByLayer).forEach(([layer, layerNodes]) => {
        const y = parseInt(layer) * layerHeight - dimensions.height / 2;
        const spacing = dimensions.width / (layerNodes.length + 1);
        layerNodes.forEach((node, i) => {
          node.fx = spacing * (i + 1) - dimensions.width / 2;
          node.fy = y;
        });
      });
    } else if (currentViewMode === 'logical' && graphData.nodes.length > 0) {
      // 논리적 뷰에서는 고정 위치 해제
      graphData.nodes.forEach(node => {
        node.fx = undefined;
        node.fy = undefined;
      });
    }
  }, [currentViewMode, graphData.nodes, dimensions]);

  return (
    <div ref={containerRef} className={cn('relative h-full w-full', className)} style={{ backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }}>
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
      {graphData.nodes.length === 0 && (
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

      {/* Force Graph */}
      {isMounted && dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData as any}
          width={dimensions.width}
          height={dimensions.height}
          nodeCanvasObject={nodeCanvasObject as any}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            const size = getNodeSize(node as ForceGraphNode);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, size + 5, 0, 2 * Math.PI);
            ctx.fill();
          }}
          linkCanvasObject={linkCanvasObject as any}
          linkPointerAreaPaint={(link: any, color: string, ctx: CanvasRenderingContext2D) => {
            const source = link.source as ForceGraphNode;
            const target = link.target as ForceGraphNode;
            if (!source.x || !source.y || !target.x || !target.y) return;
            ctx.strokeStyle = color;
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }}
          onNodeClick={(node: any, event: MouseEvent) => handleNodeClick(node as ForceGraphNode, event)}
          onBackgroundClick={handleBackgroundClick}
          cooldownTicks={currentViewMode === 'physical' ? 50 : 100}
          d3AlphaDecay={currentViewMode === 'physical' ? 0.05 : 0.02}
          d3VelocityDecay={0.3}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          backgroundColor={isDarkMode ? '#111827' : '#F9FAFB'}
        />
      )}
    </div>
  );
}
