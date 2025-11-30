'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/common';
import { FlowRule } from '@/types/flow';

interface FlowJsonEditorProps {
  rule: Partial<FlowRule>;
  format: 'json' | 'yaml';
  onChange: (rule: Partial<FlowRule>) => void;
}

export function FlowJsonEditor({ rule, format, onChange }: FlowJsonEditorProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (format === 'json') {
        setText(JSON.stringify(rule, null, 2));
      } else {
        // Simple YAML serialization (for basic types)
        setText(convertToYAML(rule));
      }
      setError(null);
    } catch (err) {
      setError('직렬화 오류: ' + (err as Error).message);
    }
  }, [rule, format]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    try {
      let parsed: any;
      if (format === 'json') {
        parsed = JSON.parse(newText);
      } else {
        parsed = parseYAML(newText);
      }
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const convertToYAML = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach((item) => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${convertToYAML(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  };

  const parseYAML = (yamlText: string): any => {
    // Simple YAML parser (for demonstration - in production use a library like js-yaml)
    const lines = yamlText.split('\n');
    const result: any = {};
    let currentObj = result;
    const stack: any[] = [result];
    let lastIndent = 0;

    lines.forEach((line) => {
      if (!line.trim() || line.trim().startsWith('#')) return;

      const indent = line.search(/\S/);
      const content = line.trim();

      if (indent < lastIndent) {
        // Pop from stack
        const levels = Math.floor((lastIndent - indent) / 2);
        for (let i = 0; i < levels; i++) {
          stack.pop();
        }
        currentObj = stack[stack.length - 1];
      }

      const [key, ...valueParts] = content.split(':');
      const value = valueParts.join(':').trim();

      if (value) {
        // Attempt to parse as number or boolean
        let parsedValue: any = value;
        if (!isNaN(Number(value))) {
          parsedValue = Number(value);
        } else if (value === 'true') {
          parsedValue = true;
        } else if (value === 'false') {
          parsedValue = false;
        }
        currentObj[key.trim()] = parsedValue;
      } else {
        currentObj[key.trim()] = {};
        currentObj = currentObj[key.trim()];
        stack.push(currentObj);
      }

      lastIndent = indent;
    });

    return result;
  };

  const formatCode = () => {
    try {
      if (format === 'json') {
        const parsed = JSON.parse(text);
        setText(JSON.stringify(parsed, null, 2));
        setError(null);
      }
    } catch (err) {
      setError('포맷 오류: ' + (err as Error).message);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {format.toUpperCase()} 편집기
          </span>
          {error && (
            <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
              구문 오류
            </span>
          )}
        </div>
        <Button onClick={formatCode} variant="secondary" size="sm">
          코드 포맷
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full h-full font-mono text-sm p-4 bg-gray-900 text-gray-100 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
          spellCheck={false}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            파싱 오류
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>팁:</strong> {format.toUpperCase()} 형식으로 플로우 규칙을 직접 편집할
          수 있습니다. 저장하기 전에 구문 오류가 없는지 확인하세요.
        </p>
      </div>
    </div>
  );
}
