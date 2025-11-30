import { z } from 'zod';

// 디바이스 상태
export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';

// 디바이스 프로토콜
export type DeviceProtocol = 'ssh' | 'telnet' | 'snmp' | 'netconf';

// 디바이스 제조사
export type DeviceManufacturer = 'cisco' | 'juniper' | 'huawei' | 'arista' | 'hp' | 'dell' | 'other';

// 펌웨어 업그레이드 상태
export type UpgradeStatus = 'idle' | 'downloading' | 'verifying' | 'installing' | 'rebooting' | 'completed' | 'failed';

// 디바이스 인터페이스
export interface DeviceInterface {
  name: string;
  ip?: string;
  mac?: string;
  status: 'up' | 'down' | 'admin-down';
  speed?: number; // Mbps
  duplex?: 'full' | 'half';
  mtu?: number;
  vlan?: number;
}

// 디바이스 통계
export interface DeviceStats {
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage?: number; // percentage
  uptime: number; // seconds
  trafficIn: number; // bytes/sec
  trafficOut: number; // bytes/sec
}

// 디바이스 기본 정보
export interface Device {
  id: string;
  hostname: string;
  ip: string;
  port: number;
  protocol: DeviceProtocol;
  manufacturer: DeviceManufacturer;
  model: string;
  firmwareVersion: string;
  serialNumber?: string;
  status: DeviceStatus;
  lastCommunication: number; // Unix timestamp (ms)
  location?: string;
  description?: string;
  groupId?: string;
  interfaces?: DeviceInterface[];
  stats?: DeviceStats;
  metadata?: {
    [key: string]: any;
  };
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
}

// 디바이스 자격증명
export interface DeviceCredentials {
  username: string;
  password: string;
  enablePassword?: string; // For Cisco devices
}

// 디바이스 추가 요청
export interface AddDeviceRequest {
  hostname: string;
  ip: string;
  port: number;
  protocol: DeviceProtocol;
  credentials: DeviceCredentials;
  manufacturer?: DeviceManufacturer;
  model?: string;
  location?: string;
  description?: string;
  groupId?: string;
}

// 디바이스 업데이트 요청
export interface UpdateDeviceRequest {
  hostname?: string;
  location?: string;
  description?: string;
  groupId?: string;
}

// 디바이스 연결 테스트 결과
export interface DeviceConnectionTest {
  success: boolean;
  message: string;
  latency?: number; // ms
  deviceInfo?: {
    manufacturer?: string;
    model?: string;
    firmwareVersion?: string;
  };
}

// 디바이스 그룹
export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  deviceCount: number;
  createdAt: number;
  updatedAt: number;
}

// 디바이스 그룹 생성 요청
export interface CreateGroupRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

// 펌웨어 버전
export interface FirmwareVersion {
  version: string;
  releaseDate: string;
  fileSize: number; // bytes
  checksum: string;
  releaseNotes?: string;
  compatibility: string[]; // device models
}

// 백업 파일
export interface BackupFile {
  id: string;
  deviceId: string;
  filename: string;
  size: number; // bytes
  createdAt: number;
  description?: string;
}

// 디바이스 작업 타입
export type DeviceActionType = 'reboot' | 'backup' | 'restore' | 'upgrade' | 'test-connection';

// 디바이스 작업 요청
export interface DeviceActionRequest {
  action: DeviceActionType;
  params?: {
    backupId?: string; // for restore
    firmwareVersion?: string; // for upgrade
    performBackup?: boolean; // for upgrade
  };
}

// 디바이스 작업 결과
export interface DeviceActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// 일괄 작업 요청
export interface BatchActionRequest {
  deviceIds: string[];
  action: DeviceActionType;
  params?: any;
}

// 일괄 작업 결과
export interface BatchActionResult {
  totalDevices: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    deviceId: string;
    success: boolean;
    message: string;
  }>;
}

// 펌웨어 업그레이드 진행 상태
export interface UpgradeProgress {
  deviceId: string;
  status: UpgradeStatus;
  progress: number; // 0-100
  currentStep: string;
  message?: string;
  error?: string;
}

// 디바이스 필터
export interface DeviceFilter {
  statuses?: DeviceStatus[];
  manufacturers?: DeviceManufacturer[];
  ipRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
  groupId?: string;
}

