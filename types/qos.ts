/**
 * QoS (Quality of Service) 관련 타입 정의
 */

import { z } from 'zod';

// ==================== Enums ====================

// QoS 정책 우선순위
export type QoSPriority = 'low' | 'medium' | 'high' | 'critical';

// QoS 정책 상태
export type QoSStatus = 'active' | 'inactive' | 'draft' | 'error';

// 트래픽 클래스 우선순위 (1-8)
export type TrafficClassPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// DSCP 값 (0-63)
export type DSCPValue = number; // 0-63 범위

// 프로토콜 타입
export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'ANY';

// ==================== Core Interfaces ====================

// 트래픽 클래스
export interface TrafficClass {
  id: string;
  name: string;
  priority: TrafficClassPriority;
  dscpValue: DSCPValue;
  description?: string;
  order: number; // 표시 순서
}

// 대역폭 할당
export interface BandwidthAllocation {
  trafficClassId: string;
  minBandwidth: number; // Mbps
  maxBandwidth: number; // Mbps
  guaranteedRate?: number; // Mbps
  burstSize?: number; // KB
}

// 우선순위 큐 설정
export interface PriorityQueue {
  queueNumber: number; // 1-8
  weight: number; // 1-100
  trafficClassId: string;
  schedulingAlgorithm?: 'WRR' | 'SP' | 'WFQ'; // Weighted Round Robin, Strict Priority, Weighted Fair Queuing
}

// DSCP 마킹 규칙
export interface DSCPMarking {
  id: string;
  name: string;
  priority: number; // 규칙 우선순위 (낮을수록 먼저 적용)
  sourceIp?: string;
  sourcePort?: number;
  destinationIp?: string;
  destinationPort?: number;
  protocol?: ProtocolType;
  dscpValue: DSCPValue;
  trafficClassId: string;
  enabled: boolean;
}

// QoS 정책
export interface QoSPolicy {
  id: string;
  name: string;
  description?: string;
  priority: QoSPriority;
  status: QoSStatus;
  trafficClasses: TrafficClass[];
  bandwidthAllocations: BandwidthAllocation[];
  priorityQueues: PriorityQueue[];
  dscpMarkings: DSCPMarking[];
  appliedDevices: string[]; // Device IDs
  appliedPorts: string[]; // Port IDs
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // User ID
}

// ==================== Monitoring Types ====================

// 트래픽 클래스별 통계
export interface TrafficClassStats {
  trafficClassId: string;
  trafficClassName: string;
  packetsTransmitted: number;
  bytesTransmitted: number;
  packetsDropped: number;
  bytesDropped: number;
  averageLatency: number; // ms
  jitter: number; // ms
  utilization: number; // 0-100%
  timestamp: string;
}

// 큐 사용률 통계
export interface QueueUtilizationStats {
  queueNumber: number;
  utilization: number; // 0-100%
  depth: number; // 현재 큐 깊이
  maxDepth: number; // 최대 큐 깊이
  packetsEnqueued: number;
  packetsDequeued: number;
  packetsDropped: number;
  timestamp: string;
}

// 패킷 드롭 통계
export interface PacketDropStats {
  total: number;
  byTrafficClass: {
    trafficClassId: string;
    trafficClassName: string;
    count: number;
    percentage: number;
  }[];
  byReason: {
    reason: 'congestion' | 'policy' | 'error' | 'other';
    count: number;
    percentage: number;
  }[];
  timestamp: string;
}

// QoS 모니터링 데이터
export interface QoSMonitoringData {
  policyId: string;
  policyName: string;
  deviceId: string;
  deviceName: string;
  trafficClassStats: TrafficClassStats[];
  queueUtilization: QueueUtilizationStats[];
  packetDrops: PacketDropStats;
  overallUtilization: number; // 0-100%
  timestamp: string;
}

// SLA 메트릭
export interface SLAMetric {
  name: string;
  target: number;
  actual: number;
  unit: string;
  met: boolean; // 목표 달성 여부
}

// SLA 준수 리포트
export interface QoSSLAReport {
  id: string;
  policyId: string;
  policyName: string;
  startDate: string;
  endDate: string;
  metrics: SLAMetric[];
  overallCompliance: number; // 0-100%
  trafficClassCompliance: {
    trafficClassId: string;
    trafficClassName: string;
    compliance: number; // 0-100%
    violations: number;
  }[];
  recommendations: string[];
  generatedAt: string;
}

