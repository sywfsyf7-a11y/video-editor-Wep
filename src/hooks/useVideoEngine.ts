'use client';

import { useCallback, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';

/**
 * محرك مزامنة الفيديو الحقيقي مع التايم لاين
 * يتولى التحكم بتشغيل/إيقاف عناصر <video> HTML5 بالتزامن التام مع مؤشر التشغيل.
 */
export function useVideoEngine() {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const { tracks, currentTime, isPlaying } = useEditorStore();

  const registerVideoRef = useCallback((clipId: string, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(clipId, el);
    } else {
      videoRefs.current.delete(clipId);
    }
  }, []);

  /**
   * مزامنة جميع مقاطع الفيديو مع وقت التايم لاين الحالي
   * يُستدعى عند تغيير currentTime أو تغيير حالة التشغيل
   */
  const syncVideos = useCallback((time: number, playing: boolean) => {
    const videoTrack = tracks.find((t) => t.type === 'video');
    if (!videoTrack) return;

    videoTrack.clips.forEach((clip) => {
      const videoEl = videoRefs.current.get(clip.id);
      if (!videoEl || !clip.sourceUrl?.startsWith('blob:')) return;

      const clipLocalTime = time - clip.startTime;
      const isActive = time >= clip.startTime && time < clip.startTime + clip.duration;

      if (!isActive) {
        if (!videoEl.paused) videoEl.pause();
        return;
      }

      // مزامنة الوقت الداخلي للفيديو
      const targetVideoTime = Math.max(0, clipLocalTime * (clip.speed || 1));
      if (Math.abs(videoEl.currentTime - targetVideoTime) > 0.15) {
        videoEl.currentTime = targetVideoTime;
      }

      // مزامنة حالة التشغيل
      if (playing && videoEl.paused) {
        videoEl.play().catch(() => {});
      } else if (!playing && !videoEl.paused) {
        videoEl.pause();
      }

      // ضبط مستوى الصوت وسرعة التشغيل
      videoEl.volume = clip.volume / 100;
      videoEl.playbackRate = clip.speed || 1;
    });
  }, [tracks]);

  return { registerVideoRef, syncVideos, videoRefs };
}
