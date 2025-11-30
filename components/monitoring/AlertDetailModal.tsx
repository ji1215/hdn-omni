'use client';

import { Alert } from '@/types/alert';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, Clock, User, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/common';
import { useState } from 'react';

interface AlertDetailModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment?: (alertId: string, comment: string) => void;
  currentUser?: string;
}

const severityConfig = {
  critical: {
    label: '위험',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
  },
  warning: {
    label: '경고',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    label: '정보',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
};

const statusConfig = {
  active: '활성',
  acknowledged: '확인됨',
  resolved: '해결됨',
  muted: '음소거',
};

export function AlertDetailModal({
  alert,
  isOpen,
  onClose,
  onAddComment,
  currentUser = '현재 사용자',
}: AlertDetailModalProps) {
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !alert) return null;

  const config = severityConfig[alert.severity];

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(alert.id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${config.bgColor} px-6 py-4 border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded ${config.textColor}`}>
                  {config.label}
                </span>
                <span className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded">
                  {statusConfig[alert.status]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {alert.title}
              </h2>
            </div>
            <Button
              variant="icon"
              onClick={onClose}
            >
              <X size={24} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                설명
              </h3>
              <p className="text-gray-900 dark:text-gray-100">{alert.description}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  발생 시간
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <Clock size={16} />
                  <span>{format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(alert.timestamp), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
              </div>

              {alert.source && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    소스
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{alert.source}</p>
                </div>
              )}

              {alert.affectedResource && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    영향받는 리소스
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {alert.affectedResource}
                  </p>
                </div>
              )}

              {alert.acknowledgedBy && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    확인자
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                    <User size={16} />
                    <span>{alert.acknowledgedBy}</span>
                  </div>
                  {alert.acknowledgedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {format(new Date(alert.acknowledgedAt), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  )}
                </div>
              )}

              {alert.resolvedBy && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    해결자
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                    <User size={16} />
                    <span>{alert.resolvedBy}</span>
                  </div>
                  {alert.resolvedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {format(new Date(alert.resolvedAt), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  )}
                </div>
              )}

              {alert.escalated && (
                <div className="col-span-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    에스컬레이션
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <AlertTriangle size={16} />
                    <span>
                      {alert.escalatedTo}
                      {alert.escalatedAt &&
                        ` (${formatDistanceToNow(new Date(alert.escalatedAt), {
                          addSuffix: true,
                          locale: ko,
                        })})`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <MessageSquare size={18} />
                코멘트 ({alert.comments?.length || 0})
              </h3>

              {/* Existing Comments */}
              {alert.comments && alert.comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {alert.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {comment.userName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDistanceToNow(new Date(comment.timestamp), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment();
                    }
                  }}
                  placeholder="코멘트를 입력하세요..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  leftIcon={<Send size={18} />}
                >
                  전송
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
