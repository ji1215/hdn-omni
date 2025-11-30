import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import logo from '/public/images/HDN_CI_2016.png';
import { ShieldCheckIcon } from 'lucide-react';

export const metadata = {
  title: 'Login | HDN Omni SDN Controller',
  description: 'Login to HDN Omni SDN Controller Management Interface',
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      {/* 로고 & 타이틀 */}
      <div className="text-center mb-8">
        {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4"> */}
        <div className="inline-flex items-center justify-center w-32 h-26 mb-4 relative">
          {/* <ShieldCheckIcon className="w-8 h-8 text-primary" /> */}
          <Image src={logo} alt="HDN Omni Logo" className="absolute" />
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          SDN Controller Management Interface
        </p>
      </div>

      {/* 로그인 카드 */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">로그인</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            계정 정보를 입력하여 시스템에 접속하세요
          </p>
        </div>

        <LoginForm />

        {/* 보안 메시지 */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 text-sm text-blue-700 dark:text-blue-300">
              <p className="mt-1">모든 활동은 보안 감사를 위해 기록됩니다...</p>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 HDN Omni 화이팅~~</p>
      </div>
    </div>
  );
}
