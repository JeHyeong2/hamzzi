import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = 'sleep' | 'meal' | 'grooming' | 'activity';
export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export interface User {
  id: string;
  name: string;
  current_streak: number;
  max_streak: number;
  last_completed_date: string | null;
}

export interface Mission {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  status: MissionStatus;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CategoryScore {
  category: Category;
  score: number;
  goal: number;
}

export interface Badge {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_unlocked: boolean;
}

/**
 * Google OAuth 로그인 임시 정보
 * 프로필 설정 전까지 store에 보관
 */
export interface TempGoogleAuth {
  authId: string;        // Supabase Auth user ID
  email: string;
  avatarUrl?: string;
  fullName?: string;
}

interface AppState {
  // 사용자
  user: User | null;
  setUser: (user: User | null) => void;
  updateStreak: (streak: number) => void;

  // 현재 미션
  currentMission: Mission | null;
  setCurrentMission: (mission: Mission | null) => void;

  // 카테고리 점수
  categoryScores: CategoryScore[];
  setCategoryScores: (scores: CategoryScore[]) => void;
  incrementCategoryScore: (category: Category) => void;

  // 배지
  badges: Badge[];
  setBadges: (badges: Badge[]) => void;
  unlockedBadgeIds: string[];
  unlockBadge: (badgeId: string) => void;

  // 총 달성 횟수
  totalCompletedCount: number;
  setTotalCompletedCount: (count: number) => void;
  incrementTotalCount: () => void;

  // 전역 로딩 상태 (페이지 전환 시 로딩 화면)
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Google OAuth 임시 정보 (프로필 설정 전)
  tempGoogleAuth: TempGoogleAuth | null;
  setTempGoogleAuth: (auth: TempGoogleAuth | null) => void;
  clearTempGoogleAuth: () => void;

  // 초기화
  reset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      currentMission: null,
      categoryScores: [
        { category: 'sleep', score: 0, goal: 20 },
        { category: 'meal', score: 0, goal: 20 },
        { category: 'grooming', score: 0, goal: 20 },
        { category: 'activity', score: 0, goal: 20 },
      ],
      badges: [],
      unlockedBadgeIds: [],
      totalCompletedCount: 0,
      isGlobalLoading: false,
      tempGoogleAuth: null,

      // Actions
      setUser: (user) => set({ user }),

      updateStreak: (streak) =>
        set((state) => ({
          user: state.user ? { ...state.user, current_streak: streak } : null,
        })),

      setCurrentMission: (mission) => set({ currentMission: mission }),

      setCategoryScores: (scores) => set({ categoryScores: scores }),

      incrementCategoryScore: (category) =>
        set((state) => ({
          categoryScores: state.categoryScores.map((score) =>
            score.category === category
              ? { ...score, score: score.score + 1 }
              : score
          ),
        })),

      setBadges: (badges) => set({ badges }),

      unlockBadge: (badgeId) =>
        set((state) => ({
          unlockedBadgeIds: state.unlockedBadgeIds.includes(badgeId)
            ? state.unlockedBadgeIds
            : [...state.unlockedBadgeIds, badgeId],
        })),

      setTotalCompletedCount: (count) => set({ totalCompletedCount: count }),

      incrementTotalCount: () =>
        set((state) => ({
          totalCompletedCount: state.totalCompletedCount + 1,
        })),

      setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

      setTempGoogleAuth: (auth) => set({ tempGoogleAuth: auth }),

      clearTempGoogleAuth: () => set({ tempGoogleAuth: null }),

      reset: () =>
        set({
          user: null,
          currentMission: null,
          categoryScores: [
            { category: 'sleep', score: 0, goal: 20 },
            { category: 'meal', score: 0, goal: 20 },
            { category: 'grooming', score: 0, goal: 20 },
            { category: 'activity', score: 0, goal: 20 },
          ],
          badges: [],
          unlockedBadgeIds: [],
          totalCompletedCount: 0,
          tempGoogleAuth: null,
        }),
    }),
    {
      name: 'hamster-storage',
      partialize: (state) => ({
        // Google OAuth 임시 정보 (프로필 설정 중)
        tempGoogleAuth: state.tempGoogleAuth,
        // 사용자 정보 (로그인 후 세션 유지)
        user: state.user,
        // 카테고리 점수 (진행 상황 유지)
        categoryScores: state.categoryScores,
        // 총 달성 횟수
        totalCompletedCount: state.totalCompletedCount,
        // 배지 정보
        unlockedBadgeIds: state.unlockedBadgeIds,
      }),
    }
  )
);
