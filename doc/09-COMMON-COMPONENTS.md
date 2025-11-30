# 9. 공통 컴포넌트 상세 가이드

## 개요

공통 컴포넌트는 `components/common/` 폴더에 위치하며, 프로젝트 전체에서 재사용되는 기본 UI 컴포넌트들입니다.

### 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `Button` | `Button.tsx` | 다양한 스타일의 버튼 컴포넌트 |
| `DataTable` | `DataTable.tsx` | TanStack Table 기반 데이터 테이블 |
| `StatCard` | `StatCard.tsx` | 통계 카드 컴포넌트 |

### 가져오기

```typescript
import { Button, DataTable, StatCard } from '@/components/common';

// 타입도 가져올 수 있음
import type { ButtonProps } from '@/components/common';
```

---

## 1. Button 컴포넌트

### 파일 위치
`components/common/Button.tsx`

### 개요
다양한 스타일과 크기를 지원하는 범용 버튼 컴포넌트입니다. `forwardRef`를 사용하여 ref 전달을 지원합니다.

### Props 인터페이스

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼의 시각적 스타일 변형
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

  /**
   * 버튼의 크기
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 로딩 상태 표시 - true면 스피너가 표시됨
   * @default false
   */
  loading?: boolean;

  /**
   * 전체 너비로 확장
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 버튼 왼쪽에 표시할 아이콘
   */
  leftIcon?: ReactNode;

  /**
   * 버튼 오른쪽에 표시할 아이콘
   */
  rightIcon?: ReactNode;

  /**
   * 버튼 내용
   */
  children?: ReactNode;
}
```

### Variant 스타일

| Variant | 용도 | 시각적 스타일 |
|---------|------|---------------|
| `primary` | 주요 액션 (저장, 생성 등) | 주황색 배경, 흰색 텍스트 |
| `secondary` | 보조 액션 (취소, 닫기 등) | 회색 테두리, 회색 텍스트 |
| `danger` | 위험한 액션 (삭제 등) | 빨간색 배경, 흰색 텍스트 |
| `ghost` | 덜 강조되는 액션 | 투명 배경, 호버 시 배경색 |
| `icon` | 아이콘만 있는 버튼 | 정사각형, 투명 배경 |

### Size 스타일

| Size | 패딩 | 폰트 크기 | 아이콘 크기 |
|------|------|-----------|-------------|
| `sm` | `px-3 py-1.5` | `text-sm` | `h-4 w-4` |
| `md` | `px-4 py-2` | `text-sm` | `h-5 w-5` |
| `lg` | `px-6 py-3` | `text-base` | `h-6 w-6` |

### 사용 예시

#### 기본 사용

```tsx
import { Button } from '@/components/common';

// Primary 버튼 (기본)
<Button onClick={handleSave}>저장</Button>

// Variant 지정
<Button variant="secondary">취소</Button>
<Button variant="danger">삭제</Button>
<Button variant="ghost">더보기</Button>
```

#### 크기 조절

```tsx
<Button size="sm">작은 버튼</Button>
<Button size="md">중간 버튼</Button>
<Button size="lg">큰 버튼</Button>
```

#### 아이콘 포함

```tsx
import { Plus, ArrowRight, Trash2 } from 'lucide-react';

// 왼쪽 아이콘
<Button leftIcon={<Plus className="w-4 h-4" />}>
  추가
</Button>

// 오른쪽 아이콘
<Button rightIcon={<ArrowRight className="w-4 h-4" />}>
  다음
</Button>

// 양쪽 아이콘
<Button
  leftIcon={<Trash2 className="w-4 h-4" />}
  variant="danger"
>
  삭제
</Button>
```

#### 로딩 상태

```tsx
const [isLoading, setIsLoading] = useState(false);

<Button
  loading={isLoading}
  onClick={async () => {
    setIsLoading(true);
    await saveData();
    setIsLoading(false);
  }}
>
  저장 중...
</Button>
```

로딩 중에는:
- 자동으로 disabled 상태가 됨
- 왼쪽 아이콘 대신 스피너가 표시됨

#### 전체 너비

```tsx
<Button fullWidth>전체 너비 버튼</Button>
```

#### 아이콘 전용 버튼

```tsx
import { Menu, X, Settings } from 'lucide-react';

