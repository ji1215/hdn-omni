'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatXAxisLabel, getChartTheme } from '@/lib/utils/chartUtils';
import { CustomTooltip } from './CustomTooltip';
import type { TimeRange, NetworkData } from '@/types/chart';

interface NetworkChartProps {
  data: NetworkData[];
  timeRange?: TimeRange;
  isDark?: boolean;
}

export function NetworkChart({ data, timeRange = '1h', isDark = false }: NetworkChartProps) {
  const theme = getChartTheme(isDark);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.successColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.successColor} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.primaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.primaryColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => formatXAxisLabel(timestamp, timeRange)}
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
            label={{ value: '대역폭 (Mbps)', angle: -90, position: 'insideLeft', fill: theme.textColor }}
          />
          <Tooltip
            content={<CustomTooltip unit="Mbps" valueFormatter={(value) => value.toFixed(2)} />}
          />
          <Legend />

          <Area
            type="monotone"
            dataKey="sent"
            name="송신"
            stroke={theme.successColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSent)"
          />
          <Area
            type="monotone"
            dataKey="received"
            name="수신"
            stroke={theme.primaryColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReceived)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
