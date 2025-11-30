'use client';

import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type { QoSMonitoringData } from '@/types/qos';

interface QoSMonitoringDashboardProps {
  data: QoSMonitoringData | null;
  loading?: boolean;
}

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

const timeRangeLabels: Record<TimeRange, string> = {
  '1h': '1시간',
  '6h': '6시간',
  '24h': '24시간',
  '7d': '7일',
  '30d': '30일',
};

/**
 * QoS 모니터링 대시보드
 */
export function QoSMonitoringDashboard({
  data,
  loading = false,
}: QoSMonitoringDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = () => {
    // TODO: 데이터 내보내기 구현
    console.log('Exporting monitoring data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 시간 범위 선택 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            시간 범위
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 사전 정의된 범위 */}
          <div className="flex items-center gap-2">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {timeRangeLabels[range]}
              </Button>
            ))}
          </div>

          {/* 커스텀 범위 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-gray-500">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 내보내기 버튼 */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            내보내기
          </Button>
        </div>
      </div>

      {/* 모니터링 데이터 표시 */}
      {!data ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            QoS 정책을 선택하여 모니터링 데이터를 확인하세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 전체 사용률 */}
          <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              전체 사용률
            </h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-4xl font-bold text-primary">
                {data.overallUtilization.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* 트래픽 클래스 통계 플레이스홀더 */}
          <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              트래픽 클래스별 통계
            </h3>
            <div className="space-y-3">
              {data.trafficClassStats.map((stat) => (
                <div key={stat.trafficClassId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {stat.trafficClassName}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stat.utilization.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
