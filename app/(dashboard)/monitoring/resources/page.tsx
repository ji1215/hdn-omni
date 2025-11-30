'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TimeRangeSelector } from '@/components/monitoring/charts/TimeRangeSelector';
import { ExportButtons } from '@/components/monitoring/charts/ExportButtons';

// 차트 컴포넌트들을 동적 import로 변경 (무거운 recharts 라이브러리)
const ChartLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const CPUChart = dynamic(
  () => import('@/components/monitoring/charts/CPUChart').then(mod => ({ default: mod.CPUChart })),
  { loading: ChartLoadingFallback, ssr: false }
);

const MemoryChart = dynamic(
  () => import('@/components/monitoring/charts/MemoryChart').then(mod => ({ default: mod.MemoryChart })),
  { loading: ChartLoadingFallback, ssr: false }
);

const DiskChart = dynamic(
  () => import('@/components/monitoring/charts/DiskChart').then(mod => ({ default: mod.DiskChart })),
  { loading: ChartLoadingFallback, ssr: false }
);

const NetworkChart = dynamic(
  () => import('@/components/monitoring/charts/NetworkChart').then(mod => ({ default: mod.NetworkChart })),
  { loading: ChartLoadingFallback, ssr: false }
);
import { useInterval } from '@/hooks/useInterval';
import {
  generateMockCPUData,
  generateMockMemoryData,
  generateMockDiskData,
  generateMockNetworkData,
} from '@/lib/utils/chartUtils';
import type { TimeRange } from '@/types/chart';
import { Cpu, HardDrive, Network, MemoryStick, RefreshCw } from 'lucide-react';
import useStore from '@/store/useStore';
import { Button } from '@/components/common';

export default function ResourceMonitoringPage() {
  const theme = useStore((state) => state.theme);
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [cpuData, setCpuData] = useState(() => generateMockCPUData(20));
  const [memoryData, setMemoryData] = useState(() => generateMockMemoryData());
  const [diskData, setDiskData] = useState(() => generateMockDiskData(20));
  const [networkData, setNetworkData] = useState(() => generateMockNetworkData(20));
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 실시간 데이터 갱신 (5초 간격)
  useInterval(
    () => {
      const now = Date.now();

      // CPU 데이터 갱신
      setCpuData(prev => {
        const newData = [...prev, {
          timestamp: now,
          usage: Math.random() * 100,
        }];
        return newData.slice(-100); // 최대 100개 데이터 포인트 유지
      });

      // 메모리 데이터 갱신
      setMemoryData(generateMockMemoryData());

      // 디스크 데이터 갱신
      setDiskData(prev => {
        const newData = [...prev, {
          timestamp: now,
          readIO: Math.random() * 500,
          writeIO: Math.random() * 300,
          usage: Math.random() * 40 + 40,
        }];
        return newData.slice(-100);
      });

      // 네트워크 데이터 갱신
      setNetworkData(prev => {
        const newData = [...prev, {
          timestamp: now,
          sent: Math.random() * 1000,
          received: Math.random() * 1500,
        }];
        return newData.slice(-100);
      });

      setLastUpdated(new Date());
    },
    isAutoRefresh ? 5000 : null
  );

  const handleManualRefresh = () => {
    // 수동 새로고침
    setCpuData(generateMockCPUData(20));
    setMemoryData(generateMockMemoryData());
    setDiskData(generateMockDiskData(20));
    setNetworkData(generateMockNetworkData(20));
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              리소스 모니터링
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              실시간 시스템 리소스 사용량 및 성능 모니터링
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              마지막 업데이트: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              onClick={handleManualRefresh}
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              새로고침
            </Button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                자동 새로고침 (5초)
              </span>
            </label>
          </div>
        </div>

        {/* 시간 범위 선택기 */}
        <div className="flex items-center justify-between">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CPU 사용률 차트 */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                CPU 사용률
              </h2>
            </div>
            <ExportButtons data={cpuData} filename="cpu_usage" />
          </div>
          <div className="h-80">
            <CPUChart data={cpuData} timeRange={timeRange} isDark={theme === 'dark'} />
          </div>
        </div>

        {/* 메모리 사용량 차트 */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                메모리 사용량
              </h2>
            </div>
          </div>
          <div className="h-80">
            <MemoryChart data={memoryData} isDark={theme === 'dark'} />
          </div>
        </div>

        {/* 디스크 I/O 차트 */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                디스크 I/O 및 사용량
              </h2>
            </div>
            <ExportButtons data={diskData} filename="disk_io" />
          </div>
          <div className="h-80">
            <DiskChart data={diskData} timeRange={timeRange} isDark={theme === 'dark'} />
          </div>
        </div>

        {/* 네트워크 트래픽 차트 */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                네트워크 송수신
              </h2>
            </div>
            <ExportButtons data={networkData} filename="network_traffic" />
          </div>
          <div className="h-80">
            <NetworkChart data={networkData} timeRange={timeRange} isDark={theme === 'dark'} />
          </div>
        </div>
      </div>
    </div>
  );
}
