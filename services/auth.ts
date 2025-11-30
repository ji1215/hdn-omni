/**
 * 인증 API 서비스
 * 로그인, 로그아웃, 토큰 갱신 등의 인증 관련 API 호출
 */

import { api } from '@/lib/httpClient';
import { tokenManager } from '@/lib/httpClient';
import { API_ENDPOINTS, type AuthTokens } from '@/types/api';

// 로그인 요청 데이터
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답 데이터
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: AuthTokens;
}

// 사용자 정보 (토큰 검증)
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  createdAt: string;
}

/**
 * 인증 서비스
 */
export const authService = {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    // 토큰 저장
    const { accessToken, refreshToken } = response.data.data.tokens;
    tokenManager.setTokens(accessToken, refreshToken);

    return response.data.data;
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // 성공 여부와 관계없이 로컬 토큰 제거
      tokenManager.clearTokens();
    }
  },

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    const tokens = response.data.data;
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

    return tokens;
  },

  /**
   * 토큰 검증 및 사용자 정보 조회
   */
  async verifyToken(): Promise<UserInfo> {
    const response = await api.get<UserInfo>(API_ENDPOINTS.AUTH.VERIFY);
    return response.data.data;
  },

  /**
   * 인증 상태 확인
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  /**
   * 현재 토큰 가져오기
   */
  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  },
};

export default authService;
