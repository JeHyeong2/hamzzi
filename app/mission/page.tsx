'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { completeMission, abandonMission } from '@/lib/services';
import { ENCOURAGEMENT_MESSAGES, SUCCESS_MESSAGES, ABANDON_MESSAGES, CATEGORY_CONFIG } from '@/lib/constants';
import { getMissionVideoPath } from '@/lib/mediaUtils';
import { calculateOptimisticStreak } from '@/lib/utils';
import { useNavigationGuard } from '@/lib/hooks/useNavigationGuard';
import { useSmartNavigation } from '@/lib/hooks/useSmartNavigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';
import CharacterAnimation from '@/components/CharacterAnimation';
import { toast } from 'react-toastify';
import { useSound } from '@/lib/SoundContext';
import { ClickableHamzziVideo } from '@/components/ClickableHamzziVideo';

export default function MissionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, currentMission, setCurrentMission, setUser, updateStreak, incrementTotalCount, incrementCategoryScore, checkAndUnlockBadges, totalCompletedCount } = useStore();
  const { playPrimary, playSecondary, playSuccess, playFailure } = useSound(); // 사운드 효과 Hook

  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
  const [message, setMessage] = useState(ENCOURAGEMENT_MESSAGES[0]);
  const [missionVideoPath, setMissionVideoPath] = useState('');

  // 네비게이션 가드: 로그인 + 미션 필수 체크
  useNavigationGuard({
    requireAuth: true,
    requireMission: true,
  });

  // 스마트 네비게이션 (로딩 화면 포함, 애니메이션과 동기화)
  const { navigate, isNavigating } = useSmartNavigation({
    showLoading: true,
    loadingDuration: 2000, // 로딩 화면 2초 표시
  });

  // 자정 기준 남은 시간 계산 함수
  const calculateTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // 다음날 자정으로 설정

    const diffMs = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  };

  // 타이머: 자정까지의 남은 시간 실시간 업데이트
  useEffect(() => {
    // 초기값 설정
    setTimeRemaining(calculateTimeRemaining());

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 30초마다 메시지 변경
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessage(ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)]);
    }, 30000);

    return () => clearInterval(messageInterval);
  }, []);

  // 미션 영상 랜덤 선택 (페이지 로드 시 한 번만)
  useEffect(() => {
    if (currentMission?.category) {
      setMissionVideoPath(getMissionVideoPath(currentMission.category));
    }
  }, [currentMission?.category]);

  const handleComplete = () => {
    if (!user || !currentMission) return;

    // ========================================
    // OPTIMISTIC UPDATE: 즉시 UI 업데이트
    // ========================================

    // 1. Optimistic Streak 계산 (API 호출 없이 즉시 계산)
    const optimisticStreak = calculateOptimisticStreak(user);
    const today = new Date().toISOString();

    // 2. Zustand Store 즉시 업데이트
    setUser({
      ...user,
      current_streak: optimisticStreak,
      max_streak: Math.max(optimisticStreak, user.max_streak || 0),
      last_completed_date: today,
    });

    // 3. 카테고리 점수 즉시 증가
    incrementCategoryScore(currentMission.category);

    // 4. 총 달성 횟수 즉시 증가
    incrementTotalCount();

    // 5. 배지 해금 체크 (totalCompletedCount와 streak 기준으로 자동 해금)
    checkAndUnlockBadges();

    // 6. 성공 토스트 알림 즉시 표시
    const selectedMessage = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
    const praise = selectedMessage.replace('{streak}', optimisticStreak.toString());
    toast.success(praise, {
      autoClose: 2000,
    });

    // 7. 미션 상태 초기화
    const missionId = currentMission.id;
    const category = currentMission.category;
    setCurrentMission(null);

    // 8. 즉시 네비게이션 (2초 로딩 화면 표시)
    navigate('/mission-success');

    // ========================================
    // BACKGROUND SYNC: API 호출은 백그라운드에서 실행
    // ========================================
    completeMission(user, missionId, category)
      .then((actualStreak) => {
        // API 결과와 optimistic 값이 다른 경우 보정 (극히 드문 케이스)
        if (actualStreak !== optimisticStreak) {
          console.warn(
            `⚠️ Streak 값 불일치: optimistic=${optimisticStreak}, actual=${actualStreak}`
          );
          setUser({
            ...user,
            current_streak: actualStreak,
            max_streak: Math.max(actualStreak, user.max_streak || 0),
            last_completed_date: today,
          });
        }
      })
      .catch((error) => {
        console.error('❌ 백그라운드 미션 완료 오류:', error);
        // 에러 발생 시에도 UI는 이미 업데이트됨 (optimistic update)
      });
  };

  const handleAbandon = () => {
    if (!currentMission) return;

    // ========================================
    // OPTIMISTIC UPDATE: 즉시 UI 업데이트
    // ========================================

    // 1. 포기 토스트 알림 즉시 표시
    const abandonMessage = ABANDON_MESSAGES[Math.floor(Math.random() * ABANDON_MESSAGES.length)];
    toast.info(abandonMessage, {
      autoClose: 2000,
    });

    // 2. 미션 ID 저장 (API 호출용)
    const missionId = currentMission.id;

    // 3. 미션 상태 즉시 초기화
    setCurrentMission(null);

    // 4. 즉시 네비게이션 (2초 로딩 화면 표시)
    navigate('/mission-abandon');

    // ========================================
    // BACKGROUND SYNC: API 호출은 백그라운드에서 실행
    // ========================================
    abandonMission(missionId).catch((error) => {
      console.error('❌ 백그라운드 미션 포기 오류:', error);
      // 에러 발생 시에도 UI는 이미 업데이트됨 (optimistic update)
    });
  };

  // 카테고리별 테마 색상 (미션이 없으면 기본값 사용)
  const categoryTheme = currentMission ? CATEGORY_CONFIG[currentMission.category] : null;
  const headerBgColor = categoryTheme ? categoryTheme.themeColor : '#43A047';

  return (
    <PageTransition variant="fadeScale">
      <>
        {/* 카테고리별 배경 애니메이션 */}
        <AnimatedBackground
          variant="mission"
          category={currentMission?.category}
        />

        {/* 컨텐츠 (배경 위에 표시) */}
        <div
        className="relative z-10 min-h-screen overflow-hidden max-w-2xl mx-auto"
        style={{
          backgroundImage: `linear-gradient(135deg, ${categoryTheme?.backgroundColor}, ${categoryTheme?.themeColor}20)`,
          backgroundAttachment: 'fixed',
        }}
      >
        {/* 파도 애니메이션 오버레이 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 20px,
              ${categoryTheme?.themeColor}10 20px,
              ${categoryTheme?.themeColor}10 40px
            )`,
            backgroundPosition: '0 0',
            animation: 'bg-wave 4s linear infinite',
            pointerEvents: 'none',
          }}
        />
        <div className="relative z-10">
        {/* 상단 확인 헤더 - 카테고리 색상 적용 */}
        <div
          className="text-white p-4 flex items-center transition-all"
          style={{ backgroundColor: headerBgColor }}
        >
          <span className="text-lg mr-2">✓</span>
          <span className="font-semibold">미션 시작! 확인됨 👍</span>
        </div>

        <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
          <h2 className="text-xl font-semibold mb-3 animate-wave">
            응원하는 <span className="text-2xl font-bold" style={{ color: headerBgColor }}>{user?.name || ''}</span> 햄찌
          </h2>

          {/* 미션 제목 */}
          <p className="text-center mb-6 text-lg">
            오늘 미션 <span className="font-bold">[{currentMission?.title}]</span> 하는 중
          </p>

          {/* 타이머: 자정까지의 남은 시간 */}
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl px-8 py-5 shadow-lg mb-4 ">
            <p className="text-base text-gray-500 text-center mb-2">자정까지 남은 시간</p>
            <div className="text-6xl font-bold text-center font-mono">
              {timeRemaining.hours.toString().padStart(2, '0')}:{timeRemaining.minutes.toString().padStart(2, '0')}
            </div>
          </div>

          {/* 햄찌 응원 이미지 */}
          <div className="mb-6">
            <CharacterAnimation variant="encourage">
              {missionVideoPath && (
                <ClickableHamzziVideo
                  src={missionVideoPath}
                  className="w-64 h-64"
                  volume={0.8}
                />
              )}
            </CharacterAnimation>
          </div>

          {/* 응원 메시지 (fade-in/out 효과) */}
          <p className="text-[var(--primary-orange)] text-xl font-bold mb-8 animate-fade-in">{message}</p>

          {/* 버튼들 */}
          <button
            onClick={() => {
              playSuccess(); // 성공 효과음 (멜로디)
              handleComplete();
            }}
            disabled={isNavigating}
            className="btn-base w-full max-w-sm mb-3 transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${headerBgColor}, ${headerBgColor}dd)`,
              color: 'white',
              boxShadow: `0 4px 12px ${headerBgColor}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 12px 32px ${headerBgColor}60`;
              e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 12px ${headerBgColor}40`;
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
          >
            {isNavigating ? '처리 중...' : '오늘 미션 성공! 🎉'}
          </button>

          <button
            onClick={() => {
              playFailure(); // Failure 효과음
              handleAbandon();
            }}
            disabled={isNavigating}
            className="text-sm text-gray-600 underline hover:text-gray-800 disabled:opacity-50 transition"
          >
            다음에 다시 해보기
          </button>
        </div>
        </div>
      </div>
      </>
    </PageTransition>
  );
}
