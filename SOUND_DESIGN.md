# 🎵 Hamzzi 사운드 인터랙션 디자인 시스템

---

## 🎯 프로젝트 목표

Duolingo 스타일의 **인터랙티브한 사운드 피드백**을 통해:
- 버튼 클릭 시 즉각적인 청각 피드백 제공
- 햄찌 MP4 동영상 재생 시 자동으로 오디오 재생
- 사용자 engagement와 만족도 향상

---

## 📊 사운드 시스템 아키텍처

### 1. 사운드 타입 분류

| 사운드 타입 | 용도 | 파일 포맷 | 예시 |
|------------|------|----------|------|
| **Button Click** | 모든 버튼 클릭 | MP3/WAV (작은 파일) | 톡, 팝, 딩 |
| **Success** | 성공/완료 액션 | MP3 | 성공음, 축하음 |
| **Video Audio** | 햄찌 영상 오디오 | MP4 내장 오디오 | 햄찌 소리 |
| **Transition** | 페이지 전환 | MP3 (선택사항) | 스와이프 소리 |

---

## 🔊 사운드 파일 구조

### 추천 디렉토리 구조
```
public/
├── sounds/
│   ├── button-click.mp3       # 기본 버튼 클릭
│   ├── button-primary.mp3     # Primary 버튼 (골드)
│   ├── button-success.mp3     # 성공 버튼
│   ├── button-secondary.mp3   # Secondary 버튼
│   ├── success.mp3            # 미션 성공 효과음
│   ├── failure.mp3            # 미션 포기 효과음 (선택)
│   └── badge-unlock.mp3       # 배지 해금 효과음
└── hamzzi_source/
    └── [기존 MP4 파일들]       # 햄찌 영상 + 내장 오디오
```

---

## 🎨 사운드별 세부 디자인

### 1. 버튼 클릭 사운드

#### Primary Button (Gold 그라디언트)
```yaml
sound: button-primary.mp3
특징:
  - 명확하고 긍정적인 톤 (200-400Hz)
  - Duration: 50-100ms
  - Volume: 0.5-0.7
  - 예시: "딩!" 또는 "팡!"
사용처:
  - "미션 시작하기"
  - "미션 성공"
  - 주요 CTA 버튼
```

#### Secondary Button
```yaml
sound: button-secondary.mp3
특징:
  - 부드럽고 낮은 톤 (100-200Hz)
  - Duration: 30-50ms
  - Volume: 0.4-0.6
  - 예시: "톡" 또는 "틱"
사용처:
  - "나중에 하기"
  - "달성도 보러가기"
  - 보조 액션 버튼
```

#### Category Selection Button
```yaml
sound: button-click.mp3
특징:
  - 중립적이고 짧은 톤
  - Duration: 20-40ms
  - Volume: 0.3-0.5
  - 예시: "틱" 또는 "클릭"
사용처:
  - 수면, 식사, 그루밍, 활동 카테고리 버튼
```

### 2. Success/Achievement 사운드

#### Mission Success
```yaml
sound: success.mp3
특징:
  - 상승하는 멜로디 (도-미-솔)
  - Duration: 500-1000ms
  - Volume: 0.6-0.8
  - 예시: 레벨업 소리
사용처:
  - 미션 완료 시
  - 배지 해금 시
```

#### Badge Unlock
```yaml
sound: badge-unlock.mp3
특징:
  - 반짝이는 효과음 + 짧은 팡파레
  - Duration: 300-800ms
  - Volume: 0.6-0.8
사용처:
  - 새로운 배지 해금될 때
  - 달성도 페이지 진입 시 (선택)
```

### 3. Video Audio

#### MP4 영상 오디오 자동 재생
```yaml
특징:
  - MP4 내장 오디오 자동 재생
  - 영상 시작과 동시에 오디오 재생
  - Volume: 0.7-0.9 (비디오가 메인)
  - 영상 종료 시 자동 정지

대상 영상:
  - mission_*.MP4 (미션 진행 중 응원 영상)
  - reward*.MP4 (성공 페이지 축하 영상)
  - mission_end*.MP4 (포기 페이지 위로 영상)
  - normal*.MP4 (일반 햄찌 영상)
  - loading.MP4 (로딩 영상)
```

---

## 🔧 기술 구현 방식

### 1. Sound Manager 시스템

