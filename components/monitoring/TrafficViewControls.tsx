'use client';

import { useState } from 'react';
import type { TimeRangeOption, RefreshInterval, TrafficViewOptions } from '@/types/traffic';

interface TrafficViewControlsProps {
  options: TrafficViewOptions;
  onChange: (options: TrafficViewOptions) => void;
  isDark?: boolean;
}

const TIME_RANGE_OPTIONS: { value: TimeRangeOption; label: string }[] = [
  { value: '1h', label: '최근 1시간' },
  { value: '6h', label: '최근 6시간' },
  { value: '24h', label: '최근 24시간' },
  { value: '7d', label: '최근 7일' },
  { value: 'custom', label: '사용자 정의' },
];

const REFRESH_INTERVAL_OPTIONS: { value: RefreshInterval; label: string }[] = [
  { value: 'off', label: '끄기' },
  { value: '10s', label: '10초' },
  { value: '30s', label: '30초' },
  { value: '1m', label: '1분' },
  { value: '5m', label: '5분' },
];

export function TrafficViewControls({
  options,
  onChange,
  isDark = false,
}: TrafficViewControlsProps) {
  const [showCustomRange, setShowCustomRange] = useState(options.timeRange === 'custom');

  const handleTimeRangeChange = (value: TimeRangeOption) => {
    if (value === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
    }
    onChange({ ...options, timeRange: value });
  };

  const handleCustomRangeChange = (type: 'start' | 'end', value: string) => {
    const date = new Date(value);
    const customTimeRange = {
      start: type === 'start' ? date : (options.customTimeRange?.start || new Date()),
      end: type === 'end' ? date : (options.customTimeRange?.end || new Date()),
    };
    onChange({ ...options, customTimeRange });
  };

  const handleAutoRefreshToggle = () => {
    onChange({ ...options, autoRefresh: !options.autoRefresh });
  };

  const handleRefreshIntervalChange = (value: RefreshInterval) => {
    onChange({ ...options, refreshInterval: value });
  };

  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';

  return (
    <div className={`${bgColor} ${textColor} rounded-lg p-4 space-y-4`}>
      <div className="flex flex-wrap gap-4">
        {/* 시간 범위 선택 */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">시간 범위</label>
          <select
            value={options.timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as TimeRangeOption)}
            className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {TIME_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 자동 새로고침 토글 */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">자동 새로고침</label>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoRefreshToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                options.autoRefresh ? 'bg-blue-600' : 'bg-gray-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  options.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm">{options.autoRefresh ? '켜짐' : '꺼짐'}</span>
          </div>
        </div>

        {/* 새로고침 간격 */}
        {options.autoRefresh && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">새로고침 간격</label>
            <select
              value={options.refreshInterval}
              onChange={(e) => handleRefreshIntervalChange(e.target.value as RefreshInterval)}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {REFRESH_INTERVAL_OPTIONS.filter((opt) => opt.value !== 'off').map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 사용자 정의 시간 범위 */}
      {showCustomRange && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">시작 시간</label>
            <input
              type="datetime-local"
              value={
                options.customTimeRange?.start
                  ? new Date(options.customTimeRange.start.getTime() - options.customTimeRange.start.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : ''
              }
              onChange={(e) => handleCustomRangeChange('start', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">종료 시간</label>
            <input
              type="datetime-local"
              value={
                options.customTimeRange?.end
                  ? new Date(options.customTimeRange.end.getTime() - options.customTimeRange.end.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : ''
              }
              onChange={(e) => handleCustomRangeChange('end', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
      )}

      {/* 현재 설정 표시 */}
      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          현재 설정: {TIME_RANGE_OPTIONS.find((o) => o.value === options.timeRange)?.label},{' '}
          {options.autoRefresh
            ? `자동 새로고침 ${REFRESH_INTERVAL_OPTIONS.find((o) => o.value === options.refreshInterval)?.label}`
            : '자동 새로고침 꺼짐'}
        </span>
      </div>
    </div>
  );
}
