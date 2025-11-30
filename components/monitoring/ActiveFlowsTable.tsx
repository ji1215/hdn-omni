'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button, DataTable } from '@/components/common';
import type { Flow, Protocol } from '@/types/traffic';
import { flowColumns } from './flow-columns';

interface ActiveFlowsTableProps {
  flows: Flow[];
  isDark?: boolean;
  pageSize?: number;
  onFlowClick?: (flow: Flow) => void;
}

const PROTOCOLS: Protocol[] = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'SSH', 'DNS', 'FTP', 'TELNET', 'OTHER'];

export function ActiveFlowsTable({
  flows,
  isDark = false,
  pageSize = 20,
  onFlowClick,
}: ActiveFlowsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | 'ALL'>('ALL');
  const [ipFilter, setIpFilter] = useState('');

  // IP 주소 필터링 (간단한 서브스트링 매칭)
  const matchesIpFilter = (sourceIp: string, destIp: string, filter: string): boolean => {
    if (!filter) return true;
    const lowerFilter = filter.toLowerCase();
    return (
      sourceIp.toLowerCase().includes(lowerFilter) ||
      destIp.toLowerCase().includes(lowerFilter)
    );
  };

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    let result = [...flows];

    // 프로토콜 필터
    if (selectedProtocol !== 'ALL') {
      result = result.filter((flow) => flow.protocol === selectedProtocol);
    }

    // IP 필터
    if (ipFilter) {
      result = result.filter((flow) =>
        matchesIpFilter(flow.sourceIp, flow.destinationIp, ipFilter)
      );
    }

    // 검색 필터 (애플리케이션)
    if (searchQuery) {
      result = result.filter(
        (flow) =>
          flow.application?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [flows, selectedProtocol, ipFilter, searchQuery]);

  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="h-full w-full flex flex-col">
      {/* 필터 영역 */}
      <div className="p-4 border-b space-y-3" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
        <div className="flex flex-wrap gap-3">
          {/* 프로토콜 필터 */}
          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value as Protocol | 'ALL')}
            className={`px-4 py-2 rounded-lg border ${inputBg} ${textColor} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="ALL">모든 프로토콜</option>
            {PROTOCOLS.map((protocol) => (
              <option key={protocol} value={protocol}>
                {protocol}
              </option>
            ))}
          </select>

          {/* IP 필터 */}
          <input
            type="text"
            placeholder="IP 주소로 필터 (예: 192.168)"
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${inputBg} ${textColor} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          {/* 애플리케이션 검색 */}
          <input
            type="text"
            placeholder="애플리케이션 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${inputBg} ${textColor} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* 활성 필터 표시 */}
        <div className="flex flex-wrap gap-2">
          {selectedProtocol !== 'ALL' && (
            <span className={`px-2 py-1 rounded text-xs ${inputBg} ${textColor} flex items-center gap-2`}>
              프로토콜: {selectedProtocol}
              <Button
                variant="icon"
                size="sm"
                onClick={() => setSelectedProtocol('ALL')}
                className="p-0 h-4 w-4 min-w-0 min-h-0"
              >
                <X className="w-3 h-3 text-red-500 hover:text-red-700" />
              </Button>
            </span>
          )}
          {ipFilter && (
            <span className={`px-2 py-1 rounded text-xs ${inputBg} ${textColor} flex items-center gap-2`}>
              IP: {ipFilter}
              <Button
                variant="icon"
                size="sm"
                onClick={() => setIpFilter('')}
                className="p-0 h-4 w-4 min-w-0 min-h-0"
              >
                <X className="w-3 h-3 text-red-500 hover:text-red-700" />
              </Button>
            </span>
          )}
          {searchQuery && (
            <span className={`px-2 py-1 rounded text-xs ${inputBg} ${textColor} flex items-center gap-2`}>
              앱: {searchQuery}
              <Button
                variant="icon"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="p-0 h-4 w-4 min-w-0 min-h-0"
              >
                <X className="w-3 h-3 text-red-500 hover:text-red-700" />
              </Button>
            </span>
          )}
        </div>
      </div>

      {/* DataTable */}
      <div className="flex-1 min-h-0">
        <DataTable
          data={filteredData}
          columns={flowColumns}
          enableRowSelection={true}
          enableBulkActions={true}
          bulkActionsContent={(selectedRows) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Export selected flows');
                }}
              >
                선택 항목 내보내기
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Terminate selected flows');
                }}
                className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
              >
                선택 항목 종료
              </Button>
            </>
          )}
          meta={{
            onFlowClick,
          }}
          emptyMessage="필터 조건에 맞는 플로우가 없습니다"
          emptyDescription="필터를 조정하거나 다른 조건으로 검색해보세요"
          initialPageSize={pageSize}
        />
      </div>
    </div>
  );
}
