'use client';

/**
 * 랜딩 페이지 (Google OAuth 로그인)
 *
 * 이전: 이름 입력 → 사용자 생성
 * 현재: Google 로그인 → 프로필 설정 (최초) 또는 홈 (기존 사용자)
 *
 * 작동 흐름:
 * 1. 인증되지 않음 → Google 로그인 버튼 표시
 * 2. Google 로그인 클릭 → Supabase OAuth 플로우 시작
 * 3. OAuth 성공 → /auth/callback 페이지로 리다이렉트
 * 4. Callback 페이지에서 최초/기존 사용자 판단 후 라우팅
 *
 * 자동 리다이렉트:
 * - 이미 로그인 + 프로필 있음 → /home
 * - 이미 로그인 + 프로필 없음 → /auth/setup-profile
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { useStore } from '@/lib/store';
import { useSound } from '@/lib/SoundContext';
import { signInWithGoogle } from '@/lib/auth/authHelpers';
import { getNormalMediaPath, getMediaType } from '@/lib/mediaUtils';
import { MEDIA_SIZES } from '@/lib/constants';
import AnimatedBackground from '@/components/AnimatedBackground';
import WaveText from '@/components/WaveText';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'react-toastify';

export default function LandingPage() {
  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useAuth();
  const { user } = useStore();
  const { playClick } = useSound(); // 사운드 효과 Hook

  const [mediaPath, setMediaPath] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // 페이지 로드 시 랜덤 미디어 선택
  useEffect(() => {
    setMediaPath(getNormalMediaPath());
  }, []);

  // 자동 리다이렉트: 이미 인증된 사용자는 적절한 페이지로 이동
  useEffect(() => {
    if (!isLoading && isAuthenticated && session) {
      if (user) {
        // 프로필이 있으면 홈으로
        router.push('/home');
      } else {
        // 프로필이 없으면 프로필 설정으로
        router.push('/auth/setup-profile');
      }
    }
  }, [isLoading, isAuthenticated, session, user, router]);

  /**
   * Google 로그인 버튼 클릭 핸들러
   * Supabase Auth를 사용하여 Google OAuth 플로우 시작
   */
  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // Google OAuth 성공 시 Supabase가 자동으로 /auth/callback으로 리다이렉트
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
      setIsSigningIn(false);
    }
  };

  // Auth 초기화 중이면 로딩 화면 표시
  if (isLoading) {
    return <LoadingScreen isVisible={true} />;
  }

  // 이미 인증된 상태면 로딩 화면 표시 (리다이렉트 중)
  if (isAuthenticated) {
    return <LoadingScreen isVisible={true} />;
  }

  return (
    <>
      {/* 애니메이션 배경 */}
      <AnimatedBackground variant="home" />

      {/* 컨텐츠 (배경 위에 표시) */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
        {/* 햄찌 미디어 */}
        <div className="mb-6 animate-slide-up">
          {mediaPath && (
            getMediaType(mediaPath) === 'video' ? (
              <video
                className={`${MEDIA_SIZES.HAMZZI_CHARACTER.className} rounded-lg`}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={mediaPath} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={mediaPath}
                alt="햄찌"
                width={MEDIA_SIZES.HAMZZI_CHARACTER.width}
                height={MEDIA_SIZES.HAMZZI_CHARACTER.height}
                className="object-cover rounded-lg"
                priority
              />
            )
          )}
        </div>

        {/* 환영 메시지 */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="mb-2 flex justify-center items-center gap-2">
            <WaveText
              text="안녕! 나는 김햄찌야"
              className="text-3xl font-bold"
            />
            <span className="text-3xl">🐹</span>
          </div>
          <p className="text-gray-600 mb-8 text-center">
            Google로 로그인하고 시작해볼래?
          </p>
        </div>

        {/* Google 로그인 버튼 */}
        <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="btn-base btn-primary w-full flex items-center justify-center gap-3 text-lg"
          >
            {/* Google 아이콘 */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#fff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#fff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#fff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isSigningIn ? 'Google로 로그인 중...' : 'Google로 시작하기'}
          </button>

          {/* 도움말 링크 */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                playClick();
                router.push('/help');
              }}
              className="text-sm text-gray-600 underline hover:text-gray-800"
            >
              도움이 필요하신가요?
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
