'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { validatePassword } from '@/lib/password';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  userId?: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  userId = '',
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidationErrors([]);
      setSubmitError(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // 새 비밀번호 유효성 검증
  useEffect(() => {
    if (newPassword) {
      const result = validatePassword(newPassword, userId);
      setValidationErrors(result.errors);
    } else {
      setValidationErrors([]);
    }
  }, [newPassword, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // 현재 비밀번호 확인
    if (!currentPassword) {
      setSubmitError('현재 비밀번호를 입력해주세요.');
      return;
    }

    // 새 비밀번호 유효성 검증
    const validationResult = validatePassword(newPassword, userId);
    if (!validationResult.isValid) {
      setSubmitError('비밀번호가 보안 요구사항을 충족하지 않습니다.');
      return;
    }

    // 비밀번호 확인 일치 검증
    if (newPassword !== confirmPassword) {
      setSubmitError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    // 현재 비밀번호와 새 비밀번호가 동일한지 검증
    if (currentPassword === newPassword) {
      setSubmitError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(currentPassword, newPassword);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '비밀번호 변경 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    validationErrors.length === 0 &&
    newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            비밀번호 변경
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 현재 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="현재 비밀번호를 입력하세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="새 비밀번호를 입력하세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                비밀번호가 일치하지 않습니다.
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                비밀번호가 일치합니다.
              </p>
            )}
          </div>

          {/* 비밀번호 보안 요구사항 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              비밀번호 보안 요구사항
            </h3>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>9자리 이상의 길이 설정</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>숫자, 대문자(영문), 소문자(영문), 특수문자 중에서 3가지 이상의 조합</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>사용자 계정(ID)과 동일한 패스워드 설정 금지</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>동일한 문자, 숫자의 연속적인 반복입력 금지 (예: aaa, 111)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>키보드상의 연속된 문자 또는 숫자의 순차적 입력 금지 (예: abc, 123, qwerty)</span>
              </li>
            </ul>
          </div>

          {/* 유효성 검증 에러 */}
          {validationErrors.length > 0 && newPassword && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                    다음 요구사항을 충족해야 합니다:
                  </h3>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-xs text-red-800 dark:text-red-300">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 제출 에러 */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">{submitError}</p>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={!isFormValid || isSubmitting}
            >
              비밀번호 변경
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
