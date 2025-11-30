/**
 * HTTP 클라이언트
 * Axios 기반 HTTP 클라이언트 with 인터셉터, Rate Limiting, 재시도 로직
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import rateLimit from 'axios-rate-limit';
import { createErrorFromAxiosError, logError } from './errors';
import { errorLogger } from './errors/error-logger';
import type { ApiResponse } from '@/types/api';

// 토큰 스토리지 키
const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

/**
 * 토큰 관리 클래스
 */
class TokenManager {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const tokenManager = new TokenManager();

/**
 * Exponential Backoff 재시도 설정
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1초
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Exponential Backoff 지연 계산
 */
function getRetryDelay(retryCount: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, retryCount), 30000); // 최대 30초
}

/**
 * HTTP 클라이언트 생성
 */
function createHttpClient(): AxiosInstance {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

  // Axios 인스턴스 생성
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30초
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false, // CORS credentials
  });

  // Rate Limiting 적용 (초당 10개 요청)
  const rateLimitedClient = rateLimit(client, {
    maxRequests: 10,
    perMilliseconds: 1000,
  });

  // 요청 인터셉터
  rateLimitedClient.interceptors.request.use(
    (config) => {
      // JWT 토큰 추가
      const token = tokenManager.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 요청 로깅 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Request]', {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
          data: config.data,
        });
      }

      // 재시도 카운트 초기화
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config as any).__retryCount = (config as any).__retryCount || 0;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  rateLimitedClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      // 응답 로깅 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Response]', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }

      return response;
    },
    async (error) => {
      const config = error.config as AxiosRequestConfig & { __retryCount?: number };

      // 재시도 로직
      if (config && shouldRetry(error, config)) {
        config.__retryCount = (config.__retryCount || 0) + 1;

        const delay = getRetryDelay(config.__retryCount, DEFAULT_RETRY_CONFIG.retryDelay);

        await new Promise((resolve) => setTimeout(resolve, delay));

        return rateLimitedClient(config);
      }

      // 401 Unauthorized - 토큰 갱신 시도
      if (error.response?.status === 401 && !config?.url?.includes('/auth/refresh')) {
        try {
          const refreshToken = tokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await rateLimitedClient.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            tokenManager.setTokens(accessToken, newRefreshToken);

            // 원래 요청 재시도
            if (config && config.headers) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return rateLimitedClient(config!);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 - 로그아웃 처리
          tokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }

      // 에러 변환 및 로깅
      const apiError = createErrorFromAxiosError(error);
      logError(apiError, config?.url);

      // 새로운 에러 로거에도 기록
      errorLogger.log(apiError, {
        url: config?.url,
        method: config?.method?.toUpperCase(),
        status: error.response?.status,
      });

      return Promise.reject(apiError);
    }
  );

  return rateLimitedClient as AxiosInstance;
}

/**
 * 재시도 여부 판단
 */
function shouldRetry(error: any, config: any): boolean {
  const retryCount = config.__retryCount || 0;

  if (retryCount >= DEFAULT_RETRY_CONFIG.maxRetries) {
    return false;
  }

  // 네트워크 에러는 재시도
  if (!error.response) {
    return true;
  }

  // 특정 상태 코드는 재시도
  const status = error.response.status;
  return DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status);
}

// HTTP 클라이언트 싱글톤 인스턴스
export const httpClient = createHttpClient();

/**
 * API 요청 헬퍼 함수
 */
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get<ApiResponse<T>>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    httpClient.post<ApiResponse<T>>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    httpClient.put<ApiResponse<T>>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    httpClient.patch<ApiResponse<T>>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<ApiResponse<T>>(url, config),
};

export default httpClient;
