import type { ErrorSeverity, ErrorCategory } from '@/types/errors';

export function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || name.includes('networkerror')) {
    return 'network';
  }
  if (message.includes('api') || message.includes('request') || message.includes('response')) {
    return 'api';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('auth') || message.includes('permission') || message.includes('unauthorized')) {
    return 'auth';
  }
  if (message.includes('performance') || message.includes('timeout')) {
    return 'performance';
  }
  if (message.includes('permission') || message.includes('forbidden')) {
    return 'permission';
  }

  return 'runtime';
}

export function determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
  const message = error.message.toLowerCase();

  // Critical errors
  if (
    message.includes('fatal') ||
    message.includes('crash') ||
    message.includes('unrecoverable')
  ) {
    return 'critical';
  }

  // Category-based severity
  if (category === 'auth' || category === 'permission') {
    return 'high';
  }
  if (category === 'api' || category === 'network') {
    return 'medium';
  }
  if (category === 'validation') {
    return 'low';
  }

  return 'medium';
}

export function sanitizeErrorForLogging(error: Error): {
  message: string;
  stack?: string;
  name: string;
} {
  // Remove sensitive information from error messages
  const sensitivePatterns = [
    /password[=:]\s*\S+/gi,
    /token[=:]\s*\S+/gi,
    /api[_-]?key[=:]\s*\S+/gi,
    /secret[=:]\s*\S+/gi,
    /authorization[=:]\s*\S+/gi,
  ];

  let sanitizedMessage = error.message;
  sensitivePatterns.forEach((pattern) => {
    sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
  });

  let sanitizedStack = error.stack;
  if (sanitizedStack) {
    sensitivePatterns.forEach((pattern) => {
      sanitizedStack = sanitizedStack!.replace(pattern, '[REDACTED]');
    });
  }

  return {
    message: sanitizedMessage,
    stack: sanitizedStack,
    name: error.name,
  };
}

export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatErrorForDisplay(error: Error, userFriendly: boolean = true): string {
  if (!userFriendly) {
    return error.message;
  }

  const category = classifyError(error);

  const friendlyMessages: Record<ErrorCategory, string> = {
    network: '네트워크 연결 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
    api: '서버와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    validation: '입력하신 정보가 올바르지 않습니다. 다시 확인해주세요.',
    auth: '인증에 실패했습니다. 다시 로그인해주세요.',
    runtime: '일시적인 오류가 발생했습니다. 페이지를 새로고침해주세요.',
    performance: '처리 시간이 초과되었습니다. 다시 시도해주세요.',
    permission: '이 작업을 수행할 권한이 없습니다.',
    unknown: '알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.',
  };

  return friendlyMessages[category];
}

export function isRetryableError(error: Error): boolean {
  const retryableCategories: ErrorCategory[] = ['network', 'api', 'performance'];
  const category = classifyError(error);
  return retryableCategories.includes(category);
}

export function shouldSendToErrorService(
  error: Error,
  environment: 'development' | 'production'
): boolean {
  if (environment === 'development') {
    return false;
  }

  const category = classifyError(error);
  const severity = determineSeverity(error, category);

  // Only send medium and above errors in production
  return ['critical', 'high', 'medium'].includes(severity);
}
