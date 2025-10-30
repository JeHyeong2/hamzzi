# 🐹 정서불안 김햄찌 - 생존 미션 앱 (실제 구현 버전)

> **📸 실제 구현된 앱의 스크린샷을 기반으로 작성된 정확한 스펙**
> git 문제로 날아간 앱을 재구현하기 위한 문서입니다.

---

## 🎯 빠른 복구 가이드

### Claude Code에게 이렇게 요청하세요:

```
"REBUILT_HAMSTER_SPEC.md를 읽고 앱을 재구현해줘.
첨부한 스크린샷들을 참고해서 정확히 똑같이 만들어줘."
```

---

## 📱 전체 화면 플로우

```
1. 이름 입력
   ↓
2. 미션 설정 (홈)
   ↓
3. 미션 진행 중 (타이머)
   ↓
4-a. 미션 성공 → 달성도
4-b. 미션 포기 → 위로 메시지 → 홈

추가 화면:
- 달성도 화면
- 리워드 화면
- 응급 도움말
```

---

## 🗄️ 데이터베이스 스키마 (업데이트)

```sql
-- users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,  -- 연속 달성일
  max_streak INTEGER DEFAULT 0,      -- 최대 연속 달성일
  last_completed_date DATE,          -- 마지막 완료 날짜
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- missions 테이블
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('sleep', 'meal', 'grooming', 'activity')),
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'abandoned')) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 동시에 하나의 미션만 진행
CREATE UNIQUE INDEX idx_one_active_mission 
ON missions (user_id) 
WHERE status = 'in_progress';

-- category_scores 테이블 (목표: 20점)
CREATE TABLE category_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('sleep', 'meal', 'grooming', 'activity')),
  score INTEGER DEFAULT 0,
  goal INTEGER DEFAULT 20,  -- 카테고리별 목표
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE (user_id, category)
);

-- badges 테이블 (배지 정의)
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,  -- 'starter', 'passionate', etc.
  display_name TEXT NOT NULL,  -- '시작', '열정', etc.
  description TEXT NOT NULL,   -- '첫 미션 완료', '5회 달성', etc.
  unlock_condition TEXT NOT NULL,  -- 'first_mission', 'complete_5', etc.
  unlock_value INTEGER DEFAULT 0   -- 필요한 값 (5회, 10회 등)
);

-- user_badges 테이블 (사용자가 획득한 배지)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- rewards 테이블 (리워드 정의)
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  unlock_score INTEGER NOT NULL,  -- 1점, 5점, 10점 등
  video_url TEXT,  -- 유튜브 URL (나중에 추가)
  is_unlocked BOOLEAN DEFAULT FALSE
);

-- user_rewards 테이블
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_reward UNIQUE (user_id, reward_id)
);

-- 인덱스
CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_category_scores_user_id ON category_scores(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- 초기 배지 데이터
INSERT INTO badges (name, display_name, description, unlock_condition, unlock_value) VALUES
('starter', '시작', '첫 미션 완료', 'first_mission', 1),
('passionate', '열정', '5회 달성', 'complete_5', 5),
('dedicated', '헌신', '10회 달성', 'complete_10', 10),
('streaker', '연속왕', '3일 연속 달성', 'streak_3', 3);

-- 초기 리워드 데이터
INSERT INTO rewards (title, unlock_score) VALUES
('해금됨! 1점 달성!', 1),
('잠금! 5점 필요', 5),
('잠금! 10점 필요', 10);
```

---

## 📱 화면별 상세 스펙

### 화면 #1: 이름 입력 (최초 실행)

#### 스크린샷 참고: 햄찌화면1.png

```tsx
<div className="min-h-screen bg-[#FFF9E6] flex flex-col items-center justify-center p-6">
  {/* 햄찌 이미지 */}
  <Image 
    src="/images/hamzzi_normal.png" 
    alt="햄찌" 
    width={300} 
    height={300}
    className="mb-6"
  />
  
  {/* 환영 메시지 */}
  <h1 className="text-2xl font-bold mb-2">안녕! 나는 김햄찌야 🐹</h1>
  <p className="text-gray-600 mb-8">너의 이름을 알려줘!</p>
  
  {/* 이름 입력 */}
  <input 
    type="text" 
    placeholder="이름을 입력해줘"
    className="w-full max-w-sm px-4 py-3 border-2 border-[#FFD700] rounded-lg mb-4"
  />
  
  {/* 시작 버튼 */}
  <button className="w-full max-w-sm bg-black text-white py-3 rounded-lg font-bold">
    시작하기!
  </button>
</div>
```