// 디바이스 정렬
export interface DeviceSort {
  field: keyof Device;
  order: 'asc' | 'desc';
}

// 디바이스 목록 요청 파라미터
export interface GetDevicesParams {
  page?: number;
  pageSize?: number;
  filter?: DeviceFilter;
  sort?: DeviceSort;
}

// 디바이스 목록 응답
export interface GetDevicesResponse {
  devices: Device[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 디바이스 로그
export interface DeviceLog {
  id: string;
  deviceId: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
}

// ===== Zod 스키마 정의 =====

// 디바이스 상태 스키마
export const DeviceStatusSchema = z.enum(['online', 'offline', 'error', 'maintenance']);

// 디바이스 프로토콜 스키마
export const DeviceProtocolSchema = z.enum(['ssh', 'telnet', 'snmp', 'netconf']);

// 디바이스 제조사 스키마
export const DeviceManufacturerSchema = z.enum([
  'cisco',
  'juniper',
  'huawei',
  'arista',
  'hp',
  'dell',
  'other',
]);

// 디바이스 인터페이스 스키마
export const DeviceInterfaceSchema = z.object({
  name: z.string(),
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/).optional(),
  mac: z.string().optional(),
  status: z.enum(['up', 'down', 'admin-down']),
  speed: z.number().positive().optional(),
  duplex: z.enum(['full', 'half']).optional(),
  mtu: z.number().positive().optional(),
  vlan: z.number().int().min(1).max(4094).optional(),
});

// 디바이스 통계 스키마
export const DeviceStatsSchema = z.object({
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  diskUsage: z.number().min(0).max(100).optional(),
  uptime: z.number().int().min(0),
  trafficIn: z.number().min(0),
  trafficOut: z.number().min(0),
});

// 디바이스 스키마
export const DeviceSchema = z.object({
  id: z.string(),
  hostname: z.string().min(1),
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  port: z.number().int().min(1).max(65535),
  protocol: DeviceProtocolSchema,
  manufacturer: DeviceManufacturerSchema,
  model: z.string(),
  firmwareVersion: z.string(),
  serialNumber: z.string().optional(),
  status: DeviceStatusSchema,
  lastCommunication: z.number().int().positive(),
  location: z.string().optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  interfaces: z.array(DeviceInterfaceSchema).optional(),
  stats: DeviceStatsSchema.optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

// 디바이스 자격증명 스키마
export const DeviceCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  enablePassword: z.string().optional(),
});

// 디바이스 추가 요청 스키마
export const AddDeviceRequestSchema = z.object({
  hostname: z.string().min(1, '호스트명을 입력하세요'),
  ip: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, '유효한 IP 주소를 입력하세요'),
  port: z.number().int().min(1).max(65535, '포트는 1-65535 범위여야 합니다'),
  protocol: DeviceProtocolSchema,
  credentials: DeviceCredentialsSchema,
  manufacturer: DeviceManufacturerSchema.optional(),
  model: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
});

// 디바이스 그룹 스키마
export const DeviceGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  deviceCount: z.number().int().min(0),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

// 디바이스 그룹 생성 요청 스키마
export const CreateGroupRequestSchema = z.object({
  name: z.string().min(1, '그룹명을 입력하세요'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

// 펌웨어 버전 스키마
export const FirmwareVersionSchema = z.object({
  version: z.string(),
  releaseDate: z.string(),
  fileSize: z.number().int().positive(),
  checksum: z.string(),
  releaseNotes: z.string().optional(),
  compatibility: z.array(z.string()),
});

// 백업 파일 스키마
export const BackupFileSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  filename: z.string(),
  size: z.number().int().positive(),
  createdAt: z.number().int().positive(),
  description: z.string().optional(),
});

// 디바이스 필터 스키마
export const DeviceFilterSchema = z.object({
  statuses: z.array(DeviceStatusSchema).optional(),
  manufacturers: z.array(DeviceManufacturerSchema).optional(),
  ipRange: z
    .object({
      start: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
      end: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/),
    })
    .optional(),
  searchQuery: z.string().optional(),
  groupId: z.string().optional(),
});
