'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/common';
import { FlowRule } from '@/types/flow';

/**
 * 플로우 규칙 테이블 컬럼 정의
 */
export const flowColumns: ColumnDef<FlowRule>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="모든 플로우 규칙 선택"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`${row.original.name} 선택`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'priority',
    header: '우선순위',
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {row.getValue('priority')}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {row.getValue('name')}
        </div>
        {row.original.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.description}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'match',
    header: '매치',
    cell: ({ row }) => {
      const match = row.original.match;
      return (
        <div className="text-xs space-y-1">
          {match.protocol && (
            <div>
              <span className="text-gray-500">Proto:</span> {match.protocol}
            </div>
          )}
          {match.dstPort && (
            <div>
              <span className="text-gray-500">Port:</span> {match.dstPort}
            </div>
          )}
          {match.vlanId && (
            <div>
              <span className="text-gray-500">VLAN:</span> {match.vlanId}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }) => {
      const actions = row.original.actions;
      return (
        <div className="flex flex-wrap gap-1">
          {actions.map((action, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-1 rounded ${
                action.type === 'FORWARD'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : action.type === 'DROP'
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}
            >
              {action.type}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: 'statistics',
    header: '통계',
    cell: ({ row }) => {
      const stats = row.original.statistics;
      return (
        <div className="text-xs space-y-1">
          <div className="text-gray-500">
            {stats.packetCount.toLocaleString()} pkts
          </div>
          <div className="text-gray-500">
            {(stats.byteCount / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row, table }) => {
      const status = row.getValue('status') as FlowRule['status'];
      const { onToggleStatus } = table.options.meta as {
        onToggleStatus?: (ruleId: string) => void;
      };

      return (
        <Button
          onClick={() => onToggleStatus?.(row.original.id)}
          variant="ghost"
          size="sm"
          className={`px-3 py-1 text-xs font-medium rounded ${
            status === 'active'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {status === 'active' ? '활성' : '비활성'}
        </Button>
      );
    },
  },
  {
    id: 'flowActions',
    header: '작업',
    cell: ({ row, table }) => {
      const rule = row.original;
      const { onEditRule, onDeleteRule } = table.options.meta as {
        onEditRule?: (rule: FlowRule) => void;
        onDeleteRule?: (ruleId: string) => void;
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditRule?.(rule)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            편집
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteRule?.(rule.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            삭제
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
];
