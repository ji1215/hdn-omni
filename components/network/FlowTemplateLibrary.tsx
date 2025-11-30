'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common';
import { FlowTemplate, FlowRule } from '@/types/flow';

interface FlowTemplateLibraryProps {
  onSelect: (rule: Partial<FlowRule>) => void;
  onClose: () => void;
}

// Predefined flow templates
const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'http-allow',
    name: 'HTTP 트래픽 허용',
    description: 'HTTP (포트 80) 트래픽을 허용합니다',
    category: '기본',
    tags: ['web', 'http', 'allow'],
    rule: {
      name: 'Allow HTTP Traffic',
      description: 'HTTP 트래픽을 허용하는 기본 규칙',
      priority: 1000,
      match: {
        protocol: 'TCP',
        dstPort: 80,
      },
      actions: [{ type: 'FORWARD', outputPort: 1 }],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'inactive',
    },
  },
  {
    id: 'https-allow',
    name: 'HTTPS 트래픽 허용',
    description: 'HTTPS (포트 443) 트래픽을 허용합니다',
    category: '기본',
    tags: ['web', 'https', 'ssl', 'allow'],
    rule: {
      name: 'Allow HTTPS Traffic',
      description: 'HTTPS 트래픽을 허용하는 기본 규칙',
      priority: 1000,
      match: {
        protocol: 'TCP',
        dstPort: 443,
      },
      actions: [{ type: 'FORWARD', outputPort: 1 }],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'inactive',
    },
  },
  {
    id: 'block-icmp',
    name: 'ICMP 차단',
    description: 'ICMP (Ping) 트래픽을 차단합니다',
    category: '보안',
    tags: ['icmp', 'ping', 'block', 'security'],
    rule: {
      name: 'Block ICMP Traffic',
      description: 'ICMP 트래픽을 차단하는 보안 규칙',
      priority: 2000,
      match: {
        protocol: 'ICMP',
      },
      actions: [{ type: 'DROP' }],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'inactive',
    },
  },
  {
    id: 'vlan-100',
    name: 'VLAN 100 전달',
    description: 'VLAN 100 트래픽을 특정 포트로 전달합니다',
    category: 'VLAN',
    tags: ['vlan', 'forward'],
    rule: {
      name: 'VLAN 100 Forwarding',
      description: 'VLAN 100 트래픽 전달 규칙',
      priority: 1500,
      match: {
        vlanId: 100,
      },
      actions: [{ type: 'FORWARD', outputPort: 2 }],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'inactive',
    },
  },
  {
    id: 'qos-high',
    name: '높은 우선순위 QoS',
    description: '특정 트래픽을 우선순위 큐로 전송합니다',
    category: 'QoS',
    tags: ['qos', 'queue', 'priority'],
    rule: {
      name: 'High Priority QoS',
      description: '높은 우선순위 트래픽 QoS 규칙',
      priority: 3000,
      match: {
        protocol: 'TCP',
        dstPort: 22, // SSH
      },
      actions: [{ type: 'QUEUE', queueId: 0, outputPort: 1 }],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'inactive',
    },
  },
  {
    id: 'load-balance',
    name: '로드 밸런싱',
    description: '트래픽을 여러 포트로 분산합니다',
    category: '고급',
    tags: ['load-balance', 'distribute'],
    rule: {
      name: 'Load Balancing',
      description: '로드 밸런싱 규칙',
      priority: 1200,
      match: {
        protocol: 'TCP',
        dstPort: 80,
      },
      actions: [{ type: 'FLOOD' }],
      timeout: { hardTimeout: 300, idleTimeout: 60 },
      status: 'inactive',
    },
  },
  {
    id: 'controller-forward',
    name: '컨트롤러로 전달',
    description: '패킷을 SDN 컨트롤러로 전달합니다',
    category: '고급',
    tags: ['controller', 'sdn'],
    rule: {
      name: 'Forward to Controller',
      description: 'SDN 컨트롤러로 패킷 전달',
      priority: 500,
      match: {
        protocol: 'ANY',
      },
      actions: [{ type: 'CONTROLLER' }],
      timeout: { hardTimeout: 0, idleTimeout: 30 },
      status: 'inactive',
    },
  },
];

export function FlowTemplateLibrary({ onSelect, onClose }: FlowTemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = ['전체', ...Array.from(new Set(FLOW_TEMPLATES.map((t) => t.category)))];

  const filteredTemplates = FLOW_TEMPLATES.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === '전체' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              플로우 템플릿 라이브러리
            </h2>
            <Button
              onClick={onClose}
              variant="icon"
              size="sm"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="템플릿 검색..."
              className="input flex-1"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-40"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelect(template.rule)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTemplates.length}개의 템플릿 표시 중
          </p>
        </div>
      </div>
    </div>
  );
}
