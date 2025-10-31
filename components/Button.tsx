import React from 'react';

/**
 * 고급 버튼 컴포넌트
 *
 * 3가지 variant를 지원합니다:
 * - 'primary': 그라디언트 배경 (기본값, CTA용)
 * - 'secondary': 테두리만 있는 투명 버튼
 * - 'tertiary': 텍스트 링크 스타일 버튼
 *
 * 3가지 size를 지원합니다:
 * - 'sm': 작은 버튼
 * - 'md': 중간 버튼 (기본값)
 * - 'lg': 큰 버튼
 *
 * isLoading 속성으로 로딩 상태를 표현할 수 있습니다.
 *
 * @example
 * ```tsx
 * // Primary 버튼
 * <Button onClick={handleClick}>
 *   미션 시작! 🚀
 * </Button>
 *
 * // Secondary 버튼
 * <Button variant="secondary">
 *   취소
 * </Button>
 *
 * // 로딩 상태
 * <Button isLoading>
 *   처리 중...
 * </Button>
 *
 * // 비활성화
 * <Button disabled>
 *   비활성화
 * </Button>
 *
 * // 큰 사이즈
 * <Button size="lg">
 *   완료!
 * </Button>
 * ```
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 'primary': 그라디언트 (기본값), 'secondary': 테두리, 'tertiary': 텍스트 링크 */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** 'sm': 작음, 'md': 중간 (기본값), 'lg': 큼 */
  size?: 'sm' | 'md' | 'lg';
  /** 로딩 중 표시 여부 */
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  // 기본 스타일 (모든 버튼에 공통)
  const baseStyles = `
    btn-base
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  // variant별 스타일
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'text-[var(--primary-gold)] hover:text-[var(--primary-orange)] underline-offset-4 hover:underline',
  };

  // size별 스타일
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          {/* 로딩 스피너 */}
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          처리 중...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
