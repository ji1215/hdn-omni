'use client';

import { DataTable } from '@/components/common';
import { Button } from '@/components/common';
import { Port } from '@/types/port';
import { portColumns } from './port-columns';

interface PortsTableProps {
  data: Port[];
  isLoading?: boolean;
  onConfigurePort?: (port: Port) => void;
  onViewDetails?: (port: Port) => void;
}

/**
 * 포트 목록 테이블 컴포넌트
 * 공통 DataTable 컴포넌트를 사용하여 포트 데이터를 표시합니다.
 */
export function PortsTable({ data, isLoading = false, onConfigurePort, onViewDetails }: PortsTableProps) {
  return (
    <DataTable
      data={data}
      columns={portColumns}
      isLoading={isLoading}
      enableRowSelection={true}
      enableBulkActions={true}
      bulkActionsContent={(selectedRows) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk enable/disable ports');
            }}
          >
            일괄 활성화/비활성화
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk speed configuration');
            }}
          >
            일괄 속도 설정
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk VLAN configuration');
            }}
          >
            일괄 VLAN 설정
          </Button>
        </>
      )}
      meta={{
        onConfigurePort,
        onViewDetails,
      }}
      emptyMessage="포트가 없습니다"
      emptyDescription="필터를 조정하거나 새 포트를 추가해보세요"
    />
  );
}
