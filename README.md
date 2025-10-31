# 🐹 정서불안 김햄찌

> 완전이 쌈뽕한 너! 오늘도 생존 미션 성공하러 왔옹? 🚀

**햄찌**는 정서적 불안감을 겪는 친구들이 규칙적인 자기관리 습관을 기르도록 응원하는 미션 기반 습관 앱이야!

매우 간단하고, 꼭 하고 싶은 것만 적으면 돼. 햄찌가 옆에서 계속 응원해줄게! 💚

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JeHyeong2/hamzzi)

## ✨ 뭐가 특별하냐구?

### 🎯 아주 쉬운 미션 시스템
- **수면** 🌙 - 잘 자는 것도 미션이옹
- **식사** 🍽️ - 맛있는 거 챙겨 먹기
- **그루밍** 🚿 - 세수만 해도 미션 완료!
- **활동** 🏃 - 산책 5분도 완전 좋아

### 🔥 연속 미션 완료 스트릭
- 어제 미션 완료했으면 → 스트릭 1 증가!
- 오늘도 완료하면 → 스트릭 계속 유지!
- 2일 이상 끊겼으면 → 괜찮아, 다시 시작하면 돼 💪

### 🏆 배지 시스템
- **시작** - 첫 미션 완료 (너 완전 해냈어!)
- **열정** - 5회 완료 (요시요시!)
- **헌신** - 10회 완료 (이러다 룸바니까지 가겠옹~)
- **연속왕** - 3일 이상 연속 완료 (오! 소 있어빌리티!)

### 🎁 리워드 포인트
- 카테고리별 점수 20점 달성하면 해금!
- 귀여운 햄찌 영상들이 기다리고 있어 🐹

## 🚀 시작하는 방법

### 1. 설치하기
```bash
# 프로젝트 클론
git clone https://github.com/JeHyeong2/hamzzi.git
cd hamzzi

# 패키지 설치
npm install
```

### 2. 환경 변수 설정하기
`.env.local` 파일을 만들어줘:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=너의_supabase_프로젝트_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=너의_supabase_anon_key

# Google OAuth (선택)
Google_client_ID=너의_구글_클라이언트_id
Google_client_PW=너의_구글_클라이언트_시크릿
```

### 3. 데이터베이스 설정하기
1. [Supabase](https://supabase.com)에서 새 프로젝트 만들기
2. SQL 편집기에서 `supabase-setup.sql` 실행하기
3. 테이블 자동 생성 완료! ✨

### 4. 개발 서버 실행하기
```bash
npm run dev
```

http://localhost:3000 에서 햄찌를 만나봐! 🎉

## 🛠️ 기술 스택

햄찌는 이렇게 만들어졌옹:

- **프론트엔드**: Next.js 15 + React 19
- **스타일링**: Tailwind CSS 4 (커스텀 햄찌 색상 팔레트!)
- **상태 관리**: Zustand (로컬스토리지 지속성)
- **백엔드**: Supabase (PostgreSQL + Auth)
- **인증**: Google OAuth
- **언어**: TypeScript 5
- **배포**: Vercel

## 📁 프로젝트 구조

```
hamzzi/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 랜딩 (이름 입력)
│   ├── home/                # 홈 (미션 선택)
│   ├── mission/             # 미션 진행 (타이머)
│   ├── mission-success/     # 성공 축하 🎉
│   ├── mission-abandon/     # 포기해도 괜찮아 💚
│   ├── achievements/        # 달성도 (배지)
│   ├── rewards/             # 리워드 (포인트)
│   └── help/                # 도움말 (응급 자원)
├── lib/
│   ├── store.ts            # Zustand 상태 관리
│   ├── services.ts         # 데이터베이스 로직
│   ├── auth/               # 인증 관련
│   └── utils/              # 유틸리티 함수
├── components/             # 재사용 컴포넌트
└── public/
    └── hamzzi_source/      # 햄찌 영상/이미지
```

## 🎨 햄찌 색상 팔레트

```css
--bg-cream: #FFF9E6        /* 메인 배경 (따뜻한 크림) */
--bg-peach: #FFDAB9        /* 미션 페이지 (복숭아) */
--bg-yellow: #FFFACD       /* 메시지 카드 (연한 노랑) */
--primary-gold: #FFD700    /* 배지, 강조 (골드) */
--primary-orange: #FF8C00  /* 식사 카테고리 (오렌지) */
--primary-pink: #FF69B4    /* 링크 (핑크) */
--success-green: #4CAF50   /* 성공 헤더 (그린) */
```

## 🤝 기여하기

햄찌를 더 좋게 만들고 싶다면:

1. Fork 떠가기
2. 새 브랜치 만들기 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋하기 (`git commit -m '완전이 쌈뽕한 기능 추가'`)
4. 브랜치에 푸시하기 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

## 📝 라이선스

MIT License - 자유롭게 사용해도 돼!

## 💚 응원의 말

> "어렵게 하지마. 쉬워도 돼!"
>
> "완전이 쌈뽕한 너~ 해낼 줄 알았엉!"
>
> "디스 이즈 도파민! 🎉"

---

<div align="center">

**햄찌와 함께라면 매일매일이 생존 미션 성공! 🐹✨**

Made with 💚 by 정서불안 김햄찌

[Demo](https://hamzzi.vercel.app) | [Issues](https://github.com/JeHyeong2/hamzzi/issues) | [Discussions](https://github.com/JeHyeong2/hamzzi/discussions)

</div>
