'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { getChartTheme } from '@/lib/utils/chartUtils';
import { CustomTooltip } from './CustomTooltip';
import type { TrafficSource, TrafficDestination } from '@/types/traffic';

interface TopTrafficBarChartProps {
  data: TrafficSource[] | TrafficDestination[];
  type: 'source' | 'destination';
  isDark?: boolean;
  maxItems?: number;
}

export function TopTrafficBarChart({
  data,
  type,
  isDark = false,
  maxItems = 10,
}: TopTrafficBarChartProps) {
  const theme = getChartTheme(isDark);

  // 데이터 정렬 및 상위 N개 필터링
  const sortedData = [...data]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, maxItems)
    .map((item, index) => ({
      ip: item.ip,
      hostname: item.hostname || item.ip,
      bytes: item.bytes,
      packets: item.packets,
      flows: item.flows,
      rank: index + 1,
    }));

  // 바이트를 읽기 쉬운 형식으로 변환 (KB, MB, GB)
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // IP 주소를 짧게 표시 (옵션)
  const formatIpLabel = (ip: string): string => {
    // IPv4의 경우 마지막 옥텟만 표시하거나 전체 표시
    return ip.length > 15 ? `...${ip.slice(-12)}` : ip;
  };

  // 커스텀 툴팁
  const CustomTrafficTooltip = ({ active, payload }: any) => {
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
          #{data.rank} {data.hostname}
        </p>
        <div className="space-y-1 text-sm">
          <p style={{ color: theme.textColor }}>
            <span className="font-medium">IP:</span> {data.ip}
          </p>
          <p style={{ color: theme.primaryColor }}>
            <span className="font-medium">바이트:</span> {formatBytes(data.bytes)}
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

  // 바 색상 (그라데이션 효과)
  const getBarColor = (index: number): string => {
    // 상위 3개는 특별한 색상
    if (index === 0) return theme.errorColor; // 1등: 빨강
    if (index === 1) return theme.warningColor; // 2등: 주황
    if (index === 2) return '#FBBF24'; // 3등: 노랑
    return theme.primaryColor; // 나머지: 파랑
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            type="number"
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
            tickFormatter={formatBytes}
          />
          <YAxis
            type="category"
            dataKey="hostname"
            stroke={theme.textColor}
            style={{ fontSize: '11px' }}
            width={120}
            tickFormatter={formatIpLabel}
          />
          <Tooltip content={<CustomTrafficTooltip />} cursor={{ fill: theme.gridColor }} />
          <Legend
            verticalAlign="top"
            content={() => (
              <div className="text-center mb-2" style={{ color: theme.textColor }}>
                <span className="font-semibold">
                  Top {maxItems} 트래픽 {type === 'source' ? '소스' : '목적지'}
                </span>
              </div>
            )}
          />
          <Bar
            dataKey="bytes"
            name="바이트"
            radius={[0, 8, 8, 0]}
            animationDuration={500}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
