'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Department, DepartmentStatusLabels, DepartmentStatusColors } from '@/types/department';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MoreHorizontal, Edit, Trash2, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';

/**
 * 부서 테이블 컬럼 정의
 */
export const departmentColumns: ColumnDef<Department>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="rounded border-gray-300 text-primary focus:ring-primary"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="rounded border-gray-300 text-primary focus:ring-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: '부서명',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.getValue('name')}
          </div>
          {row.original.parentName && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              상위: {row.original.parentName}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: '설명',
    cell: ({ row }) => (
      <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
        {row.getValue('description') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'memberCount',
    header: '인원',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 dark:text-gray-100 font-medium">
          {row.getValue('memberCount')}명
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof DepartmentStatusLabels;
      return (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            DepartmentStatusColors[status]
          )}
        >
          {DepartmentStatusLabels[status]}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: '생성일',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return (
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          {format(new Date(date), 'yyyy.MM.dd', { locale: ko })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row, table }) => {
      const department = row.original;
      const meta = table.options.meta as {
        onEditDepartment?: (department: Department) => void;
        onDeleteDepartment?: (department: Department) => void;
      };

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta?.onEditDepartment?.(department)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta?.onDeleteDepartment?.(department)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-100"
            disabled={department.memberCount > 0}
            title={department.memberCount > 0 ? '소속 인원이 있는 부서는 삭제할 수 없습니다' : undefined}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
