# 네트워크 관리 기능 가이드

## 개요

hdn-omni 프로젝트의 네트워크 관리 기능이 완성되었습니다. 이 가이드는 디바이스 관리, 플로우 규칙, 포트 관리, QoS 정책 등 네트워크 관리의 모든 기능을 설명합니다.

## 주요 기능

### 1. 디바이스 관리 (`/network/devices`)

**위치**: `app/(dashboard)/network/devices/page.tsx`

#### 기능

- ✅ **디바이스 목록 조회 및 관리**
  - 페이지네이션 지원
  - 정렬 기능 (호스트명, IP, 상태, 가동시간 등)
  - 다중 선택 및 일괄 작업

- ✅ **고급 필터링**
  - 상태별 필터 (온라인, 오프라인, 경고)
  - 유형별 필터 (스위치, 라우터, 방화벽)
  - 그룹별 필터
  - 검색 기능

- ✅ **디바이스 작업**
  - 디바이스 추가
  - 디바이스 정보 조회
  - 재시작 (개별/일괄)
  - 구성 백업 (개별/일괄)
  - 펌웨어 업그레이드
  - 삭제 (개별/일괄)

#### 컴포넌트

```
components/devices/
├── DeviceTable.tsx          # 메인 테이블
├── DevicePagination.tsx     # 페이지네이션
├── DeviceFilters.tsx        # 필터 UI
├── AddDeviceModal.tsx       # 디바이스 추가 모달
├── DeviceInfoModal.tsx      # 디바이스 상세 정보
└── SortableTableHeader.tsx  # 정렬 가능한 테이블 헤더
```

#### 상태 관리

**Store**: `store/deviceStore.ts`

주요 함수:
- `fetchDevices()`: 디바이스 목록 조회
- `addDevice()`: 새 디바이스 추가
- `updateDevice()`: 디바이스 정보 업데이트
- `deleteDevice()`: 디바이스 삭제
- `batchReboot()`: 일괄 재시작
- `batchBackup()`: 일괄 백업

#### 사용 예시

```tsx
import useDeviceStore from '@/store/deviceStore';

function MyComponent() {
  const {
    devices,
    loading,
    fetchDevices,
    addDevice,
    rebootDevice,
  } = useDeviceStore();

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div>
      {devices.map(device => (
        <DeviceCard
          key={device.id}
          device={device}
          onReboot={() => rebootDevice(device.id)}
        />
      ))}
    </div>
  );
}
```

---

### 2. 플로우 규칙 편집기 (`/network/flows`)

**위치**: `app/(dashboard)/network/flows/page.tsx`

#### 기능

- ✅ **플로우 규칙 관리**
  - 규칙 생성, 수정, 삭제
  - 규칙 활성화/비활성화
  - 우선순위 설정
  - 규칙 복제

- ✅ **매치 조건 설정**
  - 프로토콜 (TCP, UDP, ICMP 등)
  - IP 주소 (소스/목적지)
  - 포트 번호
  - VLAN ID
  - MAC 주소

- ✅ **액션 정의**
  - FORWARD: 특정 포트로 전달
  - DROP: 패킷 폐기
  - MODIFY: 패킷 수정
  - OUTPUT: 컨트롤러로 전송

- ✅ **규칙 검증**
  - 규칙 충돌 감지
  - 유효성 검사
  - 우선순위 검증

- ✅ **통계 및 모니터링**
  - 패킷 카운트
  - 바이트 카운트
  - 마지막 매치 시간
  - 규칙 지속 시간

#### 컴포넌트

```
components/network/
├── FlowRuleEditor.tsx         # 메인 편집기
├── FlowRuleForm.tsx          # 규칙 폼
├── MatchFieldsEditor.tsx     # 매치 조건 편집기
├── ActionsEditor.tsx         # 액션 편집기
├── FlowValidationPanel.tsx   # 검증 패널
├── FlowStatisticsPanel.tsx   # 통계 표시
├── FlowJsonEditor.tsx        # JSON 편집기
├── FlowTemplateLibrary.tsx   # 템플릿 라이브러리
└── FlowEditorTabs.tsx        # 탭 네비게이션
```

#### 유틸리티

**Validation**: `lib/flowValidation.ts`

