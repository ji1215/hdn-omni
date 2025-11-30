'use client';

import { TimeRange } from '@/types/dashboard';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/common';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DashboardControlsProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1시간' },
  { value: '6h', label: '6시간' },
  { value: '24h', label: '24시간' },
];

export function DashboardControls({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  isLoading = false,
  lastUpdated,
}: DashboardControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* 시간 범위 선택 */}
      <div className="flex items-center space-x-2">
        <label
          htmlFor="time-range"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          시간 범위:
        </label>
        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          {timeRangeOptions.map((option, index) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onTimeRangeChange(option.value)}
              className={`${
                index === 0 ? 'rounded-r-none' : index === timeRangeOptions.length - 1 ? 'rounded-l-none' : 'rounded-none'
              } border-0`}
              aria-pressed={timeRange === option.value}
              aria-label={`${option.label} 선택`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 새로고침 버튼 및 마지막 업데이트 시간 */}
      <div className="flex items-center space-x-4">
        {lastUpdated && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            마지막 업데이트:{' '}
            {format(lastUpdated, 'HH:mm:ss', { locale: ko })}
          </span>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          loading={isLoading}
          leftIcon={!isLoading && <RefreshCw className="h-4 w-4" />}
          aria-label="데이터 새로고침"
        >
          새로고침
        </Button>
      </div>
    </div>
  );
}
