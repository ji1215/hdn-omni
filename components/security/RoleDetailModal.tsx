'use client';

import { Role } from '@/types/role';
import { PermissionAction, Resource } from '@/types/rbac';
import { X, Shield, Users, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/common';

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

interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

/**
 * 역할 상세 정보 모달
 */
export function RoleDetailModal({ isOpen, onClose, role }: RoleDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {role.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      role.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}
                  >
                    {role.status === 'active' ? '활성' : '비활성'}
                  </span>
                  {role.isSystem && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      시스템 역할
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="icon"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* 모달 본문 */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">기본 정보</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* 사용자 수 */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">사용자 수</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {role.userCount}명
                  </p>
                </div>

                {/* 생성일 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">생성일</span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(role.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설명
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  {role.description}
                </p>
              </div>
            </div>

            {/* 권한 상세 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                권한 상세 ({role.permissions.length}개 리소스)
              </h3>

              <div className="space-y-3">
                {role.permissions.map((permission) => (
                  <div
                    key={permission.resource}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {RESOURCE_LABELS[permission.resource]}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {permission.actions.map((action) => (
                            <span
                              key={action}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded"
                            >
                              <Check className="w-3 h-3" />
                              {ACTION_LABELS[action]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 메타 정보 */}
            {(role.createdBy || role.updatedBy) && (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">메타 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                  {role.createdBy && (
                    <div>
                      <span className="font-medium">생성자:</span> {role.createdBy}
                    </div>
                  )}
                  {role.updatedBy && (
                    <div>
                      <span className="font-medium">최종 수정자:</span> {role.updatedBy}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">최종 수정일:</span>{' '}
                    {new Date(role.updatedAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 모달 푸터 */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