```typescript
import { validateFlowRule } from '@/lib/flowValidation';

const validation = validateFlowRule(newRule, existingRules);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
  console.log('Conflicts:', validation.conflicts);
}
```

#### 플로우 규칙 예시

```typescript
const exampleRule: FlowRule = {
  id: 'rule-1',
  name: 'Allow HTTP Traffic',
  description: 'HTTP 트래픽 허용',
  priority: 1000,
  match: {
    protocol: 'TCP',
    dstPort: 80,
  },
  actions: [
    { type: 'FORWARD', outputPort: 1 }
  ],
  timeout: {
    hardTimeout: 0,    // 0 = 무제한
    idleTimeout: 300,  // 5분
  },
  status: 'active',
};
```

---

### 3. 포트 관리 (`/network/ports`)

**위치**: `app/(dashboard)/network/ports/page.tsx`

#### 기능

- ✅ **포트 모니터링**
  - 실시간 상태 조회
  - 트래픽 통계
  - 에러 감지
  - 포트 속도 및 듀플렉스 정보

- ✅ **포트 구성**
  - 활성화/비활성화
  - 속도 설정 (10M/100M/1G/10G)
  - 듀플렉스 모드 (Half/Full/Auto)
  - VLAN 설정
  - STP 설정

- ✅ **포트 필터링**
  - 상태별 필터 (Up/Down)
  - 속도별 필터
  - 검색 기능

- ✅ **통계 대시보드**
  - 전체 포트 수
  - 활성 포트 수
  - 비활성 포트 수
  - 에러 발생 포트 수

#### 컴포넌트

```
components/network/
├── PortsTable.tsx        # 포트 목록 테이블
├── PortFilters.tsx       # 필터 컴포넌트
├── PortDetailModal.tsx   # 포트 상세 정보
├── PortConfigModal.tsx   # 포트 구성 모달
└── port-columns.tsx      # 테이블 컬럼 정의
```

#### Hooks

**위치**: `hooks/usePorts.ts`

```typescript
import { usePorts, usePortStats } from '@/hooks/usePorts';

function PortsManagement() {
  const { data: ports, isLoading } = usePorts({ status: 'up' });
  const { data: stats } = usePortStats();

  return (
    <div>
      <p>Total Ports: {stats.total}</p>
      <p>Active: {stats.active}</p>
      <PortsTable data={ports} />
    </div>
  );
}
```

#### 포트 구성 예시

```typescript
interface PortConfig {
  enabled: boolean;
  speed: '10M' | '100M' | '1G' | '10G' | 'auto';
  duplex: 'half' | 'full' | 'auto';
  vlan: number;
  stp: {
    enabled: boolean;
    priority: number;
  };
  description?: string;
}

const portConfig: PortConfig = {
  enabled: true,
  speed: '1G',
  duplex: 'full',
  vlan: 100,
  stp: {
    enabled: true,
    priority: 128,
  },
  description: 'Server Connection',
};
```

---

### 4. QoS 정책 관리 (`/network/qos`)

**위치**: `app/(dashboard)/network/qos/page.tsx`

#### 기능

- ✅ **QoS 정책 관리**
  - 정책 생성, 수정, 삭제
  - 정책 활성화/비활성화
  - 우선순위 설정
  - 디바이스/포트 적용

- ✅ **트래픽 클래스 정의**
  - 클래스명 및 설명
  - 우선순위 (1-8)
  - DSCP 값 설정
  - 순서 지정

- ✅ **대역폭 할당**
  - 최소/최대 대역폭 보장
  - 비율 기반 할당
  - 절대값 설정 (Mbps)

- ✅ **우선순위 큐**
  - 큐 개수 설정 (1-8)
  - 스케줄링 알고리즘 (WRR, SP, WFQ)
  - 큐별 가중치

- ✅ **DSCP 마킹**
  - IP DSCP 값 설정
  - CoS 값 설정
  - 트래픽 분류 규칙

- ✅ **고급 필터링**
  - 상태별 필터 (활성/비활성/초안/오류)
  - 우선순위별 필터
  - 검색 기능
  - 정렬 기능

#### 컴포넌트

