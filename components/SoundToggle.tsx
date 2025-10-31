/**
 * SoundToggle - 음소거 토글 버튼 컴포넌트
 *
 * 우측에 고정되어 전역 사운드 상태를 제어합니다 (위에서 18% 위치).
 * 듀오링고 스타일의 부드러운 애니메이션과 함께 제공됩니다.
 *
 * @example
 * <SoundToggle />
 */

'use client';

import { useSound } from '@/lib/SoundContext';

export function SoundToggle() {
  const { isMuted, toggleMute } = useSound();

  return (
    <button
      onClick={toggleMute}
      className="
        fixed top-[11%] right-3 z-50
        w-12 h-12
        bg-white
        rounded-full shadow-md
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:shadow-lg
        active:scale-95
        border-2 border-gray-200
      "
      aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
      title={isMuted ? '소리 켜기' : '소리 끄기'}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {isMuted ? '🔇' : '🔊'}
      </span>
    </button>
  );
}
