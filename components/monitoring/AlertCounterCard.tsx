'use client';

import { Alert, AlertSeverity } from '@/types/alert';
import { Button } from '@/components/common';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';

interface AlertCounterCardProps {
  severity: AlertSeverity | 'all';
  count: number;
  onClick?: () => void;
}

const severityConfig = {
  critical: {
    label: '위험',
    icon: AlertTriangle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-300',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  warning: {
    label: '경고',
    icon: AlertCircle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  info: {
    label: '정보',
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  all: {
    label: '전체 경고',
    icon: CheckCircle,
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    textColor: 'text-gray-700 dark:text-gray-300',
    iconColor: 'text-gray-600 dark:text-gray-400',
    borderColor: 'border-gray-200 dark:border-gray-800',
  },
};

export function AlertCounterCard({
  severity,
  count,
  onClick,
}: AlertCounterCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`w-full p-6 rounded-lg border-2 ${config.borderColor} ${config.bgColor} transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {config.label}
          </p>
          <p className={`text-3xl font-bold mt-2 ${config.textColor}`}>
            {count}
          </p>
        </div>
        <div className={`${config.iconColor}`}>
          <Icon size={48} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
