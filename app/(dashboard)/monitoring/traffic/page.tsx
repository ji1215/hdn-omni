'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ApplicationRankingTable } from '@/components/monitoring/ApplicationRankingTable';
import { ActiveFlowsTable } from '@/components/monitoring/ActiveFlowsTable';
import { FlowDetailModal } from '@/components/monitoring/FlowDetailModal';
import { FlowExportButton } from '@/components/monitoring/FlowExportButton';
import { TrafficViewControls } from '@/components/monitoring/TrafficViewControls';

// 차트 컴포넌트들을 동적 import
const ChartLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const TopTrafficBarChart = dynamic(
  () => import('@/components/monitoring/charts').then(mod => ({ default: mod.TopTrafficBarChart })),
  { loading: ChartLoadingFallback, ssr: false }
);

const ProtocolPieChart = dynamic(
  () => import('@/components/monitoring/charts').then(mod => ({ default: mod.ProtocolPieChart })),
  { loading: ChartLoadingFallback, ssr: false }
);

const TrafficPatternChart = dynamic(
  () => import('@/components/monitoring/charts').then(mod => ({ default: mod.TrafficPatternChart })),
  { loading: ChartLoadingFallback, ssr: false }
);
import useStore from '@/store/useStore';
import type {
  TrafficSource,
  TrafficDestination,
  ProtocolStats,
  TimeSeriesData,
  ApplicationStats,
  Flow,
  TrafficViewOptions,
} from '@/types/traffic';

// 목 데이터 생성 함수 (실제로는 API에서 가져올 데이터)
const generateMockData = () => {
  const now = Date.now();

  // Top 트래픽 소스
  const topSources: TrafficSource[] = Array.from({ length: 15 }, (_, i) => ({
    ip: `192.168.1.${i + 10}`,
    hostname: `host-${i + 1}`,
    bytes: Math.floor(Math.random() * 10000000000),
    packets: Math.floor(Math.random() * 1000000),
    flows: Math.floor(Math.random() * 1000),
  }));

  // Top 트래픽 목적지
  const topDestinations: TrafficDestination[] = Array.from({ length: 15 }, (_, i) => ({
    ip: `10.0.${i + 1}.${Math.floor(Math.random() * 255)}`,
    hostname: `server-${i + 1}`,
    bytes: Math.floor(Math.random() * 10000000000),
    packets: Math.floor(Math.random() * 1000000),
    flows: Math.floor(Math.random() * 1000),
  }));

  // 프로토콜별 통계
  const protocolStats: ProtocolStats[] = [
    {
      protocol: 'TCP',
      bytes: 15000000000,
      packets: 2000000,
      flows: 5000,
      percentage: 60,
    },
    {
      protocol: 'UDP',
      bytes: 6250000000,
      packets: 800000,
      flows: 2000,
      percentage: 25,
    },
    {
      protocol: 'ICMP',
      bytes: 2500000000,
      packets: 300000,
      flows: 500,
      percentage: 10,
    },
    { protocol: 'HTTP', bytes: 1250000000, packets: 150000, flows: 300, percentage: 5 },
  ];

  // 시간대별 데이터
  const timeSeriesData: TimeSeriesData[] = Array.from({ length: 24 }, (_, i) => ({
    timestamp: now - (24 - i) * 3600000,
    value: Math.floor(Math.random() * 5000000000) + 1000000000,
    label: `${i}시`,
  }));

  // 애플리케이션별 통계
  const applicationStats: ApplicationStats[] = [
    {
      application: 'HTTP',
      protocol: 'TCP',
      bytes: 8000000000,
      packets: 1000000,
      flows: 2000,
    },
    {
      application: 'HTTPS',
      protocol: 'TCP',
      bytes: 6000000000,
      packets: 800000,
      flows: 1500,
    },
    {
      application: 'SSH',
      protocol: 'TCP',
      bytes: 3000000000,
      packets: 400000,
      flows: 800,
    },
    {
      application: 'DNS',
      protocol: 'UDP',
      bytes: 2500000000,
      packets: 350000,
      flows: 600,
    },
    {
      application: 'FTP',
      protocol: 'TCP',
      bytes: 2000000000,
      packets: 250000,
      flows: 400,
    },
  ];

  // 활성 플로우
  const flows: Flow[] = Array.from({ length: 50 }, (_, i) => ({
    id: `flow-${i + 1}`,
    sourceIp: `192.168.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
    sourcePort: Math.floor(Math.random() * 60000) + 1024,
    destinationIp: `10.0.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
    destinationPort: [80, 443, 22, 21, 53][Math.floor(Math.random() * 5)],
    protocol: ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 5)] as any,
    status: ['active', 'closed', 'idle'][Math.floor(Math.random() * 3)] as any,
    packets: Math.floor(Math.random() * 100000),
    bytes: Math.floor(Math.random() * 100000000),
    startTime: now - Math.floor(Math.random() * 3600000),
    application: ['HTTP', 'HTTPS', 'SSH', 'DNS', 'FTP'][Math.floor(Math.random() * 5)],
  }));

  return {
    topSources,
    topDestinations,
    protocolStats,
    timeSeriesData,
    applicationStats,
    flows,
  };
};

