/**
 * RBAC (Role-Based Access Control) 타입 정의
 */

import { UserRole } from './user';

// 권한 액션 타입
export type PermissionAction = 'read' | 'write' | 'execute' | 'delete';

// 리소스 타입 (시스템의 주요 기능 영역)
export type Resource =
  | 'dashboard' // 대시보드
  | 'monitoring' // 모니터링
  | 'network' // 네트워크 관리
  | 'network.devices' // 디바이스 관리
  | 'network.flows' // 플로우 규칙
  | 'network.ports' // 포트 관리
  | 'network.qos' // QoS 정책
  | 'security' // 보안 관리
  | 'security.users' // 사용자 관리
  | 'security.roles' // 역할 관리
  | 'security.audit' // 감사 로그
  | 'settings'; // 시스템 설정

// 권한 정의
export interface Permission {
  resource: Resource;
  actions: PermissionAction[];
}

// 역할별 권한 매트릭스
export type RolePermissionMatrix = {
  [K in UserRole]: Permission[];
};

// 기본 역할 권한 매트릭스
export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix = {
  // Super Admin: 모든 권한
  super_admin: [
    { resource: 'dashboard', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'monitoring', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'network', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'network.devices', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'network.flows', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'network.ports', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'network.qos', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'security', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'security.users', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'security.roles', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'security.audit', actions: ['read', 'write', 'execute', 'delete'] },
    { resource: 'settings', actions: ['read', 'write', 'execute', 'delete'] },
  ],

  // Network Admin: 네트워크 관련 모든 권한, 일부 보안 읽기 권한
  network_admin: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'monitoring', actions: ['read', 'write'] },
    { resource: 'network', actions: ['read', 'write', 'execute'] },
    { resource: 'network.devices', actions: ['read', 'write', 'execute'] },
    { resource: 'network.flows', actions: ['read', 'write', 'execute'] },
    { resource: 'network.ports', actions: ['read', 'write', 'execute'] },
    { resource: 'network.qos', actions: ['read', 'write', 'execute'] },
    { resource: 'security', actions: ['read'] },
    { resource: 'security.users', actions: ['read'] },
    { resource: 'security.audit', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
  ],

  // Monitoring User: 모니터링 및 읽기 전용 권한
  monitoring_user: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'monitoring', actions: ['read'] },
    { resource: 'network', actions: ['read'] },
    { resource: 'network.devices', actions: ['read'] },
    { resource: 'network.flows', actions: ['read'] },
    { resource: 'network.ports', actions: ['read'] },
    { resource: 'network.qos', actions: ['read'] },
    { resource: 'security.audit', actions: ['read'] },
  ],

  // Guest: 최소 읽기 권한
  guest: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'monitoring', actions: ['read'] },
  ],
};

// 권한 템플릿 인터페이스
export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 권한 변경 이력
export interface PermissionHistory {
  id: string;
  userId: string;
  changedBy: string;
  changedByName: string;
  previousRole?: UserRole;
  newRole?: UserRole;
  previousPermissions?: Permission[];
  newPermissions?: Permission[];
  timestamp: string;
  reason?: string;
}

// 라우트 권한 맵핑
export interface RoutePermission {
  path: string;
  resource: Resource;
  action: PermissionAction;
  allowedRoles?: UserRole[];
}

// 라우트별 필요 권한 정의
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard
  { path: '/dashboard', resource: 'dashboard', action: 'read' },

  // Monitoring
  { path: '/monitoring', resource: 'monitoring', action: 'read' },

  // Network
  { path: '/network', resource: 'network', action: 'read' },
  { path: '/network/devices', resource: 'network.devices', action: 'read' },
  { path: '/network/flows', resource: 'network.flows', action: 'read' },
  { path: '/network/ports', resource: 'network.ports', action: 'read' },
  { path: '/network/qos', resource: 'network.qos', action: 'read' },

  // Security
  { path: '/security', resource: 'security', action: 'read' },
  {
    path: '/security/users',
    resource: 'security.users',
    action: 'read',
    allowedRoles: ['super_admin', 'network_admin'],
  },
  {
    path: '/security/roles',
    resource: 'security.roles',
    action: 'read',
    allowedRoles: ['super_admin'],
  },
  { path: '/security/audit', resource: 'security.audit', action: 'read' },

  // Settings
  {
    path: '/settings',
    resource: 'settings',
    action: 'read',
    allowedRoles: ['super_admin', 'network_admin'],
  },
];

// 역할 표시 이름
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  network_admin: 'Network Admin',
  monitoring_user: 'Monitoring User',
  guest: 'Guest',
};

// 권한 액션 표시 이름
export const ACTION_DISPLAY_NAMES: Record<PermissionAction, string> = {
  read: '읽기',
  write: '쓰기',
  execute: '실행',
  delete: '삭제',
};