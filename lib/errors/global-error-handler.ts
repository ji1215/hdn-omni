import { errorLogger } from './error-logger';

interface ErrorEvent {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

class GlobalErrorHandler {
  private initialized = false;
  private errorCache = new Set<string>();
  private cacheTimeout = 5000; // 5 seconds to prevent duplicate error reports

  public initialize(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.setupErrorHandlers();
    this.setupUnhandledRejectionHandler();
    this.setupConsoleErrorInterceptor();
    this.initialized = true;

    console.log('[GlobalErrorHandler] Initialized');
  }

  private setupErrorHandlers(): void {
    window.addEventListener('error', (event) => {
      const errorEvent = event as ErrorEvent;

      const error = errorEvent.error || new Error(errorEvent.message || 'Unknown error');
      const errorKey = this.generateErrorKey(error);

      // Prevent duplicate error reports
      if (this.errorCache.has(errorKey)) {
        return;
      }

      this.errorCache.add(errorKey);
      setTimeout(() => {
        this.errorCache.delete(errorKey);
      }, this.cacheTimeout);

      errorLogger.log(error, {
        filename: errorEvent.filename,
        lineno: errorEvent.lineno,
        colno: errorEvent.colno,
      });
    });
  }

  private setupUnhandledRejectionHandler(): void {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      event.preventDefault();

      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason) || 'Unhandled Promise Rejection');

      const errorKey = this.generateErrorKey(error);

      // Prevent duplicate error reports
      if (this.errorCache.has(errorKey)) {
        return;
      }

      this.errorCache.add(errorKey);
      setTimeout(() => {
        this.errorCache.delete(errorKey);
      }, this.cacheTimeout);

      errorLogger.log(error, {
        promiseRejection: true,
      });
    });
  }

  private setupConsoleErrorInterceptor(): void {
    if (process.env.NODE_ENV === 'production') {
      const originalConsoleError = console.error;

      console.error = (...args: unknown[]) => {
        // Call original console.error
        originalConsoleError.apply(console, args);

        // Log to error service if it's an Error object
        const firstArg = args[0];
        if (firstArg instanceof Error) {
          const errorKey = this.generateErrorKey(firstArg);

          if (!this.errorCache.has(errorKey)) {
            this.errorCache.add(errorKey);
            setTimeout(() => {
              this.errorCache.delete(errorKey);
            }, this.cacheTimeout);

            errorLogger.log(firstArg, {
              consoleError: true,
            });
          }
        }
      };
    }
  }

  private generateErrorKey(error: Error): string {
    return `${error.name}:${error.message}:${error.stack?.split('\n')[1] || ''}`;
  }

  public cleanup(): void {
    if (!this.initialized) {
      return;
    }

    // Note: We don't remove event listeners as they should persist throughout the app lifecycle
    this.errorCache.clear();
    this.initialized = false;
  }
}

export const globalErrorHandler = new GlobalErrorHandler();
