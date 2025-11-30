'use client';

import { DataTable } from '@/components/common';
import { Button } from '@/components/common';
import type { QoSPolicy } from '@/types/qos';
import { qosColumns } from './qos-columns';

interface QoSPolicyTableProps {
  policies: QoSPolicy[];
  selectedPolicies?: Set<string>;
  onPolicySelect?: (id: string) => void;
  onSelectAll?: () => void;
  onPolicyClick?: (policy: QoSPolicy) => void;
  onEditPolicy?: (policy: QoSPolicy) => void;
  onDeletePolicy?: (policy: QoSPolicy) => void;
  onApplyPolicy?: (policy: QoSPolicy) => void;
  loading?: boolean;
}

export function QoSPolicyTable({
  policies,
  selectedPolicies = new Set(),
  onPolicySelect,
  onSelectAll,
  onPolicyClick,
  onEditPolicy,
  onDeletePolicy,
  onApplyPolicy,
  loading = false,
}: QoSPolicyTableProps) {
  return (
    <DataTable
      data={policies}
      columns={qosColumns}
      isLoading={loading}
      enableRowSelection={true}
      enableBulkActions={true}
      bulkActionsContent={(selectedRows) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk activate/deactivate');
            }}
          >
            일괄 활성화/비활성화
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Bulk apply');
            }}
          >
            일괄 적용
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
        onEditPolicy,
        onDeletePolicy,
        onApplyPolicy,
      }}
      emptyMessage="QoS 정책이 없습니다"
      emptyDescription="새 QoS 정책을 생성하여 트래픽 관리를 시작하세요"
    />
  );
}
