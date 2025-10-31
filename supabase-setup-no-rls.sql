-- ============================================
-- Supabase 데이터베이스 스키마 (RLS 비활성화)
-- ============================================
-- 개발 환경용: 모든 보안 정책 비활성화
-- 프로덕션 배포 전 반드시 RLS 활성화 필요!
-- ============================================

-- ============================================
-- 1. USERS 테이블 (Google Auth 통합)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google Auth 연동 컬럼
  auth_id UUID UNIQUE NOT NULL,           -- Supabase Auth user.id
  email TEXT UNIQUE NOT NULL,             -- Google 계정 이메일
  avatar_url TEXT,                        -- Google 프로필 사진
  provider TEXT DEFAULT 'google',         -- 로그인 제공자

  -- 사용자 정보
  name TEXT NOT NULL,                     -- 사용자가 입력한 이름

  -- 스트릭 정보
  current_streak INTEGER DEFAULT 0,      -- 현재 연속 달성 일수
  max_streak INTEGER DEFAULT 0,          -- 최대 연속 달성 일수
  last_completed_date DATE,              -- 마지막 완료 날짜

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE users IS 'Google OAuth로 로그인한 사용자 정보';
COMMENT ON COLUMN users.auth_id IS 'Supabase Auth의 user.id (UUID)';
COMMENT ON COLUMN users.email IS 'Google 계정 이메일 주소';

-- ============================================
-- 2. MISSIONS 테이블
-- ============================================
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 미션 정보
  category TEXT NOT NULL CHECK (category IN ('sleep', 'meal', 'grooming', 'activity')),
  title TEXT NOT NULL,

  -- 상태 관리
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'abandoned')) DEFAULT 'pending',

  -- 시간 정보
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 비활성화
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;

-- 동시에 하나의 미션만 진행 가능한 제약
CREATE UNIQUE INDEX idx_one_active_mission
ON missions (user_id)
WHERE status = 'in_progress';

COMMENT ON TABLE missions IS '사용자의 미션 기록';

-- ============================================
-- 3. CATEGORY_SCORES 테이블
-- ============================================
CREATE TABLE category_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 카테고리별 점수
  category TEXT NOT NULL CHECK (category IN ('sleep', 'meal', 'grooming', 'activity')),
  score INTEGER DEFAULT 0,
  goal INTEGER DEFAULT 20,

  -- 메타데이터
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 유저당 카테고리는 하나씩만
  CONSTRAINT unique_user_category UNIQUE (user_id, category)
);

-- RLS 비활성화
ALTER TABLE category_scores DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE category_scores IS '사용자별 카테고리 점수 추적';

-- ============================================
-- 4. BADGES 테이블 (마스터 데이터)
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  unlock_condition TEXT NOT NULL,
  unlock_value INTEGER DEFAULT 0
);

-- RLS 비활성화
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE badges IS '배지 마스터 데이터 (모든 사용자 공통)';

-- ============================================
-- 5. USER_BADGES 테이블 (사용자별 배지)
-- ============================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 유저당 배지는 한 번만 획득 가능
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- RLS 비활성화
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE user_badges IS '사용자가 획득한 배지 목록';

-- ============================================
-- 6. REWARDS 테이블 (마스터 데이터)
-- ============================================
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  unlock_score INTEGER NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 비활성화
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE rewards IS '리워드 마스터 데이터';

-- ============================================
-- 7. USER_REWARDS 테이블 (사용자별 리워드)
-- ============================================
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 유저당 리워드는 한 번만 획득 가능
  CONSTRAINT unique_user_reward UNIQUE (user_id, reward_id)
);

-- RLS 비활성화
ALTER TABLE user_rewards DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE user_rewards IS '사용자가 획득한 리워드 목록';

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================
CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_category_scores_user_id ON category_scores(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 초기 데이터: 배지
-- ============================================
INSERT INTO badges (name, display_name, description, unlock_condition, unlock_value)
VALUES
  ('starter', '시작', '첫 미션 완료', 'first_mission', 1),
  ('passionate', '열정', '5회 달성', 'complete_5', 5),
  ('dedicated', '헌신', '10회 달성', 'complete_10', 10),
  ('streaker', '연속왕', '3일 연속 달성', 'streak_3', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 초기 데이터: 리워드
-- ============================================
INSERT INTO rewards (title, unlock_score, video_url)
VALUES
  ('햄찌 응원 영상 1', 1, '/hamzzi_source/reward1.MP4'),
  ('햄찌 응원 영상 5', 5, '/hamzzi_source/reward5.MP4'),
  ('햄찌 응원 영상 10', 10, '/hamzzi_source/reward10.MP4'),
  ('햄찌 응원 영상 20', 20, '/hamzzi_source/reward20.MP4')
ON CONFLICT DO NOTHING;

-- ============================================
-- 완료 메시지
-- ============================================
SELECT '✅ 데이터베이스 스키마 생성 완료' as status;
SELECT '⚠️ RLS가 비활성화되어 있습니다. 개발 용도로만 사용하세요.' as warning;
SELECT 'ℹ️ 테이블 목록:' as info;

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'missions', 'category_scores', 'badges', 'user_badges', 'rewards', 'user_rewards')
ORDER BY table_name;
