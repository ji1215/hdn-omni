'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';
import { NetworkNode, NetworkLink, DeviceRole, VxlanTunnel } from '@/types/topology';

// VLAN 색상 매핑
const VLAN_OPTIONS = [
  { value: 100, label: 'VLAN 100', color: '#EF4444' },
  { value: 200, label: 'VLAN 200', color: '#F97316' },
  { value: 300, label: 'VLAN 300', color: '#22C55E' },
  { value: 400, label: 'VLAN 400', color: '#8B5CF6' },
];

interface NodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: Partial<NetworkNode>) => void;
  node?: NetworkNode | null;
  mode: 'add' | 'edit';
  defaultType?: NetworkNode['type'];
}

export function NodeEditorModal({
  isOpen,
  onClose,
  onSave,
  node,
  mode,
  defaultType = 'switch',
}: NodeEditorModalProps) {
  const [formData, setFormData] = useState<Partial<NetworkNode>>({
    type: defaultType,
    label: '',
    status: 'active',
    role: undefined,
    ip: '',
    vlan: undefined,
    vxlanVni: undefined,
    vtepIp: '',
    bandwidth: 10000,
  });

  useEffect(() => {
    if (node && mode === 'edit') {
      setFormData({
        type: node.type,
        label: node.label,
        status: node.status,
        role: node.role,
        ip: node.ip || '',
        vlan: node.vlan,
        vxlanVni: node.vxlanVni,
        vtepIp: node.vtepIp || '',
        bandwidth: node.bandwidth || 10000,
      });
    } else {
      setFormData({
        type: defaultType,
        label: '',
        status: 'active',
        role: undefined,
        ip: '',
        vlan: undefined,
        vxlanVni: undefined,
        vtepIp: '',
        bandwidth: 10000,
      });
    }
  }, [node, mode, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const roleOptions: { value: DeviceRole | ''; label: string }[] = [
    { value: '', label: '선택 안함' },
    { value: 'spine', label: 'Spine' },
    { value: 'leaf', label: 'Leaf' },
    { value: 'access', label: 'Access' },
    { value: 'core', label: 'Core' },
    { value: 'aggregation', label: 'Aggregation' },
    { value: 'edge', label: 'Edge' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? '노드 추가' : '노드 편집'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              타입
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NetworkNode['type'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="switch">스위치</option>
              <option value="router">라우터</option>
              <option value="host">호스트</option>
              <option value="controller">컨트롤러</option>
              <option value="firewall">방화벽</option>
              <option value="vtep">VTEP</option>
              <option value="group">그룹</option>
            </select>
          </div>

          {/* 라벨 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이름
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="노드 이름"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as NetworkNode['status'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* 역할 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              역할
            </label>
            <select
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as DeviceRole || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* IP 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              IP 주소
            </label>
            <input
              type="text"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              placeholder="192.168.1.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* VLAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              VLAN
            </label>
            <select
              value={formData.vlan || ''}
              onChange={(e) => setFormData({ ...formData, vlan: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택 안함</option>
              {VLAN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* VxLAN VNI (VTEP 타입일 때만) */}
          {formData.type === 'vtep' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VxLAN VNI
                </label>
                <input
                  type="number"
                  value={formData.vxlanVni || ''}
                  onChange={(e) => setFormData({ ...formData, vxlanVni: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VTEP IP
                </label>
                <input
                  type="text"
                  value={formData.vtepIp}
                  onChange={(e) => setFormData({ ...formData, vtepIp: e.target.value })}
                  placeholder="10.0.0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              취소
            </Button>
            <Button variant="primary" type="submit">
              {mode === 'add' ? '추가' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LinkEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Partial<NetworkLink>) => void;
  link?: NetworkLink | null;
  mode: 'add' | 'edit';
  sourceNodeId?: string;
  targetNodeId?: string;
  nodes: NetworkNode[];
}

export function LinkEditorModal({
  isOpen,
  onClose,
  onSave,
  link,
  mode,
  sourceNodeId,
  targetNodeId,
  nodes,
}: LinkEditorModalProps) {
  const [formData, setFormData] = useState<Partial<NetworkLink>>({
    source: sourceNodeId || '',
    target: targetNodeId || '',
    bandwidth: 10000,
    utilization: 0,
    status: 'active',
    type: 'ethernet',
    isVxlanTunnel: false,
    vxlanVni: undefined,
  });

  useEffect(() => {
    if (link && mode === 'edit') {
      setFormData({
        source: link.source,
        target: link.target,
        bandwidth: link.bandwidth,
        utilization: link.utilization,
        status: link.status,
        type: link.type,
        isVxlanTunnel: link.isVxlanTunnel,
        vxlanVni: link.vxlanVni,
      });
    } else {
      setFormData({
        source: sourceNodeId || '',
        target: targetNodeId || '',
        bandwidth: 10000,
        utilization: 0,
        status: 'active',
        type: 'ethernet',
        isVxlanTunnel: false,
        vxlanVni: undefined,
      });
    }
  }, [link, mode, sourceNodeId, targetNodeId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? '연결 추가' : '연결 편집'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 소스 노드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              소스 노드
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label} ({node.type})
                </option>
              ))}
            </select>
          </div>

          {/* 타겟 노드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              타겟 노드
            </label>
            <select
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {nodes.filter((n) => n.id !== formData.source).map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label} ({node.type})
                </option>
              ))}
            </select>
          </div>

          {/* 연결 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              연결 타입
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NetworkLink['type'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ethernet">Ethernet</option>
              <option value="optical">Optical</option>
              <option value="wireless">Wireless</option>
              <option value="vxlan">VxLAN Tunnel</option>
            </select>
          </div>

          {/* VxLAN 옵션 */}
          {formData.type === 'vxlan' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                VxLAN VNI
              </label>
              <input
                type="number"
                value={formData.vxlanVni || ''}
                onChange={(e) => setFormData({ ...formData, vxlanVni: e.target.value ? Number(e.target.value) : undefined, isVxlanTunnel: true })}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* 대역폭 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              대역폭 (Mbps)
            </label>
            <select
              value={formData.bandwidth}
              onChange={(e) => setFormData({ ...formData, bandwidth: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={100}>100 Mbps</option>
              <option value={1000}>1 Gbps</option>
              <option value={10000}>10 Gbps</option>
              <option value={25000}>25 Gbps</option>
              <option value={40000}>40 Gbps</option>
              <option value={100000}>100 Gbps</option>
            </select>
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as NetworkLink['status'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="congested">Congested</option>
              <option value="down">Down</option>
            </select>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              취소
            </Button>
            <Button variant="primary" type="submit">
              {mode === 'add' ? '추가' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface VxlanTunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tunnel: Partial<VxlanTunnel>) => void;
  tunnel?: VxlanTunnel | null;
  mode: 'add' | 'edit';
  nodes: NetworkNode[];
}

export function VxlanTunnelModal({
  isOpen,
  onClose,
  onSave,
  tunnel,
  mode,
  nodes,
}: VxlanTunnelModalProps) {
  const [formData, setFormData] = useState<Partial<VxlanTunnel>>({
    vni: 10000,
    sourceVtep: '',
    destVtep: '',
    sourceNodeId: '',
    destNodeId: '',
    status: 'active',
    encapsulation: 'vxlan',
    mtu: 1450,
  });

  useEffect(() => {
    if (tunnel && mode === 'edit') {
      setFormData({
        vni: tunnel.vni,
        sourceVtep: tunnel.sourceVtep,
        destVtep: tunnel.destVtep,
        sourceNodeId: tunnel.sourceNodeId,
        destNodeId: tunnel.destNodeId,
        status: tunnel.status,
        encapsulation: tunnel.encapsulation,
        mtu: tunnel.mtu,
      });
    } else {
      setFormData({
        vni: 10000,
        sourceVtep: '',
        destVtep: '',
        sourceNodeId: '',
        destNodeId: '',
        status: 'active',
        encapsulation: 'vxlan',
        mtu: 1450,
      });
    }
  }, [tunnel, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const vtepNodes = nodes.filter((n) => n.type === 'vtep' || n.vtepIp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? 'VxLAN 터널 추가' : 'VxLAN 터널 편집'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* VNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              VNI (VXLAN Network Identifier)
            </label>
            <input
              type="number"
              value={formData.vni}
              onChange={(e) => setFormData({ ...formData, vni: Number(e.target.value) })}
              placeholder="10000"
              min={1}
              max={16777215}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 소스 VTEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              소스 VTEP
            </label>
            <select
              value={formData.sourceNodeId}
              onChange={(e) => {
                const node = nodes.find((n) => n.id === e.target.value);
                setFormData({
                  ...formData,
                  sourceNodeId: e.target.value,
                  sourceVtep: node?.vtepIp || node?.ip || '',
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {vtepNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label} ({node.vtepIp || node.ip})
                </option>
              ))}
            </select>
          </div>

          {/* 목적지 VTEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              목적지 VTEP
            </label>
            <select
              value={formData.destNodeId}
              onChange={(e) => {
                const node = nodes.find((n) => n.id === e.target.value);
                setFormData({
                  ...formData,
                  destNodeId: e.target.value,
                  destVtep: node?.vtepIp || node?.ip || '',
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {vtepNodes.filter((n) => n.id !== formData.sourceNodeId).map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label} ({node.vtepIp || node.ip})
                </option>
              ))}
            </select>
          </div>

          {/* Encapsulation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              캡슐화 방식
            </label>
            <select
              value={formData.encapsulation}
              onChange={(e) => setFormData({ ...formData, encapsulation: e.target.value as VxlanTunnel['encapsulation'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="vxlan">VXLAN</option>
              <option value="vxlan-gpe">VXLAN-GPE</option>
            </select>
          </div>

          {/* MTU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MTU
            </label>
            <input
              type="number"
              value={formData.mtu}
              onChange={(e) => setFormData({ ...formData, mtu: Number(e.target.value) })}
              placeholder="1450"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as VxlanTunnel['status'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              취소
            </Button>
            <Button variant="primary" type="submit">
              {mode === 'add' ? '추가' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
