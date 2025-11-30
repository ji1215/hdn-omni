/**
 * 권한 기반 조건부 렌더링 가드 컴포넌트
 */

'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Resource, PermissionAction } from '@/types/rbac';

interface PermissionGuardProps {
  resource: Resource;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
  showDisabled?: boolean; // true일 경우 비활성화된 상태로 표시
}

/**
 * 권한이 있을 때만 children을 렌더링하는 가드 컴포넌트
 *
 * @example
 * <PermissionGuard resource="network" action="write">
 *   <Button>네트워크 설정 변경</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
  showDisabled = false,
}: PermissionGuardProps) {
  const hasPermission = usePermission(resource, action);

  if (!hasPermission) {
    if (showDisabled && typeof children === 'object' && children !== null) {
      // children이 React 엘리먼트인 경우 비활성화 상태로 클론
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