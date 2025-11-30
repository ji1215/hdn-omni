/**
 * 포트 관련 타입 정의
 */

// 포트 상태 타입
export type PortStatus = 'up' | 'down' | 'disabled';

// 포트 속도 타입
export type PortSpeed = '10M' | '100M' | '1G' | '10G' | '40G' | '100G';

// 포트 이중화 모드
export type DuplexMode = 'full' | 'half' | 'auto';

// 포트 트래픽 통계
export interface PortTrafficStats {
  txPackets: number;      // 송신 패킷 수
  rxPackets: number;      // 수신 패킷 수
  txBytes: number;        // 송신 바이트
  rxBytes: number;        // 수신 바이트
  errors: number;         // 에러 카운터
  drops: number;          // 드롭 카운터
  utilization: number;    // 사용률 (%)
}

// 포트 인터페이스
export interface Port {
  id: string;
  name: string;
  deviceId: string;
  deviceName: string;
  status: PortStatus;
  speed: PortSpeed;
  duplex: DuplexMode;
  vlanId?: number;
  description?: string;
  macAddress: string;
  mtu: number;
  enabled: boolean;
  traffic: PortTrafficStats;
  lastChange?: string;
  uptime?: number;
  createdAt: string;
  updatedAt: string;
}

// 포트 구성 요청 타입
export interface UpdatePortRequest {
  status?: PortStatus;
  speed?: PortSpeed;
  duplex?: DuplexMode;
  vlanId?: number;
  description?: string;
  enabled?: boolean;
  mtu?: number;
}

// 포트 필터 타입
export interface PortFilters {
  status?: PortStatus | 'all';
  speed?: PortSpeed | 'all';
  deviceId?: string;
  search?: string;
}

// 포트 통계 요약
export interface PortStatsSummary {
  total: number;
  active: number;
  inactive: number;
  errors: number;
}

// 포트 상태 표시 이름 매핑
export const PortStatusLabels: Record<PortStatus, string> = {
  up: '활성',
  down: '비활성',
  disabled: '비활성화됨',
};

// 포트 상태 색상 매핑 (Tailwind 클래스)
export const PortStatusColors: Record<PortStatus, string> = {
  up: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  down: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  disabled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

// 포트 속도 라벨
export const PortSpeedLabels: Record<PortSpeed, string> = {
  '10M': '10 Mbps',
  '100M': '100 Mbps',
  '1G': '1 Gbps',
  '10G': '10 Gbps',
  '40G': '40 Gbps',
  '100G': '100 Gbps',
};

// 이중화 모드 라벨
export const DuplexModeLabels: Record<DuplexMode, string> = {
  full: 'Full-Duplex',
  half: 'Half-Duplex',
  auto: 'Auto',
};
