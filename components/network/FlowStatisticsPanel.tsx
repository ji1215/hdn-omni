'use client';

import { FlowStatistics } from '@/types/flow';

interface FlowStatisticsPanelProps {
  statistics: FlowStatistics;
}

export function FlowStatisticsPanel({ statistics }: FlowStatisticsPanelProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}초`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간`;
    return `${Math.floor(seconds / 86400)}일`;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '없음';
    return new Date(date).toLocaleString('ko-KR');
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        통계
      </h3>

      <div className="space-y-4">
        {/* Packet Count */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              패킷 카운트
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {statistics.packetCount.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min((statistics.packetCount / 1000000) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Byte Count */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              바이트 카운트
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatBytes(statistics.byteCount)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min((statistics.byteCount / 1000000000) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">지속 시간</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatDuration(statistics.duration)}
          </span>
        </div>

        {/* Last Matched */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            마지막 매칭
          </span>
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {formatDate(statistics.lastMatched)}
          </span>
        </div>

        {/* Throughput (calculated) */}
        {statistics.duration > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                평균 처리량
              </span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {formatBytes(statistics.byteCount / statistics.duration)}/s
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                평균 패킷/초
              </span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {Math.round(statistics.packetCount / statistics.duration)} pps
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
