import { z } from 'zod';

// 프로토콜 타입 정의
export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'SSH' | 'DNS' | 'FTP' | 'TELNET' | 'OTHER';

// 프로토콜 열거형
export const ProtocolEnum = {
  TCP: 'TCP',
  UDP: 'UDP',
  ICMP: 'ICMP',
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  SSH: 'SSH',
  DNS: 'DNS',
  FTP: 'FTP',
  TELNET: 'TELNET',
  OTHER: 'OTHER',
} as const;

// 플로우 상태
export type FlowStatus = 'active' | 'closed' | 'idle';

// TCP 플래그
export interface TcpFlags {
  syn?: boolean;
  ack?: boolean;
  fin?: boolean;
  rst?: boolean;
  psh?: boolean;
  urg?: boolean;
}

// 트래픽 소스 정의
export interface TrafficSource {
  ip: string;
  port?: number;
  mac?: string;
  hostname?: string;
  bytes: number;
  packets: number;
  flows: number;
}

// 트래픽 목적지 정의
export interface TrafficDestination {
  ip: string;
  port?: number;
  mac?: string;
  hostname?: string;
  bytes: number;
  packets: number;
  flows: number;
}

// 플로우 정의 (5-tuple: 소스 IP, 소스 포트, 목적지 IP, 목적지 포트, 프로토콜)
export interface Flow {
  id: string;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: Protocol;
  status: FlowStatus;
  packets: number;
  bytes: number;
  startTime: number; // Unix timestamp (ms)
  endTime?: number; // Unix timestamp (ms)
  duration?: number; // ms
  tcpFlags?: TcpFlags;
  application?: string; // HTTP, SSH, DNS 등
  vlanId?: number;
  metadata?: {
    [key: string]: any;
  };
}

// 시간대별 데이터
export interface TimeSeriesData {
  timestamp: number; // Unix timestamp (ms)
  value: number;
  label?: string;
}

// 프로토콜별 트래픽 통계
export interface ProtocolStats {
  protocol: Protocol;
  bytes: number;
  packets: number;
  flows: number;
  percentage: number;
}

// 애플리케이션별 트래픽 통계
export interface ApplicationStats {
  application: string;
  protocol: Protocol;
  bytes: number;
  packets: number;
  flows: number;
  rank?: number;
}

// 시간대별 트래픽 패턴 (히트맵 데이터)
export interface TrafficPattern {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (0: Sunday)
  bytes: number;
  packets: number;
  label?: string; // '월요일 09:00' 등
}

// 트래픽 분석 필터
export interface TrafficFilter {
  protocols?: Protocol[];
  sourceIpRange?: string; // CIDR notation (예: 192.168.1.0/24)
  destinationIpRange?: string;
  timeRange?: {
    start: number; // Unix timestamp (ms)
    end: number;
  };
  minBytes?: number;
  maxBytes?: number;
  applications?: string[];
  vlanIds?: number[];
}

// 트래픽 분석 데이터
export interface TrafficAnalysis {
  topSources: TrafficSource[];
  topDestinations: TrafficDestination[];
  protocolDistribution: ProtocolStats[];
  applicationRanking: ApplicationStats[];
  timeSeriesData: TimeSeriesData[];
  trafficPatterns: TrafficPattern[];
  totalBytes: number;
  totalPackets: number;
  totalFlows: number;
  peakTime?: number; // Unix timestamp (ms)
  peakBytesPerSecond?: number;
}

// 활성 플로우 목록 페이징
export interface FlowListParams {
  page: number;
  pageSize: number;
  sortBy?: keyof Flow;
  sortOrder?: 'asc' | 'desc';
  filter?: TrafficFilter;
}

