'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { KPICard } from '@/components/dashboard/KPICard';
import { DashboardSkeleton } from '@/components/dashboard/CardSkeleton';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const {
    metrics,
    timeRange,
    isLoading,
    error,
    lastUpdated,
    setTimeRange,
    refreshMetrics,
  } = useDashboardStore();

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  // 5초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, 5000); // 5초 간격

    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          네트워크 상태 및 주요 지표를 실시간으로 확인하세요
        </p>
      </div>

      {/* 대시보드 컨트롤 */}
      <DashboardControls
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={refreshMetrics}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      {/* 에러 상태 */}
      {error && (
        <div
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* KPI 카드 그리드 - 반응형 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3열) */}
      {isLoading && !metrics ? (
        <DashboardSkeleton />
      ) : metrics ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          role="region"
          aria-label="KPI 메트릭"
        >
          <KPICard data={metrics.activeDevices} />
          <KPICard data={metrics.activeRate} />
          <KPICard data={metrics.totalHosts} />
          <KPICard data={metrics.networkTraffic} />
          <KPICard data={metrics.availability} />
          <KPICard data={metrics.avgResponseTime} />
        </div>
      ) : null}

      {/* 임시 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            네트워크 토폴로지
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              토폴로지 맵이 여기에 표시됩니다
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            트래픽 차트
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              트래픽 차트가 여기에 표시됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}