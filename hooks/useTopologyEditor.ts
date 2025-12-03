'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  TopologyData,
  NetworkNode,
  NetworkLink,
  VxlanTunnel,
  EditorMode,
  TopologyEditorState,
} from '@/types/topology';

interface UseTopologyEditorProps {
  initialData: TopologyData;
  onDataChange?: (data: TopologyData) => void;
}

interface UseTopologyEditorReturn {
  data: TopologyData;
  editorState: TopologyEditorState;
  history: TopologyData[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  hasChanges: boolean;

  // 모드 관련
  setMode: (mode: EditorMode) => void;

  // 노드 관련
  addNode: (node: Partial<NetworkNode>, position?: { x: number; y: number }) => NetworkNode;
  updateNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;

  // 링크 관련
  addLink: (link: Partial<NetworkLink>) => void;
  updateLink: (linkId: string, updates: Partial<NetworkLink>) => void;
  deleteLink: (linkId: string) => void;
  selectLink: (linkId: string | null) => void;

  // VxLAN 터널 관련
  addVxlanTunnel: (tunnel: Partial<VxlanTunnel>) => void;
  deleteVxlanTunnel: (tunnelId: string) => void;

  // 연결 관련
  startConnection: (sourceNodeId: string) => void;
  completeConnection: (targetNodeId: string) => void;
  cancelConnection: () => void;

  // 히스토리 관련
  undo: () => void;
  redo: () => void;
  save: () => void;
  cancel: () => void;

  // 데이터 설정
  setData: (data: TopologyData) => void;
}

const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateLinkId = () => `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTunnelId = () => `tunnel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getBandwidthLabel = (bandwidth: number): string => {
  if (bandwidth >= 100000) return '100G';
  if (bandwidth >= 40000) return '40G';
  if (bandwidth >= 25000) return '25G';
  if (bandwidth >= 10000) return '10G';
  if (bandwidth >= 1000) return '1G';
  if (bandwidth >= 100) return '100M';
  return `${bandwidth}M`;
};

export function useTopologyEditor({
  initialData,
  onDataChange,
}: UseTopologyEditorProps): UseTopologyEditorReturn {
  const [data, setDataInternal] = useState<TopologyData>(initialData);
  const [originalData, setOriginalData] = useState<TopologyData>(initialData);
  const [history, setHistory] = useState<TopologyData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [editorState, setEditorState] = useState<TopologyEditorState>({
    mode: 'view',
    selectedNodeId: null,
    selectedLinkId: null,
    isEditing: false,
    pendingConnection: null,
  });

  // 히스토리에 추가
  const addToHistory = useCallback((newData: TopologyData) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newData];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // 데이터 변경
  const updateData = useCallback((newData: TopologyData) => {
    setDataInternal(newData);
    addToHistory(newData);
    onDataChange?.(newData);
  }, [addToHistory, onDataChange]);

  // 외부에서 데이터 설정
  const setData = useCallback((newData: TopologyData) => {
    setDataInternal(newData);
    setOriginalData(newData);
    setHistory([newData]);
    setHistoryIndex(0);
  }, []);

  // 모드 설정
  const setMode = useCallback((mode: EditorMode) => {
    setEditorState((prev) => ({
      ...prev,
      mode,
      pendingConnection: null,
    }));
  }, []);

  // 노드 추가
  const addNode = useCallback((nodeData: Partial<NetworkNode>, position?: { x: number; y: number }) => {
    const newNode: NetworkNode = {
      id: generateId(),
      type: nodeData.type || 'switch',
      label: nodeData.label || `New ${nodeData.type || 'Node'}`,
      status: nodeData.status || 'active',
      role: nodeData.role,
      ip: nodeData.ip,
      vlan: nodeData.vlan,
      vxlanVni: nodeData.vxlanVni,
      vtepIp: nodeData.vtepIp,
      bandwidth: nodeData.bandwidth || 10000,
      bandwidthLabel: getBandwidthLabel(nodeData.bandwidth || 10000),
      layer: nodeData.layer || 3,
      position: position || { x: Math.random() * 500, y: Math.random() * 500 },
    };

    const newData: TopologyData = {
      ...data,
      nodes: [...data.nodes, newNode],
    };

    updateData(newData);
    return newNode;
  }, [data, updateData]);

  // 노드 업데이트
  const updateNode = useCallback((nodeId: string, updates: Partial<NetworkNode>) => {
    const newData: TopologyData = {
      ...data,
      nodes: data.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              ...updates,
              bandwidthLabel: updates.bandwidth
                ? getBandwidthLabel(updates.bandwidth)
                : node.bandwidthLabel,
            }
          : node
      ),
    };

    updateData(newData);
  }, [data, updateData]);

  // 노드 삭제
  const deleteNode = useCallback((nodeId: string) => {
    const newData: TopologyData = {
      ...data,
      nodes: data.nodes.filter((node) => node.id !== nodeId),
      links: data.links.filter(
        (link) => link.source !== nodeId && link.target !== nodeId
      ),
      vxlanTunnels: data.vxlanTunnels?.filter(
        (tunnel) => tunnel.sourceNodeId !== nodeId && tunnel.destNodeId !== nodeId
      ),
    };

    updateData(newData);
    setEditorState((prev) => ({
      ...prev,
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId,
    }));
  }, [data, updateData]);

  // 노드 선택
  const selectNode = useCallback((nodeId: string | null) => {
    setEditorState((prev) => ({
      ...prev,
      selectedNodeId: nodeId,
      selectedLinkId: null,
    }));
  }, []);

  // 링크 추가
  const addLink = useCallback((linkData: Partial<NetworkLink>) => {
    if (!linkData.source || !linkData.target) return;

    // 이미 존재하는 링크인지 확인
    const existingLink = data.links.find(
      (link) =>
        (link.source === linkData.source && link.target === linkData.target) ||
        (link.source === linkData.target && link.target === linkData.source)
    );

    if (existingLink) return;

    const newLink: NetworkLink = {
      id: generateLinkId(),
      source: linkData.source,
      target: linkData.target,
      bandwidth: linkData.bandwidth || 10000,
      utilization: linkData.utilization || 0,
      status: linkData.status || 'active',
      type: linkData.type || 'ethernet',
      isVxlanTunnel: linkData.isVxlanTunnel,
      vxlanVni: linkData.vxlanVni,
    };

    const newData: TopologyData = {
      ...data,
      links: [...data.links, newLink],
    };

    updateData(newData);
    return newLink;
  }, [data, updateData]);

  // 링크 업데이트
  const updateLink = useCallback((linkId: string, updates: Partial<NetworkLink>) => {
    const newData: TopologyData = {
      ...data,
      links: data.links.map((link) =>
        link.id === linkId ? { ...link, ...updates } : link
      ),
    };

    updateData(newData);
  }, [data, updateData]);

  // 링크 삭제
  const deleteLink = useCallback((linkId: string) => {
    const newData: TopologyData = {
      ...data,
      links: data.links.filter((link) => link.id !== linkId),
    };

    updateData(newData);
    setEditorState((prev) => ({
      ...prev,
      selectedLinkId: prev.selectedLinkId === linkId ? null : prev.selectedLinkId,
    }));
  }, [data, updateData]);

  // 링크 선택
  const selectLink = useCallback((linkId: string | null) => {
    setEditorState((prev) => ({
      ...prev,
      selectedNodeId: null,
      selectedLinkId: linkId,
    }));
  }, []);

  // VxLAN 터널 추가
  const addVxlanTunnel = useCallback((tunnelData: Partial<VxlanTunnel>) => {
    if (!tunnelData.sourceNodeId || !tunnelData.destNodeId) return;

    const newTunnel: VxlanTunnel = {
      id: generateTunnelId(),
      vni: tunnelData.vni || 10000,
      sourceVtep: tunnelData.sourceVtep || '',
      destVtep: tunnelData.destVtep || '',
      sourceNodeId: tunnelData.sourceNodeId,
      destNodeId: tunnelData.destNodeId,
      status: tunnelData.status || 'active',
      encapsulation: tunnelData.encapsulation || 'vxlan',
      mtu: tunnelData.mtu || 1450,
    };

    // 터널에 해당하는 링크도 추가
    const newLink: NetworkLink = {
      id: generateLinkId(),
      source: tunnelData.sourceNodeId,
      target: tunnelData.destNodeId,
      bandwidth: 10000,
      utilization: 0,
      status: 'active',
      type: 'vxlan',
      isVxlanTunnel: true,
      vxlanVni: tunnelData.vni,
    };

    const newData: TopologyData = {
      ...data,
      links: [...data.links, newLink],
      vxlanTunnels: [...(data.vxlanTunnels || []), newTunnel],
    };

    updateData(newData);
  }, [data, updateData]);

  // VxLAN 터널 삭제
  const deleteVxlanTunnel = useCallback((tunnelId: string) => {
    const tunnel = data.vxlanTunnels?.find((t) => t.id === tunnelId);

    const newData: TopologyData = {
      ...data,
      vxlanTunnels: data.vxlanTunnels?.filter((t) => t.id !== tunnelId),
      links: tunnel
        ? data.links.filter(
            (link) =>
              !(
                link.isVxlanTunnel &&
                link.source === tunnel.sourceNodeId &&
                link.target === tunnel.destNodeId
              )
          )
        : data.links,
    };

    updateData(newData);
  }, [data, updateData]);

  // 연결 시작
  const startConnection = useCallback((sourceNodeId: string) => {
    setEditorState((prev) => ({
      ...prev,
      pendingConnection: { sourceNodeId },
    }));
  }, []);

  // 연결 완료
  const completeConnection = useCallback((targetNodeId: string) => {
    if (!editorState.pendingConnection) return;

    const { sourceNodeId } = editorState.pendingConnection;
    if (sourceNodeId === targetNodeId) {
      setEditorState((prev) => ({
        ...prev,
        pendingConnection: null,
      }));
      return;
    }

    addLink({
      source: sourceNodeId,
      target: targetNodeId,
    });

    setEditorState((prev) => ({
      ...prev,
      pendingConnection: null,
    }));
  }, [editorState.pendingConnection, addLink]);

  // 연결 취소
  const cancelConnection = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      pendingConnection: null,
    }));
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDataInternal(history[newIndex]);
      onDataChange?.(history[newIndex]);
    }
  }, [historyIndex, history, onDataChange]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDataInternal(history[newIndex]);
      onDataChange?.(history[newIndex]);
    }
  }, [historyIndex, history, onDataChange]);

  // 저장
  const save = useCallback(() => {
    setOriginalData(data);
    setHistory([data]);
    setHistoryIndex(0);
  }, [data]);

  // 취소
  const cancel = useCallback(() => {
    setDataInternal(originalData);
    setHistory([originalData]);
    setHistoryIndex(0);
    onDataChange?.(originalData);
  }, [originalData, onDataChange]);

  // 계산된 값들
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasChanges = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(originalData),
    [data, originalData]
  );

  return {
    data,
    editorState,
    history,
    historyIndex,
    canUndo,
    canRedo,
    hasChanges,
    setMode,
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    addLink,
    updateLink,
    deleteLink,
    selectLink,
    addVxlanTunnel,
    deleteVxlanTunnel,
    startConnection,
    completeConnection,
    cancelConnection,
    undo,
    redo,
    save,
    cancel,
    setData,
  };
}
