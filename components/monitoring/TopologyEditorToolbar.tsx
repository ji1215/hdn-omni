'use client';

import React from 'react';
import {
  Plus,
  Trash2,
  Link2,
  MousePointer,
  Edit3,
  Save,
  X,
  Undo,
  Network,
  Server,
  Router,
  Monitor,
  Shield,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';
import { EditorMode, NetworkNode } from '@/types/topology';

interface TopologyEditorToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onAddNode: (type: NetworkNode['type']) => void;
  onUndo?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  canUndo?: boolean;
  hasChanges?: boolean;
  className?: string;
}

const nodeTypes: { type: NetworkNode['type']; icon: React.ReactNode; label: string }[] = [
  { type: 'switch', icon: <Network className="w-4 h-4" />, label: '스위치' },
  { type: 'router', icon: <Router className="w-4 h-4" />, label: '라우터' },
  { type: 'host', icon: <Monitor className="w-4 h-4" />, label: '호스트' },
  { type: 'controller', icon: <Server className="w-4 h-4" />, label: '컨트롤러' },
  { type: 'firewall', icon: <Shield className="w-4 h-4" />, label: '방화벽' },
  { type: 'vtep', icon: <Layers className="w-4 h-4" />, label: 'VTEP' },
];

export function TopologyEditorToolbar({
  mode,
  onModeChange,
  onAddNode,
  onUndo,
  onSave,
  onCancel,
  canUndo = false,
  hasChanges = false,
  className,
}: TopologyEditorToolbarProps) {
  const [showNodeMenu, setShowNodeMenu] = React.useState(false);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 모드 선택 버튼 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1.5 flex items-center gap-1 border border-gray-200 dark:border-gray-700">
        <Button
          variant="icon"
          onClick={() => onModeChange('view')}
          title="선택 모드"
          className={cn(
            'relative',
            mode === 'view' && 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
          )}
        >
          <MousePointer className="w-4 h-4" />
        </Button>

        {/* 노드 추가 드롭다운 */}
        <div className="relative">
          <Button
            variant="icon"
            onClick={() => setShowNodeMenu(!showNodeMenu)}
            title="노드 추가"
            className={cn(
              'relative',
              mode === 'add-node' && 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
            )}
          >
            <Plus className="w-4 h-4" />
          </Button>

          {showNodeMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNodeMenu(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]">
                {nodeTypes.map((nodeType) => (
                  <button
                    key={nodeType.type}
                    onClick={() => {
                      onAddNode(nodeType.type);
                      onModeChange('add-node');
                      setShowNodeMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {nodeType.icon}
                    <span>{nodeType.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Button
          variant="icon"
          onClick={() => onModeChange('add-link')}
          title="연결 추가"
          className={cn(
            'relative',
            mode === 'add-link' && 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
          )}
        >
          <Link2 className="w-4 h-4" />
        </Button>

        <Button
          variant="icon"
          onClick={() => onModeChange('edit')}
          title="편집 모드"
          className={cn(
            'relative',
            mode === 'edit' && 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
          )}
        >
          <Edit3 className="w-4 h-4" />
        </Button>

        <Button
          variant="icon"
          onClick={() => onModeChange('delete')}
          title="삭제 모드"
          className={cn(
            'relative',
            mode === 'delete' && 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
          )}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* 액션 버튼 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1.5 flex items-center gap-1 border border-gray-200 dark:border-gray-700">
        <Button
          variant="icon"
          onClick={onUndo}
          title="실행 취소"
          disabled={!canUndo}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo className="w-4 h-4" />
        </Button>

        {hasChanges && (
          <>
            <Button
              variant="icon"
              onClick={onSave}
              title="저장"
              className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="icon"
              onClick={onCancel}
              title="취소"
              className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* 현재 모드 표시 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {mode === 'view' && '선택'}
          {mode === 'add-node' && '노드 추가'}
          {mode === 'add-link' && '연결 추가'}
          {mode === 'edit' && '편집'}
          {mode === 'delete' && '삭제'}
        </span>
      </div>
    </div>
  );
}
