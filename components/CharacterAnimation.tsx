'use client';

import { motion, type Transition } from 'framer-motion';
import React from 'react';

interface CharacterAnimationProps {
  variant?: 'celebrate' | 'encourage' | 'support' | 'welcome' | 'neutral';
  children: React.ReactNode;
}

/**
 * 캐릭터 애니메이션 컴포넌트
 * 페이지 상태에 따라 햄찌 캐릭터가 다른 반응을 보이도록 합니다
 *
 * @param variant - 애니메이션 타입:
 *   - celebrate: 성공 페이지에서 축하 점프 애니메이션
 *   - encourage: 미션 진행 중 응원 흔들기 애니메이션
 *   - support: 실패/포기 페이지에서 공감 애니메이션
 *   - welcome: 홈 페이지에서 환영 흔들기 애니메이션
 *   - neutral: 일반적인 부드러운 부상 애니메이션
 * @param children - 캐릭터 비디오/이미지 요소
 */
export default function CharacterAnimation({
  variant = 'neutral',
  children,
}: CharacterAnimationProps) {
  // 각 애니메이션 변형의 설정
  const animationVariants = {
    // 축하: 점프하는 애니메이션
    celebrate: {
      initial: { scale: 0.8, y: 0 },
      animate: {
        scale: [0.8, 1.1, 1.0, 1.15, 1.0],
        y: [0, -40, 0, -50, 0],
        rotate: [0, 5, 0, -5, 0],
      },
    },
    // 응원: 부드러운 흔들기
    encourage: {
      initial: { scale: 1, rotate: 0 },
      animate: {
        scale: [1, 1.05, 1, 1.05, 1],
        rotate: [0, -8, 0, 8, 0],
      },
    },
    // 공감: 부드러운 심호흡 애니메이션
    support: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.95, 1, 0.95, 1],
      },
    },
    // 환영: 천천히 확대 축소되는 애니메이션 (부드러운 호흡 느낌)
    welcome: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.12, 1],
      },
    },
    // 일반: 부드러운 부상 애니메이션
    neutral: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.03, 1],
      },
    },
  };

  const selectedVariant = animationVariants[variant];

  // 각 애니메이션의 트랜지션 설정
  const transitionSettings: Record<string, Transition> = {
    celebrate: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 3,
      ease: 'easeInOut',
    },
    encourage: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 2,
      ease: 'easeInOut',
    },
    support: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 2,
      ease: 'easeInOut',
    },
    welcome: {
      duration: 2.5,
      repeat: Infinity,
      repeatDelay: 1.5,
      ease: 'easeInOut',
    },
    neutral: {
      duration: 3,
      repeat: Infinity,
      repeatDelay: 1,
      ease: 'easeInOut',
    },
  };

  const getTransition = () => {
    const baseTransition = transitionSettings[variant];
    return {
      ...baseTransition,
      scale: { ...baseTransition },
      y: { ...baseTransition },
      rotate: { ...baseTransition },
    };
  };

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      transition={getTransition()}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transformOrigin: 'center bottom',
      }}
    >
      {children}
    </motion.div>
  );
}
