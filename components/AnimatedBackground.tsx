'use client';

import { Category } from '@/lib/store';
import { CATEGORY_CONFIG } from '@/lib/constants';

/**
 * 애니메이션 배경 컴포넌트
 *
 * 3가지 variant를 지원합니다:
 * - 'home': 자연스러운 느린 애니메이션 (홈페이지용)
 * - 'mission': 더 빠른 애니메이션 (미션 진행 중)
 * - 'success': 축제 같은 빠른 애니메이션 (성공 페이지)
 *
 * @param category - 미션 카테고리 (선택사항, mission variant에서 사용)
 *
 * @example
 * ```tsx
 * <AnimatedBackground variant="home" />
 * <AnimatedBackground variant="mission" category="meal" />
 * ```
 */

export interface AnimatedBackgroundProps {
  variant?: 'home' | 'mission' | 'success';
  category?: Category;
  className?: string;
}

export default function AnimatedBackground({
  variant = 'home',
  category,
  className = ''
}: AnimatedBackgroundProps) {
  /**
   * variant와 category에 따라 다른 애니메이션 설정을 반환
   * - 각 variant는 blob의 크기, 색상, 위치, 애니메이션 스피드가 다름
   * - mission에서 category가 주어지면 해당 테마 색상 사용
   */
  const getAnimationConfig = () => {
    // Mission에서 카테고리 색상 사용
    const categoryTheme = category ? CATEGORY_CONFIG[category] : null;

    switch (variant) {
      case 'mission':
        // 미션 진행 중: 더 빠른 애니메이션 (심박감 느낌)
        // 카테고리가 있으면 해당 색상 사용
        if (categoryTheme) {
          return {
            blobs: [
              {
                size: 'w-96 h-96',
                colors: categoryTheme.blobGradient.from + ' ' + categoryTheme.blobGradient.to,
                position: 'top-10 left-10',
                delay: '0s',
                duration: '2.5s', // 더 빠르게
              },
              {
                size: 'w-80 h-80',
                colors: categoryTheme.blobGradient.to + ' ' + categoryTheme.blobGradient.from,
                position: 'bottom-20 right-10',
                delay: '0.5s',
                duration: '3s', // 더 빠르게
              },
            ],
          };
        }

        // 기본 mission 색상
        return {
          blobs: [
            {
              size: 'w-96 h-96',
              colors: 'from-[var(--primary-orange)] to-[var(--primary-gold)]',
              position: 'top-10 left-10',
              delay: '0s',
              duration: '2.5s', // 더 빠르게
            },
            {
              size: 'w-80 h-80',
              colors: 'from-[var(--success-green)] to-[var(--accent-blue)]',
              position: 'bottom-20 right-10',
              delay: '0.5s',
              duration: '3s', // 더 빠르게
            },
          ],
        };

      case 'success':
        // 성공: 축제 같은 빠르고 화려한 애니메이션
        return {
          blobs: [
            {
              size: 'w-96 h-96',
              colors: 'from-[var(--primary-gold)] to-[var(--primary-pink)]',
              position: 'top-0 left-0',
              delay: '0s',
              duration: '2.5s',
            },
            {
              size: 'w-80 h-80',
              colors: 'from-[var(--success-green)] to-[var(--accent-teal)]',
              position: 'bottom-0 right-0',
              delay: '0.5s',
              duration: '2.5s',
            },
            {
              size: 'w-72 h-72',
              colors: 'from-[var(--primary-pink)] to-[var(--accent-purple)]',
              position: 'top-1/2 right-1/4',
              delay: '1s',
              duration: '2.5s',
            },
          ],
        };

      case 'home':
      default:
        // 홈: 자연스러운 느린 애니메이션
        return {
          blobs: [
            {
              size: 'w-96 h-96',
              colors: 'from-[var(--primary-gold)] to-[var(--primary-orange)]',
              position: 'top-10 left-10',
              delay: '0s',
              duration: '4s',
            },
            {
              size: 'w-80 h-80',
              colors: 'from-[var(--primary-pink)] to-[var(--accent-purple)]',
              position: 'bottom-20 right-10',
              delay: '2s',
              duration: '5s',
            },
            {
              size: 'w-72 h-72',
              colors: 'from-[var(--accent-teal)] to-[var(--accent-blue)]',
              position: 'top-1/2 right-1/4',
              delay: '4s',
              duration: '6s',
            },
          ],
        };
    }
  };

  const config = getAnimationConfig();

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* 베이스 배경: 크림색 */}
      <div className="absolute inset-0 bg-[var(--bg-cream)]" />

      {/* 애니메이션 blob들 */}
      {config.blobs.map((blob, idx) => (
        <div
          key={idx}
          className={`
            absolute ${blob.position} ${blob.size}
            bg-gradient-to-br ${blob.colors}
            rounded-full opacity-35 blur-3xl
            animate-float
          `}
          style={{
            // 각 blob마다 다른 애니메이션 시작 시간
            animationDelay: blob.delay,
            // 각 blob마다 다른 애니메이션 속도
            animationDuration: blob.duration,
          }}
        />
      ))}
    </div>
  );
}
