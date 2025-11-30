'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPorts, fetchPortStats, updatePort, bulkUpdatePorts } from '@/services/portService';
import { Port } from '@/types/port';
import { useState, useEffect } from 'react';

/**
 * 포트 목록 조회를 위한 커스텀 훅
 * 필터링, 검색 기능을 지원합니다.
 */
export function usePorts(
  filters?: {
    status?: string;
    speed?: string;
    search?: string;
  }
) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters?.search || '');

  // 검색어 디바운싱 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters?.search || '');
    }, 300);

    return () => clearTimeout(timer);
  }, [filters?.search]);

  const queryKey = ['ports', filters?.status, filters?.speed, debouncedSearch];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const allPorts = await fetchPorts();

      // 필터링 적용
      let filteredPorts = [...allPorts];

      if (filters?.status && filters.status !== 'all') {
        filteredPorts = filteredPorts.filter((port) => port.status === filters.status);
      }

      if (filters?.speed && filters.speed !== 'all') {
        filteredPorts = filteredPorts.filter((port) => port.speed === filters.speed);
      }

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filteredPorts = filteredPorts.filter(
          (port) =>
            port.name.toLowerCase().includes(searchLower) ||
            port.deviceName.toLowerCase().includes(searchLower) ||
            port.description?.toLowerCase().includes(searchLower)
        );
      }

      return filteredPorts;
    },
    placeholderData: (previousData) => previousData,
    refetchInterval: 5000, // 5초마다 자동 갱신 (실시간 트래픽 통계)
  });
}

/**
 * 포트 통계 조회를 위한 훅
 */
export function usePortStats() {
  return useQuery({
    queryKey: ['port-stats'],
    queryFn: fetchPortStats,
    refetchInterval: 5000, // 5초마다 자동 갱신
  });
}

/**
 * 포트 구성 업데이트를 위한 뮤테이션 훅
 */
export function useUpdatePort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Port> }) => {
      return await updatePort(id, updates);
    },
    onSuccess: () => {
      // 포트 목록 및 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      queryClient.invalidateQueries({ queryKey: ['port-stats'] });
    },
  });
}

/**
 * 일괄 포트 업데이트를 위한 뮤테이션 훅
 */
export function useBulkUpdatePorts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ portIds, updates }: { portIds: string[]; updates: Partial<Port> }) => {
      return await bulkUpdatePorts(portIds, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      queryClient.invalidateQueries({ queryKey: ['port-stats'] });
    },
  });
}
