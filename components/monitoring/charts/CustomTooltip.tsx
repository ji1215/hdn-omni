'use client';

import { formatTooltipTimestamp, formatValue } from '@/lib/utils/chartUtils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  valueFormatter?: (value: number) => string;
  unit?: string;
}

export function CustomTooltip({ active, payload, label, valueFormatter, unit }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {label && (
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {typeof label === 'number' ? formatTooltipTimestamp(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {entry.name}:
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {valueFormatter
                ? valueFormatter(entry.value)
                : formatValue(entry.value, unit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
