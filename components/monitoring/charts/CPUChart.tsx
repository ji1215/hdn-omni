'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { formatXAxisLabel, getChartTheme } from '@/lib/utils/chartUtils';
import { CustomTooltip } from './CustomTooltip';
import type { TimeRange, ThresholdLine } from '@/types/chart';

interface CPUChartProps {
  data: Array<{ timestamp: number; usage: number }>;
  timeRange?: TimeRange;
  showThresholds?: boolean;
  isDark?: boolean;
}

export function CPUChart({ data, timeRange = '1h', showThresholds = true, isDark = false }: CPUChartProps) {
  const theme = getChartTheme(isDark);

  const thresholds: ThresholdLine[] = [
    { value: 80, label: '경고', color: theme.warningColor },
    { value: 90, label: '심각', color: theme.errorColor },
  ];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => formatXAxisLabel(timestamp, timeRange)}
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
            label={{ value: 'CPU Usage (%)', angle: -90, position: 'insideLeft', fill: theme.textColor }}
          />
          <Tooltip
            content={<CustomTooltip unit="%" />}
          />
          <Legend />

          {showThresholds && thresholds.map((threshold, index) => (
            <ReferenceLine
              key={`threshold-${index}`}
              y={threshold.value}
              label={{ value: threshold.label, fill: threshold.color, fontSize: 12 }}
              stroke={threshold.color}
              strokeDasharray="5 5"
            />
          ))}

          <Line
            type="monotone"
            dataKey="usage"
            name="CPU 사용률"
            stroke={theme.primaryColor}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
