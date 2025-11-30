import type { ErrorLog, ErrorContext, ErrorSeverity, ErrorCategory } from '@/types/errors';
import {
  classifyError,
  determineSeverity,
  sanitizeErrorForLogging,
  generateErrorId,
  shouldSendToErrorService,
} from './error-utils';

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs: number = 100;
  private environment: 'development' | 'production';

  constructor() {
    this.environment =
      process.env.NODE_ENV === 'production' ? 'production' : 'development';
  }

  private createErrorContext(): ErrorContext {
    const context: ErrorContext = {
      timestamp: Date.now(),
      environment: this.environment,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    return context;
  }

  public log(
    error: Error,
    customContext?: Partial<ErrorContext>,
    digest?: string
  ): ErrorLog {
    const category = classifyError(error);
    const severity = determineSeverity(error, category);
    const sanitized = sanitizeErrorForLogging(error);
    const context = { ...this.createErrorContext(), ...customContext };

    const errorLog: ErrorLog = {
      id: generateErrorId(),
      message: sanitized.message,
      stack: sanitized.stack,
      severity,
      category,
      context,
      digest,
    };

    // Add to in-memory logs
    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging
    if (this.environment === 'development') {
      console.group(`[${severity.toUpperCase()}] ${category} Error`);
      console.error('Message:', errorLog.message);
      console.error('Stack:', errorLog.stack);
      console.error('Context:', errorLog.context);
      console.groupEnd();
    } else {
      console.error(`[${errorLog.id}] ${errorLog.message}`);
    }

    // Send to external service if needed
    if (shouldSendToErrorService(error, this.environment)) {
      this.sendToErrorService(errorLog);
    }

    return errorLog;
  }

  private async sendToErrorService(errorLog: ErrorLog): Promise<void> {
    try {
      // This is a placeholder for external error logging service (e.g., Sentry)
      // You can implement actual API calls here
      if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog),
        }).catch(() => {
          // Silently fail if error reporting fails
        });
      }
    } catch {
      // Don't throw errors from error logging
    }
  }

  public getLogs(severity?: ErrorSeverity, category?: ErrorCategory): ErrorLog[] {
    let filtered = [...this.logs];

    if (severity) {
      filtered = filtered.filter((log) => log.severity === severity);
    }

    if (category) {
      filtered = filtered.filter((log) => log.category === category);
    }

    return filtered.sort((a, b) => b.context.timestamp - a.context.timestamp);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
  } {
    const stats = {
      total: this.logs.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      } as Record<ErrorSeverity, number>,
      byCategory: {
        network: 0,
        api: 0,
        validation: 0,
        auth: 0,
        runtime: 0,
        performance: 0,
        permission: 0,
        unknown: 0,
      } as Record<ErrorCategory, number>,
    };

    this.logs.forEach((log) => {
      stats.bySeverity[log.severity]++;
      stats.byCategory[log.category]++;
    });

    return stats;
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();
