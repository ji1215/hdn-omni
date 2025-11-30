'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User, UserRoleLabels, UserRoleColors, UserStatusLabels, UserStatusColors } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/common';

/**
 * 사용자 목록 테이블 컬럼 정의
 */
export const userColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="모든 항목 선택"
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
    header: '이름',
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: '이메일',
    cell: ({ row }) => (
      <div className="text-gray-600 dark:text-gray-400">
        {row.getValue('email')}
      </div>
    ),
  },
  {
    accessorKey: 'department',
    header: '부서',
    cell: ({ row }) => (
      <div className="text-gray-600 dark:text-gray-400">
        {row.getValue('department')}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: '역할',
    cell: ({ row }) => {
      const role = row.getValue('role') as User['role'];
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${UserRoleColors[role]}`}>
          {UserRoleLabels[role]}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as User['status'];
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${UserStatusColors[status]}`}>
          {UserStatusLabels[status]}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: '생성일',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>{date.toLocaleDateString('ko-KR')}</div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(date, { addSuffix: true, locale: ko })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '작업',
    cell: ({ row, table }) => {
      const user = row.original;
      const { onEditUser, onDeleteUser, onViewAuditLog } = table.options.meta as {
        onEditUser?: (user: User) => void;
        onDeleteUser?: (user: User) => void;
        onViewAuditLog?: (user: User) => void;
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onViewAuditLog) {
                onViewAuditLog(user);
              }
            }}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            title="감사 로그"
          >
            로그
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onEditUser) {
                onEditUser(user);
              }
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            수정
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onDeleteUser) {
                onDeleteUser(user);
              }
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            삭제
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
];