<Button variant="icon">
  <Menu className="w-5 h-5" />
</Button>

<Button variant="icon" aria-label="닫기">
  <X className="w-5 h-5" />
</Button>
```

#### 비활성화

```tsx
<Button disabled>비활성화</Button>
<Button disabled variant="secondary">비활성화</Button>
```

#### 커스텀 스타일 추가

```tsx
<Button
  className="shadow-lg shadow-primary/30"
  variant="primary"
>
  커스텀 그림자
</Button>
```

#### Ref 사용

```tsx
import { useRef } from 'react';

function MyComponent() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const focusButton = () => {
    buttonRef.current?.focus();
  };

  return (
    <Button ref={buttonRef}>포커스 가능</Button>
  );
}
```

#### 폼 제출

```tsx
<form onSubmit={handleSubmit}>
  {/* 기본 type="button"이므로 submit으로 변경 필요 */}
  <Button type="submit" variant="primary">
    제출
  </Button>
</form>
```

### 다크 모드 지원

모든 variant는 다크 모드를 자동으로 지원합니다:

```tsx
// 라이트 모드: bg-primary-600
// 다크 모드: dark:bg-primary-700
<Button variant="primary">자동 다크 모드</Button>
```

### 접근성

- `disabled` 상태에서 `cursor-not-allowed` 적용
- `focus:ring` 스타일로 키보드 포커스 표시
- `aria-label`은 아이콘 전용 버튼에 권장

```tsx
<Button variant="icon" aria-label="메뉴 열기">
  <Menu className="w-5 h-5" />
</Button>
```

---

## 2. DataTable 컴포넌트

### 파일 위치
`components/common/DataTable.tsx`

### 개요
TanStack Table (React Table v8)을 기반으로 한 데이터 테이블 컴포넌트입니다. 정렬, 필터링, 페이지네이션, 행 선택 기능을 제공합니다.

### Props 인터페이스

```typescript
interface DataTableProps<TData> {
  /**
   * 테이블에 표시할 데이터 배열
   */
  data: TData[];

  /**
   * 컬럼 정의 배열 (TanStack Table ColumnDef)
   */
  columns: ColumnDef<TData>[];

  /**
   * 로딩 상태
   * @default false
   */
  isLoading?: boolean;

  /**
   * 데이터가 없을 때 표시할 메시지
   * @default '데이터가 없습니다'
   */
  emptyMessage?: string;

  /**
   * 데이터가 없을 때 표시할 설명
   * @default '필터를 조정하거나 새 항목을 추가해보세요'
   */
  emptyDescription?: string;

  /**
   * 행 선택 기능 활성화
   * @default false
   */
  enableRowSelection?: boolean;

  /**
   * 일괄 작업 UI 활성화
   * @default false
   */
  enableBulkActions?: boolean;

  /**
   * 일괄 작업 버튼 렌더링 함수
   */
  bulkActionsContent?: (selectedRows: Row<TData>[]) => ReactNode;

  /**
   * 테이블 메타 데이터 (컬럼에서 접근 가능)
   */
  meta?: Record<string, any>;

  /**
   * 초기 페이지 크기
   * @default 10
   */
  initialPageSize?: number;
}
```

### 기본 사용법

#### 1. 컬럼 정의

```tsx
import { ColumnDef } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: '이메일',
  },
  {
    accessorKey: 'role',
    header: '역할',
    cell: ({ row }) => (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
        {row.getValue('role')}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <span className={status === 'active' ? 'text-green-600' : 'text-red-600'}>
          {status === 'active' ? '활성' : '비활성'}
        </span>
      );
    },
  },
];
```

#### 2. 테이블 렌더링

```tsx
import { DataTable } from '@/components/common';

