'use client';

import { Button } from '@/components/common';
import { EditorMode } from '@/types/flow';

interface FlowEditorTabsProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

export function FlowEditorTabs({ mode, onModeChange }: FlowEditorTabsProps) {
  const tabs: { value: EditorMode; label: string; icon: string }[] = [
    { value: 'graphic', label: '그래픽 빌더', icon: '🎨' },
    { value: 'json', label: 'JSON', icon: '{ }' },
    { value: 'yaml', label: 'YAML', icon: '📝' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            onClick={() => onModeChange(tab.value)}
            variant="ghost"
            size="md"
            className={`
              px-4 py-2 font-medium text-sm rounded-t-lg
              ${
                mode === tab.value
                  ? 'bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
