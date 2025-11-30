'use client';

import { Button } from '@/components/common';

export default function AuditPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          감사 로그
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          시스템의 모든 활동과 보안 이벤트를 추적합니다
        </p>
      </div>

      <div className="grid gap-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              오늘 이벤트
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              1,247
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              성공
            </h3>
            <p className="mt-2 text-3xl font-bold text-success">1,198</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              실패
            </h3>
            <p className="mt-2 text-3xl font-bold text-warning">45</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              보안 위협
            </h3>
            <p className="mt-2 text-3xl font-bold text-error">4</p>
          </div>
        </div>

        {/* 필터 및 검색 플레이스홀더 */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              활동 로그
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="사용자, IP 주소, 이벤트 검색..."
                className="input flex-1"
              />
              <Button variant="primary" size="md">검색</Button>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            감사 로그 테이블이 여기에 표시됩니다.
            <br />
            포함 정보: 타임스탬프, 사용자, 작업, 리소스, IP 주소, 결과
          </div>
        </div>
      </div>
    </div>
  );
}
