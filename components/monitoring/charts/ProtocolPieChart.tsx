'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { getChartTheme } from '@/lib/utils/chartUtils';
import type { ProtocolStats } from '@/types/traffic';

interface ProtocolPieChartProps {
  data: ProtocolStats[];
  isDark?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
}

// 프로토콜별 색상 정의
const PROTOCOL_COLORS: Record<string, string> = {
  TCP: '#2563EB', // Blue
  UDP: '#10B981', // Green
  ICMP: '#F59E0B', // Orange
  HTTP: '#8B5CF6', // Purple
  HTTPS: '#6366F1', // Indigo
  SSH: '#EC4899', // Pink
  DNS: '#14B8A6', // Teal
  FTP: '#F97316', // Orange
  TELNET: '#84CC16', // Lime
  OTHER: '#6B7280', // Gray
};

export function ProtocolPieChart({
  data,
  isDark = false,
  showLabels = true,
  showLegend = true,
}: ProtocolPieChartProps) {
  const theme = getChartTheme(isDark);

  // 데이터 정렬 (bytes 기준 내림차순)
  const sortedData = [...data].sort((a, b) => b.bytes - a.bytes);

  // 차트용 데이터 변환
  const chartData = sortedData.map((item) => ({
    name: item.protocol,
    value: item.bytes,
    percentage: item.percentage,
    packets: item.packets,
    flows: item.flows,
  }));

  // 바이트를 읽기 쉬운 형식으로 변환
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 커스텀 라벨 렌더링
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    if (percent < 0.05) return null; // 5% 미만은 라벨 표시 안함

    const RADIAN = Math.PI / 180;
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
        className="text-xs font-semibold"
        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // 커스텀 툴팁
  const CustomProtocolTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div
        className="rounded-lg border p-3 shadow-lg"
        style={{
          backgroundColor: theme.backgroundColor,
          borderColor: theme.gridColor,
        }}
      >
        <p className="font-semibold mb-2" style={{ color: theme.textColor }}>
          {data.name} 프로토콜
        </p>
        <div className="space-y-1 text-sm">
          <p style={{ color: PROTOCOL_COLORS[data.name] || theme.primaryColor }}>
            <span className="font-medium">비율:</span> {data.percentage.toFixed(2)}%
          </p>
          <p style={{ color: theme.textColor }}>
            <span className="font-medium">바이트:</span> {formatBytes(data.value)}
          </p>
          <p style={{ color: theme.textColor }}>
            <span className="font-medium">패킷:</span> {data.packets.toLocaleString()}
          </p>
          <p style={{ color: theme.textColor }}>
            <span className="font-medium">플로우:</span> {data.flows.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  // 커스텀 범례
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs" style={{ color: theme.textColor }}>
              {entry.value} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  // 센터 라벨 (총 트래픽)
  const totalBytes = chartData.reduce((sum, item) => sum + item.value, 0);

  const CenterLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-bold"
      >
        <tspan x="50%" dy="-0.5em" fontSize="14" fill={theme.textColor}>
          총 트래픽
        </tspan>
        <tspan x="50%" dy="1.5em" fontSize="16" fill={theme.primaryColor}>
          {formatBytes(totalBytes)}
        </tspan>
      </text>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderCustomLabel : false}
            outerRadius="70%"
            innerRadius="45%"
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PROTOCOL_COLORS[entry.name] || theme.primaryColor}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomProtocolTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
          <CenterLabel />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
