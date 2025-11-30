'use client';

import { useEffect } from 'react';
import { globalErrorHandler } from '@/lib/errors/global-error-handler';
import { performanceMonitor } from '@/lib/errors/performance-monitor';
import { OfflineFallback } from '@/components/errors/offline-fallback';

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize global error handler
    globalErrorHandler.initialize();

    // Initialize performance monitoring
    performanceMonitor.initialize();

    return () => {
      globalErrorHandler.cleanup();
    };
  }, []);

  return (
    <>
      {children}
      <OfflineFallback />
    </>
  );
}
