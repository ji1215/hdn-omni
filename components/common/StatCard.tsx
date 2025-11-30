'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, subtitle, value, trend, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 transition-all hover:shadow-md',
        className
      )}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        {Icon && (
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <Icon className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{subtitle}</p>
      )}

      {/* Main value */}
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>

        {/* Trend indicator */}
        {trend && (
          <div
            className={cn(
              'text-sm font-medium px-2 py-1 rounded',
              trend.direction === 'up' &&
                'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
              trend.direction === 'down' &&
                'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
              trend.direction === 'neutral' &&
                'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
            )}
          >
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
