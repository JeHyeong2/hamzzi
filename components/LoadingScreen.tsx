'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isVisible: boolean;
}

/**
 * 로딩 화면 컴포넌트
 *
 * Framer Motion의 AnimatePresence를 사용하여
 * 로딩 화면이 부드럽게 나타나고 사라지도록 개선
 *
 * @param isVisible - 로딩 화면 표시 여부
 */
export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            {/* 로딩 영상 */}
            <video
              className="w-80 h-80 rounded-3xl shadow-2xl"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/hamzzi_source/loading.MP4" type="video/mp4" />
            </video>

            {/* 로딩 텍스트 */}
            <p className="text-white font-bold text-lg animate-pulse">로딩 중...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
