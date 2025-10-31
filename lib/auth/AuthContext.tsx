'use client';

/**
 * Auth Context Provider
 * Supabase Auth 세션 관리 및 사용자 프로필 동기화
 *
 * 주요 기능:
 * - Supabase Auth 세션 상태 관리
 * - 사용자 프로필 자동 로딩
 * - Auth 상태 변경 감지 및 동기화
 * - Zustand store와 통합
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Session } from '@supabase/supabase-js';
import { useStore } from '../store';
import {
  getSession,
  getUserProfileByAuthId,
  onAuthStateChange,
  signOut as authSignOut,
} from './authHelpers';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, reset } = useStore();

  /**
   * 세션 초기화
   * 앱 시작 시 Supabase Auth 세션 확인 및 사용자 프로필 로딩
   */
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        // 1. 현재 세션 가져오기
        const currentSession = await getSession();

        if (!isMounted) return;

        if (currentSession) {
          setSession(currentSession);

          // 2. 사용자 프로필 로딩
          const userProfile = await getUserProfileByAuthId(
            currentSession.user.id
          );

          if (isMounted && userProfile) {
            setUser(userProfile);
            console.log('✅ 사용자 프로필 로딩 완료:', userProfile.name);
          }
        }
      } catch (error) {
        console.error('Auth 초기화 오류:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  /**
   * Auth 상태 변경 리스너
   * 로그인/로그아웃 시 자동으로 세션 및 사용자 프로필 업데이트
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (event, newSession) => {
      console.log('🔐 Auth 이벤트:', event);

      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);

        // 사용자 프로필 로딩
        const userProfile = await getUserProfileByAuthId(newSession.user.id);
        if (userProfile) {
          setUser(userProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        reset(); // Zustand store 초기화
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, reset]);

  /**
   * 로그아웃 처리
   */
  const handleSignOut = async () => {
    try {
      await authSignOut();
      setSession(null);
      reset(); // Zustand store 초기화
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    session,
    isLoading,
    isAuthenticated: !!session,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
