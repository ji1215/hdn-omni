'use client';

import { KPIData, StatusLevel, TrendDirection } from '@/types/dashboard';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Server,
  Signal,
  Globe,
  ArrowRightLeft,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface KPICardProps {
  data: KPIData;
  className?: string;
}

const iconMap = {
  device: Server,
  network: Signal,
  host: Globe,
  traffic: ArrowRightLeft,
  availability: CheckCircle,
  'response-time': Clock,
};

const statusColorMap: Record<StatusLevel, { bg: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    text: 'text-green-600 dark:text-green-400',
    icon: 'text-green-600 dark:text-green-400',
  },
  warning: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-600 dark:text-red-400',
  },
};

const trendIconMap: Record<TrendDirection, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

const trendColorMap: Record<TrendDirection, string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-500 dark:text-gray-400',
};

export function KPICard({ data, className = '' }: KPICardProps) {
  const status = data.status || 'success';
  const trend = data.trend || 'neutral';
  const Icon = data.icon ? iconMap[data.icon] : Server;
  const TrendIcon = trendIconMap[trend];
  const colors = statusColorMap[status];

  const formatChange = (change?: number): string => {
    if (change === undefined || change === 0) return '0.0';
    const abs = Math.abs(change);
    return abs < 0.1 ? '< 0.1' : abs.toFixed(1);
  };

  return (
    <div
      className={`card p-6 rounded-2xl hover:shadow-xl transition-all duration-200 border-0 ${className}`}
      role="article"
      aria-label={`${data.title} KPI 카드`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            {data.title}
          </p>
          <div className="flex items-baseline space-x-2 mb-3">
            <p
              className="text-3xl font-bold text-gray-900 dark:text-white"
              aria-label={`현재 값: ${data.value}${data.unit || ''}`}
            >
              {data.value}
            </p>
            {data.unit && (
              <span className="text-base text-gray-500 dark:text-gray-400">
                {data.unit}
              </span>
            )}
          </div>

          {/* 트렌드 및 변화율 표시 */}
          {data.change !== undefined && (
            <div className="flex items-center space-x-1">
              <TrendIcon
                className={`h-3.5 w-3.5 ${trendColorMap[trend]}`}
                aria-hidden="true"
              />
              <span
                className={`text-xs font-semibold ${trendColorMap[trend]}`}
                aria-label={`변화율: ${trend === 'up' ? '증가' : trend === 'down' ? '감소' : '변화 없음'} ${formatChange(data.change)}%`}
              >
                {formatChange(data.change)}%
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                This month
              </span>
            </div>
          )}
        </div>

        {/* 아이콘 및 상태 표시 */}
        <div
          className={`p-3 rounded-xl ${colors.bg}`}
          aria-label={`상태: ${status === 'success' ? '정상' : status === 'warning' ? '주의' : '위험'}`}
        >
          <Icon
            className={`h-6 w-6 ${colors.icon}`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* 상태 표시 인디케이터 */}
      {status !== 'success' && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className={`flex items-center space-x-2 ${colors.text}`}>
            <div className={`h-2 w-2 rounded-full ${status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-xs font-medium">
              {status === 'warning' ? '주의 필요' : '긴급 확인 필요'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
