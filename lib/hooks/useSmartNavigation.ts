/**
 * useSmartNavigation Hook
 *
 * 애니메이션과 동기화된 부드러운 페이지 전환을 제공하는 훅
 * 하드코딩된 setTimeout 대신 애니메이션 완료 후 자동으로 네비게이션 수행
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

interface SmartNavigationOptions {
  /**
   * 네비게이션 전 로딩 화면을 표시할지 여부
   * @default false
   */
  showLoading?: boolean;

  /**
   * 로딩 화면 표시 시간 (ms)
   * PageTransition의 duration과 일치하도록 설정
   * @default 500 (0.5초)
   */
  loadingDuration?: number;

  /**
   * 네비게이션 전 실행할 콜백
   */
  onBeforeNavigate?: () => void | Promise<void>;

  /**
   * 네비게이션 후 실행할 콜백
   */
  onAfterNavigate?: () => void;
}

export function useSmartNavigation(options: SmartNavigationOptions = {}) {
  const {
    showLoading = false,
    loadingDuration = 500, // PageTransition duration과 일치
    onBeforeNavigate,
    onAfterNavigate,
  } = options;

  const router = useRouter();
  const { setGlobalLoading } = useStore();
  const [isNavigating, setIsNavigating] = useState(false);

  /**
   * 애니메이션과 동기화된 스마트 네비게이션
   *
   * @param path - 이동할 경로
   * @param immediate - 즉시 이동 (애니메이션 없이)
   */
  const navigate = useCallback(
    async (path: string, immediate = false) => {
      // 이미 네비게이션 중이면 무시 (이중 클릭 방지)
      if (isNavigating) {
        return;
      }

      setIsNavigating(true);

      try {
        // 네비게이션 전 콜백 실행
        if (onBeforeNavigate) {
          await onBeforeNavigate();
        }

        // 즉시 이동하는 경우
        if (immediate) {
          router.push(path);
          onAfterNavigate?.();
          return;
        }

        // 로딩 화면 표시 (전역 상태 사용)
        if (showLoading) {
          setGlobalLoading(true);
        }

        // 애니메이션 duration 후 페이지 이동
        setTimeout(() => {
          router.push(path);
          setGlobalLoading(false);
          setIsNavigating(false);
          onAfterNavigate?.();
        }, loadingDuration);
      } catch (error) {
        console.error('Navigation error:', error);
        setIsNavigating(false);
        setGlobalLoading(false);
      }
    },
    [isNavigating, showLoading, loadingDuration, onBeforeNavigate, onAfterNavigate, router, setGlobalLoading]
  );

  /**
   * 뒤로 가기 (애니메이션 포함)
   */
  const goBack = useCallback(() => {
    if (isNavigating) return;

    setIsNavigating(true);

    if (showLoading) {
      setGlobalLoading(true);
    }

    setTimeout(() => {
      router.back();
      setGlobalLoading(false);
      setIsNavigating(false);
    }, loadingDuration);
  }, [isNavigating, showLoading, loadingDuration, router, setGlobalLoading]);

  /**
   * Replace 방식으로 네비게이션 (히스토리에 추가하지 않음)
   */
  const replace = useCallback(
    async (path: string) => {
      if (isNavigating) return;

      setIsNavigating(true);

      try {
        if (onBeforeNavigate) {
          await onBeforeNavigate();
        }

        if (showLoading) {
          setGlobalLoading(true);
        }

        setTimeout(() => {
          router.replace(path);
          setGlobalLoading(false);
          setIsNavigating(false);
          onAfterNavigate?.();
        }, loadingDuration);
      } catch (error) {
        console.error('Replace error:', error);
        setIsNavigating(false);
        setGlobalLoading(false);
      }
    },
    [isNavigating, showLoading, loadingDuration, onBeforeNavigate, onAfterNavigate, router, setGlobalLoading]
  );

  return {
    /** 스마트 네비게이션 실행 */
    navigate,
    /** 뒤로 가기 */
    goBack,
    /** Replace 네비게이션 */
    replace,
    /** 현재 네비게이션 진행 중인지 여부 */
    isNavigating,
  };
}
