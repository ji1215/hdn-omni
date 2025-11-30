'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import {
  updateQoSPolicySchema,
  type UpdateQoSPolicyInput,
  type QoSPolicy,
  type QoSPriority,
  QoSPriorityLabels,
  QoSStatusLabels,
  type QoSStatus,
} from '@/types/qos';

interface EditQoSPolicyModalProps {
  isOpen: boolean;
  policy: QoSPolicy | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateQoSPolicyInput) => Promise<void>;
}

/**
 * QoS 정책 편집 모달
 */
export function EditQoSPolicyModal({
  isOpen,
  policy,
  onClose,
  onSubmit,
}: EditQoSPolicyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateQoSPolicyInput>({
    resolver: zodResolver(updateQoSPolicySchema),
    defaultValues: {
      name: policy?.name || '',
      description: policy?.description || '',
      priority: policy?.priority || 'medium',
      status: policy?.status || 'draft',
    },
  });

  // policy가 변경되면 폼 리셋
  useEffect(() => {
    if (policy) {
      reset({
        name: policy.name,
        description: policy.description || '',
        priority: policy.priority,
        status: policy.status,
      });
    }
  }, [policy, reset]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 모달 닫기 핸들러
  const handleClose = () => {
    if (isDirty) {
      const confirm = window.confirm(
        '변경 사항이 저장되지 않았습니다. 정말로 닫으시겠습니까?'
      );
      if (!confirm) return;
    }

    reset();
    setSubmitError(null);
    onClose();
  };

  // 폼 제출 핸들러
  const onSubmitForm = async (data: UpdateQoSPolicyInput) => {
    if (!policy) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await onSubmit(policy.id, data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to update QoS policy:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'QoS 정책 수정에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !policy) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              QoS 정책 편집
            </h2>
            <Button
              variant="icon"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 모달 바디 */}
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div className="p-6 space-y-6">
              {/* 에러 메시지 */}
              {submitError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      오류가 발생했습니다
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {submitError}
                    </p>
                  </div>
                </div>
              )}

              {/* 정책 이름 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  정책 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    errors.name
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="예: 프리미엄 트래픽 우선순위"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* 정책 설명 */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  설명 (선택사항)
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'resize-none',
                    errors.description
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="QoS 정책에 대한 설명을 입력하세요..."
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* 우선순위 */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  우선순위 <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    errors.priority
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  disabled={isSubmitting}
                >
                  {Object.entries(QoSPriorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* 상태 */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  상태 <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    errors.status
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  disabled={isSubmitting}
                >
                  {Object.entries(QoSStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* 안내 메시지 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  트래픽 클래스 및 대역폭 할당 등 세부 설정은 정책 상세 페이지에서 관리할 수 있습니다.
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
                {isSubmitting ? '수정 중...' : '수정'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
