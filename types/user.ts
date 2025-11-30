/**
 * 사용자 관련 타입 정의
 */

// 사용자 역할 타입
export type UserRole = 'super_admin' | 'network_admin' | 'monitoring_user' | 'guest';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'suspended';

// 사용자 인터페이스
export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  contact: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  name: string;
  email: string;
  department: string;
  contact: string;
  role: UserRole;
  sendEmail: boolean; // 이메일 알림 발송 여부
}

// 사용자 수정 요청 타입
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  department?: string;
  contact?: string;
  role?: UserRole;
  status?: UserStatus;
}

// 사용자 삭제 요청 타입
export interface DeleteUserRequest {
  id: string; // 사용자 ID
  reason: string; // 삭제 사유
}

// 사용자 목록 필터 타입
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  createdFrom?: string;
  createdTo?: string;
  search?: string; // 이름 또는 이메일 검색
}

// 페이지네이션 파라미터
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 사용자 목록 응답 타입
export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 감사 로그 작업 타입
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_reset';

// 감사 로그 인터페이스
export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  performedBy: string; // 작업 수행자 ID
  performedByName: string; // 작업 수행자 이름
  timestamp: string;
  details: string;
  ipAddress?: string; // IP 주소
  before?: Partial<User>; // 변경 전 값
  after?: Partial<User>; // 변경 후 값
}

// 감사 로그 목록 응답 타입
export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

// 역할 표시 이름 매핑
export const UserRoleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  network_admin: 'Network Admin',
  monitoring_user: 'Monitoring User',
  guest: 'Guest',
};

// 상태 표시 이름 매핑
export const UserStatusLabels: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지',
};

// 역할 색상 매핑 (Tailwind 클래스)
export const UserRoleColors: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  network_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  monitoring_user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  guest: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

// 상태 색상 매핑 (Tailwind 클래스)
export const UserStatusColors: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
