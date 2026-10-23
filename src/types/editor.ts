export type Resolution = '1080p' | '2k' | '4k' | '8k';

export interface ResolutionDetail {
  id: Resolution;
  label: string;
  name: string;
  width: number;
  height: number;
  badge?: string;
}

export const RESOLUTIONS: Record<Resolution, ResolutionDetail> = {
  '1080p': { id: '1080p', label: '1080p', name: 'Full HD (1920 × 1080)', width: 1920, height: 1080 },
  '2k': { id: '2k', label: '2K QHD', name: '2K Quad HD (2560 × 1440)', width: 2560, height: 1440, badge: 'High-Res' },
  '4k': { id: '4k', label: '4K UHD', name: '4K Ultra HD (3840 × 2160)', width: 3840, height: 2160, badge: 'Pro Cinema' },
  '8k': { id: '8k', label: '8K FUHD', name: '8K Full Ultra HD (7680 × 4320)', width: 7680, height: 4320, badge: 'Ultra Max' },
};

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';

export interface AspectRatioDetail {
  id: AspectRatio;
  label: string;
  desc: string;
  ratioWidth: number;
  ratioHeight: number;
}

export const ASPECT_RATIOS: Record<AspectRatio, AspectRatioDetail> = {
  '16:9': { id: '16:9', label: '16:9', desc: 'يوتيوب / شاشات عريضة', ratioWidth: 16, ratioHeight: 9 },
  '9:16': { id: '9:16', label: '9:16', desc: 'تيك توك / ريلز / شورتس', ratioWidth: 9, ratioHeight: 16 },
  '1:1': { id: '1:1', label: '1:1', desc: 'إنستغرام مربع', ratioWidth: 1, ratioHeight: 1 },
  '4:5': { id: '4:5', label: '4:5', desc: 'منشورات فيسبوك / إنستغرام', ratioWidth: 4, ratioHeight: 5 },
  '21:9': { id: '21:9', label: '21:9', desc: 'سينمائي عريض (Cinematic)', ratioWidth: 21, ratioHeight: 9 },
};

export type TrackType = 'video' | 'audio' | 'text';

export interface Clip {
  id: string;
  trackId: string;
  title: string;
  type: TrackType;
  startTime: number;      // وقت البداية على التايم لاين بالثواني
  duration: number;       // مدة المقطع بالثواني
  sourceOffset?: number;  // بداية القطع من الفيديو الأصلي
  sourceUrl?: string;
  thumbnailUrl?: string;
  volume: number;         // من 0 إلى 100
  speed: number;          // 0.5x, 1x, 2x
  opacity: number;        // من 0 إلى 100
  textContent?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  isAiEnhanced?: boolean;
}

export interface Track {
  id: string;
  title: string;
  type: TrackType;
  isMuted: boolean;
  isLocked: boolean;
  isHidden: boolean;
  clips: Clip[];
}

export type SidebarTab = 'media' | 'text' | 'audio' | 'transitions' | 'effects' | 'ai';
