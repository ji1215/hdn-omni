'use client';

import { useState } from 'react';
import { Role, DeleteRoleRequest } from '@/types/role';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/common';

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (roleId: string, data: Omit<DeleteRoleRequest, 'id'>) => Promise<void>;
  role: Role;
  availableRoles?: Role[]; // 사용자를 이관할 수 있는 역할 목록
}

/**
 * 역할 삭제 확인 모달
 */
export function DeleteRoleModal({
  isOpen,
  onClose,
  onConfirm,
  role,
  availableRoles = [],
}: DeleteRoleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [transferToRoleId, setTransferToRoleId] = useState('');

  const handleClose = () => {
    setReason('');
    setTransferToRoleId('');
    onClose();
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert('삭제 사유를 입력해주세요.');
      return;
    }

    if (role.userCount > 0 && !transferToRoleId) {
      alert('기존 사용자를 이관할 역할을 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(role.id, {
        reason: reason.trim(),
        transferToRoleId: transferToRoleId || undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to delete role:', error);
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
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                역할 삭제
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
          <div className="p-6 space-y-4">
            {/* 경고 메시지 */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-300">
                <span className="font-semibold">{role.name}</span> 역할을 삭제하시겠습니까?
              </p>
              {role.isSystem && (
                <p className="mt-2 text-sm text-red-900 dark:text-red-300">
                  ⚠️ 이것은 시스템 기본 역할입니다. 삭제하면 시스템 동작에 문제가 발생할 수
                  있습니다.
                </p>
              )}
              {role.userCount > 0 && (
                <p className="mt-2 text-sm text-red-900 dark:text-red-300">
                  현재 <span className="font-semibold">{role.userCount}명</span>의 사용자가 이
                  역할을 사용하고 있습니다.
                </p>
              )}
            </div>

            {/* 사용자 이관 */}
            {role.userCount > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  사용자 이관 <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferToRoleId}
                  onChange={(e) => setTransferToRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">이관할 역할 선택</option>
                  {availableRoles
                    .filter((r) => r.id !== role.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  기존 사용자들이 선택한 역할로 이관됩니다.
                </p>
              </div>
            )}

            {/* 삭제 사유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                삭제 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="역할을 삭제하는 이유를 입력해주세요. 이 정보는 감사 로그에 기록됩니다."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 확인 체크박스 */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-300">
                이 작업은 되돌릴 수 없습니다. 삭제를 진행하시겠습니까?
              </p>
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
              type="button"
              variant="danger"
              onClick={handleConfirm}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
