'use client';

/**
 * OAuth Callback 페이지
 * Google 로그인 후 리다이렉트되는 페이지
 *
 * 개선된 처리 흐름:
 * 1. URL에서 OAuth 코드 추출
 * 2. Supabase Auth로 세션 교환
 * 3. Google 정보를 store에 임시 저장
 * 4. /auth/setup-profile로 이동 (이름 입력)
 * 5. 이름 입력 후 한번에 DB에 프로필 생성
 *
 * 장점: DB SELECT 쿼리 불필요, RLS 정책 충돌 제거
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { getUserProfileByAuthId } from '@/lib/auth/authHelpers';
import { getCategoryScores, getUserBadges } from '@/lib/services';
import LoadingScreen from '@/components/LoadingScreen';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    setTempGoogleAuth,
    setUser,
    setCategoryScores,
    unlockBadge,
    setTotalCompletedCount
  } = useStore();

  useEffect(() => {
    async function handleCallback() {
      try {
        // 1. URL 해시에서 Auth 토큰 추출 및 세션 설정
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          console.error('🚨 Auth 콜백 오류:', authError);
          setError('로그인 처리 중 오류가 발생했습니다');
          router.push('/auth/error?message=' + encodeURIComponent(authError.message));
          return;
        }

        const session = data.session;

        if (!session) {
          console.error('🚨 세션이 없습니다');
          setError('로그인 세션을 찾을 수 없습니다');
          router.push('/auth/error?message=no_session');
          return;
        }

        // 2. DB에서 프로필 확인 (재로그인 체크)
        let userProfile = null;
        try {
          userProfile = await getUserProfileByAuthId(session.user.id);
        } catch (err) {
          // RLS 에러 발생 시 첫 로그인으로 처리
          console.warn('⚠️ 프로필 조회 실패 (RLS 또는 권한 문제):', err);
        }

        if (userProfile) {
          // 프로필이 이미 존재 → 재로그인 → DB 정보를 store에 저장 후 홈으로

          // 1. 기본 사용자 정보 저장
          setUser({
            id: userProfile.id,
            name: userProfile.name,
            current_streak: userProfile.current_streak,
            max_streak: userProfile.max_streak,
            last_completed_date: userProfile.last_completed_date,
          });

          // 2. 카테고리 점수 조회 및 저장
          const categoryScores = await getCategoryScores(userProfile.id);
          if (categoryScores.length > 0) {
            setCategoryScores(categoryScores);
          }

          // 3. 배지 조회 및 저장
          const unlockedBadgeIds = await getUserBadges(userProfile.id);
          if (unlockedBadgeIds.length > 0) {
            unlockedBadgeIds.forEach((badgeId) => unlockBadge(badgeId));
          }

          // 4. 완료된 미션 개수 조회 (총 달성 횟수)
          const { count: completedCount } = await supabase
            .from('missions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userProfile.id)
            .eq('status', 'completed');

          const totalCount = completedCount || 0;
          setTotalCompletedCount(totalCount);

          router.push('/home');
          return;
        }

        // 3. 프로필 없음 → 첫 로그인 → Google 정보를 store에 임시 저장
        setTempGoogleAuth({
          authId: session.user.id,
          email: session.user.email || '',
          avatarUrl: session.user.user_metadata.avatar_url,
          fullName: session.user.user_metadata.full_name,
        });

        // 4. 프로필 설정 페이지로 이동 (이름 입력)
        router.push('/auth/setup-profile');
      } catch (err) {
        console.error('콜백 처리 예외:', err);
        setError('예상치 못한 오류가 발생했습니다');
        router.push('/auth/error?message=unexpected_error');
      }
    }

    handleCallback();
  }, [router, setTempGoogleAuth, setUser, setCategoryScores, unlockBadge, setTotalCompletedCount]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-cream)]">
      <LoadingScreen isVisible={true} />
      {error && (
        <div className="mt-4 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-2 text-[var(--primary-orange)] underline"
          >
            처음으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
