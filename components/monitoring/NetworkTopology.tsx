'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core } from 'cytoscape';
import {
  NetworkNode,
  NetworkLink,
  TopologyData,
  TopologyLayoutType,
  TopologyViewOptions,
  TopologyViewMode,
  CytoscapeElement,
  CytoscapeNode,
  CytoscapeEdge,
  VlanColorConfig,
  ProvisioningConfig,
} from '@/types/topology';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layout,
  RefreshCw,
  Info,
  Activity,
  Settings,
  Layers,
  Network,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';

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

// Cytoscape 테마 스타일 정의 (라이트/다크 모드 지원)
const createCytoscapeStylesheet = (viewMode: TopologyViewMode, isDarkMode: boolean): any => {
  // 테마별 색상 정의
  const colors = isDarkMode ? {
    nodeBg: '#374151',
    nodeSpineBg: '#1F2937',
    nodeGroupBg: '#111827',
    nodeBorder: '#4B5563',
    nodeSpineBorder: '#6B7280',
    text: '#E5E7EB',
    edgeLine: '#4B5563',
    edgeText: '#9CA3AF',
    edgeTextBg: '#111827',
  } : {
    nodeBg: '#F3F4F6',
    nodeSpineBg: '#E5E7EB',
    nodeGroupBg: '#FFFFFF',
    nodeBorder: '#9CA3AF',
    nodeSpineBorder: '#6B7280',
    text: '#374151',
    edgeLine: '#9CA3AF',
    edgeText: '#6B7280',
    edgeTextBg: '#FFFFFF',
  };

  return [
    // 노드 기본 스타일 - 육각형
    {
      selector: 'node',
      style: {
        'background-color': colors.nodeBg,
        'background-opacity': 0.9,
        'label': 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': '11px',
        'color': colors.text,
        'text-outline-width': 0,
        'text-margin-y': 8,
        'width': 50,
        'height': 50,
        'shape': 'hexagon',
        'border-width': 2,
        'border-color': colors.nodeBorder,
      },
    },
    // Spine 노드 (상위 계층)
    {
      selector: 'node[role="spine"]',
      style: {
        'background-color': colors.nodeSpineBg,
        'border-color': colors.nodeSpineBorder,
        'width': 60,
        'height': 60,
        'shape': 'round-rectangle',
      },
    },
    // Leaf 노드
    {
      selector: 'node[role="leaf"]',
      style: {
        'background-color': colors.nodeSpineBg,
        'border-color': colors.nodeBorder,
        'width': 55,
        'height': 55,
      },
    },
    // 그룹 노드 (하위 계층)
    {
      selector: 'node[type="group"]',
      style: {
        'background-color': colors.nodeGroupBg,
        'border-color': colors.nodeBorder,
        'width': 45,
        'height': 45,
      },
    },
    // 스위치 노드
    {
      selector: 'node[type="switch"]',
      style: {
        'background-color': colors.nodeSpineBg,
      },
    },
    // 라우터 노드
    {
      selector: 'node[type="router"]',
      style: {
        'background-color': colors.nodeSpineBg,
        'shape': 'round-rectangle',
      },
    },
    // 호스트 노드
    {
      selector: 'node[type="host"]',
      style: {
        'background-color': colors.nodeGroupBg,
        'width': 40,
        'height': 40,
      },
    },
    // 컨트롤러 노드
    {
      selector: 'node[type="controller"]',
      style: {
        'background-color': colors.nodeSpineBg,
        'border-color': '#F59E0B',
        'border-width': 3,
        'width': 60,
        'height': 60,
      },
    },
    // 상태별 스타일 - 활성
    {
      selector: 'node[status="active"]',
      style: {
        'border-color': '#22C55E',
      },
    },
    // 상태별 스타일 - 비활성
    {
      selector: 'node[status="inactive"]',
      style: {
        'opacity': 0.5,
        'border-color': '#6B7280',
      },
    },
    // 상태별 스타일 - 경고 (Minor)
    {
      selector: 'node[status="warning"]',
      style: {
        'border-color': '#F59E0B',
        'border-width': 3,
      },
    },
    // 상태별 스타일 - 오류 (Error)
    {
      selector: 'node[status="error"]',
      style: {
        'border-color': '#EF4444',
        'border-width': 3,
      },
    },
    // 논리적 뷰에서 VLAN 색상 적용
    ...(viewMode === 'logical' ? [
      {
        selector: 'node[vlan = 100], node[vlan = 101]',
        style: { 'border-color': '#EF4444' },
      },
      {
        selector: 'node[vlan = 200], node[vlan = 201]',
        style: { 'border-color': '#F97316' },
      },
      {
        selector: 'node[vlan = 300], node[vlan = 301]',
        style: { 'border-color': '#22C55E' },
      },
      {
        selector: 'node[vlan = 400], node[vlan = 401]',
        style: { 'border-color': '#8B5CF6' },
      },
    ] : []),
    // 엣지 기본 스타일
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': colors.edgeLine,
        'curve-style': 'bezier',
        'label': 'data(bandwidthLabel)',
        'font-size': '10px',
        'color': colors.edgeText,
        'text-rotation': 'autorotate',
        'text-background-opacity': 0.8,
        'text-background-color': colors.edgeTextBg,
        'text-background-padding': '3px',
        'text-background-shape': 'roundrectangle',
      },
    },
    // 활성 링크
    {
      selector: 'edge[status="active"]',
      style: {
        'line-color': colors.edgeLine,
      },
    },
    // 혼잡 링크
    {
      selector: 'edge[status="congested"]',
      style: {
        'line-color': '#F59E0B',
        'width': 3,
      },
    },
    // 다운된 링크
    {
      selector: 'edge[status="down"]',
      style: {
        'line-color': '#EF4444',
        'line-style': 'dashed',
        'width': 2,
      },
    },
    // 논리적 뷰에서 VLAN별 엣지 색상
    ...(viewMode === 'logical' ? [
      {
        selector: 'edge[vlan = 100], edge[vlan = 101]',
        style: { 'line-color': '#EF4444' },
      },
      {
        selector: 'edge[vlan = 200], edge[vlan = 201]',
        style: { 'line-color': '#F97316' },
      },
      {
        selector: 'edge[vlan = 300], edge[vlan = 301]',
        style: { 'line-color': '#22C55E' },
      },
      {
        selector: 'edge[vlan = 400], edge[vlan = 401]',
        style: { 'line-color': '#8B5CF6' },
      },
    ] : []),
    // 선택된 요소
    {
      selector: ':selected',
      style: {
        'border-color': '#3B82F6',
        'border-width': 3,
        'line-color': '#3B82F6',
      },
    },
  ];
};

