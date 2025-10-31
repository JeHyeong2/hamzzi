'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useNavigationGuard } from '@/lib/hooks/useNavigationGuard';
import { CATEGORY_CONFIG, BADGES_CONFIG } from '@/lib/constants';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';

export default function AchievementsPage() {
  const router = useRouter();
  const { user, categoryScores, totalCompletedCount, unlockedBadgeIds } = useStore();

  // 네비게이션 가드: 인증 필수
  useNavigationGuard({
    requireAuth: true,
  });

  const sleep = categoryScores.find((s) => s.category === 'sleep') || { score: 0, goal: 20 };
  const meal = categoryScores.find((s) => s.category === 'meal') || { score: 0, goal: 20 };
  const grooming = categoryScores.find((s) => s.category === 'grooming') || { score: 0, goal: 20 };
  const activity = categoryScores.find((s) => s.category === 'activity') || { score: 0, goal: 20 };

  const scores = { sleep, meal, grooming, activity };

  const progressBar = (score: number, goal: number) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition`}
        style={{
          width: `${(score / goal) * 100}%`,
          backgroundColor:
            score / goal < 0.5
              ? '#5B9BD5'
              : score / goal < 0.75
              ? '#FF8C00'
              : '#70AD47',
        }}
      />
    </div>
  );

  return (
    <PageTransition variant="fadeSlide">
      <>
        {/* 배경 애니메이션 */}
        <AnimatedBackground variant="home" />

      {/* 컨텐츠 */}
      <div className="relative z-10 min-h-screen p-6">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-4 text-2xl">
          🐹
        </button>
        <h1 className="text-xl font-bold">나의 달성도</h1>
      </div>

      {/* 총 달성 카드 */}
      <div className="bg-gradient-to-r from-[var(--primary-gold)] to-[var(--primary-orange)] rounded-2xl p-8 mb-6 text-center text-white shadow-md">
        <p className="text-sm mb-2">총 달성 횟수</p>
        <p className="text-5xl font-bold mb-2">{totalCompletedCount}회</p>
        <p className="text-xs">계속 쌓이면~</p>
      </div>

      {/* 연속 달성 배지 */}
      <div className="bg-[var(--primary-gold)] rounded-full px-4 py-2 inline-flex items-center shadow-md mb-6">
        <span className="text-lg animate-scale-pulse-lg">🔥</span>
        <span className="ml-2 font-bold text-sm">미션성공한 {user?.current_streak || 0}일</span>
      </div>

      {/* 카테고리별 진행률 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">카테고리별 진행률</h2>

        {/* CATEGORY_CONFIG에서 중앙화된 카테고리 설정을 사용합니다 */}
        <div className="grid gap-4">
          {(Object.entries(CATEGORY_CONFIG) as Array<[string, typeof CATEGORY_CONFIG.sleep]>).map(
            ([categoryKey, config]) => {
              const score = scores[categoryKey as keyof typeof scores];
              return (
                <div
                  key={categoryKey}
                  className="rounded-2xl p-4 shadow-md border-2"
                  style={{
                    backgroundColor: config.backgroundColor,
                    borderColor: config.themeColor,
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{config.emoji}</span>
                      <span className="font-bold" style={{ color: config.themeColor }}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: config.themeColor }}>
                      {score.score}/{score.goal}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(score.score / score.goal) * 100}%`,
                        backgroundColor: config.themeColor,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* 배지 모음 */}
      {/* BADGES_CONFIG에서 중앙화된 배지 설정을 사용합니다 */}
      <div>
        <h2 className="text-lg font-bold mb-4">배지 모음</h2>
        <div className="grid grid-cols-2 gap-4">
          {BADGES_CONFIG.map((badge) => {
            /**
             * 이전에는 클라이언트에서 totalCompletedCount와 streak으로
             * 배지 언락 여부를 재계산했습니다.
             *
             * 이제는 unlockedBadgeIds에서 직접 확인하여
             * Supabase 데이터와 동기화합니다.
             */
            const isUnlocked = unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`rounded-xl p-6 text-center transition duration-300 ${
                  isUnlocked
                    ? 'bg-[var(--bg-yellow)] border-2 border-[var(--primary-gold)] shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer'
                    : 'bg-gray-100 opacity-40 border-2 border-gray-300'
                }`}
              >
                <div className={`text-5xl mb-3 ${isUnlocked ? '' : 'grayscale'}`}>
                  {badge.emoji}
                </div>
                <p className="font-bold text-sm mb-1">{badge.display_name}</p>
                <p className={`text-xs ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      </div>
      </>
    </PageTransition>
  );
}
