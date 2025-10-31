'use client';

/**
 * Auth Error 페이지
 * 인증 과정에서 오류 발생 시 표시되는 페이지
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('알 수 없는 오류가 발생했습니다');

  useEffect(() => {
    const message = searchParams.get('message');

    if (message) {
      // 에러 메시지 매핑
      const errorMessages: Record<string, string> = {
        no_session: '로그인 세션을 찾을 수 없습니다',
        unauthorized: '권한이 없습니다',
        unexpected_error: '예상치 못한 오류가 발생했습니다',
        profile_creation_failed: '프로필 생성에 실패했습니다',
      };

      setErrorMessage(errorMessages[message] || decodeURIComponent(message));
    }
  }, [searchParams]);

  return (
    <PageTransition variant="fadeScale">
      <>
        <AnimatedBackground variant="home" />

        <div className="relative z-10 min-h-screen p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl text-center">
            {/* 에러 아이콘 */}
            <div className="text-6xl mb-4">❌</div>

            {/* 에러 메시지 */}
            <h1 className="text-2xl font-bold mb-2">로그인 오류</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>

            {/* 재시도 버튼 */}
            <button
              onClick={() => router.push('/')}
              className="btn-base btn-primary w-full mb-3"
            >
              다시 시도하기
            </button>

            {/* 도움말 링크 */}
            <button
              onClick={() => router.push('/help')}
              className="text-sm text-gray-600 underline hover:text-gray-800"
            >
              도움이 필요하신가요?
            </button>
          </div>
        </div>
      </>
    </PageTransition>
  );
}
