'use client';

import { useState, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Layers, Network } from 'lucide-react';
import { NetworkTopology } from '@/components/monitoring/NetworkTopology';
import { D3Topology } from '@/components/monitoring/D3Topology';
import { TreeTopology } from '@/components/monitoring/TreeTopology';
import { VisTopology } from '@/components/monitoring/VisTopology';
import { ForceGraphTopology } from '@/components/monitoring/ForceGraphTopology';
import { ReactFlowTopology } from '@/components/monitoring/ReactFlowTopology';
import { generateMockTopologyData } from '@/lib/mockTopologyData';
import { TopologyViewMode } from '@/types/topology';

export default function TopologyPage() {
  const [activeTab, setActiveTab] = useState('cytoscape');
  const [viewMode, setViewMode] = useState<TopologyViewMode>('physical');
  const mockTopologyData = useMemo(() => generateMockTopologyData(), []);

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              토폴로지
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              네트워크 토폴로지를 시각화하고 관리합니다
            </p>
          </div>

          {/* 뷰 모드 선택 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">뷰 모드:</span>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('physical')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'physical'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                물리적
              </button>
              <button
                onClick={() => setViewMode('logical')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'logical'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Network className="w-4 h-4" />
                논리적
              </button>
            </div>
          </div>
        </div>

        {/* 뷰 모드 설명 */}
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          {viewMode === 'physical' ? (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>물리적 뷰:</strong> 네트워크 장비의 실제 계층 구조와 물리적 연결을 보여줍니다.
              Spine → Leaf → Group 순으로 계층화된 레이아웃으로 표시됩니다.
            </p>
          ) : (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>논리적 뷰:</strong> VLAN을 기준으로 네트워크를 논리적으로 그룹화하여 보여줍니다.
              동일한 VLAN에 속한 장비들이 같은 색상으로 표시됩니다.
            </p>
          )}
        </div>
      </div>

      {/* 탭 컨테이너 */}
      <div className="flex-1 p-6 overflow-hidden">
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          {/* 탭 목록 */}
          <Tabs.List className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
            <Tabs.Trigger
              value="cytoscape"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cytoscape.js
            </Tabs.Trigger>
            <Tabs.Trigger
              value="d3"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              D3.js
            </Tabs.Trigger>
            <Tabs.Trigger
              value="tree"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Tree.js
            </Tabs.Trigger>
            <Tabs.Trigger
              value="vis"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              vis.js
            </Tabs.Trigger>
            <Tabs.Trigger
              value="force-graph"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              react-force-graph
            </Tabs.Trigger>
            <Tabs.Trigger
              value="reactflow"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ReactFlow (VxLAN/VLAN)
            </Tabs.Trigger>
          </Tabs.List>

          {/* Cytoscape.js 탭 */}
          <Tabs.Content
            value="cytoscape"
            className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <NetworkTopology
              data={mockTopologyData}
              className="h-full"
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </Tabs.Content>

          {/* D3.js 탭 */}
          <Tabs.Content
            value="d3"
            className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <D3Topology
              data={mockTopologyData}
              className="h-full"
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </Tabs.Content>

          {/* Tree.js 탭 */}
          <Tabs.Content
            value="tree"
            className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <TreeTopology
              data={mockTopologyData}
              className="h-full"
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </Tabs.Content>

          {/* vis.js 탭 */}
          <Tabs.Content
            value="vis"
            className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <VisTopology
              data={mockTopologyData}
              className="h-full"
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </Tabs.Content>

          {/* react-force-graph 탭 */}
          <Tabs.Content
            value="force-graph"
            className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <ForceGraphTopology
              data={mockTopologyData}
              className="h-full"
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </Tabs.Content>

          {/* ReactFlow 탭 (VxLAN/VLAN 인터랙티브 에디터) */}
          <Tabs.Content
            value="reactflow"
            className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <ReactFlowTopology className="h-full" />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
