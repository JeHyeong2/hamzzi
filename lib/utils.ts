/**
 * 유틸리티 함수 모음
 *
 * Optimistic UI 업데이트 및 공통 헬퍼 함수를 제공합니다.
 */

import { User } from './store';

/**
 * Optimistic Streak 계산
 * API 호출 없이 클라이언트에서 스트릭 값을 즉시 계산합니다.
 *
 * 로직:
 * - last_completed_date가 오늘이 아니면 → streak + 1
 * - last_completed_date가 오늘이면 → streak 유지 (이미 완료함)
 * - last_completed_date가 없으면 → 1 (첫 미션)
 *
 * @param user - 현재 사용자 객체
 * @returns 예상되는 새로운 streak 값
 */
export function calculateOptimisticStreak(user: User): number {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식
  const lastCompletedDate = user.last_completed_date
    ? new Date(user.last_completed_date).toISOString().split('T')[0]
    : null;

  // 오늘이 마지막 완료 날짜와 다르면 스트릭 증가
  if (lastCompletedDate !== today) {
    return (user.current_streak || 0) + 1;
  }

  // 오늘 이미 완료했으면 스트릭 유지
  return user.current_streak || 0;
}

/**
 * Optimistic Max Streak 계산
 * 새로운 streak 값과 현재 max_streak를 비교하여 최대값 반환
 *
 * @param newStreak - 새로운 streak 값
 * @param currentMaxStreak - 현재 max_streak 값
 * @returns 새로운 max_streak 값
 */
export function calculateOptimisticMaxStreak(
  newStreak: number,
  currentMaxStreak: number
): number {
  return Math.max(newStreak, currentMaxStreak || 0);
}
