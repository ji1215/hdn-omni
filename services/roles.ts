/**
 * 역할 관리 API 서비스
 * 역할 CRUD, 검색, 필터링 등의 API 호출
 */

import { api } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/types/api';
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  DeleteRoleRequest,
  RoleFilters,
  RolesListResponse,
} from '@/types/role';

/**
 * 역할 목록 조회 파라미터
 */
export interface GetRolesParams extends RoleFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 역할 서비스
 */
export const roleService = {
  /**
   * 역할 목록 조회
   */
  async getRoles(params: GetRolesParams = {}): Promise<RolesListResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.isSystem !== undefined) queryParams.append('isSystem', params.isSystem.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get<RolesListResponse>(
      `${API_ENDPOINTS.ROLES.LIST}?${queryParams.toString()}`
    );

    return response.data.data as RolesListResponse;
  },

  /**
   * 역할 상세 조회
   */
  async getRole(id: string): Promise<Role> {
    const response = await api.get<Role>(API_ENDPOINTS.ROLES.GET(id));
    return response.data.data;
  },

  /**
   * 역할 생성
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await api.post<Role>(API_ENDPOINTS.ROLES.CREATE, data);
    return response.data.data;
  },

  /**
   * 역할 수정
   */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const response = await api.put<Role>(API_ENDPOINTS.ROLES.UPDATE(id), data);
    return response.data.data;
  },

  /**
   * 역할 삭제
   */
  async deleteRole(id: string, data?: Omit<DeleteRoleRequest, 'id'>): Promise<void> {
    await api.delete(API_ENDPOINTS.ROLES.DELETE(id), {
      data,
    });
  },

  /**
   * 역할 상태 토글 (활성/비활성)
   */
  async toggleRoleStatus(id: string): Promise<Role> {
    const role = await this.getRole(id);
    const newStatus = role.status === 'active' ? 'inactive' : 'active';

    return this.updateRole(id, { status: newStatus });
  },
};

export default roleService;
