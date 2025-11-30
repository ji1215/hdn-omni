# 2. 프로젝트 구조

## 전체 디렉토리 구조

```
hdn-omni/
├── app/                    # Next.js App Router (페이지)
├── components/             # React 컴포넌트
├── hooks/                  # 커스텀 React 훅
├── lib/                    # 유틸리티 함수 및 헬퍼
├── providers/              # React Context Provider
├── services/               # API 서비스 레이어
├── store/                  # Zustand 상태 스토어
├── styles/                 # 글로벌 스타일
├── types/                  # TypeScript 타입 정의
├── public/                 # 정적 파일
└── doc/                    # 문서
```

---

## 상세 구조 설명

### 1. `app/` - 페이지 라우팅 (Next.js App Router)

```
app/
├── (dashboard)/           # 대시보드 레이아웃 그룹
│   ├── dashboard/         # /dashboard 페이지
│   │   └── page.tsx
│   ├── monitoring/        # /monitoring 페이지 그룹
│   │   ├── page.tsx       # 네트워크 토폴로지
│   │   ├── resources/     # 리소스 모니터링
│   │   ├── traffic/       # 트래픽 분석
│   │   └── alerts/        # 경고 및 이벤트
│   ├── network/           # /network 페이지 그룹
│   │   ├── page.tsx       # 네트워크 개요
│   │   ├── devices/       # 디바이스 관리
│   │   ├── flows/         # 플로우 규칙
│   │   ├── ports/         # 포트 관리
│   │   └── qos/           # QoS 정책
│   ├── security/          # /security 페이지 그룹
│   │   ├── page.tsx       # 보안 개요
│   │   ├── users/         # 사용자 관리
│   │   ├── roles/         # 역할 관리
│   │   └── audit/         # 감사 로그
│   ├── settings/          # /settings 페이지
│   └── layout.tsx         # 대시보드 공통 레이아웃
├── auth/                   # 인증 관련 페이지
│   ├── login/             # 로그인 페이지
│   └── layout.tsx
├── unauthorized/          # 권한 없음 페이지
├── layout.tsx             # 루트 레이아웃
├── page.tsx               # 홈 (/ → /dashboard 리다이렉트)
├── error.tsx              # 에러 페이지
├── loading.tsx            # 로딩 페이지
└── not-found.tsx          # 404 페이지
```

**핵심 포인트**:
- `(dashboard)` 폴더는 라우트 그룹으로, URL에 영향을 주지 않음
- 각 폴더의 `page.tsx`가 해당 경로의 페이지 컴포넌트
- `layout.tsx`는 해당 경로 및 하위 경로에 적용되는 레이아웃

---

### 2. `components/` - React 컴포넌트

```
components/
├── auth/                  # 인증 관련 컴포넌트
├── common/                # 공통 UI 컴포넌트
│   ├── Button.tsx         # 버튼 컴포넌트
│   ├── StatCard.tsx       # 통계 카드
│   └── index.ts           # 내보내기
├── dashboard/             # 대시보드 컴포넌트
│   ├── KPICard.tsx        # KPI 카드
│   ├── CardSkeleton.tsx   # 스켈레톤 로딩
│   └── DashboardControls.tsx
├── devices/               # 디바이스 관리 컴포넌트
│   ├── DeviceTable.tsx    # 디바이스 테이블
│   ├── DeviceFilters.tsx  # 필터
│   ├── AddDeviceModal.tsx # 디바이스 추가 모달
│   └── index.ts
├── errors/                # 에러 관련 컴포넌트
├── layout/                # 레이아웃 컴포넌트
│   ├── Sidebar.tsx        # 사이드바
│   └── Header.tsx         # 헤더
├── monitoring/            # 모니터링 컴포넌트
├── network/               # 네트워크 관리 컴포넌트
├── qos/                   # QoS 컴포넌트
├── rbac/                  # 역할 기반 접근 제어
└── security/              # 보안 관리 컴포넌트
    ├── UsersTable.tsx
    ├── CreateUserModal.tsx
    ├── EditUserModal.tsx
    └── DeleteUserModal.tsx
```

**컴포넌트 분류 기준**:
- `common/`: 여러 페이지에서 재사용되는 범용 컴포넌트
- 기능별 폴더: 해당 기능에서만 사용되는 특화 컴포넌트

---

### 3. `hooks/` - 커스텀 React 훅

