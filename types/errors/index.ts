export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ErrorCategory =
  | 'network'
  | 'api'
  | 'validation'
  | 'auth'
  | 'runtime'
  | 'performance'
  | 'permission'
  | 'unknown';

export interface ErrorContext {
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  sessionId?: string;
  environment: 'development' | 'production';
  [key: string]: unknown;
}

export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  digest?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  digest?: string;
}

export interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: Error, attempt: number) => boolean;
}
