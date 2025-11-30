'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/common';
import { errorLogger } from '@/lib/errors/error-logger';
import { performanceMonitor } from '@/lib/errors/performance-monitor';
import type { ErrorLog, ErrorSeverity, ErrorCategory } from '@/types/errors';

export function ErrorDashboard() {
  const [stats, setStats] = useState(errorLogger.getStats());
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [perfReport, setPerfReport] = useState(performanceMonitor.getPerformanceReport());
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | undefined>();

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(errorLogger.getStats());
      setRecentErrors(errorLogger.getLogs(selectedSeverity, selectedCategory).slice(0, 10));
      setPerfReport(performanceMonitor.getPerformanceReport());
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSeverity, selectedCategory]);

  const severityColors: Record<ErrorSeverity, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          에러 모니터링 대시보드
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          실시간 에러 및 성능 모니터링
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">총 에러</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.total}
          </div>
        </div>

        {(Object.keys(stats.bySeverity) as ErrorSeverity[]).map((severity) => (
          <div
            key={severity}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
              {severity}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.bySeverity[severity]}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            성능 메트릭
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(perfReport.metrics).map(([name, value]) => (
              <div key={name}>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {name}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {name === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Threshold: {name === 'CLS'
                    ? perfReport.thresholds[name as keyof typeof perfReport.thresholds]
                    : `${perfReport.thresholds[name as keyof typeof perfReport.thresholds]}ms`}
                </div>
              </div>
            ))}
          </div>

          {perfReport.issues.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                성능 문제 감지
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {perfReport.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            카테고리별 에러
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(stats.byCategory) as ErrorCategory[]).map((category) => (
              <div
                key={category}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setSelectedCategory(category === selectedCategory ? undefined : category)}
              >
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {category}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.byCategory[category]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            최근 에러
          </h3>
          <Button
            variant="danger"
            size="sm"
            onClick={() => errorLogger.clearLogs()}
          >
            로그 초기화
          </Button>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentErrors.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              에러가 없습니다
            </div>
          ) : (
            recentErrors.map((error) => (
              <div key={error.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${severityColors[error.severity]}`}>
                        {error.severity}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                        {error.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(error.context.timestamp).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {error.message}
                    </p>
                    {error.context.url && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        URL: {error.context.url}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {error.id}
                  </div>
                </div>
                {error.stack && process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
