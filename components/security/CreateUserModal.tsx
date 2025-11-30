'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, Copy } from 'lucide-react';
import { CreateUserRequest, UserRole } from '@/types/user';
import { generateTemporaryPassword } from '@/lib/password';
import { Button } from '@/components/common';

// Zod 스키마 정의
const createUserSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  department: z.string().min(2, '부서명은 최소 2자 이상이어야 합니다.'),
  contact: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다.'),
  role: z.enum(['super_admin', 'network_admin', 'monitoring_user', 'guest'] as const),
  sendEmail: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest) => Promise<void>;
}

/**
 * 사용자 계정 생성 모달
 */
export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'guest',
      sendEmail: true,
    },
  });

  // 모달 닫기 핸들러
  const handleClose = () => {
    reset();
    setGeneratedPassword('');
    setShowPassword(false);
    onClose();
  };

  // 임시 비밀번호 생성
  const handleGeneratePassword = () => {
    const password = generateTemporaryPassword(12);
    setGeneratedPassword(password);
    setShowPassword(true);
  };

  // 폼 제출 핸들러
  const onSubmitForm = async (data: CreateUserFormData) => {
    try {
      setIsSubmitting(true);

      // 임시 비밀번호 자동 생성 (아직 생성되지 않았다면)
      if (!generatedPassword) {
        handleGeneratePassword();
      }

      await onSubmit(data);
      handleClose();
    } catch (error) {
      console.error('Failed to create user:', error);
      // TODO: 에러 토스트 표시
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
      <div className="flex min-h-full items-center justify-center md:p-4">
        <div className="relative bg-white dark:bg-gray-800 shadow-xl w-full h-full md:h-auto md:max-w-2xl md:rounded-lg flex flex-col md:block animate-slide-up md:animate-none">
          {/* 모달 헤더 - 모바일에서 고정 */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
              사용자 추가
            </h2>
            <Button
              onClick={handleClose}
              variant="icon"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 모달 본문 - 모바일에서 스크롤 */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 flex flex-col md:block overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="홍길동"
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
                  placeholder="user@example.com"
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
                <input
                  type="text"
                  {...register('department')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="네트워크 운영팀"
                />
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
                  placeholder="010-1234-5678"
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

              {/* 임시 비밀번호 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    임시 비밀번호
                  </label>
                  <Button
                    type="button"
                    onClick={handleGeneratePassword}
                    variant="ghost"
                    size="sm"
                  >
                    자동 생성
                  </Button>
                </div>
                {generatedPassword && (
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={generatedPassword}
                      readOnly
                      className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="icon"
                        size="sm"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPassword);
                          // TODO: 복사 성공 토스트
                        }}
                        variant="icon"
                        size="sm"
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  임시 비밀번호는 자동으로 생성되며, 사용자에게 전달됩니다.
                </p>
              </div>

              {/* 이메일 알림 체크박스 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('sendEmail')}
                  id="sendEmail"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  사용자에게 계정 정보를 이메일로 발송
                </label>
              </div>
            </div>

            {/* 모달 푸터 - 모바일에서 고정 */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
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
                {isSubmitting ? '생성 중...' : '사용자 추가'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
