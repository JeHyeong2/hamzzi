/**
 * HamzziVideo - 햄찌 영상 컴포넌트 with 오디오 제어
 *
 * MP4 영상을 재생하면서 내장 오디오를 자동으로 재생합니다.
 * 전역 음소거 상태에 따라 오디오를 제어합니다.
 *
 * @example
 * <HamzziVideo
 *   src="/hamzzi_source/mission_eating1.MP4"
 *   volume={0.8}
 *   loop
 * />
 */

'use client';

import { useRef, useEffect } from 'react';
import { useSound } from '@/lib/SoundContext';

interface HamzziVideoProps {
  /** 영상 파일 경로 */
  src: string;

  /** 볼륨 (0.0 ~ 1.0, 기본값: 0.7) */
  volume?: number;

  /** 자동 재생 여부 (기본값: true) */
  autoPlay?: boolean;

  /** 반복 재생 여부 (기본값: true) */
  loop?: boolean;

  /** CSS 클래스 */
  className?: string;

  /** 화면에 맞춤 여부 */
  playsInline?: boolean;
}

/**
 * 햄찌 영상을 재생하는 컴포넌트
 * 전역 음소거 상태를 존중하여 오디오를 제어합니다.
 */
export function HamzziVideo({
  src,
  volume = 0.7,
  autoPlay = true,
  loop = true,
  className = 'w-48 h-48 rounded-2xl shadow-lg',
  playsInline = true,
}: HamzziVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isMuted } = useSound();

  // 볼륨 설정 (컴포넌트 마운트 시 및 volume prop 변경 시)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // 전역 음소거 상태에 따라 비디오 음소거 제어
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={isMuted} // 초기 음소거 상태
      playsInline={playsInline}
      className={className}
      // 브라우저 Autoplay 정책 대응을 위한 속성
      onLoadedMetadata={() => {
        // 영상 로드 완료 시 볼륨 설정
        if (videoRef.current) {
          videoRef.current.volume = volume;
        }
      }}
    />
  );
}
