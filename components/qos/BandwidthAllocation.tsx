'use client';

import { cn } from '@/lib/utils';
import type { BandwidthAllocation as BandwidthAllocationType } from '@/types/qos';

interface BandwidthAllocationProps {
  allocations: Omit<BandwidthAllocationType, 'trafficClassId'>[];
  trafficClassNames: Record<number, string>;
  totalBandwidth?: number;
  onChange: (allocations: Omit<BandwidthAllocationType, 'trafficClassId'>[]) => void;
  errors?: Record<string, string>;
}

/**
 * 대역폭 할당 컴포넌트
 */
export function BandwidthAllocation({
  allocations,
  trafficClassNames,
  totalBandwidth = 10000, // 기본 10Gbps
  onChange,
  errors,
}: BandwidthAllocationProps) {
  // 할당된 총 대역폭 계산
  const allocatedBandwidth = allocations.reduce(
    (sum, alloc) => sum + alloc.maxBandwidth,
    0
  );
  const remainingBandwidth = totalBandwidth - allocatedBandwidth;
  const utilizationPercent = (allocatedBandwidth / totalBandwidth) * 100;

  // 필드 업데이트
  const handleUpdate = (
    index: number,
    field: keyof Omit<BandwidthAllocationType, 'trafficClassId'>,
    value: number
  ) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          대역폭 할당
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          총 대역폭: {totalBandwidth} Mbps
        </div>
      </div>

      {/* 전체 사용률 표시 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            대역폭 사용률
          </span>
          <span
            className={cn(
              'text-sm font-semibold',
              utilizationPercent > 100
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            )}
          >
            {utilizationPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              utilizationPercent > 100
                ? 'bg-red-500'
                : utilizationPercent > 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
            )}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>할당: {allocatedBandwidth} Mbps</span>
          <span>
            남은 대역폭:{' '}
            <span
              className={cn(
                'font-semibold',
                remainingBandwidth < 0 && 'text-red-600 dark:text-red-400'
              )}
            >
              {remainingBandwidth} Mbps
            </span>
          </span>
        </div>
      </div>

      {/* 대역폭 할당 입력 */}
      {allocations.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            트래픽 클래스를 먼저 추가하세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allocations.map((alloc, index) => {
            const className = trafficClassNames[index] || `클래스 ${index + 1}`;
            const percent = (alloc.maxBandwidth / totalBandwidth) * 100;

            return (
              <div
                key={index}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {className}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {percent.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 최소 대역폭 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      최소 대역폭 (Mbps)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={alloc.minBandwidth}
                      onChange={(e) =>
                        handleUpdate(index, 'minBandwidth', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* 최대 대역폭 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      최대 대역폭 (Mbps)
                    </label>
                    <input
                      type="number"
                      min={alloc.minBandwidth}
                      value={alloc.maxBandwidth}
                      onChange={(e) =>
                        handleUpdate(index, 'maxBandwidth', parseFloat(e.target.value))
                      }
                      className={cn(
                        'w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary',
                        alloc.maxBandwidth < alloc.minBandwidth
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    />
                  </div>
                </div>

                {alloc.maxBandwidth < alloc.minBandwidth && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    최대 대역폭은 최소 대역폭보다 커야 합니다
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {remainingBandwidth < 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">
          할당된 대역폭이 총 대역폭을 초과했습니다
        </p>
      )}

      {errors && Object.keys(errors).length > 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.bandwidthAllocations}
        </p>
      )}
    </div>
  );
}
