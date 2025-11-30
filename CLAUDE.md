## 프로젝트 개요

**hdn-omni**는 웹 기반 SDN (Software-Defined Networking) 컨트롤러 관리 인터페이스입니다. 네트워크 관리자가 중앙 집중식으로 네트워크를 모니터링, 구성, 제어할 수 있는 Next.js 애플리케이션입니다.

## 기술 스택

### 프론트엔드 프레임워크

- **Next.js 14+** - App Router 사용
- **TypeScript 5.x** - 모든 코드는 강타입으로 작성
- **Tailwind CSS 3.x** - 유틸리티 우선 스타일링
- **Zustand** - 상태 관리 (Redux의 경량 대안)

### UI 및 데이터 시각화

- **Radix UI** 또는 **Headless UI** - 접근성 높은 컴포넌트 기본 요소
- **Recharts** 또는 **Chart.js** - 메트릭용 차트 및 그래프
- **Cytoscape.js** 또는 **D3.js** - 인터랙티브 네트워크 토폴로지 시각화
- **React Hook Form** - **Zod** 유효성 검사를 사용한 폼 처리
- **TanStack Table** - 디바이스/사용자 목록을 위한 고급 테이블 기능

### 개발 도구

- **Vite 5.x** - 빌드 도구
- **ESLint** + **Prettier** - 코드 품질 및 포맷팅
- **Jest** + **React Testing Library** - 단위 테스트
- **Cypress** - E2E 테스트

## 프로젝트 구조

이 프로젝트는 Next.js 14+ App Router 규칙을 따릅니다:

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 라우트
│   │   └── login/         # 로그인 페이지 (실제 인증 없음 - 대시보드로 리다이렉트)
│   ├── (dashboard)/       # 메인 애플리케이션 레이아웃
│   │   ├── dashboard/     # 개요 대시보드 및 메트릭
│   │   ├── monitoring/    # 네트워크 모니터링 뷰
│   │   ├── network/       # 네트워크 구성 (디바이스, 플로우, 포트, QoS)
│   │   └── security/      # 사용자 및 접근 제어 관리
│   └── layout.tsx
├── components/            # 재사용 가능한 React 컴포넌트
│   ├── common/           # 공유 UI 컴포넌트
│   ├── dashboard/        # 대시보드 전용 컴포넌트
│   ├── network/          # 네트워크 관리 컴포넌트
│   └── security/         # 보안 및 사용자 관리 컴포넌트
├── hooks/                # 커스텀 React 훅
├── lib/                  # 유틸리티 함수 및 헬퍼
├── services/             # API 서비스 레이어
├── store/                # Zustand 상태 스토어
├── styles/               # 글로벌 스타일 및 Tailwind 설정
└── types/                # TypeScript 타입 정의
```

## 주요 아키텍처 결정사항

### 인증

- **실제 인증은 구현되지 않음** - 요구사항에 따른 의도적 선택
- 로그인 페이지는 항상 사용자 관리 페이지로 리다이렉트
- UI/UX 및 폼 유효성 검사에 집중, 실제 보안 로직은 구현하지 않음
- HTTPS, 비밀번호 마스킹, 브루트 포스 방지 UI 요소는 데모용

### 상태 관리 전략

- **Zustand** - 글로벌 상태 관리 (사용자 세션, 네트워크 토폴로지 데이터)
- **TanStack Query** (React Query) - 서버 상태 및 캐싱
- 가능한 경우 컴포넌트 로컬 상태는 React 훅 사용

### 실시간 데이터

- 대시보드는 5초마다 실시간 업데이트
- 라이브 네트워크 이벤트를 위한 WebSocket 연결 (백엔드 지원 시)
- WebSocket 미지원 환경에서는 폴링으로 대체

### 국제화

- 한국어 (기본) 및 영어 지원
- **next-i18next** 사용
- 모든 사용자 대면 문자열은 번역 가능해야 함

## 개발 명령어

### 설정

```bash
# 의존성 설치
npm install
# 또는
pnpm install

# 환경 변수 설정
cp .env.example .env
# 개발에 필요한 경우 .env를 편집하여 API 키 추가
```

### 개발

```bash
# 개발 서버 시작
npm run dev

# 특정 포트에서 실행
npm run dev -- --port 3001

# 타입 체크
npm run type-check
# 또는
tsc --noEmit

# 린팅
npm run lint
npm run lint:fix

# 코드 포맷팅
npm run format
```

### 테스트

```bash
# 모든 테스트 실행
npm test

# 워치 모드로 테스트 실행
npm run test:watch

# 특정 테스트 파일 실행
npm test path/to/test.spec.ts

