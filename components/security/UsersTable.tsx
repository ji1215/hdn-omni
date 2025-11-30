'use client';

import { DataTable } from '@/components/common';
import { User } from '@/types/user';
import { userColumns } from './user-columns';
import { Button } from '@/components/common';

interface UsersTableProps {
  data: User[];
  isLoading?: boolean;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  onViewAuditLog?: (user: User) => void;
}

/**
 * 사용자 목록 테이블 컴포넌트
 * 공통 DataTable 컴포넌트를 사용하여 사용자 데이터를 표시합니다.
 */
export function UsersTable({ data, isLoading = false, onEditUser, onDeleteUser, onViewAuditLog }: UsersTableProps) {
  return (
    <DataTable
      data={data}
      columns={userColumns}
      isLoading={isLoading}
      enableRowSelection={true}
      enableBulkActions={true}
      bulkActionsContent={(selectedRows) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk role change');
            }}
          >
            일괄 역할 변경
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk status change');
            }}
          >
            일괄 상태 변경
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk delete');
            }}
            className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
          >
            일괄 삭제
          </Button>
        </>
      )}
      meta={{
        onEditUser,
        onDeleteUser,
        onViewAuditLog,
      }}
      emptyMessage="사용자가 없습니다"
      emptyDescription="새 사용자를 추가해보세요"
    />
  );
}
