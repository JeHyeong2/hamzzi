'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { ABANDON_PAGE_MESSAGES } from '@/lib/constants';
import { getFailMedia } from '@/lib/mediaUtils';
import { useNavigationGuard } from '@/lib/hooks/useNavigationGuard';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';
import CharacterAnimation from '@/components/CharacterAnimation';

export default function MissionAbandonPage() {
  const router = useRouter();
  const [message, setMessage] = useState(ABANDON_PAGE_MESSAGES[0]);
  const [failMediaPath, setFailMediaPath] = useState('');
  const [failMediaType, setFailMediaType] = useState<'image' | 'video'>('video');

  // 네비게이션 가드: 인증 필수
  useNavigationGuard({
    requireAuth: true,
  });

  useEffect(() => {
    // 랜덤 메시지 선택
    const randomIndex = Math.floor(Math.random() * ABANDON_PAGE_MESSAGES.length);
    setMessage(ABANDON_PAGE_MESSAGES[randomIndex]);

    // 랜덤 fail 미디어 선택
    const media = getFailMedia();
    setFailMediaPath(media.path);
    setFailMediaType(media.type);
  }, []);

  return (
    <PageTransition variant="fadeScale">
      <>
        {/* 폭죽 효과 */}
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
          numberOfPieces={300}
          recycle={false}
          gravity={0.3}
        />

        {/* 일반 배경 */}
        <AnimatedBackground variant="home" />

      {/* 컨텐츠 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-lg font-semibold mb-4 animate-slide-up">응원하는 햄스터</h2>

        {/* 위로 메시지 */}
        <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-4xl font-bold mb-2">{message.main}</h1>
          <p className="text-lg text-gray-600">다음엔 할 수 있다구!</p>
        </div>

        {/* 햄찌 위로 이미지/영상 */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CharacterAnimation variant="support">
            {failMediaPath && failMediaType === 'image' ? (
              <img
                src={failMediaPath}
                alt="mission end"
                className="w-64 h-64 object-cover"
              />
            ) : failMediaPath && failMediaType === 'video' ? (
              <video
                className="w-64 h-64"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={failMediaPath} type="video/mp4" />
              </video>
            ) : null}
          </CharacterAnimation>

        </div>

        {/* 위로 메시지 카드 */}
   
          <p className="text-4xl font-bold text-[var(--primary-orange)]">{message.sub}</p>
   
        {/* 홈 버튼 */}
        <button
          onClick={() => router.push('/home')}
          className="fixed bottom-10 text-[var(--primary-pink)] font-semibold hover:underline transition"
        >
          홈화면으로 가기 🏠
        </button>
      </div>
      </>
    </PageTransition>
  );
}
