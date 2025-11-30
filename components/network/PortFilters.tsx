'use client';

import { useState } from 'react';
import { Search, Filter, X, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface PortFiltersProps {
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: {
    status?: string;
    speed?: string;
  }) => void;
  className?: string;
}

// 필터 옵션 정의
const statusOptions: FilterOption[] = [
  { value: '', label: '전체 상태' },
  { value: 'up', label: '활성' },
  { value: 'down', label: '비활성' },
  { value: 'disabled', label: '비활성화됨' },
];

const speedOptions: FilterOption[] = [
  { value: '', label: '전체 속도' },
  { value: '10M', label: '10 Mbps' },
  { value: '100M', label: '100 Mbps' },
  { value: '1G', label: '1 Gbps' },
  { value: '10G', label: '10 Gbps' },
  { value: '40G', label: '40 Gbps' },
  { value: '100G', label: '100 Gbps' },
];

/**
 * 포트 목록 필터링 컴포넌트
 * 검색, 상태, 속도별 필터링 기능을 제공합니다.
 */
export function PortFilters({ onSearchChange, onFiltersChange, className }: PortFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSpeed, setSelectedSpeed] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 검색어 변경 처리
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  // 필터 변경 처리
  const handleFilterChange = (type: string, value: string) => {
    let newFilters = {
      status: selectedStatus,
      speed: selectedSpeed,
    };

    switch (type) {
      case 'status':
        setSelectedStatus(value);
        newFilters.status = value;
        break;
      case 'speed':
        setSelectedSpeed(value);
        newFilters.speed = value;
        break;
    }

    // 빈 문자열은 필터에서 제외
    const activeFilters = Object.entries(newFilters).reduce((acc, [key, value]) => {
      if (value) {
        acc[key as keyof typeof newFilters] = value;
      }
      return acc;
    }, {} as typeof newFilters);

    onFiltersChange(activeFilters);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedSpeed('');
    onSearchChange('');
    onFiltersChange({});
  };

  // 활성 필터 개수 계산
  const activeFilterCount = [selectedStatus, selectedSpeed].filter(Boolean).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 검색 및 필터 토글 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 검색 입력 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="포트 이름, 디바이스 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
            />
            {searchQuery && (
              <Button
                onClick={() => handleSearchChange('')}
                variant="icon"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 필터 토글 버튼 */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? 'primary' : 'secondary'}
          size="md"
          leftIcon={<Filter className="w-4 h-4" />}
          rightIcon={
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')}
            />
          }
        >
          필터
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* 필터 초기화 버튼 */}
        {activeFilterCount > 0 && (
          <Button
            onClick={handleResetFilters}
            variant="ghost"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            초기화
          </Button>
        )}
      </div>

      {/* 필터 옵션 */}
      {showFilters && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 상태 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                상태
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 속도 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                속도
              </label>
              <select
                value={selectedSpeed}
                onChange={(e) => handleFilterChange('speed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
              >
                {speedOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 활성 필터 표시 */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {selectedStatus && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                    상태: {statusOptions.find((opt) => opt.value === selectedStatus)?.label}
                    <Button
                      onClick={() => handleFilterChange('status', '')}
                      variant="icon"
                      size="sm"
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                )}
                {selectedSpeed && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    속도: {speedOptions.find((opt) => opt.value === selectedSpeed)?.label}
                    <Button
                      onClick={() => handleFilterChange('speed', '')}
                      variant="icon"
                      size="sm"
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
