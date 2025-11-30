'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/common';
import type { ApplicationStats } from '@/types/traffic';

interface ApplicationRankingTableProps {
  data: ApplicationStats[];
  isDark?: boolean;
  pageSize?: number;
}

type SortField = keyof ApplicationStats;
type SortOrder = 'asc' | 'desc';

export function ApplicationRankingTable({
  data,
  isDark = false,
  pageSize = 10,
}: ApplicationRankingTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('bytes');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // 바이트를 읽기 쉬운 형식으로 변환
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 검색 및 정렬된 데이터
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // 검색 필터
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.application.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.protocol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 정렬
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    // 순위 추가
    return result.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [data, searchQuery, sortField, sortOrder]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 정렬 아이콘
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const headerBg = isDark ? 'bg-gray-900' : 'bg-gray-100';

  return (
    <div className={`h-full w-full flex flex-col ${bgColor} rounded-lg`}>
      {/* 검색 필터 */}
      <div className="p-4 border-b" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
        <input
          type="text"
          placeholder="애플리케이션 또는 프로토콜 검색..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textColor} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className={`${headerBg} sticky top-0 z-10`}>
            <tr>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${textColor} cursor-pointer ${hoverBg}`}>
                순위
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold ${textColor} cursor-pointer ${hoverBg}`}
                onClick={() => handleSort('application')}
              >
                <div className="flex items-center gap-2">
                  애플리케이션 <SortIcon field="application" />
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold ${textColor} cursor-pointer ${hoverBg}`}
                onClick={() => handleSort('protocol')}
              >
                <div className="flex items-center gap-2">
                  프로토콜 <SortIcon field="protocol" />
                </div>
              </th>
              <th
                className={`px-4 py-3 text-right text-sm font-semibold ${textColor} cursor-pointer ${hoverBg}`}
                onClick={() => handleSort('bytes')}
              >
                <div className="flex items-center justify-end gap-2">
                  바이트 <SortIcon field="bytes" />
                </div>
              </th>
              <th
                className={`px-4 py-3 text-right text-sm font-semibold ${textColor} cursor-pointer ${hoverBg}`}
                onClick={() => handleSort('packets')}
              >
                <div className="flex items-center justify-end gap-2">
                  패킷 수 <SortIcon field="packets" />
                </div>
              </th>
              <th
                className={`px-4 py-3 text-right text-sm font-semibold ${textColor} cursor-pointer ${hoverBg}`}
                onClick={() => handleSort('flows')}
              >
                <div className="flex items-center justify-end gap-2">
                  플로우 <SortIcon field="flows" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={`${item.application}-${index}`}
                className={`border-b ${borderColor} ${hoverBg} transition-colors`}
              >
                <td className={`px-4 py-3 text-sm ${textColor}`}>
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                      item.rank === 1
                        ? 'bg-red-500 text-white'
                        : item.rank === 2
                        ? 'bg-orange-500 text-white'
                        : item.rank === 3
                        ? 'bg-yellow-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {item.rank}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${textColor}`}>
                  {item.application}
                </td>
                <td className={`px-4 py-3 text-sm ${textColor}`}>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.protocol === 'TCP'
                        ? 'bg-blue-500 text-white'
                        : item.protocol === 'UDP'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {item.protocol}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm text-right ${textColor}`}>
                  {formatBytes(item.bytes)}
                </td>
                <td className={`px-4 py-3 text-sm text-right ${textColor}`}>
                  {item.packets.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-sm text-right ${textColor}`}>
                  {item.flows.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className={`text-center py-8 ${textColor}`}>
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={`p-4 border-t ${borderColor} flex items-center justify-between`}>
          <div className={`text-sm ${textColor}`}>
            총 {filteredAndSortedData.length}개 중 {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredAndSortedData.length)}개 표시
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className={`px-3 py-1 ${textColor}`}>
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
