// Flow Rule Data Types

export type FlowProtocol = 'TCP' | 'UDP' | 'ICMP' | 'ARP' | 'ANY';

export type FlowAction =
  | 'FORWARD'
  | 'DROP'
  | 'MODIFY'
  | 'QUEUE'
  | 'FLOOD'
  | 'CONTROLLER';

export type FlowStatus = 'active' | 'inactive' | 'error';

export type FlowSeverity = 'normal' | 'minor' | 'major' | 'critical';

// Match Field Configuration
export interface FlowMatchFields {
  srcIp?: string;
  dstIp?: string;
  srcMac?: string;
  dstMac?: string;
  srcPort?: number;
  dstPort?: number;
  vlanId?: number;
  protocol?: FlowProtocol;
  inPort?: number;
  etherType?: number;
}

// Action Configuration
export interface FlowActionConfig {
  type: FlowAction;
  outputPort?: number;
  queueId?: number;
  modifyFields?: {
    srcIp?: string;
    dstIp?: string;
    srcMac?: string;
    dstMac?: string;
    vlanId?: number;
  };
}

// Timeout Configuration
export interface FlowTimeout {
  hardTimeout?: number; // seconds, 0 = permanent
  idleTimeout?: number; // seconds, 0 = no idle timeout
}

// Flow Statistics
export interface FlowStatistics {
  packetCount: number;
  byteCount: number;
  duration: number; // seconds
  lastMatched?: Date;
}

// Flow Rule
export interface FlowRule {
  id: string;
  name: string;
  description?: string;
  priority: number; // 0-65535
  match: FlowMatchFields;
  actions: FlowActionConfig[];
  timeout: FlowTimeout;
  status: FlowStatus;
  statistics: FlowStatistics;
  deviceId?: string; // Target device/switch
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Flow Template
export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rule: Omit<FlowRule, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'statistics'>;
  tags: string[];
}

// Flow Conflict
export interface FlowConflict {
  rule1Id: string;
  rule2Id: string;
  type: 'overlap' | 'shadowing' | 'redundancy';
  severity: FlowSeverity;
  description: string;
  suggestion?: string;
}

// Flow Validation Result
export interface FlowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: FlowConflict[];
}

// Flow History Entry
export interface FlowHistoryEntry {
  id: string;
  flowId: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  changes?: Partial<FlowRule>;
  timestamp: Date;
  userId?: string;
}

// Bulk Flow Operation
export interface BulkFlowOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'apply';
  flowIds: string[];
}

// Packet Trace for Simulation
export interface PacketTrace {
  srcIp: string;
  dstIp: string;
  srcMac: string;
  dstMac: string;
  srcPort?: number;
  dstPort?: number;
  protocol: FlowProtocol;
  vlanId?: number;
  inPort: number;
}

// Flow Simulation Result
export interface FlowSimulationResult {
  packet: PacketTrace;
  matchedRules: FlowRule[];
  appliedActions: FlowActionConfig[];
  outputPorts: number[];
  dropped: boolean;
  path: string[];
}

// Editor Mode
export type EditorMode = 'graphic' | 'json' | 'yaml';

// Flow Editor State
export interface FlowEditorState {
  mode: EditorMode;
  currentRule: Partial<FlowRule> | null;
  isDirty: boolean;
  validationResult: FlowValidationResult | null;
}

// Provisioning Configuration (from task requirements)
export interface ProvisioningConfig {
  vlan?: {
    vlanId: number;
    switches: string[];
    ports: number[];
  }[];
  vxlan?: {
    vni: number;
    switches: string[];
    vtepIp: string[];
  }[];
  routing?: {
    network: string;
    nextHop: string;
    path: string[];
  }[];
}

export interface ProvisioningItem {
  type: 'vlan' | 'vxlan' | 'routing';
  config: ProvisioningConfig[keyof ProvisioningConfig];
  color: string;
}
