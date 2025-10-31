/**
 * 애플리케이션 전역 상수 및 설정
 * 카테고리, 배지, 리워드 정의를 중앙화하여 일관성 유지
 */

import { Category } from './store';

/**
 * 미션 카테고리별 표시 정보
 * 모든 컴포넌트에서 공유하여 일관성 보장
 *
 * themeColor: 버튼/헤더 색상
 * blobGradient: 배경 blob 그라디언트 색상
 * backgroundColor: 미션 페이지 배경색
 */
export const CATEGORY_CONFIG: Record<Category, {
  emoji: string;
  label: string;
  bgColor: string;
  textColor: string;
  themeColor: string;
  blobGradient: { from: string; to: string };
  backgroundColor: string;
}> = {
  sleep: {
    emoji: '🌙',
    label: '수면',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    themeColor: '#4A90E2',
    blobGradient: {
      from: 'from-[#5B6FDB]',
      to: 'to-[#1E90FF]',
    },
    backgroundColor: '#E8F0FF',
  },
  meal: {
    emoji: '🍽️',
    label: '식사',
    bgColor: 'bg-[#FF7F50]',
    textColor: 'text-white',
    themeColor: '#FF8A80',
    blobGradient: {
      from: 'from-[#FF7F50]',
      to: 'to-[#FF6B6B]',
    },
    backgroundColor: '#FFF0EB',
  },
  grooming: {
    emoji: '🚿',
    label: '그루밍',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    themeColor: '#00BCD4',
    blobGradient: {
      from: 'from-[#00BCD4]',
      to: 'to-[#26A69A]',
    },
    backgroundColor: '#E0F7F6',
  },
  activity: {
    emoji: '🏃',
    label: '활동',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    themeColor: '#E74C3C',
    blobGradient: {
      from: 'from-[#FF6B9D]',
      to: 'to-[#E74C3C]',
    },
    backgroundColor: '#FFE5E5',
  },
};

/**
 * 배지 정보
 * 데이터베이스와 동기화되며, 각 배지의 해금 조건 정의
 */
export interface BadgeConfig {
  id: string;
  name: string;
  display_name: string;
  emoji: string;
  description: string;
  unlock_condition: string;
  unlock_value: number;
}

export const BADGES_CONFIG: BadgeConfig[] = [
  {
    id: '1',
    name: 'starter',
    display_name: '시작',
    emoji: '🌱',
    description: '첫 미션 완료',
    unlock_condition: 'first_mission',
    unlock_value: 1,
  },
  {
    id: '2',
    name: 'passionate',
    display_name: '열정',
    emoji: '❄️',
    description: '5회 달성',
    unlock_condition: 'complete_5',
    unlock_value: 5,
  },
  {
    id: '3',
    name: 'dedicated',
    display_name: '헌신',
    emoji: '⭐',
    description: '10회 달성',
    unlock_condition: 'complete_10',
    unlock_value: 10,
  },
  {
    id: '4',
    name: 'streak_king',
    display_name: '연속왕',
    emoji: '🔥',
    description: '3일동안 미션 성공',
    unlock_condition: 'streak_3',
    unlock_value: 3,
  },
];

/**
 * 응원 메시지
 * 미션 타이머에서 30초마다 랜덤하게 표시
 * 따뜻하고 햄스터다운 톤으로 구성
 */
export const ENCOURAGEMENT_MESSAGES = [
  '요시요시!',
  '완전이 쌈뽕한 너~',
  '이러다 룸바니까지 가겠옹~',
  '오! 소 있어빌리티!',
  '디스 이즈 도파민!',
  '해낼 줄 알았엉!',
  '화이팅! 넌 할 수 있어!',
  '오늘도 최고야!',
  '응원할게! 파이팅!',
  '넌 특별해, 계속 가!',
  '이 정도면 충분해!',
  '힘내, 거의 다 왔어!',
];

/**
 * 미션 성공 메시지
 * handleComplete에서 랜덤하게 표시
 * 따뜻하고 격려하는 톤
 */
export const SUCCESS_MESSAGES = [
  '🎉 완벽해! 오늘 미션 성공했어!',
  '⭐ 오늘도 생존했구나!',
  '🔥 연속 {streak}일 달성이야!',
  '💪 너는 할 수 있어!',
  '✨ 대단해! 계속 화이팅~',
  '🎊 오늘도 최고야, 자랑스러워!',
  '💫 정말 잘했어, 계속 이렇게!',
  '🌟 매일 이렇게 하면 정말 멋있어!',
  '🎁 너의 노력이 정말 멋있어!',
  '💝 오늘도 너를 응원해!',
  '🌙 너의 인내심 정말 대단해!',
  '🌈 넌 정말 잘하고 있어!',
];

/**
 * 미션 포기 메시지
 * handleAbandon에서 랜덤하게 표시
 * 따뜻하고 위로하는 톤
 */
export const ABANDON_MESSAGES = [
  '🤗 괜찮아, 내일 다시 시작하면 돼!',
  '💙 실수는 누구나 해, 괜찮아!',
  '🌙 오늘은 충분히 했어, 쉬자!',
  '🍃 다음 기회가 있을거야, 화이팅!',
  '🤍 언제든 다시 도전할 수 있어!',
  '😊 포기하지 말고, 내일을 봐!',
  '🌈 힘내, 너는 할 수 있어!',
  '💕 미안해하지 말고, 다시 시작해!',
  '✨ 작은 것도 소중해, 잘했어!',
  '🌻 다음 기회를 기다릴게!',
  '🦐 너는 언제나 응원받을 가치가 있어!',
  '💛 오늘 하루 수고했어, 쉬자!',
];

