'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { completeMission, abandonMission } from '@/lib/services';
import { ENCOURAGEMENT_MESSAGES, SUCCESS_MESSAGES, ABANDON_MESSAGES, CATEGORY_CONFIG } from '@/lib/constants';
import { getMissionVideoPath } from '@/lib/mediaUtils';
import { useNavigationGuard } from '@/lib/hooks/useNavigationGuard';
import { useSmartNavigation } from '@/lib/hooks/useSmartNavigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';
import CharacterAnimation from '@/components/CharacterAnimation';
import { toast } from 'react-toastify';

export default function MissionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, currentMission, setCurrentMission, setUser, updateStreak, incrementTotalCount, incrementCategoryScore, unlockBadge, totalCompletedCount } = useStore();

  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
  const [message, setMessage] = useState(ENCOURAGEMENT_MESSAGES[0]);
  const [loading, setLoading] = useState(false);

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

  const handleComplete = async () => {
    if (!user || !currentMission) return;

    setLoading(true);
    try {
      // completeMission에 사용자 정보 전달하고 새로운 streak 값 받기
      const newStreak = await completeMission(user, currentMission.id, currentMission.category);

      // Zustand store 업데이트 (streak과 last_completed_date)
      const today = new Date().toISOString();
      setUser({
        ...user,
        current_streak: newStreak,
        last_completed_date: today,
      });

      // 카테고리 점수 증가
      incrementCategoryScore(currentMission.category);

      // 총 달성 횟수 증가
      incrementTotalCount();

      // 새로운 totalCompletedCount 계산 (incrementTotalCount 직후 1 증가됨)
      const newTotalCount = totalCompletedCount + 1;

      // 배지 언락 확인
      // id='1': 첫 미션 완료 (1회)
      if (newTotalCount === 1) {
        unlockBadge('1');
      }
      // id='2': 5회 달성
      if (newTotalCount === 5) {
        unlockBadge('2');
      }
      // id='3': 10회 달성
      if (newTotalCount === 10) {
        unlockBadge('3');
      }
      // id='4': 3일 연속 달성
      if (newStreak === 3) {
        unlockBadge('4');
      }

      // 성공 토스트 알림 - SUCCESS_MESSAGES에서 랜덤 선택
      const selectedMessage = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
      const praise = selectedMessage.replace('{streak}', newStreak.toString());
      toast.success(praise, {
        autoClose: 2000,
      });

      setCurrentMission(null);
      // 스마트 네비게이션 사용 (로딩 화면 2초 표시 후 자동 전환)
      navigate('/mission-success');
    } catch (error) {
      console.error('미션 완료 오류:', error);
      toast.error('미션 완료에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAbandon = async () => {
    if (!currentMission) return;

    setLoading(true);
    setCurrentMission(null); // 먼저 미션 상태 초기화
    try {
      await abandonMission(currentMission.id);

      // 포기 토스트 알림 - ABANDON_MESSAGES에서 랜덤 선택
      const abandonMessage = ABANDON_MESSAGES[Math.floor(Math.random() * ABANDON_MESSAGES.length)];
      toast.info(abandonMessage, {
        autoClose: 2000,
      });

      // 스마트 네비게이션 사용 (로딩 화면 2초 표시 후 자동 전환)
      navigate('/mission-abandon');
    } catch (error) {
      console.error('미션 포기 오류:', error);
      alert('미션 포기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
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
        className="relative z-10 min-h-screen overflow-hidden"
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
          <h2 className="text-lg font-semibold mb-4">응원하는 햄스터</h2>

          {/* 미션 제목 */}
          <p className="text-center mb-6 text-sm">
            오늘 미션 <span className="font-bold">[{currentMission?.title}]</span> 하는 중
          </p>

          {/* 타이머: 자정까지의 남은 시간 */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl px-12 py-8 shadow-lg mb-8 border border-white/30">
            <p className="text-sm text-gray-500 text-center mb-2">자정까지 남은 시간</p>
            <div className="text-6xl font-bold text-center font-mono">
              {timeRemaining.hours.toString().padStart(2, '0')} : {timeRemaining.minutes.toString().padStart(2, '0')}
            </div>
          </div>

          {/* 햄찌 응원 이미지 */}
          <div className="mb-6">
            <CharacterAnimation variant="encourage">
              {currentMission?.category && (
                <video
                  className="w-64 h-64"
                  autoPlay
                  loop
                  muted
                  playsInline
                  key={currentMission.id}
                >
                  <source
                    src={getMissionVideoPath(currentMission.category)}
                    type="video/mp4"
                  />
                </video>
              )}
            </CharacterAnimation>
          </div>

          {/* 응원 메시지 (fade-in/out 효과) */}
          <p className="text-[var(--primary-orange)] text-xl font-bold mb-8 animate-fade-in">{message}</p>

          {/* 버튼들 */}
          <button
            onClick={handleComplete}
            disabled={loading || isNavigating}
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
            {loading || isNavigating ? '처리 중...' : '오늘 미션 성공! 🎉'}
          </button>

          <button
            onClick={handleAbandon}
            disabled={loading || isNavigating}
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
