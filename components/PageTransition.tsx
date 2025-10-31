'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fadeSlide' | 'fadeScale' | 'slideUp';
}

/**
 * 페이지 전환 애니메이션을 제공하는 래퍼 컴포넌트
 * Framer Motion을 사용하여 부드러운 진입/이탈 효과를 생성합니다
 *
 * AnimatePresence가 layout.tsx에 추가되어 exit 애니메이션이 정상 작동합니다.
 *
 * @param children - 애니메이션할 페이지 콘텐츠
 * @param variant - 애니메이션 스타일 (fadeSlide, fadeScale, slideUp)
 */
export default function PageTransition({
  children,
  variant = 'fadeSlide',
}: PageTransitionProps) {
  // 각 애니메이션 변형의 설정
  const variants = {
    // 페이드 인 + 좌측에서 우측으로 슬라이드
    fadeSlide: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 30 },
    },
    // 페이드 인 + 작은 상태에서 확대
    fadeScale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    // 페이드 인 + 하단에서 상단으로 슬라이드
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
  };

  const selectedVariant = variants[variant];

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{
        duration: 0.4, // useSmartNavigation의 loadingDuration과 동기화
        ease: 'easeInOut',
      }}
      // 전체 화면을 차지하도록 설정 (애니메이션 부드러움 향상)
      style={{
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {children}
    </motion.div>
  );
}
