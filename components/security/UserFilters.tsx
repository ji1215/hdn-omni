'use client';

import { useState } from 'react';
import { Search, Filter, X, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

interface FilterOption {
  value: string;
  label: string;
}

interface UserFiltersProps {
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: {
    role?: string;
    status?: string;
    department?: string;
  }) => void;
  className?: string;
}

// 필터 옵션 정의
const roleOptions: FilterOption[] = [
  { value: '', label: '전체 역할' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'network_admin', label: 'Network Admin' },
  { value: 'monitoring_user', label: 'Monitoring User' },
  { value: 'guest', label: 'Guest' },
];

const statusOptions: FilterOption[] = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'suspended', label: '정지' },
];

const departmentOptions: FilterOption[] = [
  { value: '', label: '전체 부서' },
  { value: '네트워크 운영팀', label: '네트워크 운영팀' },
  { value: '네트워크 보안팀', label: '네트워크 보안팀' },
  { value: '모니터링팀', label: '모니터링팀' },
  { value: '외부협력사', label: '외부협력사' },
];

/**
 * 사용자 목록 필터링 컴포넌트
 * 검색, 역할, 상태, 부서별 필터링 기능을 제공합니다.
 */
export function UserFilters({ onSearchChange, onFiltersChange, className }: UserFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 검색어 변경 처리
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  // 필터 변경 처리
  const handleFilterChange = (type: string, value: string) => {
    let newFilters = {
      role: selectedRole,
      status: selectedStatus,
      department: selectedDepartment,
    };

    switch (type) {
      case 'role':
        setSelectedRole(value);
        newFilters.role = value;
        break;
      case 'status':
        setSelectedStatus(value);
        newFilters.status = value;
        break;
      case 'department':
        setSelectedDepartment(value);
        newFilters.department = value;
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
    setSelectedRole('');
    setSelectedStatus('');
    setSelectedDepartment('');
    onSearchChange('');
    onFiltersChange({});
  };

  // 활성 필터 개수 계산
  const activeFilterCount = [selectedRole, selectedStatus, selectedDepartment].filter(Boolean).length;

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
              placeholder="이름, 이메일, 부서로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
            />
            {searchQuery && (
              <Button
                variant="icon"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 필터 토글 버튼 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium text-sm',
            showFilters
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          <Filter className="w-4 h-4" />
          <span>필터</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')}
          />
        </button>

        {/* 필터 초기화 버튼 */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            초기화
          </Button>
        )}
      </div>

      {/* 필터 옵션 */}
      {showFilters && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 역할 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                역할
              </label>
              <select
                value={selectedRole}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

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

            {/* 부서 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                부서
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
              >
                {departmentOptions.map((option) => (
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
                {selectedRole && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    역할: {roleOptions.find((opt) => opt.value === selectedRole)?.label}
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => handleFilterChange('role', '')}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-400 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                )}
                {selectedStatus && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                    상태: {statusOptions.find((opt) => opt.value === selectedStatus)?.label}
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => handleFilterChange('status', '')}
                      className="ml-1 hover:text-green-600 dark:hover:text-green-400 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                )}
                {selectedDepartment && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                    부서: {departmentOptions.find((opt) => opt.value === selectedDepartment)?.label}
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => handleFilterChange('department', '')}
                      className="ml-1 hover:text-purple-600 dark:hover:text-purple-400 p-0"
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