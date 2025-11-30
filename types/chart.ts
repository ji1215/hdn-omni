/**
 * Chart-related type definitions
 */

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export interface CPUData {
  timestamp: number;
  usage: number; // 0-100%
}

export interface MemoryData {
  total: number; // in MB
  used: number;
  buffer: number;
  free: number;
}

export interface DiskData {
  timestamp: number;
  readIO: number; // MB/s
  writeIO: number; // MB/s
  usage: number; // 0-100%
}

export interface NetworkData {
  timestamp: number;
  sent: number; // Mbps
  received: number; // Mbps
}

export interface ChartTheme {
  textColor: string;
  gridColor: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
}

export interface ThresholdLine {
  value: number;
  label: string;
  color: string;
}

export interface TimeRangeOption {
  label: string;
  value: TimeRange;
  intervalMs: number;
}
