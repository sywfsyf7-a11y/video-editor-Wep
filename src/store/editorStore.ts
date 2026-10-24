import { create } from 'zustand';
import { Resolution, AspectRatio, Track, Clip, SidebarTab } from '@/types/editor';

interface HistoryState {
  projectTitle: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  duration: number;
  tracks: Track[];
}

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
  uploadedMedia: { id: string; name: string; type: 'video' | 'audio'; url: string; duration: number; thumbnailUrl?: string }[];

  // سجل التراجع والإعادة (Undo/Redo)
  past: HistoryState[];
  future: HistoryState[];

  // وظائف التحكم
  setProjectTitle: (title: string) => void;
  setResolution: (res: Resolution) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setFps: (fps: number) => void;
  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  selectClip: (id: string | null) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  setExportModalOpen: (open: boolean) => void;
  setAIModalOpen: (open: boolean) => void;
  addUploadedMedia: (media: { id: string; name: string; type: 'video' | 'audio'; url: string; duration: number; thumbnailUrl?: string }) => void;

  // عمليات التحرير على المقاطع
  updateClip: (id: string, updates: Partial<Clip>) => void;
  splitSelectedClip: () => void;
  deleteSelectedClip: () => void;
  addClipToTrack: (trackId: string, clip: Omit<Clip, 'id'>) => void;
  toggleMuteTrack: (trackId: string) => void;
  toggleLockTrack: (trackId: string) => void;

  // دوال التراجع والإعادة
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
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

// محاولة استرجاع الحالة المحفوظة محلياً (Auto-save)
let savedState: Partial<EditorState> = {};
if (typeof window !== 'undefined') {
  try {
    const local = localStorage.getItem('autocut_project_state');
    if (local) {
      savedState = JSON.parse(local);
    }
  } catch (e) {
    console.error('Failed to load saved state from localStorage', e);
  }
}

// مساعد لحفظ الحالة الحالية في الـ history قبل التعديل
const recordHistory = (state: EditorState): HistoryState => ({
  projectTitle: state.projectTitle,
  resolution: state.resolution,
  aspectRatio: state.aspectRatio,
  duration: state.duration,
  tracks: JSON.parse(JSON.stringify(state.tracks)),
});

