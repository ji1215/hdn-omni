'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatXAxisLabel, getChartTheme } from '@/lib/utils/chartUtils';
import { CustomTooltip } from './CustomTooltip';
import type { TimeRange, DiskData } from '@/types/chart';

interface DiskChartProps {
  data: DiskData[];
  timeRange?: TimeRange;
  isDark?: boolean;
}

export function DiskChart({ data, timeRange = '1h', isDark = false }: DiskChartProps) {
  const theme = getChartTheme(isDark);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => formatXAxisLabel(timestamp, timeRange)}
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="left"
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
            label={{ value: 'I/O (MB/s)', angle: -90, position: 'insideLeft', fill: theme.textColor }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
            label={{ value: '사용률 (%)', angle: 90, position: 'insideRight', fill: theme.textColor }}
          />
          <Tooltip
            content={<CustomTooltip valueFormatter={(value) => value.toFixed(2)} />}
          />
          <Legend />

          <Bar
            yAxisId="left"
            dataKey="readIO"
            name="읽기 I/O"
            fill="#3B82F6"
            barSize={20}
          />
          <Bar
            yAxisId="left"
            dataKey="writeIO"
            name="쓰기 I/O"
            fill="#8B5CF6"
            barSize={20}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="usage"
            name="디스크 사용률"
            stroke={theme.errorColor}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
