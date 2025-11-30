/**
 * API 에러 처리 클래스
 * 다양한 에러 상황에 대한 커스텀 에러 클래스
 */

import { ApiErrorCode } from '@/types/api';

/**
 * 기본 API 에러 클래스
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ApiErrorCode = ApiErrorCode.UNKNOWN_ERROR,
    status: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // 프로토타입 체인 유지
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 인증 에러
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = '인증이 필요합니다', details?: any) {
    super(message, ApiErrorCode.UNAUTHORIZED, 401, details);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 권한 에러
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = '접근 권한이 없습니다', details?: any) {
    super(message, ApiErrorCode.FORBIDDEN, 403, details);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 리소스 없음 에러
 */
export class NotFoundError extends ApiError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다', details?: any) {
    super(message, ApiErrorCode.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 유효성 검사 에러
 */
export class ValidationError extends ApiError {
  constructor(message: string = '입력 데이터가 유효하지 않습니다', details?: any) {
    super(message, ApiErrorCode.VALIDATION_ERROR, 400, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 충돌 에러 (리소스 중복 등)
 */
export class ConflictError extends ApiError {
  constructor(message: string = '요청이 현재 상태와 충돌합니다', details?: any) {
    super(message, ApiErrorCode.CONFLICT, 409, details);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Rate Limit 초과 에러
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(message: string = '요청 한도를 초과했습니다', retryAfter?: number, details?: any) {
    super(message, ApiErrorCode.RATE_LIMIT_EXCEEDED, 429, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 서버 에러
 */
export class ServerError extends ApiError {
  constructor(message: string = '서버 오류가 발생했습니다', details?: any) {
    super(message, ApiErrorCode.INTERNAL_SERVER_ERROR, 500, details);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends ApiError {
  constructor(message: string = '네트워크 연결에 실패했습니다', details?: any) {
    super(message, ApiErrorCode.NETWORK_ERROR, 0, details);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * 타임아웃 에러
 */
export class TimeoutError extends ApiError {
  constructor(message: string = '요청 시간이 초과되었습니다', details?: any) {
    super(message, ApiErrorCode.TIMEOUT_ERROR, 0, details);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * HTTP 상태 코드로부터 적절한 에러 클래스 생성
 */
export function createErrorFromStatus(
  status: number,
  message?: string,
  details?: any
): ApiError {
  switch (status) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new UnauthorizedError(message, details);
    case 403:
      return new ForbiddenError(message, details);
    case 404:
      return new NotFoundError(message, details);
    case 409:
      return new ConflictError(message, details);
    case 429:
      return new RateLimitError(message, undefined, details);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, details);
    default:
      return new ApiError(
        message || '알 수 없는 오류가 발생했습니다',
        ApiErrorCode.UNKNOWN_ERROR,
        status,
        details
      );
  }
}

/**
 * Axios 에러로부터 API 에러 생성
 */
export function createErrorFromAxiosError(error: any): ApiError {
  // 네트워크 에러
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new TimeoutError(error.message);
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return new NetworkError(error.message);
  }

  // HTTP 응답 에러
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.error?.message || data?.message || error.message;
    const details = data?.error?.details || data?.details;

    return createErrorFromStatus(status, message, details);
  }

  // 기타 에러
  return new ApiError(error.message || '알 수 없는 오류가 발생했습니다');
}

/**
 * 에러 로깅 유틸리티
 */
export function logError(error: ApiError, context?: string) {
  const logData = {
    context,
    ...error.toJSON(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', logData);
  }

  // 프로덕션에서는 에러 추적 서비스로 전송
  // 예: Sentry, LogRocket 등
}
