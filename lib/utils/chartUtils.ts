import { format } from 'date-fns';
import type { TimeRange, ChartTheme } from '@/types/chart';

/**
 * Format X-axis time label based on selected time range
 */
export function formatXAxisLabel(timestamp: number, timeRange: TimeRange): string {
  const date = new Date(timestamp);

  switch (timeRange) {
    case '1h':
    case '6h':
    case '24h':
      return format(date, 'HH:mm');
    case '7d':
    case '30d':
      return format(date, 'MM/dd');
    default:
      return format(date, 'HH:mm');
  }
}

/**
 * Format tooltip timestamp
 */
export function formatTooltipTimestamp(timestamp: number): string {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Format value with unit
 */
export function formatValue(value: number, unit?: string, decimals: number = 2): string {
  const formatted = value.toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Get chart theme colors based on dark mode
 */
export function getChartTheme(isDark: boolean): ChartTheme {
  return {
    textColor: isDark ? '#E5E7EB' : '#374151',
    gridColor: isDark ? '#374151' : '#E5E7EB',
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    primaryColor: '#2563EB',
    secondaryColor: '#7C3AED',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
  };
}

/**
 * Export chart data to CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export chart to PNG image
 */
export function exportChartToPNG(chartRef: HTMLElement, filename: string): void {
  // This would require html2canvas or similar library
  // For now, we'll just create a placeholder
  console.log('Export to PNG:', filename, chartRef);
  // TODO: Implement with html2canvas when needed
}

/**
 * Generate mock CPU data for testing
 */
export function generateMockCPUData(count: number = 20): Array<{ timestamp: number; usage: number }> {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: now - (count - i) * 5000,
    usage: Math.random() * 100,
  }));
}

/**
 * Generate mock memory data
 */
export function generateMockMemoryData() {
  const total = 16384; // 16 GB in MB
  const used = Math.random() * 8000 + 4000;
  const buffer = Math.random() * 2000 + 1000;
  const free = total - used - buffer;

  return { total, used, buffer, free };
}

/**
 * Generate mock disk data
 */
export function generateMockDiskData(count: number = 20) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: now - (count - i) * 5000,
    readIO: Math.random() * 500,
    writeIO: Math.random() * 300,
    usage: Math.random() * 40 + 40, // 40-80%
  }));
}

/**
 * Generate mock network data
 */
export function generateMockNetworkData(count: number = 20) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: now - (count - i) * 5000,
    sent: Math.random() * 1000,
    received: Math.random() * 1500,
  }));
}
