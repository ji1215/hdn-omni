export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse" role="status" aria-label="로딩 중">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 타이틀 스켈레톤 */}
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2" />

          {/* 값 스켈레톤 */}
          <div className="flex items-baseline space-x-2 mb-3">
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-5 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>

          {/* 트렌드 스켈레톤 */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        </div>

        {/* 아이콘 스켈레톤 */}
        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
      <span className="sr-only">데이터 로딩 중...</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