#### A. useSound 커스텀 훅 (추천)
```typescript
// lib/useSound.ts
import { useCallback, useRef, useEffect } from 'react';

interface SoundOptions {
  volume?: number;      // 0.0 ~ 1.0
  playbackRate?: number; // 0.5 ~ 2.0 (재생 속도)
  loop?: boolean;
}

export function useSound(soundPath: string, options: SoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Audio 객체 생성 및 초기화
    audioRef.current = new Audio(soundPath);
    audioRef.current.volume = options.volume ?? 0.5;
    audioRef.current.playbackRate = options.playbackRate ?? 1.0;
    audioRef.current.loop = options.loop ?? false;

    // 메모리 누수 방지
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [soundPath, options.volume, options.playbackRate, options.loop]);

  const play = useCallback(() => {
    if (audioRef.current) {
      // 이미 재생 중이면 처음부터 다시 재생
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.warn('Audio play failed:', err);
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
}
```

**사용 예시**:
```typescript
// 컴포넌트 내부
const { play: playClick } = useSound('/sounds/button-primary.mp3', { volume: 0.6 });

<button onClick={() => {
  playClick();
  handleMissionStart();
}}>
  미션 시작하기
</button>
```

#### B. 전역 Sound Context (선택사항)
```typescript
// lib/SoundContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (soundPath: string, volume?: number) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const playSound = useCallback((soundPath: string, volume = 0.5) => {
    if (isMuted) return;

    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play().catch(err => console.warn('Audio play failed:', err));
  }, [isMuted]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useGlobalSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useGlobalSound must be used within SoundProvider');
  }
  return context;
}
```

**사용 예시**:
```typescript
// app/layout.tsx에 Provider 추가
<SoundProvider>
  {children}
</SoundProvider>

// 컴포넌트 내부
const { playSound, isMuted, toggleMute } = useGlobalSound();

<button onClick={() => playSound('/sounds/button-click.mp3', 0.5)}>
  Click me
</button>
```

### 2. Video Audio 자동 재생

#### 기본 구현
```typescript
// 컴포넌트 내부
<video
  src="/hamzzi_source/mission_eating1.MP4"
  autoPlay
  muted={false}  // 오디오 재생 허용
  playsInline
  className="..."
/>
```

#### 볼륨 제어가 필요한 경우
```typescript
'use client';

import { useRef, useEffect } from 'react';

export function HamzziVideo({ src, volume = 0.8 }: { src: string; volume?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted={false}
      playsInline
      className="rounded-2xl shadow-lg"
    />
  );
}
```

---

## 📋 구현 로드맵

### Phase 1: 사운드 파일 준비 (1-2일)

