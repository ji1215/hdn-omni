'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { getChartTheme } from '@/lib/utils/chartUtils';
import type { TimeSeriesData } from '@/types/traffic';

interface TrafficPatternChartProps {
  data: TimeSeriesData[];
  isDark?: boolean;
  showGradient?: boolean;
  timeRange?: '1h' | '6h' | '24h' | '7d';
}

export function TrafficPatternChart({
  data,
  isDark = false,
  showGradient = true,
  timeRange = '24h',
}: TrafficPatternChartProps) {
  const theme = getChartTheme(isDark);

  // 데이터 정렬 (timestamp 기준)
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

  // 피크 시간대 찾기
  const peakValue = Math.max(...sortedData.map((d) => d.value));
  const peakThreshold = peakValue * 0.8; // 피크의 80% 이상을 피크 시간대로 간주

  // 차트용 데이터 변환
  const chartData = sortedData.map((item) => ({
    timestamp: item.timestamp,
    value: item.value,
    label: item.label,
    isPeak: item.value >= peakThreshold,
  }));

  // 바이트를 읽기 쉬운 형식으로 변환
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // X축 라벨 포맷
  const formatXAxisLabel = (timestamp: number): string => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1h':
      case '6h':
        return format(date, 'HH:mm');
      case '24h':
        return format(date, 'HH:mm');
      case '7d':
        return format(date, 'MM/dd');
      default:
        return format(date, 'HH:mm');
    }
  };

  // 커스텀 툴팁
  const CustomPatternTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const date = new Date(data.timestamp);

    return (
      <div
        className="rounded-lg border p-3 shadow-lg"
        style={{
          backgroundColor: theme.backgroundColor,
          borderColor: theme.gridColor,
        }}
      >
        <p className="font-semibold mb-2" style={{ color: theme.textColor }}>
          {format(date, 'yyyy-MM-dd HH:mm:ss')}
        </p>
        <div className="space-y-1 text-sm">
          {data.label && (
            <p className="mb-1" style={{ color: theme.textColor }}>
              {data.label}
            </p>
          )}
          <p style={{ color: theme.primaryColor }}>
            <span className="font-medium">트래픽:</span> {formatBytes(data.value)}
          </p>
          {data.isPeak && (
            <p
              className="text-xs font-semibold mt-2"
              style={{ color: theme.errorColor }}
            >
              ⚡ 피크 시간대
            </p>
          )}
        </div>
      </div>
    );
  };

  // 그라디언트 ID
  const gradientId = `trafficGradient-${isDark ? 'dark' : 'light'}`;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.primaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={theme.primaryColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxisLabel}
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={theme.textColor}
            style={{ fontSize: '12px' }}
            tickFormatter={formatBytes}
            label={{
              value: '트래픽 양',
              angle: -90,
              position: 'insideLeft',
              fill: theme.textColor,
            }}
          />
          <Tooltip content={<CustomPatternTooltip />} />
          <Legend
            verticalAlign="top"
            content={() => (
              <div className="text-center mb-2" style={{ color: theme.textColor }}>
                <span className="font-semibold">시간대별 트래픽 패턴</span>
              </div>
            )}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="트래픽"
            stroke={theme.primaryColor}
            strokeWidth={2}
            fill={showGradient ? `url(#${gradientId})` : theme.primaryColor}
            fillOpacity={showGradient ? 1 : 0.3}
            animationDuration={1000}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isPeak) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={theme.errorColor}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }
              return null;
            }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