// مساعد للحفظ التلقائي
const saveToLocalStorage = (state: Partial<EditorState>) => {
  if (typeof window === 'undefined') return;
  try {
    const dataToSave = {
      projectTitle: state.projectTitle,
      resolution: state.resolution,
      aspectRatio: state.aspectRatio,
      duration: state.duration,
      tracks: state.tracks,
      uploadedMedia: state.uploadedMedia,
    };
    localStorage.setItem('autocut_project_state', JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to auto-save to localStorage', e);
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  projectTitle: savedState.projectTitle || 'مشروع مونتاج بدون عنوان',
  resolution: savedState.resolution || '4k',
  aspectRatio: savedState.aspectRatio || '16:9',
  fps: 60,

  currentTime: 2.5,
  duration: savedState.duration || 25.0,
  isPlaying: false,
  zoom: 35,

  selectedClipId: 'clip-vid-1',
  activeSidebarTab: 'ai',
  isExportModalOpen: false,
  isAIModalOpen: false,

  tracks: savedState.tracks || initialTracks,
  uploadedMedia: savedState.uploadedMedia || [],

  past: [],
  future: [],

  setProjectTitle: (title) => {
    const current = get();
    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      projectTitle: title,
    });
    saveToLocalStorage(get());
  },

  setResolution: (res) => {
    const current = get();
    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      resolution: res,
    });
    saveToLocalStorage(get());
  },

  setAspectRatio: (ratio) => {
    const current = get();
    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      aspectRatio: ratio,
    });
    saveToLocalStorage(get());
  },

  setFps: (fps) => set({ fps }),
  setCurrentTime: (time) => set({ currentTime: Math.max(0, Math.min(time, get().duration)) }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(zoom, 100)) }),
  selectClip: (id) => set({ selectedClipId: id }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setAIModalOpen: (open) => set({ isAIModalOpen: open }),

  addUploadedMedia: (media) => {
    set((state) => {
      const newMedia = [media, ...state.uploadedMedia];
      saveToLocalStorage({ ...state, uploadedMedia: newMedia });
      return { uploadedMedia: newMedia };
    });
  },

  updateClip: (id, updates) => {
    const current = get();
    const newTracks = current.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => (clip.id === id ? { ...clip, ...updates } : clip)),
    }));
    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      tracks: newTracks,
    });
    saveToLocalStorage(get());
  },

  splitSelectedClip: () => {
    const current = get();
    const { selectedClipId, currentTime, tracks } = current;
    if (!selectedClipId) return;

    let modified = false;
    const newTracks = tracks.map((track) => {
      const clipIndex = track.clips.findIndex((c) => c.id === selectedClipId);
      if (clipIndex === -1) return track;

      const clip = track.clips[clipIndex];
      if (currentTime <= clip.startTime || currentTime >= clip.startTime + clip.duration) {
        return track;
      }

      modified = true;
      const firstPartDuration = currentTime - clip.startTime;
      const secondPartDuration = clip.duration - firstPartDuration;

      const updatedFirstClip: Clip = { ...clip, duration: firstPartDuration };
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
    });

    if (modified) {
      set({
        past: [...current.past, recordHistory(current)],
        future: [],
        tracks: newTracks,
      });
      saveToLocalStorage(get());
    }
  },

  deleteSelectedClip: () => {
    const current = get();
    const { selectedClipId, tracks } = current;
    if (!selectedClipId) return;

    const newTracks = tracks.map((track) => ({
      ...track,
      clips: track.clips.filter((c) => c.id !== selectedClipId),
    }));

    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      selectedClipId: null,
      tracks: newTracks,
    });
    saveToLocalStorage(get());
  },

  addClipToTrack: (trackId, clipData) => {
    const current = get();
    const newTracks = current.tracks.map((track) => {
      if (track.id !== trackId) return track;
      const newClip: Clip = { ...clipData, id: `clip-${Date.now()}` };
      return { ...track, clips: [...track.clips, newClip] };
    });

    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      tracks: newTracks,
    });
    saveToLocalStorage(get());
  },

  toggleMuteTrack: (trackId) => {
    const current = get();
    const newTracks = current.tracks.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t));
    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      tracks: newTracks,
    });
    saveToLocalStorage(get());
  },

  toggleLockTrack: (trackId) => {
    const current = get();
    const newTracks = current.tracks.map((t) => (t.id === trackId ? { ...t, isLocked: !t.isLocked } : t));
    set({
      past: [...current.past, recordHistory(current)],
      future: [],
      tracks: newTracks,
    });
    saveToLocalStorage(get());
  },

  // تنفيذ التراجع (Undo)
  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    const currentHistory: HistoryState = {
      projectTitle: state.projectTitle,
      resolution: state.resolution,
      aspectRatio: state.aspectRatio,
      duration: state.duration,
      tracks: JSON.parse(JSON.stringify(state.tracks)),
    };

    set({
      past: newPast,
      future: [currentHistory, ...state.future],
      projectTitle: previous.projectTitle,
      resolution: previous.resolution,
      aspectRatio: previous.aspectRatio,
      duration: previous.duration,
      tracks: previous.tracks,
    });
    saveToLocalStorage(get());
  },

  // تنفيذ الإعادة (Redo)
  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    const currentHistory: HistoryState = {
      projectTitle: state.projectTitle,
      resolution: state.resolution,
      aspectRatio: state.aspectRatio,
      duration: state.duration,
      tracks: JSON.parse(JSON.stringify(state.tracks)),
    };

    set({
      past: [...state.past, currentHistory],
      future: newFuture,
      projectTitle: next.projectTitle,
      resolution: next.resolution,
      aspectRatio: next.aspectRatio,
      duration: next.duration,
      tracks: next.tracks,
    });
    saveToLocalStorage(get());
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

