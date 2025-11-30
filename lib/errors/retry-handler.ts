import type { RetryConfig } from '@/types/errors';
import { isRetryableError } from './error-utils';
import { networkMonitor } from './network-monitor';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: isRetryableError,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;
  let attempt = 0;

  while (attempt < finalConfig.maxAttempts) {
    try {
      // Check network status before attempting
      if (!networkMonitor.isOnline()) {
        await networkMonitor.waitForConnection(30000);
      }

      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      // Don't retry if not a retryable error
      if (!finalConfig.shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= finalConfig.maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(2, attempt - 1),
        finalConfig.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;

      console.log(
        `[Retry] Attempt ${attempt}/${finalConfig.maxAttempts} failed. Retrying in ${Math.round(totalDelay)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError!;
}

export function createRetryableRequest<T>(
  requestFn: () => Promise<T>,
  config?: Partial<RetryConfig>
): () => Promise<T> {
  return () => withRetry(requestFn, config);
}
