import { create } from 'zustand';
import { DashboardState, DashboardMetrics, TimeRange, TrendDirection, StatusLevel } from '@/types/dashboard';

interface DashboardActions {
  setTimeRange: (range: TimeRange) => void;
  refreshMetrics: () => Promise<void>;
  setMetrics: (metrics: DashboardMetrics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type DashboardStore = DashboardState & DashboardActions;

// 임계값 기반 상태 결정 함수
const getStatusByThreshold = (value: number, threshold?: { warning: number; error: number }): StatusLevel => {
  if (!threshold) return 'success';
  if (value >= threshold.error) return 'error';
  if (value >= threshold.warning) return 'warning';
  return 'success';
};

// 트렌드 방향 결정 함수
const getTrend = (current: number, previous?: number): TrendDirection => {
  if (!previous) return 'neutral';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
};

// 변화율 계산 함수
const getChangePercent = (current: number, previous?: number): number => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// 모의 데이터 생성 함수 (5초마다 업데이트)
const generateMockMetrics = (timeRange: TimeRange): DashboardMetrics => {
  // 시간 범위에 따라 다른 데이터 범위 설정
  const multiplier = timeRange === '1h' ? 1 : timeRange === '6h' ? 1.2 : 1.5;

  const baseDevices = 24;
  const deviceVariation = Math.floor(Math.random() * 5 - 2); // -2 ~ +2
  const activeDevices = baseDevices + deviceVariation;
  const prevActiveDevices = baseDevices + Math.floor(Math.random() * 5 - 2);

  const baseActiveRate = 85;
  const activeRateVariation = Math.random() * 10 - 5; // -5 ~ +5
  const activeRate = Math.max(0, Math.min(100, baseActiveRate + activeRateVariation));
  const prevActiveRate = Math.max(0, Math.min(100, baseActiveRate + Math.random() * 10 - 5));

  const baseHosts = 142;
  const hostsVariation = Math.floor(Math.random() * 20 - 10);
  const totalHosts = baseHosts + hostsVariation;
  const prevTotalHosts = baseHosts + Math.floor(Math.random() * 20 - 10);

  const baseTraffic = 856 * multiplier;
  const trafficVariation = Math.random() * 200 - 100;
  const networkTraffic = Math.max(0, baseTraffic + trafficVariation);
  const prevNetworkTraffic = Math.max(0, baseTraffic + Math.random() * 200 - 100);

  const baseAvailability = 99.5;
  const availabilityVariation = Math.random() * 2 - 1; // -1 ~ +1
  const availability = Math.max(0, Math.min(100, baseAvailability + availabilityVariation));
  const prevAvailability = Math.max(0, Math.min(100, baseAvailability + Math.random() * 2 - 1));

  const baseResponseTime = 12;
  const responseTimeVariation = Math.random() * 8 - 4; // -4 ~ +4
  const avgResponseTime = Math.max(1, baseResponseTime + responseTimeVariation);
  const prevAvgResponseTime = Math.max(1, baseResponseTime + Math.random() * 8 - 4);

  return {
    activeDevices: {
      id: 'active-devices',
      title: '활성 디바이스',
      value: activeDevices,
      unit: '대',
      previousValue: prevActiveDevices,
      change: getChangePercent(activeDevices, prevActiveDevices),
      trend: getTrend(activeDevices, prevActiveDevices),
      status: 'success',
      icon: 'device',
    },
    activeRate: {
      id: 'active-rate',
      title: '활성율',
      value: activeRate.toFixed(1),
      unit: '%',
      previousValue: prevActiveRate,
      change: getChangePercent(activeRate, prevActiveRate),
      trend: getTrend(activeRate, prevActiveRate),
      status: getStatusByThreshold(100 - activeRate, { warning: 20, error: 30 }),
      icon: 'network',
      threshold: { warning: 20, error: 30 },
    },
    totalHosts: {
      id: 'total-hosts',
      title: '호스트 수',
      value: totalHosts,
      unit: '개',
      previousValue: prevTotalHosts,
      change: getChangePercent(totalHosts, prevTotalHosts),
      trend: getTrend(totalHosts, prevTotalHosts),
      status: 'success',
      icon: 'host',
    },
    networkTraffic: {
      id: 'network-traffic',
      title: '네트워크 트래픽',
      value: networkTraffic.toFixed(0),
      unit: 'Mbps',
      previousValue: prevNetworkTraffic,
      change: getChangePercent(networkTraffic, prevNetworkTraffic),
      trend: getTrend(networkTraffic, prevNetworkTraffic),
      status: getStatusByThreshold(networkTraffic, { warning: 800, error: 1000 }),
      icon: 'traffic',
      threshold: { warning: 800, error: 1000 },
    },
    availability: {
      id: 'availability',
      title: '가용성',
      value: availability.toFixed(2),
      unit: '%',
      previousValue: prevAvailability,
      change: getChangePercent(availability, prevAvailability),
      trend: getTrend(availability, prevAvailability),
      status: getStatusByThreshold(100 - availability, { warning: 1, error: 3 }),
      icon: 'availability',
      threshold: { warning: 1, error: 3 },
    },
    avgResponseTime: {
      id: 'avg-response-time',
      title: '평균 응답시간',
      value: avgResponseTime.toFixed(1),
      unit: 'ms',
      previousValue: prevAvgResponseTime,
      change: getChangePercent(avgResponseTime, prevAvgResponseTime),
      trend: getTrend(avgResponseTime, prevAvgResponseTime),
      status: getStatusByThreshold(avgResponseTime, { warning: 15, error: 20 }),
      icon: 'response-time',
      threshold: { warning: 15, error: 20 },
    },
  };
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  metrics: null,
  timeRange: '1h',
  isLoading: false,
  error: null,
  lastUpdated: null,

  setTimeRange: (range: TimeRange) => {
    set({ timeRange: range });
    // 시간 범위 변경 시 메트릭 새로고침
    get().refreshMetrics();
  },

  refreshMetrics: async () => {
    set({ isLoading: true, error: null });

    try {
      // 실제 환경에서는 API 호출
      // const response = await fetch('/api/dashboard/metrics?range=' + get().timeRange);
      // const data = await response.json();

      // 모의 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 300)); // 네트워크 지연 시뮬레이션

      const metrics = generateMockMetrics(get().timeRange);

      set({
        metrics,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다.',
      });
    }
  },

  setMetrics: (metrics: DashboardMetrics) => {
    set({ metrics, lastUpdated: new Date() });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
