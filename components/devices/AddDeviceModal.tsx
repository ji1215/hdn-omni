'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type {
  AddDeviceRequest,
  DeviceProtocol,
  DeviceManufacturer,
  DeviceConnectionTest,
  DeviceGroup,
} from '@/types/device';
import { AddDeviceRequestSchema } from '@/types/device';
import deviceService from '@/services/deviceService';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groups: DeviceGroup[];
  isDark?: boolean;
}

const PROTOCOL_OPTIONS: { value: DeviceProtocol; label: string }[] = [
  { value: 'ssh', label: 'SSH' },
  { value: 'telnet', label: 'Telnet' },
  { value: 'snmp', label: 'SNMP' },
  { value: 'netconf', label: 'NETCONF' },
];

const MANUFACTURER_OPTIONS: { value: DeviceManufacturer; label: string }[] = [
  { value: 'cisco', label: 'Cisco' },
  { value: 'juniper', label: 'Juniper' },
  { value: 'huawei', label: 'Huawei' },
  { value: 'arista', label: 'Arista' },
  { value: 'hp', label: 'HP' },
  { value: 'dell', label: 'Dell' },
  { value: 'other', label: '기타' },
];

const DEFAULT_PORTS: Record<DeviceProtocol, number> = {
  ssh: 22,
  telnet: 23,
  snmp: 161,
  netconf: 830,
};

export function AddDeviceModal({
  isOpen,
  onClose,
  onSuccess,
  groups,
  isDark = false,
}: AddDeviceModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showEnablePassword, setShowEnablePassword] = useState(false);
  const [testStatus, setTestStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [testResult, setTestResult] = useState<DeviceConnectionTest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddDeviceRequest>({
    resolver: zodResolver(AddDeviceRequestSchema),
    defaultValues: {
      port: 22,
      protocol: 'ssh',
    },
  });

  const protocol = watch('protocol');

  // 프로토콜 변경 시 포트 자동 설정
  const handleProtocolChange = (newProtocol: DeviceProtocol) => {
    setValue('protocol', newProtocol);
    setValue('port', DEFAULT_PORTS[newProtocol]);
  };

  // 연결 테스트
  const handleTestConnection = async () => {
    const formData = watch();

    if (!formData.hostname || !formData.ip || !formData.credentials.username) {
      return;
    }

    setTestStatus('testing');
    setTestResult(null);

    try {
      const result = await deviceService.testConnection({
        hostname: formData.hostname,
        ip: formData.ip,
        port: formData.port,
        protocol: formData.protocol,
        credentials: formData.credentials,
        location: formData.location,
        description: formData.description,
        groupId: formData.groupId,
      });

      setTestResult(result);

      if (result.success) {
        setTestStatus('success');

        // 자동 감지된 정보 적용
        if (result.deviceInfo) {
          if (result.deviceInfo.manufacturer) {
            setValue('manufacturer', result.deviceInfo.manufacturer as DeviceManufacturer);
          }
          if (result.deviceInfo.model) {
            setValue('model', result.deviceInfo.model);
          }
        }
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      setTestStatus('error');
      setTestResult({
        success: false,
        message: '연결 테스트에 실패했습니다.',
      });
    }
  };

  // 디바이스 추가
  const onSubmit = async (data: AddDeviceRequest) => {
    setIsSubmitting(true);

    try {
      await deviceService.addDevice(data);
      onSuccess();
      handleClose();
    } catch (error: any) {
      alert(error.message || '디바이스 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    reset();
    setTestStatus('idle');
    setTestResult(null);
    setShowPassword(false);
    setShowEnablePassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            디바이스 추가
          </h2>
          <Button
            onClick={handleClose}
            variant="icon"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              기본 정보
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 호스트명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  호스트명 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('hostname')}
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent',
                    errors.hostname
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="device-01"
                />
                {errors.hostname && (
                  <p className="mt-1 text-sm text-red-500">{errors.hostname.message}</p>
                )}
              </div>

              {/* IP 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  IP 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('ip')}
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent',
                    errors.ip
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="192.168.1.100"
                />
                {errors.ip && (
                  <p className="mt-1 text-sm text-red-500">{errors.ip.message}</p>
                )}
              </div>

              {/* 프로토콜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  프로토콜 <span className="text-red-500">*</span>
                </label>
                <select
                  value={protocol}
                  onChange={(e) =>
                    handleProtocolChange(e.target.value as DeviceProtocol)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {PROTOCOL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 포트 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  포트 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('port', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="65535"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent',
                    errors.port
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                />
                {errors.port && (
                  <p className="mt-1 text-sm text-red-500">{errors.port.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* 자격증명 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              자격증명
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 사용자명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  사용자명 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('credentials.username')}
                  type="text"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent',
                    errors.credentials?.username
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="admin"
                />
                {errors.credentials?.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.credentials.username.message}
                  </p>
                )}
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('credentials.password')}
                    type={showPassword ? 'text' : 'password'}
                    className={cn(
                      'w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent',
                      errors.credentials?.password
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.credentials?.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.credentials.password.message}
                  </p>
                )}
              </div>

              {/* Enable 비밀번호 (Cisco 전용) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Enable 비밀번호 (선택사항, Cisco 장비)
                </label>
                <div className="relative">
                  <input
                    {...register('credentials.enablePassword')}
                    type={showEnablePassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowEnablePassword(!showEnablePassword)}
                    variant="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showEnablePassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 연결 테스트 */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              loading={testStatus === 'testing'}
              variant="secondary"
              fullWidth
              leftIcon={testStatus !== 'testing' ? <Wifi className="w-5 h-5" /> : undefined}
            >
              {testStatus === 'testing' ? '연결 테스트 중...' : '연결 테스트'}
            </Button>

            {testResult && (
              <div
                className={cn(
                  'p-3 rounded-lg flex items-start gap-2',
                  testResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                )}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{testResult.message}</p>
                  {testResult.latency && (
                    <p className="text-sm mt-1">지연시간: {testResult.latency}ms</p>
                  )}
                  {testResult.deviceInfo && (
                    <div className="text-sm mt-2 space-y-1">
                      {testResult.deviceInfo.manufacturer && (
                        <p>제조사: {testResult.deviceInfo.manufacturer}</p>
                      )}
                      {testResult.deviceInfo.model && (
                        <p>모델: {testResult.deviceInfo.model}</p>
                      )}
                      {testResult.deviceInfo.firmwareVersion && (
                        <p>펌웨어: {testResult.deviceInfo.firmwareVersion}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 추가 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              추가 정보
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 제조사 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  제조사
                </label>
                <select
                  {...register('manufacturer')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">자동 감지</option>
                  {MANUFACTURER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 모델 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  모델
                </label>
                <input
                  {...register('model')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="자동 감지"
                />
              </div>

              {/* 위치 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  위치
                </label>
                <input
                  {...register('location')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="서울 본사 3층"
                />
              </div>

              {/* 그룹 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  그룹
                </label>
                <select
                  {...register('groupId')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">그룹 없음</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 설명 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  설명
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="디바이스에 대한 설명을 입력하세요..."
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              variant="primary"
              className="flex-1"
            >
              {isSubmitting ? '추가 중...' : '디바이스 추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
