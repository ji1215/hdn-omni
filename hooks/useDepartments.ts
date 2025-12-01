'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '@/services/departments';
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DeleteDepartmentRequest,
  DepartmentOption,
} from '@/types/department';
import { User } from '@/types/user';
import { useState, useEffect } from 'react';

/**
 * 부서 목록 조회를 위한 커스텀 훅
 * 페이지네이션, 필터링, 검색 기능을 지원합니다.
 */
export function useDepartments(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    status?: string;
    parentId?: string | null;
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

  const queryKey = ['departments', page, pageSize, filters?.status, filters?.parentId, debouncedSearch];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // TODO: 실제 API 연동 시 주석 해제
      // const response = await departmentService.getDepartments({
      //   page,
      //   pageSize,
      //   status: filters?.status,
      //   parentId: filters?.parentId,
      //   search: debouncedSearch,
      // });
      // return response;

      // Mock 데이터
      const mockDepartments: Department[] = [
        {
          id: '1',
          name: '네트워크 운영팀',
          description: '네트워크 인프라 운영 및 관리를 담당하는 부서입니다.',
          parentId: null,
          parentName: undefined,
          status: 'active',
          memberCount: 3,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-11-20T14:30:00Z',
        },
        {
          id: '2',
          name: '네트워크 보안팀',
          description: '네트워크 보안 정책 수립 및 모니터링을 담당합니다.',
          parentId: null,
          parentName: undefined,
          status: 'active',
          memberCount: 2,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-19T16:45:00Z',
        },
        {
          id: '3',
          name: '모니터링팀',
          description: '시스템 및 네트워크 모니터링을 담당하는 부서입니다.',
          parentId: null,
          parentName: undefined,
          status: 'active',
          memberCount: 2,
          createdAt: '2024-02-01T11:00:00Z',
          updatedAt: '2024-11-18T13:20:00Z',
        },
        {
          id: '4',
          name: '외부협력사',
          description: '외부 협력업체 소속 인원을 관리하는 부서입니다.',
          parentId: null,
          parentName: undefined,
          status: 'active',
          memberCount: 1,
          createdAt: '2024-03-01T14:00:00Z',
          updatedAt: '2024-10-15T10:00:00Z',
        },
        {
          id: '5',
          name: '보안관제팀',
          description: '24시간 보안 관제 업무를 수행합니다.',
          parentId: '2',
          parentName: '네트워크 보안팀',
          status: 'active',
          memberCount: 2,
          createdAt: '2024-04-01T08:30:00Z',
          updatedAt: '2024-11-21T09:00:00Z',
        },
        {
          id: '6',
          name: '인프라운영팀',
          description: '서버 및 스토리지 인프라 운영을 담당합니다.',
          parentId: '1',
          parentName: '네트워크 운영팀',
          status: 'inactive',
          memberCount: 0,
          createdAt: '2024-05-15T10:00:00Z',
          updatedAt: '2024-11-01T14:00:00Z',
        },
      ];

      // 필터링 적용
      let filteredDepartments = [...mockDepartments];

      if (filters?.status) {
        filteredDepartments = filteredDepartments.filter((dept) => dept.status === filters.status);
      }

      if (filters?.parentId !== undefined) {
        if (filters.parentId === null || filters.parentId === '') {
          filteredDepartments = filteredDepartments.filter((dept) => dept.parentId === null);
        } else {
          filteredDepartments = filteredDepartments.filter((dept) => dept.parentId === filters.parentId);
        }
      }

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filteredDepartments = filteredDepartments.filter(
          (dept) =>
            dept.name.toLowerCase().includes(searchLower) ||
            dept.description.toLowerCase().includes(searchLower)
        );
      }

      // 페이지네이션
      const totalItems = filteredDepartments.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

      // API 응답 형식과 동일하게 반환
      return {
        data: paginatedDepartments,
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
 * 모든 부서 목록 조회 (드롭다운 옵션용)
 */
export function useDepartmentOptions() {
  return useQuery({
    queryKey: ['departments', 'options'],
    queryFn: async (): Promise<DepartmentOption[]> => {
      // TODO: 실제 API 연동 시 주석 해제
      // return await departmentService.getDepartmentOptions();

      // Mock 데이터
      return [
        { value: '1', label: '네트워크 운영팀' },
        { value: '2', label: '네트워크 보안팀' },
        { value: '3', label: '모니터링팀' },
        { value: '4', label: '외부협력사' },
        { value: '5', label: '보안관제팀' },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5분 캐싱
  });
}

/**
 * 부서 생성을 위한 뮤테이션 훅
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartmentRequest) => {
      // TODO: 실제 API 연동
      // return await departmentService.createDepartment(data);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, data: { ...data, id: Date.now().toString() } };
    },
    onSuccess: () => {
      // 부서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

/**
 * 부서 수정을 위한 뮤테이션 훅
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDepartmentRequest }) => {
      // TODO: 실제 API 연동
      // return await departmentService.updateDepartment(id, data);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, data: { id, ...data } };
    },
    onSuccess: () => {
      // 부서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

/**
 * 부서 삭제를 위한 뮤테이션 훅
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: DeleteDepartmentRequest) => {
      // TODO: 실제 API 연동
      // return await departmentService.deleteDepartment(id);

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      // 부서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

/**
 * 부서 이동(상위 부서 변경)을 위한 뮤테이션 훅
 */
export function useMoveDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newParentId }: { id: string; newParentId: string | null }) => {
      // TODO: 실제 API 연동
      // return await departmentService.updateDepartment(id, { parentId: newParentId });

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, data: { id, parentId: newParentId } };
    },
    onSuccess: () => {
      // 부서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

/**
 * 부서별 사용자 목록 조회 훅
 */
export function useDepartmentMembers(departmentName: string | null) {
  return useQuery({
    queryKey: ['department-members', departmentName],
    queryFn: async (): Promise<User[]> => {
      if (!departmentName) return [];

      // TODO: 실제 API 연동
      // return await userService.getUsersByDepartment(departmentName);

      // Mock 데이터 - 부서별 사용자
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

      return mockUsers.filter((user) => user.department === departmentName);
    },
    enabled: !!departmentName,
  });
}

/**
 * 사용자 부서 변경을 위한 뮤테이션 훅
 */
export function useChangeUserDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newDepartment,
    }: {
      userId: string;
      newDepartment: string;
    }) => {
      // TODO: 실제 API 연동
      // return await userService.updateUser(userId, { department: newDepartment });

      // Mock 구현
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, data: { userId, department: newDepartment } };
    },
    onSuccess: () => {
      // 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['department-members'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
