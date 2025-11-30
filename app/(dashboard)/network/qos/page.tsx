'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Zap } from 'lucide-react';
import {
  QoSPolicyTable,
  CreateQoSPolicyModal,
  EditQoSPolicyModal,
  DeleteQoSPolicyModal,
} from '@/components/qos';
import type {
  QoSPolicy,
  QoSStatus,
  QoSPriority,
  CreateQoSPolicyInput,
  UpdateQoSPolicyInput,
  QoSPolicyFilters,
} from '@/types/qos';
import { Button } from '@/components/common';

// 임시 목업 데이터 (실제로는 API나 Zustand store에서 가져옴)
const mockPolicies: QoSPolicy[] = [
  {
    id: '1',
    name: 'High Priority Traffic',
    description: '높은 우선순위가 필요한 트래픽 정책',
    priority: 'high',
    status: 'active',
    trafficClasses: [
      { id: 'tc1', name: 'Critical Apps', priority: 1, dscpValue: 46, order: 0 },
      { id: 'tc2', name: 'Voice', priority: 2, dscpValue: 40, order: 1 },
    ],
    bandwidthAllocations: [],
    priorityQueues: [],
    dscpMarkings: [],
    appliedDevices: ['device1', 'device2'],
    appliedPorts: ['port1'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user1',
  },
  {
    id: '2',
    name: 'Video Streaming',
    description: '비디오 스트리밍 트래픽 최적화',
    priority: 'medium',
    status: 'active',
    trafficClasses: [{ id: 'tc3', name: 'Video', priority: 3, dscpValue: 34, order: 0 }],
    bandwidthAllocations: [],
    priorityQueues: [],
    dscpMarkings: [],
    appliedDevices: ['device1'],
    appliedPorts: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Background Data',
    description: '백그라운드 데이터 전송',
    priority: 'low',
    status: 'active',
    trafficClasses: [{ id: 'tc4', name: 'Bulk Transfer', priority: 7, dscpValue: 10, order: 0 }],
    bandwidthAllocations: [],
    priorityQueues: [],
    dscpMarkings: [],
    appliedDevices: ['device2', 'device3'],
    appliedPorts: ['port2', 'port3'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'VoIP Traffic',
    description: 'VoIP 통화 품질 보장',
    priority: 'high',
    status: 'active',
    trafficClasses: [{ id: 'tc5', name: 'VoIP', priority: 1, dscpValue: 46, order: 0 }],
    bandwidthAllocations: [],
    priorityQueues: [],
    dscpMarkings: [],
    appliedDevices: ['device1', 'device3'],
    appliedPorts: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'File Transfer',
    description: '파일 전송 정책',
    priority: 'medium',
    status: 'inactive',
    trafficClasses: [{ id: 'tc6', name: 'FTP', priority: 5, dscpValue: 18, order: 0 }],
    bandwidthAllocations: [],
    priorityQueues: [],
    dscpMarkings: [],
    appliedDevices: [],
    appliedPorts: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function QoSPage() {
  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<QoSPolicyFilters>({
    status: 'all',
    priority: 'all',
    search: '',
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // 선택 상태
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<QoSPolicy | null>(null);

  // 정책 목록 (실제로는 API나 Zustand store에서 가져옴)
  const [policies, setPolicies] = useState<QoSPolicy[]>(mockPolicies);

  // 필터링된 정책 목록
  const filteredPolicies = useMemo(() => {
    let result = [...policies];

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (policy) =>
          policy.name.toLowerCase().includes(query) ||
          policy.description?.toLowerCase().includes(query)
      );
    }

    // 상태 필터
    if (filters.status && filters.status !== 'all') {
      result = result.filter((policy) => policy.status === filters.status);
    }

    // 우선순위 필터
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter((policy) => policy.priority === filters.priority);
    }

    return result;
  }, [policies, searchQuery, filters]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = policies.length;
    const active = policies.filter((p) => p.status === 'active').length;
    const highPriority = policies.filter(
      (p) => p.priority === 'high' || p.priority === 'critical'
    ).length;
    const totalDevices = new Set(policies.flatMap((p) => p.appliedDevices)).size;

    return { total, active, highPriority, totalDevices };
  }, [policies]);

  // 선택 핸들러
  const handlePolicySelect = (id: string) => {
    setSelectedPolicies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPolicies.size === filteredPolicies.length) {
      setSelectedPolicies(new Set());
    } else {
      setSelectedPolicies(new Set(filteredPolicies.map((p) => p.id)));
    }
  };

  // 정책 클릭 핸들러 (상세 페이지로 이동 등)
  const handlePolicyClick = (policy: QoSPolicy) => {
    console.log('Policy clicked:', policy);
    // 실제로는 router.push로 상세 페이지로 이동
  };

  // CRUD 핸들러
  const handleCreatePolicy = async (data: CreateQoSPolicyInput) => {
    // 실제로는 API 호출
    const newPolicy: QoSPolicy = {
      id: `policy-${Date.now()}`,
      name: data.name,
      description: data.description,
      priority: data.priority,
      status: 'draft',
      trafficClasses: data.trafficClasses.map((tc, index) => ({
        id: tc.id || `tc-${Date.now()}-${index}`,
        name: tc.name,
        priority: tc.priority as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
        dscpValue: tc.dscpValue,
        description: tc.description,
        order: tc.order,
      })),
      bandwidthAllocations: data.bandwidthAllocations,
      priorityQueues: data.priorityQueues,
      dscpMarkings: data.dscpMarkings.map((dm, index) => ({
        ...dm,
        id: dm.id || `dm-${Date.now()}-${index}`,
      })),
      appliedDevices: [],
      appliedPorts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPolicies((prev) => [...prev, newPolicy]);
  };

  const handleEditPolicy = (policy: QoSPolicy) => {
    setSelectedPolicy(policy);
    setIsEditModalOpen(true);
  };

  const handleUpdatePolicy = async (id: string, data: UpdateQoSPolicyInput) => {
    // 실제로는 API 호출
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updated: QoSPolicy = {
          ...p,
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.trafficClasses !== undefined && {
            trafficClasses: data.trafficClasses.map((tc, index) => ({
              id: tc.id || `tc-${Date.now()}-${index}`,
              name: tc.name,
              priority: tc.priority as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
              dscpValue: tc.dscpValue,
              description: tc.description,
              order: tc.order,
            })),
          }),
          ...(data.bandwidthAllocations !== undefined && {
            bandwidthAllocations: data.bandwidthAllocations,
          }),
          ...(data.priorityQueues !== undefined && { priorityQueues: data.priorityQueues }),
          ...(data.dscpMarkings !== undefined && {
            dscpMarkings: data.dscpMarkings.map((dm, index) => ({
              ...dm,
              id: dm.id || `dm-${Date.now()}-${index}`,
            })),
          }),
          updatedAt: new Date().toISOString(),
        };

        return updated;
      })
    );
  };

  const handleDeletePolicy = (policy: QoSPolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPolicy) return;

    // 실제로는 API 호출
    setPolicies((prev) => prev.filter((p) => p.id !== selectedPolicy.id));
    setIsDeleteModalOpen(false);
    setSelectedPolicy(null);
  };

  const handleApplyPolicy = async (policy: QoSPolicy) => {
    console.log('Apply policy:', policy);
    // 실제로는 디바이스/포트 선택 모달 표시 후 API 호출
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QoS 정책</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            네트워크 트래픽 품질 관리 정책을 설정합니다
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          정책 추가
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">전체 정책</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">활성 정책</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">적용된 디바이스</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalDevices}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">우선순위 높음</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.highPriority}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-error" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="정책 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200 transition-colors"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">필터</span>
            </button>

            {/* Filter dropdown */}
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-4 space-y-4 z-10">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    상태
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value as QoSStatus | 'all',
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
                  >
                    <option value="all">전체</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="draft">초안</option>
                    <option value="error">오류</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    우선순위
                  </label>
                  <select
                    value={filters.priority || 'all'}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priority: e.target.value as QoSPriority | 'all',
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
                  >
                    <option value="all">전체</option>
                    <option value="low">낮음</option>
                    <option value="medium">중간</option>
                    <option value="high">높음</option>
                    <option value="critical">긴급</option>
                  </select>
                </div>

                <Button
                  onClick={() => {
                    setFilters({ status: 'all', priority: 'all', search: '' });
                    setSearchQuery('');
                  }}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">QoS 목록</h2>
        </div>
        {/* QoS Policies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <QoSPolicyTable
            policies={filteredPolicies}
            selectedPolicies={selectedPolicies}
            onPolicySelect={handlePolicySelect}
            onSelectAll={handleSelectAll}
            onPolicyClick={handlePolicyClick}
            onEditPolicy={handleEditPolicy}
            onDeletePolicy={handleDeletePolicy}
            onApplyPolicy={handleApplyPolicy}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateQoSPolicyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePolicy}
      />

      <EditQoSPolicyModal
        isOpen={isEditModalOpen}
        policy={selectedPolicy}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPolicy(null);
        }}
        onSubmit={handleUpdatePolicy}
      />

      <DeleteQoSPolicyModal
        isOpen={isDeleteModalOpen}
        policy={selectedPolicy}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPolicy(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
