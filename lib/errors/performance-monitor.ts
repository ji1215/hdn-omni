import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { errorLogger } from './error-logger';

interface PerformanceThresholds {
  LCP: number; // Largest Contentful Paint
  INP: number; // Interaction to Next Paint (replaces FID)
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  LCP: 2500, // 2.5 seconds
  INP: 200, // 200 milliseconds
  CLS: 0.1, // 0.1 layout shift score
  FCP: 1800, // 1.8 seconds
  TTFB: 800, // 800 milliseconds
};

class PerformanceMonitor {
  private thresholds: PerformanceThresholds;
  private metrics: Map<string, Metric> = new Map();

  constructor(customThresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
  }

  public initialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Monitor Core Web Vitals
    onLCP(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    console.log('[PerformanceMonitor] Initialized with thresholds:', this.thresholds);
  }

  private handleMetric(metric: Metric): void {
    this.metrics.set(metric.name, metric);

    // Log metric
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      });
    }

    // Check if metric exceeds threshold
    const threshold = this.thresholds[metric.name as keyof PerformanceThresholds];
    if (threshold && metric.value > threshold) {
      this.reportPerformanceIssue(metric, threshold);
    }
  }

  private reportPerformanceIssue(metric: Metric, threshold: number): void {
    const error = new Error(
      `Performance threshold exceeded for ${metric.name}: ${metric.value.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
    error.name = 'PerformanceError';

    errorLogger.log(error, {
      metric: metric.name,
      value: metric.value,
      threshold,
      rating: metric.rating,
      delta: metric.delta,
      performanceIssue: true,
    });

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: Metric): void {
    // This is a placeholder for sending metrics to an analytics service
    // You can integrate with Google Analytics, Amplitude, etc.
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
        });
      }
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to send to analytics:', error);
    }
  }

  public getMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }

  public getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  public getPerformanceReport(): {
    metrics: Record<string, number>;
    thresholds: PerformanceThresholds;
    issues: string[];
  } {
    const metrics: Record<string, number> = {};
    const issues: string[] = [];

    this.metrics.forEach((metric, name) => {
      metrics[name] = metric.value;

      const threshold = this.thresholds[name as keyof PerformanceThresholds];
      if (threshold && metric.value > threshold) {
        issues.push(
          `${name}: ${metric.value.toFixed(2)} > ${threshold} (${metric.rating})`
        );
      }
    });

    return {
      metrics,
      thresholds: this.thresholds,
      issues,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
