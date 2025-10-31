'use client';

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AnimatedLayoutProps {
  children: ReactNode;
}

/**
 * AnimatePresence를 사용하여 페이지 전환 애니메이션을 활성화하는 레이아웃 래퍼
 *
 * Next.js의 layout.tsx는 서버 컴포넌트이므로,
 * 'use client'가 필요한 framer-motion의 AnimatePresence를 사용하려면
 * 별도의 클라이언트 컴포넌트로 분리해야 합니다.
 *
 * @param children - 페이지 콘텐츠
 */
export default function AnimatedLayout({ children }: AnimatedLayoutProps) {
  // 현재 경로를 key로 사용하여 페이지 변경 감지
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* pathname을 key로 사용하여 라우트 변경 시 애니메이션 트리거 */}
      <div key={pathname}>{children}</div>
    </AnimatePresence>
  );
}