**Task 1.1: 효과음 소스 구하기**
- 무료 효과음 사이트 활용:
  - [Freesound.org](https://freesound.org)
  - [Zapsplat](https://www.zapsplat.com)
  - [Mixkit](https://mixkit.co/free-sound-effects/)
- 필요한 효과음:
  - ✅ button-click.mp3 (기본 클릭)
  - ✅ button-primary.mp3 (주요 CTA)
  - ✅ button-secondary.mp3 (보조 버튼)
  - ✅ success.mp3 (성공 효과음)
  - ✅ badge-unlock.mp3 (배지 해금)

**Task 1.2: 파일 최적화**
```bash
# MP3 파일 크기 줄이기 (ffmpeg 사용)
ffmpeg -i input.mp3 -b:a 128k output.mp3

# Duration 자르기
ffmpeg -i input.mp3 -ss 0 -t 0.1 output.mp3  # 0.1초만
```

**Task 1.3: public/sounds/ 디렉토리 생성 및 배치**
```
public/
└── sounds/
    ├── button-click.mp3
    ├── button-primary.mp3
    ├── button-secondary.mp3
    ├── success.mp3
    └── badge-unlock.mp3
```

---

### Phase 2: Sound Manager 구축 (2-3일)

**Task 2.1: useSound Hook 생성**
- 파일: `lib/useSound.ts`
- 기능:
  - Audio 객체 생성 및 관리
  - play() / stop() 함수 제공
  - 볼륨/재생속도 제어
  - 메모리 누수 방지

**Task 2.2: SoundContext 생성 (선택사항)**
- 파일: `lib/SoundContext.tsx`
- 기능:
  - 전역 음소거 상태 관리
  - 간편한 playSound() API
  - 모든 페이지에서 사용 가능

**Task 2.3: 테스트 페이지 생성**
```typescript
// app/sound-test/page.tsx (임시 테스트용)
'use client';

import { useSound } from '@/lib/useSound';

export default function SoundTestPage() {
  const { play: playClick } = useSound('/sounds/button-click.mp3');
  const { play: playPrimary } = useSound('/sounds/button-primary.mp3');
  const { play: playSuccess } = useSound('/sounds/success.mp3');

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">사운드 테스트</h1>
      <button onClick={playClick}>Basic Click</button>
      <button onClick={playPrimary}>Primary Button</button>
      <button onClick={playSuccess}>Success Sound</button>
    </div>
  );
}
```

---

### Phase 3: 버튼 사운드 적용 (3-4일)

**Task 3.1: Home Page 버튼**
- 파일: `app/home/page.tsx`
- 적용 대상:
  - 카테고리 선택 버튼 (4개) → `button-click.mp3`
  - "미션 시작하기" 버튼 → `button-primary.mp3`

**예시 코드**:
```typescript
'use client';

import { useSound } from '@/lib/useSound';

export default function HomePage() {
  const { play: playClick } = useSound('/sounds/button-click.mp3', { volume: 0.5 });
  const { play: playPrimary } = useSound('/sounds/button-primary.mp3', { volume: 0.6 });

  // ... 기존 코드

  return (
    <div>
      {/* 카테고리 버튼 */}
      <button
        onClick={() => {
          playClick();
          setSelectedCategory('sleep');
        }}
        className="..."
      >
        🌙 수면
      </button>

      {/* CTA 버튼 */}
      <button
        onClick={() => {
          playPrimary();
          handleStartMission();
        }}
        className="..."
      >
        미션 시작하기
      </button>
    </div>
  );
}
```

**Task 3.2: Mission Page 버튼**
- 파일: `app/mission/page.tsx`
- 적용 대상:
  - "미션 성공" 버튼 → `button-primary.mp3` + `success.mp3` (순차 재생)
  - "나중에 하기" 버튼 → `button-secondary.mp3`

**예시 코드**:
```typescript
const { play: playPrimary } = useSound('/sounds/button-primary.mp3');
const { play: playSuccess } = useSound('/sounds/success.mp3');
const { play: playSecondary } = useSound('/sounds/button-secondary.mp3');

<button
  onClick={async () => {
    playPrimary();
    await new Promise(resolve => setTimeout(resolve, 100)); // 0.1초 대기
    playSuccess();
    handleMissionSuccess();
  }}
>
  ✅ 미션 성공
</button>

<button
  onClick={() => {
    playSecondary();
    handleAbandonMission();
  }}
>
  나중에 하기
</button>
```

**Task 3.3: Success/Abandon Page 버튼**
- `app/mission-success/page.tsx`: "달성도 보러가기" → `button-secondary.mp3`
- `app/mission-abandon/page.tsx`: "홈으로 가기" → `button-secondary.mp3`

**Task 3.4: Achievements Page 배지 해금 효과음**
- 파일: `app/achievements/page.tsx`
- 배지가 처음 해금될 때 `badge-unlock.mp3` 재생

---

### Phase 4: Video Audio 적용 (1-2일)

**Task 4.1: HamzziVideo 컴포넌트 생성**
```typescript
// components/HamzziVideo.tsx
'use client';

import { useRef, useEffect } from 'react';

interface HamzziVideoProps {
  src: string;
  volume?: number;        // 0.0 ~ 1.0
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}

export function HamzziVideo({
  src,
  volume = 0.8,
  autoPlay = true,
  loop = true,
  className = ''
}: HamzziVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={false}  // 오디오 재생 허용
      playsInline
      className={className}
    />
  );
}
```

**Task 4.2: 모든 페이지에 HamzziVideo 적용**

**Home Page**:
```typescript
import { HamzziVideo } from '@/components/HamzziVideo';

<HamzziVideo
  src="/hamzzi_source/normal4.MP4"
  volume={0.7}
  loop
  className="w-48 h-48 rounded-2xl"
/>
```

**Mission Page**:
```typescript
<HamzziVideo
  src={encouragementVideo}  // mission_eating1.MP4 등
  volume={0.8}
  loop
  className="w-64 h-64"
/>
```

**Success Page**:
```typescript
<HamzziVideo
  src="/hamzzi_source/reward1.MP4"
  volume={0.9}
  loop={false}  // 한 번만 재생
  className="w-full h-auto"
/>
```

**Task 4.3: 브라우저 Autoplay 정책 대응**
- 사용자 인터랙션 후 재생되도록 설정
- 필요 시 "소리 켜기" 버튼 추가

```typescript
'use client';

import { useState } from 'react';

export function VideoWithUnmute() {
  const [isUnmuted, setIsUnmuted] = useState(false);

  return (
    <div>
      {!isUnmuted && (
        <button onClick={() => setIsUnmuted(true)}>
          🔊 소리 켜기
        </button>
      )}
      <video
        autoPlay
        loop
        muted={!isUnmuted}
        playsInline
        src="/hamzzi_source/mission_eating1.MP4"
      />
    </div>
  );
}
```

---

### Phase 5: 최적화 및 UX 개선 (2-3일)

**Task 5.1: 음소거 토글 버튼 추가**
```typescript
// components/SoundToggle.tsx
'use client';

import { useGlobalSound } from '@/lib/SoundContext';

export function SoundToggle() {
  const { isMuted, toggleMute } = useGlobalSound();

  return (
    <button
      onClick={toggleMute}
      className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-md"
      aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
    >
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
}
```

**모든 페이지 Layout에 추가**:
```typescript
// app/layout.tsx
import { SoundToggle } from '@/components/SoundToggle';

<body>
  <SoundProvider>
    <SoundToggle />
    {children}
  </SoundProvider>
</body>
```

**Task 5.2: 사운드 preload 최적화**
```typescript
// lib/preloadSounds.ts
export function preloadSounds() {
  const sounds = [
    '/sounds/button-click.mp3',
    '/sounds/button-primary.mp3',
    '/sounds/button-secondary.mp3',
    '/sounds/success.mp3',
  ];

  sounds.forEach(src => {
    const audio = new Audio();
    audio.src = src;
    audio.load();
  });
}

// app/layout.tsx
useEffect(() => {
  preloadSounds();
}, []);
```

**Task 5.3: 접근성 개선**
- `prefers-reduced-motion` 감지 시 사운드 자동 비활성화
```typescript
useEffect(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    setIsMuted(true);
  }
}, []);
```

**Task 5.4: 모바일 최적화**
- iOS Safari: 사용자 인터랙션 후에만 재생 가능
- 첫 버튼 클릭 시 오디오 컨텍스트 활성화

---

## 🎯 성공 기준

### 기능적
- [ ] 모든 Primary 버튼에서 `button-primary.mp3` 재생
- [ ] 모든 Secondary 버튼에서 `button-secondary.mp3` 재생
- [ ] 카테고리 버튼에서 `button-click.mp3` 재생
- [ ] 미션 성공 시 `success.mp3` 재생
- [ ] 배지 해금 시 `badge-unlock.mp3` 재생
- [ ] 모든 햄찌 MP4 영상에서 오디오 자동 재생
- [ ] 음소거 토글 버튼 정상 작동

### UX
- [ ] 사운드 재생이 버튼 클릭과 동시에 발생 (지연 없음)
- [ ] 볼륨이 너무 크거나 작지 않음 (적절한 밸런스)
- [ ] 영상 오디오와 효과음이 겹쳐도 불편하지 않음
- [ ] 음소거 상태가 세션 간 유지됨 (localStorage)

### 성능
- [ ] 사운드 파일 총 용량 < 500KB
- [ ] 첫 로딩 시 사운드 preload 완료
- [ ] 메모리 누수 없음 (Audio 객체 정리)

### 접근성
- [ ] 음소거 토글 버튼에 접근 가능
- [ ] `prefers-reduced-motion` 존중
- [ ] 키보드로 음소거 토글 가능

---

## 🎨 사용자 경험 시나리오

### 시나리오 1: 미션 시작
```
사용자: Home Page 진입
1. 햄찌 영상 재생 (normal4.MP4 오디오 자동 재생)
2. "수면" 카테고리 클릭 → 톡! (button-click.mp3)
3. 미션 제목 입력
4. "미션 시작하기" 클릭 → 딩! (button-primary.mp3)
5. Mission Page 전환
```

### 시나리오 2: 미션 완료
```
사용자: Mission Page에서 미션 진행
1. 응원 영상 재생 (mission_eating1.MP4 오디오)
2. "미션 성공" 버튼 클릭 → 딩! + 레벨업 소리 (button-primary.mp3 + success.mp3)
3. Success Page 전환
4. 축하 영상 재생 (reward1.MP4 오디오)
5. (배지 해금 시) 배지 효과음 (badge-unlock.mp3)
```

### 시나리오 3: 음소거
```
사용자: 사운드가 시끄러울 때
1. 우측 상단 🔊 버튼 클릭
2. 모든 사운드 비활성화 (영상 오디오 + 효과음)
3. 버튼 클릭해도 소리 안 남
4. 다시 🔇 버튼 클릭하면 재활성화
```

---

## 🔧 기술 세부사항

### 브라우저 Autoplay 정책

#### Chrome/Edge
- 음소거된 영상: 자동 재생 허용
- 음소거 해제 영상: 사용자 인터랙션 필요

#### Safari (iOS/macOS)
- 모든 영상: 사용자 인터랙션 필요
- `playsInline` 필수

**해결책**:
```typescript
// 첫 사용자 클릭 시 오디오 활성화
const enableAudio = () => {
  const audio = new Audio();
  audio.play().catch(() => {});
};

// 첫 버튼 클릭 시 호출
<button onClick={() => {
  enableAudio();
  handleAction();
}}>
```

### 파일 크기 최적화

| 파일 | 최대 크기 | 비트레이트 |
|------|----------|-----------|
| button-click.mp3 | 10KB | 64kbps |
| button-primary.mp3 | 15KB | 64kbps |
| success.mp3 | 50KB | 128kbps |
| badge-unlock.mp3 | 40KB | 128kbps |

**최적화 명령어**:
```bash
# 비트레이트 낮추기
ffmpeg -i input.mp3 -b:a 64k output.mp3

# Duration 자르기
ffmpeg -i input.mp3 -ss 0 -t 0.05 output.mp3

# 파일 크기 확인
ls -lh *.mp3
```

---

## 📚 참고 자료

### 무료 효과음 사이트
- [Freesound.org](https://freesound.org) - CC 라이선스 효과음
- [Zapsplat](https://www.zapsplat.com) - 상업적 사용 가능
- [Mixkit](https://mixkit.co/free-sound-effects/) - 무료 효과음
- [Pixabay](https://pixabay.com/sound-effects/) - 상업적 사용 가능

### 기술 문서
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN: HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay/)

### 듀오링고 사운드 분석
- Duolingo 앱에서 사용하는 효과음 특징:
  - 짧고 명확한 톤 (50-200ms)
  - 긍정적인 주파수 (200-600Hz)
  - 과하지 않은 볼륨 (0.4-0.7)

---

## ✅ 구현 체크리스트

### Phase 1: 준비
- [ ] 효과음 파일 5개 다운로드
- [ ] ffmpeg로 파일 최적화
- [ ] public/sounds/ 디렉토리 생성
- [ ] 파일 배치 완료

### Phase 2: 시스템
- [ ] useSound Hook 구현
- [ ] SoundContext 구현 (선택)
- [ ] 테스트 페이지 생성
- [ ] 사운드 재생 확인

### Phase 3: 버튼 적용
- [ ] Home Page 버튼
- [ ] Mission Page 버튼
- [ ] Success/Abandon Page 버튼
- [ ] Achievements Page 배지 효과음

### Phase 4: Video
- [ ] HamzziVideo 컴포넌트
- [ ] 모든 페이지 적용
- [ ] 브라우저 호환성 확인

### Phase 5: 최적화
- [ ] 음소거 토글 버튼
- [ ] Preload 최적화
- [ ] 접근성 개선
- [ ] 모바일 테스트

---

## 🚀 시작하기

### 1단계: 효과음 준비
1. Freesound.org 방문
2. 필요한 효과음 검색 및 다운로드
3. ffmpeg로 최적화
4. public/sounds/ 배치

### 2단계: Sound Hook 구현
1. `lib/useSound.ts` 생성
2. Audio 객체 관리 로직 작성
3. 테스트 페이지로 확인

### 3단계: 점진적 적용
1. Home Page 버튼부터 시작
2. 각 페이지별 순차 적용
3. Video Audio 마지막에 적용

### 4단계: 최적화
1. 음소거 토글 추가
2. Preload 로직 추가
3. 모바일 테스트 및 개선

---

## 🎉 완성 후 기대 효과

### Before
```
- 버튼 클릭: 시각적 피드백만
- 영상 재생: 음소거 상태
- 미션 성공: 축하 문구만
```

### After
```
✨ 버튼 클릭: 딩! 톡! (즉각적 피드백)
✨ 영상 재생: 햄찌 소리와 함께 생동감
✨ 미션 성공: 레벨업 효과음으로 성취감
✨ 배지 해금: 반짝이는 효과음으로 특별함
✨ 듀오링고 같은 engaging한 인터랙션
```

---

**최종 업데이트**: 2025-11-01
**버전**: 1.0
**상태**: 구현 준비 완료 ✅