// ==================== API Request/Response Types ====================

// QoS 정책 생성 요청
export interface CreateQoSPolicyRequest {
  name: string;
  description?: string;
  priority: QoSPriority;
  trafficClasses: Omit<TrafficClass, 'id'>[];
  bandwidthAllocations: Omit<BandwidthAllocation, 'trafficClassId'>[];
  priorityQueues: Omit<PriorityQueue, 'trafficClassId'>[];
  dscpMarkings: Omit<DSCPMarking, 'id'>[];
}

// QoS 정책 업데이트 요청
export interface UpdateQoSPolicyRequest {
  name?: string;
  description?: string;
  priority?: QoSPriority;
  status?: QoSStatus;
  trafficClasses?: TrafficClass[];
  bandwidthAllocations?: BandwidthAllocation[];
  priorityQueues?: PriorityQueue[];
  dscpMarkings?: DSCPMarking[];
}

// QoS 정책 적용 요청
export interface ApplyQoSPolicyRequest {
  policyId: string;
  deviceIds?: string[];
  portIds?: string[];
}

// QoS 정책 필터
export interface QoSPolicyFilters {
  status?: QoSStatus | 'all';
  priority?: QoSPriority | 'all';
  search?: string;
  appliedDeviceId?: string;
}

// QoS 모니터링 쿼리
export interface QoSMonitoringQuery {
  policyId?: string;
  deviceId?: string;
  startDate: string;
  endDate: string;
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
}

// ==================== Zustand Store State Types ====================

// QoS 스토어 상태
export interface QoSStoreState {
  // 정책 관리
  policies: QoSPolicy[];
  currentPolicy: QoSPolicy | null;
  isLoading: boolean;
  error: string | null;

  // 필터 및 검색
  filters: QoSPolicyFilters;

  // 모니터링 데이터
  monitoringData: QoSMonitoringData[];
  slaReports: QoSSLAReport[];

  // 액션
  fetchPolicies: () => Promise<void>;
  fetchPolicyById: (id: string) => Promise<void>;
  createPolicy: (request: CreateQoSPolicyRequest) => Promise<QoSPolicy>;
  updatePolicy: (id: string, request: UpdateQoSPolicyRequest) => Promise<QoSPolicy>;
  deletePolicy: (id: string) => Promise<void>;
  applyPolicy: (request: ApplyQoSPolicyRequest) => Promise<void>;
  setFilters: (filters: Partial<QoSPolicyFilters>) => void;

  // 모니터링
  fetchMonitoringData: (query: QoSMonitoringQuery) => Promise<void>;
  fetchSLAReports: (policyId: string, startDate: string, endDate: string) => Promise<void>;
}

// ==================== Utility Types ====================

// QoS 정책 통계 요약
export interface QoSPolicyStatsSummary {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  error: number;
  totalDevicesApplied: number;
  totalPortsApplied: number;
}

// 프리셋 DSCP 마킹 템플릿
export interface DSCPMarkingPreset {
  name: string;
  category: 'voip' | 'video' | 'data';
  description: string;
  dscpValue: DSCPValue;
  protocol?: ProtocolType;
  ports?: number[];
}

// ==================== Constants ====================

// QoS 우선순위 라벨
export const QoSPriorityLabels: Record<QoSPriority, string> = {
  low: '낮음',
  medium: '중간',
  high: '높음',
  critical: '긴급',
};

// QoS 상태 라벨
export const QoSStatusLabels: Record<QoSStatus, string> = {
  active: '활성',
  inactive: '비활성',
  draft: '초안',
  error: '오류',
};

// QoS 상태 색상 매핑 (Tailwind 클래스)
export const QoSStatusColors: Record<QoSStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

// 프리셋 DSCP 마킹 템플릿
export const DSCPMarkingPresets: DSCPMarkingPreset[] = [
  {
    name: 'VoIP',
    category: 'voip',
    description: 'Voice over IP 트래픽',
    dscpValue: 46, // EF (Expedited Forwarding)
    protocol: 'UDP',
    ports: [5060, 5061], // SIP
  },
  {
    name: 'Video Conferencing',
    category: 'video',
    description: '화상 회의 트래픽',
    dscpValue: 34, // AF41
    protocol: 'UDP',
  },
  {
    name: 'Business Critical Data',
    category: 'data',
    description: '중요 업무 데이터',
    dscpValue: 26, // AF31
    protocol: 'TCP',
  },
  {
    name: 'Best Effort',
    category: 'data',
    description: '일반 데이터 트래픽',
    dscpValue: 0, // BE
  },
];

