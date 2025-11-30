'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Flow } from '@/types/traffic';
import { format } from 'date-fns';

// 바이트를 읽기 쉬운 형식으로 변환
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 활성 플로우 테이블 컬럼 정의
 */
export const flowColumns: ColumnDef<Flow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="모든 플로우 선택"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`${row.original.id} 선택`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'protocol',
    header: '프로토콜',
    cell: ({ row }) => {
      const protocol = row.getValue('protocol') as string;
      return (
        <span
          className={`px-2 py-1 rounded font-semibold text-xs ${
            protocol === 'TCP'
              ? 'bg-blue-500 text-white'
              : protocol === 'UDP'
                ? 'bg-green-500 text-white'
                : protocol === 'ICMP'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-500 text-white'
          }`}
        >
          {protocol}
        </span>
      );
    },
  },
  {
    accessorKey: 'sourceIp',
    header: '소스',
    cell: ({ row }) => (
      <span className="text-xs font-mono text-gray-900 dark:text-gray-100">
        {row.getValue('sourceIp')}:{row.original.sourcePort}
      </span>
    ),
  },
  {
    accessorKey: 'destinationIp',
    header: '목적지',
    cell: ({ row }) => (
      <span className="text-xs font-mono text-gray-900 dark:text-gray-100">
        {row.getValue('destinationIp')}:{row.original.destinationPort}
      </span>
    ),
  },
  {
    accessorKey: 'bytes',
    header: '바이트',
    cell: ({ row }) => (
      <div className="text-xs text-right text-gray-900 dark:text-gray-100">
        {formatBytes(row.getValue('bytes'))}
      </div>
    ),
  },
  {
    accessorKey: 'packets',
    header: '패킷',
    cell: ({ row }) => (
      <div className="text-xs text-right text-gray-900 dark:text-gray-100">
        {(row.getValue('packets') as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'startTime',
    header: '시작 시간',
    cell: ({ row }) => (
      <span className="text-xs text-gray-900 dark:text-gray-100">
        {format(new Date(row.getValue('startTime')), 'HH:mm:ss')}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <span
          className={`px-2 py-1 rounded text-xs ${
            status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : status === 'closed'
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
          }`}
        >
          {status === 'active' ? '활성' : status === 'closed' ? '종료' : '유휴'}
        </span>
      );
    },
  },
  {
    id: 'application',
    header: '애플리케이션',
    accessorKey: 'application',
    cell: ({ row }) => (
      <span className="text-xs text-gray-900 dark:text-gray-100">
        {row.original.application || '-'}
      </span>
    ),
  },
];
