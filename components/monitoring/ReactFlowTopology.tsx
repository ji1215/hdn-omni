'use client';

import { useCallback, useState, useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Panel,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  getBezierPath,
  BaseEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Server,
  Network,
  Router,
  Trash2,
  Plus,
  Settings,
  Link,
  Unlink,
  Layers,
  Cable,
  X,
} from 'lucide-react';

// VLAN 색상 맵
const VLAN_COLORS: Record<number, string> = {
  10: '#3B82F6', // blue
  20: '#10B981', // green
  30: '#F59E0B', // amber
  40: '#EF4444', // red
  50: '#8B5CF6', // purple
  100: '#06B6D4', // cyan
};

// VxLAN 색상
const VXLAN_COLOR = '#F97316'; // orange

// 노드 타입 정의
type NodeType = 'switch' | 'server' | 'router' | 'vtep';

interface CustomNodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  vlans?: number[];
  vni?: number; // VxLAN Network Identifier
  ip?: string;
}

// 커스텀 노드 타입
type CustomNodeType = Node<CustomNodeData>;

// 커스텀 노드 컴포넌트
function CustomNode({ data, selected }: NodeProps<CustomNodeType>) {
  const getIcon = () => {
    switch (data.type) {
      case 'switch':
        return <Network className="w-6 h-6" />;
      case 'server':
        return <Server className="w-6 h-6" />;
      case 'router':
        return <Router className="w-6 h-6" />;
      case 'vtep':
        return <Cable className="w-6 h-6" />;
      default:
        return <Network className="w-6 h-6" />;
    }
  };

  const getNodeColor = () => {
    switch (data.type) {
      case 'switch':
        return 'bg-blue-500';
      case 'server':
        return 'bg-green-500';
      case 'router':
        return 'bg-purple-500';
      case 'vtep':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 ${
        selected ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-gray-300 dark:border-gray-600'
      } bg-white dark:bg-gray-800 min-w-[140px]`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-400" />

      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getNodeColor()} text-white`}>
          {getIcon()}
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-900 dark:text-white">
            {data.label}
          </div>
          {data.ip && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{data.ip}</div>
          )}
          {data.vlans && data.vlans.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {data.vlans.map((vlan) => (
                <span
                  key={vlan}
                  className="px-1.5 py-0.5 text-[10px] rounded text-white font-medium"
                  style={{ backgroundColor: VLAN_COLORS[vlan] || '#6B7280' }}
                >
                  VLAN {vlan}
                </span>
              ))}
            </div>
          )}
          {data.vni && (
            <div className="mt-1">
              <span
                className="px-1.5 py-0.5 text-[10px] rounded text-white font-medium"
                style={{ backgroundColor: VXLAN_COLOR }}
              >
                VNI {data.vni}
              </span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-gray-400" />
    </div>
  );
}

// 커스텀 엣지 타입 정의
interface CustomEdgeData extends Record<string, unknown> {
  type: 'vlan' | 'vxlan' | 'physical';
  vlanId?: number;
  vni?: number;
  bandwidth?: string;
}

// 커스텀 엣지 타입
type CustomEdgeType = Edge<CustomEdgeData>;

// VLAN 엣지 컴포넌트
function VlanEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}: EdgeProps<CustomEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const vlanColor = data?.vlanId ? VLAN_COLORS[data.vlanId] || '#6B7280' : '#6B7280';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: vlanColor,
        }}
      />
      {data?.vlanId && (
        <foreignObject
          width={60}
          height={20}
          x={labelX - 30}
          y={labelY - 10}
          className="pointer-events-none"
        >
          <div
            className="text-[10px] text-white px-1.5 py-0.5 rounded text-center font-medium"
            style={{ backgroundColor: vlanColor }}
          >
            VLAN {data.vlanId}
          </div>
        </foreignObject>
      )}
    </>
  );
}

// VxLAN 엣지 컴포넌트 (점선)
function VxlanEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}: EdgeProps<CustomEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: VXLAN_COLOR,
          strokeDasharray: '8,4',
        }}
      />
      {data?.vni && (
        <foreignObject
          width={70}
          height={20}
          x={labelX - 35}
          y={labelY - 10}
          className="pointer-events-none"
        >
          <div
            className="text-[10px] text-white px-1.5 py-0.5 rounded text-center font-medium"
            style={{ backgroundColor: VXLAN_COLOR }}
          >
            VNI {data.vni}
          </div>
        </foreignObject>
      )}
    </>
  );
}

