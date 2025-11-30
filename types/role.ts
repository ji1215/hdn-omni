/**
 * 역할 관리 타입 정의
 */

import { UserRole } from './user';
import { Permission } from './rbac';

// 역할 상태 타입
export type RoleStatus = 'active' | 'inactive';

// 역할 인터페이스
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number; // 이 역할을 가진 사용자 수
  status: RoleStatus;
  isSystem: boolean; // 시스템 기본 역할 여부 (삭제 불가)
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// 역할 생성 요청 타입
export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: Permission[];
}

// 역할 수정 요청 타입
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Permission[];
  status?: RoleStatus;
}

// 역할 삭제 요청 타입
export interface DeleteRoleRequest {
  id: string;
  reason: string; // 삭제 사유
  transferToRoleId?: string; // 기존 사용자들을 이관할 역할 ID
}

// 역할 목록 필터 타입
export interface RoleFilters {
  status?: RoleStatus;
  search?: string; // 이름 또는 설명 검색
  isSystem?: boolean;
}

// 역할 목록 응답 타입
export interface RolesListResponse {
  roles: Role[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 역할 통계
export interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  totalUsers: number;
}

// 역할 상태 표시 이름 매핑
export const RoleStatusLabels: Record<RoleStatus, string> = {
  active: '활성',
  inactive: '비활성',
};

// 역할 상태 색상 매핑 (Tailwind 클래스)
export const RoleStatusColors: Record<RoleStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};
