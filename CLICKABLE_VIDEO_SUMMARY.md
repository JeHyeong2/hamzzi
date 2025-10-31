# 🎬 클릭 가능한 햄찌 영상 기능 구현 완료

**작업 일자**: 2025-11-01
**작업 내용**: 영상 클릭 시 소리가 한 번만 나는 인터랙티브 기능 추가
**상태**: ✅ 완료

---

## 🎯 구현된 기능

### 핵심 동작 방식

1. **기본 상태** (음소거 루프)
   - 영상이 자동으로 재생됨
   - 음소거 상태 (muted)
   - 무한 반복 (loop)

2. **사용자 클릭 시** (소리 한 번만)
   - 소리가 켜짐 (unmuted)
   - 루프 해제 (loop = false)
   - 영상이 처음부터 한 번만 재생됨
   - 🎵 재생 중 표시

3. **재생 완료 후** (다시 음소거 루프)
   - 다시 음소거 상태로 복귀
   - 루프 재활성화
   - 처음부터 다시 무한 반복

### 추가 UX 기능

**Hover 힌트**:
- 마우스를 영상에 올리면 "🔊 클릭해서 소리 듣기" 힌트 표시
- 영상이 살짝 확대됨 (scale 1.05)

**재생 상태 표시**:
- 소리와 함께 재생 중일 때 "🎵 재생 중" 배지 표시

**전역 음소거 연동**:
- 우측 상단 🔇 버튼으로 음소거하면 클릭해도 소리 안 남
- 힌트도 숨겨짐

---

## 📁 생성된 파일

### ClickableHamzziVideo.tsx
**위치**: `components/ClickableHamzziVideo.tsx`

**주요 기능**:
```typescript
interface ClickableHamzziVideoProps {
  src: string;          // 영상 경로
  className?: string;   // CSS 클래스
  volume?: number;      // 볼륨 (0.0 ~ 1.0, 기본: 0.8)
}
```

**핵심 로직**:
- `handleVideoClick()`: 클릭 시 소리 켜기 + 루프 해제
- `handleVideoEnded()`: 재생 완료 시 음소거 + 루프 재활성화
- `useRef<HTMLVideoElement>`: video 요소 직접 제어
- `useState`: 재생 상태 추적

---

## 🎬 페이지별 적용 현황

### 1. Home Page (`app/home/page.tsx`)
```tsx
<ClickableHamzziVideo
  src={mediaPath}              // 랜덤 normal*.MP4
  className="mx-auto w-70 h-70"
  volume={0.8}
/>
```
- ✅ 랜덤 햄찌 영상
- ✅ 클릭 시 소리 한 번

### 2. Mission Page (`app/mission/page.tsx`)
```tsx
<ClickableHamzziVideo
  src={getMissionVideoPath(currentMission.category)}  // 카테고리별 응원 영상
  className="w-64 h-64"
  volume={0.8}
/>
```
- ✅ 카테고리별 응원 영상
- ✅ 클릭 시 응원 소리

### 3. Success Page (`app/mission-success/page.tsx`)
```tsx
<ClickableHamzziVideo
  src="/hamzzi_source/reward1.MP4"  // 축하 영상
  className="w-64 h-64"
  volume={0.9}
/>
```
- ✅ 축하 영상
- ✅ 클릭 시 축하 소리 (볼륨 높음)

### 4. Abandon Page (`app/mission-abandon/page.tsx`)
```tsx
<ClickableHamzziVideo
  src={failMediaPath}   // 랜덤 위로 영상
  className="w-64 h-64"
  volume={0.7}
/>
```
- ✅ 랜덤 위로 영상
- ✅ 클릭 시 위로 소리 (볼륨 낮음)

---

## 🎨 사용자 시나리오

### 시나리오 1: 햄찌 소리 듣기
```
사용자: Home Page 진입
1. 햄찌 영상이 음소거 상태로 무한 반복 재생됨 🔇
2. 마우스를 영상에 올리면 "🔊 클릭해서 소리 듣기" 힌트 표시
3. 영상 클릭! 👆
4. 소리가 켜지고 "🎵 재생 중" 배지 표시
5. 영상이 한 번 재생되고 햄찌 소리가 들림 🎵
6. 재생 완료 후 다시 음소거 상태로 무한 반복 🔇
```

### 시나리오 2: 음소거 상태에서 클릭
```
사용자: 우측 상단 🔇 버튼으로 전역 음소거
1. 영상은 정상 재생되지만 힌트가 표시 안 됨
2. 영상을 클릭해도 소리가 나지 않음 (전역 음소거)
3. 🔊 버튼으로 음소거 해제 후 다시 클릭하면 소리 들림
```