---

### 화면 #2: 미션 설정 (홈)

#### 스크린샷 참고: 햄찌과정3.png

```tsx
<div className="min-h-screen bg-[#FFF9E6] p-6">
  {/* 상단 배지 & 아이콘들 */}
  <div className="flex justify-between items-center mb-6">
    {/* 연속 달성 배지 */}
    <div className="bg-[#FFD700] rounded-full px-4 py-2 flex items-center">
      <span className="text-lg">🔥</span>
      <span className="ml-2 font-bold">연속 달성 {streak}일</span>
    </div>
    
    {/* 우측 아이콘들 */}
    <div className="flex gap-3">
      <button onClick={() => router.push('/rewards')}>🎁</button>
      <button onClick={() => router.push('/achievements')}>📊</button>
      <button onClick={() => router.push('/help')}>💚</button>
    </div>
  </div>
  
  {/* 햄찌 캐릭터 */}
  <div className="text-center mb-6">
    <h2 className="text-lg font-semibold mb-4">응원하는 햄버버 햄찌</h2>
    <Image 
      src="/images/hamzzi_normal.png" 
      alt="햄찌" 
      width={300} 
      height={300}
      className="mx-auto"
    />
  </div>
  
  {/* 미션 입력 카드 */}
  <div className="bg-white rounded-2xl p-6 shadow-md">
    <h3 className="text-lg font-bold mb-2">너의 생존 미션을 정해줘!</h3>
    <p className="text-sm text-gray-600 mb-4">
      아침약 먹기 · 세수 하기 · 산책 5분<br />
      매우 간단하고, 꼭 하고 싶은걸 적어줘
    </p>
    
    {/* 카테고리 선택 (4개 버튼) */}
    <div className="grid grid-cols-4 gap-2 mb-4">
      <button className={`p-3 rounded-lg ${category === 'sleep' ? 'bg-gray-100' : 'bg-white border'}`}>
        <div className="text-2xl mb-1">🌙</div>
        <div className="text-xs">수면</div>
      </button>
      <button className={`p-3 rounded-lg ${category === 'meal' ? 'bg-[#FF8C00] text-white' : 'bg-white border'}`}>
        <div className="text-2xl mb-1">🍽️</div>
        <div className="text-xs">식사</div>
      </button>
      <button className={`p-3 rounded-lg ${category === 'grooming' ? 'bg-gray-100' : 'bg-white border'}`}>
        <div className="text-2xl mb-1">🚿</div>
        <div className="text-xs">그루밍</div>
      </button>
      <button className={`p-3 rounded-lg ${category === 'activity' ? 'bg-gray-100' : 'bg-white border'}`}>
        <div className="text-2xl mb-1">🏃</div>
        <div className="text-xs">활동</div>
      </button>
    </div>
    
    {/* 미션 입력 */}
    <input 
      type="text"
      placeholder="맛있는 거 챙겨 먹기"
      className="w-full px-4 py-3 border rounded-lg mb-4"
    />
    
    {/* 가이드 메시지 */}
    <div className="bg-[#FFFACD] p-4 rounded-lg mb-4 text-center">
      <p className="text-sm font-semibold">쥬로 1개만 하자!</p>
      <p className="text-sm">어렵게 하지마. 쉬워도 돼!</p>
    </div>
    
    {/* 시작 버튼 */}
    <button className="w-full bg-black text-white py-3 rounded-lg font-bold">
      미션 시작! 🚀
    </button>
  </div>
</div>
```

**중요 기능**:
- 연속 달성 streak 표시
- 카테고리 선택 시 배경색 변경 (식사는 주황색)
- 진행 중인 미션이 있으면 알림

---

### 화면 #3: 미션 진행 중 (타이머)

#### 스크린샷 참고: 햄찌과정5.png

