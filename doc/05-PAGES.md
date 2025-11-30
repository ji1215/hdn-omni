# 5. 페이지별 기능 설명

## 페이지 구조 개요

```
/                           → /dashboard로 리다이렉트
/dashboard                  → 메인 대시보드
/monitoring                 → 네트워크 토폴로지
/monitoring/resources       → 리소스 모니터링
/monitoring/traffic         → 트래픽 분석
/monitoring/alerts          → 경고 및 이벤트
/network                    → 네트워크 개요
/network/devices            → 디바이스 관리
/network/flows              → 플로우 규칙
/network/ports              → 포트 관리
/network/qos                → QoS 정책
/security                   → 보안 개요
/security/users             → 사용자 관리
/security/roles             → 역할 관리
/security/audit             → 감사 로그
/settings                   → 설정
/auth/login                 → 로그인
```

---

## 1. 대시보드 (`/dashboard`)

**파일**: `app/(dashboard)/dashboard/page.tsx`

### 기능
- KPI 메트릭 카드 6개 표시
  - 활성 디바이스
  - 활성율
  - 호스트 수
  - 네트워크 트래픽
  - 가용성
  - 평균 응답시간
- 시간 범위 선택 (1시간, 6시간, 24시간)
- 5초마다 자동 새로고침
- 네트워크 토폴로지 미리보기
- 트래픽 차트 미리보기

### 사용 스토어
```typescript
import { useDashboardStore } from '@/store/dashboardStore';

const {
  metrics,        // KPI 메트릭 데이터
  timeRange,      // 시간 범위
  isLoading,      // 로딩 상태
  error,          // 에러 메시지
  lastUpdated,    // 마지막 업데이트 시간
  setTimeRange,   // 시간 범위 변경
  refreshMetrics, // 메트릭 새로고침
} = useDashboardStore();
```

### 자동 새로고침 구현
```typescript
// 5초마다 자동 새로고침
useEffect(() => {
  const interval = setInterval(() => {
    refreshMetrics();
  }, 5000);

  return () => clearInterval(interval);
}, [refreshMetrics]);
```

---

## 2. 모니터링

### 2.1 네트워크 토폴로지 (`/monitoring`)

**파일**: `app/(dashboard)/monitoring/page.tsx`

**기능**:
- Cytoscape.js를 이용한 네트워크 토폴로지 시각화
- 노드/엣지 인터랙션
- 줌/팬 기능

### 2.2 리소스 모니터링 (`/monitoring/resources`)

**파일**: `app/(dashboard)/monitoring/resources/page.tsx`

**기능**:
- CPU, 메모리, 디스크 사용률 차트
- 디바이스별 리소스 현황

### 2.3 트래픽 분석 (`/monitoring/traffic`)

**파일**: `app/(dashboard)/monitoring/traffic/page.tsx`

**기능**:
- 트래픽 통계 차트
- 프로토콜별 분석
- 시간대별 트래픽

### 2.4 경고 및 이벤트 (`/monitoring/alerts`)

**파일**: `app/(dashboard)/monitoring/alerts/page.tsx`

**기능**:
- 알림 목록
- 심각도별 필터링
- 알림 확인/해제

---

## 3. 네트워크 관리

### 3.1 디바이스 관리 (`/network/devices`)

**파일**: `app/(dashboard)/network/devices/page.tsx`

**기능**:
- 디바이스 목록 테이블
- 디바이스 추가/수정/삭제
- 필터링 (상태, 제조사, 검색)
- 일괄 작업 (재시작, 백업, 삭제)
- 디바이스 상세 정보 모달

**사용 스토어**:
```typescript
import useDeviceStore from '@/store/deviceStore';

const {
  devices,           // 디바이스 목록
  selectedDevices,   // 선택된 디바이스 Set
  loading,           // 로딩 상태
  filter,            // 필터 조건
  fetchDevices,      // 목록 조회
  setFilter,         // 필터 설정
  toggleDeviceSelection,  // 선택 토글
  batchReboot,       // 일괄 재시작
  batchBackup,       // 일괄 백업
  batchDelete,       // 일괄 삭제
} = useDeviceStore();
```

