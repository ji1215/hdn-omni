/**
 * 사용자 관리 API 서비스
 * 사용자 CRUD, 검색, 필터링 등의 API 호출
 */

import { api } from '@/lib/httpClient';
import { API_ENDPOINTS, type PaginatedResponse } from '@/types/api';

// 사용자 역할
export type UserRole = 'Super Admin' | 'Network Admin' | 'Monitoring User' | 'Guest';

// 사용자 상태
export type UserStatus = 'active' | 'inactive';

// 사용자 데이터
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  phoneNumber?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 사용자 목록 필터
export interface UserListFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 사용자 생성 요청
export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  phoneNumber?: string;
  password?: string; // 임시 비밀번호
  sendEmail?: boolean; // 이메일 알림 발송 여부
}

// 사용자 수정 요청
export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  department?: string;
  phoneNumber?: string;
  status?: UserStatus;
}

// 일괄 삭제 요청
export interface BulkDeleteRequest {
  userIds: string[];
  reason?: string;
}

/**
 * 사용자 서비스
 */
export const userService = {
  /**
   * 사용자 목록 조회
   */
  async getUsers(filters: UserListFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.department) params.append('department', filters.department);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.USERS.LIST}?${params.toString()}`
    );

    return response.data.data as PaginatedResponse<User>;
  },

  /**
   * 사용자 상세 조회
   */
  async getUser(id: string): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.USERS.GET(id));
    return response.data.data;
  },

  /**
   * 사용자 생성
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post<User>(API_ENDPOINTS.USERS.CREATE, data);
    return response.data.data;
  },

  /**
   * 사용자 수정
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data.data;
  },

  /**
   * 사용자 삭제
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  /**
   * 사용자 일괄 삭제
   */
  async bulkDeleteUsers(data: BulkDeleteRequest): Promise<void> {
    await api.post(API_ENDPOINTS.USERS.BULK_DELETE, data);
  },

  /**
   * 사용자 상태 토글 (활성/비활성)
   */
  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.getUser(id);
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';

    return this.updateUser(id, { status: newStatus });
  },
};

export default userService;
