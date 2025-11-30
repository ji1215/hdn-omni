'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, DeleteUserRequest } from '@/types/user';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/common';

// Zod 스키마 정의
const deleteUserSchema = z.object({
  reason: z.string().min(10, '삭제 사유는 최소 10자 이상 입력해주세요.'),
});

type DeleteUserFormData = z.infer<typeof deleteUserSchema>;

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (userId: string, data: DeleteUserRequest) => Promise<void>;
}

/**
 * 사용자 계정 삭제 확인 모달
 */
export function DeleteUserModal({ isOpen, user, onClose, onConfirm }: DeleteUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteUserFormData>({
    resolver: zodResolver(deleteUserSchema),
  });

  // 모달 닫기 핸들러
  const handleClose = () => {
    reset();
    onClose();
  };

  // 삭제 확인 핸들러
  const onSubmitForm = async (data: DeleteUserFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      await onConfirm(user.id, { id: user.id, ...data });
      handleClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
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
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {/* 경고 아이콘 */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                사용자 삭제 확인
              </h2>
            </div>
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
              {/* 경고 메시지 */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                  ⚠️ 이 작업은 되돌릴 수 없습니다
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  사용자 계정과 관련된 모든 데이터가 영구적으로 삭제됩니다.
                  삭제하기 전에 신중히 확인해주세요.
                </p>
              </div>

              {/* 삭제 대상 사용자 정보 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  삭제 대상 사용자
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">이름:</span> {user.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">이메일:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">부서:</span> {user.department}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">역할:</span> {user.role}
                  </p>
                </div>
              </div>

              {/* 삭제 사유 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  삭제 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('reason')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="사용자 계정을 삭제하는 사유를 입력해주세요. (최소 10자)"
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.reason.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  삭제 사유는 감사 로그에 기록됩니다.
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
                variant="danger"
                loading={isSubmitting}
                leftIcon={!isSubmitting ? <Trash2 className="w-5 h-5" /> : undefined}
                disabled={isSubmitting}
              >
                {isSubmitting ? '삭제 중...' : '삭제하기'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
