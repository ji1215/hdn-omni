'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/common';
import { networkMonitor } from '@/lib/errors/network-monitor';

export function OfflineFallback() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(networkMonitor.isOnline());

    const unsubscribe = networkMonitor.subscribe((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <div className="flex items-center space-x-3">
            <svg
              className="w-8 h-8 text-white animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white">
              오프라인
            </h2>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              인터넷 연결이 끊어졌습니다
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              네트워크 연결을 확인하고 다시 시도해주세요.
              연결이 복구되면 자동으로 재연결됩니다.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              해결 방법:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Wi-Fi 또는 이더넷 연결을 확인하세요</li>
              <li>• 라우터를 재시작해보세요</li>
              <li>• 방화벽 설정을 확인하세요</li>
              <li>• 네트워크 관리자에게 문의하세요</li>
            </ul>
          </div>

          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={() => window.location.reload()}
            className="mt-6 bg-orange-600 hover:bg-orange-700"
          >
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}
