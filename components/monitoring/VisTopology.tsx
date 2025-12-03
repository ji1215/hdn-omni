'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Network, Options, Node, Edge, Data } from 'vis-network';
import { DataSet } from 'vis-data';
import {
  NetworkNode,
  NetworkLink,
  TopologyData,
  TopologyViewMode,
  TopologyViewOptions,
  VlanColorConfig,
  ProvisioningConfig,
} from '@/types/topology';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layout,
  Layers,
  Network as NetworkIcon,
  Plus,
  X,
} from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';
import { getNetworkIconSvg } from '@/lib/networkIcons';

// VLAN 색상 설정
const VLAN_COLORS: VlanColorConfig[] = [
  { vlanId: 100, color: '#EF4444', label: 'VLAN 100' },
  { vlanId: 101, color: '#EF4444', label: 'VLAN 101' },
  { vlanId: 200, color: '#F97316', label: 'VLAN 200' },
  { vlanId: 201, color: '#F97316', label: 'VLAN 201' },
  { vlanId: 300, color: '#22C55E', label: 'VLAN 300' },
  { vlanId: 301, color: '#22C55E', label: 'VLAN 301' },
  { vlanId: 400, color: '#8B5CF6', label: 'VLAN 400' },
  { vlanId: 401, color: '#8B5CF6', label: 'VLAN 401' },
];

// VLAN ID로 색상 가져오기
const getVlanColor = (vlanId: number | undefined): string => {
  if (!vlanId) return '#6B7280';
  const config = VLAN_COLORS.find(v => v.vlanId === vlanId);
  return config?.color || '#6B7280';
};

// 레이아웃 옵션
type LayoutType = 'hierarchical' | 'force' | 'radial' | 'grid';
const layoutOptions: { name: LayoutType; label: string }[] = [
  { name: 'hierarchical', label: '계층형' },
  { name: 'force', label: '포스' },
  { name: 'radial', label: '방사형' },
  { name: 'grid', label: '그리드' },
];

// 새로고침 간격 옵션
const refreshIntervalOptions: { value: number; label: string }[] = [
  { value: 5, label: '5초' },
  { value: 10, label: '10초' },
  { value: 30, label: '30초' },
  { value: 60, label: '1분' },
];

interface VisTopologyProps {
  data?: TopologyData;
  className?: string;
  viewMode?: TopologyViewMode;
  onViewModeChange?: (mode: TopologyViewMode) => void;
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
}

