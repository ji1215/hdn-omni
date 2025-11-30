'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getChartTheme } from '@/lib/utils/chartUtils';
import { CustomTooltip } from './CustomTooltip';
import type { MemoryData } from '@/types/chart';

interface MemoryChartProps {
  data: MemoryData;
  isDark?: boolean;
}

export function MemoryChart({ data, isDark = false }: MemoryChartProps) {
  const theme = getChartTheme(isDark);

  const chartData = [
    { name: '사용 중', value: data.used, color: theme.errorColor },
    { name: '버퍼/캐시', value: data.buffer, color: theme.warningColor },
    { name: '여유', value: data.free, color: theme.successColor },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            innerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip unit="MB" valueFormatter={(value) => `${value.toFixed(0)} MB`} />}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const dataPoint = chartData.find(d => d.name === value);
              return `${value} (${dataPoint ? dataPoint.value.toFixed(0) : 0} MB)`;
            }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold"
            fill={theme.textColor}
          >
            {(data.total / 1024).toFixed(1)} GB
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