```tsx
<div className="min-h-screen bg-[#FFDAB9]">
  {/* 상단 확인 헤더 (녹색) */}
  <div className="bg-[#4CAF50] text-white p-4 flex items-center">
    <span className="text-lg mr-2">✓</span>
    <span className="font-semibold">미션 시작! 확인됨 👍</span>
  </div>
  
  <div className="p-6 flex flex-col items-center justify-center" style={{minHeight: 'calc(100vh - 60px)'}}>
    <h2 className="text-lg font-semibold mb-4">응원하는 햄스터</h2>
    
    {/* 미션 제목 */}
    <p className="text-center mb-6">
      오늘 미션 <span className="font-bold">[{mission.title}]</span> 하는 중
    </p>
    
    {/* 타이머 */}
    <div className="bg-white rounded-3xl px-12 py-8 shadow-lg mb-8">
      <div className="text-6xl font-bold text-center">
        {hours.toString().padStart(2, '0')} : {minutes.toString().padStart(2, '0')}
      </div>
    </div>
    
    {/* 햄찌 응원 이미지 */}
    <div className="mb-6">
      <Image 
        src="/images/mission_while.png" 
        alt="응원 햄찌" 
        width={250} 
        height={250}
      />
    </div>
    
    {/* 응원 메시지 */}
    <p className="text-[#FF8C00] text-xl font-bold mb-8">
      {encouragementMessage}
    </p>
    
    {/* 버튼들 */}
    <button 
      onClick={handleComplete}
      className="w-full max-w-sm bg-black text-white py-4 rounded-lg font-bold mb-3"
    >
      오늘 미션 성공! 🎉
    </button>
    
    <button 
      onClick={handleAbandon}
      className="text-sm text-gray-600 underline"
    >
      나중에 다시시도하기
    </button>
  </div>
</div>
```

**응원 메시지 목록**:
```typescript
const messages = [
  "요시요시!",
  "완전히 쌈뽕한 너~",
  "이러다 룸바니까지 가겠옹~",
  "오! 소 있어빌리티!",
  "디스 이즈 도파민!",
  "해낼 줄 알았엉!"
];
```

---

### 화면 #4-a: 미션 성공

#### 스크린샷 참고: 햄찌과정2.png

```tsx
<div className="min-h-screen bg-[#FFDAB9] flex flex-col items-center justify-center p-6">
  <h2 className="text-lg font-semibold mb-4">응원하는 햄스터</h2>
  
  {/* 축하 타이틀 */}
  <div className="text-center mb-6">
    <h1 className="text-3xl font-bold text-[#FFD700] mb-2">
      ⭐ 미션 성공! ⭐
    </h1>
    <p className="text-lg">오늘 생존 완료!</p>
  </div>
  
  {/* 햄찌 축하 이미지 */}
  <div className="mb-6">
    <Image 
      src="/images/mission_clear.png" 
      alt="성공 햄찌" 
      width={250} 
      height={250}
    />
    <p className="text-center text-sm text-[#FF69B4] mt-2">
      아딸라의...곤듀❤
    </p>
  </div>
  
  {/* 축하 메시지 카드 */}
  <div className="bg-[#FFFACD] rounded-2xl p-6 mb-8 text-center">
    <p className="text-lg font-semibold mb-2">해낼 줄 알았엉!</p>
    <p className="text-lg font-semibold mb-2">데헷데헷</p>
    <p className="text-2xl font-bold text-[#FFD700]">디스 이즈 도파민!</p>
  </div>
  
  {/* 버튼들 */}
  <button 
    onClick={() => router.push('/achievements')}
    className="w-full max-w-sm bg-white border-2 border-black py-3 rounded-lg font-bold mb-3"
  >
    나의 달성도 보러가기 📊
  </button>
  
  <button 
    onClick={() => router.push('/')}
    className="text-[#FF69B4] font-semibold"
  >
    홈화면으로 가기 🏠
  </button>
</div>
```

**미션 완료 시 처리**:
1. 카테고리 점수 +1
2. 총 달성 횟수 +1
3. 연속 달성 체크 및 업데이트
4. 배지 획득 체크
5. 리워드 해금 체크

---

### 화면 #4-b: 미션 포기

#### 스크린샷 참고: 햄찌과정7.png

