'use client';

import { useState } from 'react';
import { PortsTable } from '@/components/network/PortsTable';
import { PortFilters } from '@/components/network/PortFilters';
import { PortDetailModal } from '@/components/network/PortDetailModal';
import { PortConfigModal, PortConfigFormData } from '@/components/network/PortConfigModal';
import { usePorts, usePortStats } from '@/hooks/usePorts';
import { Port } from '@/types/port';

export default function PortsPage() {
  const [filters, setFilters] = useState<{
    status?: string;
    speed?: string;
    search?: string;
  }>({});

  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const { data: ports = [], isLoading } = usePorts(filters);
  const { data: stats } = usePortStats();

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleFiltersChange = (newFilters: { status?: string; speed?: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleViewDetails = (port: Port) => {
    setSelectedPort(port);
    setIsDetailModalOpen(true);
  };

  const handleConfigurePort = (port: Port) => {
    setSelectedPort(port);
    setIsConfigModalOpen(true);
  };

  const handleSavePortConfig = (portId: string, config: PortConfigFormData) => {
    console.log('Saving port configuration:', { portId, config });
    // TODO: API 호출하여 포트 설정 저장
    // 예: await updatePort(portId, config);
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          포트 관리
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          네트워크 포트를 구성하고 모니터링합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            전체 포트
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.total || 0}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            활성 포트
          </h3>
          <p className="mt-2 text-3xl font-bold text-success">
            {stats?.active || 0}
          </p>
          {stats && stats.total > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {((stats.active / stats.total) * 100).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            비활성 포트
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-500 dark:text-gray-400">
            {stats?.inactive || 0}
          </p>
          {stats && stats.total > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {((stats.inactive / stats.total) * 100).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            에러 발생
          </h3>
          <p className="mt-2 text-3xl font-bold text-error">
            {stats?.errors || 0}
          </p>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="card mb-6">
        <PortFilters
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* 포트 목록 테이블 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            포트 목록
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {ports.length}개 포트 표시 중
            </span>
            {isLoading && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                실시간 업데이트
              </span>
            )}
          </div>
        </div>
        <PortsTable
          data={ports}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onConfigurePort={handleConfigurePort}
        />
      </div>

      {/* 포트 상세 모달 */}
      <PortDetailModal
        port={selectedPort}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPort(null);
        }}
      />

      {/* 포트 구성 모달 */}
      <PortConfigModal
        port={selectedPort}
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedPort(null);
        }}
        onSave={handleSavePortConfig}
      />
    </div>
  );
}
