'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useNavigationGuard } from '@/lib/hooks/useNavigationGuard';
import { useSound } from '@/lib/SoundContext';
import { ClickableHamzziVideo } from '@/components/ClickableHamzziVideo';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';

interface RewardWithStatus {
  id: string;
  title: string;
  unlock_score: number;
  video_url: string;
  is_unlocked: boolean;
  can_unlock: boolean;
}

export default function RewardsPage() {
  const router = useRouter();
  const { user, totalCompletedCount } = useStore();
  const { playClick } = useSound(); // 사운드 효과 Hook
  const [rewards, setRewards] = useState<RewardWithStatus[]>([]);
  const [loading, setLoading] = useState(false);

  // 네비게이션 가드: 인증 필수
  useNavigationGuard({
    requireAuth: true,
  });

  /**
   * 리워드 데이터 생성
   * totalCompletedCount를 기반으로 리워드 언락 상태 결정
   */
  const initializeRewards = () => {
    const rewardList: RewardWithStatus[] = [
      {
        id: 'reward_1',
        title: '햄찌 응원 영상 1',
        unlock_score: 1,
        video_url: '/hamzzi_source/reward1.MP4',
        is_unlocked: totalCompletedCount >= 1,
        can_unlock: totalCompletedCount >= 1,
      },
      {
        id: 'reward_5',
        title: '햄찌 응원 영상 5',
        unlock_score: 5,
        video_url: '/hamzzi_source/reward5.MP4',
        is_unlocked: totalCompletedCount >= 5,
        can_unlock: totalCompletedCount >= 5,
      },
      {
        id: 'reward_10',
        title: '햄찌 응원 영상 10',
        unlock_score: 10,
        video_url: '/hamzzi_source/reward10.MP4',
        is_unlocked: totalCompletedCount >= 10,
        can_unlock: totalCompletedCount >= 10,
      },
      {
        id: 'reward_20',
        title: '햄찌 응원 영상 20',
        unlock_score: 20,
        video_url: '/hamzzi_source/reward20.MP4',
        is_unlocked: totalCompletedCount >= 20,
        can_unlock: totalCompletedCount >= 20,
      },
    ];
    setRewards(rewardList);
  };

  // 리워드 초기화
  useEffect(() => {
    if (user) {
      initializeRewards();
    }
  }, [user, totalCompletedCount]);

  const handleUnlockReward = async (rewardId: string) => {
    // 로컬에서는 이미 언락된 상태이므로 메시지만 표시
    alert('리워드를 언락했습니다! 🎉');
  };

  return (
    <PageTransition variant="fadeSlide">
      <>
        {/* 배경 애니메이션 */}
        <AnimatedBackground variant="home" />

        {/* 컨텐츠 */}
      <div className="relative z-10 min-h-screen p-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => {
          playClick();
          router.back();
        }} className="text-2xl">
          🐹
        </button>
        <button onClick={() => {
          playClick();
          router.push('/home');
        }} className="text-2xl">
          🏠
        </button>
      </div>

      <h1 className="text-xl font-bold text-center mb-6">응원하는 햄스터</h1>

      {/* 로딩 상태 */}
      {loading ? (
        <div className="text-center py-8">
          <p>리워드를 불러오는 중...</p>
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-8">
          <p>리워드가 없습니다.</p>
        </div>
      ) : (
        /* 리워드 목록 - Supabase에서 동적으로 로드됨 */
        <div className="space-y-4">
          {rewards.map((reward) => {
            const percentage = Math.min(
              (totalCompletedCount / reward.unlock_score) * 100,
              100
            );

            return (
              <div
                key={reward.id}
                className={`rounded-2xl p-6 shadow-md transition duration-300 ${
                  reward.is_unlocked
                    ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 border-2 border-[#FFD700] hover:shadow-lg hover:scale-105'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 opacity-60 border-2 border-gray-300'
                }`}
              >
                {reward.is_unlocked ? (
                  <>
                    {/* 해금된 리워드 */}
                    <div className="aspect-video bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden border-2 border-[#FFD700]">
                      <ClickableHamzziVideo
                        src={reward.video_url}
                        className="w-full h-full object-cover"
                        volume={0.9}
                      />
                    </div>
                    <p className="text-center font-bold text-lg">
                      ✨ {reward.title} ✨
                    </p>
                  </>
                ) : (
                  <>
                    {/* 잠긴 리워드 */}
                    <div className="flex flex-col items-center py-8">
                      <div className="text-6xl mb-4 opacity-50">🔒</div>
                      <p className="font-bold text-lg mb-2 text-gray-600">잠금!</p>
                      <p className="text-sm text-gray-500 mb-4">필요 {reward.unlock_score}점</p>

                      {/* 진행 바 */}
                      <div className="w-full max-w-xs mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>현재: {totalCompletedCount}점</span>
                          <span>/ {reward.unlock_score}점</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#FFD700] h-2 rounded-full transition"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* 언락 버튼 (조건을 만족하면 표시) */}
                      {reward.can_unlock && (
                        <button
                          onClick={() => handleUnlockReward(reward.id)}
                          className="bg-[#FFD700] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#FFC700] transition"
                        >
                          언락하기!
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
      </>
    </PageTransition>
  );
}
