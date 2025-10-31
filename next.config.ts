import type { NextConfig } from "next";
import withPWA from 'next-pwa';

/**
 * PWA 설정
 * - dest: Service Worker 파일이 생성될 위치
 * - disable: 개발 환경에서는 PWA 비활성화 (빠른 개발을 위해)
 * - register: Service Worker 자동 등록
 * - skipWaiting: 새 버전 Service Worker 즉시 활성화
 */
const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /**
   * 정적 파일 캐싱 헤더 설정
   * 이미지와 비디오 파일을 브라우저에 캐싱하여 성능 향상
   */
  async headers() {
    return [
      {
        // 모든 정적 미디어 파일에 캐싱 헤더 적용
        source: '/hamzzi_source/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // public: 공유 캐시(CDN, 프록시)에서도 캐싱 가능
            // max-age=31536000: 1년간 캐싱 (파일 이름이 변경되지 않으므로)
            // immutable: 파일이 변경되지 않음을 브라우저에 알림
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 동적으로 선택되는 미디어도 캐싱 (단, 기간은 짧게)
        source: '/:path*.(jpg|jpeg|png|gif|webp|MP4|mp4)',
        headers: [
          {
            key: 'Cache-Control',
            // max-age=86400: 1일간 캐싱
            // stale-while-revalidate=31536000: 백그라운드에서 재검증하면서 캐시 사용
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },
};

export default withPWAConfig(nextConfig);
