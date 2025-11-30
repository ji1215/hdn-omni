'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/common';
import { FlowActionConfig, FlowAction } from '@/types/flow';

interface ActionsEditorProps {
  actions: FlowActionConfig[];
  onChange: (actions: FlowActionConfig[]) => void;
}

export function ActionsEditor({ actions, onChange }: ActionsEditorProps) {
  const actionTypes: FlowAction[] = ['FORWARD', 'DROP', 'MODIFY', 'QUEUE', 'FLOOD', 'CONTROLLER'];

  const addAction = () => {
    onChange([...actions, { type: 'FORWARD' }]);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<FlowActionConfig>) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const getActionColor = (type: FlowAction): string => {
    switch (type) {
      case 'FORWARD':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'DROP':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'MODIFY':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'QUEUE':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'FLOOD':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'CONTROLLER':
        return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {actions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          액션이 없습니다. 추가하려면 아래 버튼을 클릭하세요.
        </div>
      )}

      {actions.map((action, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
        >
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              {/* Action Type */}
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  액션 타입
                </label>
                <select
                  value={action.type}
                  onChange={(e) =>
                    updateAction(index, { type: e.target.value as FlowAction })
                  }
                  className={`input font-semibold ${getActionColor(action.type)}`}
                >
                  {actionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Output Port (for FORWARD) */}
              {action.type === 'FORWARD' && (
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    출력 포트
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={action.outputPort || ''}
                    onChange={(e) =>
                      updateAction(index, {
                        outputPort: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="포트 번호"
                    className="input"
                  />
                </div>
              )}

              {/* Queue ID (for QUEUE) */}
              {action.type === 'QUEUE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      큐 ID
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={action.queueId || ''}
                      onChange={(e) =>
                        updateAction(index, {
                          queueId: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="큐 번호"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      출력 포트
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={action.outputPort || ''}
                      onChange={(e) =>
                        updateAction(index, {
                          outputPort: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="포트 번호"
                      className="input"
                    />
                  </div>
                </div>
              )}

              {/* Modify Fields (for MODIFY) */}
              {action.type === 'MODIFY' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">수정할 필드</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={action.modifyFields?.srcIp || ''}
                      onChange={(e) =>
                        updateAction(index, {
                          modifyFields: {
                            ...action.modifyFields,
                            srcIp: e.target.value || undefined,
                          },
                        })
                      }
                      placeholder="새 소스 IP"
                      className="input text-sm"
                    />
                    <input
                      type="text"
                      value={action.modifyFields?.dstIp || ''}
                      onChange={(e) =>
                        updateAction(index, {
                          modifyFields: {
                            ...action.modifyFields,
                            dstIp: e.target.value || undefined,
                          },
                        })
                      }
                      placeholder="새 목적지 IP"
                      className="input text-sm"
                    />
                    <input
                      type="text"
                      value={action.modifyFields?.srcMac || ''}
                      onChange={(e) =>
                        updateAction(index, {
                          modifyFields: {
                            ...action.modifyFields,
                            srcMac: e.target.value || undefined,
                          },
                        })
                      }
                      placeholder="새 소스 MAC"
                      className="input text-sm"
                    />
                    <input
                      type="text"
                      value={action.modifyFields?.dstMac || ''}
                      onChange={(e) =>
                        updateAction(index, {
                          modifyFields: {
                            ...action.modifyFields,
                            dstMac: e.target.value || undefined,
                          },
                        })
                      }
                      placeholder="새 목적지 MAC"
                      className="input text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <Button
              onClick={() => removeAction(index)}
              variant="icon"
              size="sm"
              title="액션 삭제"
            >
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add Action Button */}
      <Button onClick={addAction} variant="secondary" size="md" className="w-full">
        + 액션 추가
      </Button>
    </div>
  );
}
