/**
 * SoundContext - 전역 사운드 상태 관리
 *
 * 앱 전체에서 사운드 음소거 상태를 관리하고,
 * Web Audio API 효과음을 제어합니다.
 *
 * @example
 * // app/layout.tsx
 * <SoundProvider>
 *   {children}
 * </SoundProvider>
 *
 * // 컴포넌트 내부
 * const { playClick, isMuted, toggleMute } = useSound();
 * <button onClick={playClick}>Click</button>
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { soundEffects } from './soundEffects';

/**
 * SoundContext의 타입 정의
 */
interface SoundContextType {
  /** 음소거 상태 (true: 음소거, false: 소리 켜짐) */
  isMuted: boolean;

  /** 음소거 토글 함수 */
  toggleMute: () => void;

  /** 음소거 상태 직접 설정 */
  setMuted: (muted: boolean) => void;

  /** 기본 클릭 효과음 재생 */
  playClick: () => void;

  /** Primary 버튼 효과음 재생 */
  playPrimary: () => void;

  /** Secondary 버튼 효과음 재생 */
  playSecondary: () => void;

  /** 성공 효과음 재생 */
  playSuccess: () => void;

  /** 배지 해금 효과음 재생 */
  playBadgeUnlock: () => void;

  /** 실패 효과음 재생 (선택사항) */
  playFailure: () => void;

  /** 배지 클릭 효과음 재생 (badge.wav) */
  playBadge: () => void;
}

// Context 생성
const SoundContext = createContext<SoundContextType | null>(null);

/**
 * SoundProvider - 전역 사운드 상태 Provider
 *
 * @param children - 자식 컴포넌트
 */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  // 음소거 상태 (localStorage에서 복원)
  const [isMuted, setIsMuted] = useState(false);

  // 컴포넌트 마운트 시 localStorage에서 음소거 상태 복원
  useEffect(() => {
    // localStorage에서 저장된 음소거 상태 읽기
    const savedMutedState = localStorage.getItem('hamzzi-sound-muted');
    if (savedMutedState !== null) {
      setIsMuted(savedMutedState === 'true');
    }

    // prefers-reduced-motion 설정 확인
    // 사용자가 애니메이션/소리를 줄이기를 원하면 자동으로 음소거
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setIsMuted(true);
      localStorage.setItem('hamzzi-sound-muted', 'true');
    }
  }, []);

  /**
   * 음소거 토글 함수
   * 상태를 반전시키고 localStorage에 저장합니다.
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      // localStorage에 저장하여 세션 간 유지
      localStorage.setItem('hamzzi-sound-muted', String(newState));
      return newState;
    });
  }, []);

  /**
   * 음소거 상태 직접 설정
   */
  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    localStorage.setItem('hamzzi-sound-muted', String(muted));
  }, []);

  /**
   * 기본 클릭 효과음 재생
   * 카테고리 선택 버튼 등에 사용
   */
  const playClick = useCallback(() => {
    if (!isMuted) {
      soundEffects.click();
    }
  }, [isMuted]);

  /**
   * Primary 버튼 효과음 재생
   * "미션 시작하기" 같은 주요 CTA 버튼에 사용
   */
  const playPrimary = useCallback(() => {
    if (!isMuted) {
      soundEffects.primary();
    }
  }, [isMuted]);

  /**
   * Secondary 버튼 효과음 재생
   * "나중에 하기" 같은 보조 버튼에 사용
   */
  const playSecondary = useCallback(() => {
    if (!isMuted) {
      soundEffects.secondary();
    }
  }, [isMuted]);

  /**
   * 성공 효과음 재생
   * 미션 완료 시 사용
   */
  const playSuccess = useCallback(() => {
    if (!isMuted) {
      soundEffects.success();
    }
  }, [isMuted]);

  /**
   * 배지 해금 효과음 재생
   * 새로운 배지 획득 시 사용
   */
  const playBadgeUnlock = useCallback(() => {
    if (!isMuted) {
      soundEffects.badgeUnlock();
    }
  }, [isMuted]);

  /**
   * 실패 효과음 재생
   * 미션 포기 시 사용 (선택사항)
   */
  const playFailure = useCallback(() => {
    if (!isMuted) {
      soundEffects.failure();
    }
  }, [isMuted]);

  /**
   * 배지 클릭 효과음 재생 (badge.wav)
   * 달성도 페이지에서 배지 클릭 시 사용
   */
  const playBadge = useCallback(() => {
    if (!isMuted) {
      const audio = new Audio('/sounds/badge.wav');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error('배지 사운드 재생 실패:', error);
      });
    }
  }, [isMuted]);

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        setMuted,
        playClick,
        playPrimary,
        playSecondary,
        playSuccess,
        playBadgeUnlock,
        playFailure,
        playBadge,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

/**
 * useSound - 전역 사운드 Context Hook
 *
 * SoundProvider 내부에서만 사용 가능합니다.
 *
 * @returns 사운드 재생 함수와 음소거 상태
 * @throws SoundProvider 외부에서 사용 시 에러
 *
 * @example
 * const { playClick, playSuccess, isMuted, toggleMute } = useSound();
 */
export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
}
