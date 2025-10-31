import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
// Service Role Key를 사용하여 RLS 정책을 우회합니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서버 사이드에서만 실행되는 클라이언트
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { name } = body;

    console.log('[API] 사용자 생성 요청:', { name });

    // 입력값 검증
    if (!name || !name.trim()) {
      console.log('[API] 오류: 이름이 비어있음');
      return NextResponse.json(
        { error: '이름을 입력해주세요' },
        { status: 400 }
      );
    }

    // 환경 변수 확인
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[API] 오류: Supabase 환경 변수가 설정되지 않음');
      return NextResponse.json(
        { error: 'Supabase 설정이 누락되었습니다' },
        { status: 500 }
      );
    }

    console.log('[API] Supabase JavaScript SDK 사용하여 데이터 삽입');

    // 1. 사용자 생성
    // Service Role Key를 사용하므로 RLS 정책을 우회합니다
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name.trim(),
          current_streak: 0,
          max_streak: 0,
          last_completed_date: null,
        },
      ])
      .select();

    if (error) {
      console.error('[API] 사용자 생성 오류:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      return NextResponse.json(
        { error: error.message || 'Supabase 오류' },
        { status: 400 }
      );
    }

    const user = data?.[0];
    if (!user) {
      console.error('[API] 사용자 생성 실패: 반환 데이터 없음');
      return NextResponse.json(
        { error: '사용자 생성에 실패했습니다' },
        { status: 400 }
      );
    }

    console.log('[API] 사용자 생성 성공:', {
      id: user.id,
      name: user.name,
    });

    // 2. 카테고리 점수 초기화 (DB에 저장)
    // 다른 디바이스에서도 일관된 데이터를 보장하기 위함
    const categories = ['sleep', 'meal', 'grooming', 'activity'];
    for (const category of categories) {
      const { error: scoreError } = await supabase
        .from('category_scores')
        .insert({
          user_id: user.id,
          category,
          score: 0,
          goal: 20,
        });

      if (scoreError) {
        console.warn(`[API] 카테고리 점수 초기화 경고 (${category}):`, {
          code: scoreError.code,
          message: scoreError.message,
        });
        // 사용자는 이미 생성되었으므로 계속 진행
      } else {
        console.log(`[API] 카테고리 점수 초기화 완료: ${category}`);
      }
    }

    return NextResponse.json(
      { data: user },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API] 예외 발생:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    return NextResponse.json(
      {
        error: err instanceof Error
          ? err.message
          : '서버 오류가 발생했습니다'
      },
      { status: 500 }
    );
  }
}
