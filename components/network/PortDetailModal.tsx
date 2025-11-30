'use client';

import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/common';
import type { Port } from '@/types/port';
import {
  PortStatusLabels,
  PortStatusColors,
  PortSpeedLabels,
  DuplexModeLabels,
} from '@/types/port';

interface PortDetailModalProps {
  port: Port | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function PortDetailModal({
  port,
  isOpen,
  onClose,
  isDark = false,
}: PortDetailModalProps) {
  if (!port) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const overlayBg = isDark ? 'bg-black/80' : 'bg-black/50';

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${overlayBg}`}
          onClick={onClose}
        >
          <div
            className={`relative w-full max-w-3xl ${bgColor} ${textColor} rounded-lg shadow-xl max-h-[90vh] overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className={`sticky top-0 ${bgColor} border-b ${borderColor} px-6 py-4 flex items-center justify-between z-10`}>
              <div>
                <h2 className="text-xl font-bold">포트 상세 정보</h2>
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

            {/* 본문 */}
            <div className="px-6 py-4 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${labelColor}`}>포트 이름</div>
                    <div className="font-semibold">{port.name}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>포트 ID</div>
                    <div className="font-mono text-sm">{port.id}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>디바이스</div>
                    <div className="font-semibold">{port.deviceName}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>디바이스 ID</div>
                    <div className="font-mono text-sm">{port.deviceId}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>상태</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PortStatusColors[port.status]}`}>
                      {PortStatusLabels[port.status]}
                    </span>
                  </div>
                  {port.vlanId && (
                    <div>
                      <div className={`text-sm ${labelColor}`}>VLAN ID</div>
                      <div className="font-semibold">VLAN {port.vlanId}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 포트 설정 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">포트 설정</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${labelColor}`}>속도</div>
                    <div className="font-semibold">{PortSpeedLabels[port.speed]}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>듀플렉스 모드</div>
                    <div className="font-semibold">{DuplexModeLabels[port.duplex]}</div>
                  </div>
                  {port.mtu && (
                    <div>
                      <div className={`text-sm ${labelColor}`}>MTU</div>
                      <div className="font-semibold">{port.mtu} bytes</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 트래픽 통계 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">트래픽 통계</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${labelColor}`}>송신 (TX)</div>
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {formatBytes(port.traffic.txBytes)}
                    </div>
                    <div className={`text-xs ${labelColor} mt-1`}>
                      {port.traffic.txPackets.toLocaleString()} 패킷
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>수신 (RX)</div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatBytes(port.traffic.rxBytes)}
                    </div>
                    <div className={`text-xs ${labelColor} mt-1`}>
                      {port.traffic.rxPackets.toLocaleString()} 패킷
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>에러</div>
                    <div className={`font-semibold ${port.traffic.errors > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {port.traffic.errors.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>드롭</div>
                    <div className={`font-semibold ${port.traffic.drops > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {port.traffic.drops.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className={`text-sm ${labelColor}`}>사용률</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          port.traffic.utilization >= 80
                            ? 'text-red-600 dark:text-red-400'
                            : port.traffic.utilization >= 50
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {port.traffic.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            port.traffic.utilization >= 80
                              ? 'bg-red-600'
                              : port.traffic.utilization >= 50
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(port.traffic.utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 타임스탬프 */}
              {(port.lastChange || port.uptime) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">시간 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {port.lastChange && (
                      <div>
                        <div className={`text-sm ${labelColor}`}>마지막 변경</div>
                        <div className="font-mono text-sm">
                          {format(new Date(port.lastChange), 'yyyy-MM-dd HH:mm:ss')}
                        </div>
                      </div>
                    )}
                    {port.uptime && (
                      <div>
                        <div className={`text-sm ${labelColor}`}>가동 시간</div>
                        <div className="font-semibold">{Math.floor(port.uptime / 3600)}시간</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 설명 */}
              {port.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">설명</h3>
                  <div className={`p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                    <p className="text-sm">{port.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className={`sticky bottom-0 ${bgColor} border-t ${borderColor} px-6 py-4 flex justify-end gap-3`}>
              <Button
                onClick={onClose}
                variant="secondary"
                size="md"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
