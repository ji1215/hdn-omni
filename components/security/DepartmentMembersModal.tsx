'use client';

import { useState } from 'react';
import { X, User as UserIcon, Mail, Phone, Loader2, ArrowRight, Building2 } from 'lucide-react';
import { Department } from '@/types/department';
import { User, UserRoleLabels, UserRoleColors, UserStatusLabels, UserStatusColors } from '@/types/user';
import { useDepartmentMembers, useDepartmentOptions, useChangeUserDepartment } from '@/hooks/useDepartments';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';

interface DepartmentMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
}

/**
 * 부서 멤버 목록 모달
 * 부서에 속한 사용자를 확인하고 다른 부서로 이동할 수 있습니다.
 */
export function DepartmentMembersModal({
  isOpen,
  onClose,
  department,
}: DepartmentMembersModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [targetDepartment, setTargetDepartment] = useState<string>('');
  const [isChangingDepartment, setIsChangingDepartment] = useState(false);

  // 부서 멤버 조회
  const { data: members, isLoading } = useDepartmentMembers(department.name);

  // 부서 옵션 조회
  const { data: departmentOptions } = useDepartmentOptions();

  // 부서 변경 뮤테이션
  const changeUserDepartmentMutation = useChangeUserDepartment();

  // 부서 변경 처리
  const handleChangeDepartment = async () => {
    if (!selectedUserId || !targetDepartment) return;

    const targetDeptOption = departmentOptions?.find((d) => d.value === targetDepartment);
    if (!targetDeptOption) return;

    try {
      await changeUserDepartmentMutation.mutateAsync({
        userId: selectedUserId,
        newDepartment: targetDeptOption.label,
      });
      setSelectedUserId(null);
      setTargetDepartment('');
      setIsChangingDepartment(false);
    } catch (error) {
      console.error('부서 변경 실패:', error);
    }
  };

  // 부서 변경 취소
  const handleCancelChange = () => {
    setSelectedUserId(null);
    setTargetDepartment('');
    setIsChangingDepartment(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center md:p-4">
        <div className="relative bg-white dark:bg-gray-800 shadow-xl w-full h-full md:h-auto md:max-w-2xl md:rounded-lg flex flex-col md:block animate-slide-up md:animate-none">
          {/* 모달 헤더 */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {department.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  소속 멤버 {members?.length || 0}명
                </p>
              </div>
            </div>
            <Button onClick={onClose} variant="icon" aria-label="닫기">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 모달 본문 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">멤버를 불러오는 중...</span>
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-3">
                {members.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      selectedUserId === user.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* 사용자 정보 */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                UserRoleColors[user.role]
                              )}
                            >
                              {UserRoleLabels[user.role]}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                UserStatusColors[user.status]
                              )}
                            >
                              {UserStatusLabels[user.status]}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.contact}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex-shrink-0">
                        {selectedUserId === user.id && isChangingDepartment ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={targetDepartment}
                              onChange={(e) => setTargetDepartment(e.target.value)}
                              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">부서 선택</option>
                              {departmentOptions
                                ?.filter((d) => d.label !== department.name)
                                .map((dept) => (
                                  <option key={dept.value} value={dept.value}>
                                    {dept.label}
                                  </option>
                                ))}
                            </select>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleChangeDepartment}
                              disabled={!targetDepartment || changeUserDepartmentMutation.isPending}
                              loading={changeUserDepartmentMutation.isPending}
                            >
                              이동
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancelChange}>
                              취소
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setIsChangingDepartment(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            부서 이동
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  소속 멤버가 없습니다
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  이 부서에는 아직 소속된 멤버가 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* 모달 푸터 */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
