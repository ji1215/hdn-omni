'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/common';
import { Device, DeviceStatus } from '@/types/device';
import { Monitor, Wifi, WifiOff, AlertCircle, Wrench, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// 상태별 아이콘 및 스타일
const statusConfig: Record<
  DeviceStatus,
  {
    icon: any;
    label: string;
    className: string;
    bgClassName: string;
  }
> = {
  online: {
    icon: Wifi,
    label: '온라인',
    className: 'text-green-600 dark:text-green-400',
    bgClassName: 'bg-green-100 dark:bg-green-900/30',
  },
  offline: {
    icon: WifiOff,
    label: '오프라인',
    className: 'text-gray-600 dark:text-gray-400',
    bgClassName: 'bg-gray-100 dark:bg-gray-700',
  },
  error: {
    icon: AlertCircle,
    label: '오류',
    className: 'text-red-600 dark:text-red-400',
    bgClassName: 'bg-red-100 dark:bg-red-900/30',
  },
  maintenance: {
    icon: Wrench,
    label: '유지보수',
    className: 'text-yellow-600 dark:text-yellow-400',
    bgClassName: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
};

// 제조사별 아이콘 색상
const manufacturerColors: Record<string, string> = {
  cisco: 'text-blue-600 dark:text-blue-400',
  juniper: 'text-green-600 dark:text-green-400',
  huawei: 'text-red-600 dark:text-red-400',
  arista: 'text-purple-600 dark:text-purple-400',
  hp: 'text-cyan-600 dark:text-cyan-400',
  dell: 'text-indigo-600 dark:text-indigo-400',
  other: 'text-gray-600 dark:text-gray-400',
};

/**
 * 디바이스 목록 테이블 컬럼 정의
 */
export const deviceColumns: ColumnDef<Device>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="모든 디바이스 선택"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`${row.original.hostname} 선택`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'hostname',
    header: '호스트명',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue('hostname')}
        </div>
        {row.original.location && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.location}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'ip',
    header: 'IP 주소',
    cell: ({ row }) => (
      <div>
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.getValue('ip')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {row.original.protocol.toUpperCase()}:{row.original.port}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'manufacturer',
    header: '제조사',
    cell: ({ row }) => {
      const manufacturer = row.getValue('manufacturer') as string;
      return (
        <div className="flex items-center gap-2">
          <Monitor
            className={cn(
              'w-4 h-4',
              manufacturerColors[manufacturer] || manufacturerColors.other
            )}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
            {manufacturer}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'model',
    header: '모델',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900 dark:text-gray-100">
        {row.getValue('model')}
      </div>
    ),
  },
  {
    accessorKey: 'firmwareVersion',
    header: '펌웨어',
    cell: ({ row }) => (
      <div className="text-sm text-gray-900 dark:text-gray-100">
        {row.getValue('firmwareVersion')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as DeviceStatus;
      const statusInfo = statusConfig[status];
      const StatusIcon = statusInfo.icon;

      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            statusInfo.className,
            statusInfo.bgClassName
          )}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusInfo.label}
        </span>
      );
    },
  },
  {
    accessorKey: 'lastCommunication',
    header: '마지막 통신',
    cell: ({ row }) => (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {formatDistanceToNow(row.getValue('lastCommunication'), {
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
      const device = row.original;
      const { onDeviceClick, onDeviceAction } = table.options.meta as {
        onDeviceClick?: (device: Device) => void;
        onDeviceAction?: (device: Device, action: string) => void;
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeviceClick?.(device)}
          >
            상세
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeviceAction?.(device, 'menu')}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
];
