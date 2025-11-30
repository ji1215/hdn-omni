export default function SecurityPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">보안 및 접근 제어</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          사용자 관리, 역할 기반 접근 제어 및 감사 로그를 관리합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/security/users" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">사용자 관리</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            시스템 사용자를 추가, 수정, 삭제합니다
          </p>
        </a>

        <a href="/security/roles" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">역할 관리</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            역할 기반 권한을 정의하고 할당합니다
          </p>
        </a>

        <a href="/security/audit" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">감사 로그</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            시스템 활동 및 보안 이벤트를 모니터링합니다
          </p>
        </a>
      </div>
    </div>
  );
}