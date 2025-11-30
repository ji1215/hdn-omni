'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Role, UpdateRoleRequest } from '@/types/role';
import { Permission, Resource, PermissionAction } from '@/types/rbac';
import { X } from 'lucide-react';
import { Button } from '@/components/common';

// 리소스 목록
const RESOURCES: Resource[] = [
  'dashboard',
  'monitoring',
  'network',
  'network.devices',
  'network.flows',
  'network.ports',
  'network.qos',
  'security',
  'security.users',
  'security.roles',
  'security.audit',
  'settings',
];

// 리소스 표시 이름
const RESOURCE_LABELS: Record<Resource, string> = {
  dashboard: '대시보드',
  monitoring: '모니터링',
  network: '네트워크',
  'network.devices': '네트워크 > 디바이스',
  'network.flows': '네트워크 > 플로우',
  'network.ports': '네트워크 > 포트',
  'network.qos': '네트워크 > QoS',
  security: '보안',
  'security.users': '보안 > 사용자',
  'security.roles': '보안 > 역할',
  'security.audit': '보안 > 감사',
  settings: '설정',
};

// 액션 표시 이름
const ACTION_LABELS: Record<PermissionAction, string> = {
  read: '읽기',
  write: '쓰기',
  execute: '실행',
  delete: '삭제',
};

// Zod 스키마 정의
const editRoleSchema = z.object({
  name: z.string().min(2, '역할 이름은 최소 2자 이상이어야 합니다.'),
  description: z.string().min(5, '설명은 최소 5자 이상이어야 합니다.'),
});

type EditRoleFormData = z.infer<typeof editRoleSchema>;

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleId: string, data: UpdateRoleRequest) => Promise<void>;
  role: Role;
}

/**
 * 역할 수정 모달
 */
export function EditRoleModal({ isOpen, onClose, onSubmit, role }: EditRoleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(role.permissions);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: role.name,
      description: role.description,
    },
  });

  // role이 변경될 때마다 폼 값 업데이트
  useEffect(() => {
    setValue('name', role.name);
    setValue('description', role.description);
    setPermissions(role.permissions);
  }, [role, setValue]);

  // 모달 닫기 핸들러
  const handleClose = () => {
    reset();
    setPermissions(role.permissions);
    onClose();
  };

  // 권한 토글 핸들러
  const togglePermission = (resource: Resource, action: PermissionAction) => {
    setPermissions((prev) => {
      const existingPermission = prev.find((p) => p.resource === resource);

      if (existingPermission) {
        const hasAction = existingPermission.actions.includes(action);

        if (hasAction) {
          // 액션 제거
          const updatedActions = existingPermission.actions.filter((a) => a !== action);
          if (updatedActions.length === 0) {
            // 모든 액션이 제거되면 권한 자체를 제거
            return prev.filter((p) => p.resource !== resource);
          }
          return prev.map((p) =>
            p.resource === resource ? { ...p, actions: updatedActions } : p
          );
        } else {
          // 액션 추가
          return prev.map((p) =>
            p.resource === resource ? { ...p, actions: [...p.actions, action] } : p
          );
        }
      } else {
        // 새 권한 추가
        return [...prev, { resource, actions: [action] }];
      }
    });
  };

  // 리소스의 특정 액션이 선택되었는지 확인
  const hasPermission = (resource: Resource, action: PermissionAction): boolean => {
    const permission = permissions.find((p) => p.resource === resource);
    return permission?.actions.includes(action) || false;
  };

  // 폼 제출 핸들러
  const onSubmitForm = async (data: EditRoleFormData) => {
    try {
      setIsSubmitting(true);

      if (permissions.length === 0) {
        alert('최소 하나 이상의 권한을 선택해야 합니다.');
        return;
      }

      await onSubmit(role.id, {
        ...data,
        permissions,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">역할 수정</h2>
              {role.isSystem && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ 시스템 기본 역할은 일부 제한이 있을 수 있습니다.
                </p>
              )}
            </div>
            <Button
              variant="icon"
              onClick={handleClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 모달 본문 */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">기본 정보</h3>

                {/* 역할 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    역할 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    disabled={role.isSystem}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="예: DevOps Engineer"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="이 역할의 목적과 권한을 설명해주세요"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* 사용자 수 정보 */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    <span className="font-medium">{role.userCount}명</span>의 사용자가 이 역할을
                    사용하고 있습니다.
                  </p>
                </div>
              </div>

              {/* 권한 설정 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  권한 설정 <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  이 역할에 부여할 권한을 선택하세요. 각 리소스에 대해 읽기, 쓰기, 실행, 삭제 권한을
                  개별적으로 설정할 수 있습니다.
                </p>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          리소스
                        </th>
                        {(['read', 'write', 'execute', 'delete'] as PermissionAction[]).map(
                          (action) => (
                            <th
                              key={action}
                              className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              {ACTION_LABELS[action]}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {RESOURCES.map((resource) => (
                        <tr key={resource} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {RESOURCE_LABELS[resource]}
                          </td>
                          {(['read', 'write', 'execute', 'delete'] as PermissionAction[]).map(
                            (action) => (
                              <td key={action} className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="checkbox"
                                  checked={hasPermission(resource, action)}
                                  onChange={() => togglePermission(resource, action)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : '변경사항 저장'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
