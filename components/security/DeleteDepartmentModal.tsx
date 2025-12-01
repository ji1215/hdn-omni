'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertTriangle } from 'lucide-react';
import { Department, DeleteDepartmentRequest } from '@/types/department';
import { Button } from '@/components/common';

// Zod 스키마 정의
const deleteDepartmentSchema = z.object({
  reason: z.string().min(5, '삭제 사유는 최소 5자 이상 입력해주세요.'),
  confirmName: z.string(),
});

type DeleteDepartmentFormData = z.infer<typeof deleteDepartmentSchema>;

interface DeleteDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (departmentId: string, data: DeleteDepartmentRequest) => Promise<void>;
  department: Department;
}

/**
 * 부서 삭제 확인 모달
 */
export function DeleteDepartmentModal({
  isOpen,
  onClose,
  onConfirm,
  department,
}: DeleteDepartmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DeleteDepartmentFormData>({
    resolver: zodResolver(deleteDepartmentSchema),
    defaultValues: {
      reason: '',
      confirmName: '',
    },
  });

  const confirmName = watch('confirmName');
  const isConfirmValid = confirmName === department.name;

  // 모달 닫기 핸들러
  const handleClose = () => {
    reset();
    onClose();
  };

  // 폼 제출 핸들러
  const onSubmitForm = async (data: DeleteDepartmentFormData) => {
    if (!isConfirmValid) return;

    try {
      setIsSubmitting(true);
      await onConfirm(department.id, {
        id: department.id,
        reason: data.reason,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to delete department:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제 불가 조건 체크
  const cannotDelete = department.memberCount > 0;

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
        <div className="relative bg-white dark:bg-gray-800 shadow-xl w-full h-full md:h-auto md:max-w-md md:rounded-lg flex flex-col md:block animate-slide-up md:animate-none">
          {/* 모달 헤더 */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                부서 삭제
              </h2>
            </div>
            <Button onClick={handleClose} variant="icon" aria-label="닫기">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 모달 본문 */}
          {cannotDelete ? (
            <div className="p-4 md:p-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  삭제할 수 없습니다
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  이 부서에는 현재 <strong>{department.memberCount}명</strong>의 인원이 소속되어
                  있습니다. 부서를 삭제하려면 먼저 모든 인원을 다른 부서로 이동시켜주세요.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleClose} variant="secondary">
                  닫기
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 flex flex-col md:block overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {/* 경고 메시지 */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>{department.name}</strong> 부서를 삭제하시겠습니까?
                    <br />
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>

                {/* 삭제 사유 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    삭제 사유 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('reason')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="부서 삭제 사유를 입력해주세요"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {/* 부서명 확인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    확인을 위해 부서명을 입력하세요
                  </label>
                  <input
                    type="text"
                    {...register('confirmName')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={department.name}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    &quot;{department.name}&quot;을(를) 정확히 입력해주세요.
                  </p>
                </div>
              </div>

              {/* 모달 푸터 */}
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
                  variant="danger"
                  loading={isSubmitting}
                  disabled={isSubmitting || !isConfirmValid}
                >
                  {isSubmitting ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
