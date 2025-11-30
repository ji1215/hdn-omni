'use client';

import { useState, useMemo } from 'react';
import { AuditLog, AuditAction, User } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/common';

interface AuditLogModalProps {
  isOpen: boolean;
  user: User | null;
  logs: AuditLog[];
  onClose: () => void;
}

// 액션 타입별 레이블 및 색상
const ActionLabels: Record<AuditAction, string> = {
  create: '계정 생성',
  update: '정보 수정',
  delete: '계정 삭제',
  login: '로그인',
  logout: '로그아웃',
  password_reset: '비밀번호 재설정',
};

const ActionColors: Record<AuditAction, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  login: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  password_reset: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
};

/**
 * 사용자 감사 로그 표시 모달
 */
export function AuditLogModal({ isOpen, user, logs, onClose }: AuditLogModalProps) {
  const [filterAction, setFilterAction] = useState<AuditAction | ''>('');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');

  // 필터링된 로그 목록
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // 액션 타입 필터
    if (filterAction) {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    // 날짜 범위 필터
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffTime = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[dateRange];

      filtered = filtered.filter((log) => {
        const logTime = new Date(log.timestamp).getTime();
        return now.getTime() - logTime <= cutoffTime;
      });
    }

    return filtered;
  }, [logs, filterAction, dateRange]);

  // 필터 초기화
  const handleResetFilters = () => {
    setFilterAction('');
    setDateRange('all');
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                감사 로그
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {user.name} ({user.email})의 활동 기록
              </p>
            </div>
            <Button
              variant="icon"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 필터 섹션 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* 액션 타입 필터 */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  액션 타입
                </label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value as AuditAction | '')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">모든 액션</option>
                  <option value="create">계정 생성</option>
                  <option value="update">정보 수정</option>
                  <option value="delete">계정 삭제</option>
                  <option value="login">로그인</option>
                  <option value="logout">로그아웃</option>
                  <option value="password_reset">비밀번호 재설정</option>
                </select>
              </div>

              {/* 날짜 범위 필터 */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  기간
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">전체 기간</option>
                  <option value="24h">최근 24시간</option>
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                </select>
              </div>

              {/* 필터 초기화 버튼 */}
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  className="whitespace-nowrap"
                >
                  필터 초기화
                </Button>
              </div>
            </div>

            {/* 결과 카운트 */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              총 {filteredLogs.length}개의 로그
            </div>
          </div>

          {/* 로그 목록 */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  선택한 필터에 해당하는 로그가 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      {/* 왼쪽: 액션 및 상세 정보 */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ActionColors[log.action]
                            }`}
                          >
                            {ActionLabels[log.action]}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDistanceToNow(new Date(log.timestamp), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </span>
                        </div>

                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {log.details}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">실행자:</span> {log.performedByName}
                          </div>
                          {log.ipAddress && (
                            <div>
                              <span className="font-medium">IP:</span> {log.ipAddress}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 오른쪽: 타임스탬프 */}
                      <div className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 모달 푸터 */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
