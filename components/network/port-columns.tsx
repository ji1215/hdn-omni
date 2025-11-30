'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/common';
import {
  Port,
  PortStatusLabels,
  PortStatusColors,
  PortSpeedLabels,
  DuplexModeLabels
} from '@/types/port';

/**
 * 포트 목록 테이블 컬럼 정의
 */
export const portColumns: ColumnDef<Port>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="모든 포트 선택"
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
    header: '포트 이름',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue('name')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {row.original.deviceName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as Port['status'];
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PortStatusColors[status]}`}>
          {PortStatusLabels[status]}
        </span>
      );
    },
  },
  {
    accessorKey: 'speed',
    header: '속도',
    cell: ({ row }) => {
      const speed = row.getValue('speed') as Port['speed'];
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {PortSpeedLabels[speed]}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {DuplexModeLabels[row.original.duplex]}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'traffic',
    header: '트래픽',
    cell: ({ row }) => {
      const traffic = row.original.traffic;
      const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
      };

      return (
        <div className="text-xs">
          <div className="text-gray-900 dark:text-gray-100">
            <span className="text-green-600 dark:text-green-400">↑ {formatBytes(traffic.txBytes)}</span>
          </div>
          <div className="text-gray-900 dark:text-gray-100">
            <span className="text-blue-600 dark:text-blue-400">↓ {formatBytes(traffic.rxBytes)}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'utilization',
    header: '사용률',
    cell: ({ row }) => {
      const utilization = row.original.traffic.utilization;
      const getUtilizationColor = (util: number) => {
        if (util >= 80) return 'text-red-600 dark:text-red-400';
        if (util >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
      };

      return (
        <div className="space-y-1">
          <div className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
            {utilization.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                utilization >= 80
                  ? 'bg-red-600'
                  : utilization >= 50
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: 'errors',
    header: '에러/드롭',
    cell: ({ row }) => {
      const traffic = row.original.traffic;
      const hasIssues = traffic.errors > 0 || traffic.drops > 0;

      return (
        <div className="text-xs">
          <div className={hasIssues ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
            에러: {traffic.errors.toLocaleString()}
          </div>
          <div className={hasIssues ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
            드롭: {traffic.drops.toLocaleString()}
          </div>
        </div>
      );
    },
  },
  {
    id: 'vlan',
    header: 'VLAN',
    cell: ({ row }) => {
      const vlanId = row.original.vlanId;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {vlanId ? `VLAN ${vlanId}` : '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '작업',
    cell: ({ row, table }) => {
      const port = row.original;
      const { onConfigurePort, onViewDetails } = table.options.meta as {
        onConfigurePort?: (port: Port) => void;
        onViewDetails?: (port: Port) => void;
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onViewDetails) {
                onViewDetails(port);
              }
            }}
          >
            상세
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onConfigurePort) {
                onConfigurePort(port);
              }
            }}
          >
            구성
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
];
