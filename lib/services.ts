/**
 * ====================================
 * Supabase 연동 서비스 레이어
 * ====================================
 *
 * 모든 데이터베이스 작업은 Supabase를 통해 처리됩니다.
 * RLS (Row Level Security) 정책에 의해 사용자는 자신의 데이터만 접근 가능합니다.
 */

import { supabase } from './supabase';
import { User, Mission, CategoryScore, Category } from './store';

// ====================================
// 사용자 관련 함수
// ====================================

/**
 * 사용자 ID로 조회
 * @param userId - users 테이블의 id
 * @returns 사용자 객체 또는 null
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('사용자 조회 오류:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('사용자 조회 예외:', err);
    return null;
  }
}

/**
 * auth_id로 사용자 조회
 * @param authId - Supabase Auth user.id
 * @returns 사용자 객체 또는 null
 */
export async function getUserByAuthId(authId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 사용자 없음 (정상)
        return null;
      }
      console.error('사용자 조회 오류:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('사용자 조회 예외:', err);
    return null;
  }
}

// ====================================
// 미션 관련 함수
// ====================================

/**
 * 미션 생성
 * @param userId - 사용자 ID
 * @param category - 미션 카테고리
 * @param title - 미션 제목
 * @returns 생성된 미션 객체 또는 null
 */
