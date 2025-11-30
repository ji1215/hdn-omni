'use client';

import { FlowRule, FlowMatchFields, FlowActionConfig, FlowAction, FlowProtocol } from '@/types/flow';
import { MatchFieldsEditor } from './MatchFieldsEditor';
import { ActionsEditor } from './ActionsEditor';

interface FlowRuleFormProps {
  rule: Partial<FlowRule>;
  onChange: (updates: Partial<FlowRule>) => void;
}

export function FlowRuleForm({ rule, onChange }: FlowRuleFormProps) {
  const handleMatchChange = (match: FlowMatchFields) => {
    onChange({ match });
  };

  const handleActionsChange = (actions: FlowActionConfig[]) => {
    onChange({ actions });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          기본 정보
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              규칙 이름 *
            </label>
            <input
              type="text"
              value={rule.name || ''}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="예: Allow HTTP Traffic"
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              우선순위 (0-65535) *
            </label>
            <input
              type="number"
              min="0"
              max="65535"
              value={rule.priority || 1000}
              onChange={(e) => onChange({ priority: parseInt(e.target.value) })}
              className="input"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            설명
          </label>
          <textarea
            value={rule.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="플로우 규칙에 대한 설명"
            rows={3}
            className="input"
          />
        </div>
      </div>

      {/* Match Fields */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          매치 필드
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          패킷이 이 규칙과 매칭되기 위한 조건을 설정합니다
        </p>
        <MatchFieldsEditor
          match={rule.match || {}}
          onChange={handleMatchChange}
        />
      </div>

      {/* Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          액션
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          매칭된 패킷에 대해 수행할 동작을 정의합니다
        </p>
        <ActionsEditor
          actions={rule.actions || []}
          onChange={handleActionsChange}
        />
      </div>

      {/* Timeout Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          타임아웃 설정
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hard Timeout (초)
            </label>
            <input
              type="number"
              min="0"
              value={rule.timeout?.hardTimeout || 0}
              onChange={(e) =>
                onChange({
                  timeout: {
                    ...rule.timeout,
                    hardTimeout: parseInt(e.target.value),
                  },
                })
              }
              placeholder="0 = 영구"
              className="input"
            />
            <p className="mt-1 text-xs text-gray-500">
              규칙이 설치된 후 삭제되기까지의 시간 (0 = 영구)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idle Timeout (초)
            </label>
            <input
              type="number"
              min="0"
              value={rule.timeout?.idleTimeout || 0}
              onChange={(e) =>
                onChange({
                  timeout: {
                    ...rule.timeout,
                    idleTimeout: parseInt(e.target.value),
                  },
                })
              }
              placeholder="0 = 무제한"
              className="input"
            />
            <p className="mt-1 text-xs text-gray-500">
              마지막 매칭 이후 규칙이 삭제되기까지의 시간
            </p>
          </div>
        </div>
      </div>

      {/* Device Assignment */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          대상 디바이스
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            스위치 선택
          </label>
          <select
            value={rule.deviceId || ''}
            onChange={(e) => onChange({ deviceId: e.target.value })}
            className="input"
          >
            <option value="">모든 디바이스</option>
            <option value="switch-1">Switch 1 (10.0.0.1)</option>
            <option value="switch-2">Switch 2 (10.0.0.2)</option>
            <option value="switch-3">Switch 3 (10.0.0.3)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
