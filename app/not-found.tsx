'use client';

import Link from 'next/link';
import { Button } from '@/components/common';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            페이지를 찾을 수 없습니다
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
            <br />
            URL을 다시 확인해주세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" size="lg" className="shadow-lg">
                홈으로 돌아가기
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.history.back()}
            >
              이전 페이지로
            </Button>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          계속해서 문제가 발생하면 시스템 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  );
}
