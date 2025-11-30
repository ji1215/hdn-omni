# 6. API 및 서비스 레이어

## HTTP 클라이언트 (`lib/httpClient.ts`)

Axios 기반의 HTTP 클라이언트로, 다음 기능을 제공합니다:

### 주요 기능

1. **Rate Limiting**: 초당 10개 요청 제한
2. **자동 재시도**: 네트워크 에러 및 특정 HTTP 상태 코드에 대해 최대 3회 재시도
3. **Exponential Backoff**: 재시도 간격 점진적 증가
4. **토큰 관리**: JWT 토큰 자동 추가 및 갱신
5. **에러 변환**: 일관된 에러 형식으로 변환

### 사용 방법

```typescript
import { api } from '@/lib/httpClient';

// GET 요청
const response = await api.get<User[]>('/api/users');
const users = response.data.data;

// POST 요청
const response = await api.post<User>('/api/users', {
  name: 'John',
  email: 'john@example.com',
});

// PUT 요청
await api.put('/api/users/1', { name: 'Jane' });

// DELETE 요청
await api.delete('/api/users/1');
```

### API 응답 형식

```typescript
// types/api.ts
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 서비스 구조

모든 API 호출은 `services/` 폴더의 서비스를 통해 이루어집니다.

### deviceService (`services/deviceService.ts`)

디바이스 관련 API 서비스입니다.

```typescript
import { deviceService } from '@/services/deviceService';

// 디바이스 목록 조회
const response = await deviceService.getDevices({
  page: 1,
  pageSize: 10,
  filter: { status: ['online'], manufacturers: ['cisco'] },
  sort: { field: 'hostname', order: 'asc' },
});

// 디바이스 상세 조회
const device = await deviceService.getDevice('device-1');

// 디바이스 추가
const newDevice = await deviceService.addDevice({
  hostname: 'switch-01',
  ip: '192.168.1.1',
  port: 22,
  protocol: 'ssh',
  credentials: {
    username: 'admin',
    password: 'password',
  },
});

// 디바이스 수정
await deviceService.updateDevice('device-1', {
  hostname: 'switch-01-updated',
});

// 디바이스 삭제
await deviceService.deleteDevice('device-1');

// 디바이스 재시작
await deviceService.rebootDevice('device-1');

// 디바이스 백업
await deviceService.backupDevice('device-1', '정기 백업');

// 연결 테스트
const result = await deviceService.testConnection({
  hostname: 'switch-01',
  ip: '192.168.1.1',
  port: 22,
  protocol: 'ssh',
  credentials: { username: 'admin', password: 'password' },
});

// 일괄 작업
await deviceService.batchAction({
  deviceIds: ['device-1', 'device-2'],
  action: 'reboot',
});

// 그룹 관리
const groups = await deviceService.getGroups();
await deviceService.createGroup({ name: '서버룸 A', color: '#FF0000' });
```

### userService (`services/users.ts`)

사용자 관련 API 서비스입니다.

```typescript
import { userService } from '@/services/users';

// 사용자 목록 조회
const response = await userService.getUsers(1, 10, {
  search: 'john',
  role: 'network_admin',
  status: 'active',
});

// 사용자 상세 조회
const user = await userService.getUser('user-1');

// 사용자 생성
await userService.createUser({
  email: 'john@example.com',
  name: 'John Doe',
  password: 'password123',
  role: 'network_admin',
  status: 'active',
});

// 사용자 수정
await userService.updateUser('user-1', {
  name: 'John Updated',
  role: 'super_admin',
});

// 사용자 삭제
await userService.deleteUser('user-1', '퇴사');
```

### roleService (`services/roles.ts`)

역할 관련 API 서비스입니다.

```typescript
import { roleService } from '@/services/roles';

// 역할 목록 조회
const roles = await roleService.getRoles();

