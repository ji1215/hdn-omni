/**
 * 권한 없음 (403) 페이지
 */

'use client';

import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useCurrentUser } from '@/hooks/usePermission';
import { Button } from '@/components/common';

export default function UnauthorizedPage() {
  const router = useRouter();
  const currentUser = useCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 아이콘 */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <ShieldX className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        {/* 메시지 */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          접근 권한이 없습니다
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          이 페이지에 접근할 권한이 없습니다.
        </p>
        {currentUser && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            현재 역할: <span className="font-medium">{currentUser.role}</span>
          </p>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            size="lg"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            이전 페이지
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="primary"
            size="lg"
            leftIcon={<Home className="w-5 h-5" />}
          >
            대시보드로
          </Button>
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            접근 권한이 필요한 경우 시스템 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    </div>
  );
}