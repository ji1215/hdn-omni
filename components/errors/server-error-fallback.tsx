'use client';

import { Button } from '@/components/common';

interface ServerErrorFallbackProps {
  statusCode?: number;
  message?: string;
  resetError?: () => void;
}

export function ServerErrorFallback({
  statusCode = 500,
  message,
  resetError,
}: ServerErrorFallbackProps) {
  const errorMessages: Record<number, { title: string; description: string }> = {
    500: {
      title: '서버 오류',
      description: '서버에서 요청을 처리하는 중 오류가 발생했습니다.',
    },
    502: {
      title: '게이트웨이 오류',
      description: '게이트웨이 서버가 응답하지 않습니다.',
    },
    503: {
      title: '서비스 이용 불가',
      description: '서비스가 일시적으로 이용 불가능합니다. 잠시 후 다시 시도해주세요.',
    },
    504: {
      title: '게이트웨이 타임아웃',
      description: '서버 응답 시간이 초과되었습니다.',
    },
  };

  const errorInfo = errorMessages[statusCode] || errorMessages[500];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">
            {statusCode}
          </h1>
        </div>

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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-white">
                {errorInfo.title}
              </h2>
            </div>
          </div>

          <div className="p-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {message || errorInfo.description}
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    문제가 지속되면
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    시스템 관리자에게 문의하거나 잠시 후 다시 시도해주세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {resetError && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={resetError}
                  className="flex-1"
                >
                  다시 시도
                </Button>
              )}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                홈으로 이동
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          에러 코드: {statusCode} | 시간: {new Date().toLocaleString('ko-KR')}
        </p>
      </div>
    </div>
  );
}