export async function createMission(
  userId: string,
  category: Category,
  title: string
): Promise<Mission | null> {
  try {
    const { data, error } = await supabase
      .from('missions')
      .insert({
        user_id: userId,
        category,
        title,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('미션 생성 오류:', error);
      return null;
    }

    console.log('✅ 미션 생성 완료:', data);
    return data;
  } catch (err) {
    console.error('미션 생성 예외:', err);
    return null;
  }
}

/**
 * 진행 중인 미션 조회
 * @param userId - 사용자 ID
 * @returns 진행 중인 미션 객체 또는 null
 */
export async function getActiveMission(userId: string): Promise<Mission | null> {
  try {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 진행 중인 미션 없음 (정상)
        return null;
      }
      console.error('진행 중인 미션 조회 오류:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('진행 중인 미션 조회 예외:', err);
    return null;
  }
}

/**
 * 미션 상태 업데이트
 * @param missionId - 미션 ID
 * @param status - 변경할 상태
 * @returns 업데이트된 미션 객체 또는 null
 */
export async function updateMissionStatus(
  missionId: string,
  status: 'in_progress' | 'completed' | 'abandoned'
): Promise<Mission | null> {
  try {
    const updateData: {
      status: 'in_progress' | 'completed' | 'abandoned';
      started_at?: string;
      completed_at?: string;
    } = { status };

    if (status === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('missions')
      .update(updateData)
      .eq('id', missionId)
      .select()
      .single();

    if (error) {
      console.error('미션 상태 업데이트 오류:', error);
      return null;
    }

    console.log(`✅ 미션 상태 업데이트: ${status}`);
    return data;
  } catch (err) {
    console.error('미션 상태 업데이트 예외:', err);
    return null;
  }
}

// ====================================
// 카테고리 점수 관련 함수
// ====================================

/**
 * 카테고리 점수 조회
 * @param userId - 사용자 ID
 * @returns 카테고리 점수 배열
 */
export async function getCategoryScores(
  userId: string
): Promise<CategoryScore[]> {
  try {
    const { data, error } = await supabase
      .from('category_scores')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('카테고리 점수 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('카테고리 점수 조회 예외:', err);
    return [];
  }
}

/**
 * 카테고리 점수 증가
 * @param userId - 사용자 ID
 * @param category - 카테고리
 */
export async function incrementCategoryScore(
  userId: string,
  category: Category
): Promise<void> {
  try {
    // 1. 현재 점수 조회
    const { data: currentScore, error: selectError } = await supabase
      .from('category_scores')
      .select('score')
      .eq('user_id', userId)
      .eq('category', category)
      .single();

    if (selectError) {
      console.error('카테고리 점수 조회 오류:', selectError);
      return;
    }

    // 2. 점수 증가
    const newScore = (currentScore?.score || 0) + 1;

    const { error: updateError } = await supabase
      .from('category_scores')
      .update({ score: newScore, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('category', category);

    if (updateError) {
      console.error('카테고리 점수 증가 오류:', updateError);
      return;
    }

    console.log(`✅ ${category} 점수 증가: ${newScore}`);
  } catch (err) {
    console.error('카테고리 점수 증가 예외:', err);
  }
}

// ====================================
// 스트릭 관련 함수
// ====================================

/**
 * 스트릭 업데이트 (날짜 기준 누적 방문일수)
 * @param user - 사용자 정보
 * @returns 새로운 스트릭 값
 *
 * 로직:
 * - 마지막 완료 날짜와 오늘 날짜를 비교
 * - 다른 날짜면 스트릭 +1 (끊겨도 올라감)
 * - 같은 날짜면 스트릭 유지 (중복 미션 방지)
 */
export async function updateStreak(user: User): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식
    const lastCompletedDate = user.last_completed_date
      ? new Date(user.last_completed_date).toISOString().split('T')[0]
      : null;

    // 오늘이 마지막 완료 날짜와 다르면 스트릭 증가
    if (lastCompletedDate !== today) {
      const newStreak = (user.current_streak || 0) + 1;
      const newMaxStreak = Math.max(newStreak, user.max_streak || 0);

      // DB 업데이트
      const { error } = await supabase
        .from('users')
        .update({
          current_streak: newStreak,
          max_streak: newMaxStreak,
          last_completed_date: today,
        })
        .eq('id', user.id);

      if (error) {
        console.error('스트릭 업데이트 오류:', error);
        return user.current_streak || 0;
      }

      console.log(`✅ 미션성공한 ${newStreak}일 달성!`);
      return newStreak;
    } else {
      // 오늘 이미 완료했으면 스트릭 유지
      console.log(`ℹ️ 오늘 이미 완료함. 미션성공한 ${user.current_streak}일 유지`);
      return user.current_streak || 0;
    }
  } catch (err) {
    console.error('스트릭 업데이트 오류:', err);
    return user.current_streak || 0;
  }
}

// ====================================
// 배지 관련 함수
// ====================================

/**
 * 배지 확인 및 해금
 * @param userId - 사용자 ID
 * @param totalCount - 총 완료 수
 * @param streak - 연속 달성 일수
 */
export async function checkAndUnlockBadges(
  userId: string,
  totalCount: number,
  streak: number
): Promise<void> {
  try {
    const badgesToUnlock: string[] = [];

    // 배지 조건 확인
    if (totalCount === 1) badgesToUnlock.push('starter'); // 첫 미션
    if (totalCount === 5) badgesToUnlock.push('passionate'); // 5회 달성
    if (totalCount === 10) badgesToUnlock.push('dedicated'); // 10회 달성
    if (streak === 3) badgesToUnlock.push('streaker'); // 3일 연속

    if (badgesToUnlock.length === 0) return;

    // 배지 ID 조회
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('id, name')
      .in('name', badgesToUnlock);

    if (badgesError || !badges) {
      console.error('배지 조회 오류:', badgesError);
      return;
    }

    // 기존 배지 확인 (중복 방지)
    const { data: existingBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const existingBadgeIds = existingBadges?.map((b) => b.badge_id) || [];

    // 새로 해금할 배지만 필터링
    const newBadges = badges
      .filter((badge) => !existingBadgeIds.includes(badge.id))
      .map((badge) => ({
        user_id: userId,
        badge_id: badge.id,
      }));

    if (newBadges.length > 0) {
      const { error: insertError } = await supabase
        .from('user_badges')
        .insert(newBadges);

      if (insertError) {
        console.error('배지 해금 오류:', insertError);
        return;
      }

      console.log(`✅ 배지 해금: ${newBadges.length}개`);
    }
  } catch (err) {
    console.error('배지 확인 예외:', err);
  }
}

/**
 * 사용자 배지 조회
 * @param userId - 사용자 ID
 * @returns 해금된 배지 ID 배열
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (error) {
      console.error('사용자 배지 조회 오류:', error);
      return [];
    }

    return data?.map((b) => b.badge_id) || [];
  } catch (err) {
    console.error('사용자 배지 조회 예외:', err);
    return [];
  }
}

// ====================================
// 미션 완료/포기 처리
// ====================================

/**
 * 미션 완료 처리
 * @param user - 사용자 정보 (streak 계산에 필요)
 * @param missionId - 미션 ID
 * @param category - 미션 카테고리
 * @returns 새로운 streak 값 (컴포넌트에서 store 업데이트용)
 */
export async function completeMission(
  user: User,
  missionId: string,
  category: Category
): Promise<number> {
  try {
    // 1. 미션 상태 업데이트
    await updateMissionStatus(missionId, 'completed');

    // 2. 카테고리 점수 증가
    await incrementCategoryScore(user.id, category);

    // 3. 스트릭 업데이트 (날짜 기준 누적 방문일수)
    const newStreak = await updateStreak(user);

    // 4. 총 완료 횟수 계산 (completed 미션 개수)
    const { count, error: countError } = await supabase
      .from('missions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (countError) {
      console.error('완료 횟수 조회 오류:', countError);
    } else {
      const totalCount = count || 0;

      // 5. 배지 확인
      await checkAndUnlockBadges(user.id, totalCount, newStreak);
      console.log(`✅ 미션 완료! (총 ${totalCount}회, 미션성공한 ${newStreak}일)`);
    }

    return newStreak;
  } catch (err) {
    console.error('미션 완료 오류:', err);
    return user.current_streak || 0;
  }
}

/**
 * 미션 포기 처리
 * @param missionId - 미션 ID
 */
export async function abandonMission(missionId: string): Promise<void> {
  try {
    await updateMissionStatus(missionId, 'abandoned');
    console.log('❌ 미션 포기됨');
  } catch (err) {
    console.error('미션 포기 오류:', err);
  }
}

// ====================================
// 리워드 관련 함수
// ====================================

/**
 * 리워드 목록 조회
 * @param userId - 사용자 ID
 * @returns 리워드 객체 배열
 */
export async function getRewards(userId: string) {
  try {
    // 1. 모든 리워드 조회
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .order('unlock_score', { ascending: true });

    if (rewardsError) {
      console.error('리워드 조회 오류:', rewardsError);
      return [];
    }

    // 2. 사용자가 해금한 리워드 조회
    const { data: userRewards } = await supabase
      .from('user_rewards')
      .select('reward_id')
      .eq('user_id', userId);

    const unlockedRewardIds = userRewards?.map((r) => r.reward_id) || [];

    // 3. 총 점수 계산 (완료된 미션 개수)
    const totalScore = await getTotalScore(userId);

    // 4. 리워드 정보 병합
    return rewards?.map((reward) => ({
      ...reward,
      is_unlocked: unlockedRewardIds.includes(reward.id),
      can_unlock: totalScore >= reward.unlock_score,
    })) || [];
  } catch (err) {
    console.error('리워드 조회 예외:', err);
    return [];
  }
}

/**
 * 리워드 언락
 * @param userId - 사용자 ID
 * @param rewardId - 리워드 ID
 */
export async function unlockReward(
  userId: string,
  rewardId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_rewards')
      .insert({ user_id: userId, reward_id: rewardId });

    if (error) {
      console.error('리워드 언락 오류:', error);
      return false;
    }

    console.log('✅ 리워드 언락:', rewardId);
    return true;
  } catch (err) {
    console.error('리워드 언락 예외:', err);
    return false;
  }
}

/**
 * 총 점수 조회
 * @param userId - 사용자 ID
 * @returns 완료된 미션 수
 */
export async function getTotalScore(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('missions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) {
      console.error('총 점수 조회 오류:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('총 점수 조회 예외:', err);
    return 0;
  }
}