function UsersPage() {
  const users: User[] = [
    { id: '1', name: '홍길동', email: 'hong@example.com', role: 'admin', status: 'active' },
    { id: '2', name: '김철수', email: 'kim@example.com', role: 'user', status: 'active' },
    // ...
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      emptyMessage="사용자가 없습니다"
      emptyDescription="새 사용자를 추가해보세요"
    />
  );
}
```

### 고급 기능

#### 정렬 가능한 컬럼

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: '이름',
    enableSorting: true, // 정렬 활성화 (기본값: true)
  },
  {
    accessorKey: 'createdAt',
    header: '생성일',
    enableSorting: true,
    sortingFn: 'datetime', // 날짜 정렬
  },
];
```

헤더를 클릭하면 정렬됩니다. 정렬 방향은 `↑` 또는 `↓`로 표시됩니다.

#### 행 선택

```tsx
import { ColumnDef } from '@tanstack/react-table';

// 체크박스 컬럼 추가
const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
      />
    ),
    enableSorting: false,
  },
  // 다른 컬럼들...
];

<DataTable
  data={users}
  columns={columns}
  enableRowSelection={true}
/>
```

#### 일괄 작업

```tsx
<DataTable
  data={users}
  columns={columns}
  enableRowSelection={true}
  enableBulkActions={true}
  bulkActionsContent={(selectedRows) => (
    <>
      <Button
        size="sm"
        variant="danger"
        onClick={() => handleBulkDelete(selectedRows)}
      >
        선택 삭제 ({selectedRows.length})
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleBulkExport(selectedRows)}
      >
        내보내기
      </Button>
    </>
  )}
/>
```

선택된 행이 있으면 테이블 위에 일괄 작업 툴바가 표시됩니다.

#### 액션 컬럼

```tsx
const columns: ColumnDef<User>[] = [
  // 다른 컬럼들...
  {
    id: 'actions',
    header: '작업',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(user)}
          >
            수정
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(user.id)}
          >
            삭제
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
];
```

#### meta를 통한 데이터 전달

```tsx
// 컬럼에서 meta 접근
const columns: ColumnDef<User>[] = [
  {
    id: 'actions',
    cell: ({ table, row }) => {
      const meta = table.options.meta as { onEdit: (user: User) => void };
      return (
        <Button onClick={() => meta.onEdit(row.original)}>
          수정
        </Button>
      );
    },
  },
];

// DataTable에 meta 전달
<DataTable
  data={users}
  columns={columns}
  meta={{
    onEdit: (user) => setEditingUser(user),
    onDelete: (id) => deleteUser(id),
  }}
/>
```

#### 로딩 상태

```tsx
const { data, isLoading } = useUsers();

<DataTable
  data={data || []}
  columns={columns}
  isLoading={isLoading}
/>
```

로딩 중에는 스피너가 표시됩니다.

#### 페이지 크기 변경

```tsx
<DataTable
  data={users}
  columns={columns}
  initialPageSize={25}  // 기본값: 10
/>
```

사용자가 10, 25, 50, 100 중에서 선택할 수 있습니다.

### 제공되는 기능

| 기능 | 설명 |
|------|------|
| 정렬 | 헤더 클릭으로 오름차순/내림차순 정렬 |
| 페이지네이션 | 처음/이전/다음/마지막 버튼 |
| 페이지 크기 | 10/25/50/100 선택 가능 |
| 행 선택 | 체크박스로 단일/전체 선택 |
| 일괄 작업 | 선택된 행에 대한 작업 UI |
| 빈 상태 | 데이터 없을 때 메시지 표시 |
| 로딩 상태 | 스피너 표시 |
| 호버 효과 | 행에 호버 시 배경색 변경 |
| 다크 모드 | 자동 지원 |

---

## 3. StatCard 컴포넌트

### 파일 위치
`components/common/StatCard.tsx`

### 개요
통계 정보를 카드 형태로 표시하는 컴포넌트입니다. 주로 대시보드에서 KPI나 요약 정보를 표시하는 데 사용됩니다.

### Props 인터페이스

```typescript
interface StatCardProps {
  /**
   * 카드 제목 (메트릭 이름)
   */
  title: string;

  /**
   * 부제목 (선택적)
   */
  subtitle?: string;

  /**
   * 표시할 값
   */
  value: string | number;

  /**
   * 트렌드 정보 (변화율)
   */
  trend?: {
    value: string;       // 예: '+10%', '-5%', '0.0%'
    direction: 'up' | 'down' | 'neutral';
  };

  /**
   * 우측 상단 아이콘 (Lucide 아이콘)
   */
  icon?: LucideIcon;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}
```

