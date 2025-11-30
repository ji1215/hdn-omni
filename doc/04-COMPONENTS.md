# 4. 주요 컴포넌트 가이드

## 레이아웃 컴포넌트

### Sidebar (`components/layout/Sidebar.tsx`)

사이드바 네비게이션 컴포넌트입니다.

**주요 기능**:
- 네비게이션 메뉴 렌더링
- 하위 메뉴 확장/축소
- 사이드바 접기/펼치기
- 모바일 반응형 드로어
- 호버 시 툴팁 표시 (접힌 상태)

**네비게이션 구조**:
```typescript
const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  {
    name: '모니터링',
    href: '/monitoring',
    icon: Monitor,
    children: [
      { name: '네트워크 토폴로지', href: '/monitoring' },
      { name: '리소스 모니터링', href: '/monitoring/resources' },
      // ...
    ],
  },
  // ...
];
```

**상태 관리**:
```typescript
const { sidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen } = useStore();
```

---

### Header (`components/layout/Header.tsx`)

헤더 컴포넌트입니다.

**주요 기능**:
- 검색바
- 알림 아이콘
- 다크모드 토글
- 사용자 메뉴 드롭다운
- 모바일 메뉴 버튼

**사용 예시**:
```tsx
<Header onMenuClick={() => setMobileDrawerOpen(true)} />
```

---

## 공통 컴포넌트 (`components/common/`)

### Button

다양한 스타일의 버튼 컴포넌트입니다.

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}
```

**사용 예시**:
```tsx
import { Button } from '@/components/common';

// Primary 버튼
<Button variant="primary" size="md">
  저장
</Button>

// 아이콘 포함 버튼
<Button
  variant="primary"
  leftIcon={<Plus className="w-4 h-4" />}
>
  추가
</Button>

// 아이콘만 있는 버튼
<Button variant="icon">
  <Menu className="w-5 h-5" />
</Button>
```

---

### StatCard

통계 카드 컴포넌트입니다.

**Props**:
```typescript
interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType;
}
```

**사용 예시**:
```tsx
<StatCard
  title="Active Users"
  subtitle="Member Average"
  value="85.5%"
  trend={{ value: '+10%', direction: 'up' }}
  icon={Users}
/>
```

---

## 대시보드 컴포넌트 (`components/dashboard/`)

### KPICard

KPI 메트릭 카드 컴포넌트입니다.

**Props**:
```typescript
interface KPICardProps {
  data: {
    id: string;
    title: string;
    value: number | string;
    unit: string;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    status: 'success' | 'warning' | 'error';
    icon: string;
  };
}
```

**특징**:
- 트렌드 표시 (상승/하락/중립)
- 상태별 색상 (성공: 초록, 경고: 노랑, 에러: 빨강)
- 변화율 표시

---

### DashboardControls

대시보드 컨트롤 컴포넌트입니다.

**기능**:
- 시간 범위 선택 (1시간, 6시간, 24시간)
- 새로고침 버튼
- 마지막 업데이트 시간 표시

---

### DashboardSkeleton

로딩 중 스켈레톤 UI입니다.

---

## 디바이스 관리 컴포넌트 (`components/devices/`)

### DeviceTable

디바이스 목록 테이블입니다.

**기능**:
- 디바이스 목록 표시
- 다중 선택 (체크박스)
- 정렬
- 상태별 아이콘/색상
- 액션 메뉴 (정보, 재시작, 백업)

---

### DeviceFilters

디바이스 필터 컴포넌트입니다.

**필터 옵션**:
- 상태 (온라인, 오프라인, 에러, 유지보수)
- 제조사 (Cisco, Juniper, Huawei 등)
- 검색어

---

### AddDeviceModal

디바이스 추가 모달입니다.

**폼 필드**:
- 호스트명
- IP 주소
- 포트
- 프로토콜 (SSH, Telnet, SNMP, NETCONF)
- 자격증명 (사용자명, 비밀번호)
- 제조사
- 위치
- 설명
- 그룹

**유효성 검사**: Zod 스키마 사용

---

### DeviceInfoModal

디바이스 상세 정보 모달입니다.

**표시 정보**:
- 기본 정보 (호스트명, IP, 포트 등)
- 상태 정보 (CPU, 메모리, 트래픽)
- 액션 버튼 (재시작, 백업, 업그레이드)

---

## 보안 관리 컴포넌트 (`components/security/`)

### UsersTable

사용자 목록 테이블입니다.

**기능**:
- 사용자 목록 표시
- 역할별 배지
- 상태 표시
- 액션 메뉴 (수정, 삭제, 로그 보기)

---

### CreateUserModal

사용자 생성 모달입니다.

**폼 필드**:
- 이름
- 이메일
- 비밀번호
- 역할 (Super Admin, Network Admin, Monitoring User, Guest)
- 부서
- 상태

---

### EditUserModal

사용자 수정 모달입니다.

---

### DeleteUserModal

사용자 삭제 확인 모달입니다.

**특징**:
- 삭제 이유 입력 필드
- 확인 메시지

---

### UserFilters

사용자 필터 컴포넌트입니다.

**필터 옵션**:
- 검색어
- 역할
- 상태
- 부서

---

## 컴포넌트 작성 패턴

### 기본 컴포넌트 구조

```tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  className?: string;
  onAction?: () => void;
}

export function MyComponent({ title, className, onAction }: MyComponentProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={cn(
      'p-4 bg-white dark:bg-gray-800 rounded-lg',
      isActive && 'ring-2 ring-primary',
      className
    )}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

### index.ts를 통한 내보내기

```typescript
// components/devices/index.ts
export { DeviceTable } from './DeviceTable';
export { DeviceFilters } from './DeviceFilters';
export { AddDeviceModal } from './AddDeviceModal';
export { DeviceInfoModal } from './DeviceInfoModal';
export { DevicePagination } from './DevicePagination';
```

```typescript
// 사용 시
import { DeviceTable, DeviceFilters, AddDeviceModal } from '@/components/devices';
```

---

## 유틸리티 함수: cn()

`lib/utils.ts`에 정의된 클래스명 병합 함수입니다.

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**사용 예시**:
```tsx
<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)}>
```

이 함수는 조건부 클래스 적용과 Tailwind 클래스 충돌 해결을 처리합니다.
