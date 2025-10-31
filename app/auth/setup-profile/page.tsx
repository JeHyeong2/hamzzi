'use client';

/**
 * 프로필 설정 페이지 (최초 로그인 시)
 * Google 로그인 성공 후 사용자 이름을 입력받는 페이지
 *
 * 개선된 처리 흐름:
 * 1. store에서 Google 임시 정보 조회
 * 2. Google 계정 정보 (이메일, 프로필 사진) 표시
 * 3. 사용자 이름 입력
 * 4. 한번에 users 테이블에 프로필 생성 (auth_id 연결)
 * 5. store 임시 정보 삭제
 * 6. /home으로 리다이렉트
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { createUserProfile } from '@/lib/auth/authHelpers';
import { getNormalMediaPath, getMediaType } from '@/lib/mediaUtils';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'react-toastify';

export default function SetupProfilePage() {
  const router = useRouter();
  const { tempGoogleAuth, clearTempGoogleAuth, setUser } = useStore();

  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPath, setMediaPath] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('video');

  // 랜덤 미디어 선택
  useEffect(() => {
    const path = getNormalMediaPath();
    setMediaPath(path);
    setMediaType(getMediaType(path));
  }, []);

  // Google 정보가 없으면 랜딩 페이지로
  useEffect(() => {
    if (!tempGoogleAuth) {
      console.warn('⚠️ Google 정보 없음: 랜딩 페이지로 이동');
      router.push('/');
    }
  }, [tempGoogleAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 [handleSubmit] 프로필 생성 시작');
    console.log('📝 입력된 이름:', name);

    if (!name.trim()) {
      console.warn('⚠️ 이름이 입력되지 않음');
      toast.error('이름을 입력해주세요');
      return;
    }

    if (!tempGoogleAuth) {
      console.error('🚨 tempGoogleAuth가 없음!');
      toast.error('Google 로그인 정보가 없습니다');
      router.push('/');
      return;
    }

    console.log('📊 tempGoogleAuth 정보:', tempGoogleAuth);

    setIsSubmitting(true);

    try {
      console.log('🚀 createUserProfile 호출...');
      // 사용자 프로필 생성 (한번에 DB에 저장)
      const userProfile = await createUserProfile(
        tempGoogleAuth.authId,
        tempGoogleAuth.email,
        name,
        tempGoogleAuth.avatarUrl
      );

      console.log('📥 createUserProfile 응답:', userProfile);

      if (!userProfile) {
        throw new Error('프로필 생성 실패');
      }

      console.log('✅ 프로필 생성 완료:', userProfile);

      // 생성된 프로필을 store에 저장
      setUser({
        id: userProfile.id,
        name: userProfile.name,
        current_streak: userProfile.current_streak,
        max_streak: userProfile.max_streak,
        last_completed_date: userProfile.last_completed_date,
      });

      // store에서 임시 Google 정보 삭제
      clearTempGoogleAuth();

      toast.success(`환영합니다, ${name}님! 🎉`);
      router.push('/home');
    } catch (error) {
      console.error('프로필 생성 오류:', error);
      toast.error('프로필 생성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google 정보 로딩 중
  if (!tempGoogleAuth) {
    return <LoadingScreen isVisible={true} />;
  }

  return (
    <PageTransition variant="fadeScale">
      <>
        <AnimatedBackground variant="home" />

        <div className="relative z-10 min-h-screen p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
            {/* 제목 */}
            <h1 className="text-2xl font-bold text-center mb-2">
              처음 오셨네요! 👋
            </h1>
            <p className="text-center text-gray-600 mb-6">
              사용하실 이름을 알려주세요
            </p>

            {/* Google 계정 정보 */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
              {tempGoogleAuth.avatarUrl && (
                <img
                  src={tempGoogleAuth.avatarUrl}
                  alt="프로필"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {tempGoogleAuth.fullName || '사용자'}
                </p>
                <p className="text-xs text-gray-600">{tempGoogleAuth.email}</p>
              </div>
            </div>

            {/* 햄찌 이미지 */}
            <div className="flex justify-center mb-6">
              {mediaPath && (
                <>
                  {mediaType === 'video' ? (
                    <video
                      className="w-48 h-48 rounded-lg"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={mediaPath} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={mediaPath}
                      alt="햄찌"
                      className="w-48 h-48 rounded-lg object-cover"
                    />
                  )}
                </>
              )}
            </div>

            {/* 이름 입력 폼 */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="block mb-2 font-semibold">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="햄찌"
                  maxLength={20}
                  className="input-base"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="btn-base btn-primary w-full mt-4"
              >
                {isSubmitting ? '처리 중...' : '시작하기 🚀'}
              </button>
            </form>

            {/* 로그아웃 옵션 */}
            <p className="text-center text-xs text-gray-500 mt-4">
              다른 계정으로 시작하려면{' '}
              <button
                onClick={() => router.push('/')}
                className="text-[var(--primary-orange)] underline"
              >
                처음으로
              </button>
            </p>
          </div>
        </div>
      </>
    </PageTransition>
  );
}