// ==================== Zod Validation Schemas ====================

// DSCP 값 검증
const dscpValueSchema = z.number().int().min(0).max(63);

// 트래픽 클래스 우선순위 검증
const trafficClassPrioritySchema = z.number().int().min(1).max(8);

// 트래픽 클래스 스키마
export const trafficClassSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, '트래픽 클래스 이름은 필수입니다'),
  priority: trafficClassPrioritySchema,
  dscpValue: dscpValueSchema,
  description: z.string().optional(),
  order: z.number().int().min(0),
});

// 대역폭 할당 스키마
export const bandwidthAllocationSchema = z.object({
  trafficClassId: z.string(),
  minBandwidth: z.number().min(0, '최소 대역폭은 0 이상이어야 합니다'),
  maxBandwidth: z.number().min(0, '최대 대역폭은 0 이상이어야 합니다'),
  guaranteedRate: z.number().min(0).optional(),
  burstSize: z.number().min(0).optional(),
}).refine(
  (data) => data.minBandwidth <= data.maxBandwidth,
  {
    message: '최소 대역폭은 최대 대역폭보다 작거나 같아야 합니다',
    path: ['minBandwidth'],
  }
);

// 우선순위 큐 스키마
export const priorityQueueSchema = z.object({
  queueNumber: z.number().int().min(1).max(8),
  weight: z.number().int().min(1).max(100),
  trafficClassId: z.string(),
  schedulingAlgorithm: z.enum(['WRR', 'SP', 'WFQ']).optional(),
});

// DSCP 마킹 규칙 스키마
export const dscpMarkingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, '마킹 규칙 이름은 필수입니다'),
  priority: z.number().int().min(0),
  sourceIp: z.string().optional(),
  sourcePort: z.number().int().min(0).max(65535).optional(),
  destinationIp: z.string().optional(),
  destinationPort: z.number().int().min(0).max(65535).optional(),
  protocol: z.enum(['TCP', 'UDP', 'ICMP', 'ANY']).optional(),
  dscpValue: dscpValueSchema,
  trafficClassId: z.string(),
  enabled: z.boolean(),
});

// QoS 정책 생성 요청 스키마
export const createQoSPolicySchema = z.object({
  name: z.string().min(1, '정책 이름은 필수입니다').max(100, '정책 이름은 100자 이하여야 합니다'),
  description: z.string().max(500, '설명은 500자 이하여야 합니다').optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  trafficClasses: z.array(trafficClassSchema).min(1, '최소 1개의 트래픽 클래스가 필요합니다'),
  bandwidthAllocations: z.array(bandwidthAllocationSchema),
  priorityQueues: z.array(priorityQueueSchema),
  dscpMarkings: z.array(dscpMarkingSchema),
});

// QoS 정책 업데이트 요청 스키마
export const updateQoSPolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['active', 'inactive', 'draft', 'error']).optional(),
  trafficClasses: z.array(trafficClassSchema).optional(),
  bandwidthAllocations: z.array(bandwidthAllocationSchema).optional(),
  priorityQueues: z.array(priorityQueueSchema).optional(),
  dscpMarkings: z.array(dscpMarkingSchema).optional(),
});

// QoS 정책 적용 요청 스키마
export const applyQoSPolicySchema = z.object({
  policyId: z.string().min(1, '정책 ID는 필수입니다'),
  deviceIds: z.array(z.string()).optional(),
  portIds: z.array(z.string()).optional(),
}).refine(
  (data) => (data.deviceIds && data.deviceIds.length > 0) || (data.portIds && data.portIds.length > 0),
  {
    message: '최소 1개의 디바이스 또는 포트를 선택해야 합니다',
  }
);

// Export type inference from schemas
export type TrafficClassInput = z.infer<typeof trafficClassSchema>;
export type BandwidthAllocationInput = z.infer<typeof bandwidthAllocationSchema>;
export type PriorityQueueInput = z.infer<typeof priorityQueueSchema>;
export type DSCPMarkingInput = z.infer<typeof dscpMarkingSchema>;
export type CreateQoSPolicyInput = z.infer<typeof createQoSPolicySchema>;
export type UpdateQoSPolicyInput = z.infer<typeof updateQoSPolicySchema>;
export type ApplyQoSPolicyInput = z.infer<typeof applyQoSPolicySchema>;
