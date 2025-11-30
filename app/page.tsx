import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">HDN Omni</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          SDN Controller Management Interface
        </p>
        <div className="mt-8">
          <Link
            href="/auth/login"
            className="btn-primary inline-block"
          >
            로그인으로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}