# E2E 테스트
npm run test:e2e

# 커버리지 리포트 생성
npm run test:coverage
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm run start

# 번들 크기 분석
npm run analyze
```

## 구현 가이드라인

### 컴포넌트 개발

- `components/` 하위의 적절한 디렉토리에 컴포넌트 생성
- TypeScript를 사용한 함수형 컴포넌트 사용
- 상속보다 조합을 선호
- 재사용 가능한 로직은 커스텀 훅으로 추출

컴포넌트 구조 예시:

```typescript
// components/dashboard/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  unit?: string;
}

export function MetricCard({ title, value, trend, unit }: MetricCardProps) {
  // 컴포넌트 구현
}
```

### API 통합

- 모든 API 호출은 `services/` 레이어를 통해 진행
- 데이터 페칭 및 캐싱을 위해 TanStack Query 사용
- 로딩, 에러, 성공 상태를 일관되게 처리

서비스 예시:

```typescript
// services/devices.ts
export const deviceService = {
  getDevices: async () => {
    const response = await fetch('/api/devices');
    return response.json();
  },
  // ... 기타 디바이스 작업
};
```

### 스타일링 규칙

- Tailwind 유틸리티 클래스 사용
- 반복되는 패턴은 재사용 가능한 컴포넌트로 추출
- CSS 모듈은 복잡한 애니메이션이나 서드파티 오버라이드에만 사용
- 모바일 우선 반응형 디자인 적용

### 타입 안전성

- `types/` 디렉토리에 인터페이스/타입 정의
- 서드파티 라이브러리 통합에서 불가피한 경우를 제외하고 `any` 타입 금지
- 엄격한 TypeScript 설정 사용
- 객체 형태는 `interface`, 유니온/인터섹션은 `type` 선호

### 성능 고려사항

- 비용이 많이 드는 컴포넌트에 React.memo() 사용
- 대용량 목록(디바이스 목록, 플로우 규칙)에 가상화 구현
- Next.js 동적 임포트로 라우트 지연 로딩
- next/image로 이미지 최적화
- 번들 크기 모니터링 및 필요시 코드 분할

## 핵심 요구사항

### PRD (SDN_Controller_PRD.md) 기준

1. **로그인 페이지** - 이메일/비밀번호 간단한 폼, 항상 리다이렉트 (실제 인증 없음)
2. **보안 및 접근 제어** - 사용자 관리 CRUD, 역할 기반 UI (Super Admin, Network Admin, Monitoring User, Guest)
3. **대시보드 및 모니터링** - 실시간 메트릭, 인터랙티브 토폴로지 맵, 리소스 사용량 차트, 알림/이벤트, 트래픽 분석
4. **네트워크 관리** - 디바이스 인벤토리, 플로우 규칙 편집기, 포트 구성, QoS 설정

### UI/UX 요구사항

- 페이지 로딩 시간 < 3초
- 대시보드 60 FPS 렌더링
- 100명 이상 동시 사용자 지원 (확장성을 위한 설계)
- 반응형 디자인 (최소 1366x768, 1920x1080 최적화)
- 다크 모드 지원

## 일반적인 작업

### 새 페이지 추가

1. `app/(dashboard)/[page-name]/page.tsx`에 라우트 생성
2. 페이지 메타데이터 및 레이아웃 정의
3. `components/[page-name]/`에 페이지 컴포넌트 구축
4. 사이드바/헤더에 네비게이션 링크 추가
5. 필요시 타입 업데이트

### 대시보드 위젯 생성

1. `components/dashboard/`에 컴포넌트 생성
2. 데이터 페칭 훅 또는 서비스 정의
3. 실시간 업데이트 구현 (5초 간격)
4. 반응형 그리드 포지셔닝 추가
5. 로딩/에러 상태 포함

### 데이터 테이블 구현

1. 복잡한 테이블에 TanStack Table 사용
2. 페이지네이션, 정렬, 필터링 구현
3. 일괄 작업을 위한 다중 선택 추가
4. 키보드 네비게이션 작동 확인
5. 필요시 내보내기 기능 추가 (CSV)

## 환경 변수

```bash
# .env.example에서 사용 가능한 설정 확인
# 프론트엔드 전용 개발에는 민감한 키 불필요
# 백엔드 통합 시 API 엔드포인트 정의 예정
```

## 참고 자료

- **PRD**: `SDN_Controller_PRD.md` - 한국어로 작성된 전체 제품 요구사항

## 개발 규칙

### 개발이 완료 될때

- 개발 완료시 npm run build를 하여 에러가 나는지 확인 후 에러가 나면 에러 해결