### 3.2 플로우 규칙 (`/network/flows`)

**파일**: `app/(dashboard)/network/flows/page.tsx`

**기능**:
- 플로우 규칙 목록
- 규칙 생성/수정/삭제
- 우선순위 설정
- 매칭 조건 편집

### 3.3 포트 관리 (`/network/ports`)

**파일**: `app/(dashboard)/network/ports/page.tsx`

**기능**:
- 포트 목록
- 포트 상태 표시
- 포트 활성화/비활성화
- 포트 설정 변경

### 3.4 QoS 정책 (`/network/qos`)

**파일**: `app/(dashboard)/network/qos/page.tsx`

**기능**:
- QoS 정책 목록
- 정책 생성/수정/삭제
- 대역폭 제한 설정
- 우선순위 설정

---

## 4. 보안 관리

### 4.1 사용자 관리 (`/security/users`)

**파일**: `app/(dashboard)/security/users/page.tsx`

**기능**:
- 사용자 목록 테이블
- 사용자 생성/수정/삭제
- 역할별 통계 카드
- 필터링 (역할, 상태, 검색)
- 감사 로그 보기

**사용 훅**:
```typescript
import {
  useUsers,        // 사용자 목록 조회
  useCreateUser,   // 사용자 생성
  useUpdateUser,   // 사용자 수정
  useDeleteUser,   // 사용자 삭제
} from '@/hooks/useUsers';

// 조회
const { data, isLoading, error, refetch } = useUsers(page, pageSize, filters);

// 생성
const createMutation = useCreateUser();
await createMutation.mutateAsync(userData);
```

**역할 종류**:
| 역할 | 설명 |
|------|------|
| `super_admin` | 최고 관리자 - 모든 권한 |
| `network_admin` | 네트워크 관리자 - 네트워크 관련 권한 |
| `monitoring_user` | 모니터링 사용자 - 읽기 전용 |
| `guest` | 게스트 - 제한된 접근 |

### 4.2 역할 관리 (`/security/roles`)

**파일**: `app/(dashboard)/security/roles/page.tsx`

**기능**:
- 역할 목록
- 역할별 권한 설정
- 역할 생성/수정/삭제

### 4.3 감사 로그 (`/security/audit`)

**파일**: `app/(dashboard)/security/audit/page.tsx`

**기능**:
- 감사 로그 목록
- 필터링 (사용자, 액션, 날짜)
- 로그 상세 보기

---

## 5. 설정 (`/settings`)

**파일**: `app/(dashboard)/settings/page.tsx`

**기능**:
- 시스템 설정
- 테마 설정
- 언어 설정
- 알림 설정

---

## 6. 인증 페이지

### 로그인 (`/auth/login`)

**파일**: `app/auth/login/page.tsx`

**기능**:
- 이메일/비밀번호 입력 폼
- 폼 유효성 검사
- (현재) 항상 `/dashboard`로 리다이렉트

> **참고**: 실제 인증은 구현되어 있지 않습니다. UI/UX 데모 목적으로만 사용됩니다.

---

## 페이지 공통 패턴

### 페이지 헤더 구조
```tsx
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
  <div>
    <h1 className="text-2xl font-bold">페이지 제목</h1>
    <p className="text-sm text-gray-500">페이지 설명</p>
  </div>
  <div className="flex items-center gap-3">
    <Button variant="primary" leftIcon={<Plus />}>
      추가
    </Button>
  </div>
</div>
```

### 로딩 상태 처리
```tsx
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin" />
    <span className="ml-2">로딩 중...</span>
  </div>
) : (
  <DataTable data={data} />
)}
```

### 에러 상태 처리
```tsx
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-800">{error}</p>
    <Button onClick={refetch}>다시 시도</Button>
  </div>
)}
```
