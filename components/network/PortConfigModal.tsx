'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common';
import type { Port, PortStatus, PortSpeed, DuplexMode } from '@/types/port';
import {
  PortStatusLabels,
  PortSpeedLabels,
  DuplexModeLabels,
} from '@/types/port';

interface PortConfigModalProps {
  port: Port | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (portId: string, config: PortConfigFormData) => void;
  isDark?: boolean;
}

export interface PortConfigFormData {
  status: PortStatus;
  speed: PortSpeed;
  duplex: DuplexMode;
  enabled: boolean;
  vlanId: number | null;
  description: string;
  mtu: number;
}

export function PortConfigModal({
  port,
  isOpen,
  onClose,
  onSave,
  isDark = false,
}: PortConfigModalProps) {
  const [formData, setFormData] = useState<PortConfigFormData>({
    status: 'down',
    speed: '1G',
    duplex: 'auto',
    enabled: false,
    vlanId: null,
    description: '',
    mtu: 1500,
  });

  // 포트 정보가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (port) {
      setFormData({
        status: port.status,
        speed: port.speed,
        duplex: port.duplex,
        enabled: port.enabled,
        vlanId: port.vlanId || null,
        description: port.description || '',
        mtu: port.mtu,
      });
    }
  }, [port]);

  if (!port) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(port.id, formData);
    onClose();
  };

  const handleReset = () => {
    if (port) {
      setFormData({
        status: port.status,
        speed: port.speed,
        duplex: port.duplex,
        enabled: port.enabled,
        vlanId: port.vlanId || null,
        description: port.description || '',
        mtu: port.mtu,
      });
    }
  };

  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const overlayBg = isDark ? 'bg-black/80' : 'bg-black/50';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${overlayBg}`}
          onClick={onClose}
        >
          <div
            className={`relative w-full max-w-2xl ${bgColor} ${textColor} rounded-lg shadow-xl max-h-[90vh] overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className={`sticky top-0 ${bgColor} border-b ${borderColor} px-6 py-4 flex items-center justify-between z-10`}>
              <div>
                <h2 className="text-xl font-bold">포트 구성</h2>
                <p className={`text-sm ${labelColor} mt-1`}>{port.name}</p>
              </div>
              <Button
                onClick={onClose}
                variant="icon"
                size="sm"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-6">
                {/* 포트 활성화 */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) =>
                        setFormData({ ...formData, enabled: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">포트 활성화</span>
                  </label>
                  <p className={`text-xs ${labelColor} mt-1 ml-8`}>
                    체크하면 포트가 활성화되어 트래픽을 전송할 수 있습니다
                  </p>
                </div>

                {/* 상태 */}
                <div>
                  <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as PortStatus })
                    }
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                  >
                    {Object.entries(PortStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 속도 및 듀플렉스 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                      속도
                    </label>
                    <select
                      value={formData.speed}
                      onChange={(e) =>
                        setFormData({ ...formData, speed: e.target.value as PortSpeed })
                      }
                      className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                    >
                      {Object.entries(PortSpeedLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                      듀플렉스 모드
                    </label>
                    <select
                      value={formData.duplex}
                      onChange={(e) =>
                        setFormData({ ...formData, duplex: e.target.value as DuplexMode })
                      }
                      className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                    >
                      {Object.entries(DuplexModeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* VLAN ID 및 MTU */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                      VLAN ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4094"
                      value={formData.vlanId || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vlanId: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      placeholder="1-4094 (선택사항)"
                      className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                    />
                    <p className={`text-xs ${labelColor} mt-1`}>
                      1-4094 사이의 값 (비워두면 미지정)
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                      MTU (bytes)
                    </label>
                    <input
                      type="number"
                      min="576"
                      max="9216"
                      value={formData.mtu}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mtu: parseInt(e.target.value) || 1500,
                        })
                      }
                      className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                    />
                    <p className={`text-xs ${labelColor} mt-1`}>
                      기본값: 1500 (Jumbo: 9000)
                    </p>
                  </div>
                </div>

                {/* 설명 */}
                <div>
                  <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                    설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="포트에 대한 설명을 입력하세요 (선택사항)"
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textColor} resize-none`}
                  />
                </div>

                {/* 경고 메시지 */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        주의사항
                      </h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        포트 설정을 변경하면 일시적으로 연결이 끊어질 수 있습니다.
                        프로덕션 환경에서는 주의해서 변경하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className={`sticky bottom-0 ${bgColor} border-t ${borderColor} px-6 py-4 flex justify-between`}>
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="ghost"
                  size="md"
                >
                  초기화
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="secondary"
                    size="md"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                  >
                    저장
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
