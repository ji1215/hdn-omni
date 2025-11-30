export type TrendDirection = 'up' | 'down' | 'neutral';

export type StatusLevel = 'success' | 'warning' | 'error';

export type TimeRange = '1h' | '6h' | '24h';

export interface KPIData {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  previousValue?: number;
  change?: number; // 백분율 변화
  trend?: TrendDirection;
  status?: StatusLevel;
  icon?: 'device' | 'network' | 'host' | 'traffic' | 'availability' | 'response-time';
  threshold?: {
    warning: number;
    error: number;
  };
}

export interface DashboardMetrics {
  activeDevices: KPIData;
  activeRate: KPIData;
  totalHosts: KPIData;
  networkTraffic: KPIData;
  availability: KPIData;
  avgResponseTime: KPIData;
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  timeRange: TimeRange;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
