'use client';

import { useEffect } from 'react';
import { errorLogger } from '@/lib/errors/error-logger';
import { DefaultErrorFallback } from '@/components/errors/error-boundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to our error logger
    errorLogger.log(error, {
      page: 'root',
    }, error.digest);
  }, [error]);

  return <DefaultErrorFallback error={error} resetError={reset} digest={error.digest} />;
}