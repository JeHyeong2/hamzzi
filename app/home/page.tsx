'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore, Category } from '@/lib/store';
import { createMission } from '@/lib/services';
import { signOut } from '@/lib/auth/authHelpers';
import { CATEGORY_CONFIG, MEDIA_SIZES } from '@/lib/constants';
import { getNormalMediaPath, getMediaType } from '@/lib/mediaUtils';
import { useNavigationGuard } from '@/lib/hooks/useNavigationGuard';
import { useSmartNavigation } from '@/lib/hooks/useSmartNavigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';
import CharacterAnimation from '@/components/CharacterAnimation';
import WaveText from '@/components/WaveText';
import { useSound } from '@/lib/SoundContext';
import { ClickableHamzziVideo } from '@/components/ClickableHamzziVideo';

export default function HomePage() {
  const router = useRouter();
  const { user, setCurrentMission, checkAndUnlockBadges } = useStore();
  const { playClick, playPrimary } = useSound(); // 사운드 효과 Hook
  const [category, setCategory] = useState<Category>('meal');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mediaPath, setMediaPath] = useState('');

  // 네비게이션 가드: 로그인 체크 + 활성 미션 체크 (race condition 제거)
  useNavigationGuard({
    requireAuth: true,
    checkActiveMission: true,
  });

  // 스마트 네비게이션 (애니메이션과 동기화)
  const { navigate, isNavigating } = useSmartNavigation({
    showLoading: false,
    loadingDuration: 400,
  });

  // 페이지 로드 시 랜덤 미디어 선택
  useEffect(() => {
    setMediaPath(getNormalMediaPath());
  }, []);

  // 페이지 로드 시 배지 해금 체크 (조건을 만족한 배지 자동 해금)
  useEffect(() => {
    checkAndUnlockBadges();
  }, [checkAndUnlockBadges]);

  const handleStartMission = async () => {
    if (!title.trim()) {
      alert('미션을 입력해주세요!');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      /**
       * createMission() 함수가 이제 'in_progress' 상태로 미션을 직접 생성합니다.
       * 이전에는 'pending' → 'in_progress'로 이중 업데이트했던 비효율을 제거했습니다.
       */
      const mission = await createMission(user.id, category, title);
      if (mission) {
        setCurrentMission(mission);
        // 스마트 네비게이션 사용 (애니메이션과 동기화)
        navigate('/mission');
      }
    } catch (error) {
      console.error('미션 생성 오류:', error);
      alert('미션 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 로그아웃 처리
   * Supabase Auth 세션 종료 + localStorage/sessionStorage 클리어 후 랜딩 페이지로 이동
   */
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃에 실패했습니다.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <PageTransition variant="fadeSlide">
      <>
        {/* 애니메이션 배경 */}
        <AnimatedBackground variant="home" />

        {/* 컨텐츠 (배경 위에 표시) */}
        <div className="relative z-10 min-h-screen p-6 max-w-2xl mx-auto">
        {/* 상단 배지 & 아이콘들 */}
        <div className="flex justify-between items-center mb-6 animate-slide-up">
          {/* 미션성공한 배지 */}
          <div className="bg-[var(--primary-gold)] rounded-full px-4 py-2 flex items-center shadow-md">
            <span className="text-lg animate-scale-pulse-lg">🔥</span>
            <span className="ml-2 font-bold text-sm">미션성공한 {user?.current_streak || 0}일</span>
          </div>

          {/* 우측 아이콘들 */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                playClick();
                router.push('/rewards');
              }}
              className="text-2xl hover:scale-110 transition"
            >
              🎁
            </button>
            <button
              onClick={() => {
                playClick();
                router.push('/achievements');
              }}
              className="text-2xl hover:scale-110 transition"
            >
              📊
            </button>
            <button
              onClick={() => {
                playClick();
                router.push('/help');
              }}
              className="text-2xl hover:scale-110 transition"
            >
              💚
            </button>
          </div>
        </div>

        {/* 햄찌 캐릭터 */}
        <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="mb-4">
            <WaveText
              text={`응원하는 ${user?.name} 햄찌`}
              className="text-2xl font-bold"
            />
          </div>
          {mediaPath && (
            getMediaType(mediaPath) === 'video' ? (
              <ClickableHamzziVideo
                src={mediaPath}
                className={`mx-auto ${MEDIA_SIZES.HAMZZI_CHARACTER.className}`}
                volume={0.8}
              />
            ) : (
              <Image
                src={mediaPath}
                alt="응원하는 햄찌"
                width={MEDIA_SIZES.HAMZZI_CHARACTER.width}
                height={MEDIA_SIZES.HAMZZI_CHARACTER.height}
                className="mx-auto object-cover"
                priority
              />
            )
          )}
        </div>

        {/* 미션 제목 - 카드 밖 */}
        <h3 className="text-lg font-bold mb-4 text-center animate-scale-pulse">너의 생존 미션을 정해줘!</h3>
                {/* CATEGORY_CONFIG에서 중앙화된 카테고리 설정을 사용합니다 */}
          <div className="flex justify-center gap-3">
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playClick(); // 클릭 효과음 재생
                  setCategory(cat);
                }}
                className={`p-3 transition-all font-semibold ${
                  category === cat
                    ? `${CATEGORY_CONFIG[cat].bgColor} ${CATEGORY_CONFIG[cat].textColor} scale-110 shadow-lg rounded-xl`
                    : ' rounded-2xl backdrop-blur-sm hover:scale-105'
                } ${category !== cat ? 'animate-wiggle-tilt' : ''}`}
                style={category !== cat ? { animation: 'wiggle-tilt 0.5s ease-in-out 5s infinite' } : {}}
              >
                <div className="text-2xl mb-1">{CATEGORY_CONFIG[cat].emoji}</div>
                <div className="text-xs whitespace-nowrap">{CATEGORY_CONFIG[cat].label}</div>
              </button>
            ))}
          </div>
        {/* 미션 입력 카드 */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 shadow-md border border-white/30 animate-slide-up mt-5" style={{ animationDelay: '200ms' }}>
           <p className="text-sm font-bold text-center text-gray-600 mb-4">어렵게 하지마. 쉬워도 돼!</p>
          <p className="text-sm text-gray-600 mb-4 text-center">
            아침약 먹기 · 세수 하기 · 산책 5분<br />
            매우 간단하고, 꼭 하고 싶은걸 적어줘
          </p>

          {/* 미션 입력 */}
          <input
            type="text"
            placeholder="맛있는 거 챙겨 먹기"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStartMission()}
            className="input-base w-full mb-2 text-center"
          />

          {/* 가이드 메시지 */}
         
        
         {/* 시작 버튼 - 카드 밖 */}
        <button
          onClick={() => {
            playPrimary(); // Primary 버튼 효과음 재생
            handleStartMission();
          }}
          disabled={loading || isNavigating}
          className="btn-base w-full transition-all duration-200 animate-slide-up"
          style={{
            background: `linear-gradient(135deg, #FFC300, #FFB300)`,
            color: 'white',
            boxShadow: `0 4px 12px #FFC30040`,
            animationDelay: '300ms'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 12px 32px #FFC30060`;
            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 12px #FFC30040`;
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}
        >
          {loading || isNavigating ? '시작 중...' : '미션 시작! 🚀'}
        </button>
        </div>

        {/* 로그아웃 버튼 - 페이지 최하단 */}
        <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>

      </div>
      </>
    </PageTransition>
  );
}
