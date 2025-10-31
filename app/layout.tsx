import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import AnimatedLayout from "@/components/AnimatedLayout";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";
import { SoundProvider } from "@/lib/SoundContext";
import { SoundToggle } from "@/components/SoundToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * PWA 메타데이터 설정
 * - manifest: PWA 설정 파일 경로
 * - themeColor: 앱 테마 색상 (주황색 금색 계열)
 * - appleWebApp: iOS Safari에서 PWA로 설치 시 설정
 * - viewport: 모바일 최적화를 위한 뷰포트 설정
 */
export const metadata: Metadata = {
  title: "🐹 정서불안 김햄찌 - 생존 미션 앱",
  description: "규칙적인 생활 습관을 만드는 응원 미션 앱",
  manifest: '/manifest.json',
  themeColor: '#FFD700',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '햄찌',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mx-auto max-w-xl`}
      >
        {/* SoundProvider: 전역 사운드 상태 관리 */}
        <SoundProvider>
          {/* AuthProvider: 전역 인증 상태 관리 */}
          <AuthProvider>
            {/* AnimatedLayout으로 children을 감싸 페이지 전환 애니메이션 활성화 */}
            <AnimatedLayout>{children}</AnimatedLayout>

            {/* 전역 로딩 화면 (페이지 전환 시 표시) */}
            <GlobalLoadingScreen />

            {/* 음소거 토글 버튼 (우측 상단 고정) */}
            {/* <SoundToggle /> */}

            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AuthProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
