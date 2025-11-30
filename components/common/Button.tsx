'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼의 시각적 스타일 변형
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

  /**
   * 버튼의 크기
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 로딩 상태 표시
   * @default false
   */
  loading?: boolean;

  /**
   * 전체 너비로 확장
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 버튼 왼쪽에 표시할 아이콘
   */
  leftIcon?: ReactNode;

  /**
   * 버튼 오른쪽에 표시할 아이콘
   */
  rightIcon?: ReactNode;

  /**
   * 버튼 내용
   */
  children?: ReactNode;
}

/**
 * 공통 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   클릭
 * </Button>
 *
 * <Button variant="secondary" loading leftIcon={<Plus />}>
 *   추가
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Variant 스타일
    const variantStyles = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:ring-primary-500 shadow-sm',
      secondary:
        'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500 shadow-sm',
      ghost:
        'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-400',
      icon: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-400',
    };

    // Size 스타일
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // Icon 크기
    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    // 비활성화 또는 로딩 상태
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // 기본 스타일
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant와 Size 스타일
          variantStyles[variant],
          sizeStyles[size],
          // 전체 너비
          fullWidth && 'w-full',
          // 아이콘 전용 버튼의 경우 정사각형으로
          variant === 'icon' && 'p-2 min-w-touch min-h-touch',
          // 커스텀 클래스
          className
        )}
        {...props}
      >
        {/* 로딩 스피너 */}
        {loading && <Loader2 className={cn('animate-spin', iconSizes[size])} />}

        {/* 왼쪽 아이콘 */}
        {!loading && leftIcon && (
          <span className={cn('inline-flex', iconSizes[size])}>{leftIcon}</span>
        )}

        {/* 버튼 텍스트 */}
        {children && <span>{children}</span>}

        {/* 오른쪽 아이콘 */}
        {!loading && rightIcon && (
          <span className={cn('inline-flex', iconSizes[size])}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
