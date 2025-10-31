import React from 'react';

/**
 * 재사용 가능한 카드 컴포넌트
 *
 * 2가지 variant를 지원합니다:
 * - 'elevated': 배경색이 있고 그림자가 있는 카드 (기본값)
 * - 'outlined': 투명한 배경에 테두리만 있는 카드
 *
 * interactive 속성을 true로 설정하면 호버 시 위로 떠오르는 효과가 생깁니다.
 *
 * @example
 * ```tsx
 * // 기본 카드
 * <Card>
 *   카드 내용
 * </Card>
 *
 * // 클릭 가능한 카드
 * <Card interactive onClick={() => console.log('clicked')}>
 *   클릭 가능한 카드
 * </Card>
 *
 * // outlined 스타일
 * <Card variant="outlined">
 *   테두리 카드
 * </Card>
 * ```
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 호버 시 위로 떠오르는 효과 */
  interactive?: boolean;
  /** 'elevated': 배경/그림자 있음, 'outlined': 테두리만 있음 */
  variant?: 'elevated' | 'outlined';
  children: React.ReactNode;
}

export default function Card({
  interactive = false,
  variant = 'elevated',
  className = '',
  children,
  ...props
}: CardProps) {
  // 기본 스타일 (모든 카드에 공통)
  const baseStyles = `
    rounded-2xl transition-all duration-300 ease-out
  `;

  // variant별 스타일
  const variantStyles = {
    elevated: `
      bg-white/80 backdrop-blur-md shadow-md
      border border-white/30
      ${interactive ? 'hover:shadow-lg hover:scale-102 hover:bg-white/90 cursor-pointer active:scale-98' : ''}
    `,
    outlined: `
      bg-transparent
      border-2 border-white/20
      ${interactive ? 'hover:border-white/40 hover:bg-white/5 cursor-pointer' : ''}
    `,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
