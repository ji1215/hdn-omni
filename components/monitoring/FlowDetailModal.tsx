'use client';

import { Dialog } from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/common';
import type { Flow } from '@/types/traffic';

interface FlowDetailModalProps {
  flow: Flow | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function FlowDetailModal({
  flow,
  isOpen,
  onClose,
  isDark = false,
}: FlowDetailModalProps) {
  if (!flow) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분 ${seconds % 60}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    }
    return `${seconds}초`;
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
            className={`relative w-full max-w-2xl ${bgColor} ${textColor} rounded-lg shadow-xl max-h-[90vh] overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className={`sticky top-0 ${bgColor} border-b ${borderColor} px-6 py-4 flex items-center justify-between z-10`}>
              <h2 className="text-xl font-bold">플로우 상세 정보</h2>
              <Button
                variant="icon"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 본문 */}
            <div className="px-6 py-4 space-y-6">
              {/* 5-tuple 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">5-Tuple</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${labelColor}`}>소스 IP</div>
                    <div className="font-mono font-semibold">{flow.sourceIp}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>소스 포트</div>
                    <div className="font-mono font-semibold">{flow.sourcePort}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>목적지 IP</div>
                    <div className="font-mono font-semibold">{flow.destinationIp}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>목적지 포트</div>
                    <div className="font-mono font-semibold">{flow.destinationPort}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>프로토콜</div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded font-semibold ${
                          flow.protocol === 'TCP'
                            ? 'bg-blue-500 text-white'
                            : flow.protocol === 'UDP'
                            ? 'bg-green-500 text-white'
                            : flow.protocol === 'ICMP'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {flow.protocol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 통계 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">통계</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${labelColor}`}>전송 바이트</div>
                    <div className="font-semibold text-blue-500">{formatBytes(flow.bytes)}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>패킷 수</div>
                    <div className="font-semibold">{flow.packets.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>시작 시간</div>
                    <div className="font-mono text-sm">
                      {format(new Date(flow.startTime), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>종료 시간</div>
                    <div className="font-mono text-sm">
                      {flow.endTime
                        ? format(new Date(flow.endTime), 'yyyy-MM-dd HH:mm:ss')
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>지속 시간</div>
                    <div className="font-semibold">{formatDuration(flow.duration)}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${labelColor}`}>상태</div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded ${
                          flow.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : flow.status === 'closed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {flow.status === 'active' ? '활성' : flow.status === 'closed' ? '종료' : '유휴'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TCP 플래그 */}
              {flow.tcpFlags && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">TCP 플래그</h3>
                  <div className="flex flex-wrap gap-2">
                    {flow.tcpFlags.syn && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">SYN</span>
                    )}
                    {flow.tcpFlags.ack && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded">ACK</span>
                    )}
                    {flow.tcpFlags.fin && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">FIN</span>
                    )}
                    {flow.tcpFlags.rst && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded">RST</span>
                    )}
                    {flow.tcpFlags.psh && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">PSH</span>
                    )}
                    {flow.tcpFlags.urg && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded">URG</span>
                    )}
                  </div>
                </div>
              )}

              {/* 추가 정보 */}
              {(flow.application || flow.vlanId) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">추가 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {flow.application && (
                      <div>
                        <div className={`text-sm ${labelColor}`}>애플리케이션</div>
                        <div className="font-semibold">{flow.application}</div>
                      </div>
                    )}
                    {flow.vlanId && (
                      <div>
                        <div className={`text-sm ${labelColor}`}>VLAN ID</div>
                        <div className="font-semibold">{flow.vlanId}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 메타데이터 */}
              {flow.metadata && Object.keys(flow.metadata).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">메타데이터</h3>
                  <div className={`p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                    <pre className="text-sm font-mono overflow-auto">
                      {JSON.stringify(flow.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className={`sticky bottom-0 ${bgColor} border-t ${borderColor} px-6 py-4 flex justify-end`}>
              <Button
                variant="primary"
                onClick={onClose}
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
