'use client';

import { DataTable } from '@/components/common';
import { Button } from '@/components/common';
import type { Device } from '@/types/device';
import { deviceColumns } from './device-columns';
import { RotateCw, Database, Trash2 } from 'lucide-react';

interface DeviceTableProps {
  devices: Device[];
  selectedDevices: Set<string>;
  onDeviceSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeviceClick?: (device: Device) => void;
  onDeviceAction?: (device: Device, action: string) => void;
  loading?: boolean;
  isDark?: boolean;
  onBatchReboot?: () => void;
  onBatchBackup?: () => void;
  onBatchDelete?: () => void;
  clearSelection?: () => void;
}

export function DeviceTable({
  devices,
  selectedDevices,
  onDeviceSelect,
  onSelectAll,
  onDeviceClick,
  onDeviceAction,
  loading = false,
  isDark = false,
  onBatchReboot,
  onBatchBackup,
  onBatchDelete,
  clearSelection,
}: DeviceTableProps) {
  return (
    <DataTable
      data={devices}
      columns={deviceColumns}
      isLoading={loading}
      enableRowSelection={true}
      enableBulkActions={true}
      bulkActionsContent={(selectedRows) => (
        <>
          <Button
            onClick={onBatchReboot}
            variant="ghost"
            size="sm"
            leftIcon={<RotateCw className="w-4 h-4" />}
            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
          >
            일괄 재시작
          </Button>
          <Button
            onClick={onBatchBackup}
            variant="ghost"
            size="sm"
            leftIcon={<Database className="w-4 h-4" />}
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
          >
            일괄 백업
          </Button>
          <Button
            onClick={onBatchDelete}
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            일괄 삭제
          </Button>
          <Button
            onClick={clearSelection}
            variant="secondary"
            size="sm"
          >
            선택 취소
          </Button>
        </>
      )}
      meta={{
        onDeviceClick,
        onDeviceAction,
      }}
      emptyMessage="디바이스가 없습니다"
      emptyDescription="새 디바이스를 추가하여 네트워크 관리를 시작하세요"
    />
  );
}
