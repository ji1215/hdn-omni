# 에러 처리 및 로깅 시스템 가이드

## 개요

hdn-omni 프로젝트에 포괄적인 에러 처리 및 로깅 시스템이 구현되었습니다. 이 시스템은 프로덕션 환경에서 안정적인 애플리케이션 운영을 위한 다양한 기능을 제공합니다.

## 주요 기능

### 1. 에러 바운더리 (Error Boundaries)

React 에러 바운더리를 활용하여 컴포넌트 트리에서 발생하는 에러를 캐치하고 처리합니다.

**위치**: `components/errors/error-boundary.tsx`

**사용 예시**:
```tsx
import { ErrorBoundary, PageErrorFallback } from '@/components/errors';

<ErrorBoundary fallback={PageErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

**제공되는 폴백 컴포넌트**:
- `DefaultErrorFallback`: 기본 에러 UI
- `PageErrorFallback`: 페이지 레벨 에러 UI
- `LayoutErrorFallback`: 레이아웃 레벨 에러 UI
- `ServerErrorFallback`: 서버 에러 UI (500, 502, 503, 504)
- `OfflineFallback`: 오프라인 상태 UI

### 2. 전역 에러 핸들러

`window.onerror`와 `unhandledrejection` 이벤트를 캐치하여 처리되지 않은 에러를 로깅합니다.

**위치**: `lib/errors/global-error-handler.ts`

**기능**:
- 중복 에러 방지 (5초 캐시)
- 자동 에러 로깅
- 개발 환경에서 콘솔 에러 인터셉팅

**초기화**: `ErrorProvider`에서 자동으로 초기화됩니다.

### 3. Axios 인터셉터 에러 처리

HTTP 클라이언트에 통합된 에러 처리 시스템입니다.

**위치**: `lib/httpClient.ts`

**기능**:
- HTTP 상태 코드별 에러 분류 (400, 401, 403, 404, 429, 500 등)
- 자동 재시도 로직 (네트워크 에러, 타임아웃)
- 토큰 갱신 처리 (401 에러)
- Rate limiting
- 에러 로깅

### 4. 네트워크 모니터링

네트워크 연결 상태를 실시간으로 모니터링합니다.

**위치**: `lib/errors/network-monitor.ts`

**사용 예시**:
```tsx
import { networkMonitor } from '@/lib/errors';

// 현재 네트워크 상태 확인
const isOnline = networkMonitor.isOnline();

// 네트워크 상태 변화 구독
const unsubscribe = networkMonitor.subscribe((online) => {
  console.log('Network status:', online);
});

// 연결 대기
await networkMonitor.waitForConnection(30000);
```

### 5. 재시도 핸들러

실패한 작업을 exponential backoff 알고리즘으로 재시도합니다.

**위치**: `lib/errors/retry-handler.ts`

**사용 예시**:
```tsx
import { withRetry } from '@/lib/errors';

const result = await withRetry(
  async () => {
    return await fetchData();
  },
  {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  }
);
```

### 6. 성능 모니터링

Web Vitals (LCP, INP, CLS, FCP, TTFB)를 모니터링하고 임계값을 초과하면 로깅합니다.

**위치**: `lib/errors/performance-monitor.ts`

**모니터링 메트릭**:
- LCP (Largest Contentful Paint): < 2.5s
- INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.8s
- TTFB (Time to First Byte): < 800ms

**초기화**: `ErrorProvider`에서 자동으로 초기화됩니다.

### 7. 에러 로거

중앙 집중식 에러 로깅 시스템입니다.

**위치**: `lib/errors/error-logger.ts`

**기능**:
- 에러 분류 (severity, category)
- 에러 정보 수집 (stack trace, context)
- 민감 정보 필터링
- 개발/프로덕션 환경 구분
- 외부 로깅 서비스 연동 준비 (Sentry 등)

**사용 예시**:
```tsx
import { errorLogger } from '@/lib/errors';

errorLogger.log(error, {
  userId: 'user-123',
  customContext: 'value',
});

// 통계 조회
const stats = errorLogger.getStats();
console.log(stats.bySeverity, stats.byCategory);