```
hooks/
├── use-batch-operation.ts  # 일괄 작업 훅
├── use-error-handler.ts    # 에러 처리 훅
├── useDebounce.ts          # 디바운스 훅
├── useInterval.ts          # 인터벌 훅
├── usePermission.ts        # 권한 확인 훅
├── usePorts.ts             # 포트 관리 훅
├── useRoles.ts             # 역할 관리 훅 (React Query)
├── useTheme.ts             # 테마 훅
└── useUsers.ts             # 사용자 관리 훅 (React Query)
```

---

### 4. `lib/` - 유틸리티 및 헬퍼

```
lib/
├── errors/                 # 에러 처리 유틸리티
│   └── error-logger.ts
├── mockData/              # 목업 데이터
│   └── devices.ts
├── utils/                 # 유틸리티 함수
├── errors.ts              # 에러 클래스 정의
├── flowValidation.ts      # 플로우 규칙 유효성 검사
├── httpClient.ts          # Axios HTTP 클라이언트
├── mockTopologyData.ts    # 토폴로지 목업 데이터
├── password.ts            # 비밀번호 관련 유틸리티
└── utils.ts               # 공통 유틸리티 (cn 함수 등)
```

---

### 5. `providers/` - React Context Provider

```
providers/
├── error-provider.tsx     # 에러 컨텍스트
├── query-provider.tsx     # React Query 설정
└── theme-provider.tsx     # 테마 (다크/라이트 모드)
```

---

### 6. `services/` - API 서비스 레이어

```
services/
├── auth.ts               # 인증 서비스
├── deviceService.ts      # 디바이스 API
├── portService.ts        # 포트 API
├── roles.ts              # 역할 API
└── users.ts              # 사용자 API
```

**서비스 패턴**:
```typescript
// 예시: services/deviceService.ts
export const deviceService = {
  getDevices: async (params) => { ... },
  getDevice: async (id) => { ... },
  addDevice: async (data) => { ... },
  updateDevice: async (id, data) => { ... },
  deleteDevice: async (id) => { ... },
};
```

---

### 7. `store/` - Zustand 상태 스토어

```
store/
├── dashboardStore.ts     # 대시보드 상태
├── deviceStore.ts        # 디바이스 관리 상태
├── rbacStore.ts          # RBAC 상태
└── useStore.ts           # 글로벌 상태 (테마, 사용자, 사이드바)
```

---

### 8. `types/` - TypeScript 타입 정의

```
types/
├── alert.ts              # 알림 타입
├── api.ts                # API 응답 타입
├── chart.ts              # 차트 타입
├── dashboard.ts          # 대시보드 타입
├── device.ts             # 디바이스 타입 + Zod 스키마
├── errors/               # 에러 타입
├── flow.ts               # 플로우 규칙 타입
├── port.ts               # 포트 타입
├── qos.ts                # QoS 타입
├── rbac.ts               # RBAC 타입
├── role.ts               # 역할 타입
├── topology.ts           # 토폴로지 타입
├── traffic.ts            # 트래픽 타입
└── user.ts               # 사용자 타입
```

---

## 파일 네이밍 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 페이지 | `page.tsx` (Next.js 규칙) | `app/(dashboard)/dashboard/page.tsx` |
| 레이아웃 | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| 컴포넌트 | PascalCase | `DeviceTable.tsx`, `KPICard.tsx` |
| 훅 | camelCase with `use` prefix | `useUsers.ts`, `useDebounce.ts` |
| 서비스 | camelCase | `deviceService.ts` |
| 스토어 | camelCase with `Store` suffix | `dashboardStore.ts` |
| 타입 | camelCase | `device.ts`, `user.ts` |
| 유틸리티 | camelCase | `httpClient.ts`, `utils.ts` |

---

## 주요 경로 요약

| URL 경로 | 파일 경로 | 설명 |
|----------|-----------|------|
| `/` | `app/page.tsx` | /dashboard로 리다이렉트 |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | 메인 대시보드 |
| `/monitoring` | `app/(dashboard)/monitoring/page.tsx` | 네트워크 토폴로지 |
| `/network/devices` | `app/(dashboard)/network/devices/page.tsx` | 디바이스 관리 |
| `/security/users` | `app/(dashboard)/security/users/page.tsx` | 사용자 관리 |
| `/auth/login` | `app/auth/login/page.tsx` | 로그인 페이지 |
