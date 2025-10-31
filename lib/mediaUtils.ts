/**
 * 미디어 파일 관리 유틸리티
 *
 * 모든 햄찌 이미지/비디오 경로를 중앙에서 관리하여
 * 코드 중복을 제거하고 일관성을 보장합니다.
 */

import { Category } from './store';

/**
 * Normal 상태 미디어 파일 정보
 * normal1-3, 5-6은 jpg, normal4는 MP4
 */
const NORMAL_MEDIA_FILES = [
  { file: 'normal1', extension: 'jpg' },
  { file: 'normal2', extension: 'jpg' },
  { file: 'normal3', extension: 'jpg' },
  { file: 'normal4', extension: 'MP4' }, // 비디오
  { file: 'normal5', extension: 'jpg' },
  { file: 'normal6', extension: 'jpg' },
];

/**
 * 카테고리별 미션 영상 정보
 * 각 카테고리마다 여러 개의 영상이 있음
 */
const MISSION_VIDEO_CONFIG: Record<Category, { name: string; count: number }> = {
  sleep: { name: 'sleep', count: 3 },
  meal: { name: 'eating', count: 4 },
  grooming: { name: 'grooming', count: 3 },
  activity: { name: 'active', count: 5 },
};

/**
 * 미션 포기/실패 시 표시할 미디어 파일들
 * mission_end1은 MP4, mission_end2-4는 jpg
 */
const FAIL_MEDIA_FILES = [
  { path: '/hamzzi_source/mission_end1.MP4', type: 'video' as const },
  { path: '/hamzzi_source/mission_end2.jpg', type: 'image' as const },
  { path: '/hamzzi_source/mission_end3.jpg', type: 'image' as const },
  { path: '/hamzzi_source/mission_end4.jpg', type: 'image' as const },
];

/**
 * Normal 상태의 랜덤 미디어 경로를 반환
 *
 * @returns 랜덤하게 선택된 normal 미디어 파일의 경로
 *
 * @example
 * const mediaPath = getNormalMediaPath();
 * // Returns: "/hamzzi_source/normal4.MP4" 또는 "/hamzzi_source/normal2.jpg"
 */
export function getNormalMediaPath(): string {
  const randomIndex = Math.floor(Math.random() * NORMAL_MEDIA_FILES.length);
  const { file, extension } = NORMAL_MEDIA_FILES[randomIndex];
  return `/hamzzi_source/${file}.${extension}`;
}

/**
 * 카테고리에 맞는 미션 영상 경로를 랜덤하게 반환
 *
 * @param category - 미션 카테고리 (sleep, meal, grooming, activity)
 * @returns 해당 카테고리의 랜덤 미션 영상 경로
 *
 * @example
 * const videoPath = getMissionVideoPath('meal');
 * // Returns: "/hamzzi_source/mission_eating2.MP4" (1-4 중 랜덤)
 */
export function getMissionVideoPath(category: Category): string {
  const config = MISSION_VIDEO_CONFIG[category];
  const randomNum = Math.floor(Math.random() * config.count) + 1;
  return `/hamzzi_source/mission_${config.name}${randomNum}.MP4`;
}

/**
 * 미션 포기/실패 시 표시할 랜덤 미디어 정보를 반환
 *
 * @returns 랜덤하게 선택된 fail 미디어의 경로와 타입
 *
 * @example
 * const { path, type } = getFailMedia();
 * // Returns: { path: "/hamzzi_source/mission_end1.MP4", type: "video" }
 */
export function getFailMedia(): { path: string; type: 'image' | 'video' } {
  const randomIndex = Math.floor(Math.random() * FAIL_MEDIA_FILES.length);
  return FAIL_MEDIA_FILES[randomIndex];
}

/**
 * 미디어 파일의 확장자를 기반으로 타입을 판단
 *
 * @param path - 미디어 파일 경로
 * @returns 'video' 또는 'image'
 *
 * @example
 * getMediaType("/hamzzi_source/normal4.MP4") // Returns: "video"
 * getMediaType("/hamzzi_source/normal1.jpg") // Returns: "image"
 */
export function getMediaType(path: string): 'video' | 'image' {
  return path.endsWith('.MP4') || path.endsWith('.mp4') ? 'video' : 'image';
}

/**
 * 고정된 특수 미디어 경로들
 */
export const SPECIAL_MEDIA = {
  reward: '/hamzzi_source/reward1.MP4', // 미션 성공 리워드
  loading: '/hamzzi_source/loading.MP4', // 로딩 화면
} as const;
