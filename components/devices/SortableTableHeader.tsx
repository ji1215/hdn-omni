'use client';

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type { Device, DeviceSort } from '@/types/device';

interface SortableTableHeaderProps {
  label: string;
  field: keyof Device;
  currentSort: DeviceSort;
  onSort: (field: keyof Device) => void;
  className?: string;
}

export function SortableTableHeader({
  label,
  field,
  currentSort,
  onSort,
  className,
}: SortableTableHeaderProps) {
  const isActive = currentSort.field === field;
  const order = isActive ? currentSort.order : null;

  return (
    <th className={cn('px-4 py-3 text-left', className)}>
      <Button
        onClick={() => onSort(field)}
        variant="ghost"
        className="group flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-primary dark:hover:text-primary transition-colors p-0 h-auto"
      >
        <span>{label}</span>
        <span className="relative w-4 h-4 flex items-center justify-center">
          {!isActive && (
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          )}
          {isActive && order === 'asc' && (
            <ArrowUp className="w-3.5 h-3.5 text-primary" />
          )}
          {isActive && order === 'desc' && (
            <ArrowDown className="w-3.5 h-3.5 text-primary" />
          )}
        </span>
      </Button>
    </th>
  );
}
