'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TopologyData, NetworkNode, NetworkLink } from '@/types/topology';
import { generateMockTopologyData, updateTopologyData } from '@/lib/mockTopologyData';

// NetworkTopology를 동적 import로 변경 (무거운 cytoscape 라이브러리 포함)
const NetworkTopology = dynamic(
  () => import('@/components/monitoring/NetworkTopology').then(mod => ({ default: mod.NetworkTopology })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">네트워크 토폴로지 로딩 중...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);
import {
  Activity,
  AlertCircle,
  Server,
  Wifi,
  Globe,
  Shield,
  Cpu,
  HardDrive,
  BarChart3,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';

export default function MonitoringPage() {
  const [topologyData, setTopologyData] = useState<TopologyData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<NetworkLink | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 초기 데이터 로드
  useEffect(() => {
    const initialData = generateMockTopologyData();
    setTopologyData(initialData);
  }, []);

  // 자동 새로고침
  useEffect(() => {
    if (!isAutoRefresh || !topologyData) return;

    const interval = setInterval(() => {
      setTopologyData(prevData => {
        if (!prevData) return null;
        return updateTopologyData(prevData);
      });
      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, topologyData]);

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const handleLinkClick = (link: NetworkLink) => {
    setSelectedLink(link);
    setSelectedNode(null);
  };

  const handleManualRefresh = () => {
    if (topologyData) {
      setTopologyData(updateTopologyData(topologyData));
      setLastUpdated(new Date());
    }
  };

  // 통계 계산
  const calculateStats = () => {
    if (!topologyData) {
      return {
        totalNodes: 0,
        activeNodes: 0,
        warningNodes: 0,
        errorNodes: 0,
        totalLinks: 0,
        activeLinks: 0,
        congestedLinks: 0,
        downLinks: 0,
        avgUtilization: 0,
        avgLatency: 0,
      };
    }

    const stats = {
      totalNodes: topologyData.nodes.length,
      activeNodes: topologyData.nodes.filter(n => n.status === 'active').length,
      warningNodes: topologyData.nodes.filter(n => n.status === 'warning').length,
      errorNodes: topologyData.nodes.filter(n => n.status === 'error').length,
      totalLinks: topologyData.links.length,
      activeLinks: topologyData.links.filter(l => l.status === 'active').length,
      congestedLinks: topologyData.links.filter(l => l.status === 'congested').length,
      downLinks: topologyData.links.filter(l => l.status === 'down').length,
      avgUtilization: topologyData.links.reduce((sum, link) => sum + link.utilization, 0) / topologyData.links.length,
      avgLatency: topologyData.links
        .filter(l => l.latency !== undefined && l.latency < 999)
        .reduce((sum, link, _, arr) => sum + (link.latency || 0) / arr.length, 0),
    };

    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              네트워크 토폴로지 모니터링
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              실시간 네트워크 상태 및 트래픽 분석
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>마지막 업데이트: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <Button
              onClick={handleManualRefresh}
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              새로고침
            </Button>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  자동 새로고침 ({refreshInterval}초)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="px-6 py-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* 노드 통계 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Server className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500">노드</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalNodes}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-green-600 dark:text-green-500">{stats.activeNodes} 활성</span>
              {stats.warningNodes > 0 && (
                <span className="text-yellow-600 dark:text-yellow-500">{stats.warningNodes} 경고</span>
              )}
              {stats.errorNodes > 0 && (
                <span className="text-red-600 dark:text-red-500">{stats.errorNodes} 오류</span>
              )}
            </div>
          </div>

          {/* 링크 통계 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500">링크</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalLinks}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-green-600 dark:text-green-500">{stats.activeLinks} 활성</span>
              {stats.congestedLinks > 0 && (
                <span className="text-yellow-600 dark:text-yellow-500">{stats.congestedLinks} 혼잡</span>
              )}
              {stats.downLinks > 0 && (
                <span className="text-red-600 dark:text-red-500">{stats.downLinks} 다운</span>
              )}
            </div>
          </div>

          {/* 평균 사용률 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500">평균 사용률</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgUtilization.toFixed(1)}%
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    stats.avgUtilization < 50 ? "bg-green-500" :
                    stats.avgUtilization < 75 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(stats.avgUtilization, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 평균 지연 시간 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500">평균 지연</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgLatency.toFixed(1)}ms
            </div>
            <div className="text-xs mt-1">
              {stats.avgLatency < 5 ? (
                <span className="text-green-600 dark:text-green-500">양호</span>
              ) : stats.avgLatency < 10 ? (
                <span className="text-yellow-600 dark:text-yellow-500">보통</span>
              ) : (
                <span className="text-red-600 dark:text-red-500">높음</span>
              )}
            </div>
          </div>

          {/* 스위치 수 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500">스위치</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {topologyData?.nodes.filter(n => n.type === 'switch').length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Spine / Leaf
            </div>
          </div>

          {/* 그룹 수 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500">그룹</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {topologyData?.nodes.filter(n => n.type === 'group').length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              엔드포인트 그룹
            </div>
          </div>
        </div>
      </div>

      {/* 토폴로지 맵 */}
      <div className="flex-1 relative overflow-hidden">
        {topologyData ? (
          <NetworkTopology
            data={topologyData}
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Cpu className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500 dark:text-gray-400">토폴로지 데이터를 로드하는 중...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
