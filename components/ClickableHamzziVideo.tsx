/**
 * ClickableHamzziVideo - 클릭 시 소리가 한 번만 나는 햄찌 영상 컴포넌트
 *
 * 기본적으로 음소거(muted) 상태로 무한 루프 재생됩니다.
 * 사용자가 영상을 클릭하면:
 * 1. 소리가 켜지고 (unmuted)
 * 2. 루프가 해제되어 한 번만 재생되고
 * 3. 재생 완료 후 다시 음소거 + 루프 상태로 복귀
 *
 * @example
 * <ClickableHamzziVideo
 *   src="/hamzzi_source/normal4.MP4"
 *   className="w-64 h-64"
 * />
 */

'use client';

import { useRef, useState } from 'react';
import { useSound } from '@/lib/SoundContext';

interface ClickableHamzziVideoProps {
  /** 영상 파일 경로 */
  src: string;

  /** CSS 클래스 */
  className?: string;

  /** 초기 볼륨 (0.0 ~ 1.0, 기본값: 0.8) */
  volume?: number;
}

/**
 * 클릭 시 소리가 한 번만 나는 햄찌 영상 컴포넌트
 */
export function ClickableHamzziVideo({
  src,
  className = 'w-64 h-64',
  volume = 0.8,
}: ClickableHamzziVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isMuted: globalMuted } = useSound();
  const [isPlayingWithSound, setIsPlayingWithSound] = useState(false);

  /**
   * 영상 클릭 시 처리
   * 1. 소리 켜기 (unmuted)
   * 2. 루프 해제 (한 번만 재생)
   * 3. 처음부터 다시 재생
   */
  const handleVideoClick = () => {
    if (!videoRef.current) return;

    // 전역 음소거 상태면 클릭해도 소리 안 남
    if (globalMuted) return;

    const video = videoRef.current;

    // 현재 소리 재생 중이면 무시
    if (isPlayingWithSound) return;

    // 소리 재생 상태 활성화
    setIsPlayingWithSound(true);

    // 소리 켜기 + 루프 해제
    video.muted = false;
    video.loop = false;
    video.volume = volume;

    // 처음부터 재생
    video.currentTime = 0;
    video.play().catch((err) => {
      console.warn('Video play failed:', err);
    });
  };

  /**
   * 영상 재생 완료 시 처리
   * 1. 다시 음소거 (muted)
   * 2. 루프 재활성화
   * 3. 처음부터 다시 재생
   */
  const handleVideoEnded = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // 소리 재생 상태 해제
    setIsPlayingWithSound(false);

    // 다시 음소거 + 루프 활성화
    video.muted = true;
    video.loop = true;

    // 처음부터 다시 재생 (음소거 상태로 무한 루프)
    video.currentTime = 0;
    video.play().catch((err) => {
      console.warn('Video play failed:', err);
    });
  };

  return (
    <div className="relative group cursor-pointer">
      {/* 영상 */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className={`${className} transition-transform duration-200 ${
          !globalMuted ? 'group-hover:scale-105' : ''
        }`}
        onClick={handleVideoClick}
        onEnded={handleVideoEnded}
      />

      {/* 클릭 가능 힌트 (전역 음소거가 아닐 때만 표시, 처음부터 보임) */}
      {!globalMuted && !isPlayingWithSound && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded transition-all pointer-events-none group-hover:bg-black/80">
          🔊 클릭해서 소리 들어봐 (없을수도..🐹)
        </div>
      )}

      {/* 재생 중 표시 */}
      {isPlayingWithSound && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded animate-pulse">
          🎵 재생 중
        </div>
      )}
    </div>
  );
}