```
components/qos/
├── QoSPolicyTable.tsx         # 정책 테이블
├── CreateQoSPolicyModal.tsx   # 정책 생성 모달
├── EditQoSPolicyModal.tsx     # 정책 수정 모달
├── DeleteQoSPolicyModal.tsx   # 정책 삭제 확인
├── TrafficClassEditor.tsx     # 트래픽 클래스 편집기
├── BandwidthAllocation.tsx    # 대역폭 할당 UI
└── QoSMonitoringDashboard.tsx # 모니터링 대시보드
```

#### 타입 정의

**위치**: `types/qos.ts`

주요 타입:
- `QoSPolicy`: QoS 정책
- `TrafficClass`: 트래픽 클래스
- `BandwidthAllocation`: 대역폭 할당
- `PriorityQueue`: 우선순위 큐
- `DSCPMarking`: DSCP 마킹

#### QoS 정책 예시

```typescript
const qosPolicy: QoSPolicy = {
  id: 'qos-1',
  name: 'High Priority Traffic',
  description: '높은 우선순위가 필요한 트래픽',
  priority: 'high',
  status: 'active',

  trafficClasses: [
    {
      id: 'tc1',
      name: 'VoIP',
      priority: 1,
      dscpValue: 46,  // EF (Expedited Forwarding)
      description: 'Voice over IP traffic',
      order: 0,
    },
    {
      id: 'tc2',
      name: 'Video',
      priority: 2,
      dscpValue: 34,  // AF41
      order: 1,
    },
  ],

  bandwidthAllocations: [
    {
      trafficClassId: 'tc1',
      minBandwidth: { value: 1, unit: 'mbps' },
      maxBandwidth: { value: 10, unit: 'mbps' },
    },
  ],

  priorityQueues: [
    {
      queueId: 1,
      priority: 'high',
      weight: 80,
      algorithm: 'WRR',  // Weighted Round Robin
    },
  ],

  dscpMarkings: [
    {
      id: 'dm1',
      matchCriteria: { protocol: 'UDP', dstPort: 5060 },
      dscpValue: 46,
      description: 'Mark SIP traffic as EF',
    },
  ],

  appliedDevices: ['device-1', 'device-2'],
  appliedPorts: ['port-1'],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

## 통합 사용 시나리오

### 시나리오 1: 새 네트워크 디바이스 추가 및 구성

```typescript
// 1. 디바이스 추가
const newDevice = await addDevice({
  hostname: 'switch-01',
  ipAddress: '192.168.1.10',
  type: 'switch',
  model: 'Cisco Catalyst 2960',
});

// 2. 포트 구성
await configurePort(newDevice.id, 'eth1', {
  enabled: true,
  speed: '1G',
  duplex: 'full',
  vlan: 100,
});

// 3. 플로우 규칙 적용
await addFlowRule({
  name: 'Allow Management',
  deviceId: newDevice.id,
  match: { dstPort: 22 },
  actions: [{ type: 'FORWARD', outputPort: 1 }],
});

// 4. QoS 정책 적용
await applyQoSPolicy(qosPolicyId, {
  devices: [newDevice.id],
});
```

### 시나리오 2: 트래픽 우선순위 설정

```typescript
// 1. QoS 정책 생성
const policy = await createQoSPolicy({
  name: 'Voice Priority',
  priority: 'critical',
  trafficClasses: [
    {
      name: 'VoIP',
      priority: 1,
      dscpValue: 46,
    },
  ],
});

// 2. 대역폭 할당
await addBandwidthAllocation(policy.id, {
  minBandwidth: { value: 2, unit: 'mbps' },
  maxBandwidth: { value: 5, unit: 'mbps' },
});