export default function TrafficAnalysisPage() {
  const theme = useStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewOptions, setViewOptions] = useState<TrafficViewOptions>({
    timeRange: '24h',
    autoRefresh: true,
    refreshInterval: '30s',
    selectedProtocols: [],
    selectedApplications: [],
  });

  const mockData = generateMockData();

  const handleFlowClick = (flow: Flow) => {
    setSelectedFlow(flow);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold mb-2">트래픽 분석 및 플로우 모니터링</h1>
        <p className="text-gray-600 dark:text-gray-400">
          실시간 네트워크 트래픽 분석, 프로토콜 분포, 플로우 추적
        </p>
      </div>

      {/* 뷰 컨트롤 */}
      <TrafficViewControls
        options={viewOptions}
        onChange={setViewOptions}
        isDark={isDark}
      />

      {/* 차트 그리드 - 첫 번째 행 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 소스 차트 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Top 10 트래픽 소스</h2>
          <div className="h-96">
            <TopTrafficBarChart
              data={mockData.topSources}
              type="source"
              isDark={isDark}
              maxItems={10}
            />
          </div>
        </div>

        {/* 프로토콜 파이 차트 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">프로토콜별 트래픽 분포</h2>
          <div className="h-96">
            <ProtocolPieChart
              data={mockData.protocolStats}
              isDark={isDark}
              showLabels={true}
              showLegend={true}
            />
          </div>
        </div>
      </div>

      {/* 차트 그리드 - 두 번째 행 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 시간대별 패턴 차트 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">시간대별 트래픽 패턴</h2>
          <div className="h-80">
            <TrafficPatternChart
              data={mockData.timeSeriesData}
              isDark={isDark}
              showGradient={true}
              timeRange={viewOptions.timeRange === 'custom' ? '24h' : viewOptions.timeRange}
            />
          </div>
        </div>

        {/* 애플리케이션 순위 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">애플리케이션별 트래픽 순위</h2>
          <div className="h-80">
            <ApplicationRankingTable
              data={mockData.applicationStats}
              isDark={isDark}
              pageSize={10}
            />
          </div>
        </div>
      </div>

      {/* 활성 플로우 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">활성 플로우 목록</h2>
          <FlowExportButton flows={mockData.flows} isDark={isDark} />
        </div>
        <div className="h-[600px]">
          <ActiveFlowsTable
            flows={mockData.flows}
            isDark={isDark}
            pageSize={20}
            onFlowClick={handleFlowClick}
          />
        </div>
      </div>

      {/* 플로우 상세 모달 */}
      <FlowDetailModal
        flow={selectedFlow}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFlow(null);
        }}
        isDark={isDark}
      />
    </div>
  );
}
