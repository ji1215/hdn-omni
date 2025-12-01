'use client';

import { DataTable } from '@/components/common';
import { Department } from '@/types/department';
import { departmentColumns } from './department-columns';
import { Button } from '@/components/common';

interface DepartmentsTableProps {
  data: Department[];
  isLoading?: boolean;
  onEditDepartment?: (department: Department) => void;
  onDeleteDepartment?: (department: Department) => void;
}

/**
 * 부서 목록 테이블 컴포넌트
 * 공통 DataTable 컴포넌트를 사용하여 부서 데이터를 표시합니다.
 */
export function DepartmentsTable({
  data,
  isLoading = false,
  onEditDepartment,
  onDeleteDepartment,
}: DepartmentsTableProps) {
  return (
    <DataTable
      data={data}
      columns={departmentColumns}
      isLoading={isLoading}
      enableRowSelection={true}
      enableBulkActions={true}
      bulkActionsContent={(selectedRows) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk status change for departments');
            }}
          >
            일괄 상태 변경
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk delete departments');
            }}
            className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
          >
            일괄 삭제
          </Button>
        </>
      )}
      meta={{
        onEditDepartment,
        onDeleteDepartment,
      }}
      emptyMessage="부서가 없습니다"
      emptyDescription="새 부서를 추가해보세요"
    />
  );
}