// 초기 노드 데이터
const initialNodes: CustomNodeType[] = [
  // Spine Layer
  {
    id: 'spine-1',
    type: 'customNode',
    position: { x: 300, y: 50 },
    data: { label: 'Spine-1', type: 'router', ip: '10.0.0.1' },
  },
  {
    id: 'spine-2',
    type: 'customNode',
    position: { x: 600, y: 50 },
    data: { label: 'Spine-2', type: 'router', ip: '10.0.0.2' },
  },
  // Leaf Layer with VTEP
  {
    id: 'leaf-1',
    type: 'customNode',
    position: { x: 100, y: 200 },
    data: { label: 'Leaf-1 (VTEP)', type: 'vtep', vlans: [10, 20], vni: 5000, ip: '10.0.1.1' },
  },
  {
    id: 'leaf-2',
    type: 'customNode',
    position: { x: 400, y: 200 },
    data: { label: 'Leaf-2 (VTEP)', type: 'vtep', vlans: [10, 30], vni: 5000, ip: '10.0.1.2' },
  },
  {
    id: 'leaf-3',
    type: 'customNode',
    position: { x: 700, y: 200 },
    data: { label: 'Leaf-3 (VTEP)', type: 'vtep', vlans: [20, 30], vni: 5001, ip: '10.0.1.3' },
  },
  // Access Layer
  {
    id: 'sw-1',
    type: 'customNode',
    position: { x: 50, y: 380 },
    data: { label: 'SW-1', type: 'switch', vlans: [10] },
  },
  {
    id: 'sw-2',
    type: 'customNode',
    position: { x: 200, y: 380 },
    data: { label: 'SW-2', type: 'switch', vlans: [20] },
  },
  {
    id: 'sw-3',
    type: 'customNode',
    position: { x: 400, y: 380 },
    data: { label: 'SW-3', type: 'switch', vlans: [10, 30] },
  },
  {
    id: 'sw-4',
    type: 'customNode',
    position: { x: 600, y: 380 },
    data: { label: 'SW-4', type: 'switch', vlans: [20] },
  },
  {
    id: 'sw-5',
    type: 'customNode',
    position: { x: 750, y: 380 },
    data: { label: 'SW-5', type: 'switch', vlans: [30] },
  },
  // Server Layer
  {
    id: 'server-1',
    type: 'customNode',
    position: { x: 50, y: 520 },
    data: { label: 'Server-1', type: 'server', vlans: [10], ip: '192.168.10.10' },
  },
  {
    id: 'server-2',
    type: 'customNode',
    position: { x: 200, y: 520 },
    data: { label: 'Server-2', type: 'server', vlans: [20], ip: '192.168.20.10' },
  },
  {
    id: 'server-3',
    type: 'customNode',
    position: { x: 400, y: 520 },
    data: { label: 'Server-3', type: 'server', vlans: [10], ip: '192.168.10.20' },
  },
  {
    id: 'server-4',
    type: 'customNode',
    position: { x: 600, y: 520 },
    data: { label: 'Server-4', type: 'server', vlans: [20], ip: '192.168.20.20' },
  },
  {
    id: 'server-5',
    type: 'customNode',
    position: { x: 750, y: 520 },
    data: { label: 'Server-5', type: 'server', vlans: [30], ip: '192.168.30.10' },
  },
];

