# 3. 핵심 개념 및 아키텍처

## Next.js App Router 이해

### 기본 개념

이 프로젝트는 **Next.js 14+의 App Router**를 사용합니다. 기존 Pages Router와 다른 점을 이해해야 합니다.

```
app/
├── layout.tsx      # 루트 레이아웃 (모든 페이지에 적용)
├── page.tsx        # 루트 페이지 (/)
└── (dashboard)/    # 라우트 그룹 (URL에 영향 없음)
    ├── layout.tsx  # 대시보드 레이아웃
    └── dashboard/
        └── page.tsx  # /dashboard 페이지
```

### 주요 규칙

1. **`page.tsx`**: 해당 경로의 페이지 컴포넌트
2. **`layout.tsx`**: 해당 경로 및 하위 경로에 적용되는 레이아웃
3. **`(폴더명)`**: 라우트 그룹, URL에 포함되지 않음
4. **`loading.tsx`**: 로딩 UI
5. **`error.tsx`**: 에러 UI
6. **`not-found.tsx`**: 404 UI

### Server vs Client Components

```tsx
// 기본: Server Component
export default function Page() {
  return <div>Server Component</div>;
}

// Client Component: 'use client' 선언 필요
'use client';

import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Client Component가 필요한 경우**:
- `useState`, `useEffect` 등 React 훅 사용
- 브라우저 API 접근 (localStorage, window 등)
- 이벤트 핸들러 사용 (onClick, onChange 등)

---

## 상태 관리

이 프로젝트는 두 가지 상태 관리 방식을 사용합니다:

### 1. Zustand - 클라이언트 상태

**용도**: 테마, 사용자 정보, 사이드바 상태 등 클라이언트 측 상태

**파일 위치**: `store/useStore.ts`

```typescript
// store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // ...
}

const useStore = create<GlobalState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      // ...
    }),
    { name: 'hdn-omni-storage' } // localStorage 키
  )
);

export default useStore;
```

**사용 방법**:
```tsx
'use client';
import useStore from '@/store/useStore';

function MyComponent() {
  const { theme, toggleTheme } = useStore();

  return (
    <button onClick={toggleTheme}>
      현재 테마: {theme}
    </button>
  );
}
```

### 2. TanStack Query (React Query) - 서버 상태

**용도**: API 데이터 페칭, 캐싱, 동기화

**Provider 설정**: `providers/query-provider.tsx`

```tsx
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/users';

// 조회
export function useUsers(page, pageSize, filters) {
  return useQuery({
    queryKey: ['users', page, pageSize, filters],
    queryFn: () => userService.getUsers(page, pageSize, filters),
  });
}

// 생성/수정/삭제
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

**사용 방법**:
```tsx
'use client';
import { useUsers, useCreateUser } from '@/hooks/useUsers';

function UsersPage() {
  const { data, isLoading, error } = useUsers(1, 10, {});
  const createUser = useCreateUser();

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <div>
      {data.data.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 인터랙션                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     React 컴포넌트                           │
│  (pages, components에서 hooks 사용)                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│      Zustand         │       │   React Query        │
│   (클라이언트 상태)    │       │   (서버 상태)         │
│                      │       │                      │
│  - 테마              │       │  - API 데이터         │
│  - 사이드바 상태      │       │  - 캐싱              │
│  - 사용자 세션        │       │  - 자동 갱신          │
└──────────────────────┘       └──────────────────────┘
                                         │
                                         ▼
                           ┌──────────────────────┐
                           │    Services Layer    │
                           │  (services/*.ts)     │
                           │                      │
                           │  - deviceService     │
                           │  - userService       │
                           │  - portService       │
                           └──────────────────────┘
                                         │
                                         ▼
                           ┌──────────────────────┐
                           │     HTTP Client      │
                           │  (lib/httpClient.ts) │
                           │                      │
                           │  - Axios             │
                           │  - Rate Limiting     │
                           │  - 자동 재시도        │
                           │  - 토큰 갱신          │
                           └──────────────────────┘
                                         │
                                         ▼
                           ┌──────────────────────┐
                           │    Backend API       │
                           │  (또는 Mock Data)    │
                           └──────────────────────┘
```

---

## Provider 구조

루트 레이아웃 (`app/layout.tsx`)에서 전체 애플리케이션을 Provider들로 감싸고 있습니다:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <ErrorProvider>           {/* 에러 처리 */}
          <ThemeProvider>         {/* 테마 (다크/라이트) */}
            <QueryProvider>       {/* React Query */}
              {children}
            </QueryProvider>
          </ThemeProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
```

### 각 Provider의 역할

1. **ErrorProvider** (`providers/error-provider.tsx`)
   - 전역 에러 처리
   - 에러 토스트 표시

2. **ThemeProvider** (`providers/theme-provider.tsx`)
   - 다크/라이트 모드 관리
   - 시스템 테마 감지
   - `document.documentElement`에 `dark` 클래스 추가/제거

3. **QueryProvider** (`providers/query-provider.tsx`)
   - React Query 클라이언트 설정
   - 기본 옵션: `staleTime: 5분`, `gcTime: 10분`

---

## 대시보드 레이아웃

`app/(dashboard)/layout.tsx`에서 사이드바와 헤더를 포함한 공통 레이아웃을 정의합니다:

```tsx
'use client';

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 인증 관련 참고사항

> **중요**: 현재 프로젝트에서 **실제 인증은 구현되지 않았습니다**.
>
> 이는 요구사항에 따른 의도적인 결정입니다:
> - 로그인 페이지는 항상 대시보드로 리다이렉트
> - UI/UX 및 폼 유효성 검사에 집중
> - 실제 인증 로직은 백엔드 연동 시 구현 예정

인증이 필요하다면 `lib/httpClient.ts`의 토큰 관리 로직과 `services/auth.ts`를 수정해야 합니다.
