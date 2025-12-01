'use client';

import { useState } from 'react';
import { DepartmentTree } from '@/components/security/DepartmentTree';
import { CreateDepartmentModal } from '@/components/security/CreateDepartmentModal';
import { EditDepartmentModal } from '@/components/security/EditDepartmentModal';
import { DeleteDepartmentModal } from '@/components/security/DeleteDepartmentModal';
import { DepartmentMembersModal } from '@/components/security/DepartmentMembersModal';
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DeleteDepartmentRequest,
} from '@/types/department';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useMoveDepartment,
} from '@/hooks/useDepartments';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Plus,
  Building2,
  Users,
  FolderTree,
  Loader2,
  MoreVertical,
  Search,
  GripVertical,
} from 'lucide-react';
import { Button, StatCard } from '@/components/common';

/**
 * 부서 관리 페이지
 * 트리 형태로 부서 구조를 표시하고, 드래그 앤 드롭으로 부서 이동이 가능합니다.
 * 사용자 관리 페이지의 부서 항목과 연동됩니다.
 */
export default function DepartmentsPage() {
  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');

  // 디바운싱된 검색어
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 부서 데이터 조회 (트리 표시를 위해 모든 부서 로드)
  const {
    data: departmentsData,
    isLoading,
    isError,
    refetch,
  } = useDepartments(1, 100, {
    search: debouncedSearch,
  });

  // 뮤테이션 훅
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  const moveDepartmentMutation = useMoveDepartment();

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [departmentToViewMembers, setDepartmentToViewMembers] = useState<Department | null>(null);

  // 부서 생성 처리
  const handleCreateDepartment = async (data: CreateDepartmentRequest) => {
    try {
      await createDepartmentMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      console.log('부서 생성 완료:', data);
    } catch (error) {
      console.error('부서 생성 실패:', error);
    }
  };

  // 부서 수정 처리
  const handleUpdateDepartment = async (departmentId: string, data: UpdateDepartmentRequest) => {
    try {
      await updateDepartmentMutation.mutateAsync({ id: departmentId, data });
      setIsEditModalOpen(false);
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
      setIsDeleteModalOpen(false);
      setDepartmentToDelete(null);
      console.log('부서 삭제 완료:', departmentId);
    } catch (error) {
      console.error('부서 삭제 실패:', error);
    }
  };

  // 부서 이동 처리 (드래그 앤 드롭)
  const handleMoveDepartment = async (departmentId: string, newParentId: string | null) => {
    try {
      await moveDepartmentMutation.mutateAsync({ id: departmentId, newParentId });
      console.log('부서 이동 완료:', departmentId, '->', newParentId);
    } catch (error) {
      console.error('부서 이동 실패:', error);
    }
  };

  // 모달 열기 핸들러
  const openEditModal = (department: Department) => {
    setDepartmentToEdit(department);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const openMembersModal = (department: Department) => {
    setDepartmentToViewMembers(department);
    setIsMembersModalOpen(true);
  };

  // 통계 계산
  const allDepartments = departmentsData?.data || [];
  const stats = {
    total: allDepartments.length,
    active: allDepartments.filter((d) => d.status === 'active').length,
    totalMembers: allDepartments.reduce((sum, d) => sum + d.memberCount, 0),
    topLevel: allDepartments.filter((d) => d.parentId === null).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">부서 관리</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            조직의 부서 구조를 트리 형태로 관리합니다. 드래그 앤 드롭으로 부서 위치를 변경할 수
            있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" size="md" className="text-sm" onClick={() => refetch()}>
            새로고침
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-sm"
          >
            부서 추가
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="전체 부서"
          subtitle="Total Departments"
          value={stats.total.toString()}
          trend={{
            value: '0',
            direction: 'neutral',
          }}
          icon={Building2}
        />
        <StatCard
          title="활성 부서"
          subtitle="Active Departments"
          value={stats.active.toString()}
          trend={{
            value: `${((stats.active / stats.total) * 100 || 0).toFixed(0)}%`,
            direction: 'up',
          }}
          icon={MoreVertical}
        />
        <StatCard
          title="총 인원"
          subtitle="Total Members"
          value={stats.totalMembers.toString()}
          trend={{
            value: '0',
            direction: 'neutral',
          }}
          icon={Users}
        />
        <StatCard
          title="최상위 부서"
          subtitle="Top-level Departments"
          value={stats.topLevel.toString()}
          trend={{
            value: '0',
            direction: 'neutral',
          }}
          icon={FolderTree}
        />
      </div>

      {/* 검색 및 안내 */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="부서명, 설명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <GripVertical className="w-4 h-4" />
          <span>드래그하여 부서 위치를 변경할 수 있습니다</span>
        </div>
      </div>

      {/* 부서 트리 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">조직 구조</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
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
            <DepartmentTree
              departments={allDepartments}
              onEditDepartment={openEditModal}
              onDeleteDepartment={openDeleteModal}
              onMoveDepartment={handleMoveDepartment}
              onViewMembers={openMembersModal}
            />
          )}
        </div>
      </div>

      {/* 모달 */}
      <CreateDepartmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDepartment}
        departments={allDepartments}
      />

      {departmentToEdit && (
        <EditDepartmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setDepartmentToEdit(null);
          }}
          onSubmit={handleUpdateDepartment}
          department={departmentToEdit}
          departments={allDepartments}
        />
      )}

      {departmentToDelete && (
        <DeleteDepartmentModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
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
