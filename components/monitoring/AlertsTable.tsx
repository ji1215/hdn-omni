'use client';

import { Alert, AlertSeverity, AlertStatus } from '@/types/alert';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/common';
import {
  Check,
  X,
  Eye,
  MessageSquare,
  Volume2,
  VolumeX,
  TrendingUp,
} from 'lucide-react';

interface AlertsTableProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onViewDetails?: (alert: Alert) => void;
  onMute?: (alertId: string) => void;
  onEscalate?: (alertId: string) => void;
}

const severityConfig = {
  critical: {
    label: '위험',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-l-red-500',
  },
  warning: {
    label: '경고',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-l-yellow-500',
  },
  info: {
    label: '정보',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-l-blue-500',
  },
};

const statusConfig = {
  active: '활성',
  acknowledged: '확인됨',
  resolved: '해결됨',
  muted: '음소거',
};

export function AlertsTable({
  alerts,
  onAcknowledge,
  onResolve,
  onViewDetails,
  onMute,
  onEscalate,
}: AlertsTableProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
        <p>경고가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const isActive = alert.status === 'active';
          const isAcknowledged = alert.status === 'acknowledged';

          return (
            <div
              key={alert.id}
              className={`border-l-4 ${config.borderColor} ${config.bgColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${config.textColor}`}
                    >
                      {config.label}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded">
                      {statusConfig[alert.status]}
                    </span>
                    {alert.escalated && (
                      <span className="px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 rounded">
                        에스컬레이션됨
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 cursor-pointer hover:underline"
                    onClick={() => onViewDetails?.(alert)}
                  >
                    {alert.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
                    {alert.source && (
                      <span>소스: {alert.source}</span>
                    )}
                    {alert.affectedResource && (
                      <span>영향받는 리소스: {alert.affectedResource}</span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>

                  {(alert.acknowledgedBy || alert.resolvedBy) && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {alert.acknowledgedBy && (
                        <div>
                          확인자: {alert.acknowledgedBy} (
                          {alert.acknowledgedAt &&
                            formatDistanceToNow(new Date(alert.acknowledgedAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          )
                        </div>
                      )}
                      {alert.resolvedBy && (
                        <div>
                          해결자: {alert.resolvedBy} (
                          {alert.resolvedAt &&
                            formatDistanceToNow(new Date(alert.resolvedAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          )
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="icon"
                    onClick={() => onViewDetails?.(alert)}
                    title="상세 보기"
                  >
                    <Eye size={18} />
                  </Button>

                  {isActive && (
                    <Button
                      variant="icon"
                      onClick={() => onAcknowledge?.(alert.id)}
                      title="확인"
                      className="text-green-600 dark:text-green-400"
                    >
                      <Check size={18} />
                    </Button>
                  )}

                  {(isActive || isAcknowledged) && (
                    <Button
                      variant="icon"
                      onClick={() => onResolve?.(alert.id)}
                      title="해결"
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <X size={18} />
                    </Button>
                  )}

                  {isActive && (
                    <Button
                      variant="icon"
                      onClick={() => onEscalate?.(alert.id)}
                      title="에스컬레이션"
                      className="text-orange-600 dark:text-orange-400"
                    >
                      <TrendingUp size={18} />
                    </Button>
                  )}

                  <Button
                    variant="icon"
                    onClick={() => onMute?.(alert.id)}
                    title={alert.soundEnabled ? '음소거' : '음소거 해제'}
                  >
                    {alert.soundEnabled ? (
                      <Volume2 size={18} />
                    ) : (
                      <VolumeX size={18} />
                    )}
                  </Button>
                </div>
              </div>

              {alert.comments && alert.comments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <MessageSquare size={14} />
                    <span>{alert.comments.length}개의 코멘트</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
