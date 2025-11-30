import { useState, useCallback } from 'react';
import { useErrorHandler } from './use-error-handler';

export interface BatchResult<T> {
  success: T[];
  failed: Array<{ item: T; error: Error }>;
}

export function useBatchOperation<T>() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { handleError } = useErrorHandler();

  const executeBatch = useCallback(
    async <R>(
      items: T[],
      operation: (item: T, index: number) => Promise<R>,
      options?: {
        onProgress?: (completed: number, total: number) => void;
        continueOnError?: boolean;
      }
    ): Promise<BatchResult<R>> => {
      setIsProcessing(true);
      setProgress(0);

      const results: BatchResult<R> = {
        success: [],
        failed: [],
      };

      const total = items.length;
      let completed = 0;

      for (let i = 0; i < items.length; i++) {
        try {
          const result = await operation(items[i], i);
          results.success.push(result);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          results.failed.push({ item: items[i] as unknown as R, error: err });

          handleError(err, {
            batchOperation: true,
            itemIndex: i,
            totalItems: total,
          });

          if (!options?.continueOnError) {
            break;
          }
        } finally {
          completed++;
          setProgress(Math.round((completed / total) * 100));
          options?.onProgress?.(completed, total);
        }
      }

      setIsProcessing(false);
      return results;
    },
    [handleError]
  );

  const executeAllSettled = useCallback(
    async <R>(
      items: T[],
      operation: (item: T, index: number) => Promise<R>
    ): Promise<BatchResult<R>> => {
      setIsProcessing(true);
      setProgress(0);

      const promises = items.map((item, index) =>
        operation(item, index)
          .then((result) => ({ status: 'fulfilled' as const, value: result, item }))
          .catch((error) => ({
            status: 'rejected' as const,
            error: error instanceof Error ? error : new Error(String(error)),
            item,
          }))
      );

      const results = await Promise.all(promises);

      const batchResult: BatchResult<R> = {
        success: [],
        failed: [],
      };

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          batchResult.success.push(result.value);
        } else {
          batchResult.failed.push({
            item: result.item as unknown as R,
            error: result.error,
          });

          handleError(result.error, {
            batchOperation: true,
          });
        }

        setProgress(Math.round(((batchResult.success.length + batchResult.failed.length) / items.length) * 100));
      });

      setIsProcessing(false);
      return batchResult;
    },
    [handleError]
  );

  return {
    executeBatch,
    executeAllSettled,
    isProcessing,
    progress,
  };
}
