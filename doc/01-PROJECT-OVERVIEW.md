# 1. 프로젝트 개요

## 프로젝트 소개

**HDN-OMNI**는 웹 기반 SDN (Software-Defined Networking) 컨트롤러 관리 인터페이스입니다. 네트워크 관리자가 중앙 집중식으로 네트워크를 모니터링, 구성, 제어할 수 있는 Next.js 애플리케이션입니다.

### 주요 기능

1. **대시보드**: 네트워크 상태 요약, KPI 메트릭, 실시간 업데이트 (5초 간격)
2. **모니터링**: 네트워크 토폴로지, 리소스 모니터링, 트래픽 분석, 경고/이벤트
3. **네트워크 관리**: 디바이스 관리, 플로우 규칙, 포트 관리, QoS 정책
4. **보안**: 사용자 관리, 역할 관리, 감사 로그
5. **설정**: 시스템 설정

---

## 기술 스택

### 프론트엔드 프레임워크
| 기술 | 버전 | 설명 |
|------|------|------|
| Next.js | 14.x | App Router 사용 |
| React | 18.x | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |

### 상태 관리
| 기술 | 용도 |
|------|------|
| Zustand | 글로벌 상태 관리 (테마, 사용자, 사이드바) |
| TanStack Query (React Query) | 서버 상태 관리 및 캐싱 |

### UI/스타일링
| 기술 | 용도 |
|------|------|
| Tailwind CSS | 유틸리티 기반 스타일링 |
| Radix UI | 접근성 높은 headless 컴포넌트 |
| Lucide React | 아이콘 라이브러리 |
| Recharts | 차트 라이브러리 |
| Cytoscape.js | 네트워크 토폴로지 시각화 |

### 폼 및 유효성 검사
| 기술 | 용도 |
|------|------|
| React Hook Form | 폼 관리 |
| Zod | 스키마 기반 유효성 검사 |

### HTTP 통신
| 기술 | 용도 |
|------|------|
| Axios | HTTP 클라이언트 |
| axios-rate-limit | API 요청 속도 제한 |

---

## 개발 환경 설정

### 필수 요구사항
- Node.js 18.x 이상
- npm 또는 pnpm

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd hdn-omni

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# 필요한 경우 .env 파일 수정

# 4. 개발 서버 시작
npm run dev

# 5. 브라우저에서 확인
open http://localhost:3000
```

---

## 주요 명령어

### 개발
```bash
# 개발 서버 시작
npm run dev

# 특정 포트로 실행
npm run dev -- --port 3001

# 타입 체크
npm run type-check

# 린트 실행
npm run lint
npm run lint:fix

# 코드 포맷팅
npm run format
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

---

## 환경 변수

`.env.example` 파일 참고:

```env
# 백엔드 API 기본 URL
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"

# 애플리케이션 정보
NEXT_PUBLIC_APP_NAME="HDN Omni"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

> **참고**: 현재 개발 모드에서는 목업(Mock) 데이터를 사용합니다. 실제 백엔드 연동 시 `services/` 폴더의 `USE_MOCK_DATA` 플래그를 `false`로 변경해야 합니다.

---

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

---

## 참고 문서

- 프로젝트 루트의 `CLAUDE.md` - 개발 가이드라인
- 프로젝트 루트의 `SDN_Controller_PRD.md` - 제품 요구사항 문서
- 프로젝트 루트의 `ERROR_HANDLING_GUIDE.md` - 에러 처리 가이드
- 프로젝트 루트의 `NETWORK_MANAGEMENT_GUIDE.md` - 네트워크 관리 가이드
