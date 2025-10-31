/**
 * soundEffects.ts - Web Audio API로 생성한 기본 효과음
 *
 * 외부 파일 없이 프로그래밍으로 간단한 효과음을 생성합니다.
 * 나중에 실제 .mp3 파일로 교체할 수 있습니다.
 *
 * @example
 * import { playClickSound, playSuccessSound } from '@/lib/soundEffects';
 * <button onClick={playClickSound}>Click me</button>
 */

// Safari 브라우저 호환성을 위한 Window 인터페이스 확장
interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Web Audio API로 간단한 beep 소리를 생성하여 재생합니다.
 *
 * @param frequency - 주파수 (Hz). 높을수록 높은 소리 (기본: 800)
 * @param duration - 재생 시간 (초) (기본: 0.05)
 * @param volume - 볼륨 (0.0 ~ 1.0) (기본: 0.3)
 */
function playBeep(frequency = 800, duration = 0.05, volume = 0.3) {
  try {
    // AudioContext 생성 (Safari 브라우저는 webkitAudioContext 사용)
    const audioContext = new (window.AudioContext || (window as WindowWithWebkit).webkitAudioContext!)();

    // Oscillator 생성 (소리 발생기)
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // 부드러운 사인파

    // Gain 노드 생성 (볼륨 조절)
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    // 연결: Oscillator → Gain → Destination (스피커)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 주파수 설정
    oscillator.frequency.value = frequency;

    // 재생 시작 및 종료
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (err) {
    console.warn('Web Audio API 재생 실패:', err);
  }
}

/**
 * 
 * 카테고리 선택 버튼 등에 사용
 */
export function playClickSound() {
    const audio = new Audio('/sounds/button_click.wav');
   audio.volume = 0.5;
   audio.play().catch(err => console.warn('Audio play failed:', err));
}
/**
 * 
 * "미션 시작하기" 같은 주요 CTA 버튼
 */
export function playPrimarySound() {
   const audio = new Audio('/sounds/mission_start.wav');
   audio.volume = 0.5;
   audio.play().catch(err => console.warn('Audio play failed:', err));
}

/**
 * Secondary 버튼 클릭 효과음 (부드럽고 낮은 톤)
 * "나중에 하기" 같은 보조 버튼에 사용
 */
export function playSecondarySound() {
  playBeep(300, 0.04, 0.25); // 300Hz, 40ms, 낮은 볼륨
}

/**
 * 성공 효과음 (상승하는 멜로디: 도-미-솔)
 * 미션 완료 시 사용
 */
export function playSuccessSound() {
    const audio = new Audio('/sounds/clear_click.wav');
   audio.volume = 0.5;
   audio.play().catch(err => console.warn('Audio play failed:', err));

}

/**
 * 배지 해금 효과음 (반짝이는 효과)
 * 새로운 배지 획득 시 사용
 */
export function playBadgeUnlockSound() {
  try {
    // AudioContext 생성 (Safari 브라우저는 webkitAudioContext 사용)
    const audioContext = new (window.AudioContext || (window as WindowWithWebkit).webkitAudioContext!)();

    // 빠르게 상승하는 주파수 (반짝임 효과)
    const startFreq = 800;
    const endFreq = 1600;
    const duration = 0.3;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'triangle'; // 부드러운 삼각파

    // 주파수를 시간에 따라 증가시킴 (상승 효과)
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);

    // 볼륨 페이드아웃
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (err) {
    console.warn('Badge unlock sound 재생 실패:', err);
  }
}

/**
 * 실패/포기 효과음 (하강하는 톤)
 * 미션 포기 시 사용 (선택사항)
 */
export function playFailureSound() {
  const audio = new Audio('/sounds/fail_click.wav');
   audio.volume = 0.5;
   audio.play().catch(err => console.warn('Audio play failed:', err));
}

/**
 * 전체 효과음 모음
 * 외부에서 import하여 사용할 수 있습니다.
 */
export const soundEffects = {
  click: playClickSound,
  primary: playPrimarySound,
  secondary: playSecondarySound,
  success: playSuccessSound,
  badgeUnlock: playBadgeUnlockSound,
  failure: playFailureSound,
};

/**
 * 나중에 실제 .mp3 파일로 교체하는 방법:
 *
 * 1. public/sounds/ 디렉토리에 파일 배치
 * 2. 각 함수를 다음과 같이 수정:
 *
 * export function playClickSound() {
 *   const audio = new Audio('/sounds/click.mp3');
 *   audio.volume = 0.5;
 *   audio.play().catch(err => console.warn('Audio play failed:', err));
 * }
 */
