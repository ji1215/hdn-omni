'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import type { TrafficClass } from '@/types/qos';

interface TrafficClassEditorProps {
  trafficClasses: Omit<TrafficClass, 'id'>[];
  onChange: (classes: Omit<TrafficClass, 'id'>[]) => void;
  errors?: Record<string, string>;
}

/**
 * 트래픽 클래스 편집기
 */
export function TrafficClassEditor({
  trafficClasses,
  onChange,
  errors,
}: TrafficClassEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 트래픽 클래스 추가
  const handleAdd = () => {
    const newClass: Omit<TrafficClass, 'id'> = {
      name: '',
      priority: 4,
      dscpValue: 0,
      order: trafficClasses.length,
    };
    onChange([...trafficClasses, newClass]);
  };

  // 트래픽 클래스 삭제
  const handleRemove = (index: number) => {
    const updated = trafficClasses.filter((_, i) => i !== index);
    // 순서 재정렬
    updated.forEach((tc, i) => {
      tc.order = i;
    });
    onChange(updated);
  };

  // 필드 업데이트
  const handleUpdate = (
    index: number,
    field: keyof Omit<TrafficClass, 'id'>,
    value: any
  ) => {
    const updated = [...trafficClasses];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // 드래그 앤 드롭
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = [...trafficClasses];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);

    // 순서 재정렬
    items.forEach((tc, i) => {
      tc.order = i;
    });

    onChange(items);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          트래픽 클래스 <span className="text-red-500">*</span>
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleAdd}
        >
          클래스 추가
        </Button>
      </div>

      {trafficClasses.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            트래픽 클래스를 추가하세요 (최소 1개 필요)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trafficClasses.map((tc, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
                draggedIndex === index && 'opacity-50'
              )}
            >
              {/* 드래그 핸들 */}
              <div className="pt-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>

              {/* 입력 필드 */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 이름 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    클래스 이름
                  </label>
                  <input
                    type="text"
                    value={tc.name}
                    onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="예: VoIP"
                  />
                </div>

                {/* 우선순위 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    우선순위 (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={tc.priority}
                    onChange={(e) =>
                      handleUpdate(index, 'priority', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* DSCP 값 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    DSCP 값 (0-63)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="63"
                    value={tc.dscpValue}
                    onChange={(e) =>
                      handleUpdate(index, 'dscpValue', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* 설명 (전체 너비) */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    설명 (선택사항)
                  </label>
                  <input
                    type="text"
                    value={tc.description || ''}
                    onChange={(e) =>
                      handleUpdate(index, 'description', e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="클래스에 대한 설명..."
                  />
                </div>
              </div>

              {/* 삭제 버튼 */}
              <Button
                type="button"
                variant="icon"
                onClick={() => handleRemove(index)}
                disabled={trafficClasses.length === 1}
                title="삭제"
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {errors && Object.keys(errors).length > 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">{errors.trafficClasses}</p>
      )}
    </div>
  );
}
