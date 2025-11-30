/**
 * RBAC (Role-Based Access Control) Zustand 스토어
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types/user';
import {
  Permission,
  PermissionAction,
  Resource,
  DEFAULT_ROLE_PERMISSIONS,
  PermissionTemplate,
  PermissionHistory,
} from '@/types/rbac';

interface RBACState {
  // 현재 사용자 정보
  currentUser: User | null;
  customPermissions: Permission[]; // 역할 외 추가 권한

  // 권한 템플릿
  permissionTemplates: PermissionTemplate[];

  // 권한 변경 이력
  permissionHistory: PermissionHistory[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  setCustomPermissions: (permissions: Permission[]) => void;
  addCustomPermission: (permission: Permission) => void;
  removeCustomPermission: (resource: Resource) => void;

  // 권한 검사
  hasPermission: (resource: Resource, action: PermissionAction) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;

  // 권한 템플릿 관리
  loadPermissionTemplates: (templates: PermissionTemplate[]) => void;
  addPermissionTemplate: (template: PermissionTemplate) => void;
  updatePermissionTemplate: (id: string, template: Partial<PermissionTemplate>) => void;
  deletePermissionTemplate: (id: string) => void;

  // 권한 이력 관리
  addPermissionHistory: (history: PermissionHistory) => void;
  clearPermissionHistory: () => void;

  // 초기화
  reset: () => void;
}

const initialState = {
  currentUser: null,
  customPermissions: [],
  permissionTemplates: [],
  permissionHistory: [],
};

export const useRBACStore = create<RBACState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 현재 사용자 설정
      setCurrentUser: (user) => {
        const previousUser = get().currentUser;
        set({ currentUser: user });

        // 사용자 변경 시 이력 추가 (실제 환경에서는 서버 API 호출)
        if (user && previousUser && user.id !== previousUser.id) {
          get().addPermissionHistory({
            id: Date.now().toString(),
            userId: user.id,
            changedBy: 'system',
            changedByName: 'System',
            previousRole: previousUser.role,
            newRole: user.role,
            timestamp: new Date().toISOString(),
            reason: 'User login',
          });
        }
      },

      // 커스텀 권한 설정
      setCustomPermissions: (permissions) => {
        set({ customPermissions: permissions });
      },

      addCustomPermission: (permission) => {
        const { customPermissions } = get();
        const existing = customPermissions.find((p) => p.resource === permission.resource);

        if (existing) {
          // 기존 권한 업데이트
          set({
            customPermissions: customPermissions.map((p) =>
              p.resource === permission.resource
                ? { ...p, actions: Array.from(new Set([...p.actions, ...permission.actions])) }
                : p
            ),
          });
        } else {
          // 새 권한 추가
          set({ customPermissions: [...customPermissions, permission] });
        }
      },

      removeCustomPermission: (resource) => {
        set({
          customPermissions: get().customPermissions.filter((p) => p.resource !== resource),
        });
      },

      // 권한 검사
      hasPermission: (resource, action) => {
        const { currentUser, customPermissions } = get();
        if (!currentUser) return false;

        // Super Admin은 모든 권한 보유
        if (currentUser.role === 'super_admin') return true;

        // 역할 기본 권한 확인
        const rolePermissions = DEFAULT_ROLE_PERMISSIONS[currentUser.role] || [];
        const rolePermission = rolePermissions.find((p) => p.resource === resource);
        const hasRolePermission = rolePermission?.actions.includes(action);

        // 커스텀 권한 확인
        const customPermission = customPermissions.find((p) => p.resource === resource);
        const hasCustomPermission = customPermission?.actions.includes(action);

        return hasRolePermission || hasCustomPermission || false;
      },

      hasRole: (role) => {
        const { currentUser } = get();
        return currentUser?.role === role;
      },

      hasAnyRole: (roles) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return roles.includes(currentUser.role);
      },

      // 권한 템플릿 관리
      loadPermissionTemplates: (templates) => {
        set({ permissionTemplates: templates });
      },

      addPermissionTemplate: (template) => {
        set({ permissionTemplates: [...get().permissionTemplates, template] });
      },

      updatePermissionTemplate: (id, updatedTemplate) => {
        set({
          permissionTemplates: get().permissionTemplates.map((t) =>
            t.id === id ? { ...t, ...updatedTemplate, updatedAt: new Date().toISOString() } : t
          ),
        });
      },

      deletePermissionTemplate: (id) => {
        set({
          permissionTemplates: get().permissionTemplates.filter((t) => t.id !== id),
        });
      },

      // 권한 이력 관리
      addPermissionHistory: (history) => {
        set({ permissionHistory: [history, ...get().permissionHistory].slice(0, 100) }); // 최근 100개만 유지
      },

      clearPermissionHistory: () => {
        set({ permissionHistory: [] });
      },

      // 초기화
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'rbac-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        customPermissions: state.customPermissions,
      }),
    }
  )
);