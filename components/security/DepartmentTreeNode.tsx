'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Department, DepartmentStatusLabels, DepartmentStatusColors } from '@/types/department';
import {
  Building2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';

interface DepartmentTreeNodeProps {
  department: Department;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected?: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewMembers: () => void;
  onSelect?: () => void;
  isDragging: boolean;
  isOver: boolean;
}

export function DepartmentTreeNode({
  department,
  level,
  hasChildren,
  isExpanded,
  isSelected = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onViewMembers,
  onSelect,
  isDragging,
  isOver,
}: DepartmentTreeNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: department.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border transition-all duration-200 overflow-hidden',
        isDragging && 'opacity-50',
        isOver && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        isSelected && !isDragging && !isOver && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md',
        !isDragging && !isOver && !isSelected && 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <div
        className="flex items-center gap-1 p-2 overflow-hidden"
        style={{
          paddingLeft: `${Math.min(level * 16, 32) + 8}px`,
          paddingRight: '8px'
        }}
      >
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="hidden xl:block p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="드래그하여 이동"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* 확장/축소 버튼 */}
        <button
          onClick={onToggleExpand}
          className={cn(
            'p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
        </button>

        {/* 부서 아이콘 */}
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
          level === 0
            ? 'bg-blue-100 dark:bg-blue-900/30'
            : 'bg-gray-100 dark:bg-gray-700'
        )}>
          <Building2 className={cn(
            'w-4 h-4',
            level === 0
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          )} />
        </div>

        {/* 부서 정보 - 클릭하면 사용자 필터링 */}
        <div
          className="flex-1 min-w-0 cursor-pointer overflow-hidden"
          onClick={onSelect}
        >
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate block">
              {department.name}
            </span>
            <span
              className={cn(
                'hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                DepartmentStatusColors[department.status]
              )}
            >
              {DepartmentStatusLabels[department.status]}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate hidden md:block">
            {department.description}
          </div>
        </div>

        {/* 인원 수 - 클릭하면 멤버 목록 표시 */}
        <button
          onClick={onViewMembers}
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer flex-shrink-0 ml-1"
          title="멤버 목록 보기"
        >
          <Users className="w-3 h-3 text-gray-500 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {department.memberCount}
          </span>
        </button>

        {/* 액션 버튼 */}
        <div className="hidden xl:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewMembers}
            className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-100"
            title="멤버 관리"
          >
            <Users className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            title="수정"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-100"
            disabled={department.memberCount > 0}
            title={department.memberCount > 0 ? '소속 인원이 있는 부서는 삭제할 수 없습니다' : '삭제'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 드롭 인디케이터 */}
      {isOver && (
        <div className="absolute inset-x-0 -bottom-1 h-1 bg-blue-500 rounded-full" />
      )}
    </div>
  );
}