```tsx
<div className="min-h-screen bg-[#FFDAB9] flex flex-col items-center justify-center p-6">
  <h2 className="text-lg font-semibold mb-4">응원하는 햄스터</h2>
  
  {/* 위로 메시지 */}
  <div className="text-center mb-6">
    <h1 className="text-3xl font-bold mb-2">괜찮아!</h1>
    <p className="text-lg text-gray-600">다음엔 할 수 있다구!</p>
  </div>
  
  {/* 햄찌 위로 이미지 */}
  <div className="mb-6">
    <Image 
      src="/images/mission_fail.png" 
      alt="위로 햄찌" 
      width={250} 
      height={250}
    />
    <p className="text-center text-sm bg-black text-white px-4 py-1 rounded mt-2">
      벌명은 지옥에서 듣지
    </p>
  </div>
  
  {/* 위로 메시지 카드 */}
  <div className="bg-[#FFFACD] rounded-2xl p-6 mb-8 text-center">
    <p className="text-lg mb-2">오늘은 좀 힘들었구나</p>
    <p className="text-lg font-bold text-[#FF8C00]">내일 다시 보자!</p>
  </div>
  
  {/* 홈 버튼 */}
  <button 
    onClick={() => router.push('/')}
    className="text-[#FF69B4] font-semibold"
  >
    홈화면으로 가기 🏠
  </button>
</div>
```

---

### 화면 #5: 달성도

#### 스크린샷 참고: 햄찌과정4.png

```tsx
<div className="min-h-screen bg-[#FFF9E6] p-6">
  {/* 헤더 */}
  <div className="flex items-center mb-6">
    <button onClick={() => router.back()} className="mr-4">←</button>
    <Image src="/images/hamzzi_icon.png" width={40} height={40} alt="햄찌" />
    <h1 className="text-xl font-bold ml-2">나의 달성도</h1>
  </div>
  
  {/* 총 달성 카드 */}
  <div className="bg-[#FFD700] rounded-2xl p-8 mb-6 text-center text-white">
    <p className="text-sm mb-2">총 달성 횟수</p>
    <p className="text-5xl font-bold mb-2">{totalCount}회</p>
    <p className="text-xs">계속 쌓이면~</p>
  </div>
  
  {/* 연속 달성 배지 */}
  <div className="bg-white rounded-full px-6 py-3 inline-flex items-center mb-6 shadow">
    <span className="text-xl mr-2">🔥</span>
    <span className="font-bold">연속 달성 {streak}일</span>
  </div>
  
  {/* 카테고리별 진행률 */}
  <div className="bg-white rounded-2xl p-6 mb-6 shadow">
    <h2 className="text-lg font-bold mb-4">카테고리별 진행률</h2>
    
    {/* 수면 */}
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-2">🌙</span>
          <span className="font-semibold">수면</span>
        </div>
        <span className="text-sm text-blue-500 font-bold">
          {scores.sleep}/20
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full" 
          style={{width: `${(scores.sleep / 20) * 100}%`}}
        />
      </div>
    </div>
    
    {/* 식사 */}
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-2">🍽️</span>
          <span className="font-semibold">식사</span>
        </div>
        <span className="text-sm text-[#FF8C00] font-bold">
          {scores.meal}/20
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#FF8C00] h-2 rounded-full" 
          style={{width: `${(scores.meal / 20) * 100}%`}}
        />
      </div>
    </div>
    
    {/* 그루밍 */}
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-2">🚿</span>
          <span className="font-semibold">그루밍</span>
        </div>
        <span className="text-sm text-green-500 font-bold">
          {scores.grooming}/20
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full" 
          style={{width: `${(scores.grooming / 20) * 100}%`}}
        />
      </div>
    </div>
    
    {/* 활동 */}
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-2">🏃</span>
          <span className="font-semibold">활동</span>
        </div>
        <span className="text-sm text-red-500 font-bold">
          {scores.activity}/20
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-red-500 h-2 rounded-full" 
          style={{width: `${(scores.activity / 20) * 100}%`}}
        />
      </div>
    </div>
  </div>
  
  {/* 배지 모음 */}
  <div>
    <h2 className="text-lg font-bold mb-4">배지 모음</h2>
    <div className="grid grid-cols-2 gap-4">
      {/* 획득한 배지 */}
      <div className="bg-[#FFFACD] rounded-xl p-6 text-center border-2 border-[#FFD700]">
        <div className="text-4xl mb-2">🌱</div>
        <p className="font-bold">시작</p>
        <p className="text-xs text-gray-600">첫 미션 완료</p>
      </div>
      
      {/* 잠긴 배지 */}
      <div className="bg-gray-100 rounded-xl p-6 text-center opacity-50">
        <div className="text-4xl mb-2">❄️</div>
        <p className="font-bold">열정</p>
        <p className="text-xs text-gray-600">5회 달성</p>
      </div>
    </div>
  </div>
</div>
```

