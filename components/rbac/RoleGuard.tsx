/**
 * 역할 기반 조건부 렌더링 가드 컴포넌트
 */

'use client';

import { ReactNode } from 'react';
import { useHasAnyRole } from '@/hooks/usePermission';
import { UserRole } from '@/types/user';

interface RoleGuardProps {
  roles: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  showDisabled?: boolean;
}

/**
 * 특정 역할을 가진 사용자에게만 children을 렌더링하는 가드 컴포넌트
 *
 * @example
 * <RoleGuard roles={['super_admin', 'network_admin']}>
 *   <Button>관리자 설정</Button>
 * </RoleGuard>
 */
export function RoleGuard({
  roles,
  children,
  fallback = null,
  showDisabled = false,
}: RoleGuardProps) {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  const hasRole = useHasAnyRole(rolesArray);

  if (!hasRole) {
    if (showDisabled) {
      return (
        <div className="opacity-50 cursor-not-allowed pointer-events-none" title="권한이 없습니다">
          {children}
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}