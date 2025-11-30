// Network topology type definitions

// 디바이스 역할 정의
export type DeviceRole = 'spine' | 'leaf' | 'access' | 'core' | 'aggregation' | 'edge';

// 노드 상태 심각도 정의
export type NodeSeverity = 'normal' | 'minor' | 'major' | 'critical';

export interface NetworkNode {
  id: string;
  type: 'switch' | 'router' | 'host' | 'controller' | 'firewall' | 'group';
  label: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  severity?: NodeSeverity;
  role?: DeviceRole;
  ip?: string;
  mac?: string;
  vlan?: number;
  vlans?: number[]; // 다중 VLAN 지원
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
  type: 'ethernet' | 'optical' | 'wireless';
  latency?: number; // ms
  packetLoss?: number; // percentage
  metadata?: {
    [key: string]: any;
  };
}

export interface TopologyData {
  nodes: NetworkNode[];
  links: NetworkLink[];
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