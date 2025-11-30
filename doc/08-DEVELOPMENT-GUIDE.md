# 8. 개발 가이드라인

## 코드 컨벤션

### TypeScript

- **모든 코드는 TypeScript로 작성**
- `any` 타입 사용 금지 (불가피한 경우 주석으로 이유 명시)
- 인터페이스는 `types/` 폴더에 정의
- 객체 형태는 `interface`, 유니온/인터섹션은 `type` 사용

```typescript
// Good
interface User {
  id: string;
  name: string;
  role: UserRole;
}

type UserRole = 'admin' | 'user' | 'guest';

// Bad
const user: any = {};
```

### React 컴포넌트

- 함수형 컴포넌트 사용
- Props 인터페이스는 컴포넌트 파일 내에 정의
- `'use client'` 지시어는 필요한 경우에만 사용

```tsx
'use client';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
}
```

### 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `DeviceTable.tsx` |
| 페이지 | `page.tsx` | `app/(dashboard)/dashboard/page.tsx` |
| 훅 | camelCase + use 접두사 | `useUsers.ts` |
| 서비스 | camelCase | `deviceService.ts` |
| 타입 | camelCase | `device.ts` |
| 유틸리티 | camelCase | `httpClient.ts` |

### 폴더 구조

- 기능별로 컴포넌트 그룹화
- 각 폴더에 `index.ts`로 내보내기 관리
- 공통 컴포넌트는 `components/common/`에 배치

---

## 새 기능 추가 방법

### 1. 새 페이지 추가

```bash
# 1. 페이지 파일 생성
app/(dashboard)/새페이지/page.tsx

# 2. 컴포넌트 폴더 생성 (필요시)
components/새페이지/
├── ComponentA.tsx
├── ComponentB.tsx
└── index.ts
```

**페이지 기본 구조**:
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/common';

export default function NewPage() {
  return (
    <div className="space-y-6 p-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">페이지 제목</h1>
          <p className="text-gray-500">페이지 설명</p>
        </div>
        <Button variant="primary">액션</Button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="card">
        {/* ... */}
      </div>
    </div>
  );
}
```

### 2. 사이드바에 메뉴 추가

`components/layout/Sidebar.tsx`의 `navigation` 배열에 추가:

```typescript
const navigation = [
  // 기존 메뉴...
  {
    name: '새 메뉴',
    href: '/새페이지',
    icon: SomeIcon,
    children: [  // 하위 메뉴가 있는 경우
      { name: '하위 1', href: '/새페이지/하위1', icon: Icon1 },
      { name: '하위 2', href: '/새페이지/하위2', icon: Icon2 },
    ],
  },
];
```

### 3. 새 API 서비스 추가

```typescript
// services/newService.ts
import { api } from '@/lib/httpClient';
import type { NewType } from '@/types/new';

const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || true;

export const newService = {
  async getAll(): Promise<NewType[]> {
    if (USE_MOCK_DATA) {
      return mockData;
    }
    const response = await api.get<NewType[]>('/api/new');
    return response.data.data;
  },

  async create(data: CreateNewRequest): Promise<NewType> {
    const response = await api.post<NewType>('/api/new', data);
    return response.data.data;
  },

  // ...
};
```

### 4. React Query 훅 추가

```typescript
// hooks/useNew.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newService } from '@/services/newService';

export function useNewItems() {
  return useQuery({
    queryKey: ['newItems'],
    queryFn: newService.getAll,
  });
}

export function useCreateNewItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newItems'] });
    },
  });
}
```

### 5. 타입 정의 추가

```typescript
// types/new.ts
export interface NewType {
  id: string;
  name: string;
  // ...
}

export interface CreateNewRequest {
  name: string;
  // ...
}

// Zod 스키마 (유효성 검사용)
import { z } from 'zod';

export const NewTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '이름을 입력하세요'),
});
```

---

## 디버깅 팁

### 1. React Developer Tools

Chrome 확장 프로그램 설치 후 컴포넌트 트리와 props/state 확인

### 2. React Query Devtools

자동으로 포함됨. 브라우저에서 쿼리 상태, 캐시 확인:
```tsx
// providers/query-provider.tsx에서 활성화됨
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

### 3. 네트워크 요청 확인

`lib/httpClient.ts`에서 개발 모드일 때 자동 로깅:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[API Request]', { method, url, data });
}
```

### 4. Zustand 스토어 디버깅

```typescript
// 스토어가 devtools 미들웨어를 사용하므로
// Redux DevTools 확장으로 상태 변화 추적 가능
```

### 5. TypeScript 에러

```bash
# 타입 체크만 실행
npm run type-check

# VSCode에서 실시간 타입 에러 확인
# 하단 상태바의 TypeScript 버전 확인
```

---

## 자주 발생하는 문제

### 1. Hydration 에러

**원인**: 서버와 클라이언트 렌더링 결과가 다름

**해결**:
```tsx
'use client';
import { useState, useEffect } from 'react';

function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <div>{/* 클라이언트 전용 콘텐츠 */}</div>;
}
```

### 2. localStorage 접근 에러

**원인**: 서버 컴포넌트에서 브라우저 API 접근

**해결**:
```typescript
// 클라이언트 확인
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

### 3. 이미지 최적화 경고

**해결**: `next/image` 사용
```tsx
import Image from 'next/image';

<Image
  src="/image.png"
  alt="설명"
  width={200}
  height={100}
/>
```

### 4. 빌드 에러

```bash
# 빌드 전 타입 체크
npm run type-check

# 빌드 실행
npm run build

# 에러 발생 시 해당 파일 수정 후 재빌드
```

---

## 개발 완료 시 체크리스트

1. **타입 체크**: `npm run type-check` 통과
2. **린트**: `npm run lint` 통과
3. **빌드**: `npm run build` 성공
4. **반응형**: 모바일/태블릿/데스크톱 확인
5. **다크 모드**: 라이트/다크 모드 모두 확인
6. **에러 처리**: 로딩/에러 상태 처리 확인
7. **접근성**: 키보드 네비게이션, aria 속성 확인

---

## 유용한 VSCode 확장

1. **ES7+ React/Redux/React-Native snippets**: 코드 스니펫
2. **Tailwind CSS IntelliSense**: Tailwind 자동완성
3. **TypeScript Importer**: 자동 import
4. **Prettier**: 코드 포맷팅
5. **ESLint**: 린팅

---

## Git 커밋 규칙

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
style: 스타일 변경 (포맷팅 등)
docs: 문서 수정
chore: 설정 변경
```

예시:
```bash
git commit -m "feat: 디바이스 일괄 삭제 기능 추가"
git commit -m "fix: 사용자 목록 페이지네이션 버그 수정"
```

---

## 도움이 필요할 때

1. **프로젝트 루트의 문서 확인**:
   - `CLAUDE.md`: 개발 가이드라인
   - `SDN_Controller_PRD.md`: 요구사항 문서
   - `ERROR_HANDLING_GUIDE.md`: 에러 처리 가이드

2. **공식 문서**:
   - [Next.js 문서](https://nextjs.org/docs)
   - [Tailwind CSS 문서](https://tailwindcss.com/docs)
   - [React Query 문서](https://tanstack.com/query/latest)
   - [Zustand 문서](https://docs.pmnd.rs/zustand)

3. **기존 코드 참고**:
   - 비슷한 기능의 기존 컴포넌트/페이지 참고
   - `components/` 폴더의 패턴 확인
