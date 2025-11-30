'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roles';
import { Role, CreateRoleRequest, UpdateRoleRequest, DeleteRoleRequest } from '@/types/role';
import { Permission } from '@/types/rbac';
import { useState, useEffect } from 'react';

/**
 * 역할 목록 조회를 위한 커스텀 훅
 * 페이지네이션, 필터링, 검색 기능을 지원합니다.
 */
export function useRoles(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    status?: string;
    search?: string;
    isSystem?: boolean;
  }
) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters?.search || '');

  // 검색어 디바운싱 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters?.search || '');
    }, 300);

    return () => clearTimeout(timer);
  }, [filters?.search]);

  const queryKey = ['roles', page, pageSize, filters?.status, filters?.isSystem, debouncedSearch];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // TODO: 실제 API 연동 시 주석 해제
      // const response = await roleService.getRoles({
      //   page,
      //   pageSize,
      //   status: filters?.status,
      //   search: debouncedSearch,
      //   isSystem: filters?.isSystem,
      // });
      // return response;

      // Mock 데이터
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Super Admin',
          description: '모든 시스템 권한을 가진 최고 관리자',
          permissions: [
            { resource: 'dashboard', actions: ['read', 'write', 'execute', 'delete'] },
            { resource: 'monitoring', actions: ['read', 'write', 'execute', 'delete'] },
            { resource: 'network', actions: ['read', 'write', 'execute', 'delete'] },
            { resource: 'security', actions: ['read', 'write', 'execute', 'delete'] },
          ],
          userCount: 2,
          status: 'active',
          isSystem: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Network Admin',
          description: '네트워크 설정 및 관리 권한',
          permissions: [
            { resource: 'dashboard', actions: ['read'] },
            { resource: 'monitoring', actions: ['read', 'write'] },
            { resource: 'network', actions: ['read', 'write', 'execute'] },
          ],
          userCount: 5,
          status: 'active',
          isSystem: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Monitoring User',
          description: '모니터링 및 조회 권한만 보유',
          permissions: [
            { resource: 'dashboard', actions: ['read'] },
            { resource: 'monitoring', actions: ['read'] },
            { resource: 'network', actions: ['read'] },
          ],
          userCount: 15,
          status: 'active',
          isSystem: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          name: 'Guest',
          description: '제한된 조회 권한',
          permissions: [
            { resource: 'dashboard', actions: ['read'] },
            { resource: 'monitoring', actions: ['read'] },
          ],
          userCount: 8,
          status: 'active',
          isSystem: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '5',
          name: 'Security Analyst',
          description: '보안 로그 및 감사 권한',
          permissions: [
            { resource: 'dashboard', actions: ['read'] },
            { resource: 'monitoring', actions: ['read'] },
            { resource: 'security.audit', actions: ['read', 'write'] },
          ],
          userCount: 3,
          status: 'inactive',
          isSystem: false,
          createdAt: '2024-03-15T00:00:00Z',
          updatedAt: '2024-06-20T00:00:00Z',
        },
      ];

      // 필터링 적용
      let filteredRoles = [...mockRoles];

      if (filters?.status) {
        filteredRoles = filteredRoles.filter((role) => role.status === filters.status);
      }

      if (filters?.isSystem !== undefined) {
        filteredRoles = filteredRoles.filter((role) => role.isSystem === filters.isSystem);
      }

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filteredRoles = filteredRoles.filter(
          (role) =>
            role.name.toLowerCase().includes(searchLower) ||
            role.description.toLowerCase().includes(searchLower)
        );
      }

      // 페이지네이션
      const totalItems = filteredRoles.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

      // API 응답 형식과 동일하게 반환
      return {
        roles: paginatedRoles,
        total: totalItems,
        page,
        pageSize,
        totalPages,
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * 역할 상세 조회를 위한 훅
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // return await roleService.getRole(id);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 500));
      return null;
    },
    enabled: !!id,
  });
}

/**
 * 역할 생성을 위한 뮤테이션 훅
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleRequest) => {
      // TODO: 실제 API 연동
      // return await roleService.createRole(data);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, data: { ...data, id: Date.now().toString() } };
    },
    onSuccess: () => {
      // 역할 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * 역할 수정을 위한 뮤테이션 훅
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleRequest }) => {
      // TODO: 실제 API 연동
      // return await roleService.updateRole(id, data);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, data: { id, ...data } };
    },
    onSuccess: () => {
      // 역할 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * 역할 삭제를 위한 뮤테이션 훅
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason, transferToRoleId }: DeleteRoleRequest) => {
      // TODO: 실제 API 연동
      // return await roleService.deleteRole(id, { reason, transferToRoleId });

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      // 역할 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * 역할 상태 토글을 위한 뮤테이션 훅
 */
export function useToggleRoleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: 실제 API 연동
      // return await roleService.toggleRoleStatus(id);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