// 초기 엣지 데이터
const initialEdges: CustomEdgeType[] = [
  // Spine to Leaf connections (physical)
  { id: 'e-spine1-leaf1', source: 'spine-1', target: 'leaf-1', type: 'default', animated: false },
  { id: 'e-spine1-leaf2', source: 'spine-1', target: 'leaf-2', type: 'default', animated: false },
  { id: 'e-spine1-leaf3', source: 'spine-1', target: 'leaf-3', type: 'default', animated: false },
  { id: 'e-spine2-leaf1', source: 'spine-2', target: 'leaf-1', type: 'default', animated: false },
  { id: 'e-spine2-leaf2', source: 'spine-2', target: 'leaf-2', type: 'default', animated: false },
  { id: 'e-spine2-leaf3', source: 'spine-2', target: 'leaf-3', type: 'default', animated: false },
  // VxLAN tunnels between VTEP (점선)
  {
    id: 'vxlan-1-2',
    source: 'leaf-1',
    target: 'leaf-2',
    type: 'vxlanEdge',
    data: { type: 'vxlan', vni: 5000 },
    animated: true,
  },
  {
    id: 'vxlan-2-3',
    source: 'leaf-2',
    target: 'leaf-3',
    type: 'vxlanEdge',
    data: { type: 'vxlan', vni: 5001 },
    animated: true,
  },
  {
    id: 'vxlan-1-3',
    source: 'leaf-1',
    target: 'leaf-3',
    type: 'vxlanEdge',
    data: { type: 'vxlan', vni: 5000 },
    animated: true,
  },
  // Leaf to Switch VLAN connections
  { id: 'e-leaf1-sw1', source: 'leaf-1', target: 'sw-1', type: 'vlanEdge', data: { type: 'vlan', vlanId: 10 } },
  { id: 'e-leaf1-sw2', source: 'leaf-1', target: 'sw-2', type: 'vlanEdge', data: { type: 'vlan', vlanId: 20 } },
  { id: 'e-leaf2-sw3', source: 'leaf-2', target: 'sw-3', type: 'vlanEdge', data: { type: 'vlan', vlanId: 10 } },
  { id: 'e-leaf3-sw4', source: 'leaf-3', target: 'sw-4', type: 'vlanEdge', data: { type: 'vlan', vlanId: 20 } },
  { id: 'e-leaf3-sw5', source: 'leaf-3', target: 'sw-5', type: 'vlanEdge', data: { type: 'vlan', vlanId: 30 } },
  // Switch to Server connections
  { id: 'e-sw1-server1', source: 'sw-1', target: 'server-1', type: 'vlanEdge', data: { type: 'vlan', vlanId: 10 } },
  { id: 'e-sw2-server2', source: 'sw-2', target: 'server-2', type: 'vlanEdge', data: { type: 'vlan', vlanId: 20 } },
  { id: 'e-sw3-server3', source: 'sw-3', target: 'server-3', type: 'vlanEdge', data: { type: 'vlan', vlanId: 10 } },
  { id: 'e-sw4-server4', source: 'sw-4', target: 'server-4', type: 'vlanEdge', data: { type: 'vlan', vlanId: 20 } },
  { id: 'e-sw5-server5', source: 'sw-5', target: 'server-5', type: 'vlanEdge', data: { type: 'vlan', vlanId: 30 } },
];

const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

const edgeTypes: EdgeTypes = {
  vlanEdge: VlanEdge,
  vxlanEdge: VxlanEdge,
};

interface ReactFlowTopologyProps {
  className?: string;
}

