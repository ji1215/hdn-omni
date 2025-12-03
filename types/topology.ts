// Network topology type definitions

// 디바이스 역할 정의
export type DeviceRole = 'spine' | 'leaf' | 'access' | 'core' | 'aggregation' | 'edge';

// 노드 상태 심각도 정의
export type NodeSeverity = 'normal' | 'minor' | 'major' | 'critical';

// VxLAN 터널 정의
export interface VxlanTunnel {
  id: string;
  vni: number; // VXLAN Network Identifier
  sourceVtep: string; // Source VTEP IP
  destVtep: string; // Destination VTEP IP
  sourceNodeId: string;
  destNodeId: string;
  status: 'active' | 'inactive' | 'error';
  encapsulation?: 'vxlan' | 'vxlan-gpe';
  mtu?: number;
}

export interface NetworkNode {
  id: string;
  type: 'switch' | 'router' | 'host' | 'controller' | 'firewall' | 'group' | 'vtep';
  label: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  severity?: NodeSeverity;
  role?: DeviceRole;
  ip?: string;
  mac?: string;
  vlan?: number;
  vlans?: number[]; // 다중 VLAN 지원
  vxlanVni?: number; // VxLAN VNI
  vtepIp?: string; // VTEP IP for VxLAN
  port?: number;
  bandwidth?: number;
  bandwidthLabel?: string; // '40G', '10G' 등
  cpu?: number;
  memory?: number;
  layer?: number; // 계층 레벨 (1: Spine, 2: Leaf, 3: Access, 4: Host)
  position?: {
    x: number;
    y: number;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  bandwidth: number;
  utilization: number; // 0-100 percentage
  status: 'active' | 'congested' | 'down';
  type: 'ethernet' | 'optical' | 'wireless' | 'vxlan';
  isVxlanTunnel?: boolean;
  vxlanVni?: number;
  latency?: number; // ms
  packetLoss?: number; // percentage
  metadata?: {
    [key: string]: any;
  };
}

export interface TopologyData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  vxlanTunnels?: VxlanTunnel[];
}

// 에디터 액션 타입
export type EditorAction =
  | { type: 'ADD_NODE'; node: NetworkNode }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'UPDATE_NODE'; nodeId: string; updates: Partial<NetworkNode> }
  | { type: 'ADD_LINK'; link: NetworkLink }
  | { type: 'DELETE_LINK'; linkId: string }
  | { type: 'UPDATE_LINK'; linkId: string; updates: Partial<NetworkLink> }
  | { type: 'ADD_VXLAN_TUNNEL'; tunnel: VxlanTunnel }
  | { type: 'DELETE_VXLAN_TUNNEL'; tunnelId: string };

// 에디터 모드
export type EditorMode = 'view' | 'add-node' | 'add-link' | 'delete' | 'edit';

// 에디터 상태
export interface TopologyEditorState {
  mode: EditorMode;
  selectedNodeId: string | null;
  selectedLinkId: string | null;
  isEditing: boolean;
  pendingConnection: {
    sourceNodeId: string;
  } | null;
}

export interface TopologyLayoutType {
  name: 'hierarchical' | 'circle' | 'cose' | 'grid' | 'concentric' | 'breadthfirst';
  label: string;
  options?: any;
}

// 토폴로지 뷰 모드
export type TopologyViewMode = 'physical' | 'logical';

export interface TopologyViewOptions {
  showLabels: boolean;
  showUtilization: boolean;
  showVlans: boolean;
  showBandwidth: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  viewMode: TopologyViewMode; // 물리/논리 뷰 모드
  selectedVlans: number[]; // 필터링할 VLAN 목록
}

// VLAN 색상 매핑
export interface VlanColorConfig {
  vlanId: number;
  color: string;
  label: string;
}

// 프로비저닝 설정
export interface ProvisioningConfig {
  type: 'vlan' | 'vxlan' | 'routing';
  name: string;
  items: ProvisioningItem[];
}

export interface ProvisioningItem {
  id: string;
  label: string;
  value: string;
}

export interface TopologyStats {
  totalNodes: number;
  activeNodes: number;
  totalLinks: number;
  activeLinks: number;
  avgUtilization: number;
  alerts: number;
}

// Cytoscape element format
export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    type: NetworkNode['type'];
    status: NetworkNode['status'];
    [key: string]: any;
  };
  position?: {
    x: number;
    y: number;
  };
  classes?: string;
}

export interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    bandwidth: string; // Changed to string for display purposes
    utilization: number;
    status: NetworkLink['status'];
    [key: string]: any;
  };
  classes?: string;
}

export type CytoscapeElement = CytoscapeNode | CytoscapeEdge;