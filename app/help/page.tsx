'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import PageTransition from '@/components/PageTransition';
import { getNormalMediaPath, getMediaType } from '@/lib/mediaUtils';

export default function HelpPage() {
  const router = useRouter();
  const [mediaPath, setMediaPath] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('video');

  // 컴포넌트 마운트 시 랜덤 미디어 선택
  useEffect(() => {
    const path = getNormalMediaPath();
    setMediaPath(path);
    setMediaType(getMediaType(path));
  }, []);

  const helpContacts = [
    {
      title: '자살 예방 상담 전화',
      number: '1393',
      icon: '📞',
      href: 'tel:1393',
    },
    {
      title: '정신건강 상담 전화',
      number: '1577-0199',
      icon: '📞',
      href: 'tel:1577-0199',
    },
    {
      title: '자살예방 SNS 상담',
      subtitle: '마들렌',
      icon: '💬',
      href: 'https://www.madeline.or.kr',
      isLink: true,
    },
  ];

  return (
    <PageTransition variant="slideUp">
      <>
        {/* 배경 애니메이션 */}
        <AnimatedBackground variant="home" />

      {/* 컨텐츠 */}
      <div className="relative z-10 min-h-screen p-6">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="mr-4 text-2xl">
          🐹
        </button>
        <h1 className="text-lg font-bold">마음이 힘들 때 응급 도움말</h1>
      </div>

      {/* 햄찌 이미지 - 랜덤 normal 미디어 */}
      <div className="flex justify-center mb-6">
        {mediaPath && (
          <>
            {mediaType === 'video' ? (
              <video
                className="w-64 h-64 rounded-lg"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={mediaPath} type="video/mp4" />
              </video>
            ) : (
              <img
                src={mediaPath}
                alt="햄찌"
                className="w-64 h-64 rounded-lg object-cover"
              />
            )}
          </>
        )}
      </div>

      {/* 위로 메시지 */}
      <div className="bg-[var(--bg-yellow)]/30 rounded-2xl p-6 mb-6 text-center">
        <p className="text-2xl mb-3">혼자 힘들어하지 말고</p>
        <p className="text-3xl font-bold text-[var(--primary-orange)] mb-3">
          <span className="inline-block animate-wave" style={{ animationDelay: '0s' }}>도</span>
          <span className="inline-block animate-wave" style={{ animationDelay: '0.1s' }}>움</span>
          <span className="inline-block animate-wave" style={{ animationDelay: '0.2s' }}>을</span>
          <span className="inline-block animate-wave mx-1" style={{ animationDelay: '0.3s' }}>받</span>
          <span className="inline-block animate-wave" style={{ animationDelay: '0.4s' }}>아</span>
          <span className="inline-block animate-wave" style={{ animationDelay: '0.5s' }}>보</span>
          <span className="inline-block animate-wave" style={{ animationDelay: '0.6s' }}>장</span>
        </p>
        <p className="text-base text-gray-700">우선 찬 물 한 잔 마시고.</p>
      </div>

      {/* 연락처 목록 */}
      <div className="space-y-3">
        {helpContacts.map((contact, index) => (
          <a
            key={index}
            href={contact.href}
            target={contact.isLink ? '_blank' : undefined}
            rel={contact.isLink ? 'noopener noreferrer' : undefined}
            className="block hover:scale-105 transition"
          >
            <div className="bg-white rounded-xl p-4 shadow hover:shadow-md">
              <p className="font-semibold mb-1 flex items-center">
                <span className="mr-2 text-lg">{contact.icon}</span>
                {contact.title}
              </p>
              {contact.isLink ? (
                <>
                  <p className="text-sm text-gray-600 mb-1">{contact.subtitle}</p>
                  <p className="text-blue-500 text-sm">웹사이트 →</p>
                </>
              ) : (
                <p className="text-[var(--primary-orange)] font-bold text-lg">{contact.number}</p>
              )}
            </div>
          </a>
        ))}
      </div>

      </div>
      </>
    </PageTransition>
  );
}
