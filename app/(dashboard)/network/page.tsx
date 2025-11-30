export default function NetworkPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">네트워크 관리</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          네트워크 디바이스, 플로우, 포트 및 QoS 정책을 관리합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <a href="/network/devices" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">디바이스 관리</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            네트워크 디바이스를 관리하고 모니터링합니다
          </p>
        </a>

        <a href="/network/flows" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">플로우 규칙</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            SDN 플로우 규칙을 정의하고 관리합니다
          </p>
        </a>

        <a href="/network/ports" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">포트 관리</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            네트워크 포트를 구성하고 모니터링합니다
          </p>
        </a>

        <a href="/network/qos" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">QoS 정책</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            품질 보장 정책을 설정하고 관리합니다
          </p>
        </a>
      </div>
    </div>
  );
}