// 최근 에러 조회
const recentErrors = errorLogger.getLogs();
```

### 8. 커스텀 훅

#### useErrorHandler
에러 처리를 위한 React 훅입니다.

**위치**: `hooks/use-error-handler.ts`

**사용 예시**:
```tsx
import { useErrorHandler } from '@/hooks/use-error-handler';

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler();

  const fetchData = async () => {
    const result = await handleAsyncError(
      async () => {
        return await api.get('/data');
      },
      { componentName: 'MyComponent' }
    );
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

#### useBatchOperation
배치 작업 에러 처리를 위한 훅입니다.

**위치**: `hooks/use-batch-operation.ts`

**사용 예시**:
```tsx
import { useBatchOperation } from '@/hooks/use-batch-operation';

function BulkUpload() {
  const { executeBatch, isProcessing, progress } = useBatchOperation();

  const uploadFiles = async (files) => {
    const result = await executeBatch(
      files,
      async (file, index) => {
        return await uploadFile(file);
      },
      {
        continueOnError: true,
        onProgress: (completed, total) => {
          console.log(`${completed}/${total} completed`);
        },
      }
    );

    console.log('Success:', result.success.length);
    console.log('Failed:', result.failed.length);
  };

  return (
    <div>
      {isProcessing && <div>Progress: {progress}%</div>}
    </div>
  );
}
```

### 9. 에러 모니터링 대시보드

실시간 에러 및 성능 모니터링 대시보드입니다.

**위치**: `components/errors/error-dashboard.tsx`

**기능**:
- 에러 통계 (총 에러 수, severity별, category별)
- 성능 메트릭 표시
- 최근 에러 목록
- 에러 로그 초기화

**사용 예시**:
```tsx
import { ErrorDashboard } from '@/components/errors';

function AdminPage() {
  return (
    <div>
      <h1>시스템 모니터링</h1>
      <ErrorDashboard />
    </div>
  );
}
```

### 10. 에러 상황별 UI

#### 404 페이지
**위치**: `app/not-found.tsx`

#### 오프라인 모달
**위치**: `components/errors/offline-fallback.tsx`
- 네트워크 연결이 끊어지면 자동으로 표시
- 연결이 복구되면 자동으로 사라짐

#### 서버 에러 페이지
**위치**: `components/errors/server-error-fallback.tsx`
- 500, 502, 503, 504 에러 처리
- 상황별 맞춤 메시지

## 에러 분류 시스템

### Severity (심각도)
- `critical`: 치명적 에러 (시스템 크래시 등)
- `high`: 높은 심각도 (인증 실패, 권한 에러 등)
- `medium`: 중간 심각도 (API 에러, 네트워크 에러 등)
- `low`: 낮은 심각도 (유효성 검사 에러 등)

### Category (카테고리)
- `network`: 네트워크 연결 에러
- `api`: API 호출 에러
- `validation`: 데이터 유효성 검사 에러
- `auth`: 인증/인가 에러
- `runtime`: 런타임 에러
- `performance`: 성능 에러
- `permission`: 권한 에러
- `unknown`: 알 수 없는 에러

## 환경별 동작

### 개발 환경 (Development)
- 상세한 에러 메시지 표시
- 스택 트레이스 포함
- 콘솔에 에러 로깅
- 외부 로깅 서비스 비활성화

### 프로덕션 환경 (Production)
- 사용자 친화적 에러 메시지
- 스택 트레이스 숨김
- 콘솔 에러 최소화
- 외부 로깅 서비스 활성화 (medium 이상)

## 설정 및 초기화

에러 처리 시스템은 `app/layout.tsx`에서 `ErrorProvider`를 통해 자동으로 초기화됩니다:

```tsx
import { ErrorProvider } from '@/providers/error-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorProvider>
          {children}
        </ErrorProvider>
      </body>
    </html>
  );
}
```

## 외부 로깅 서비스 연동 (옵션)

Sentry, LogRocket 등의 외부 로깅 서비스를 연동하려면 `lib/errors/error-logger.ts`의 `sendToErrorService` 메서드를 수정하세요:

```typescript
private async sendToErrorService(errorLog: ErrorLog): Promise<void> {
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    // Sentry 예시
    if (window.Sentry) {
      window.Sentry.captureException(errorLog, {
        level: errorLog.severity,
        tags: {
          category: errorLog.category,
        },
        extra: errorLog.context,
      });
    }
  }
}
```

## Best Practices

1. **에러 바운더리 사용**: 각 주요 컴포넌트를 ErrorBoundary로 래핑하세요.
2. **커스텀 훅 활용**: useErrorHandler 훅을 사용하여 일관된 에러 처리를 구현하세요.
3. **의미있는 컨텍스트 추가**: 에러 로깅 시 사용자 ID, 작업 내용 등 디버깅에 유용한 정보를 포함하세요.
4. **에러 대시보드 모니터링**: 관리자 페이지에 ErrorDashboard를 추가하여 실시간으로 에러를 모니터링하세요.
5. **성능 메트릭 주시**: Web Vitals 임계값을 초과하는 페이지를 개선하세요.

## 문제 해결

### 에러가 로깅되지 않는 경우
1. ErrorProvider가 올바르게 초기화되었는지 확인하세요.
2. 브라우저 콘솔에서 GlobalErrorHandler 초기화 메시지를 확인하세요.

### 네트워크 에러가 감지되지 않는 경우
1. OfflineFallback 컴포넌트가 렌더링되는지 확인하세요.
2. networkMonitor.isOnline() 메서드로 현재 상태를 확인하세요.

### 성능 메트릭이 표시되지 않는 경우
1. web-vitals 패키지가 설치되었는지 확인하세요.
2. PerformanceMonitor가 초기화되었는지 확인하세요.

## 참고 자료

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Web Vitals](https://web.dev/vitals/)
