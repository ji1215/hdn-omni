'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

interface DevicePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isDark?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DevicePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isDark = false,
}: DevicePaginationProps) {
  // 페이지 번호 생성 (최대 7개 표시)
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // 7페이지 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 7페이지 초과시 축약 표시
      if (currentPage <= 3) {
        // 현재 페이지가 앞쪽
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 현재 페이지가 뒤쪽
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // 현재 페이지가 중간
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* 페이지 크기 선택 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          페이지당 항목:
        </label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* 아이템 범위 표시 */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        전체 <span className="font-semibold">{totalItems}</span>개 중{' '}
        <span className="font-semibold">{startItem}</span>-
        <span className="font-semibold">{endItem}</span>
      </div>

      {/* 페이지 네비게이션 */}
      <div className="flex items-center gap-1">
        {/* 첫 페이지 */}
        <Button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          variant="icon"
          title="첫 페이지"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* 이전 페이지 */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="icon"
          title="이전 페이지"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* 페이지 번호 */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1.5 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                className="min-w-[2.5rem]"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* 모바일용 간단한 페이지 표시 */}
        <div className="sm:hidden px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
          {currentPage} / {totalPages}
        </div>

        {/* 다음 페이지 */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="icon"
          title="다음 페이지"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* 마지막 페이지 */}
        <Button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          variant="icon"
          title="마지막 페이지"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