export function VisTopology({
  data,
  className,
  viewMode: externalViewMode,
  onViewModeChange,
  onNodeClick,
  onLinkClick,
}: VisTopologyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesDataSetRef = useRef<DataSet<Node> | null>(null);
  const edgesDataSetRef = useRef<DataSet<Edge> | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('hierarchical');
  const [viewOptions, setViewOptions] = useState<TopologyViewOptions>({
    showLabels: true,
    showUtilization: true,
    showVlans: true,
    showBandwidth: true,
    autoRefresh: true,
    refreshInterval: 5,
    viewMode: 'physical',
    selectedVlans: [],
  });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<NetworkLink | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number; direction: 'up' | 'down' } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [showProvisioningPanel, setShowProvisioningPanel] = useState(false);
  const [provisioningConfigs] = useState<ProvisioningConfig[]>([
    {
      type: 'vlan',
      name: 'VLAN 100 생성',
      items: [
        { id: '1', label: '스위치 1', value: 'P1 (eth-0-1)' },
        { id: '2', label: '스위치 2', value: 'P1 (eth-0-1)' },
        { id: '3', label: '스위치 3', value: 'P1 (eth-0-1)' },
        { id: '4', label: '스위치 4', value: 'P1 (eth-0-1)' },
      ],
    },
    {
      type: 'vxlan',
      name: 'VxLAN 기본 네트워크.1',
      items: [
        { id: '1', label: '스위치 11', value: '192.168.2.34' },
        { id: '2', label: '스위치 12', value: '192.168.2.36' },
      ],
    },
    {
      type: 'routing',
      name: '라우팅 경로.1',
      items: [
        { id: '1', label: '경로 1', value: '192.168.2.0/24 -> 10.1.1.1' },
        { id: '2', label: '경로 2', value: '192.168.3.0/24 -> 10.1.1.1' },
        { id: '3', label: '경로 3', value: '192.168.4.0/24 -> 10.1.1.1' },
      ],
    },
  ]);

  // 외부 viewMode prop과 동기화
  useEffect(() => {
    if (externalViewMode && externalViewMode !== viewOptions.viewMode) {
      setViewOptions(prev => ({ ...prev, viewMode: externalViewMode }));
    }
  }, [externalViewMode, viewOptions.viewMode]);

  // 대역폭 라벨 생성
  const getBandwidthLabel = (bandwidth: number): string => {
    if (bandwidth >= 40000) return '40G';
    if (bandwidth >= 10000) return '10G';
    if (bandwidth >= 1000) return '1G';
    if (bandwidth >= 100) return '100M';
    return `${bandwidth}M`;
  };

  // 노드 모양 결정
  const getNodeShape = (node: NetworkNode): string => {
    switch (node.type) {
      case 'router':
        return 'box';
      case 'switch':
        return 'hexagon';
      case 'host':
        return 'dot';
      case 'controller':
        return 'diamond';
      case 'firewall':
        return 'triangle';
      case 'group':
        return 'ellipse';
      default:
        return 'dot';
    }
  };

  // 노드 색상 결정
  const getNodeColor = (node: NetworkNode, viewMode: TopologyViewMode): { background: string; border: string } => {
    const baseColors = isDarkMode
      ? { background: '#374151', border: '#4B5563' }
      : { background: '#F3F4F6', border: '#9CA3AF' };

    // 논리적 뷰에서는 VLAN 색상 적용
    if (viewMode === 'logical' && node.vlan) {
      const vlanColor = getVlanColor(node.vlan);
      return { background: baseColors.background, border: vlanColor };
    }

    // 상태별 색상
    switch (node.status) {
      case 'active':
        return { background: baseColors.background, border: '#22C55E' };
      case 'warning':
        return { background: baseColors.background, border: '#F59E0B' };
      case 'error':
        return { background: baseColors.background, border: '#EF4444' };
      case 'inactive':
        return { background: baseColors.background, border: '#6B7280' };
      default:
        return baseColors;
    }
  };

  // 노드 크기 결정
  const getNodeSize = (node: NetworkNode): number => {
    switch (node.role) {
      case 'spine':
        return 35;
      case 'leaf':
        return 30;
      case 'access':
        return 25;
      default:
        return 20;
    }
  };

  // 엣지 색상 결정
  const getEdgeColor = (link: NetworkLink, viewMode: TopologyViewMode, sourceVlan?: number): string => {
    // 논리적 뷰에서는 VLAN 색상 적용
    if (viewMode === 'logical' && sourceVlan) {
      return getVlanColor(sourceVlan);
    }

    switch (link.status) {
      case 'active':
        return isDarkMode ? '#4B5563' : '#9CA3AF';
      case 'congested':
        return '#F59E0B';
      case 'down':
        return '#EF4444';
      default:
        return isDarkMode ? '#4B5563' : '#9CA3AF';
    }
  };

  // vis.js 네트워크 옵션 생성
  const createNetworkOptions = useCallback((layout: LayoutType): Options => {
    const baseOptions: Options = {
      nodes: {
        font: {
          color: isDarkMode ? '#E5E7EB' : '#374151',
          size: 12,
        },
        borderWidth: 2,
        borderWidthSelected: 3,
      },
      edges: {
        width: 2,
        font: {
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
          size: 10,
          strokeWidth: 0,
          background: isDarkMode ? '#111827' : '#FFFFFF',
        },
        smooth: {
          enabled: true,
          type: 'dynamic',
          roundness: 0.5,
        },
        color: {
          inherit: false,
        },
      },
      physics: {
        enabled: layout === 'force',
        stabilization: {
          enabled: true,
          iterations: 200,
        },
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 120,
          springConstant: 0.04,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        hideEdgesOnDrag: true,
        hideEdgesOnZoom: true,
      },
      layout: {
        improvedLayout: true,
      },
    };

    // 레이아웃별 설정
    switch (layout) {
      case 'hierarchical':
        return {
          ...baseOptions,
          layout: {
            hierarchical: {
              enabled: true,
              direction: 'UD',
              sortMethod: 'directed',
              nodeSpacing: 150,
              levelSeparation: 150,
              treeSpacing: 200,
              blockShifting: true,
              edgeMinimization: true,
              parentCentralization: true,
            },
          },
          physics: { enabled: false },
        };
      case 'force':
        return {
          ...baseOptions,
          layout: { hierarchical: { enabled: false } },
          physics: {
            enabled: true,
            stabilization: {
              enabled: true,
              iterations: 300,
            },
            barnesHut: {
              gravitationalConstant: -4000,
              centralGravity: 0.3,
              springLength: 150,
              springConstant: 0.04,
              damping: 0.09,
            },
          },
        };
      case 'radial':
        return {
          ...baseOptions,
          layout: {
            hierarchical: {
              enabled: true,
              direction: 'UD',
              sortMethod: 'hubsize',
              nodeSpacing: 200,
              levelSeparation: 200,
            },
          },
          physics: { enabled: false },
        };
      case 'grid':
        return {
          ...baseOptions,
          layout: { hierarchical: { enabled: false } },
          physics: { enabled: false },
        };
      default:
        return baseOptions;
    }
  }, [isDarkMode]);

  // 데이터를 vis.js 형식으로 변환
  const transformData = useCallback((): Data => {
    if (!data) return { nodes: [], edges: [] };

    const nodes: Node[] = data.nodes.map(node => {
      const colors = getNodeColor(node, viewOptions.viewMode);
      const iconUrl = getNetworkIconSvg(node.type, node.role, colors.background, colors.border, isDarkMode);

      return {
        id: node.id,
        label: viewOptions.showLabels ? node.label : '',
        shape: 'image',
        image: iconUrl,
        size: getNodeSize(node) + 10,
        font: {
          color: isDarkMode ? '#E5E7EB' : '#374151',
          size: 12,
          bold: { color: isDarkMode ? '#E5E7EB' : '#374151' },
        },
        title: `${node.label}\nType: ${node.type}\nStatus: ${node.status}${node.ip ? `\nIP: ${node.ip}` : ''}${node.vlan ? `\nVLAN: ${node.vlan}` : ''}`,
        level: node.layer,
        // 커스텀 데이터 저장
        nodeData: node,
      } as Node;
    });

    const edges: Edge[] = data.links.map(link => {
      const sourceNode = data.nodes.find(n => n.id === link.source);
      const edgeColor = getEdgeColor(link, viewOptions.viewMode, sourceNode?.vlan);
      const bandwidthLabel = viewOptions.showBandwidth ? getBandwidthLabel(link.bandwidth) : '';

      return {
        id: link.id,
        from: link.source,
        to: link.target,
        label: bandwidthLabel,
        color: {
          color: edgeColor,
          highlight: '#3B82F6',
          hover: '#3B82F6',
        },
        dashes: link.status === 'down',
        width: link.status === 'congested' ? 3 : 2,
        title: `Bandwidth: ${getBandwidthLabel(link.bandwidth)}\nUtilization: ${link.utilization.toFixed(1)}%\nStatus: ${link.status}${link.latency ? `\nLatency: ${link.latency.toFixed(1)}ms` : ''}`,
        // 커스텀 데이터 저장
        linkData: link,
      } as Edge;
    });

    return { nodes, edges };
  }, [data, viewOptions, isDarkMode]);

  // 네트워크 초기화
  useEffect(() => {
    if (!containerRef.current || !data) return;

    const transformedData = transformData();

    // DataSet 생성
    nodesDataSetRef.current = new DataSet(transformedData.nodes as Node[]);
    edgesDataSetRef.current = new DataSet(transformedData.edges as Edge[]);

    const networkData: Data = {
      nodes: nodesDataSetRef.current,
      edges: edgesDataSetRef.current,
    };

    const options = createNetworkOptions(selectedLayout);

    // 네트워크 생성
    networkRef.current = new Network(containerRef.current, networkData, options);

    // 이벤트 리스너
    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = data.nodes.find(n => n.id === nodeId);
        if (node && networkRef.current && containerRef.current) {
          // 노드의 캔버스 좌표를 DOM 좌표로 변환
          const positions = networkRef.current.getPositions([nodeId]);
          const canvasPos = positions[nodeId];
          const domPos = networkRef.current.canvasToDOM({ x: canvasPos.x, y: canvasPos.y });

          // 컨테이너 경계 계산
          const containerRect = containerRef.current.getBoundingClientRect();
          const popupWidth = 320; // 팝업 예상 너비
          const popupHeight = 300; // 팝업 예상 높이
          const padding = 20; // 여백
          const toolbarHeight = 48; // 상단 툴바 높이

          // X 좌표 조정 (좌우 경계 체크)
          let popupX = domPos.x;
          if (popupX - popupWidth / 2 < padding) {
            popupX = popupWidth / 2 + padding;
          } else if (popupX + popupWidth / 2 > containerRect.width - padding) {
            popupX = containerRect.width - popupWidth / 2 - padding;
          }

          // Y 좌표 및 방향 결정 (상단 경계 체크)
          let popupY = domPos.y - 30; // 노드 위쪽에 표시
          let direction: 'up' | 'down' = 'up';

          // 상단에 공간이 부족하면 아래쪽에 표시
          if (domPos.y - popupHeight - 30 < toolbarHeight) {
            popupY = domPos.y + 50; // 노드 아래쪽에 표시
            direction = 'down';
          }

          setSelectedNode(node);
          setSelectedLink(null);
          setPopupPosition({ x: popupX, y: popupY, direction });
          onNodeClick?.(node);
        }
      } else if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        const link = data.links.find(l => l.id === edgeId);
        if (link && networkRef.current && containerRef.current) {
          // 엣지의 중간점 계산
          const sourceNode = data.nodes.find(n => n.id === link.source);
          const targetNode = data.nodes.find(n => n.id === link.target);
          if (sourceNode && targetNode) {
            const positions = networkRef.current.getPositions([link.source, link.target]);
            const midX = (positions[link.source].x + positions[link.target].x) / 2;
            const midY = (positions[link.source].y + positions[link.target].y) / 2;
            const domPos = networkRef.current.canvasToDOM({ x: midX, y: midY });

            // 컨테이너 경계 계산
            const containerRect = containerRef.current.getBoundingClientRect();
            const popupWidth = 320;
            const popupHeight = 200;
            const padding = 20;
            const toolbarHeight = 48;

            // X 좌표 조정
            let popupX = domPos.x;
            if (popupX - popupWidth / 2 < padding) {
              popupX = popupWidth / 2 + padding;
            } else if (popupX + popupWidth / 2 > containerRect.width - padding) {
              popupX = containerRect.width - popupWidth / 2 - padding;
            }

            // Y 좌표 및 방향 결정
            let popupY = domPos.y - 30;
            let direction: 'up' | 'down' = 'up';

            if (domPos.y - popupHeight - 30 < toolbarHeight) {
              popupY = domPos.y + 30;
              direction = 'down';
            }

            setSelectedLink(link);
            setSelectedNode(null);
            setPopupPosition({ x: popupX, y: popupY, direction });
            onLinkClick?.(link);
          }
        }
      } else {
        setSelectedNode(null);
        setSelectedLink(null);
        setPopupPosition(null);
      }
    });

    // 드래그/줌 시 팝업 닫기
    networkRef.current.on('dragStart', () => {
      setSelectedNode(null);
      setSelectedLink(null);
      setPopupPosition(null);
    });

    networkRef.current.on('zoom', () => {
      setSelectedNode(null);
      setSelectedLink(null);
      setPopupPosition(null);
    });

    // 그리드 레이아웃일 때 수동 배치
    if (selectedLayout === 'grid') {
      const cols = Math.ceil(Math.sqrt(data.nodes.length));
      const spacing = 150;
      data.nodes.forEach((node, index) => {
        const x = (index % cols) * spacing - (cols * spacing) / 2;
        const y = Math.floor(index / cols) * spacing - ((Math.ceil(data.nodes.length / cols)) * spacing) / 2;
        networkRef.current?.moveNode(node.id, x, y);
      });
      networkRef.current?.fit();
    }

    return () => {
      networkRef.current?.destroy();
      networkRef.current = null;
    };
  }, [data, selectedLayout, createNetworkOptions, transformData, onNodeClick, onLinkClick]);

  // viewMode나 isDarkMode 변경 시 노드/엣지 업데이트
  useEffect(() => {
    if (!networkRef.current || !data || !nodesDataSetRef.current || !edgesDataSetRef.current) return;

    // 노드 업데이트
    const updatedNodes = data.nodes.map(node => {
      const colors = getNodeColor(node, viewOptions.viewMode);
      const iconUrl = getNetworkIconSvg(node.type, node.role, colors.background, colors.border, isDarkMode);
      return {
        id: node.id,
        image: iconUrl,
        font: {
          color: isDarkMode ? '#E5E7EB' : '#374151',
        },
      };
    });
    nodesDataSetRef.current.update(updatedNodes);

    // 엣지 업데이트
    const updatedEdges = data.links.map(link => {
      const sourceNode = data.nodes.find(n => n.id === link.source);
      const edgeColor = getEdgeColor(link, viewOptions.viewMode, sourceNode?.vlan);
      return {
        id: link.id,
        color: {
          color: edgeColor,
          highlight: '#3B82F6',
          hover: '#3B82F6',
        },
      };
    });
    edgesDataSetRef.current.update(updatedEdges);
  }, [viewOptions.viewMode, isDarkMode, data]);

  // 줌 컨트롤
  const handleZoomIn = useCallback(() => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2 });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.8 });
    }
  }, []);

  const handleFit = useCallback(() => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: true });
    }
  }, []);

  // 레이아웃 변경
  const changeLayout = useCallback((layout: LayoutType) => {
    setSelectedLayout(layout);
  }, []);

  // 뷰 모드 변경
  const handleViewModeChange = useCallback((mode: TopologyViewMode) => {
    setViewOptions(prev => ({ ...prev, viewMode: mode }));
    onViewModeChange?.(mode);
  }, [onViewModeChange]);

  // 자동 새로고침 토글
  const handleAutoRefreshToggle = useCallback(() => {
    setViewOptions(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  }, []);

  // 새로고침 간격 변경
  const handleRefreshIntervalChange = useCallback((interval: number) => {
    setViewOptions(prev => ({ ...prev, refreshInterval: interval }));
  }, []);

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

  // 자동 새로고침
  useEffect(() => {
    if (!viewOptions.autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Refreshing topology data...');
    }, viewOptions.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [viewOptions.autoRefresh, viewOptions.refreshInterval]);

  // 상태별 라벨 가져오기
  const getStatusLabel = (status: string): { label: string; color: string } => {
    switch (status) {
      case 'error':
        return { label: 'Error', color: 'text-red-500' };
      case 'warning':
        return { label: 'Minor', color: 'text-yellow-500' };
      case 'inactive':
        return { label: 'Down', color: 'text-gray-500' };
      default:
        return { label: 'Active', color: 'text-green-500' };
    }
  };

  return (
    <div className={cn('relative h-full w-full bg-gray-50 dark:bg-gray-900', className)}>
      {/* 상단 툴바 */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-2">
          {/* 왼쪽: 뷰 모드 탭 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => handleViewModeChange('physical')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg rounded-b-none border-b-0',
                viewOptions.viewMode === 'physical'
                  ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  : 'text-gray-500 dark:text-gray-400'
              )}
              leftIcon={<Layers className="w-4 h-4" />}
            >
              물리적 분리
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleViewModeChange('logical')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg rounded-b-none border-b-0',
                viewOptions.viewMode === 'logical'
                  ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  : 'text-gray-500 dark:text-gray-400'
              )}
              leftIcon={<NetworkIcon className="w-4 h-4" />}
            >
              논리적 분리
            </Button>
          </div>

          {/* 오른쪽: 자동 새로고침 및 상태 정보 */}
          <div className="flex items-center gap-6 text-sm">
            {/* 자동 새로고침 */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={viewOptions.autoRefresh}
                  onChange={handleAutoRefreshToggle}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  aria-label="자동 새로고침 활성화"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  자동 새로고침
                </span>
              </label>
              <select
                value={viewOptions.refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                disabled={!viewOptions.autoRefresh}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="새로고침 간격"
              >
                {refreshIntervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 상태 정보 */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">노드:</span>
              <span className="text-gray-900 dark:text-white font-medium">{data?.nodes.length || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">링크:</span>
              <span className="text-gray-900 dark:text-white font-medium">{data?.links.length || 0}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-500 dark:text-gray-400">{data?.nodes.filter(n => n.status === 'active').length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-500 dark:text-gray-400">{data?.nodes.filter(n => n.status === 'warning').length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-500 dark:text-gray-400">{data?.nodes.filter(n => n.status === 'error').length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 좌측 컨트롤 패널 */}
      <div className="absolute top-16 left-4 z-10 flex flex-col gap-2">
        {/* 줌 컨트롤 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-1 border border-gray-200 dark:border-gray-700">
          <Button
            variant="icon"
            onClick={handleZoomIn}
            title="줌 인"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="icon"
            onClick={handleZoomOut}
            title="줌 아웃"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="icon"
            onClick={handleFit}
            title="화면에 맞추기"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* 레이아웃 선택 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">레이아웃</span>
          </div>
          <div className="flex flex-col gap-1">
            {layoutOptions.map(layout => (
              <Button
                key={layout.name}
                variant={selectedLayout === layout.name ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => changeLayout(layout.name)}
                className="justify-start"
              >
                {layout.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 우측 프로비저닝 패널 */}
      {showProvisioningPanel && (
        <div className="absolute top-16 right-4 z-10 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-900 dark:text-white">원클릭 프로비저닝</span>
            <Button
              variant="icon"
              onClick={() => setShowProvisioningPanel(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {provisioningConfigs.map((config, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded',
                    config.type === 'vlan' && 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
                    config.type === 'vxlan' && 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
                    config.type === 'routing' && 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
                  )}>
                    {config.type === 'vlan' && 'VLAN 생성'}
                    {config.type === 'vxlan' && 'VxLAN 생성'}
                    {config.type === 'routing' && '라우팅 생성'}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">{config.name}</div>
                <div className="space-y-1">
                  {config.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                      <span className="text-gray-600 dark:text-gray-300">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 프로비저닝 버튼 */}
      {!showProvisioningPanel && (
        <Button
          variant="primary"
          onClick={() => setShowProvisioningPanel(!showProvisioningPanel)}
          className="absolute top-16 right-4 z-10"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          프로비저닝
        </Button>
      )}

      {/* 하단 VLAN 범례 (논리적 뷰에서만 표시) */}
      {viewOptions.viewMode === 'logical' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
          {VLAN_COLORS.slice(0, 4).map(vlan => (
            <div key={vlan.vlanId} className="flex items-center gap-2">
              <span
                className="w-6 h-4 rounded"
                style={{ backgroundColor: vlan.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-300">{vlan.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 노드/링크 팝업 정보 */}
      {(selectedNode || selectedLink) && popupPosition && (
        <div
          ref={popupRef}
          className={cn(
            'absolute z-30 transform -translate-x-1/2',
            popupPosition.direction === 'up' ? '-translate-y-full' : ''
          )}
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          {/* 팝업 컨테이너 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[280px] max-w-[360px]">
            {/* 헤더 */}
            <div className={cn(
              'px-4 py-3 flex items-center justify-between',
              selectedNode?.status === 'active' && 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-green-500/20',
              selectedNode?.status === 'warning' && 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-b border-yellow-500/20',
              selectedNode?.status === 'error' && 'bg-gradient-to-r from-red-500/10 to-red-500/5 border-b border-red-500/20',
              selectedNode?.status === 'inactive' && 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 border-b border-gray-500/20',
              selectedLink?.status === 'active' && 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-green-500/20',
              selectedLink?.status === 'congested' && 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-b border-yellow-500/20',
              selectedLink?.status === 'down' && 'bg-gradient-to-r from-red-500/10 to-red-500/5 border-b border-red-500/20',
            )}>
              <div className="flex items-center gap-3">
                {/* 상태 아이콘 */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  selectedNode?.status === 'active' && 'bg-green-500/20',
                  selectedNode?.status === 'warning' && 'bg-yellow-500/20',
                  selectedNode?.status === 'error' && 'bg-red-500/20',
                  selectedNode?.status === 'inactive' && 'bg-gray-500/20',
                  selectedLink?.status === 'active' && 'bg-green-500/20',
                  selectedLink?.status === 'congested' && 'bg-yellow-500/20',
                  selectedLink?.status === 'down' && 'bg-red-500/20',
                )}>
                  {selectedNode && (
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      selectedNode.status === 'active' && 'bg-green-500',
                      selectedNode.status === 'warning' && 'bg-yellow-500',
                      selectedNode.status === 'error' && 'bg-red-500',
                      selectedNode.status === 'inactive' && 'bg-gray-500',
                    )} />
                  )}
                  {selectedLink && (
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      selectedLink.status === 'active' && 'bg-green-500',
                      selectedLink.status === 'congested' && 'bg-yellow-500',
                      selectedLink.status === 'down' && 'bg-red-500',
                    )} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedNode?.label || (selectedLink ? `${selectedLink.source} → ${selectedLink.target}` : '')}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      selectedNode?.status === 'active' && 'bg-green-500/20 text-green-600 dark:text-green-400',
                      selectedNode?.status === 'warning' && 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                      selectedNode?.status === 'error' && 'bg-red-500/20 text-red-600 dark:text-red-400',
                      selectedNode?.status === 'inactive' && 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
                      selectedLink?.status === 'active' && 'bg-green-500/20 text-green-600 dark:text-green-400',
                      selectedLink?.status === 'congested' && 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                      selectedLink?.status === 'down' && 'bg-red-500/20 text-red-600 dark:text-red-400',
                    )}>
                      {selectedNode && getStatusLabel(selectedNode.status).label}
                      {selectedLink && (selectedLink.status === 'down' ? 'Down' : selectedLink.status === 'congested' ? 'Congested' : 'Active')}
                    </span>
                    {selectedNode?.type && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {selectedNode.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedLink(null);
                  setPopupPosition(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* 본문 */}
            <div className="px-4 py-3 space-y-3">
              {selectedNode && (
                <>
                  {/* 기본 정보 */}
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

                  {/* 네트워크 정보 */}
                  {(selectedNode.ip || selectedNode.mac || selectedNode.vlan) && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">네트워크 정보</div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 space-y-2">
                        {selectedNode.ip && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">IP 주소</span>
                            <span className="text-xs font-mono font-medium text-gray-900 dark:text-white">{selectedNode.ip}</span>
                          </div>
                        )}
                        {selectedNode.mac && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">MAC 주소</span>
                            <span className="text-xs font-mono font-medium text-gray-900 dark:text-white">{selectedNode.mac}</span>
                          </div>
                        )}
                        {selectedNode.vlan && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">VLAN</span>
                            <span className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getVlanColor(selectedNode.vlan) }}
                              />
                              {selectedNode.vlan}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 성능 정보 */}
                  {(selectedNode.bandwidth || selectedNode.cpu !== undefined || selectedNode.memory !== undefined) && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">성능 정보</div>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedNode.bandwidthLabel && (
                          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedNode.bandwidthLabel}</div>
                            <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70">대역폭</div>
                          </div>
                        )}
                        {selectedNode.cpu !== undefined && (
                          <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{selectedNode.cpu}%</div>
                            <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70">CPU</div>
                          </div>
                        )}
                        {selectedNode.memory !== undefined && (
                          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-2 text-center">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{selectedNode.memory}%</div>
                            <div className="text-[10px] text-orange-600/70 dark:text-orange-400/70">메모리</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedLink && (
                <>
                  {/* 링크 성능 정보 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{getBandwidthLabel(selectedLink.bandwidth)}</div>
                      <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mt-1">대역폭</div>
                    </div>
                    <div className={cn(
                      'rounded-lg p-3 text-center',
                      selectedLink.utilization > 80 ? 'bg-red-50 dark:bg-red-500/10' :
                      selectedLink.utilization > 50 ? 'bg-yellow-50 dark:bg-yellow-500/10' : 'bg-green-50 dark:bg-green-500/10'
                    )}>
                      <div className={cn(
                        'text-xl font-bold',
                        selectedLink.utilization > 80 ? 'text-red-600 dark:text-red-400' :
                        selectedLink.utilization > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                      )}>
                        {selectedLink.utilization.toFixed(1)}%
                      </div>
                      <div className={cn(
                        'text-[10px] uppercase tracking-wider mt-1',
                        selectedLink.utilization > 80 ? 'text-red-600/70 dark:text-red-400/70' :
                        selectedLink.utilization > 50 ? 'text-yellow-600/70 dark:text-yellow-400/70' : 'text-green-600/70 dark:text-green-400/70'
                      )}>
                        사용률
                      </div>
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  {(selectedLink.latency !== undefined || selectedLink.packetLoss !== undefined) && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 space-y-2">
                      {selectedLink.latency !== undefined && selectedLink.latency < 999 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">지연 시간</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{selectedLink.latency.toFixed(1)} ms</span>
                        </div>
                      )}
                      {selectedLink.packetLoss !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">패킷 손실</span>
                          <span className={cn(
                            'text-xs font-medium',
                            selectedLink.packetLoss > 1 ? 'text-red-500' : selectedLink.packetLoss > 0 ? 'text-yellow-500' : 'text-green-500'
                          )}>
                            {selectedLink.packetLoss.toFixed(2)}%
                          </span>
                        </div>
                      )}
                      {selectedLink.type && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">타입</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">{selectedLink.type}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
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

      {/* vis.js 네트워크 컨테이너 */}
      <div
        ref={containerRef}
        className="pt-12 h-full w-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