// 레이아웃 옵션 (Cytoscape 유효한 레이아웃 이름 사용)
const layoutOptions: TopologyLayoutType[] = [
  { name: 'hierarchical', label: '계층형' },
  { name: 'circle', label: '원형' },
  { name: 'cose', label: '포스' },
  { name: 'grid', label: '그리드' },
  { name: 'concentric', label: '동심원' },
  { name: 'breadthfirst', label: '너비 우선' },
];

// 새로고침 간격 옵션
const refreshIntervalOptions: { value: number; label: string }[] = [
  { value: 5, label: '5초' },
  { value: 10, label: '10초' },
  { value: 30, label: '30초' },
  { value: 60, label: '1분' },
];

interface NetworkTopologyProps {
  data?: TopologyData;
  className?: string;
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
}

export function NetworkTopology({
  data,
  className,
  onNodeClick,
  onLinkClick,
}: NetworkTopologyProps) {
  const cyRef = useRef<Core | null>(null);
  const layoutRunningRef = useRef<boolean>(false); // 레이아웃 실행 중 여부
  const layoutDebounceRef = useRef<NodeJS.Timeout | null>(null); // 디바운스 타이머
  const onNodeClickRef = useRef(onNodeClick);
  const onLinkClickRef = useRef(onLinkClick);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<TopologyLayoutType>(
    layoutOptions[0] // 기본값: 계층형
  );
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
  const [showProvisioningPanel, setShowProvisioningPanel] = useState(false);
  const [provisioningConfigs, setProvisioningConfigs] = useState<ProvisioningConfig[]>([
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

  // 대역폭 라벨 생성
  const getBandwidthLabel = (bandwidth: number): string => {
    if (bandwidth >= 40000) return '40G';
    if (bandwidth >= 10000) return '10G';
    if (bandwidth >= 1000) return '1G';
    if (bandwidth >= 100) return '100M';
    return `${bandwidth}M`;
  };

  // 데이터를 Cytoscape 형식으로 변환
  const transformData = useCallback((): CytoscapeElement[] => {
    if (!data) return [];

    const nodes: CytoscapeNode[] = data.nodes.map(node => ({
      data: {
        id: node.id,
        label: viewOptions.showLabels ? node.label : '',
        type: node.type,
        status: node.status,
        role: node.role,
        ip: node.ip,
        mac: node.mac,
        vlan: node.vlan,
        bandwidth: node.bandwidth,
        bandwidthLabel: node.bandwidthLabel || (node.bandwidth ? getBandwidthLabel(node.bandwidth) : ''),
        cpu: node.cpu,
        memory: node.memory,
        layer: node.layer,
      },
      position: node.position,
      classes: `node-${node.type} node-status-${node.status} ${node.role ? `node-role-${node.role}` : ''}`,
    }));

    const edges: CytoscapeEdge[] = data.links.map(link => {
      const bandwidthLabel = viewOptions.showBandwidth ? getBandwidthLabel(link.bandwidth) : '';

      // 소스 노드의 VLAN 가져오기
      const sourceNode = data.nodes.find(n => n.id === link.source);
      const vlan = sourceNode?.vlan;

      return {
        data: {
          id: link.id,
          source: link.source,
          target: link.target,
          bandwidth: bandwidthLabel, // string으로 변환
          bandwidthLabel,
          utilization: link.utilization,
          status: link.status,
          type: link.type,
          latency: link.latency,
          packetLoss: link.packetLoss,
          vlan,
        },
        classes: `edge-${link.type} edge-status-${link.status}`,
      };
    });

    return [...nodes, ...edges];
  }, [data, viewOptions]);

  // 레이아웃 변경 (디바운스 적용)
  const changeLayout = useCallback((layout: TopologyLayoutType) => {
    // 디바운스: 이전 타이머 취소
    if (layoutDebounceRef.current) {
      clearTimeout(layoutDebounceRef.current);
      layoutDebounceRef.current = null;
    }

    // 레이아웃 실행 중이면 무시
    if (layoutRunningRef.current) {
      return;
    }

    const cy = cyRef.current;
    if (!cy) return;

    // 노드가 없으면 실행하지 않음
    if (cy.nodes().length === 0) return;

    // 디바운스 적용 (300ms)
    layoutDebounceRef.current = setTimeout(() => {
      layoutDebounceRef.current = null;

      const currentCy = cyRef.current;
      if (!currentCy || currentCy.nodes().length === 0) return;

      // 레이아웃 실행 중 플래그 설정
      layoutRunningRef.current = true;

      let layoutConfig: any;

      switch (layout.name) {
        case 'hierarchical':
        case 'breadthfirst':
          layoutConfig = {
            name: 'breadthfirst',
            fit: true,
            padding: 50,
            animate: true,
            animationDuration: 300,
            directed: true,
            spacingFactor: 1.75,
            avoidOverlap: true,
            nodeDimensionsIncludeLabels: true,
            grid: false,
            circle: false,
          };
          break;

        case 'circle':
          layoutConfig = {
            name: 'circle',
            fit: true,
            padding: 50,
            animate: true,
            animationDuration: 300,
            avoidOverlap: true,
            startAngle: 0,
            sweep: 2 * Math.PI,
            clockwise: true,
            spacingFactor: 1.2,
          };
          break;

        case 'cose':
          layoutConfig = {
            name: 'cose',
            fit: true,
            padding: 50,
            animate: 'end',
            animationDuration: 300,
            avoidOverlap: true,
            nodeRepulsion: function() { return 4500; },
            idealEdgeLength: function() { return 80; },
            edgeElasticity: function() { return 45; },
            numIter: 500,
            randomize: false,
            componentSpacing: 100,
            nodeOverlap: 20,
            gravity: 0.25,
          };
          break;

        case 'concentric':
          layoutConfig = {
            name: 'concentric',
            fit: true,
            padding: 50,
            animate: true,
            animationDuration: 300,
            avoidOverlap: true,
            concentric: function(node: any) {
              const layer = node.data('layer');
              if (layer === 1) return 4;
              if (layer === 2) return 3;
              if (layer === 3) return 2;
              return 1;
            },
            levelWidth: function() { return 1; },
            minNodeSpacing: 60,
            spacingFactor: 1.5,
          };
          break;

        case 'grid':
          layoutConfig = {
            name: 'grid',
            fit: true,
            padding: 50,
            animate: true,
            animationDuration: 300,
            avoidOverlap: true,
            condense: true,
            spacingFactor: 1.2,
          };
          break;

        default:
          layoutConfig = {
            name: 'grid',
            fit: true,
            padding: 50,
            animate: true,
            animationDuration: 300,
          };
      }

      try {
        const layoutInstance = currentCy.layout(layoutConfig);

        // 레이아웃 완료 이벤트
        layoutInstance.one('layoutstop', () => {
          layoutRunningRef.current = false;
        });

        layoutInstance.run();
        setSelectedLayout(layout);
      } catch (error) {
        console.error('Layout error:', error);
        layoutRunningRef.current = false;
      }
    }, 300);

    // 선택 상태는 즉시 업데이트 (UI 반응성)
    setSelectedLayout(layout);
  }, []);

  // 줌 컨트롤
  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  }, []);

  const handleFit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  }, []);

  // 뷰 모드 변경
  const handleViewModeChange = useCallback((mode: TopologyViewMode) => {
    setViewOptions(prev => ({ ...prev, viewMode: mode }));
  }, []);

  // 자동 새로고침 토글
  const handleAutoRefreshToggle = useCallback(() => {
    setViewOptions(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  }, []);

  // 새로고침 간격 변경
  const handleRefreshIntervalChange = useCallback((interval: number) => {
    setViewOptions(prev => ({ ...prev, refreshInterval: interval }));
  }, []);

  // Refs 업데이트
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onLinkClickRef.current = onLinkClick;
  }, [onNodeClick, onLinkClick]);

  // 이벤트 핸들러 - 의존성을 제거하여 재생성 방지
  const handleCyReady = useCallback((cy: Core) => {
    cyRef.current = cy;

    // 노드 클릭 이벤트
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data();
      const networkNode: NetworkNode = {
        id: nodeData.id,
        type: nodeData.type,
        label: nodeData.label || nodeData.id,
        status: nodeData.status,
        role: nodeData.role,
        ip: nodeData.ip,
        mac: nodeData.mac,
        vlan: nodeData.vlan,
        bandwidth: nodeData.bandwidth,
        bandwidthLabel: nodeData.bandwidthLabel,
        layer: nodeData.layer,
      };
      setSelectedNode(networkNode);
      setSelectedLink(null);
      if (onNodeClickRef.current) {
        onNodeClickRef.current(networkNode);
      }
    });

    // 엣지 클릭 이벤트
    cy.on('tap', 'edge', (event) => {
      const edge = event.target;
      const edgeData = edge.data();
      const networkLink: NetworkLink = {
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        bandwidth: edgeData.bandwidth,
        utilization: edgeData.utilization,
        status: edgeData.status,
        type: edgeData.type,
        latency: edgeData.latency,
        packetLoss: edgeData.packetLoss,
      };
      setSelectedLink(networkLink);
      setSelectedNode(null);
      if (onLinkClickRef.current) {
        onLinkClickRef.current(networkLink);
      }
    });

    // 배경 클릭 시 선택 해제
    cy.on('tap', (event) => {
      if (event.target === cy) {
        setSelectedNode(null);
        setSelectedLink(null);
      }
    });
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (layoutDebounceRef.current) {
        clearTimeout(layoutDebounceRef.current);
        layoutDebounceRef.current = null;
      }
      layoutRunningRef.current = false;
    };
  }, []);

  // 초기 레이아웃 적용
  useEffect(() => {
    if (cyRef.current && data && data.nodes.length > 0) {
      // 초기 레이아웃은 디바운스 없이 바로 실행
      const timer = setTimeout(() => {
        const cy = cyRef.current;
        if (!cy || cy.nodes().length === 0) return;

        try {
          const layoutInstance = cy.layout({
            name: 'breadthfirst',
            fit: true,
            padding: 50,
            animate: false, // 초기 로드 시 애니메이션 없음
            directed: true,
            spacingFactor: 1.75,
            avoidOverlap: true,
          });
          layoutInstance.run();
        } catch (error) {
          console.error('Initial layout error:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data]); // data가 변경될 때만 초기 레이아웃 적용

  // 다크 모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // 초기 체크
    checkDarkMode();

    // MutationObserver로 클래스 변경 감지
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

  const elements = transformData();

  // Cytoscape 스타일시트 메모이제이션
  const cytoscapeStylesheet = React.useMemo(
    () => createCytoscapeStylesheet(viewOptions.viewMode, isDarkMode),
    [viewOptions.viewMode, isDarkMode]
  );

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
              leftIcon={<Network className="w-4 h-4" />}
            >
              논리적 분리
            </Button>
          </div>

          {/* 오른쪽: 자동 새로고침 및 상태 정보 */}
          <div className="flex items-center gap-6 text-sm">
            {/* 자동 새로고침 체크박스 및 간격 설정 */}
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
                variant={selectedLayout.name === layout.name ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => changeLayout(layout)}
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

      {/* 선택된 요소 정보 */}
      {(selectedNode || selectedLink) && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedNode ? '노드 정보' : '링크 정보'}
              </span>
              {selectedNode && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded',
                  getStatusLabel(selectedNode.status).color,
                  'bg-gray-100 dark:bg-gray-700'
                )}>
                  {getStatusLabel(selectedNode.status).label}
                </span>
              )}
              {selectedLink && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded',
                  selectedLink.status === 'down' ? 'text-red-500' :
                  selectedLink.status === 'congested' ? 'text-yellow-500' : 'text-green-500',
                  'bg-gray-100 dark:bg-gray-700'
                )}>
                  {selectedLink.status === 'down' ? 'Down' :
                   selectedLink.status === 'congested' ? 'Congested' : 'Active'}
                </span>
              )}
            </div>
            <Button
              variant="icon"
              onClick={() => {
                setSelectedNode(null);
                setSelectedLink(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {selectedNode && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">ID:</span>{' '}
                <span className="text-gray-900 dark:text-white font-medium">{selectedNode.id}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">타입:</span>{' '}
                <span className="text-gray-900 dark:text-white font-medium">{selectedNode.type}</span>
              </div>
              {selectedNode.role && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">역할:</span>{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{selectedNode.role}</span>
                </div>
              )}
              {selectedNode.ip && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">IP:</span>{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{selectedNode.ip}</span>
                </div>
              )}
              {selectedNode.vlan && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">VLAN:</span>{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{selectedNode.vlan}</span>
                </div>
              )}
              {selectedNode.bandwidthLabel && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">대역폭:</span>{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{selectedNode.bandwidthLabel}</span>
                </div>
              )}
            </div>
          )}
          {selectedLink && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">대역폭:</span>{' '}
                <span className="text-gray-900 dark:text-white font-medium">{getBandwidthLabel(selectedLink.bandwidth)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">사용률:</span>{' '}
                <span className="text-gray-900 dark:text-white font-medium">{selectedLink.utilization.toFixed(1)}%</span>
              </div>
              {selectedLink.latency !== undefined && selectedLink.latency < 999 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">지연:</span>{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{selectedLink.latency.toFixed(1)}ms</span>
                </div>
              )}
              {selectedLink.packetLoss !== undefined && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">패킷 손실:</span>{' '}
                  <span className="text-gray-900 dark:text-white font-medium">{selectedLink.packetLoss.toFixed(2)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cytoscape 컴포넌트 */}
      <div className="pt-12 h-full">
        <CytoscapeComponent
          elements={elements}
          style={{ width: '100%', height: '100%' }}
          stylesheet={cytoscapeStylesheet}
          cy={handleCyReady}
          wheelSensitivity={0.1}
        />
      </div>
    </div>
  );
}
