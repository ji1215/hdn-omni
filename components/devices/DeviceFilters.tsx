'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type { DeviceFilter, DeviceStatus, DeviceManufacturer } from '@/types/device';

interface DeviceFiltersProps {
  filter: DeviceFilter;
  onFilterChange: (filter: Partial<DeviceFilter>) => void;
  onClearFilters: () => void;
  isDark?: boolean;
}

const STATUS_OPTIONS: { value: DeviceStatus; label: string }[] = [
  { value: 'online', label: '온라인' },
  { value: 'offline', label: '오프라인' },
  { value: 'error', label: '오류' },
  { value: 'maintenance', label: '유지보수' },
];

const MANUFACTURER_OPTIONS: { value: DeviceManufacturer; label: string }[] = [
  { value: 'cisco', label: 'Cisco' },
  { value: 'juniper', label: 'Juniper' },
  { value: 'huawei', label: 'Huawei' },
  { value: 'arista', label: 'Arista' },
  { value: 'hp', label: 'HP' },
  { value: 'dell', label: 'Dell' },
  { value: 'other', label: '기타' },
];

export function DeviceFilters({
  filter,
  onFilterChange,
  onClearFilters,
  isDark = false,
}: DeviceFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ipStart, setIpStart] = useState(filter.ipRange?.start || '');
  const [ipEnd, setIpEnd] = useState(filter.ipRange?.end || '');

  const hasActiveFilters =
    filter.searchQuery ||
    (filter.statuses && filter.statuses.length > 0) ||
    (filter.manufacturers && filter.manufacturers.length > 0) ||
    filter.ipRange;

  const toggleStatus = (status: DeviceStatus) => {
    const currentStatuses = filter.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onFilterChange({
      statuses: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const toggleManufacturer = (manufacturer: DeviceManufacturer) => {
    const currentManufacturers = filter.manufacturers || [];
    const newManufacturers = currentManufacturers.includes(manufacturer)
      ? currentManufacturers.filter((m) => m !== manufacturer)
      : [...currentManufacturers, manufacturer];

    onFilterChange({
      manufacturers: newManufacturers.length > 0 ? newManufacturers : undefined,
    });
  };

  const applyIpRange = () => {
    if (ipStart && ipEnd) {
      onFilterChange({
        ipRange: { start: ipStart, end: ipEnd },
      });
    } else {
      onFilterChange({
        ipRange: undefined,
      });
    }
  };

  const clearIpRange = () => {
    setIpStart('');
    setIpEnd('');
    onFilterChange({
      ipRange: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="호스트명 또는 IP 주소로 검색..."
            value={filter.searchQuery || ''}
            onChange={(e) =>
              onFilterChange({
                searchQuery: e.target.value || undefined,
              })
            }
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant={showAdvanced ? 'primary' : 'secondary'}
          leftIcon={<Filter className="w-4 h-4" />}
          rightIcon={
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                showAdvanced && 'rotate-180'
              )}
            />
          }
        >
          고급 필터
        </Button>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="secondary"
            leftIcon={<X className="w-4 h-4" />}
          >
            초기화
          </Button>
        )}
      </div>

      {/* 고급 필터 */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              상태
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = filter.statuses?.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    onClick={() => toggleStatus(option.value)}
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 제조사 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              제조사
            </label>
            <div className="flex flex-wrap gap-2">
              {MANUFACTURER_OPTIONS.map((option) => {
                const isSelected = filter.manufacturers?.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    onClick={() => toggleManufacturer(option.value)}
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* IP 범위 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              IP 범위
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="시작 IP (예: 192.168.1.1)"
                value={ipStart}
                onChange={(e) => setIpStart(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="hidden sm:flex items-center text-gray-500 dark:text-gray-400">
                ~
              </span>
              <input
                type="text"
                placeholder="종료 IP (예: 192.168.1.255)"
                value={ipEnd}
                onChange={(e) => setIpEnd(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-2">
                <Button
                  onClick={applyIpRange}
                  disabled={!ipStart || !ipEnd}
                  variant="primary"
                >
                  적용
                </Button>
                {filter.ipRange && (
                  <Button
                    onClick={clearIpRange}
                    variant="secondary"
                  >
                    초기화
                  </Button>
                )}
              </div>
            </div>
            {filter.ipRange && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                활성 필터: {filter.ipRange.start} ~ {filter.ipRange.end}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 활성 필터 요약 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">활성 필터:</span>
          {filter.searchQuery && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1">
              검색: {filter.searchQuery}
              <Button
                onClick={() => onFilterChange({ searchQuery: undefined })}
                variant="icon"
                className="hover:bg-primary/20 rounded-full p-0.5 h-auto w-auto min-w-0 min-h-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
          {filter.statuses && filter.statuses.length > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1">
              상태: {filter.statuses.length}개
              <Button
                onClick={() => onFilterChange({ statuses: undefined })}
                variant="icon"
                className="hover:bg-primary/20 rounded-full p-0.5 h-auto w-auto min-w-0 min-h-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
          {filter.manufacturers && filter.manufacturers.length > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1">
              제조사: {filter.manufacturers.length}개
              <Button
                onClick={() => onFilterChange({ manufacturers: undefined })}
                variant="icon"
                className="hover:bg-primary/20 rounded-full p-0.5 h-auto w-auto min-w-0 min-h-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
          {filter.ipRange && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1">
              IP 범위
              <Button
                onClick={clearIpRange}
                variant="icon"
                className="hover:bg-primary/20 rounded-full p-0.5 h-auto w-auto min-w-0 min-h-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
