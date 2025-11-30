'use client';

import { FlowValidationResult } from '@/types/flow';

interface FlowValidationPanelProps {
  result: FlowValidationResult;
}

export function FlowValidationPanel({ result }: FlowValidationPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'major':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case 'minor':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        검증 결과
      </h3>

      {/* Overall Status */}
      <div
        className={`mb-4 p-3 rounded-lg ${
          result.isValid
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {result.isValid ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="font-medium">
            {result.isValid ? '규칙이 유효합니다' : '규칙에 오류가 있습니다'}
          </span>
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            오류 ({result.errors.length})
          </h4>
          <div className="space-y-2">
            {result.errors.map((error, index) => (
              <div
                key={index}
                className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            경고 ({result.warnings.length})
          </h4>
          <div className="space-y-2">
            {result.warnings.map((warning, index) => (
              <div
                key={index}
                className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300"
              >
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {result.conflicts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            충돌 ({result.conflicts.length})
          </h4>
          <div className="space-y-2">
            {result.conflicts.map((conflict, index) => (
              <div
                key={index}
                className={`p-3 border rounded ${getSeverityColor(conflict.severity)}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-semibold uppercase">
                    {conflict.type}
                  </span>
                  <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                    {conflict.severity}
                  </span>
                </div>
                <p className="text-sm mb-2">{conflict.description}</p>
                {conflict.suggestion && (
                  <div className="text-xs bg-white/50 dark:bg-black/20 p-2 rounded">
                    <strong>제안:</strong> {conflict.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No issues */}
      {result.isValid &&
        result.errors.length === 0 &&
        result.warnings.length === 0 &&
        result.conflicts.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            이슈가 발견되지 않았습니다
          </div>
        )}
    </div>
  );
}
