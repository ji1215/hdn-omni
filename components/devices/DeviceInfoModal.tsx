'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Server,
  Wifi,
  WifiOff,
  AlertCircle,
  Wrench,
  MapPin,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  Network,
  TrendingUp,
  TrendingDown,
  RotateCw,
  Database,
  Download,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type { Device, DeviceInterface } from '@/types/device';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DeviceInfoModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  isDark?: boolean;
}

// 상태별 아이콘 및 스타일
const statusConfig = {
  online: {
    icon: Wifi,
    label: '온라인',
    className: 'text-green-600 dark:text-green-400',
    bgClassName: 'bg-green-100 dark:bg-green-900/30',
  },
  offline: {
    icon: WifiOff,
    label: '오프라인',
    className: 'text-gray-600 dark:text-gray-400',
    bgClassName: 'bg-gray-100 dark:bg-gray-700',
  },
  error: {
    icon: AlertCircle,
    label: '오류',
    className: 'text-red-600 dark:text-red-400',
    bgClassName: 'bg-red-100 dark:bg-red-900/30',
  },
  maintenance: {
    icon: Wrench,
    label: '유지보수',
    className: 'text-yellow-600 dark:text-yellow-400',
    bgClassName: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
};

// 바이트 포맷
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// 업타임 포맷
function formatUptime(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  const parts = [];
  if (duration.days) parts.push(`${duration.days}일`);
  if (duration.hours) parts.push(`${duration.hours}시간`);
  if (duration.minutes) parts.push(`${duration.minutes}분`);
  return parts.join(' ') || '0분';
}

// 인터페이스 상태 아이콘
const interfaceStatusConfig = {
  up: {
    icon: TrendingUp,
    className: 'text-green-600 dark:text-green-400',
    bgClassName: 'bg-green-100 dark:bg-green-900/30',
  },
  down: {
    icon: TrendingDown,
    className: 'text-red-600 dark:text-red-400',
    bgClassName: 'bg-red-100 dark:bg-red-900/30',
  },
  'admin-down': {
    icon: TrendingDown,
    className: 'text-gray-600 dark:text-gray-400',
    bgClassName: 'bg-gray-100 dark:bg-gray-700',
  },
};

export function DeviceInfoModal({
  device,
  isOpen,
  onClose,
  onAction,
  isDark = false,
}: DeviceInfoModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'interfaces'>('info');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
    }
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const statusInfo = statusConfig[device.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Server className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {device.hostname}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{device.ip}</p>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    statusInfo.className,
                    statusInfo.bgClassName
                  )}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(device.lastCommunication, {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="icon"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 탭 */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 px-6">
            <Button
              onClick={() => setActiveTab('info')}
              variant="ghost"
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors rounded-none',
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              기본 정보
            </Button>
            <Button
              onClick={() => setActiveTab('stats')}
              variant="ghost"
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors rounded-none',
                activeTab === 'stats'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              통계
            </Button>
            <Button
              onClick={() => setActiveTab('interfaces')}
              variant="ghost"
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors rounded-none',
                activeTab === 'interfaces'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              인터페이스
            </Button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* 디바이스 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  디바이스 정보
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      제조사
                    </dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                      {device.manufacturer}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">모델</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-medium">
                      {device.model}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      펌웨어 버전
                    </dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-medium">
                      {device.firmwareVersion}
                    </dd>
                  </div>
                  {device.serialNumber && (
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        시리얼 번호
                      </dt>
                      <dd className="text-gray-900 dark:text-gray-100 font-medium">
                        {device.serialNumber}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      프로토콜
                    </dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-medium">
                      {device.protocol.toUpperCase()} (포트 {device.port})
                    </dd>
                  </div>
                  {device.location && (
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        위치
                      </dt>
                      <dd className="text-gray-900 dark:text-gray-100 font-medium">
                        {device.location}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* 설명 */}
              {device.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    설명
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {device.description}
                  </p>
                </div>
              )}

              {/* 메타데이터 */}
              {device.metadata && Object.keys(device.metadata).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    추가 정보
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(device.metadata).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                          {key}
                        </dt>
                        <dd className="text-gray-900 dark:text-gray-100 font-medium">
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {device.stats ? (
                <>
                  {/* 시스템 리소스 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      시스템 리소스
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CPU 사용률 */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              CPU 사용률
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {device.stats.cpuUsage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full transition-all',
                              device.stats.cpuUsage > 80
                                ? 'bg-red-500'
                                : device.stats.cpuUsage > 60
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            )}
                            style={{ width: `${device.stats.cpuUsage}%` }}
                          />
                        </div>
                      </div>

                      {/* 메모리 사용률 */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              메모리 사용률
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {device.stats.memoryUsage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full transition-all',
                              device.stats.memoryUsage > 80
                                ? 'bg-red-500'
                                : device.stats.memoryUsage > 60
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            )}
                            style={{ width: `${device.stats.memoryUsage}%` }}
                          />
                        </div>
                      </div>

                      {/* 디스크 사용률 */}
                      {device.stats.diskUsage !== undefined && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Database className="w-5 h-5 text-primary" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                디스크 사용률
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {device.stats.diskUsage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all',
                                device.stats.diskUsage > 80
                                  ? 'bg-red-500'
                                  : device.stats.diskUsage > 60
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              )}
                              style={{ width: `${device.stats.diskUsage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 업타임 */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            업타임
                          </span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatUptime(device.stats.uptime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 트래픽 통계 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      트래픽 통계
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            수신 트래픽
                          </span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatBytes(device.stats.trafficIn)}/s
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            송신 트래픽
                          </span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatBytes(device.stats.trafficOut)}/s
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    통계 정보를 사용할 수 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'interfaces' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                네트워크 인터페이스
              </h3>
              {device.interfaces && device.interfaces.length > 0 ? (
                <div className="space-y-3">
                  {device.interfaces.map((iface, index) => {
                    const ifaceStatusInfo = interfaceStatusConfig[iface.status];
                    const IfaceStatusIcon = ifaceStatusInfo.icon;

                    return (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Network className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {iface.name}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                              ifaceStatusInfo.className,
                              ifaceStatusInfo.bgClassName
                            )}
                          >
                            <IfaceStatusIcon className="w-3 h-3" />
                            {iface.status}
                          </span>
                        </div>
                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {iface.ip && (
                            <div>
                              <dt className="text-gray-600 dark:text-gray-400">IP</dt>
                              <dd className="text-gray-900 dark:text-gray-100 font-medium">
                                {iface.ip}
                              </dd>
                            </div>
                          )}
                          {iface.mac && (
                            <div>
                              <dt className="text-gray-600 dark:text-gray-400">MAC</dt>
                              <dd className="text-gray-900 dark:text-gray-100 font-medium font-mono text-xs">
                                {iface.mac}
                              </dd>
                            </div>
                          )}
                          {iface.speed && (
                            <div>
                              <dt className="text-gray-600 dark:text-gray-400">속도</dt>
                              <dd className="text-gray-900 dark:text-gray-100 font-medium">
                                {iface.speed} Mbps
                              </dd>
                            </div>
                          )}
                          {iface.duplex && (
                            <div>
                              <dt className="text-gray-600 dark:text-gray-400">Duplex</dt>
                              <dd className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                                {iface.duplex}
                              </dd>
                            </div>
                          )}
                          {iface.mtu && (
                            <div>
                              <dt className="text-gray-600 dark:text-gray-400">MTU</dt>
                              <dd className="text-gray-900 dark:text-gray-100 font-medium">
                                {iface.mtu}
                              </dd>
                            </div>
                          )}
                          {iface.vlan && (
                            <div>
                              <dt className="text-gray-600 dark:text-gray-400">VLAN</dt>
                              <dd className="text-gray-900 dark:text-gray-100 font-medium">
                                {iface.vlan}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Network className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    인터페이스 정보를 사용할 수 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            onClick={() => onAction('reboot')}
            variant="secondary"
            className="flex-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
            leftIcon={<RotateCw className="w-4 h-4" />}
          >
            재시작
          </Button>
          <Button
            onClick={() => onAction('backup')}
            variant="primary"
            className="flex-1"
            leftIcon={<Database className="w-4 h-4" />}
          >
            백업
          </Button>
          <Button
            onClick={() => onAction('upgrade')}
            variant="secondary"
            className="flex-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50"
            leftIcon={<Download className="w-4 h-4" />}
          >
            업그레이드
          </Button>
        </div>
      </div>
    </div>
  );
}
