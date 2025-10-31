'use client';

import { useStore } from '@/lib/store';
import LoadingScreen from './LoadingScreen';

/**
 * 전역 로딩 화면 컴포넌트
 *
 * Zustand store의 isGlobalLoading 상태를 구독하여
 * 페이지 전환 시 전역적으로 로딩 화면을 표시합니다.
 *
 * layout.tsx에 배치되어 모든 페이지에서 사용 가능합니다.
 */
export default function GlobalLoadingScreen() {
  const { isGlobalLoading } = useStore();

  return <LoadingScreen isVisible={isGlobalLoading} />;
}
