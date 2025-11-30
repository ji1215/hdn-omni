'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCw, Database } from 'lucide-react';
import {
  DeviceTable,
  DevicePagination,
  DeviceFilters,
  AddDeviceModal,
  DeviceInfoModal,
} from '@/components/devices';
import useDeviceStore from '@/store/deviceStore';
import type { Device } from '@/types/device';
import { Button } from '@/components/common';

export default function DevicesPage() {
  const [isDark, setIsDark] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const {
    devices,
    selectedDevices,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    filter,
    sort,
    deviceGroups,
    fetchDevices,
    fetchGroups,
    setPage,
    setPageSize,
    setFilter,
    clearFilter,
    setSort,
    toggleDeviceSelection,
    selectAllDevices,
    clearSelection,
    batchDelete,
    batchReboot,
    batchBackup,
    rebootDevice,
    backupDevice,
    upgradeDevice,
  } = useDeviceStore();

  // 다크 모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchDevices();
    fetchGroups();
  }, []);

  // 정렬 핸들러
  const handleSort = (field: keyof Device) => {
    const newOrder = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ field, order: newOrder });
  };

  // 디바이스 클릭 핸들러
  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    setIsInfoModalOpen(true);
  };

  // 디바이스 액션 핸들러
  const handleDeviceAction = async (device: Device, action: string) => {
    switch (action) {
      case 'info':
        setSelectedDevice(device);
        setIsInfoModalOpen(true);
        break;
      case 'reboot':
        if (confirm(`${device.hostname}을(를) 재시작하시겠습니까?`)) {
          const success = await rebootDevice(device.id);
          if (success) {
            alert('디바이스 재시작 명령이 전송되었습니다.');
          }
        }
        break;
      case 'backup':
        if (confirm(`${device.hostname}의 구성을 백업하시겠습니까?`)) {
          const success = await backupDevice(device.id);
          if (success) {
            alert('백업이 성공적으로 생성되었습니다.');
          }
        }
        break;
    }
  };

  // 모달 액션 핸들러
  const handleModalAction = async (action: string) => {
    if (!selectedDevice) return;

    switch (action) {
      case 'reboot':
        setIsInfoModalOpen(false);
        if (confirm(`${selectedDevice.hostname}을(를) 재시작하시겠습니까?`)) {
          const success = await rebootDevice(selectedDevice.id);
          if (success) {
            alert('디바이스 재시작 명령이 전송되었습니다.');
          }
        }
        break;
      case 'backup':
        setIsInfoModalOpen(false);
        if (confirm(`${selectedDevice.hostname}의 구성을 백업하시겠습니까?`)) {
          const success = await backupDevice(selectedDevice.id);
          if (success) {
            alert('백업이 성공적으로 생성되었습니다.');
          }
        }
        break;
      case 'upgrade':
        setIsInfoModalOpen(false);
        alert('펌웨어 업그레이드 기능은 곧 제공될 예정입니다.');
        break;
    }
  };

  // 일괄 작업 핸들러
  const handleBatchReboot = async () => {
    if (selectedDevices.size === 0) {
      alert('디바이스를 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${selectedDevices.size}개의 디바이스를 재시작하시겠습니까?`)) {
      const result = await batchReboot(Array.from(selectedDevices));
      alert(`재시작 완료: 성공 ${result.success}개, 실패 ${result.failed}개`);
      clearSelection();
    }
  };

  const handleBatchBackup = async () => {
    if (selectedDevices.size === 0) {
      alert('디바이스를 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${selectedDevices.size}개의 디바이스를 백업하시겠습니까?`)) {
      const result = await batchBackup(Array.from(selectedDevices));
      alert(`백업 완료: 성공 ${result.success}개, 실패 ${result.failed}개`);
      clearSelection();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedDevices.size === 0) {
      alert('디바이스를 선택해주세요.');
      return;
    }

    if (
      confirm(
        `선택한 ${selectedDevices.size}개의 디바이스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      const success = await batchDelete(Array.from(selectedDevices));
      if (success) {
        alert('선택한 디바이스가 삭제되었습니다.');
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">디바이스 관리</h1>
          <p className="text-gray-600 dark:text-gray-400">
            네트워크 디바이스를 관리하고 모니터링합니다.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-5 h-5" />}
          className="shadow-lg shadow-primary/30"
        >
          디바이스 추가
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* 필터 */}
      <DeviceFilters
        filter={filter}
        onFilterChange={setFilter}
        onClearFilters={clearFilter}
        isDark={isDark}
      />

      {/* 일괄 작업 바 */}
      {selectedDevices.size > 0 && (
        <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectedDevices.size}개 디바이스 선택됨
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleBatchReboot}
                variant="ghost"
                size="sm"
                leftIcon={<RotateCw className="w-4 h-4" />}
                className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
              >
                일괄 재시작
              </Button>
              <Button
                onClick={handleBatchBackup}
                variant="ghost"
                size="sm"
                leftIcon={<Database className="w-4 h-4" />}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                일괄 백업
              </Button>
              <Button
                onClick={handleBatchDelete}
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                일괄 삭제
              </Button>
              <Button onClick={clearSelection} variant="secondary" size="sm">
                선택 취소
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">디바이스 목록</h2>
        </div>
        {/* 테이블 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <DeviceTable
            devices={devices}
            selectedDevices={selectedDevices}
            onDeviceSelect={toggleDeviceSelection}
            onSelectAll={selectAllDevices}
            onDeviceClick={handleDeviceClick}
            onDeviceAction={handleDeviceAction}
            loading={loading}
            isDark={isDark}
            onBatchReboot={handleBatchReboot}
            onBatchBackup={handleBatchBackup}
            onBatchDelete={handleBatchDelete}
            clearSelection={clearSelection}
          />
        </div>
      </div>

      {/* 디바이스 추가 모달 */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchDevices();
          setIsAddModalOpen(false);
        }}
        groups={deviceGroups}
        isDark={isDark}
      />

      {/* 디바이스 정보 모달 */}
      <DeviceInfoModal
        device={selectedDevice}
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedDevice(null);
        }}
        onAction={handleModalAction}
        isDark={isDark}
      />
    </div>
  );
}