---

### 화면 #6: 리워드

#### 스크린샷 참고: 햄찌과정6.png

```tsx
<div className="min-h-screen bg-[#FFF9E6] p-6">
  {/* 헤더 */}
  <div className="flex justify-between items-center mb-6">
    <button onClick={() => router.back()}>←</button>
    <button onClick={() => router.push('/')}>🏠</button>
  </div>
  
  <h1 className="text-xl font-bold text-center mb-6">응원하는 햄스터</h1>
  
  {/* 해금된 리워드 */}
  <div className="bg-white rounded-2xl p-6 mb-4 shadow">
    {/* 햄찌 영상 썸네일 */}
    <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
      <Image 
        src="/images/reward_unlocked.png" 
        alt="해금된 영상" 
        width={300}
        height={200}
        className="rounded-lg"
      />
    </div>
    <p className="text-center font-bold text-[#FFD700]">
      ✨ 해금됨! 1점 달성! ✨
    </p>
  </div>
  
  {/* 잠긴 리워드 */}
  <div className="bg-white rounded-2xl p-6 mb-4 shadow opacity-75">
    <div className="flex flex-col items-center py-8">
      <Image 
        src="/images/lock.svg" 
        alt="잠금" 
        width={80} 
        height={80}
        className="mb-4"
      />
      <p className="font-bold text-lg mb-2">잠금!</p>
      <p className="text-sm text-gray-600 mb-4">필요 5점</p>
      
      {/* 진행 바 */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>현재: {currentScore}점</span>
          <span>/ 5점</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#FFD700] h-2 rounded-full" 
            style={{width: `${(currentScore / 5) * 100}%`}}
          />
        </div>
      </div>
    </div>
  </div>
  
  {/* 또 다른 잠긴 리워드 */}
  <div className="bg-white rounded-2xl p-6 shadow opacity-50">
    <div className="flex flex-col items-center py-8">
      <Image 
        src="/images/lock.svg" 
        alt="잠금" 
        width={80} 
        height={80}
        className="mb-4"
      />
      <p className="font-bold text-lg mb-2">잠금!</p>
      <p className="text-sm text-gray-600">필요 10점</p>
    </div>
  </div>
</div>
```

---

### 화면 #7: 응급 도움말

#### 스크린샷 참고: 햄찌과정8.png

```tsx
<div className="min-h-screen bg-[#FFF9E6] p-6">
  {/* 헤더 */}
  <div className="flex items-center mb-6">
    <Image src="/images/hamzzi_icon.png" width={40} height={40} alt="햄찌" />
    <h1 className="text-lg font-bold ml-2">마음이 힘들 때 응급 도움말</h1>
  </div>
  
  {/* 햄찌 이미지 */}
  <div className="flex justify-center mb-6">
    <Image 
      src="/images/hamzzi_worried.png" 
      alt="걱정하는 햄찌" 
      width={250} 
      height={250}
    />
  </div>
  
  {/* 위로 메시지 */}
  <div className="bg-[#FFFACD] rounded-2xl p-6 mb-6 text-center">
    <p className="text-lg mb-2">혼자 힘들어하지 말고</p>
    <p className="text-lg font-bold text-[#FF8C00] mb-2">도움을 받아보장</p>
    <p className="text-sm text-gray-600">우선 찬 물 한 잔 마시고.</p>
  </div>
  
  {/* 연락처 목록 */}
  <div className="space-y-3">
    {/* 자살 예방 상담 전화 */}
    <a href="tel:1393" className="block">
      <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
        <p className="font-semibold mb-1">자살 예방 상담 전화</p>
        <p className="text-[#FF69B4] font-bold text-lg">📞 1393</p>
      </div>
    </a>
    
    {/* 정신건강 상담 전화 */}
    <a href="tel:1577-0199" className="block">
      <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
        <p className="font-semibold mb-1">정신건강 상담 전화</p>
        <p className="text-[#FF8C00] font-bold text-lg">📞 1577-0199</p>
      </div>
    </a>
    
    {/* 자살예방 SNS 상담 */}
    <a href="https://www.madeline.or.kr" target="_blank" className="block">
      <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
        <p className="font-semibold mb-1">자살예방 SNS 상담</p>
        <p className="text-sm text-gray-600 mb-1">마들렌</p>
        <p className="text-blue-500 text-sm">웹사이트 →</p>
      </div>
    </a>
  </div>
</div>
```

