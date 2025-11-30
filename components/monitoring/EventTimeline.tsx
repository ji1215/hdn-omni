'use client';

import { AlertEvent } from '@/types/alert';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

interface EventTimelineProps {
  events: AlertEvent[];
  maxHeight?: string;
}

const eventConfig = {
  alert_created: {
    icon: AlertCircle,
    label: '경고 생성',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  alert_acknowledged: {
    icon: CheckCircle,
    label: '경고 확인',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  alert_resolved: {
    icon: CheckCircle,
    label: '경고 해결',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  alert_escalated: {
    icon: TrendingUp,
    label: '경고 에스컬레이션',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  comment_added: {
    icon: MessageSquare,
    label: '코멘트 추가',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
};

const severityConfig = {
  critical: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function EventTimeline({ events, maxHeight = 'max-h-[500px]' }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
        <p>최근 24시간 동안 이벤트가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={`${maxHeight} overflow-y-auto pr-4`}>
      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;

            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} ${config.color}`}
                >
                  <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {event.title}
                        {event.severity && (
                          <span
                            className={`ml-2 text-xs font-medium ${
                              severityConfig[event.severity]
                            }`}
                          >
                            [{event.severity.toUpperCase()}]
                          </span>
                        )}
                      </h4>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                      )}
                      {event.user && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          작업자: {event.user}
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
