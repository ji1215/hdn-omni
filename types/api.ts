/**
 * API 타입 정의
 * HTTP 요청/응답, 에러 처리를 위한 타입
 */

// API 응답 기본 구조
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  message?: string;
  timestamp: string;
}

// API 에러 응답
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// 요청 설정
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
}

// 인증 토큰
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// 토큰 페이로드
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// 에러 코드
export enum ApiErrorCode {
  // 클라이언트 에러 (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // 서버 에러 (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

  // 네트워크 에러
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 기타
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },

  // 사용자
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    BULK_DELETE: '/users/bulk-delete',
  },

  // 역할
  ROLES: {
    LIST: '/roles',
    GET: (id: string) => `/roles/${id}`,
    CREATE: '/roles',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
  },

  // 디바이스
  DEVICES: {
    LIST: '/devices',
    GET: (id: string) => `/devices/${id}`,
    CREATE: '/devices',
    UPDATE: (id: string) => `/devices/${id}`,
    DELETE: (id: string) => `/devices/${id}`,
    STATUS: (id: string) => `/devices/${id}/status`,
  },

  // 플로우 규칙
  FLOWS: {
    LIST: '/flows',
    GET: (id: string) => `/flows/${id}`,
    CREATE: '/flows',
    UPDATE: (id: string) => `/flows/${id}`,
    DELETE: (id: string) => `/flows/${id}`,
  },

  // 포트
  PORTS: {
    LIST: '/ports',
    GET: (id: string) => `/ports/${id}`,
    UPDATE: (id: string) => `/ports/${id}`,
    STATISTICS: (id: string) => `/ports/${id}/statistics`,
  },

  // QoS 정책
  QOS: {
    LIST: '/qos',
    GET: (id: string) => `/qos/${id}`,
    CREATE: '/qos',
    UPDATE: (id: string) => `/qos/${id}`,
    DELETE: (id: string) => `/qos/${id}`,
  },

  // 모니터링
  MONITORING: {
    METRICS: '/monitoring/metrics',
    TOPOLOGY: '/monitoring/topology',
    TRAFFIC: '/monitoring/traffic',
    EVENTS: '/monitoring/events',
  },

  // 감사 로그
  AUDIT: {
    LIST: '/audit/logs',
    GET: (id: string) => `/audit/logs/${id}`,
    EXPORT: '/audit/export',
  },
} as const;
