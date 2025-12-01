/**
 * 부서 관리 API 서비스
 * 부서 CRUD, 검색, 필터링 등의 API 호출
 */

import { api } from '@/lib/httpClient';
import { API_ENDPOINTS, type PaginatedResponse } from '@/types/api';
import {
  Department,
  DepartmentStatus,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentFilters,
  DepartmentOption,
} from '@/types/department';

// 부서 목록 필터
export interface DepartmentListFilters {
  search?: string;
  status?: DepartmentStatus;
  parentId?: string | null;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 부서 서비스
 */
export const departmentService = {
  /**
   * 부서 목록 조회
   */
  async getDepartments(filters: DepartmentListFilters = {}): Promise<PaginatedResponse<Department>> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.parentId !== undefined) params.append('parentId', filters.parentId || '');
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<PaginatedResponse<Department>>(
      `${API_ENDPOINTS.DEPARTMENTS.LIST}?${params.toString()}`
    );

    return response.data.data as PaginatedResponse<Department>;
  },

  /**
   * 부서 상세 조회
   */
  async getDepartment(id: string): Promise<Department> {
    const response = await api.get<Department>(API_ENDPOINTS.DEPARTMENTS.GET(id));
    return response.data.data;
  },

  /**
   * 부서 생성
   */
  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    const response = await api.post<Department>(API_ENDPOINTS.DEPARTMENTS.CREATE, data);
    return response.data.data;
  },

  /**
   * 부서 수정
   */
  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await api.put<Department>(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data);
    return response.data.data;
  },

  /**
   * 부서 삭제
   */
  async deleteDepartment(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id));
  },

  /**
   * 부서 상태 토글 (활성/비활성)
   */
  async toggleDepartmentStatus(id: string): Promise<Department> {
    const department = await this.getDepartment(id);
    const newStatus: DepartmentStatus = department.status === 'active' ? 'inactive' : 'active';

    return this.updateDepartment(id, { status: newStatus });
  },

  /**
   * 부서 드롭다운 옵션 조회 (사용자 관리 연동용)
   */
  async getDepartmentOptions(): Promise<DepartmentOption[]> {
    const response = await this.getDepartments({ status: 'active', pageSize: 100 });
    return response.data.map((dept) => ({
      value: dept.id,
      label: dept.name,
    }));
  },
};

export default departmentService;