// 플로우 목록 응답
export interface FlowListResponse {
  flows: Flow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 플로우 경로 정보
export interface FlowPath {
  flowId: string;
  path: Array<{
    deviceId: string;
    deviceName: string;
    deviceType: 'switch' | 'router' | 'firewall' | 'host';
    inPort?: number;
    outPort?: number;
    timestamp: number;
  }>;
}

// 시간 범위 옵션
export type TimeRangeOption = '1h' | '6h' | '24h' | '7d' | 'custom';

// 자동 새로고침 간격
export type RefreshInterval = 'off' | '10s' | '30s' | '1m' | '5m';

// 트래픽 분석 뷰 옵션
export interface TrafficViewOptions {
  timeRange: TimeRangeOption;
  customTimeRange?: {
    start: Date;
    end: Date;
  };
  autoRefresh: boolean;
  refreshInterval: RefreshInterval;
  selectedProtocols: Protocol[];
  selectedApplications: string[];
}

// ===== Zod 스키마 정의 =====

// TCP 플래그 스키마
export const TcpFlagsSchema = z.object({
  syn: z.boolean().optional(),
  ack: z.boolean().optional(),
  fin: z.boolean().optional(),
  rst: z.boolean().optional(),
  psh: z.boolean().optional(),
  urg: z.boolean().optional(),
});

// 프로토콜 스키마
export const ProtocolSchema = z.enum([
  'TCP',
  'UDP',
  'ICMP',
  'HTTP',
  'HTTPS',
  'SSH',
  'DNS',
  'FTP',
  'TELNET',
  'OTHER',
]);

// 플로우 상태 스키마
export const FlowStatusSchema = z.enum(['active', 'closed', 'idle']);

// 트래픽 소스 스키마
export const TrafficSourceSchema = z.object({
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  port: z.number().int().min(0).max(65535).optional(),
  mac: z.string().optional(),
  hostname: z.string().optional(),
  bytes: z.number().int().min(0),
  packets: z.number().int().min(0),
  flows: z.number().int().min(0),
});

// 트래픽 목적지 스키마
export const TrafficDestinationSchema = z.object({
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  port: z.number().int().min(0).max(65535).optional(),
  mac: z.string().optional(),
  hostname: z.string().optional(),
  bytes: z.number().int().min(0),
  packets: z.number().int().min(0),
  flows: z.number().int().min(0),
});

// 플로우 스키마
export const FlowSchema = z.object({
  id: z.string(),
  sourceIp: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  sourcePort: z.number().int().min(0).max(65535),
  destinationIp: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  destinationPort: z.number().int().min(0).max(65535),
  protocol: ProtocolSchema,
  status: FlowStatusSchema,
  packets: z.number().int().min(0),
  bytes: z.number().int().min(0),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive().optional(),
  duration: z.number().int().min(0).optional(),
  tcpFlags: TcpFlagsSchema.optional(),
  application: z.string().optional(),
  vlanId: z.number().int().min(1).max(4094).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// 시간대별 데이터 스키마
export const TimeSeriesDataSchema = z.object({
  timestamp: z.number().int().positive(),
  value: z.number().min(0),
  label: z.string().optional(),
});

// 프로토콜별 통계 스키마
export const ProtocolStatsSchema = z.object({
  protocol: ProtocolSchema,
  bytes: z.number().int().min(0),
  packets: z.number().int().min(0),
  flows: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
});

// 애플리케이션별 통계 스키마
export const ApplicationStatsSchema = z.object({
  application: z.string(),
  protocol: ProtocolSchema,
  bytes: z.number().int().min(0),
  packets: z.number().int().min(0),
  flows: z.number().int().min(0),
  rank: z.number().int().positive().optional(),
});

// 트래픽 패턴 스키마
export const TrafficPatternSchema = z.object({
  hour: z.number().int().min(0).max(23),
  dayOfWeek: z.number().int().min(0).max(6),
  bytes: z.number().int().min(0),
  packets: z.number().int().min(0),
  label: z.string().optional(),
});

// 트래픽 필터 스키마
export const TrafficFilterSchema = z.object({
  protocols: z.array(ProtocolSchema).optional(),
  sourceIpRange: z.string().optional(),
  destinationIpRange: z.string().optional(),
  timeRange: z
    .object({
      start: z.number().int().positive(),
      end: z.number().int().positive(),
    })
    .optional(),
  minBytes: z.number().int().min(0).optional(),
  maxBytes: z.number().int().min(0).optional(),
  applications: z.array(z.string()).optional(),
  vlanIds: z.array(z.number().int().min(1).max(4094)).optional(),
});

// 트래픽 분석 데이터 스키마
export const TrafficAnalysisSchema = z.object({
  topSources: z.array(TrafficSourceSchema),
  topDestinations: z.array(TrafficDestinationSchema),
  protocolDistribution: z.array(ProtocolStatsSchema),
  applicationRanking: z.array(ApplicationStatsSchema),
  timeSeriesData: z.array(TimeSeriesDataSchema),
  trafficPatterns: z.array(TrafficPatternSchema),
  totalBytes: z.number().int().min(0),
  totalPackets: z.number().int().min(0),
  totalFlows: z.number().int().min(0),
  peakTime: z.number().int().positive().optional(),
  peakBytesPerSecond: z.number().min(0).optional(),
});

// 플로우 목록 파라미터 스키마
export const FlowListParamsSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(1000),
  sortBy: z
    .enum([
      'id',
      'sourceIp',
      'sourcePort',
      'destinationIp',
      'destinationPort',
      'protocol',
      'status',
      'packets',
      'bytes',
      'startTime',
      'endTime',
      'duration',
    ])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  filter: TrafficFilterSchema.optional(),
});

// 플로우 목록 응답 스키마
export const FlowListResponseSchema = z.object({
  flows: z.array(FlowSchema),
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().min(0),
});

// 플로우 경로 스키마
export const FlowPathSchema = z.object({
  flowId: z.string(),
  path: z.array(
    z.object({
      deviceId: z.string(),
      deviceName: z.string(),
      deviceType: z.enum(['switch', 'router', 'firewall', 'host']),
      inPort: z.number().int().min(0).optional(),
      outPort: z.number().int().min(0).optional(),
      timestamp: z.number().int().positive(),
    })
  ),
});

// 시간 범위 옵션 스키마
export const TimeRangeOptionSchema = z.enum(['1h', '6h', '24h', '7d', 'custom']);

// 자동 새로고침 간격 스키마
export const RefreshIntervalSchema = z.enum(['off', '10s', '30s', '1m', '5m']);

// 트래픽 뷰 옵션 스키마
export const TrafficViewOptionsSchema = z.object({
  timeRange: TimeRangeOptionSchema,
  customTimeRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  autoRefresh: z.boolean(),
  refreshInterval: RefreshIntervalSchema,
  selectedProtocols: z.array(ProtocolSchema),
  selectedApplications: z.array(z.string()),
});
