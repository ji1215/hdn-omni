'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/security/UsersTable';
import { DepartmentTree } from '@/components/security/DepartmentTree';
import { CreateUserModal } from '@/components/security/CreateUserModal';
import { EditUserModal } from '@/components/security/EditUserModal';
import { DeleteUserModal } from '@/components/security/DeleteUserModal';
import { CreateDepartmentModal } from '@/components/security/CreateDepartmentModal';
import { EditDepartmentModal } from '@/components/security/EditDepartmentModal';
import { DeleteDepartmentModal } from '@/components/security/DeleteDepartmentModal';
import { DepartmentMembersModal } from '@/components/security/DepartmentMembersModal';
import { AuditLogModal } from '@/components/security/AuditLogModal';
import { UserFilters } from '@/components/security/UserFilters';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  AuditLog,
} from '@/types/user';
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DeleteDepartmentRequest,
} from '@/types/department';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useMoveDepartment,
} from '@/hooks/useDepartments';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Users as UsersIcon, Building2, Loader2, Shield, UserX } from 'lucide-react';
import { Button, StatCard } from '@/components/common';
import { cn } from '@/lib/utils';

/**
 * 회원 관리 페이지
 * 사용자 관리와 부서 관리 기능을 통합한 페이지입니다.
 * 좌측에 부서 트리, 우측에 사용자 목록을 표시합니다.
 */
