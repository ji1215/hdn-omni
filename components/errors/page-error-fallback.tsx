'use client';

import { Button } from '@/components/common';
import type { ErrorFallbackProps } from '@/types/errors';
import { formatErrorForDisplay } from '@/lib/errors/error-utils';

export function PageErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const userFriendlyMessage = formatErrorForDisplay(error, true);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              페이지를 불러올 수 없습니다
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {userFriendlyMessage}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4">
                <summary className="text-sm text-gray-500 dark:text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  개발자 정보 보기
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                  {error.stack || error.message}
                </pre>
              </details>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={resetError}
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
