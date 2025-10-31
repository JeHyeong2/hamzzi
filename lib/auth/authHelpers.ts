/**
 * 인증 관련 유틸리티 함수들
 * Supabase Auth와 연동하여 사용자 인증 처리
 */

import { supabase } from '../supabase';
import { User } from '../store';

/**
 * Google OAuth로 로그인 시작
 * Supabase Auth를 통해 Google 로그인 페이지로 리다이렉트
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google 로그인 오류:', error);
    throw error;
  }

  return data;
}


/**
 * 현재 인증된 사용자의 Supabase Auth 세션 가져오기
 * @returns Supabase Auth Session 또는 null
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('세션 조회 오류:', error);
    return null;
  }

  return data.session;
}

/**
 * auth_id로 users 테이블에서 사용자 프로필 조회
 * @param authId - Supabase Auth user.id
 * @returns 사용자 프로필 또는 null
 */
export async function getUserProfileByAuthId(authId: string): Promise<User | null> {
  console.log('🔵 [getUserProfileByAuthId] 시작');
  console.log('📝 조회할 authId:', authId);

  try {
    console.log('🔍 Supabase 클라이언트 확인:', supabase ? 'OK' : 'ERROR - null');
    console.log('🚀 Supabase SELECT 요청 시작...');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    console.log('📥 Supabase 응답 받음');
    console.log('📊 응답 data:', data);
    console.log('❌ 응답 error:', error);

    if (error) {
      // 사용자가 없는 경우 (최초 로그인)
      if (error.code === 'PGRST116') {
        console.log('ℹ️ 최초 로그인: 프로필 없음 (PGRST116)');
        return null;
      }
      console.error('🚨 [ERROR] 사용자 프로필 조회 오류:', error);
      console.error('🔍 에러 상세:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    if (!data) {
      console.log('ℹ️ 프로필 없음 (data === null)');
      return null;
    }

    console.log('✅ 프로필 조회 완료:', data);
    return data;
  } catch (err) {
    console.error('🚨 [EXCEPTION] 사용자 프로필 조회 예외:', err);
    console.error('🔍 예외 상세:', err);
    return null;
  }
}

/**
 * 새 사용자 프로필 생성 (최초 로그인 시)
 * @param authId - Supabase Auth user.id
 * @param email - Google 계정 이메일
 * @param name - 사용자가 입력한 이름
 * @param avatarUrl - Google 프로필 사진 URL (선택)
 * @returns 생성된 사용자 프로필
 */
export async function createUserProfile(
  authId: string,
  email: string,
  name: string,
  avatarUrl?: string
): Promise<User | null> {
  console.log('🔵 [createUserProfile] 시작');
  console.log('📝 입력 파라미터:', {
    authId,
    email,
    name,
    avatarUrl,
  });

  try {
    // Supabase 클라이언트 상태 확인
    console.log('🔍 Supabase 클라이언트 확인:', supabase ? 'OK' : 'ERROR - null');

    const insertData = {
      auth_id: authId,
      email,
      name: name.trim(),
      avatar_url: avatarUrl || null,
      provider: 'google',
      current_streak: 0,
      max_streak: 0,
      last_completed_date: null,
    };

    console.log('📤 DB INSERT 요청 데이터:', insertData);
    console.log('🚀 Supabase INSERT 요청 시작...');

    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    console.log('📥 Supabase 응답 받음');
    console.log('📊 응답 data:', data);
    console.log('❌ 응답 error:', error);

    if (error) {
      console.error('🚨 [ERROR] 사용자 프로필 생성 오류:', error);
      console.error('🔍 에러 상세:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log('✅ 사용자 프로필 생성 완료:', data);

    // 카테고리 점수 초기화
    console.log('🔵 카테고리 점수 초기화 시작...');
    await initializeCategoryScores(data.id);
    console.log('✅ 카테고리 점수 초기화 완료');

    return data;
  } catch (err) {
    console.error('🚨 [EXCEPTION] 사용자 프로필 생성 예외:', err);
    console.error('🔍 예외 상세:', err);
    return null;
  }
}

/**
 * 카테고리 점수 초기화 (새 사용자 생성 시)
 * @param userId - users 테이블의 id
 */
async function initializeCategoryScores(userId: string): Promise<void> {
  try {
    const categories = ['sleep', 'meal', 'grooming', 'activity'];
    const categoryScores = categories.map(category => ({
      user_id: userId,
      category,
      score: 0,
      goal: 20,
    }));

    const { error } = await supabase
      .from('category_scores')
      .insert(categoryScores);

    if (error) {
      console.error('카테고리 점수 초기화 오류:', error);
      throw error;
    }

    console.log('✅ 카테고리 점수 초기화 완료');
  } catch (err) {
    console.error('카테고리 점수 초기화 예외:', err);
  }
}

/**
 * 사용자 프로필이 완성되었는지 확인
 * (auth_id는 있지만 name이 없는 경우 = 프로필 미완성)
 * @param authId - Supabase Auth user.id
 * @returns 프로필 완성 여부
 */
export async function isProfileComplete(authId: string): Promise<boolean> {
  const profile = await getUserProfileByAuthId(authId);

  if (!profile) {
    return false;
  }

  // name 필드가 있으면 프로필 완성
  return !!profile.name && profile.name.trim().length > 0;
}

/**
 * 인증 상태 변경 리스너 설정
 * @param callback - 상태 변경 시 호출할 콜백 함수
 * @returns unsubscribe 함수
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth 상태 변경:', event, session?.user?.email);
    callback(event, session);
  });

  return data.subscription.unsubscribe;
}

/**
 * 로그아웃
 * Supabase Auth 세션 종료 및 로컬 상태/캐시 완전 초기화
 */
export async function signOut(): Promise<void> {
  try {
    console.log('🔵 [signOut] 로그아웃 시작');

    // 1. Supabase Auth 세션 종료
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('🚨 로그아웃 오류:', error);
      throw error;
    }

    console.log('✅ Supabase Auth 세션 종료 완료');

    // 2. localStorage 완전 클리어 (Zustand 포함)
    localStorage.clear();
    console.log('✅ localStorage 클리어 완료');

    // 3. sessionStorage도 클리어
    sessionStorage.clear();
    console.log('✅ sessionStorage 클리어 완료');

    console.log('✅ 로그아웃 완료 - 모든 세션/캐시 삭제됨');
  } catch (err) {
    console.error('🚨 로그아웃 예외:', err);
    throw err;
  }
}
