import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import AnimatedLayout from "@/components/AnimatedLayout";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🐹 정서불안 김햄찌 - 생존 미션 앱",
  description: "규칙적인 생활 습관을 만드는 응원 미션 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-xl`}
      >
        {/* AuthProvider: 전역 인증 상태 관리 */}
        <AuthProvider>
          {/* AnimatedLayout으로 children을 감싸 페이지 전환 애니메이션 활성화 */}
          <AnimatedLayout>{children}</AnimatedLayout>

          {/* 전역 로딩 화면 (페이지 전환 시 표시) */}
          <GlobalLoadingScreen />

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
      </body>
    </html>
  );
}