### 사용 예시

#### 기본 사용

```tsx
import { StatCard } from '@/components/common';

<StatCard
  title="총 사용자"
  value="1,234"
/>
```

#### 부제목 포함

```tsx
<StatCard
  title="활성 사용자"
  subtitle="지난 30일 기준"
  value="856"
/>
```

#### 트렌드 표시

```tsx
// 상승 트렌드
<StatCard
  title="매출"
  value="₩12,500,000"
  trend={{
    value: '+12.5%',
    direction: 'up',
  }}
/>

// 하락 트렌드
<StatCard
  title="이탈률"
  value="2.3%"
  trend={{
    value: '-0.5%',
    direction: 'down',
  }}
/>

// 변화 없음
<StatCard
  title="평균 세션"
  value="4분 32초"
  trend={{
    value: '0.0%',
    direction: 'neutral',
  }}
/>
```

트렌드 색상:
- `up`: 녹색 배경
- `down`: 빨간색 배경
- `neutral`: 회색 배경

#### 아이콘 포함

```tsx
import { Users, TrendingUp, DollarSign, MoreVertical } from 'lucide-react';

<StatCard
  title="총 사용자"
  value="1,234"
  icon={MoreVertical}  // 우측 상단에 표시
/>

<StatCard
  title="수익"
  subtitle="이번 달"
  value="₩5,000,000"
  trend={{ value: '+15%', direction: 'up' }}
  icon={MoreVertical}
/>
```

#### 그리드 레이아웃

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
    title="총 사용자"
    subtitle="전체"
    value="1,234"
    trend={{ value: '+10%', direction: 'up' }}
    icon={MoreVertical}
  />
  <StatCard
    title="활성 사용자"
    subtitle="지난 7일"
    value="856"
    trend={{ value: '+5%', direction: 'up' }}
    icon={MoreVertical}
  />
  <StatCard
    title="신규 가입"
    subtitle="이번 주"
    value="48"
    trend={{ value: '-2%', direction: 'down' }}
    icon={MoreVertical}
  />
  <StatCard
    title="이탈률"
    subtitle="평균"
    value="2.3%"
    trend={{ value: '0.0%', direction: 'neutral' }}
    icon={MoreVertical}
  />
</div>
```

#### 커스텀 스타일

```tsx
<StatCard
  title="VIP 사용자"
  value="123"
  className="border-l-4 border-l-primary"
/>
```

### 시각적 구조

```
┌─────────────────────────────────┐
│  Title                     [✓] │  ← 제목 + 아이콘
│  Subtitle                       │  ← 부제목 (선택적)
│                                 │
│  Value                   [+10%] │  ← 값 + 트렌드
└─────────────────────────────────┘
```

### 다크 모드

자동으로 다크 모드를 지원합니다:
- 배경: `bg-white` → `dark:bg-gray-800`
- 테두리: `border-gray-200` → `dark:border-gray-700`
- 텍스트: 적절한 다크 모드 색상 적용

---

## 컴포넌트 확장 가이드

### 새 공통 컴포넌트 추가

1. `components/common/` 폴더에 파일 생성

```tsx
// components/common/Badge.tsx
'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

2. `index.ts`에 내보내기 추가

```typescript
// components/common/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
export { DataTable } from './DataTable';
export { StatCard } from './StatCard';
export { Badge } from './Badge';  // 추가
```

3. 사용

```tsx
import { Badge } from '@/components/common';

<Badge variant="success">활성</Badge>
```

### 컴포넌트 작성 원칙

1. **'use client'**: 클라이언트 컴포넌트는 파일 상단에 선언
2. **TypeScript**: Props 인터페이스 명확하게 정의
3. **cn() 사용**: 조건부 클래스와 커스텀 클래스 병합
4. **다크 모드**: 모든 색상에 `dark:` 변형 추가
5. **접근성**: 적절한 aria 속성 사용
6. **기본값**: Props에 합리적인 기본값 설정
