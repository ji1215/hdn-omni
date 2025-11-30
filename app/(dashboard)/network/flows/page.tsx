'use client';

import { useState } from 'react';
import { FlowRule } from '@/types/flow';
import { FlowRuleEditor } from '@/components/network/FlowRuleEditor';
import { validateFlowRule } from '@/lib/flowValidation';
import { Button, DataTable } from '@/components/common';
import { flowColumns } from '@/components/network/flow-columns';

export default function FlowsPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<FlowRule | undefined>();
  const [flowRules, setFlowRules] = useState<FlowRule[]>([
    {
      id: '1',
      name: 'Allow HTTP Traffic',
      description: 'HTTP 트래픽 허용',
      priority: 1000,
      match: { protocol: 'TCP', dstPort: 80 },
      actions: [{ type: 'FORWARD', outputPort: 1 }],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'active',
      statistics: {
        packetCount: 15243,
        byteCount: 9876543,
        duration: 3600,
        lastMatched: new Date(),
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      version: 1,
    },
    {
      id: '2',
      name: 'Block ICMP',
      description: 'ICMP 차단',
      priority: 2000,
      match: { protocol: 'ICMP' },
      actions: [{ type: 'DROP' }],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'active',
      statistics: {
        packetCount: 543,
        byteCount: 32580,
        duration: 3600,
        lastMatched: new Date(),
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      version: 1,
    },
  ]);

  const handleCreateNew = () => {
    setSelectedRule(undefined);
    setIsEditorOpen(true);
  };

  const handleEditRule = (rule: FlowRule) => {
    setSelectedRule(rule);
    setIsEditorOpen(true);
  };

  const handleSaveRule = (rule: Partial<FlowRule>) => {
    if (selectedRule) {
      // Update existing rule
      setFlowRules(
        flowRules.map((r) =>
          r.id === selectedRule.id
            ? {
                ...r,
                ...rule,
                updatedAt: new Date(),
                version: r.version + 1,
              }
            : r
        )
      );
    } else {
      // Create new rule
      const newRule: FlowRule = {
        ...(rule as FlowRule),
        id: `rule-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        statistics: {
          packetCount: 0,
          byteCount: 0,
          duration: 0,
        },
      };
      setFlowRules([...flowRules, newRule]);
    }
    setIsEditorOpen(false);
    setSelectedRule(undefined);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('이 플로우 규칙을 삭제하시겠습니까?')) {
      setFlowRules(flowRules.filter((r) => r.id !== ruleId));
    }
  };

  const handleToggleStatus = (ruleId: string) => {
    setFlowRules(
      flowRules.map((r) =>
        r.id === ruleId
          ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' }
          : r
      )
    );
  };

  const activeRules = flowRules.filter((r) => r.status === 'active').length;
  const inactiveRules = flowRules.filter((r) => r.status === 'inactive').length;
  const conflictCount = 0; // Would be calculated from validation

  if (isEditorOpen) {
    return (
      <FlowRuleEditor
        rule={selectedRule}
        onSave={handleSaveRule}
        onCancel={() => {
          setIsEditorOpen(false);
          setSelectedRule(undefined);
        }}
        onValidate={(rule) => validateFlowRule(rule, flowRules)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            플로우 규칙
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            네트워크 플로우 규칙을 설정하고 관리합니다
          </p>
        </div>
        <Button onClick={handleCreateNew} variant="primary" size="md">
          + 새 플로우 규칙
        </Button>
      </div>

      <div className="grid gap-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              전체 규칙
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {flowRules.length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              활성 규칙
            </h3>
            <p className="mt-2 text-3xl font-bold text-success">{activeRules}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              비활성 규칙
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-500">{inactiveRules}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              충돌
            </h3>
            <p className="mt-2 text-3xl font-bold text-error">{conflictCount}</p>
          </div>
        </div>

        {/* 플로우 규칙 테이블 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              플로우 규칙 목록
            </h2>
          </div>

          <DataTable
            data={flowRules}
            columns={flowColumns}
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
                    console.log('Bulk delete');
                  }}
                  className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                >
                  일괄 삭제
                </Button>
              </>
            )}
            meta={{
              onEditRule: handleEditRule,
              onDeleteRule: handleDeleteRule,
              onToggleStatus: handleToggleStatus,
            }}
            emptyMessage="플로우 규칙이 없습니다"
            emptyDescription="새 플로우 규칙을 추가해보세요"
          />
        </div>
      </div>
    </div>
  );
}
