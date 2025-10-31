/**
 * useNavigationGuard Hook
 *
 * 페이지 접근 권한을 체크하고 필요시 자동으로 리다이렉트하는 훅
 * Supabase Auth 세션을 기반으로 인증 상태를 확인하고,
 * 중복되는 로그인/미션 체크 로직을 중앙화하여 race condition 방지
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { getActiveMission } from '@/lib/services';

interface NavigationGuardOptions {
  /**
   * 인증이 필요한 페이지인지 여부
   * true인 경우:
   * - 세션이 없으면 → 랜딩 페이지 (/)로 리다이렉트
   * - 세션은 있지만 프로필이 없으면 → 프로필 설정 페이지 (/auth/setup-profile)로 리다이렉트
   */
  requireAuth?: boolean;

  /**
   * 활성 미션을 체크할지 여부
   * true인 경우 활성 미션이 있으면 미션 페이지로 리다이렉트
   */
  checkActiveMission?: boolean;

  /**
   * 활성 미션이 필수인지 여부
   * true인 경우 활성 미션이 없으면 홈으로 리다이렉트
   */
  requireMission?: boolean;

  /**
   * 네비게이션이 진행 중일 때의 콜백
   */
  onNavigating?: () => void;
}

export function useNavigationGuard(options: NavigationGuardOptions = {}) {
  const {
    requireAuth = false,
    checkActiveMission = false,
    requireMission = false,
    onNavigating,
  } = options;

  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useAuth();
  const { user, currentMission, setCurrentMission } = useStore();

  // 중복 실행 방지 플래그
  const isChecking = useRef(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Auth 초기화 중이면 대기
    if (isLoading) {
      return;
    }

    // 이미 체크 중이거나 이미 네비게이션이 발생했다면 실행하지 않음
    if (isChecking.current || hasNavigated.current) {
      return;
    }

    isChecking.current = true;

    const checkNavigation = async () => {
      try {
        // 1. 인증 체크 (Supabase Auth 세션 기반)
        if (requireAuth) {
          // 세션이 없으면 랜딩 페이지로
          if (!isAuthenticated || !session) {
            hasNavigated.current = true;
            onNavigating?.();
            router.push('/');
            return;
          }

          // 세션은 있지만 사용자 프로필이 없으면 프로필 설정 페이지로
          if (session && !user) {
            hasNavigated.current = true;
            onNavigating?.();
            router.push('/auth/setup-profile');
            return;
          }
        }

        // 2. 활성 미션 체크 (홈 페이지에서 사용)
        if (checkActiveMission && user && !hasNavigated.current) {
          const active = await getActiveMission(user.id);
          if (active) {
            setCurrentMission(active);
            hasNavigated.current = true;
            onNavigating?.();
            router.push('/mission');
            return;
          }
        }

        // 3. 미션 필수 체크 (미션 페이지에서 사용)
        if (requireMission && user && !currentMission && !hasNavigated.current) {
          const active = await getActiveMission(user.id);
          if (active) {
            setCurrentMission(active);
          } else {
            hasNavigated.current = true;
            onNavigating?.();
            router.push('/home');
            return;
          }
        }
      } finally {
        isChecking.current = false;
      }
    };

    checkNavigation();
  }, [session, isLoading, isAuthenticated, user, currentMission, requireAuth, checkActiveMission, requireMission, router, setCurrentMission, onNavigating]);

  return {
    /** 네비게이션이 발생했는지 여부 */
    hasNavigated: hasNavigated.current,
    /** 현재 체크 중인지 여부 */
    isChecking: isChecking.current,
  };
}