// 3. 플로우 규칙으로 트래픽 분류
await addFlowRule({
  name: 'VoIP Traffic',
  match: { protocol: 'UDP', dstPort: 5060 },
  actions: [
    { type: 'SET_QUEUE', queueId: 1 },
    { type: 'FORWARD', outputPort: 1 },
  ],
});
```

---

## API 엔드포인트

### 디바이스 관리

```
GET    /api/devices              # 디바이스 목록 조회
POST   /api/devices              # 디바이스 추가
GET    /api/devices/:id          # 디바이스 상세 조회
PUT    /api/devices/:id          # 디바이스 정보 업데이트
DELETE /api/devices/:id          # 디바이스 삭제
POST   /api/devices/:id/reboot   # 디바이스 재시작
POST   /api/devices/:id/backup   # 구성 백업
POST   /api/devices/batch/reboot # 일괄 재시작
POST   /api/devices/batch/backup # 일괄 백업
```

### 플로우 규칙

```
GET    /api/flows                # 플로우 규칙 목록
POST   /api/flows                # 플로우 규칙 생성
GET    /api/flows/:id            # 플로우 규칙 조회
PUT    /api/flows/:id            # 플로우 규칙 업데이트
DELETE /api/flows/:id            # 플로우 규칙 삭제
POST   /api/flows/:id/validate   # 플로우 규칙 검증
GET    /api/flows/:id/statistics # 플로우 통계 조회
```

### 포트 관리

```
GET    /api/ports                # 포트 목록 조회
GET    /api/ports/:id            # 포트 상세 조회
PUT    /api/ports/:id/config     # 포트 구성 업데이트
GET    /api/ports/:id/statistics # 포트 통계 조회
POST   /api/ports/:id/reset      # 포트 카운터 리셋
```

### QoS 정책

```
GET    /api/qos/policies         # QoS 정책 목록
POST   /api/qos/policies         # QoS 정책 생성
GET    /api/qos/policies/:id     # QoS 정책 조회
PUT    /api/qos/policies/:id     # QoS 정책 업데이트
DELETE /api/qos/policies/:id     # QoS 정책 삭제
POST   /api/qos/policies/:id/apply # 정책 적용
GET    /api/qos/statistics       # QoS 통계 조회
```

---

## Best Practices

### 1. 디바이스 관리

- 디바이스 추가 시 반드시 연결 테스트 수행
- 정기적인 구성 백업 수행 (권장: 일 1회)
- 디바이스 그룹을 활용한 체계적 관리
- 중요 작업 전 현재 구성 백업

### 2. 플로우 규칙

- 우선순위를 명확하게 설정 (높은 우선순위 = 낮은 숫자)
- 규칙 추가 전 검증 도구 활용
- 유사한 규칙은 템플릿으로 저장
- 정기적으로 미사용 규칙 정리

### 3. 포트 관리

- 포트 설정 변경 시 연결된 디바이스 확인
- 트렁크 포트는 명확한 VLAN 설정
- STP 설정 시 루프 방지 확인
- 에러 카운터 주기적 모니터링

### 4. QoS 정책

- 트래픽 클래스는 명확하게 분류
- 대역폭 할당 시 총합이 100%를 넘지 않도록 주의
- 중요 트래픽에 최소 대역폭 보장
- 정책 적용 전 테스트 환경에서 검증

---

## 문제 해결

### 디바이스 연결 실패

1. 디바이스 IP 주소 확인
2. 네트워크 연결 상태 확인
3. 방화벽 설정 확인
4. 인증 정보 확인

### 플로우 규칙 충돌

1. FlowValidationPanel에서 충돌 확인
2. 우선순위 재조정
3. 매치 조건 명확화
4. 불필요한 규칙 제거

### 포트 설정 실패

1. 포트 상태 확인 (물리적 연결)
2. 디바이스 지원 속도 확인
3. 케이블 품질 확인
4. 디바이스 재시작 시도

### QoS 정책 적용 안 됨

1. 정책 상태 확인 (활성화 여부)
2. 디바이스/포트 적용 여부 확인
3. DSCP 마킹 규칙 확인
4. 대역폭 할당 검증

---

## 참고 자료

- [OpenFlow Specification](https://www.opennetworking.org/software-defined-standards/specifications/)
- [QoS Configuration Guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/12-2_55_se/configuration/guide/scg_2960/swqos.html)
- [DSCP Values Reference](https://www.iana.org/assignments/dscp-registry/dscp-registry.xhtml)

---

## 업데이트 이력

- **2024-11-29**: 네트워크 관리 기능 완성
  - 디바이스 관리 페이지 완료
  - 플로우 규칙 편집기 완료
  - 포트 관리 페이지 완료
  - QoS 정책 관리 페이지 완료
