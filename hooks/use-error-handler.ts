import { useCallback } from 'react';
import { errorLogger } from '@/lib/errors/error-logger';
import type { ErrorContext } from '@/types/errors';

export function useErrorHandler() {
  const handleError = useCallback(
    (error: Error, customContext?: Partial<ErrorContext>) => {
      errorLogger.log(error, customContext);
    },
    []
  );

  const handleAsyncError = useCallback(
    async <T>(
      operation: () => Promise<T>,
      customContext?: Partial<ErrorContext>
    ): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error(String(error)),
          customContext
        );
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}