/**
 * 미션 성공 페이지 메시지
 * mission-success 페이지에서 표시
 * 각 메시지는 3개의 줄로 구성: main, sub1, sub2
 */
export const SUCCESS_PAGE_MESSAGES = [
  {
    main: '해낼 줄 알았엉!',
    sub1: '데헷데헷',
    sub2: '디스 이즈 도파민!',
  },
  {
    main: '정말 잘했어!',
    sub1: '너는 최고야',
    sub2: '오늘도 생존 완료!',
  },
  {
    main: '대단해, 정말!',
    sub1: '계속 화이팅',
    sub2: '너의 노력이 멋있어!',
  },
  {
    main: '완벽해!',
    sub1: '정말 잘했어',
    sub2: '내일도 함께 할게!',
  },
  {
    main: '오늘도 승리야!',
    sub1: '너는 특별해',
    sub2: '계속 이렇게 해!',
  },
  {
    main: '정말 멋있어!',
    sub1: '매일이 최고야',
    sub2: '넌 할 수 있어!',
  },
  {
    main: '너 정말 최고야!',
    sub1: '계속 그렇게',
    sub2: '자랑스러워!',
  },
  {
    main: '믿음이 현실이 돼!',
    sub1: '너의 승리야',
    sub2: '함께 축하해!',
  },
];

/**
 * 미션 포기 페이지 메시지
 * mission-abandon 페이지에서 표시
 * 각 메시지는 2개의 줄로 구성: main, sub
 */
export const ABANDON_PAGE_MESSAGES = [
  {
    main: '괜찮아!',
    sub: '내일 다시 보자!',
  },
  {
    main: '힘내!',
    sub: '내일은 잘할 거야!',
  },
  {
    main: '그래도 괜찮아!',
    sub: '내일 다시 시작하자!',
  },
  {
    main: '실수는 누구나 해!',
    sub: '내일은 달라질 거야!',
  },
  {
    main: '괜찮아, 쉬자!',
    sub: '내일 다시 시작해!',
  },
  {
    main: '포기하지 말아!',
    sub: '내일 다시 만나!',
  },
  {
    main: '지금은 괜찮아!',
    sub: '내일 또 도전하자!',
  },
  {
    main: '실패는 없어!',
    sub: '내일을 기다릴게!',
  },
];

/**
 * 카테고리 점수 목표
 * 각 카테고리의 최대 점수
 */
export const CATEGORY_GOAL = 20;

/**
 * 스트릭 계산 설정
 * 스트릭 증가/초기화 조건 정의
 */
export const STREAK_CONFIG = {
  // 스트릭이 초기화되는 연속 미완료 날짜
  RESET_THRESHOLD_DAYS: 2,
  // 스트릭 증가 최소값
  INCREMENT_MIN: 1,
  // 스트릭 초기값
  INITIAL_VALUE: 1,
};

/**
 * 리워드 정보
 * 나중에 Supabase에서 동적으로 로드될 예정
 */
export interface RewardConfig {
  id: string;
  title: string;
  unlock_score: number;
  video_url: string;
  emoji?: string;
}

export const REWARDS_CONFIG: RewardConfig[] = [
  {
    id: 'reward_1',
    title: '해금됨! 1점 달성!',
    unlock_score: 1,
    video_url: '/hamzzi_source/reward1.MP4',
    emoji: '🎉',
  },
  {
    id: 'reward_2',
    title: '해금됨! 3점 달성!',
    unlock_score: 3,
    video_url: '/hamzzi_source/reward2.MP4',
    emoji: '🎊',
  },
  {
    id: 'reward_3',
    title: '해금됨! 5점 달성!',
    unlock_score: 5,
    video_url: '/hamzzi_source/reward3.MP4',
    emoji: '✨',
  },
  {
    id: 'reward_4',
    title: '해금됨! 10점 달성!',
    unlock_score: 10,
    video_url: '/hamzzi_source/reward4.MP4',
    emoji: '🌟',
  },
];

/**
 * 비디오 경로 설정
 * 다양한 상황에서 사용되는 햄찌 비디오
 */
export const HAMZZI_VIDEOS = {
  home: '/hamzzi_source/normal4.MP4',
  mission: '/hamzzi_source/mission.MP4',
  success: '/hamzzi_source/success.MP4',
  abandon: '/hamzzi_source/abandon.MP4',
  achievement: '/hamzzi_source/achievement.MP4',
};

/**
 * 미디어 크기 상수
 * 모든 페이지에서 일관된 크기 사용을 위한 중앙화된 설정
 */
export const MEDIA_SIZES = {
  /** 캐릭터 이미지/비디오 기본 크기 (Home, Landing, Help 등) */
  HAMZZI_CHARACTER: {
    width: 280,
    height: 280,
    className: 'w-70 h-70', // Tailwind: 280px
  },
  /** 미션 관련 비디오 크기 (Mission, Success, Abandon) */
  HAMZZI_VIDEO: {
    width: 256,
    height: 256,
    className: 'w-64 h-64', // Tailwind: 256px
  },
  /** 큰 캐릭터 (필요 시 사용) */
  HAMZZI_LARGE: {
    width: 320,
    height: 320,
    className: 'w-80 h-80', // Tailwind: 320px
  },
} as const;
