'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Confetti from 'react-confetti';
import { SUCCESS_PAGE_MESSAGES, MEDIA_SIZES } from '@/lib/constants';
import { getEndMedia } from '@/lib/mediaUtils';
import { useNavigationGuard } from '@/lib/hooks/useNavigationGuard';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';
import CharacterAnimation from '@/components/CharacterAnimation';
import { useSound } from '@/lib/SoundContext';
import { ClickableHamzziVideo } from '@/components/ClickableHamzziVideo';

export default function MissionSuccessPage() {
  const router = useRouter();
  const { playSecondary, playClick } = useSound(); // 사운드 효과 Hook
  const [message, setMessage] = useState(SUCCESS_PAGE_MESSAGES[0]);
  const [endMediaPath, setEndMediaPath] = useState('');
  const [endMediaType, setEndMediaType] = useState<'image' | 'video'>('video');

  // 네비게이션 가드: 인증 필수
  useNavigationGuard({
    requireAuth: true,
  });

  useEffect(() => {
    // 랜덤 메시지 선택
    const randomIndex = Math.floor(Math.random() * SUCCESS_PAGE_MESSAGES.length);
    setMessage(SUCCESS_PAGE_MESSAGES[randomIndex]);

    // 랜덤 end 미디어 선택
    const media = getEndMedia();
    setEndMediaPath(media.path);
    setEndMediaType(media.type);

    // 페이지 로드 시 축제 효과 표시
    const duration = 4000; // 4초간 confetti 효과
    const timer = setTimeout(() => {
      // confetti 효과 종료 후 특별한 작업 필요 시 처리
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition variant="slideUp">
      <>
        {/* 축제 효과 */}
        <Confetti
        width={typeof window !== 'undefined' ? window.innerWidth : 0}
        height={typeof window !== 'undefined' ? window.innerHeight : 0}
        numberOfPieces={300}
        recycle={false}
        gravity={0.3}
      />

      {/* 축제 배경 애니메이션 */}
      <AnimatedBackground variant="success" />

      {/* 컨텐츠 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 animate-slide-up">응원하는 햄스터</h2>

        {/* 축하 타이틀 */}
        <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-4xl font-bold text-[var(--primary-gold)] mb-2">⭐ 미션 성공! ⭐</h1>
          <p className="text-lg">오늘 생존 미션 완료!</p>
        </div>

        {/* 햄찌 축하 이미지/영상 */}
        <div className="mb-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CharacterAnimation variant="celebrate">
            {endMediaPath && endMediaType === 'image' ? (
              <Image
                src={endMediaPath}
                alt="mission success"
                width={MEDIA_SIZES.HAMZZI_VIDEO.width}
                height={MEDIA_SIZES.HAMZZI_VIDEO.height}
                className="object-cover"
              />
            ) : endMediaPath && endMediaType === 'video' ? (
              <ClickableHamzziVideo
                src={endMediaPath}
                className={MEDIA_SIZES.HAMZZI_VIDEO.className}
                volume={0.9}
              />
            ) : null}
          </CharacterAnimation>
          <p className="text-center text-sm text-[var(--primary-pink)] mt-2">❤왕쟈...곤듀❤</p>
        </div>

        {/* 축하 메시지 카드 */}
        <div className="bg-[var(--bg-yellow)]/20 rounded-2xl p-6 mb-5 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <p className="text-lg font-semibold mb-2">{message.main}</p>
          <p className="text-lg font-semibold mb-2">{message.sub1}</p>
          <p className="text-2xl font-bold text-[var(--primary-gold)]">{message.sub2}</p>
        </div>

        {/* 버튼들 */}
        <button
          onClick={() => {
            playSecondary();
            router.push('/achievements');
          }}
          className="btn-base  w-full max-w-sm mb-3"
        >
          나의 달성도 보러가기 📊
        </button>

        <button
          onClick={() => {
            playClick();
            router.push('/home');
          }}
          className="text-[var(--primary-pink)] font-semibold hover:underline transition"
        >
          홈화면으로 가기 🏠
        </button>
      </div>
      </>
    </PageTransition>
  );
}