---

## 🎯 Zustand 스토어 (업데이트)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = 'sleep' | 'meal' | 'grooming' | 'activity';
export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export interface User {
  id: string;
  name: string;
  current_streak: number;
  max_streak: number;
  last_completed_date: string | null;
}

export interface Mission {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  status: MissionStatus;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CategoryScore {
  category: Category;
  score: number;
  goal: number;
}

export interface Badge {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_unlocked: boolean;
}

interface AppState {
  // 사용자
  user: User | null;
  setUser: (user: User | null) => void;
  updateStreak: (streak: number) => void;
  
  // 현재 미션
  currentMission: Mission | null;
  setCurrentMission: (mission: Mission | null) => void;
  
  // 카테고리 점수
  categoryScores: CategoryScore[];
  setCategoryScores: (scores: CategoryScore[]) => void;
  incrementCategoryScore: (category: Category) => void;
  
  // 배지
  badges: Badge[];
  setBadges: (badges: Badge[]) => void;
  
  // 총 달성 횟수
  totalCompletedCount: number;
  incrementTotalCount: () => void;
  
  // 초기화
  reset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      currentMission: null,
      categoryScores: [
        { category: 'sleep', score: 0, goal: 20 },
        { category: 'meal', score: 0, goal: 20 },
        { category: 'grooming', score: 0, goal: 20 },
        { category: 'activity', score: 0, goal: 20 },
      ],
      badges: [],
      totalCompletedCount: 0,
      
      // Actions
      setUser: (user) => set({ user }),
      
      updateStreak: (streak) => 
        set((state) => ({
          user: state.user ? { ...state.user, current_streak: streak } : null,
        })),
      
      setCurrentMission: (mission) => set({ currentMission: mission }),
      
      setCategoryScores: (scores) => set({ categoryScores: scores }),
      
      incrementCategoryScore: (category) =>
        set((state) => ({
          categoryScores: state.categoryScores.map((score) =>
            score.category === category
              ? { ...score, score: score.score + 1 }
              : score
          ),
        })),
      
      setBadges: (badges) => set({ badges }),
      
      incrementTotalCount: () =>
        set((state) => ({
          totalCompletedCount: state.totalCompletedCount + 1,
        })),
      
