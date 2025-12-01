'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/users';
import { User, CreateUserRequest, UpdateUserRequest, DeleteUserRequest } from '@/types/user';
import { useState, useEffect } from 'react';

/**
 * 사용자 목록 조회를 위한 커스텀 훅
 * 페이지네이션, 필터링, 검색 기능을 지원합니다.
 */
export function useUsers(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    role?: string;
    status?: string;
    department?: string;
    search?: string;
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

  const queryKey = ['users', page, pageSize, filters?.role, filters?.status, filters?.department, debouncedSearch];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // TODO: 실제 API 연동 시 주석 해제
      // const response = await userService.getUsers({
      //   page,
      //   limit: pageSize,
      //   role: filters?.role,
      //   status: filters?.status,
      //   department: filters?.department,
      //   search: debouncedSearch,
      // });
      // return response;

      // Mock 데이터 필터링 및 페이지네이션
      const mockUsers: User[] = [
        {
          id: '1',
          name: '김철수',
          email: 'chulsoo.kim@example.com',
          department: '네트워크 운영팀',
          contact: '010-1234-5678',
          role: 'super_admin',
          status: 'active',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-11-20T14:30:00Z',
          lastLogin: '2024-11-21T08:00:00Z',
        },
        {
          id: '2',
          name: '이영희',
          email: 'younghee.lee@example.com',
          department: '네트워크 보안팀',
          contact: '010-2345-6789',
          role: 'network_admin',
          status: 'active',
          createdAt: '2024-02-20T10:00:00Z',
          updatedAt: '2024-11-19T16:45:00Z',
          lastLogin: '2024-11-21T07:30:00Z',
        },
        {
          id: '3',
          name: '박민수',
          email: 'minsu.park@example.com',
          department: '모니터링팀',
          contact: '010-3456-7890',
          role: 'monitoring_user',
          status: 'active',
          createdAt: '2024-03-10T11:00:00Z',
          updatedAt: '2024-11-18T13:20:00Z',
          lastLogin: '2024-11-20T18:00:00Z',
        },
        {
          id: '4',
          name: '최지은',
          email: 'jieun.choi@example.com',
          department: '외부협력사',
          contact: '010-4567-8901',
          role: 'guest',
          status: 'inactive',
          createdAt: '2024-04-05T14:00:00Z',
          updatedAt: '2024-10-15T10:00:00Z',
          lastLogin: '2024-10-10T15:00:00Z',
        },
        {
          id: '5',
          name: '정대만',
          email: 'daeman.jung@example.com',
          department: '네트워크 운영팀',
          contact: '010-5678-9012',
          role: 'network_admin',
          status: 'active',
          createdAt: '2024-05-01T08:30:00Z',
          updatedAt: '2024-11-21T09:00:00Z',
          lastLogin: '2024-11-21T09:00:00Z',
        },
        {
          id: '6',
          name: '홍길동',
          email: 'gildong.hong@example.com',
          department: '모니터링팀',
          contact: '010-6789-0123',
          role: 'monitoring_user',
          status: 'suspended',
          createdAt: '2024-06-15T10:00:00Z',
          updatedAt: '2024-11-01T14:00:00Z',
          lastLogin: '2024-10-31T18:00:00Z',
        },
        {
          id: '7',
          name: '강민호',
          email: 'minho.kang@example.com',
          department: '네트워크 보안팀',
          contact: '010-7890-1234',
          role: 'network_admin',
          status: 'active',
          createdAt: '2024-07-01T09:00:00Z',
          updatedAt: '2024-11-20T10:00:00Z',
          lastLogin: '2024-11-21T08:30:00Z',
        },
        {
          id: '8',
          name: '윤서연',
          email: 'seoyeon.yoon@example.com',
          department: '보안관제팀',
          contact: '010-8901-2345',
          role: 'monitoring_user',
          status: 'active',
          createdAt: '2024-08-15T10:00:00Z',
          updatedAt: '2024-11-19T14:00:00Z',
          lastLogin: '2024-11-21T07:00:00Z',
        },
        {
          id: '9',
          name: '임재현',
          email: 'jaehyun.lim@example.com',
          department: '보안관제팀',
          contact: '010-9012-3456',
          role: 'monitoring_user',
          status: 'active',
          createdAt: '2024-09-01T11:00:00Z',
          updatedAt: '2024-11-18T16:00:00Z',
          lastLogin: '2024-11-20T22:00:00Z',
        },
        {
          id: '10',
          name: '김지훈',
          email: 'jihoon.kim@example.com',
          department: '네트워크 운영팀',
          contact: '010-0123-4567',
          role: 'network_admin',
          status: 'active',
          createdAt: '2024-10-01T09:00:00Z',
          updatedAt: '2024-11-21T08:00:00Z',
          lastLogin: '2024-11-21T09:30:00Z',
        },
      ];

      // 필터링 적용
      let filteredUsers = [...mockUsers];

      if (filters?.role) {
        filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
      }

      if (filters?.status) {
        filteredUsers = filteredUsers.filter((user) => user.status === filters.status);
      }

      if (filters?.department) {
        filteredUsers = filteredUsers.filter((user) => user.department === filters.department);
      }

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.department.toLowerCase().includes(searchLower)
        );
      }

      // 페이지네이션
      const totalItems = filteredUsers.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      // API 응답 형식과 동일하게 반환
      return {
        data: paginatedUsers,
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
 * 사용자 생성을 위한 뮤테이션 훅
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      // TODO: 실제 API 연동
      // return await userService.createUser(data);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, data: { ...data, id: Date.now().toString() } };
    },
    onSuccess: () => {
      // 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * 사용자 수정을 위한 뮤테이션 훅
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      // TODO: 실제 API 연동
      // return await userService.updateUser(id, data);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, data: { id, ...data } };
    },
    onSuccess: () => {
      // 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * 사용자 삭제를 위한 뮤테이션 훅
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: DeleteUserRequest) => {
      // TODO: 실제 API 연동
      // return await userService.deleteUser(id, { reason });

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      // 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * 일괄 작업을 위한 뮤테이션 훅들
 */
export function useBulkUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds, role }: { userIds: string[]; role: string }) => {
      // TODO: 실제 API 연동
      // return await userService.bulkUpdateRole(userIds, role);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true, updatedCount: userIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds, status }: { userIds: string[]; status: string }) => {
      // TODO: 실제 API 연동
      // return await userService.bulkUpdateStatus(userIds, status);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true, updatedCount: userIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds, reason }: { userIds: string[]; reason: string }) => {
      // TODO: 실제 API 연동
      // return await userService.bulkDelete(userIds, reason);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true, deletedCount: userIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}