'use client';

import { useState } from 'react';
import { Button } from '@/components/common';
import { FlowRule, EditorMode, FlowValidationResult } from '@/types/flow';
import { FlowEditorTabs } from './FlowEditorTabs';
import { FlowRuleForm } from './FlowRuleForm';
import { FlowJsonEditor } from './FlowJsonEditor';
import { FlowTemplateLibrary } from './FlowTemplateLibrary';
import { FlowValidationPanel } from './FlowValidationPanel';
import { FlowStatisticsPanel } from './FlowStatisticsPanel';

interface FlowRuleEditorProps {
  rule?: FlowRule;
  onSave: (rule: Partial<FlowRule>) => void;
  onCancel: () => void;
  onValidate?: (rule: Partial<FlowRule>) => FlowValidationResult;
}

export function FlowRuleEditor({
  rule,
  onSave,
  onCancel,
  onValidate,
}: FlowRuleEditorProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>('graphic');
  const [currentRule, setCurrentRule] = useState<Partial<FlowRule>>(
    rule || {
      name: '',
      priority: 1000,
      match: {},
      actions: [],
      timeout: { hardTimeout: 0, idleTimeout: 0 },
      status: 'inactive',
    }
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [validationResult, setValidationResult] =
    useState<FlowValidationResult | null>(null);

  const handleRuleChange = (updates: Partial<FlowRule>) => {
    const updated = { ...currentRule, ...updates };
    setCurrentRule(updated);

    // Validate on change
    if (onValidate) {
      const result = onValidate(updated);
      setValidationResult(result);
    }
  };

  const handleSave = () => {
    if (validationResult && !validationResult.isValid) {
      alert('플로우 규칙에 오류가 있습니다. 검증 패널을 확인하세요.');
      return;
    }
    onSave(currentRule);
  };

  const handleTemplateSelect = (templateRule: Partial<FlowRule>) => {
    setCurrentRule(templateRule);
    setShowTemplates(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {rule ? '플로우 규칙 편집' : '새 플로우 규칙'}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {rule?.id || '새 규칙 생성 중'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowTemplates(!showTemplates)}
              variant="secondary"
              size="md"
            >
              템플릿 라이브러리
            </Button>
            <Button onClick={onCancel} variant="secondary" size="md">
              취소
            </Button>
            <Button onClick={handleSave} variant="primary" size="md">
              저장
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Mode Tabs */}
      <FlowEditorTabs mode={editorMode} onModeChange={setEditorMode} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {editorMode === 'graphic' && (
            <FlowRuleForm rule={currentRule} onChange={handleRuleChange} />
          )}
          {(editorMode === 'json' || editorMode === 'yaml') && (
            <FlowJsonEditor
              rule={currentRule}
              format={editorMode}
              onChange={handleRuleChange}
            />
          )}
        </div>

        {/* Side Panel */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          {/* Validation Panel */}
          {validationResult && (
            <FlowValidationPanel result={validationResult} />
          )}

          {/* Statistics Panel (if editing existing rule) */}
          {rule?.statistics && (
            <FlowStatisticsPanel statistics={rule.statistics} />
          )}
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplates && (
        <FlowTemplateLibrary
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
