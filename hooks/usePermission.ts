/**
 * 권한 검사 관련 커스텀 훅
 */

import { useRBACStore } from '@/store/rbacStore';
import { UserRole } from '@/types/user';
import { Resource, PermissionAction, ROUTE_PERMISSIONS } from '@/types/rbac';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * 특정 리소스에 대한 액션 권한 확인 훅
 * @param resource 리소스 식별자
 * @param action 권한 액션
 * @returns 권한 보유 여부
 */
export function usePermission(resource: Resource, action: PermissionAction): boolean {
  const hasPermission = useRBACStore((state) => state.hasPermission);
  return hasPermission(resource, action);
}

/**
 * 특정 역할 보유 여부 확인 훅
 * @param role 역할
 * @returns 역할 보유 여부
 */
export function useHasRole(role: UserRole): boolean {
  const hasRole = useRBACStore((state) => state.hasRole);
  return hasRole(role);
}

/**
 * 여러 역할 중 하나라도 보유하는지 확인 훅
 * @param roles 역할 배열
 * @returns 역할 보유 여부
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const hasAnyRole = useRBACStore((state) => state.hasAnyRole);
  return hasAnyRole(roles);
}

/**
 * 현재 라우트 접근 권한 확인 훅
 * @param route 라우트 경로
 * @returns 접근 권한 여부
 */
export function useCanAccessRoute(route: string): boolean {
  const hasPermission = useRBACStore((state) => state.hasPermission);
  const hasAnyRole = useRBACStore((state) => state.hasAnyRole);
  const currentUser = useRBACStore((state) => state.currentUser);

  // 라우트 권한 찾기
  const routePermission = ROUTE_PERMISSIONS.find((rp) => rp.path === route);

  if (!routePermission) {
    // 권한 설정이 없는 라우트는 접근 가능
    return true;
  }

  // 특정 역할만 허용하는 경우
  if (routePermission.allowedRoles && currentUser) {
    return routePermission.allowedRoles.includes(currentUser.role);
  }

  // 권한 기반 검사
  return hasPermission(routePermission.resource, routePermission.action);
}

/**
 * 권한 없는 경우 리다이렉트하는 훅
 * @param resource 리소스
 * @param action 액션
 * @param redirectTo 리다이렉트 경로 (기본: /unauthorized)
 */
export function useRequirePermission(
  resource: Resource,
  action: PermissionAction,
  redirectTo: string = '/unauthorized'
): boolean {
  const router = useRouter();
  const hasPermission = usePermission(resource, action);
  const currentUser = useRBACStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser && !hasPermission) {
      router.push(redirectTo);
    }
  }, [hasPermission, currentUser, router, redirectTo]);

  return hasPermission;
}

/**
 * 특정 역할 필수 훅 (없으면 리다이렉트)
 * @param roles 필요한 역할들
 * @param redirectTo 리다이렉트 경로
 */
export function useRequireRole(
  roles: UserRole[],
  redirectTo: string = '/unauthorized'
): boolean {
  const router = useRouter();
  const hasAnyRole = useHasAnyRole(roles);
  const currentUser = useRBACStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser && !hasAnyRole) {
      router.push(redirectTo);
    }
  }, [hasAnyRole, currentUser, router, redirectTo]);

  return hasAnyRole;
}

/**
 * 현재 사용자 정보 훅
 */
export function useCurrentUser() {
  return useRBACStore((state) => state.currentUser);
}

/**
 * RBAC 스토어 전체 훅 (고급 사용)
 */
export function useRBAC() {
  return useRBACStore();
}