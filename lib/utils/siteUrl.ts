/**
 * 사이트 URL 중앙 관리 유틸리티
 * 환경에 따라 자동으로 적절한 URL을 반환합니다.
 *
 * 브라우저 환경: window.location.origin을 체크해서
 * - "hamzzi"가 포함되어 있으면 → https://hamzzi.vercel.app
 * - 아니면 → http://localhost:3000
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
  // 브라우저 환경: URL 문자열 체크로 간단하게 판단
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.origin;
    // hamzzi가 포함되어 있으면 프로덕션 URL 사용
    return currentUrl.includes('hamzzi')
      ? 'https://hamzzi.vercel.app'
      : 'http://localhost:3000';
  }

  // 서버 사이드: 환경 변수 체크
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.includes('hamzzi')) {
    return 'https://hamzzi.vercel.app';
  }

  // 최종 폴백
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