      reset: () =>
        set({
          user: null,
          currentMission: null,
          categoryScores: [
            { category: 'sleep', score: 0, goal: 20 },
            { category: 'meal', score: 0, goal: 20 },
            { category: 'grooming', score: 0, goal: 20 },
            { category: 'activity', score: 0, goal: 20 },
          ],
          badges: [],
          totalCompletedCount: 0,
        }),
    }),
    {
      name: 'hamster-storage',
      partialize: (state) => ({
        user: state.user,
        categoryScores: state.categoryScores,
        badges: state.badges,
        totalCompletedCount: state.totalCompletedCount,
      }),
    }
  )
);
```

---

## 🎨 컬러 팔레트 (실제 앱 기준)

```css
:root {
  --bg-cream: #FFF9E6;       /* 메인 배경 */
  --bg-peach: #FFDAB9;       /* 미션 진행/완료 배경 */
  --bg-yellow: #FFFACD;      /* 메시지 카드 배경 */
  
  --primary-gold: #FFD700;   /* 배지, 강조 */
  --primary-orange: #FF8C00; /* 식사 카테고리, 응원 메시지 */
  --primary-pink: #FF69B4;   /* 링크, 부가 요소 */
  
  --success-green: #4CAF50;  /* 확인 헤더 */
  
  --category-blue: #5B9BD5;  /* 수면 */
  --category-orange: #FF8C00; /* 식사 */
  --category-green: #70AD47; /* 그루밍 */
  --category-red: #ED7D31;   /* 활동 */
  
  --text-black: #000000;     /* 버튼 */
  --text-gray: #666666;      /* 보조 텍스트 */
}
```

---

## 📋 핵심 로직

### 1. 연속 달성 (Streak) 계산

```typescript
async function updateStreak(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('current_streak, last_completed_date')
    .eq('id', userId)
    .single();
  
  const today = new Date().toISOString().split('T')[0];
  const lastDate = user?.last_completed_date;
  
  let newStreak = 1;
  
  if (lastDate) {
    const daysDiff = Math.floor(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === 1) {
      // 연속
      newStreak = (user.current_streak || 0) + 1;
    } else if (daysDiff === 0) {
      // 같은 날 (변경 없음)
      newStreak = user.current_streak || 1;
    } else {
      // 끊김
      newStreak = 1;
    }
  }
  
  await supabase
    .from('users')
    .update({
      current_streak: newStreak,
      max_streak: Math.max(newStreak, user?.max_streak || 0),
      last_completed_date: today,
    })
    .eq('id', userId);
  
  return newStreak;
}
```

### 2. 배지 획득 체크

```typescript
async function checkBadges(userId: string, totalCount: number, streak: number) {
  const { data: allBadges } = await supabase
    .from('badges')
    .select('*');
  
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);
  
  const unlockedBadgeIds = userBadges?.map(b => b.badge_id) || [];
  
  for (const badge of allBadges || []) {
    if (unlockedBadgeIds.includes(badge.id)) continue;
    
    let shouldUnlock = false;
    
    switch (badge.unlock_condition) {
      case 'first_mission':
        shouldUnlock = totalCount >= 1;
        break;
      case 'complete_5':
        shouldUnlock = totalCount >= 5;
        break;
      case 'complete_10':
        shouldUnlock = totalCount >= 10;
        break;
      case 'streak_3':
        shouldUnlock = streak >= 3;
        break;
    }
    
    if (shouldUnlock) {
      await supabase
        .from('user_badges')
        .insert({ user_id: userId, badge_id: badge.id });
    }
  }
}
```

### 3. 리워드 해금 체크

```typescript
async function checkRewards(userId: string, totalScore: number) {
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .lte('unlock_score', totalScore);
  
  const { data: userRewards } = await supabase
    .from('user_rewards')
    .select('reward_id')
    .eq('user_id', userId);
  
  const unlockedRewardIds = userRewards?.map(r => r.reward_id) || [];
  
  for (const reward of rewards || []) {
    if (!unlockedRewardIds.includes(reward.id)) {
      await supabase
        .from('user_rewards')
        .insert({ user_id: userId, reward_id: reward.id });
    }
  }
}
```

---

## 🚀 개발 순서

### 1단계: 데이터베이스 설정
```
1. Supabase 프로젝트 생성
2. 위의 SQL 스키마 실행
3. 초기 배지 & 리워드 데이터 삽입
```

### 2단계: 기본 구조
```
1. Next.js 프로젝트 생성
2. Zustand 스토어 구현
3. Supabase 클라이언트 설정
```

### 3단계: 화면 구현 (순서대로!)
```
1. 이름 입력 화면
2. 미션 설정 화면 (홈)
3. 미션 진행 화면 (타이머)
4. 미션 성공 화면
5. 미션 포기 화면
6. 달성도 화면
7. 리워드 화면
8. 응급 도움말 화면
```

### 4단계: 핵심 기능
```
1. 연속 달성 계산
2. 배지 시스템
3. 리워드 시스템
```

---

## ✅ 테스트 체크리스트

- [ ] 이름 입력 → 사용자 생성
- [ ] 미션 생성 → DB 저장
- [ ] 중복 미션 방지
- [ ] 타이머 정상 작동
- [ ] 30초마다 응원 메시지 변경
- [ ] 미션 완료 → 점수 증가, streak 업데이트
- [ ] 배지 획득
- [ ] 리워드 해금
- [ ] 미션 포기 → 점수 변화 없음
- [ ] 달성도 화면 정상 표시
- [ ] 카테고리별 진행바
- [ ] 응급 도움말 링크

---

## 🎉 이미지 파일 목록

**필요한 이미지들** (`public/images/` 폴더에 저장):
- `hamzzi_normal.png` - 기본 햄찌
- `hamzzi_icon.png` - 작은 아이콘
- `hamzzi_worried.png` - 걱정하는 햄찌 (도움말 페이지)
- `mission_while.png` - 미션 중 햄찌
- `mission_clear.png` - 성공 햄찌
- `mission_fail.png` - 포기 햄찌
- `lock.svg` - 자물쇠 아이콘
- `reward_unlocked.png` - 해금된 리워드 영상 썸네일

---

이 문서만 있으면 Claude Code가 **정확히 똑같은 앱**을 만들 수 있습니다! 🐹✨
