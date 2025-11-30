'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/common';
import type { QoSPolicy, QoSStatus } from '@/types/qos';
import { Edit, Trash2, Play, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// QoS 상태 색상 매핑
const statusColors: Record<QoSStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

// QoS 상태 라벨
const statusLabels: Record<QoSStatus, string> = {
  active: '활성',
  inactive: '비활성',
  draft: '초안',
  error: '오류',
};

// 우선순위 라벨
const priorityLabels: Record<string, string> = {
  low: '낮음',
  medium: '중간',
  high: '높음',
  critical: '긴급',
};

/**
 * QoS 정책 테이블 컬럼 정의
 */
export const qosColumns: ColumnDef<QoSPolicy>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="모든 정책 선택"
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
    accessorKey: 'name',
    header: '정책 이름',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue('name')}
        </div>
        {row.original.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {row.original.description}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'trafficClasses',
    header: '트래픽 클래스',
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
        <FileText className="w-4 h-4 text-gray-400" />
        <span>{row.original.trafficClasses.length}개</span>
      </div>
    ),
  },
  {
    id: 'appliedDevices',
    header: '적용된 디바이스',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900 dark:text-gray-100">
        {row.original.appliedDevices.length > 0 ? (
          <span>{row.original.appliedDevices.length}개</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-600">미적용</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'priority',
    header: '우선순위',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string;
      return (
        <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
          {priorityLabels[priority]}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as QoSStatus;
      return (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            statusColors[status]
          )}
        >
          {statusLabels[status]}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: '생성일',
    cell: ({ row }) => (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {formatDistanceToNow(new Date(row.getValue('createdAt')), {
          addSuffix: true,
          locale: ko,
        })}
      </div>
    ),
  },
  {
    id: 'actions',
    header: '작업',
    cell: ({ row, table }) => {
      const policy = row.original;
      const { onEditPolicy, onDeletePolicy, onApplyPolicy } = table.options.meta as {
        onEditPolicy?: (policy: QoSPolicy) => void;
        onDeletePolicy?: (policy: QoSPolicy) => void;
        onApplyPolicy?: (policy: QoSPolicy) => void;
      };

      return (
        <div className="flex items-center gap-1">
          {onEditPolicy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditPolicy(policy)}
              title="수정"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onApplyPolicy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApplyPolicy(policy)}
              title="적용"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          {onDeletePolicy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeletePolicy(policy)}
              title="삭제"
              className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
