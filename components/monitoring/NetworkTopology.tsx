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
  DeviceRole,
  EditorMode,
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
  MousePointer,
  Trash2,
  Link2,
  Undo2,
  Redo2,
  Save,
  XCircle,
  Server,
  Router,
  Monitor,
  Cloud,
  Shield,
  Box,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';
import { getNetworkIconSvg } from '@/lib/networkIcons';
import { useTopologyEditor } from '@/hooks/useTopologyEditor';

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
    // 노드 기본 스타일 - SVG 아이콘 사용
    {
      selector: 'node',
      style: {
        'background-color': 'transparent',
        'background-opacity': 0,
        'background-image': 'data(iconUrl)',
        'background-fit': 'contain',
        'background-clip': 'none',
        'background-width': '100%',
        'background-height': '100%',
        'label': 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': '12px',
        'font-weight': '600',
        'color': colors.text,
        'text-outline-width': 0,
        'text-margin-y': 10,
        'width': 80,
        'height': 60,
        'shape': 'rectangle',
        'border-width': 0,
        'padding': 0,
      },
    },
    // Spine 노드 (상위 계층)
    {
      selector: 'node[role="spine"]',
      style: {
        'width': 90,
        'height': 70,
      },
    },
    // Leaf 노드
    {
      selector: 'node[role="leaf"]',
      style: {
        'width': 85,
        'height': 65,
      },
    },
    // 그룹 노드 (하위 계층)
    {
      selector: 'node[type="group"]',
      style: {
        'width': 70,
        'height': 50,
      },
    },
    // 스위치 노드
    {
      selector: 'node[type="switch"]',
      style: {
        'width': 80,
        'height': 60,
      },
    },
    // 라우터 노드
    {
      selector: 'node[type="router"]',
      style: {
        'width': 75,
        'height': 65,
      },
    },
    // 호스트 노드
    {
      selector: 'node[type="host"]',
      style: {
        'width': 65,
        'height': 75,
      },
    },
    // 컨트롤러 노드
    {
      selector: 'node[type="controller"]',
      style: {
        'width': 80,
        'height': 80,
      },
    },
    // 상태별 스타일 - 활성
    {
      selector: 'node[status="active"]',
      style: {
        'opacity': 1,
      },
    },
    // 상태별 스타일 - 비활성
    {
      selector: 'node[status="inactive"]',
      style: {
        'opacity': 0.5,
      },
    },
    // 상태별 스타일 - 경고 (Minor)
    {
      selector: 'node[status="warning"]',
      style: {
        'opacity': 1,
      },
    },
    // 상태별 스타일 - 오류 (Error)
    {
      selector: 'node[status="error"]',
      style: {
        'opacity': 1,
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
    // 활성 링크 - 패킷 흐름 애니메이션
    {
      selector: 'edge[status="active"]',
      style: {
        'line-color': colors.edgeLine,
        'line-style': 'dashed',
        'line-dash-pattern': [6, 3],
        'line-dash-offset': 0,
      },
    },
    // 혼잡 링크 - 빠른 패킷 흐름 애니메이션
    {
      selector: 'edge[status="congested"]',
      style: {
        'line-color': '#F59E0B',
        'width': 3,
        'line-style': 'dashed',
        'line-dash-pattern': [8, 4],
        'line-dash-offset': 0,
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
    // VxLAN 터널 링크 (점선 + 보라색) - 특별한 패킷 흐름 애니메이션
    {
      selector: 'edge[type="vxlan"]',
      style: {
        'line-color': '#8B5CF6',
        'line-style': 'dashed',
        'width': 3,
        'line-dash-pattern': [10, 5],
        'line-dash-offset': 0,
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

// 노드 타입 옵션
const NODE_TYPE_OPTIONS: { type: NetworkNode['type']; label: string; icon: React.ReactNode }[] = [
  { type: 'switch', label: '스위치', icon: <Server className="w-4 h-4" /> },
  { type: 'router', label: '라우터', icon: <Router className="w-4 h-4" /> },
  { type: 'host', label: '호스트', icon: <Monitor className="w-4 h-4" /> },
  { type: 'controller', label: '컨트롤러', icon: <Cloud className="w-4 h-4" /> },
  { type: 'firewall', label: '방화벽', icon: <Shield className="w-4 h-4" /> },
  { type: 'group', label: '그룹', icon: <Box className="w-4 h-4" /> },
  { type: 'vtep', label: 'VTEP', icon: <Network className="w-4 h-4" /> },
];

// 역할 옵션
const ROLE_OPTIONS: { role: DeviceRole; label: string }[] = [
  { role: 'spine', label: 'Spine' },
  { role: 'leaf', label: 'Leaf' },
  { role: 'access', label: 'Access' },
  { role: 'core', label: 'Core' },
  { role: 'aggregation', label: 'Aggregation' },
  { role: 'edge', label: 'Edge' },
];

// 대역폭 옵션
const BANDWIDTH_OPTIONS = [
  { value: 1000, label: '1G' },
  { value: 10000, label: '10G' },
  { value: 25000, label: '25G' },
  { value: 40000, label: '40G' },
  { value: 100000, label: '100G' },
];

// 링크 타입 옵션
const LINK_TYPE_OPTIONS: { type: NetworkLink['type']; label: string }[] = [
  { type: 'ethernet', label: 'Ethernet' },
  { type: 'optical', label: 'Optical' },
  { type: 'wireless', label: 'Wireless' },
  { type: 'vxlan', label: 'VxLAN' },
];

interface NetworkTopologyProps {
  data?: TopologyData;
  className?: string;
  viewMode?: TopologyViewMode;
  onViewModeChange?: (mode: TopologyViewMode) => void;
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
  editable?: boolean;
  onDataChange?: (data: TopologyData) => void;
}

export function NetworkTopology({
  data,
  className,
  viewMode: externalViewMode,
  onViewModeChange,
  onNodeClick,
  onLinkClick,
  editable = false,
  onDataChange,
}: NetworkTopologyProps) {
  const cyRef = useRef<Core | null>(null);
  const layoutRunningRef = useRef<boolean>(false);
  const layoutDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const onLinkClickRef = useRef(onLinkClick);
  const editorRef = useRef<ReturnType<typeof useTopologyEditor> | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPacketFlow, setShowPacketFlow] = useState(true); // 패킷 흐름 애니메이션 토글
  const [selectedLayout, setSelectedLayout] = useState<TopologyLayoutType>(
    layoutOptions[0]
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
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number; direction: 'up' | 'down' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showProvisioningPanel, setShowProvisioningPanel] = useState(false);

  // 에디터 상태
  const [showAddNodePanel, setShowAddNodePanel] = useState(false);
  const [showAddVxlanPanel, setShowAddVxlanPanel] = useState(false);
  const [showVxlanTunnelList, setShowVxlanTunnelList] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [newNodeData, setNewNodeData] = useState<Partial<NetworkNode>>({
    type: 'switch',
    label: '',
    status: 'active',
    role: 'leaf',
    vlan: 100,
    bandwidth: 10000,
  });
  const [newVxlanData, setNewVxlanData] = useState({
    vni: 10000,
    sourceNodeId: '',
    destNodeId: '',
    sourceVtep: '',
    destVtep: '',
  });
  const [newLinkData, setNewLinkData] = useState<Partial<NetworkLink>>({
    bandwidth: 10000,
    type: 'ethernet',
    status: 'active',
  });

  // 토폴로지 에디터 훅
  const editor = useTopologyEditor({
    initialData: data || { nodes: [], links: [] },
    onDataChange: onDataChange,
  });

  // 에디터 데이터 동기화
  useEffect(() => {
    if (data) {
      editor.setData(data);
    }
  }, [data]);

  // 에디터 ref 동기화
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

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

  // 외부 viewMode prop과 동기화
  useEffect(() => {
    if (externalViewMode && externalViewMode !== viewOptions.viewMode) {
      setViewOptions(prev => ({ ...prev, viewMode: externalViewMode }));
    }
  }, [externalViewMode]);

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
    // editable 모드에서는 editor.data를 사용, 아니면 props data 사용
    const topologyData = editable ? editor.data : data;
    if (!topologyData) return [];

    const nodes: CytoscapeNode[] = topologyData.nodes.map(node => {
      // 상태에 따른 테두리 색상
      const statusColors: Record<string, string> = {
        active: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        inactive: '#6B7280',
      };
      const borderColor = statusColors[node.status] || '#6B7280';

      // 타입/역할에 따른 배경색
      const getBgColor = () => {
        if (isDarkMode) {
          if (node.type === 'controller') return '#F59E0B';
          if (node.type === 'switch' || node.role === 'spine' || node.role === 'leaf') return '#3B82F6';
          if (node.type === 'router') return '#8B5CF6';
          if (node.type === 'host') return '#10B981';
          if (node.type === 'group') return '#6366F1';
          return '#374151';
        } else {
          if (node.type === 'controller') return '#FCD34D';
          if (node.type === 'switch' || node.role === 'spine' || node.role === 'leaf') return '#60A5FA';
          if (node.type === 'router') return '#A78BFA';
          if (node.type === 'host') return '#34D399';
          if (node.type === 'group') return '#818CF8';
          return '#F3F4F6';
        }
      };

      const iconUrl = getNetworkIconSvg(node.type, node.role, getBgColor(), borderColor, isDarkMode);

      return {
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
          iconUrl,
        },
        position: node.position,
        classes: `node-${node.type} node-status-${node.status} ${node.role ? `node-role-${node.role}` : ''}`,
      };
    });

    const edges: CytoscapeEdge[] = topologyData.links.map(link => {
      const bandwidthLabel = viewOptions.showBandwidth ? getBandwidthLabel(link.bandwidth) : '';

      // 소스 노드의 VLAN 가져오기
      const sourceNode = topologyData.nodes.find(n => n.id === link.source);
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
          isVxlanTunnel: link.isVxlanTunnel,
          vxlanVni: link.vxlanVni,
        },
        classes: `edge-${link.type} edge-status-${link.status}${link.isVxlanTunnel ? ' edge-vxlan' : ''}`,
      };
    });

    return [...nodes, ...edges];
  }, [data, viewOptions, editable, editor.data]);

  // 레이아웃 변경 (디바운스 적용)
  const changeLayout = useCallback((layout: TopologyLayoutType) => {
    // 레이아웃 실행 중이면 무시
    if (layoutRunningRef.current) {
      return;
    }

    const cy = cyRef.current;
    if (!cy) return;

    // 노드가 없으면 실행하지 않음
    if (cy.nodes().length === 0) return;

    // 같은 레이아웃을 다시 클릭한 경우 무시 (중복 실행 방지)
    if (selectedLayout.name === layout.name) {
      return;
    }

    // 디바운스: 이전 타이머 취소
    if (layoutDebounceRef.current) {
      clearTimeout(layoutDebounceRef.current);
      layoutDebounceRef.current = null;
    }

    // 선택 상태 즉시 업데이트 (UI 반응성)
    setSelectedLayout(layout);

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

        // 레이아웃 시작 전에도 에러 발생 가능성 대비
        layoutInstance.one('layoutready', () => {
          // 레이아웃이 준비되었음을 확인
        });

        layoutInstance.run();
      } catch (error) {
        console.error('Layout error:', error);
        layoutRunningRef.current = false;
      }
    }, 300);
  }, [selectedLayout]);

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
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  }, [onViewModeChange]);

  // 자동 새로고침 토글
  const handleAutoRefreshToggle = useCallback(() => {
    setViewOptions(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  }, []);

  // 새로고침 간격 변경
  const handleRefreshIntervalChange = useCallback((interval: number) => {
    setViewOptions(prev => ({ ...prev, refreshInterval: interval }));
  }, []);

  // 에디터 핸들러: 노드 추가
  const handleAddNode = useCallback(() => {
    if (!newNodeData.label) {
      return;
    }

    // 캔버스 중앙에 노드 추가
    const cy = cyRef.current;
    let position = { x: 300, y: 300 };
    if (cy) {
      const extent = cy.extent();
      position = {
        x: (extent.x1 + extent.x2) / 2 + (Math.random() - 0.5) * 100,
        y: (extent.y1 + extent.y2) / 2 + (Math.random() - 0.5) * 100,
      };
    }

    const newNode = editor.addNode(newNodeData, position);
    setShowAddNodePanel(false);
    setNewNodeData({
      type: 'switch',
      label: '',
      status: 'active',
      role: 'leaf',
      vlan: 100,
      bandwidth: 10000,
    });

    // 새 노드에 시각적 효과 적용
    if (cy && newNode) {
      setTimeout(() => {
        const addedNode = cy.$(`#${newNode.id}`);
        if (addedNode.length > 0) {
          // 화면을 새 노드 중심으로 이동
          cy.animate({
            center: { eles: addedNode },
            zoom: cy.zoom(),
            duration: 300,
            easing: 'ease-out',
          });

          // 펄스 애니메이션 효과 (순차적 타이머 사용)
          const pulseAnimation = () => {
            // 첫 번째 펄스 - 확대
            addedNode.animate({
              style: {
                'border-width': 8,
                'border-color': '#3B82F6',
                'border-opacity': 1,
              },
              duration: 200,
              easing: 'ease-out',
              complete: () => {
                // 두 번째 펄스 - 축소
                addedNode.animate({
                  style: {
                    'border-width': 4,
                    'border-color': '#3B82F6',
                    'border-opacity': 0.6,
                  },
                  duration: 200,
                  easing: 'ease-in-out',
                  complete: () => {
                    // 세 번째 펄스 - 확대
                    addedNode.animate({
                      style: {
                        'border-width': 8,
                        'border-color': '#3B82F6',
                        'border-opacity': 1,
                      },
                      duration: 200,
                      easing: 'ease-in-out',
                      complete: () => {
                        // 네 번째 펄스 - 축소
                        addedNode.animate({
                          style: {
                            'border-width': 4,
                            'border-color': '#3B82F6',
                            'border-opacity': 0.6,
                          },
                          duration: 200,
                          easing: 'ease-in-out',
                          complete: () => {
                            // 원래 스타일로 복구
                            addedNode.animate({
                              style: {
                                'border-width': 3,
                                'border-opacity': 1,
                              },
                              duration: 300,
                              easing: 'ease-in',
                            });
                          },
                        });
                      },
                    });
                  },
                });
              },
            });
          };

          pulseAnimation();
        }
      }, 100);
    }
  }, [newNodeData, editor]);

  // 에디터 핸들러: 노드 삭제
  const handleDeleteNode = useCallback((nodeId: string) => {
    editor.deleteNode(nodeId);
    setSelectedNode(null);
    setPopupPosition(null);
  }, [editor]);

  // 에디터 핸들러: 링크 삭제
  const handleDeleteLink = useCallback((linkId: string) => {
    editor.deleteLink(linkId);
    setSelectedLink(null);
    setPopupPosition(null);
  }, [editor]);

  // 에디터 핸들러: VxLAN 터널 추가
  const handleAddVxlanTunnel = useCallback(() => {
    if (!newVxlanData.sourceNodeId || !newVxlanData.destNodeId) {
      return;
    }

    editor.addVxlanTunnel({
      vni: newVxlanData.vni,
      sourceNodeId: newVxlanData.sourceNodeId,
      destNodeId: newVxlanData.destNodeId,
      sourceVtep: newVxlanData.sourceVtep,
      destVtep: newVxlanData.destVtep,
      status: 'active',
    });

    setShowAddVxlanPanel(false);
    setNewVxlanData({
      vni: 10000,
      sourceNodeId: '',
      destNodeId: '',
      sourceVtep: '',
      destVtep: '',
    });
  }, [newVxlanData, editor]);

  // 에디터 핸들러: 노드 업데이트
  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<NetworkNode>) => {
    editor.updateNode(nodeId, updates);
    // 선택된 노드 정보도 업데이트
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, ...updates });
    }
  }, [editor, selectedNode]);

  // 에디터 핸들러: 링크 업데이트
  const handleUpdateLink = useCallback((linkId: string, updates: Partial<NetworkLink>) => {
    editor.updateLink(linkId, updates);
    if (selectedLink && selectedLink.id === linkId) {
      setSelectedLink({ ...selectedLink, ...updates });
    }
  }, [editor, selectedLink]);

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
      const currentEditor = editorRef.current;

      // 에디터 모드 처리
      if (currentEditor && editable) {
        const mode = currentEditor.editorState.mode;

        // 삭제 모드
        if (mode === 'delete') {
          currentEditor.deleteNode(nodeData.id);
          return;
        }

        // 연결 추가 모드
        if (mode === 'add-link') {
          if (currentEditor.editorState.pendingConnection) {
            // 두 번째 노드 클릭 - 연결 완료
            currentEditor.completeConnection(nodeData.id);
            currentEditor.setMode('view');
          } else {
            // 첫 번째 노드 클릭 - 연결 시작
            currentEditor.startConnection(nodeData.id);
          }
          return;
        }
      }

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

      // 노드 위치 계산
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const nodePosition = node.renderedPosition();
        const popupWidth = 320;
        const popupHeight = 350; // 에디터 버튼 포함 높이
        const padding = 20;
        const toolbarHeight = 48;
        const containerHeight = containerRect.height;

        // X 좌표 조정 (좌우 경계 체크)
        let popupX = nodePosition.x;
        if (popupX - popupWidth / 2 < padding) {
          popupX = popupWidth / 2 + padding;
        } else if (popupX + popupWidth / 2 > containerRect.width - padding) {
          popupX = containerRect.width - popupWidth / 2 - padding;
        }

        // Y 좌표 및 방향 결정
        let popupY = nodePosition.y - 30;
        let direction: 'up' | 'down' = 'up';

        // 상단 공간이 부족하면 아래로 표시
        if (nodePosition.y - popupHeight - 30 < toolbarHeight) {
          popupY = nodePosition.y + 50;
          direction = 'down';
        }

        // 하단 경계 체크 (direction이 'down'일 때)
        if (direction === 'down' && popupY + popupHeight > containerHeight - padding) {
          // 아래로도 공간이 부족하면 위로 다시 변경하고 최대한 아래에 붙임
          if (nodePosition.y - popupHeight - 30 >= toolbarHeight) {
            popupY = nodePosition.y - 30;
            direction = 'up';
          } else {
            // 둘 다 부족하면 컨테이너 하단에 맞춤
            popupY = containerHeight - popupHeight - padding;
          }
        }

        // 상단 경계 체크 (direction이 'up'일 때)
        if (direction === 'up' && popupY - popupHeight < toolbarHeight) {
          popupY = toolbarHeight + popupHeight + padding;
        }

        setPopupPosition({ x: popupX, y: popupY + toolbarHeight, direction });
      }

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
      const currentEditor = editorRef.current;

      // 에디터 모드 처리 - 삭제 모드
      if (currentEditor && editable && currentEditor.editorState.mode === 'delete') {
        currentEditor.deleteLink(edgeData.id);
        return;
      }

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

      // 엣지 중간 위치 계산
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const sourcePos = cy.$(`#${edgeData.source}`).renderedPosition();
        const targetPos = cy.$(`#${edgeData.target}`).renderedPosition();
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;

        const popupWidth = 320;
        const popupHeight = 280; // 에디터 버튼 포함 높이
        const padding = 20;
        const toolbarHeight = 48;
        const containerHeight = containerRect.height;

        // X 좌표 조정 (좌우 경계 체크)
        let popupX = midX;
        if (popupX - popupWidth / 2 < padding) {
          popupX = popupWidth / 2 + padding;
        } else if (popupX + popupWidth / 2 > containerRect.width - padding) {
          popupX = containerRect.width - popupWidth / 2 - padding;
        }

        // Y 좌표 및 방향 결정
        let popupY = midY - 30;
        let direction: 'up' | 'down' = 'up';

        // 상단 공간이 부족하면 아래로 표시
        if (midY - popupHeight - 30 < toolbarHeight) {
          popupY = midY + 30;
          direction = 'down';
        }

        // 하단 경계 체크 (direction이 'down'일 때)
        if (direction === 'down' && popupY + popupHeight > containerHeight - padding) {
          if (midY - popupHeight - 30 >= toolbarHeight) {
            popupY = midY - 30;
            direction = 'up';
          } else {
            popupY = containerHeight - popupHeight - padding;
          }
        }

        // 상단 경계 체크 (direction이 'up'일 때)
        if (direction === 'up' && popupY - popupHeight < toolbarHeight) {
          popupY = toolbarHeight + popupHeight + padding;
        }

        setPopupPosition({ x: popupX, y: popupY + toolbarHeight, direction });
      }

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
        setPopupPosition(null);
      }
    });

    // 드래그/줌 시 팝업 닫기
    cy.on('drag', () => {
      setSelectedNode(null);
      setSelectedLink(null);
      setPopupPosition(null);
    });

    cy.on('zoom', () => {
      setSelectedNode(null);
      setSelectedLink(null);
      setPopupPosition(null);
    });

    cy.on('pan', () => {
      setSelectedNode(null);
      setSelectedLink(null);
      setPopupPosition(null);
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

  // 패킷 흐름 애니메이션
  useEffect(() => {
    if (!showPacketFlow || !cyRef.current) return;

    const cy = cyRef.current;
    let offset = 0;
    let animationFrame: number;

    const animate = () => {
      offset = (offset + 0.5) % 24; // 24픽셀마다 반복

      // 활성 링크 애니메이션 (느린 속도)
      cy.edges('[status="active"]').forEach((edge: any) => {
        if (edge.data('type') !== 'vxlan') {
          edge.style('line-dash-offset', offset);
        }
      });

      // 혼잡 링크 애니메이션 (빠른 속도)
      cy.edges('[status="congested"]').forEach((edge: any) => {
        edge.style('line-dash-offset', offset * 1.5);
      });

      // VxLAN 터널 애니메이션 (중간 속도, 반대 방향)
      cy.edges('[type="vxlan"]').forEach((edge: any) => {
        edge.style('line-dash-offset', -offset * 1.2);
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      // 애니메이션 정리
      if (cy) {
        cy.edges().forEach((edge: any) => {
          edge.style('line-dash-offset', 0);
        });
      }
    };
  }, [showPacketFlow]);

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

        {/* 패킷 흐름 애니메이션 토글 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-1 border border-gray-200 dark:border-gray-700">
          <Button
            variant={showPacketFlow ? 'primary' : 'ghost'}
            onClick={() => setShowPacketFlow(!showPacketFlow)}
            title={showPacketFlow ? '패킷 흐름 애니메이션 끄기' : '패킷 흐름 애니메이션 켜기'}
          >
            <Activity className="w-4 h-4" />
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

      {/* 우측 에디터 패널 (editable 모드에서만 표시) */}
      {editable && (
        <div className="absolute top-16 right-4 z-10 flex flex-col gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">에디터</span>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant={editor.editorState.mode === 'view' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => editor.setMode('view')}
                className="justify-start"
                leftIcon={<MousePointer className="w-4 h-4" />}
              >
                선택
              </Button>
              <Button
                variant={editor.editorState.mode === 'add-node' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  editor.setMode('add-node');
                  setShowAddNodePanel(true);
                }}
                className="justify-start"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                노드 추가
              </Button>
              <Button
                variant={editor.editorState.mode === 'add-link' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => editor.setMode('add-link')}
                className="justify-start"
                leftIcon={<Link2 className="w-4 h-4" />}
              >
                연결 추가
              </Button>
              <Button
                variant={editor.editorState.mode === 'delete' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => editor.setMode('delete')}
                className="justify-start text-red-600 dark:text-red-400"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                삭제
              </Button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddVxlanPanel(true)}
                  className="flex-1 justify-start text-purple-600 dark:text-purple-400"
                  leftIcon={<Cloud className="w-4 h-4" />}
                  title="VxLAN 터널 추가"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                {editor.data.vxlanTunnels && editor.data.vxlanTunnels.length > 0 && (
                  <Button
                    variant={showVxlanTunnelList ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowVxlanTunnelList(!showVxlanTunnelList)}
                    className="flex-1 justify-center text-purple-600 dark:text-purple-400"
                    title="VxLAN 터널 목록"
                  >
                    <span className="text-xs">{editor.data.vxlanTunnels.length}</span>
                  </Button>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={editor.undo}
                  disabled={!editor.canUndo}
                  title="실행 취소"
                  className="flex-1"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={editor.redo}
                  disabled={!editor.canRedo}
                  title="다시 실행"
                  className="flex-1"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </div>
              {editor.hasChanges && (
                <div className="flex gap-1 mt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={editor.save}
                    className="flex-1"
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    저장
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={editor.cancel}
                    className="flex-1 text-red-600 dark:text-red-400"
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    취소
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 노드 추가 패널 */}
      {showAddNodePanel && editable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-900 dark:text-white">노드 추가</span>
            <Button
              variant="icon"
              onClick={() => setShowAddNodePanel(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {/* 노드 이름 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                노드 이름 *
              </label>
              <input
                type="text"
                value={newNodeData.label || ''}
                onChange={(e) => setNewNodeData({ ...newNodeData, label: e.target.value })}
                placeholder="예: Switch-01"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 노드 타입 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                노드 타입
              </label>
              <div className="grid grid-cols-4 gap-1">
                {NODE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setNewNodeData({ ...newNodeData, type: option.type })}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors',
                      newNodeData.type === option.type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    {option.icon}
                    <span className="truncate w-full text-center">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 역할 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                역할
              </label>
              <select
                value={newNodeData.role || ''}
                onChange={(e) => setNewNodeData({ ...newNodeData, role: e.target.value as DeviceRole })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안함</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.role} value={option.role}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* IP 주소 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                IP 주소
              </label>
              <input
                type="text"
                value={newNodeData.ip || ''}
                onChange={(e) => setNewNodeData({ ...newNodeData, ip: e.target.value })}
                placeholder="예: 192.168.1.1"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* VLAN */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VLAN ID
                </label>
                <input
                  type="number"
                  value={newNodeData.vlan || ''}
                  onChange={(e) => setNewNodeData({ ...newNodeData, vlan: parseInt(e.target.value) || undefined })}
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  대역폭
                </label>
                <select
                  value={newNodeData.bandwidth || 10000}
                  onChange={(e) => setNewNodeData({ ...newNodeData, bandwidth: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BANDWIDTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* VxLAN 설정 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                VxLAN 설정 (선택)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                    VNI
                  </label>
                  <input
                    type="number"
                    value={newNodeData.vxlanVni || ''}
                    onChange={(e) => setNewNodeData({ ...newNodeData, vxlanVni: parseInt(e.target.value) || undefined })}
                    placeholder="10000"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                    VTEP IP
                  </label>
                  <input
                    type="text"
                    value={newNodeData.vtepIp || ''}
                    onChange={(e) => setNewNodeData({ ...newNodeData, vtepIp: e.target.value })}
                    placeholder="10.0.0.1"
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowAddNodePanel(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleAddNode}
                className="flex-1"
                disabled={!newNodeData.label}
              >
                추가
              </Button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VxLAN 터널 추가 패널 */}
      {showAddVxlanPanel && editable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-900 dark:text-white">VxLAN 터널 추가</span>
            <Button
              variant="icon"
              onClick={() => setShowAddVxlanPanel(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {/* VNI */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                VNI (VxLAN Network Identifier)
              </label>
              <input
                type="number"
                value={newVxlanData.vni}
                onChange={(e) => setNewVxlanData({ ...newVxlanData, vni: parseInt(e.target.value) || 10000 })}
                placeholder="10000"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 소스 노드 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                소스 노드
              </label>
              <select
                value={newVxlanData.sourceNodeId}
                onChange={(e) => setNewVxlanData({ ...newVxlanData, sourceNodeId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">노드 선택</option>
                {editor.data.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label} ({node.id})
                  </option>
                ))}
              </select>
            </div>

            {/* 소스 VTEP IP */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                소스 VTEP IP
              </label>
              <input
                type="text"
                value={newVxlanData.sourceVtep}
                onChange={(e) => setNewVxlanData({ ...newVxlanData, sourceVtep: e.target.value })}
                placeholder="10.0.0.1"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 대상 노드 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                대상 노드
              </label>
              <select
                value={newVxlanData.destNodeId}
                onChange={(e) => setNewVxlanData({ ...newVxlanData, destNodeId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">노드 선택</option>
                {editor.data.nodes
                  .filter((node) => node.id !== newVxlanData.sourceNodeId)
                  .map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label} ({node.id})
                    </option>
                  ))}
              </select>
            </div>

            {/* 대상 VTEP IP */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                대상 VTEP IP
              </label>
              <input
                type="text"
                value={newVxlanData.destVtep}
                onChange={(e) => setNewVxlanData({ ...newVxlanData, destVtep: e.target.value })}
                placeholder="10.0.0.2"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowAddVxlanPanel(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleAddVxlanTunnel}
                className="flex-1"
                disabled={!newVxlanData.sourceNodeId || !newVxlanData.destNodeId}
              >
                추가
              </Button>
            </div>
          </div>
          </div>
        </div>
      )}

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

      {/* 프로비저닝 버튼 (editable 모드가 아닐 때만 표시) */}
      {!showProvisioningPanel && !editable && (
        <Button
          variant="primary"
          onClick={() => setShowProvisioningPanel(!showProvisioningPanel)}
          className="absolute top-16 right-4 z-10"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          프로비저닝
        </Button>
      )}

      {/* 에디터 모드 안내 */}
      {editable && editor.editorState.mode !== 'view' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          {editor.editorState.mode === 'add-node' && (
            <span className="text-sm font-medium">노드 추가 모드 - 우측 패널에서 노드 정보를 입력하세요</span>
          )}
          {editor.editorState.mode === 'add-link' && (
            <span className="text-sm font-medium">
              {editor.editorState.pendingConnection
                ? '연결할 두 번째 노드를 클릭하세요'
                : '연결할 첫 번째 노드를 클릭하세요'}
            </span>
          )}
          {editor.editorState.mode === 'delete' && (
            <span className="text-sm font-medium text-red-100">삭제 모드 - 삭제할 노드 또는 연결을 클릭하세요</span>
          )}
          {editor.editorState.mode === 'edit' && (
            <span className="text-sm font-medium">편집 모드 - 편집할 요소를 클릭하세요</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.setMode('view');
              editor.cancelConnection();
            }}
            className="text-white hover:bg-blue-700 px-2 py-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* VxLAN 터널 목록 모달 */}
      {showVxlanTunnelList && editable && editor.data.vxlanTunnels && editor.data.vxlanTunnels.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowVxlanTunnelList(false)}>
          <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">VxLAN 터널 목록</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({editor.data.vxlanTunnels.length}개)</span>
              </div>
              <Button
                variant="icon"
                size="sm"
                onClick={() => setShowVxlanTunnelList(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 max-h-96 overflow-y-auto space-y-2">
              {editor.data.vxlanTunnels.map((tunnel) => {
                const sourceNode = editor.data.nodes.find(n => n.id === tunnel.sourceNodeId);
                const destNode = editor.data.nodes.find(n => n.id === tunnel.destNodeId);
                return (
                  <div
                    key={tunnel.id}
                    className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          tunnel.status === 'active' ? 'bg-green-500' : tunnel.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        )} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          VNI {tunnel.vni}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span>{sourceNode?.label || tunnel.sourceNodeId}</span>
                        <span>→</span>
                        <span>{destNode?.label || tunnel.destNodeId}</span>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        VTEP: {tunnel.sourceVtep} ↔ {tunnel.destVtep}
                      </div>
                    </div>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => editor.deleteVxlanTunnel(tunnel.id)}
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="터널 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowVxlanTunnelList(false);
                  setShowAddVxlanPanel(true);
                }}
                className="w-full justify-center text-purple-600 dark:text-purple-400"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                새 터널 추가
              </Button>
            </div>
          </div>
        </div>
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

              {/* 에디터 버튼 (editable 모드에서만 표시) */}
              {editable && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex gap-2">
                    {selectedNode && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            editor.selectNode(selectedNode.id);
                            editor.setMode('add-link');
                            editor.startConnection(selectedNode.id);
                            setPopupPosition(null);
                          }}
                          className="flex-1"
                          leftIcon={<Link2 className="w-4 h-4" />}
                        >
                          연결
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNode(selectedNode.id)}
                          className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                          삭제
                        </Button>
                      </>
                    )}
                    {selectedLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(selectedLink.id)}
                        className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        연결 삭제
                      </Button>
                    )}
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

      {/* Cytoscape 컴포넌트 */}
      <div ref={containerRef} className="pt-12 h-full">
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
