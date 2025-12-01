'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { CreateDepartmentRequest, Department } from '@/types/department';
import { Button } from '@/components/common';

// Zod 스키마 정의
const createDepartmentSchema = z.object({
  name: z.string().min(2, '부서명은 최소 2자 이상이어야 합니다.'),
  description: z.string().min(5, '설명은 최소 5자 이상이어야 합니다.'),
  parentId: z.string().nullable(),
});

type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentRequest) => Promise<void>;
  departments: Department[]; // 상위 부서 선택용
}

/**
 * 부서 생성 모달
 */
export function CreateDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
}: CreateDepartmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      parentId: null,
    },
  });

  // 모달 닫기 핸들러
  const handleClose = () => {
    reset();
    onClose();
  };

  // 폼 제출 핸들러
  const onSubmitForm = async (data: CreateDepartmentFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        name: data.name,
        description: data.description,
        parentId: data.parentId || null,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create department:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 최상위 부서만 상위 부서로 선택 가능 (2단계 계층까지만)
  const parentOptions = departments.filter((d) => d.parentId === null && d.status === 'active');

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
        <div className="relative bg-white dark:bg-gray-800 shadow-xl w-full h-full md:h-auto md:max-w-lg md:rounded-lg flex flex-col md:block animate-slide-up md:animate-none">
          {/* 모달 헤더 */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
              부서 추가
            </h2>
            <Button onClick={handleClose} variant="icon" aria-label="닫기">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 모달 본문 */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 flex flex-col md:block overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* 부서명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  부서명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 네트워크 운영팀"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="부서의 역할 및 담당 업무를 설명해주세요"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* 상위 부서 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  상위 부서
                </label>
                <select
                  {...register('parentId')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">없음 (최상위 부서)</option>
                  {parentOptions.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  상위 부서를 선택하면 해당 부서의 하위 조직이 됩니다.
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
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '생성 중...' : '부서 추가'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
