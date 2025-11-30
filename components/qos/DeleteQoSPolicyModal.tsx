'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/common';
import type { QoSPolicy } from '@/types/qos';

interface DeleteQoSPolicyModalProps {
  isOpen: boolean;
  policy: QoSPolicy | null;
  onClose: () => void;
  onConfirm: (policyId: string) => Promise<void>;
}

/**
 * QoS 정책 삭제 확인 모달
 */
export function DeleteQoSPolicyModal({
  isOpen,
  policy,
  onClose,
  onConfirm,
}: DeleteQoSPolicyModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!policy) return;

    try {
      setIsDeleting(true);
      await onConfirm(policy.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete policy:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !policy) return null;

  const hasAppliedDevices = policy.appliedDevices.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                정책 삭제 확인
              </h2>
            </div>
            <Button
              variant="icon"
              onClick={onClose}
              disabled={isDeleting}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{policy.name}</span> 정책을 삭제하시겠습니까?
            </p>

            {hasAppliedDevices && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>경고:</strong> 이 정책은 현재{' '}
                  <strong>{policy.appliedDevices.length}개의 디바이스</strong>에
                  적용되어 있습니다. 삭제하면 해당 디바이스의 QoS 설정이 제거됩니다.
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              loading={isDeleting}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