export function ReactFlowTopology({ className }: ReactFlowTopologyProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<CustomNodeType | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<CustomEdgeType | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showEdgePanel, setShowEdgePanel] = useState(false);

  // 새 노드 추가 패널 상태
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('switch');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeIp, setNewNodeIp] = useState('');
  const [newNodeVlans, setNewNodeVlans] = useState<number[]>([]);
  const [newNodeVni, setNewNodeVni] = useState<number | undefined>();

  // 연결 추가 패널 상태
  const [showConnectionPanel, setShowConnectionPanel] = useState(false);
  const [connectionType, setConnectionType] = useState<'vlan' | 'vxlan' | 'physical'>('physical');
  const [connectionVlanId, setConnectionVlanId] = useState<number>(10);
  const [connectionVni, setConnectionVni] = useState<number>(5000);

  const nodeIdCounter = useRef(20);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: CustomEdgeType = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        type: connectionType === 'vlan' ? 'vlanEdge' : connectionType === 'vxlan' ? 'vxlanEdge' : 'default',
        data: {
          type: connectionType,
          ...(connectionType === 'vlan' && { vlanId: connectionVlanId }),
          ...(connectionType === 'vxlan' && { vni: connectionVni }),
        },
        animated: connectionType === 'vxlan',
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, connectionType, connectionVlanId, connectionVni]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: CustomNodeType) => {
    setSelectedNode(node);
    setShowNodePanel(true);
    setSelectedEdge(null);
    setShowEdgePanel(false);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: CustomEdgeType) => {
    setSelectedEdge(edge);
    setShowEdgePanel(true);
    setSelectedNode(null);
    setShowNodePanel(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setShowNodePanel(false);
    setShowEdgePanel(false);
  }, []);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      setShowNodePanel(false);
    }
  }, [selectedNode, setNodes, setEdges]);

  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      setShowEdgePanel(false);
    }
  }, [selectedEdge, setEdges]);

  const addNewNode = useCallback(() => {
    if (!newNodeLabel) return;

    const newNode: CustomNodeType = {
      id: `node-${nodeIdCounter.current++}`,
      type: 'customNode',
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 100 },
      data: {
        label: newNodeLabel,
        type: newNodeType,
        ...(newNodeIp && { ip: newNodeIp }),
        ...(newNodeVlans.length > 0 && { vlans: newNodeVlans }),
        ...(newNodeVni && { vni: newNodeVni }),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewNodeLabel('');
    setNewNodeIp('');
    setNewNodeVlans([]);
    setNewNodeVni(undefined);
    setShowAddPanel(false);
  }, [newNodeLabel, newNodeType, newNodeIp, newNodeVlans, newNodeVni, setNodes]);

  const toggleVlan = (vlanId: number) => {
    setNewNodeVlans((prev) =>
      prev.includes(vlanId) ? prev.filter((v) => v !== vlanId) : [...prev, vlanId]
    );
  };

  // 범례 컴포넌트
  const Legend = useMemo(
    () => (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">범례</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <span className="text-gray-600 dark:text-gray-400">물리적 연결</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ borderBottom: `2px dashed ${VXLAN_COLOR}` }}></div>
            <span className="text-gray-600 dark:text-gray-400">VxLAN 터널</span>
          </div>
          {Object.entries(VLAN_COLORS).slice(0, 4).map(([vlan, color]) => (
            <div key={vlan} className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ backgroundColor: color }}></div>
              <span className="text-gray-600 dark:text-gray-400">VLAN {vlan}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    []
  );

  return (
    <div className={`relative h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#94A3B8' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#94A3B8',
          },
        }}
      >
        <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        <MiniMap
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          nodeColor={(node) => {
            const data = node.data as CustomNodeData;
            switch (data.type) {
              case 'switch':
                return '#3B82F6';
              case 'server':
                return '#10B981';
              case 'router':
                return '#8B5CF6';
              case 'vtep':
                return '#F97316';
              default:
                return '#6B7280';
            }
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

        {/* 상단 툴바 */}
        <Panel position="top-left">
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              노드 추가
            </button>
            <button
              onClick={() => setShowConnectionPanel(!showConnectionPanel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-md ${
                showConnectionPanel
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Link className="w-4 h-4" />
              연결 모드
            </button>
          </div>
        </Panel>

        {/* 범례 */}
        <Panel position="top-right">{Legend}</Panel>

        {/* 연결 설정 패널 */}
        {showConnectionPanel && (
          <Panel position="bottom-left">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-64">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">연결 설정</h4>
                <button
                  onClick={() => setShowConnectionPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    연결 타입
                  </label>
                  <select
                    value={connectionType}
                    onChange={(e) => setConnectionType(e.target.value as 'vlan' | 'vxlan' | 'physical')}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="physical">물리적 연결</option>
                    <option value="vlan">VLAN 연결</option>
                    <option value="vxlan">VxLAN 터널</option>
                  </select>
                </div>

                {connectionType === 'vlan' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VLAN ID
                    </label>
                    <select
                      value={connectionVlanId}
                      onChange={(e) => setConnectionVlanId(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.keys(VLAN_COLORS).map((vlan) => (
                        <option key={vlan} value={vlan}>
                          VLAN {vlan}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {connectionType === 'vxlan' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VNI (VxLAN Network Identifier)
                    </label>
                    <input
                      type="number"
                      value={connectionVni}
                      onChange={(e) => setConnectionVni(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="5000"
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  노드를 드래그하여 연결하세요
                </p>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* 노드 추가 모달 */}
      {showAddPanel && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">노드 추가</h3>
              <button
                onClick={() => setShowAddPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  노드 타입
                </label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="switch">스위치</option>
                  <option value="server">서버</option>
                  <option value="router">라우터</option>
                  <option value="vtep">VTEP (VxLAN Tunnel Endpoint)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  노드 이름 *
                </label>
                <input
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="예: Switch-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP 주소
                </label>
                <input
                  type="text"
                  value={newNodeIp}
                  onChange={(e) => setNewNodeIp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="예: 192.168.1.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VLAN
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(VLAN_COLORS).map(([vlan, color]) => (
                    <button
                      key={vlan}
                      onClick={() => toggleVlan(Number(vlan))}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        newNodeVlans.includes(Number(vlan))
                          ? 'text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      style={
                        newNodeVlans.includes(Number(vlan))
                          ? { backgroundColor: color }
                          : undefined
                      }
                    >
                      VLAN {vlan}
                    </button>
                  ))}
                </div>
              </div>

              {(newNodeType === 'vtep' || newNodeType === 'switch') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    VNI (VxLAN 사용 시)
                  </label>
                  <input
                    type="number"
                    value={newNodeVni || ''}
                    onChange={(e) => setNewNodeVni(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="예: 5000"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddPanel(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={addNewNode}
                  disabled={!newNodeLabel}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 노드 정보 패널 */}
      {showNodePanel && selectedNode && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-72 z-10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              노드 정보
            </h4>
            <button
              onClick={() => setShowNodePanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">이름:</span>{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {selectedNode.data.label}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">타입:</span>{' '}
              <span className="text-gray-900 dark:text-white capitalize">
                {selectedNode.data.type}
              </span>
            </div>
            {selectedNode.data.ip && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">IP:</span>{' '}
                <span className="text-gray-900 dark:text-white">{selectedNode.data.ip}</span>
              </div>
            )}
            {selectedNode.data.vlans && selectedNode.data.vlans.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">VLAN:</span>{' '}
                <div className="flex gap-1 mt-1 flex-wrap">
                  {selectedNode.data.vlans.map((vlan) => (
                    <span
                      key={vlan}
                      className="px-1.5 py-0.5 text-xs rounded text-white"
                      style={{ backgroundColor: VLAN_COLORS[vlan] || '#6B7280' }}
                    >
                      {vlan}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {selectedNode.data.vni && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">VNI:</span>{' '}
                <span
                  className="px-1.5 py-0.5 text-xs rounded text-white"
                  style={{ backgroundColor: VXLAN_COLOR }}
                >
                  {selectedNode.data.vni}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={deleteSelectedNode}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            노드 삭제
          </button>
        </div>
      )}

      {/* 엣지 정보 패널 */}
      {showEdgePanel && selectedEdge && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-72 z-10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              연결 정보
            </h4>
            <button
              onClick={() => setShowEdgePanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">연결:</span>{' '}
              <span className="text-gray-900 dark:text-white">
                {selectedEdge.source} → {selectedEdge.target}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">타입:</span>{' '}
              <span className="text-gray-900 dark:text-white capitalize">
                {selectedEdge.data?.type || 'physical'}
              </span>
            </div>
            {selectedEdge.data?.vlanId && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">VLAN ID:</span>{' '}
                <span
                  className="px-1.5 py-0.5 text-xs rounded text-white"
                  style={{ backgroundColor: VLAN_COLORS[selectedEdge.data.vlanId] || '#6B7280' }}
                >
                  {selectedEdge.data.vlanId}
                </span>
              </div>
            )}
            {selectedEdge.data?.vni && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">VNI:</span>{' '}
                <span
                  className="px-1.5 py-0.5 text-xs rounded text-white"
                  style={{ backgroundColor: VXLAN_COLOR }}
                >
                  {selectedEdge.data.vni}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={deleteSelectedEdge}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Unlink className="w-4 h-4" />
            연결 삭제
          </button>
        </div>
      )}
    </div>
  );
}