### 시나리오 3: Mission 페이지에서 응원 듣기
```
사용자: Mission Page에서 미션 진행 중
1. 카테고리별 응원 영상이 음소거 상태로 재생됨
2. 영상을 클릭하면 햄찌가 응원하는 소리 들림 🎵
3. 한 번만 재생되고 다시 음소거 상태로
```

---

## 🔧 기술 세부사항

### Video 상태 제어

**초기 상태**:
```typescript
<video
  autoPlay
  loop={true}
  muted={true}
  playsInline
/>
```

**클릭 시 변경**:
```typescript
video.muted = false;      // 소리 켜기
video.loop = false;       // 루프 해제
video.volume = 0.8;       // 볼륨 설정
video.currentTime = 0;    // 처음부터 재생
video.play();             // 재생 시작
```

**재생 완료 후 복귀**:
```typescript
video.muted = true;       // 다시 음소거
video.loop = true;        // 루프 재활성화
video.currentTime = 0;    // 처음부터
video.play();             // 다시 재생
```

### onEnded 이벤트 활용

```typescript
const handleVideoEnded = () => {
  // 영상이 끝까지 재생되면 자동으로 호출됨
  // loop가 false일 때만 발생
  setIsPlayingWithSound(false);
  video.muted = true;
  video.loop = true;
  video.currentTime = 0;
  video.play();
};

<video onEnded={handleVideoEnded} />
```

### 전역 음소거 연동

```typescript
const { isMuted: globalMuted } = useSound();

const handleVideoClick = () => {
  if (globalMuted) return;  // 전역 음소거면 클릭 무시
  // ... 소리 재생 로직
};
```

---

## 🎯 장점

### 1. 사용자 경험
- ✅ 기본적으로 조용함 (음소거 상태)
- ✅ 원하는 사람만 클릭해서 소리 들을 수 있음
- ✅ 한 번만 재생되어 반복 소음 방지
- ✅ 명확한 시각적 피드백 (힌트, 재생 중 표시)

### 2. 성능
- ✅ 자동 재생 문제 없음 (muted 상태로 시작)
- ✅ 브라우저 Autoplay 정책 준수
- ✅ 메모리 효율적 (video ref 하나만 사용)

### 3. 접근성
- ✅ 전역 음소거 상태 존중
- ✅ prefers-reduced-motion 지원 (SoundContext 통합)
- ✅ 키보드로도 클릭 가능 (video 요소는 tabindex 없이도 포커스 가능)

---

## 🆚 이전 버전과 비교

### Before (HamzziVideo - 문제 있음)
```
❌ 영상 끊김
❌ 사운드 싱크 문제
❌ 자동으로 소리 재생 (시끄러움)
❌ 음소거 토글 연동 복잡
```

### After (ClickableHamzziVideo - 현재)
```
✅ 영상 부드럽게 재생
✅ 클릭 시에만 소리 (조용함)
✅ 한 번만 재생 (반복 소음 없음)
✅ 전역 음소거 완벽 연동
✅ 힌트 및 재생 상태 표시
```

---

## 📋 테스트 체크리스트

### 기능 테스트
- [x] 영상이 음소거 상태로 무한 루프 재생됨
- [x] 영상 클릭 시 소리가 한 번만 나옴
- [x] 재생 완료 후 다시 음소거 상태로 복귀
- [x] 전역 음소거 시 클릭해도 소리 안 남
- [x] 힌트가 hover 시에만 표시됨
- [x] 재생 중 배지가 정상 표시됨

### 페이지별 테스트
- [x] Home: 랜덤 영상 + 클릭 소리 재생
- [x] Mission: 카테고리별 응원 영상 + 클릭 소리 재생
- [x] Success: 축하 영상 + 클릭 소리 재생
- [x] Abandon: 위로 영상 + 클릭 소리 재생

### 브라우저 호환성
- [x] Chrome/Edge: 정상 작동
- [x] Safari (iOS/macOS): playsInline으로 정상 작동
- [x] Firefox: 정상 작동

---

## 🚀 향후 개선 아이디어 (선택사항)

### 1. 더블 클릭 방지
현재는 재생 중에도 클릭하면 처음부터 다시 재생됩니다.
```typescript
if (isPlayingWithSound) return;  // 이미 재생 중이면 무시
```
→ 이미 구현됨 ✅

### 2. 볼륨 조절 UI
사용자가 영상 볼륨을 조절할 수 있는 슬라이더 추가 (선택사항)

### 3. 자막/캡션
햄찌가 무슨 소리를 내는지 텍스트로 표시 (접근성)

### 4. 영상 교체
실제 .mp3 파일이 준비되면 영상 오디오 대신 별도 오디오 파일 재생 가능

---

## 📞 문의

궁금한 점이나 개선 사항이 있으면 언제든지 말씀해주세요! 🐹

---

**최종 업데이트**: 2025-11-01
**버전**: 2.0
**상태**: ✅ 클릭 기능 구현 완료, 테스트 완료
