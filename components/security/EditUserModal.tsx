'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, UpdateUserRequest, UserStatus } from '@/types/user';
import { generateTemporaryPassword } from '@/lib/password';
import { X, Eye, EyeOff, Copy } from 'lucide-react';
import { Button } from '@/components/common';
import { useDepartmentOptions } from '@/hooks/useDepartments';

// Zod 스키마 정의
const editUserSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  department: z.string().min(2, '부서명은 최소 2자 이상이어야 합니다.'),
  contact: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다.'),
  role: z.enum(['super_admin', 'network_admin', 'monitoring_user', 'guest'] as const),
  status: z.enum(['active', 'inactive', 'suspended'] as const),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (userId: string, data: UpdateUserRequest) => Promise<void>;
}

/**
 * 사용자 계정 수정 모달
 */
export function EditUserModal({ isOpen, user, onClose, onSubmit }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 부서 옵션 동적 로드
  const { data: departmentOptions } = useDepartmentOptions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // 사용자 데이터가 변경되면 폼 초기화
  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('department', user.department);
      setValue('contact', user.contact);
      setValue('role', user.role);
      setValue('status', user.status);
    }
  }, [user, setValue]);

  // 모달 닫기 핸들러
  const handleClose = () => {
    reset();
    setNewPassword('');
    setShowPassword(false);
    onClose();
  };

  // 비밀번호 재설정
  const handleResetPassword = () => {
    const password = generateTemporaryPassword(12);
    setNewPassword(password);
    setShowPassword(true);
  };

  // 폼 제출 핸들러
  const onSubmitForm = async (data: EditUserFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      const updateData: UpdateUserRequest = {
        name: data.name !== user.name ? data.name : undefined,
        email: data.email !== user.email ? data.email : undefined,
        department: data.department !== user.department ? data.department : undefined,
        contact: data.contact !== user.contact ? data.contact : undefined,
        role: data.role !== user.role ? data.role : undefined,
        status: data.status !== user.status ? data.status : undefined,
      };

      await onSubmit(user.id, updateData);
      handleClose();
    } catch (error) {
      console.error('Failed to update user:', error);
      // TODO: 에러 토스트 표시
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              사용자 정보 수정
            </h2>
            <Button
              variant="icon"
              onClick={handleClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 모달 본문 */}
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-6 space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* 부서 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  부서 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('department')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">부서를 선택하세요</option>
                  {departmentOptions?.map((dept) => (
                    <option key={dept.value} value={dept.label}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('contact')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.contact.message}
                  </p>
                )}
              </div>

              {/* 역할 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  역할 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="guest">Guest</option>
                  <option value="monitoring_user">Monitoring User</option>
                  <option value="network_admin">Network Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* 계정 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  계정 상태 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="suspended">정지</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* 비밀번호 재설정 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    비밀번호 재설정
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetPassword}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    새 비밀번호 생성
                  </Button>
                </div>
                {newPassword && (
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      readOnly
                      className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        type="button"
                        variant="icon"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="icon"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(newPassword);
                          // TODO: 복사 성공 토스트
                        }}
                        className="p-1"
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  새 비밀번호를 생성하면 사용자에게 이메일로 전송됩니다.
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
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
                {isSubmitting ? '수정 중...' : '저장'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
