/**
 * 사이트 URL 중앙 관리 유틸리티
 * 환경에 따라 자동으로 적절한 URL을 반환합니다.
 *
 * Vercel 환경 변수 NEXT_PUBLIC_SITE_URL 사용:
 * - Vercel에 NEXT_PUBLIC_SITE_URL=https://hamzzi.vercel.app 설정
 * - 로컬에서는 자동으로 localhost 사용
 */

/**
 * 현재 환경의 사이트 기본 URL을 반환합니다.
 *
 * @returns 사이트 기본 URL (예: https://hamzzi.vercel.app 또는 http://localhost:3000)
 *
 * @example
 * const siteUrl = getSiteUrl();
 * // 프로덕션: "https://hamzzi.vercel.app" (환경 변수에서)
 * // 개발: "http://localhost:3000"
 */
export function getSiteUrl(): string {
  // Vercel 환경 변수 직접 사용 (가장 확실한 방법)
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
