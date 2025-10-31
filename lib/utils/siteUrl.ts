/**
 * 사이트 URL 중앙 관리 유틸리티
 * 환경에 따라 자동으로 적절한 URL을 반환합니다.
 *
 * 환경 감지 우선순위:
 * 1. NEXT_PUBLIC_SITE_URL 환경 변수 (명시적 설정)
 * 2. NEXT_PUBLIC_VERCEL_URL (클라이언트 사이드 Vercel URL)
 * 3. VERCEL_URL (서버 사이드 Vercel URL - 자동 제공)
 * 4. window.location.origin (브라우저 환경)
 * 5. 폴백: http://localhost:3000
 */

/**
 * 현재 환경의 사이트 기본 URL을 반환합니다.
 *
 * @returns 사이트 기본 URL (예: https://hamzzi.vercel.app 또는 http://localhost:3000)
 *
 * @example
 * const siteUrl = getSiteUrl();
 * // 프로덕션: "https://hamzzi.vercel.app"
 * // 개발: "http://localhost:3000"
 */
export function getSiteUrl(): string {
  // 1순위: 환경 변수로 명시적 설정
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 2순위: Vercel 자동 배포 URL (클라이언트)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // 3순위: Vercel 자동 배포 URL (서버 사이드)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 4순위: 브라우저 환경에서 현재 origin 사용
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 최종 폴백: 개발 환경 기본값
  return 'http://localhost:3000';
}

/**
 * 인증 콜백을 위한 완전한 URL을 생성합니다.
 * OAuth 리다이렉트 등에 사용됩니다.
 *
 * @param path - 콜백 경로 (기본값: /auth/callback)
 * @returns 완전한 콜백 URL
 *
 * @example
 * const callbackUrl = getCallbackUrl();
 * // "https://hamzzi.vercel.app/auth/callback"
 *
 * const customCallback = getCallbackUrl('/auth/success');
 * // "https://hamzzi.vercel.app/auth/success"
 */
export function getCallbackUrl(path: string = '/auth/callback'): string {
  const baseUrl = getSiteUrl();
  // path가 /로 시작하지 않으면 추가
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * 절대 URL을 생성합니다.
 * API 호출, 이미지 경로 등에 사용할 수 있습니다.
 *
 * @param path - 상대 경로
 * @returns 절대 URL
 *
 * @example
 * const imageUrl = getAbsoluteUrl('/images/logo.png');
 * // "https://hamzzi.vercel.app/images/logo.png"
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * 현재 환경이 프로덕션인지 확인합니다.
 *
 * @returns 프로덕션 여부
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 현재 환경이 개발 환경인지 확인합니다.
 *
 * @returns 개발 환경 여부
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
