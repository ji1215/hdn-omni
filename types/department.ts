/**
 * 부서 관련 타입 정의
 */

// 부서 상태 타입
export type DepartmentStatus = 'active' | 'inactive';

// 부서 인터페이스
export interface Department {
  id: string;
  name: string;
  description: string;
  parentId: string | null; // 상위 부서 ID (null이면 최상위 부서)
  parentName?: string; // 상위 부서명 (조회 시 포함)
  status: DepartmentStatus;
  memberCount: number; // 소속 인원 수
  createdAt: string;
  updatedAt: string;
}

// 부서 생성 요청 타입
export interface CreateDepartmentRequest {
  name: string;
  description: string;
  parentId: string | null;
}

// 부서 수정 요청 타입
export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  parentId?: string | null;
  status?: DepartmentStatus;
}

// 부서 삭제 요청 타입
export interface DeleteDepartmentRequest {
  id: string;
  reason: string; // 삭제 사유
}

// 부서 목록 필터 타입
export interface DepartmentFilters {
  status?: DepartmentStatus;
  parentId?: string | null;
  search?: string; // 부서명 검색
}

// 부서 목록 응답 타입
export interface DepartmentsListResponse {
  departments: Department[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 상태 표시 이름 매핑
export const DepartmentStatusLabels: Record<DepartmentStatus, string> = {
  active: '활성',
  inactive: '비활성',
};

// 상태 색상 매핑 (Tailwind 클래스)
export const DepartmentStatusColors: Record<DepartmentStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

// 부서 드롭다운 옵션용 타입 (사용자 관리 연동)
export interface DepartmentOption {
  value: string;
  label: string;
}
