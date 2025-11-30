'use client';

import { useState } from 'react';
import { Button } from '@/components/common';
import type { TimeRange } from '@/types/chart';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  className?: string;
}

const timeRangeOptions: Array<{ label: string; value: TimeRange }> = [
  { label: '1시간', value: '1h' },
  { label: '6시간', value: '6h' },
  { label: '24시간', value: '24h' },
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
];

export function TimeRangeSelector({ value, onChange, className = '' }: TimeRangeSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {timeRangeOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onChange(option.value)}
          aria-label={`${option.label} 범위 선택`}
          aria-pressed={value === option.value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
