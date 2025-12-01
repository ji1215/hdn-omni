'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Department } from '@/types/department';
import { DepartmentTreeNode } from './DepartmentTreeNode';
import { Building2 } from 'lucide-react';

interface DepartmentTreeProps {
  departments: Department[];
  selectedDepartmentId?: string | null;
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (department: Department) => void;
  onMoveDepartment: (departmentId: string, newParentId: string | null) => void;
  onViewMembers: (department: Department) => void;
  onSelectDepartment?: (department: Department) => void;
}

// 부서를 트리 구조로 변환
interface TreeNode extends Department {
  children: TreeNode[];
  level: number;
}

function buildTree(departments: Department[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // 먼저 모든 부서를 맵에 추가
  departments.forEach((dept) => {
    map.set(dept.id, { ...dept, children: [], level: 0 });
  });

  // 부모-자식 관계 설정
  departments.forEach((dept) => {
    const node = map.get(dept.id)!;
    if (dept.parentId && map.has(dept.parentId)) {
      const parent = map.get(dept.parentId)!;
      node.level = parent.level + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// 트리를 평면 배열로 변환 (렌더링 순서용)
function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];

  function traverse(node: TreeNode) {
    result.push(node);
    node.children.forEach(traverse);
  }

  nodes.forEach(traverse);
  return result;
}

export function DepartmentTree({
  departments,
  selectedDepartmentId = null,
  onEditDepartment,
  onDeleteDepartment,
  onMoveDepartment,
  onViewMembers,
  onSelectDepartment,
}: DepartmentTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(departments.map(d => d.id)));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // 트리 구조 생성
  const treeData = useMemo(() => buildTree(departments), [departments]);
  const flatData = useMemo(() => flattenTree(treeData), [treeData]);

  const activeDepartment = activeId ? departments.find((d) => d.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const draggedId = active.id as string;
      const targetId = over.id as string;

      // 자기 자신이나 자신의 하위 부서로 이동 불가
      const draggedDept = departments.find((d) => d.id === draggedId);
      if (draggedDept) {
        // 타겟이 드래그한 항목의 하위인지 확인
        const isDescendant = (parentId: string, childId: string): boolean => {
          const child = departments.find((d) => d.id === childId);
          if (!child) return false;
          if (child.parentId === parentId) return true;
          if (child.parentId) return isDescendant(parentId, child.parentId);
          return false;
        };

        if (!isDescendant(draggedId, targetId)) {
          // 타겟의 하위로 이동 (타겟을 새 부모로 설정)
          // 타겟이 'root'인 경우 최상위로 이동
          const newParentId = targetId === 'root' ? null : targetId;
          onMoveDepartment(draggedId, newParentId);
        }
      }
    }

    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 노드가 보이는지 확인 (부모가 확장되어 있는지)
  const isVisible = (node: TreeNode): boolean => {
    if (node.level === 0) return true;
    const parent = departments.find((d) => d.id === node.parentId);
    if (!parent) return true;
    if (!expandedIds.has(parent.id)) return false;
    const parentNode = flatData.find((n) => n.id === parent.id);
    return parentNode ? isVisible(parentNode) : true;
  };

  const visibleNodes = flatData.filter(isVisible);

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          부서가 없습니다
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          새 부서를 추가해보세요
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-1">
        {/* 최상위로 이동할 수 있는 드롭 영역 */}
        <div
          data-id="root"
          className={`
            h-2 rounded transition-all
            ${overId === 'root' && activeId ? 'bg-blue-200 dark:bg-blue-800 h-8' : 'bg-transparent'}
          `}
        />

        <SortableContext
          items={visibleNodes.map((n) => n.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleNodes.map((node) => (
            <DepartmentTreeNode
              key={node.id}
              department={node}
              level={node.level}
              hasChildren={node.children.length > 0}
              isExpanded={expandedIds.has(node.id)}
              isSelected={selectedDepartmentId === node.id}
              onToggleExpand={() => toggleExpand(node.id)}
              onEdit={() => onEditDepartment(node)}
              onDelete={() => onDeleteDepartment(node)}
              onViewMembers={() => onViewMembers(node)}
              onSelect={() => onSelectDepartment?.(node)}
              isDragging={activeId === node.id}
              isOver={overId === node.id && activeId !== node.id}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeDepartment ? (
          <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-3 shadow-xl opacity-90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {activeDepartment.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {activeDepartment.memberCount}명
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
