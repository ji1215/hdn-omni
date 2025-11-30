'use client';

import { Button } from '@/components/common';
import type { ErrorFallbackProps } from '@/types/errors';

export function LayoutErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
            <div className="flex items-center space-x-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-white">
                레이아웃 오류
              </h1>
            </div>
          </div>

          <div className="p-8">
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
              페이지 레이아웃을 불러오는 중 문제가 발생했습니다.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  에러 정보
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-48 bg-white dark:bg-gray-800 p-3 rounded">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={resetError}
                className="flex-1"
              >
                페이지 다시 로드
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex-1"
              >
                대시보드로 이동
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              문제가 계속되면 시스템 관리자에게 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
