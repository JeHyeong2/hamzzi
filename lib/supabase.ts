import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 디버깅: Supabase 환경 변수 확인
console.log('🔧 [Supabase 초기화]');
console.log('📍 NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
console.log('🔑 NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ 설정됨' : '❌ 없음');

if (!supabaseUrl || !supabaseKey) {
  console.error('🚨 [ERROR] Supabase 환경 변수가 설정되지 않았습니다!');
  console.error('📝 .env.local 파일을 확인하세요:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase 클라이언트 생성 완료');
