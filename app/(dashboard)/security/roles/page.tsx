'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Shield, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useRoles';
import { useDebounce } from '@/hooks/useDebounce';
import { CreateRoleModal } from '@/components/security/CreateRoleModal';
import { EditRoleModal } from '@/components/security/EditRoleModal';
import { DeleteRoleModal } from '@/components/security/DeleteRoleModal';
import { RoleDetailModal } from '@/components/security/RoleDetailModal';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/role';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

export default function RolesPage() {
  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status?: string;
    isSystem?: boolean;
  }>({});

  // 디바운싱된 검색어
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 역할 데이터 조회
  const {
    data: rolesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useRoles(page, pageSize, {
    ...filters,
    search: debouncedSearch,
  });

  // 뮤테이션 훅
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleToView, setRoleToView] = useState<Role | null>(null);

  // 역할 생성 처리
  const handleCreateRole = async (data: CreateRoleRequest) => {
    try {
      await createRoleMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      console.log('역할 생성 완료:', data);
    } catch (error) {
      console.error('역할 생성 실패:', error);
    }
  };

  // 역할 수정 처리
  const handleUpdateRole = async (roleId: string, data: UpdateRoleRequest) => {
    try {
      await updateRoleMutation.mutateAsync({ id: roleId, data });
      setIsEditModalOpen(false);
      setRoleToEdit(null);
      console.log('역할 수정 완료:', roleId, data);
    } catch (error) {
      console.error('역할 수정 실패:', error);
    }
  };

  // 역할 삭제 처리
  const handleDeleteRole = async (
    roleId: string,
    data: { reason: string; transferToRoleId?: string }
  ) => {
    try {
      await deleteRoleMutation.mutateAsync({
        id: roleId,
        ...data,
      });
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      console.log('역할 삭제 완료:', roleId);
    } catch (error) {
      console.error('역할 삭제 실패:', error);
    }
  };

  // 모달 열기 핸들러
  const openEditModal = (role: Role) => {
    setRoleToEdit(role);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (role: Role) => {
    setRoleToView(role);
    setIsDetailModalOpen(true);
  };

  // 통계 계산
  const stats = {
    total: rolesData?.total || 0,
    active: rolesData?.roles?.filter((r) => r.status === 'active').length || 0,
    inactive: rolesData?.roles?.filter((r) => r.status === 'inactive').length || 0,
    totalUsers:
      rolesData?.roles?.reduce((sum, role) => sum + role.userCount, 0) || 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">역할 관리</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            사용자 역할 및 권한을 관리합니다
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          역할 추가
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">전체 역할</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">활성 역할</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">전체 사용자</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">비활성 역할</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="역할 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200 transition-colors"
            />
          </div>
          <select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value || undefined })
            }
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>

      {/* Roles Grid */}
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
          <Button
            onClick={() => refetch()}
            variant="primary"
            size="sm"
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesData?.roles?.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {role.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            role.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          )}
                        >
                          {role.status === 'active' ? '활성' : '비활성'}
                        </span>
                        {role.isSystem && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            시스템
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(role)}
                      disabled={role.isSystem}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-error dark:hover:text-error rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {role.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">사용자 수</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {role.userCount}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                      권한 ({role.permissions.length}개)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded"
                        >
                          {permission.resource}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400 text-xs rounded">
                          +{role.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => openDetailModal(role)}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye className="w-4 h-4" />}
                  fullWidth
                  className="mt-4"
                >
                  상세 보기
                </Button>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {rolesData && rolesData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                이전
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                {page} / {rolesData.totalPages}
              </span>
              <Button
                onClick={() => setPage(Math.min(rolesData.totalPages, page + 1))}
                disabled={page === rolesData.totalPages}
                variant="secondary"
                size="sm"
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      {/* 모달 */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRole}
      />

      {roleToEdit && (
        <EditRoleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setRoleToEdit(null);
          }}
          onSubmit={handleUpdateRole}
          role={roleToEdit}
        />
      )}

      {roleToDelete && (
        <DeleteRoleModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
          }}
          onConfirm={handleDeleteRole}
          role={roleToDelete}
          availableRoles={rolesData?.roles?.filter((r) => r.id !== roleToDelete.id) || []}
        />
      )}

      {roleToView && (
        <RoleDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setRoleToView(null);
          }}
          role={roleToView}
        />
      )}
    </div>
  );
}
