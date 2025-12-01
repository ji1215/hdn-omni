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
        'group relative rounded-lg border transition-all duration-200',
        isDragging && 'opacity-50',
        isOver && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        isSelected && !isDragging && !isOver && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md',
        !isDragging && !isOver && !isSelected && 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <div
        className="flex items-center gap-2 p-3"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          title="드래그하여 이동"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* 확장/축소 버튼 */}
        <button
          onClick={onToggleExpand}
          className={cn(
            'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* 부서 아이콘 */}
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          level === 0
            ? 'bg-blue-100 dark:bg-blue-900/30'
            : 'bg-gray-100 dark:bg-gray-700'
        )}>
          <Building2 className={cn(
            'w-5 h-5',
            level === 0
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          )} />
        </div>

        {/* 부서 정보 - 클릭하면 사용자 필터링 */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onSelect}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {department.name}
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                DepartmentStatusColors[department.status]
              )}
            >
              {DepartmentStatusLabels[department.status]}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {department.description}
          </div>
        </div>

        {/* 인원 수 - 클릭하면 멤버 목록 표시 */}
        <button
          onClick={onViewMembers}
          className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
          title="멤버 목록 보기"
        >
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {department.memberCount}
          </span>
        </button>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewMembers}
            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-100"
            title="멤버 관리"
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            title="수정"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-100"
            disabled={department.memberCount > 0}
            title={department.memberCount > 0 ? '소속 인원이 있는 부서는 삭제할 수 없습니다' : '삭제'}
          >
            <Trash2 className="w-4 h-4" />
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