export default function MembersPage() {
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    role?: string;
    status?: string;
    department?: string;
  }>({});

  // 디바운싱된 검색어
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 전체 사용자 통계를 위한 데이터 조회 (필터 없음)
  const { data: totalUsersData } = useUsers(1, 1000, {}); // 통계용 전체 데이터

  // 사용자 데이터 조회 (필터 적용)
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useUsers(page, pageSize, {
    ...filters,
    search: debouncedSearch,
  });

  // 부서 데이터 조회
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    isError: departmentsError,
    refetch: refetchDepartments,
  } = useDepartments(1, 100, {});

  // 사용자 뮤테이션 훅
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // 부서 뮤테이션 훅
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  const moveDepartmentMutation = useMoveDepartment();

  // 모달 상태 - 사용자
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userForAuditLog, setUserForAuditLog] = useState<User | null>(null);

  // 모달 상태 - 부서
  const [isCreateDepartmentModalOpen, setIsCreateDepartmentModalOpen] = useState(false);
  const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState(false);
  const [isDeleteDepartmentModalOpen, setIsDeleteDepartmentModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [departmentToViewMembers, setDepartmentToViewMembers] = useState<Department | null>(null);

  // Mock 감사 로그 데이터
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      userId: '1',
      action: 'create',
      performedBy: 'admin',
      performedByName: '시스템 관리자',
      timestamp: '2024-01-15T09:00:00Z',
      details: '사용자 계정이 생성되었습니다.',
      ipAddress: '192.168.1.100',
    },
  ];

  // 사용자 생성 처리
  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateUserModalOpen(false);
      console.log('사용자 생성 완료:', data);
    } catch (error) {
      console.error('사용자 생성 실패:', error);
    }
  };

  // 사용자 수정 처리
  const handleUpdateUser = async (userId: string, data: UpdateUserRequest) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, data });
      setIsEditUserModalOpen(false);
      setUserToEdit(null);
      console.log('사용자 수정 완료:', userId, data);
    } catch (error) {
      console.error('사용자 수정 실패:', error);
    }
  };

  // 사용자 삭제 처리
  const handleDeleteUser = async (userId: string, data: DeleteUserRequest) => {
    try {
      await deleteUserMutation.mutateAsync({ id: userId, reason: data.reason });
      setIsDeleteUserModalOpen(false);
      setUserToDelete(null);
      console.log('사용자 삭제 완료:', userId);
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
    }
  };

  // 부서 생성 처리
  const handleCreateDepartment = async (data: CreateDepartmentRequest) => {
    try {
      await createDepartmentMutation.mutateAsync(data);
      setIsCreateDepartmentModalOpen(false);
      console.log('부서 생성 완료:', data);
    } catch (error) {
      console.error('부서 생성 실패:', error);
    }
  };

  // 부서 수정 처리
  const handleUpdateDepartment = async (departmentId: string, data: UpdateDepartmentRequest) => {
    try {
      await updateDepartmentMutation.mutateAsync({ id: departmentId, data });
      setIsEditDepartmentModalOpen(false);
      setDepartmentToEdit(null);
      console.log('부서 수정 완료:', departmentId, data);
    } catch (error) {
      console.error('부서 수정 실패:', error);
    }
  };

  // 부서 삭제 처리
  const handleDeleteDepartment = async (departmentId: string, data: DeleteDepartmentRequest) => {
    try {
      await deleteDepartmentMutation.mutateAsync({ id: departmentId, reason: data.reason });
      setIsDeleteDepartmentModalOpen(false);
      setDepartmentToDelete(null);
      console.log('부서 삭제 완료:', departmentId);
    } catch (error) {
      console.error('부서 삭제 실패:', error);
    }
  };

  // 부서 이동 처리
  const handleMoveDepartment = async (departmentId: string, newParentId: string | null) => {
    try {
      await moveDepartmentMutation.mutateAsync({ id: departmentId, newParentId });
      console.log('부서 이동 완료:', departmentId, '->', newParentId);
    } catch (error) {
      console.error('부서 이동 실패:', error);
    }
  };

  // 부서 트리에서 부서 클릭 시 사용자 필터링
  const handleDepartmentSelect = (department: Department) => {
    if (selectedDepartmentId === department.id) {
      // 같은 부서를 다시 클릭하면 필터 해제
      setSelectedDepartmentId(null);
      setFilters((prev) => {
        const { department: _, ...rest } = prev;
        return rest;
      });
    } else {
      // 새로운 부서 선택
      setSelectedDepartmentId(department.id);
      setFilters((prev) => ({ ...prev, department: department.name }));
    }
  };

  // 모달 열기 핸들러 - 사용자
  const openEditUserModal = (user: User) => {
    setUserToEdit(user);
    setIsEditUserModalOpen(true);
  };

  const openDeleteUserModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteUserModalOpen(true);
  };

  const openAuditLogModal = (user: User) => {
    setUserForAuditLog(user);
    setIsAuditLogModalOpen(true);
  };

  // 모달 열기 핸들러 - 부서
  const openEditDepartmentModal = (department: Department) => {
    setDepartmentToEdit(department);
    setIsEditDepartmentModalOpen(true);
  };

  const openDeleteDepartmentModal = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteDepartmentModalOpen(true);
  };

  const openMembersModal = (department: Department) => {
    setDepartmentToViewMembers(department);
    setIsMembersModalOpen(true);
  };

  // 통계 계산
  const allDepartments = departmentsData?.data || [];
  const allUsers = usersData?.data || [];
  const totalAllUsers = totalUsersData?.data || []; // 전체 사용자 데이터 (필터링 안됨)
  const stats = {
    totalUsers: totalUsersData?.total || 0, // 필터와 무관하게 항상 전체 사용자 수 표시
    activeUsers: totalAllUsers.filter((u) => u.status === 'active').length || 0, // 전체 사용자 중 활성 사용자
    totalDepartments: allDepartments.length,
    activeDepartments: allDepartments.filter((d) => d.status === 'active').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">회원 관리</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            조직의 부서 구조와 사용자를 통합 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            className="text-sm"
            onClick={() => {
              refetchUsers();
              refetchDepartments();
            }}
          >
            새로고침
          </Button>
          <Button
            onClick={() => setIsCreateDepartmentModalOpen(true)}
            variant="secondary"
            size="md"
            leftIcon={<Building2 className="w-4 h-4" />}
            className="text-sm"
          >
            부서 추가
          </Button>
          <Button
            onClick={() => setIsCreateUserModalOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-sm"
          >
            사용자 추가
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          subtitle="전체 사용자"
          value={stats.totalUsers.toString()}
          trend={{
            value: `${stats.totalUsers} users`,
            direction: 'neutral',
          }}
          icon={UsersIcon}
        />
        <StatCard
          title="Active Users"
          subtitle="활성 사용자"
          value={stats.activeUsers.toString()}
          trend={{
            value: `${((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(1)}%`,
            direction: 'up',
          }}
          icon={Shield}
        />
        <StatCard
          title="Total Departments"
          subtitle="전체 부서"
          value={stats.totalDepartments.toString()}
          trend={{
            value: `${stats.totalDepartments} depts`,
            direction: 'neutral',
          }}
          icon={Building2}
        />
        <StatCard
          title="Active Departments"
          subtitle="활성 부서"
          value={stats.activeDepartments.toString()}
          trend={{
            value: `${((stats.activeDepartments / stats.totalDepartments) * 100 || 0).toFixed(1)}%`,
            direction: 'up',
          }}
          icon={Building2}
        />
      </div>

      {/* 메인 콘텐츠: 좌우 분할 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 부서 트리 */}
        <div className="lg:col-span-4">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">조직 구조</h2>
              <Button
                onClick={() => setIsCreateDepartmentModalOpen(true)}
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                추가
              </Button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg">
              {departmentsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    부서 데이터를 불러오는 중...
                  </span>
                </div>
              ) : departmentsError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-red-600 dark:text-red-400 mb-2">
                    부서 데이터를 불러오는 중 오류가 발생했습니다.
                  </p>
                  <Button onClick={() => refetchDepartments()} variant="primary" size="sm">
                    다시 시도
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* 전체 사용자 옵션 */}
                  <div
                    onClick={() => {
                      setSelectedDepartmentId(null);
                      setFilters((prev) => {
                        const { department, ...rest } = prev;
                        return rest;
                      });
                    }}
                    className={cn(
                      'group relative rounded-lg border transition-all duration-200 cursor-pointer',
                      !selectedDepartmentId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className="flex items-center gap-2 p-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          전체 사용자
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          모든 부서의 사용자 표시
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <UsersIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {totalUsersData?.total || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 부서 트리 */}
                  <DepartmentTree
                    departments={allDepartments}
                    selectedDepartmentId={selectedDepartmentId}
                    onEditDepartment={openEditDepartmentModal}
                    onDeleteDepartment={openDeleteDepartmentModal}
                    onMoveDepartment={handleMoveDepartment}
                    onViewMembers={openMembersModal}
                    onSelectDepartment={handleDepartmentSelect}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 우측: 사용자 목록 */}
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {/* 필터 섹션 */}
            <UserFilters onSearchChange={setSearchQuery} onFiltersChange={setFilters} />

            {/* 선택된 부서 표시 및 전체 보기 버튼 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedDepartmentId ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {filters.department}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDepartmentId(null);
                        setFilters((prev) => {
                          const { department, ...rest } = prev;
                          return rest;
                        });
                      }}
                      className="ml-2 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                      title="필터 해제"
                    >
                      <UserX className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <UsersIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      전체 사용자
                    </span>
                  </div>
                )}
              </div>

              {selectedDepartmentId && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedDepartmentId(null);
                    setFilters((prev) => {
                      const { department, ...rest } = prev;
                      return rest;
                    });
                  }}
                  className="text-sm"
                >
                  전체 보기
                </Button>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">사용자 목록</h2>
                <Button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  추가
                </Button>
              </div>
              {/* 사용자 테이블 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg">
                {usersLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      사용자 데이터를 불러오는 중...
                    </span>
                  </div>
                ) : usersError ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-red-600 dark:text-red-400 mb-2">
                      사용자 데이터를 불러오는 중 오류가 발생했습니다.
                    </p>
                    <Button onClick={() => refetchUsers()} variant="primary" size="sm">
                      다시 시도
                    </Button>
                  </div>
                ) : (
                  <UsersTable
                    data={allUsers}
                    onEditUser={openEditUserModal}
                    onDeleteUser={openDeleteUserModal}
                    onViewAuditLog={openAuditLogModal}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 - 사용자 */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {userToEdit && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setUserToEdit(null);
          }}
          onSubmit={handleUpdateUser}
          user={userToEdit}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          isOpen={isDeleteUserModalOpen}
          onClose={() => {
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleDeleteUser}
          user={userToDelete}
        />
      )}

      {userForAuditLog && (
        <AuditLogModal
          isOpen={isAuditLogModalOpen}
          onClose={() => {
            setIsAuditLogModalOpen(false);
            setUserForAuditLog(null);
          }}
          user={userForAuditLog}
          logs={mockAuditLogs.filter((log) => log.userId === userForAuditLog.id)}
        />
      )}

      {/* 모달 - 부서 */}
      <CreateDepartmentModal
        isOpen={isCreateDepartmentModalOpen}
        onClose={() => setIsCreateDepartmentModalOpen(false)}
        onSubmit={handleCreateDepartment}
        departments={allDepartments}
      />

      {departmentToEdit && (
        <EditDepartmentModal
          isOpen={isEditDepartmentModalOpen}
          onClose={() => {
            setIsEditDepartmentModalOpen(false);
            setDepartmentToEdit(null);
          }}
          onSubmit={handleUpdateDepartment}
          department={departmentToEdit}
          departments={allDepartments}
        />
      )}

      {departmentToDelete && (
        <DeleteDepartmentModal
          isOpen={isDeleteDepartmentModalOpen}
          onClose={() => {
            setIsDeleteDepartmentModalOpen(false);
            setDepartmentToDelete(null);
          }}
          onConfirm={handleDeleteDepartment}
          department={departmentToDelete}
        />
      )}

      {departmentToViewMembers && (
        <DepartmentMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => {
            setIsMembersModalOpen(false);
            setDepartmentToViewMembers(null);
          }}
          department={departmentToViewMembers}
        />
      )}
    </div>
  );
}
