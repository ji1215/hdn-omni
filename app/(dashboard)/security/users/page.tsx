'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/security/UsersTable';
import { CreateUserModal } from '@/components/security/CreateUserModal';
import { EditUserModal } from '@/components/security/EditUserModal';
import { DeleteUserModal } from '@/components/security/DeleteUserModal';
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
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkUpdateRole,
  useBulkUpdateStatus,
  useBulkDeleteUsers,
} from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Users, Shield, UserX, Loader2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, StatCard } from '@/components/common';

/**
 * 사용자 관리 페이지
 * 사용자 목록 조회, 생성, 수정, 삭제 기능을 제공합니다.
 * React Query를 사용한 서버 상태 관리 및 실시간 필터링을 구현합니다.
 */
export default function UsersPage() {
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    role?: string;
    status?: string;
    department?: string;
  }>({});

  // 디바운싱된 검색어
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 사용자 데이터 조회
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers(page, pageSize, {
    ...filters,
    search: debouncedSearch,
  });

  // 뮤테이션 훅
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const bulkUpdateRoleMutation = useBulkUpdateRole();
  const bulkUpdateStatusMutation = useBulkUpdateStatus();
  const bulkDeleteUsersMutation = useBulkDeleteUsers();

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userForAuditLog, setUserForAuditLog] = useState<User | null>(null);

  // Mock 감사 로그 데이터 (TODO: API 연동)
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
    {
      id: '2',
      userId: '1',
      action: 'update',
      performedBy: 'admin',
      performedByName: '시스템 관리자',
      timestamp: '2024-02-20T14:30:00Z',
      details: '사용자 역할이 "Monitoring User"에서 "Network Admin"으로 변경되었습니다.',
      ipAddress: '192.168.1.100',
    },
  ];

  // 사용자 생성 처리
  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      // TODO: 성공 토스트 표시
      console.log('사용자 생성 완료:', data);
    } catch (error) {
      // TODO: 에러 토스트 표시
      console.error('사용자 생성 실패:', error);
    }
  };

  // 사용자 수정 처리
  const handleUpdateUser = async (userId: string, data: UpdateUserRequest) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, data });
      setIsEditModalOpen(false);
      setUserToEdit(null);
      // TODO: 성공 토스트 표시
      console.log('사용자 수정 완료:', userId, data);
    } catch (error) {
      // TODO: 에러 토스트 표시
      console.error('사용자 수정 실패:', error);
    }
  };

  // 사용자 삭제 처리
  const handleDeleteUser = async (userId: string, data: DeleteUserRequest) => {
    try {
      await deleteUserMutation.mutateAsync({ id: userId, reason: data.reason });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      // TODO: 성공 토스트 표시
      console.log('사용자 삭제 완료:', userId);
    } catch (error) {
      // TODO: 에러 토스트 표시
      console.error('사용자 삭제 실패:', error);
    }
  };

  // 모달 열기 핸들러
  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const openAuditLogModal = (user: User) => {
    setUserForAuditLog(user);
    setIsAuditLogModalOpen(true);
  };

  // 통계 계산
  const stats = {
    total: usersData?.total || 0,
    active: usersData?.data?.filter((u) => u.status === 'active').length || 0,
    admin:
      usersData?.data?.filter((u) => u.role === 'super_admin' || u.role === 'network_admin')
        .length || 0,
    inactive:
      usersData?.data?.filter((u) => u.status === 'inactive' || u.status === 'suspended').length ||
      0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">사용자 관리</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400"></p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" size="md" className="text-sm">
            December 2023
          </Button>
          <Button variant="secondary" size="md" className="text-sm">
            Filter
          </Button>
          <Button variant="secondary" size="md" className="text-sm">
            Sort
          </Button>
          <Button variant="secondary" size="md" className="text-sm">
            Refresh
          </Button>
          <Button variant="secondary" size="md" className="text-sm">
            View Setting
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-sm"
          >
            Add Table
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          subtitle="전체 사용자"
          value={stats.total.toString()}
          trend={{
            value: `${stats.total} users`,
            direction: 'neutral',
          }}
          icon={Users}
        />
        <StatCard
          title="Active Users"
          subtitle="활성 사용자"
          value={stats.active.toString()}
          trend={{
            value: `${((stats.active / stats.total) * 100 || 0).toFixed(1)}%`,
            direction: 'up',
          }}
          icon={Users}
        />
        <StatCard
          title="Admin Users"
          subtitle="관리자"
          value={stats.admin.toString()}
          trend={{
            value: `${((stats.admin / stats.total) * 100 || 0).toFixed(1)}%`,
            direction: 'neutral',
          }}
          icon={Shield}
        />
        <StatCard
          title="Inactive Users"
          subtitle="비활성 사용자"
          value={stats.inactive.toString()}
          trend={{
            value: `${((stats.inactive / stats.total) * 100 || 0).toFixed(1)}%`,
            direction: 'down',
          }}
          icon={UserX}
        />
      </div>

      {/* 필터 섹션 */}
      <UserFilters onSearchChange={setSearchQuery} onFiltersChange={setFilters} />

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">사용자 목록</h2>
        </div>
        {/* 사용자 테이블 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">
                데이터를 불러오는 중 오류가 발생했습니다.
              </p>
              <Button onClick={() => refetch()} variant="primary" size="sm">
                다시 시도
              </Button>
            </div>
          ) : (
            <>
              <UsersTable
                data={usersData?.data || []}
                onEditUser={openEditModal}
                onDeleteUser={openDeleteModal}
                onViewAuditLog={openAuditLogModal}
              />

              {/* 페이지네이션 정보 */}
              {/* {usersData && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    총 {usersData.total}개 중 {(page - 1) * pageSize + 1}-
                    {Math.min(page * pageSize, usersData.total)}개 표시
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      variant="secondary"
                      size="sm"
                    >
                      이전
                    </Button>
                    <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                      {page} / {usersData.totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(Math.min(usersData.totalPages, page + 1))}
                      disabled={page === usersData.totalPages}
                      variant="secondary"
                      size="sm"
                    >
                      다음
                    </Button>
                  </div>
                </div>
              </div>
            )} */}
            </>
          )}
        </div>
      </div>

      {/* 모달 */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {userToEdit && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setUserToEdit(null);
          }}
          onSubmit={handleUpdateUser}
          user={userToEdit}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
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
    </div>
  );
}
