/**
 * useSound - 사운드 재생을 위한 커스텀 훅
 *
 * 버튼 클릭, 성공 효과음 등을 간편하게 재생할 수 있도록 도와줍니다.
 * Audio 객체를 생성하고 메모리 누수를 방지합니다.
 *
 * @example
 * const { play } = useSound('/sounds/button-click.mp3', { volume: 0.5 });
 * <button onClick={play}>Click me</button>
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * 사운드 재생 옵션 인터페이스
 */
interface SoundOptions {
  /** 볼륨 (0.0 ~ 1.0, 기본값: 0.5) */
  volume?: number;

  /** 재생 속도 (0.5 ~ 2.0, 기본값: 1.0) */
  playbackRate?: number;

  /** 반복 재생 여부 (기본값: false) */
  loop?: boolean;
}

/**
 * useSound Hook의 반환 타입
 */
interface UseSoundReturn {
  /** 사운드 재생 함수 */
  play: () => void;

  /** 사운드 정지 함수 */
  stop: () => void;

  /** 일시정지 함수 */
  pause: () => void;

  /** 재개 함수 */
  resume: () => void;
}

/**
 * 사운드 재생을 관리하는 커스텀 훅
 *
 * @param soundPath - 재생할 사운드 파일 경로 (예: '/sounds/button-click.mp3')
 * @param options - 사운드 재생 옵션 (volume, playbackRate, loop)
 * @returns play, stop, pause, resume 함수를 포함한 객체
 */
export function useSound(
  soundPath: string,
  options: SoundOptions = {}
): UseSoundReturn {
  // Audio 객체를 저장하는 ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 컴포넌트 마운트 시 Audio 객체 생성 및 초기화
  useEffect(() => {
    // Audio 객체 생성
    audioRef.current = new Audio(soundPath);

    // 볼륨 설정 (기본값: 0.5)
    audioRef.current.volume = options.volume ?? 0.5;

    // 재생 속도 설정 (기본값: 1.0)
    audioRef.current.playbackRate = options.playbackRate ?? 1.0;

    // 반복 재생 설정 (기본값: false)
    audioRef.current.loop = options.loop ?? false;

    // 컴포넌트 언마운트 시 Audio 객체 정리 (메모리 누수 방지)
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [soundPath, options.volume, options.playbackRate, options.loop]);

  /**
   * 사운드를 재생합니다.
   * 이미 재생 중이면 처음부터 다시 재생합니다.
   */
  const play = useCallback(() => {
    if (audioRef.current) {
      // 이미 재생 중이면 처음으로 되돌림
      audioRef.current.currentTime = 0;

      // 재생 시도 (브라우저 정책으로 실패할 수 있음)
      audioRef.current.play().catch((err) => {
        console.warn('Audio play failed:', err);
        // 브라우저 Autoplay 정책으로 재생 실패 시 경고만 출력
      });
    }
  }, []);

  /**
   * 사운드를 정지하고 처음으로 되돌립니다.
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  /**
   * 사운드를 일시정지합니다.
   * 현재 재생 위치는 유지됩니다.
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  /**
   * 일시정지된 사운드를 재개합니다.
   */
  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio resume failed:', err);
      });
    }
  }, []);

  return { play, stop, pause, resume };
}
