/**
 * 미디어 파일 관리 유틸리티
 *
 * 모든 햄찌 이미지/비디오 경로를 중앙에서 관리하여
 * 코드 중복을 제거하고 일관성을 보장합니다.
 */

import { Category } from './store';

/**
 * Normal 상태 미디어 파일 정보
 * normal1-3, 5-6은 jpg, normal4, 7-8은 MP4
 */
const NORMAL_MEDIA_FILES = [
  { file: 'normal1', extension: 'jpg', type: 'image' as const },
  { file: 'normal2', extension: 'jpg', type: 'image' as const },
  { file: 'normal3', extension: 'jpg', type: 'image' as const },
  { file: 'normal4', extension: 'MP4', type: 'video' as const },
  { file: 'normal5', extension: 'jpg', type: 'image' as const },
  { file: 'normal6', extension: 'jpg', type: 'image' as const },
  { file: 'normal7', extension: 'MP4', type: 'video' as const }, // 추가
  { file: 'normal8', extension: 'MP4', type: 'video' as const }, // 추가
];

/**
 * 카테고리별 미션 영상 정보
 * 각 카테고리마다 여러 개의 영상이 있음
 */
const MISSION_VIDEO_CONFIG: Record<Category, { name: string; count: number }> = {
  sleep: { name: 'sleep', count: 4 }, // mission_sleep4.MP4 추가로 3 → 4
  meal: { name: 'eating', count: 4 },
  grooming: { name: 'grooming', count: 3 },
  activity: { name: 'active', count: 5 },
};

/**
 * 미션 완료(성공/실패) 시 표시할 미디어 파일들
 * mission_end1은 MP4, mission_end2-4는 jpg
 * success와 abandon 페이지 모두에서 사용
 */
const END_MEDIA_FILES = [
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
 * 미션 완료(성공/실패) 시 표시할 랜덤 미디어 정보를 반환
 * success와 abandon 페이지 모두에서 사용
 *
 * @returns 랜덤하게 선택된 end 미디어의 경로와 타입
 *
 * @example
 * const { path, type } = getEndMedia();
 * // Returns: { path: "/hamzzi_source/mission_end1.MP4", type: "video" }
 */
export function getEndMedia(): { path: string; type: 'image' | 'video' } {
  const randomIndex = Math.floor(Math.random() * END_MEDIA_FILES.length);
  return END_MEDIA_FILES[randomIndex];
}

/**
 * @deprecated getFailMedia()는 getEndMedia()로 이름이 변경되었습니다.
 * 하위 호환성을 위해 유지됩니다.
 */
export function getFailMedia(): { path: string; type: 'image' | 'video' } {
  return getEndMedia();
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

/**
 * Normal 이미지만 랜덤하게 선택하여 경로 반환
 *
 * @returns 랜덤하게 선택된 normal 이미지 파일의 경로
 *
 * @example
 * const imagePath = getNormalImagePath();
 * // Returns: "/hamzzi_source/normal1.jpg" (normal1-3, 5-6 중 랜덤)
 */
export function getNormalImagePath(): string {
  const images = NORMAL_MEDIA_FILES.filter((media) => media.type === 'image');
  const randomIndex = Math.floor(Math.random() * images.length);
  const { file, extension } = images[randomIndex];
  return `/hamzzi_source/${file}.${extension}`;
}

/**
 * Normal 비디오만 랜덤하게 선택하여 경로 반환
 *
 * @returns 랜덤하게 선택된 normal 비디오 파일의 경로
 *
 * @example
 * const videoPath = getNormalVideoPath();
 * // Returns: "/hamzzi_source/normal4.MP4" (normal4, 7-8 중 랜덤)
 */
export function getNormalVideoPath(): string {
  const videos = NORMAL_MEDIA_FILES.filter((media) => media.type === 'video');
  const randomIndex = Math.floor(Math.random() * videos.length);
  const { file, extension } = videos[randomIndex];
  return `/hamzzi_source/${file}.${extension}`;
}

/**
 * Normal 미디어 파일의 통계 정보 반환
 *
 * @returns 이미지, 비디오, 전체 파일 개수
 *
 * @example
 * const stats = getNormalMediaStats();
 * // Returns: { images: 5, videos: 3, total: 8 }
 */
export function getNormalMediaStats(): { images: number; videos: number; total: number } {
  const images = NORMAL_MEDIA_FILES.filter((media) => media.type === 'image').length;
  const videos = NORMAL_MEDIA_FILES.filter((media) => media.type === 'video').length;
  return {
    images,
    videos,
    total: NORMAL_MEDIA_FILES.length,
  };
}