// 역할 생성
await roleService.createRole({
  name: 'custom_admin',
  displayName: '커스텀 관리자',
  permissions: ['read', 'write'],
});

// 역할 수정
await roleService.updateRole('role-1', {
  permissions: ['read', 'write', 'delete'],
});
```

### portService (`services/portService.ts`)

포트 관련 API 서비스입니다.

```typescript
import { portService } from '@/services/portService';

// 포트 목록 조회
const ports = await portService.getPorts({
  deviceId: 'device-1',
  status: 'up',
});

// 포트 상태 변경
await portService.updatePortStatus('port-1', 'up');

// 포트 설정 변경
await portService.updatePortConfig('port-1', {
  speed: 1000,
  duplex: 'full',
  mtu: 1500,
});
```

---

## 목업 데이터 처리

현재 개발 모드에서는 목업(Mock) 데이터를 사용합니다.

### 목업 데이터 활성화

각 서비스 파일에서 `USE_MOCK_DATA` 플래그로 제어합니다:

```typescript
// services/deviceService.ts
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || true;
```

### 목업 데이터 위치

```
lib/
├── mockData/
│   └── devices.ts          # 디바이스 목업 데이터
└── mockTopologyData.ts     # 토폴로지 목업 데이터
```

### 목업 데이터 구조 예시

```typescript
// lib/mockData/devices.ts
export const mockDevices: Device[] = [
  {
    id: 'device-1',
    hostname: 'switch-core-01',
    ip: '192.168.1.1',
    port: 22,
    protocol: 'ssh',
    manufacturer: 'cisco',
    model: 'Catalyst 9300',
    firmwareVersion: '17.3.1',
    status: 'online',
    lastCommunication: Date.now(),
    // ...
  },
  // ...
];
```

### 실제 API 연동 시

1. `USE_MOCK_DATA`를 `false`로 변경
2. `.env` 파일에 `NEXT_PUBLIC_API_BASE_URL` 설정
3. 백엔드 API 응답 형식에 맞게 서비스 수정

---

## React Query 훅 패턴

서비스와 React Query를 연결하는 커스텀 훅 패턴입니다.

### 조회 훅 (useQuery)

```typescript
// hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/users';

export function useUsers(page: number, pageSize: number, filters: UserFilters) {
  return useQuery({
    queryKey: ['users', page, pageSize, filters],
    queryFn: () => userService.getUsers(page, pageSize, filters),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}
```

### 변경 훅 (useMutation)

```typescript
// hooks/useUsers.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('사용자 생성 실패:', error);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      userService.deleteUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 페이지에서 사용

```tsx
'use client';

import { useUsers, useCreateUser } from '@/hooks/useUsers';

export default function UsersPage() {
  const { data, isLoading, error, refetch } = useUsers(1, 10, {});
  const createUser = useCreateUser();

  const handleCreate = async (userData: CreateUserRequest) => {
    try {
      await createUser.mutateAsync(userData);
      // 성공 처리
    } catch (error) {
      // 에러 처리
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error onRetry={refetch} />;

  return (
    <div>
      <UsersTable data={data.data} />
      <CreateButton onClick={handleCreate} />
    </div>
  );
}
```

---

## 에러 처리

### 에러 클래스 (`lib/errors.ts`)

```typescript
export class ApiError extends Error {
  code: string;
  status?: number;
  details?: any;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function createErrorFromAxiosError(error: AxiosError): ApiError {
  // Axios 에러를 ApiError로 변환
}

export function logError(error: ApiError, context?: string): void {
  // 에러 로깅
}
```

### 에러 처리 패턴

```typescript
try {
  await deviceService.addDevice(data);
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        // 네트워크 에러 처리
        break;
      case 'VALIDATION_ERROR':
        // 유효성 검사 에러 처리
        break;
      case 'UNAUTHORIZED':
        // 인증 에러 처리
        break;
      default:
        // 기타 에러 처리
    }
  }
}
```
