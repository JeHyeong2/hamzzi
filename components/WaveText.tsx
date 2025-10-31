'use client';

import React from 'react';

interface WaveTextProps {
  text: string;
  className?: string;
}

/**
 * 파도처럼 움직이는 텍스트 컴포넌트
 * 각 글자가 순차적으로 위아래로 움직여 파도 효과를 만듭니다
 *
 * @param text - 표시할 텍스트
 * @param className - 추가 스타일 클래스
 */
export default function WaveText({ text, className = '' }: WaveTextProps) {
  return (
    <div className={className}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            animation: `wave 9s ease-in-out infinite`,
            animationDelay: `${index * 0.3}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
}
