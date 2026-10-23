import { create } from 'zustand';
import { Resolution, AspectRatio, Track, Clip, SidebarTab } from '@/types/editor';

interface EditorState {
  // مشروع
  projectTitle: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  fps: number;
  
  // مشغل الفيديو
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  zoom: number; // بكسل لكل ثانية على التايم لاين
  
  // تحديد وعناصر
  selectedClipId: string | null;
  activeSidebarTab: SidebarTab;
  isExportModalOpen: boolean;
  isAIModalOpen: boolean;
  
  // التراكات والمقاطع
  tracks: Track[];
  
  // وظائف التحكم
  setProjectTitle: (title: string) => void;
  setResolution: (res: Resolution) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setFps: (fps: number) => void;
  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  setZoom: (zoom: number) => void;
  selectClip: (id: string | null) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  setExportModalOpen: (open: boolean) => void;
  setAIModalOpen: (open: boolean) => void;
  
  // عمليات التحرير على المقاطع
  updateClip: (id: string, updates: Partial<Clip>) => void;
  splitSelectedClip: () => void;
  deleteSelectedClip: () => void;
  addClipToTrack: (trackId: string, clip: Omit<Clip, 'id'>) => void;
  toggleMuteTrack: (trackId: string) => void;
  toggleLockTrack: (trackId: string) => void;
}

const initialTracks: Track[] = [
  {
    id: 'track-text-1',
    title: 'نصوص وترجمة (Text)',
    type: 'text',
    isMuted: false,
    isLocked: false,
    isHidden: false,
    clips: [
      {
        id: 'clip-text-1',
        trackId: 'track-text-1',
        title: 'عنوان سينمائي',
        type: 'text',
        startTime: 1.0,
        duration: 4.5,
        textContent: 'مرحباً بكم في AutoCut Studio AI',
        fontSize: 36,
        fontFamily: 'Cairo',
        textColor: '#f59e0b',
        opacity: 100,
        volume: 0,
        speed: 1,
      },
    ],
  },
  {
    id: 'track-video-1',
    title: 'فيديو رئيسي (Video A-Roll)',
    type: 'video',
    isMuted: false,
    isLocked: false,
    isHidden: false,
    clips: [
      {
        id: 'clip-vid-1',
        trackId: 'track-video-1',
        title: 'المشهد الأول - المقدمة',
        type: 'video',
        startTime: 0,
        duration: 8.5,
        sourceUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200',
        volume: 100,
        speed: 1,
        opacity: 100,
        isAiEnhanced: true,
      },
      {
        id: 'clip-vid-2',
        trackId: 'track-video-1',
        title: 'المشهد الثاني - استعراض الميزات',
        type: 'video',
        startTime: 8.5,
        duration: 9.0,
        sourceUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200',
        volume: 100,
        speed: 1,
        opacity: 100,
      },
    ],
  },
  {
    id: 'track-audio-1',
    title: 'موسيقى ومؤثرات (Audio)',
    type: 'audio',
    isMuted: false,
    isLocked: false,
    isHidden: false,
    clips: [
      {
        id: 'clip-aud-1',
        trackId: 'track-audio-1',
        title: 'موسيقى خلفية حماسية (Lo-Fi Beats)',
        type: 'audio',
        startTime: 0,
        duration: 17.5,
        volume: 75,
        speed: 1,
        opacity: 100,
      },
    ],
  },
];

export const useEditorStore = create<EditorState>((set, get) => ({
  projectTitle: 'مشروع مونتاج بدون عنوان',
  resolution: '4k', // الافتراضي 4K كما طلب المستخدم
  aspectRatio: '16:9',
  fps: 60,
  
  currentTime: 2.5,
  duration: 25.0,
  isPlaying: false,
  zoom: 35, // 35px لكل ثانية
  
  selectedClipId: 'clip-vid-1',
  activeSidebarTab: 'ai', // البداية بقسم الـ AI لإبراز إمكانيات الذكاء الاصطناعي
  isExportModalOpen: false,
  isAIModalOpen: false,
  
  tracks: initialTracks,
  
  setProjectTitle: (title) => set({ projectTitle: title }),
  setResolution: (res) => set({ resolution: res }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setFps: (fps) => set({ fps }),
  setCurrentTime: (time) => set({ currentTime: Math.max(0, Math.min(time, get().duration)) }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(zoom, 100)) }),
  selectClip: (id) => set({ selectedClipId: id }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setAIModalOpen: (open) => set({ isAIModalOpen: open }),
  
  updateClip: (id, updates) =>
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => (clip.id === id ? { ...clip, ...updates } : clip)),
      })),
    })),
    
  splitSelectedClip: () => {
    const { selectedClipId, currentTime, tracks } = get();
    if (!selectedClipId) return;
    
    set({
      tracks: tracks.map((track) => {
        const clipIndex = track.clips.findIndex((c) => c.id === selectedClipId);
        if (clipIndex === -1) return track;
        
        const clip = track.clips[clipIndex];
        // التأكد من أن مؤشر التشغيل يقع داخل مدة المقطع
        if (currentTime <= clip.startTime || currentTime >= clip.startTime + clip.duration) {
          return track;
        }
        
        const firstPartDuration = currentTime - clip.startTime;
        const secondPartDuration = clip.duration - firstPartDuration;
        
        const updatedFirstClip: Clip = {
          ...clip,
          duration: firstPartDuration,
        };
        
        const secondClip: Clip = {
          ...clip,
          id: `clip-${Date.now()}`,
          startTime: currentTime,
          duration: secondPartDuration,
          title: `${clip.title} (جزء 2)`,
        };
        
        const newClips = [...track.clips];
        newClips.splice(clipIndex, 1, updatedFirstClip, secondClip);
        return { ...track, clips: newClips };
      }),
    });
  },
  
  deleteSelectedClip: () => {
    const { selectedClipId, tracks } = get();
    if (!selectedClipId) return;
    
    set({
      selectedClipId: null,
      tracks: tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== selectedClipId),
      })),
    });
  },
  
  addClipToTrack: (trackId, clipData) => {
    set((state) => ({
      tracks: state.tracks.map((track) => {
        if (track.id !== trackId) return track;
        const newClip: Clip = {
          ...clipData,
          id: `clip-${Date.now()}`,
        };
        return {
          ...track,
          clips: [...track.clips, newClip],
        };
      }),
    }));
  },
  
  toggleMuteTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t)),
    })),
    
  toggleLockTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, isLocked: !t.isLocked } : t)),
    })),
}));
