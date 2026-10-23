'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { RESOLUTIONS, ASPECT_RATIOS } from '@/types/editor';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Sparkles,
  Film,
  Square,
} from 'lucide-react';

export const PreviewPlayer: React.FC = () => {
  const {
    currentTime,
    duration,
    isPlaying,
    togglePlay,
    setIsPlaying,
    setCurrentTime,
    splitSelectedClip,
    deleteSelectedClip,
    resolution,
    aspectRatio,
    tracks,
  } = useEditorStore();

  const currentRes = RESOLUTIONS[resolution];
  const currentRatio = ASPECT_RATIOS[aspectRatio];

  // ربط عناصر الفيديو الحقيقية مع المقاطع
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // رسم الإطارات في حلقة RAF 60 FPS
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  // تحديث الفيديوهات المرتبطة بالوقت الحالي
  const syncVideoElements = useCallback((time: number, playing: boolean) => {
    const videoTrack = tracks.find((t) => t.type === 'video');
    if (!videoTrack) return;

    videoTrack.clips.forEach((clip) => {
      if (!clip.sourceUrl?.startsWith('blob:')) return;
      const videoEl = videoRefs.current.get(clip.id);
      if (!videoEl) return;

      const isActive = time >= clip.startTime && time < clip.startTime + clip.duration;
      if (!isActive) {
        if (!videoEl.paused) videoEl.pause();
        return;
      }

      const localTime = (time - clip.startTime) * (clip.speed || 1);
      if (Math.abs(videoEl.currentTime - localTime) > 0.12) {
        videoEl.currentTime = Math.max(0, localTime);
      }
      videoEl.volume = (clip.volume ?? 100) / 100;
      videoEl.playbackRate = clip.speed || 1;
      if (playing && videoEl.paused) videoEl.play().catch(() => {});
      else if (!playing && !videoEl.paused) videoEl.pause();
    });
  }, [tracks]);

  // حلقة الـ Animation Frame لتحريك مؤشر الوقت
  useEffect(() => {
    const loop = (now: number) => {
      if (isPlaying) {
        const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
        const next = currentTimeRef.current + delta;
        if (next >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
          syncVideoElements(0, false);
        } else {
          setCurrentTime(next);
          syncVideoElements(next, true);
        }
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, duration, setCurrentTime, setIsPlaying, syncVideoElements]);

  // مزامنة الفيديوهات عند تغيير الوقت يدوياً
  useEffect(() => {
    syncVideoElements(currentTime, isPlaying);
  }, [currentTime, isPlaying, syncVideoElements]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); setCurrentTime(Math.max(0, currentTime - (e.shiftKey ? 1 : 5))); break;
        case 'ArrowRight': e.preventDefault(); setCurrentTime(Math.min(duration, currentTime + (e.shiftKey ? 1 : 5))); break;
        case 'KeyS': splitSelectedClip(); break;
        case 'Delete': case 'Backspace': deleteSelectedClip(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, setCurrentTime, currentTime, duration, splitSelectedClip, deleteSelectedClip]);

  // Timecode
  const formatTimecode = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const fr = Math.floor((s % 1) * 30);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  };

  const activeTextClip = tracks.find((t) => t.type === 'text')?.clips.find(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  const activeVideoClip = tracks.find((t) => t.type === 'video')?.clips.find(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  const getCanvasClasses = () => {
    switch (aspectRatio) {
      case '9:16': return 'aspect-[9/16] h-full max-h-[430px]';
      case '1:1': return 'aspect-square h-full max-h-[430px]';
      case '4:5': return 'aspect-[4/5] h-full max-h-[430px]';
      case '21:9': return 'aspect-[21/9] w-full max-w-[740px]';
      default: return 'aspect-video w-full max-w-[740px] max-h-[430px]';
    }
  };

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-zinc-950 items-center justify-between p-4 overflow-hidden select-none">

      {/* رأس المعاينة: Timecode + الدقة + FPS */}
      <div className="w-full flex items-center justify-between px-2 text-xs z-10 shrink-0 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            {formatTimecode(currentTime)} / {formatTimecode(duration)}
          </span>
          <span className={`font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
            resolution === '8k' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
            : resolution === '4k' ? 'bg-amber-900/40 text-amber-300 border border-amber-500/40'
            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
          }`}>
            {currentRes.label} · {currentRes.width}×{currentRes.height}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="bg-zinc-900/60 border border-zinc-800 px-2 py-0.5 rounded">{currentRatio.label}</span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 60 FPS
          </span>
        </div>
      </div>

      {/* كانفاس المعاينة */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden">
        <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 flex items-center justify-center ${getCanvasClasses()}`}>

          {/* عرض جميع مقاطع الفيديو (النشط يظهر، الباقي مخفي) */}
          {tracks.find((t) => t.type === 'video')?.clips.map((clip) => {
            if (!clip.sourceUrl?.startsWith('blob:')) return null;
            const isActive = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
            return (
              <video
                key={clip.id}
                ref={(el) => {
                  if (el) videoRefs.current.set(clip.id, el);
                  else videoRefs.current.delete(clip.id);
                }}
                src={clip.sourceUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                muted={false}
                playsInline
                preload="auto"
              />
            );
          })}

          {/* صورة افتراضية عند غياب مقطع فيديو حقيقي */}
          {!activeVideoClip?.sourceUrl?.startsWith('blob:') && (
            <img
              src={activeVideoClip?.sourceUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200'}
              alt=""
              className="w-full h-full object-cover"
            />
          )}

          {/* نص التراجم الفعّال */}
          {activeTextClip && (
            <div className="absolute inset-x-0 bottom-10 flex justify-center px-6 pointer-events-none z-20">
              <span
                style={{ fontSize: `${activeTextClip.fontSize || 32}px`, color: activeTextClip.textColor || '#fff' }}
                className="font-black text-center drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] bg-black/45 px-5 py-2 rounded-2xl border border-white/10"
              >
                {activeTextClip.textContent}
              </span>
            </div>
          )}

          {/* شارة دقة الاستوديو */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-white flex items-center gap-1.5 z-10">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>معاينة حية · {resolution.toUpperCase()}</span>
          </div>

          {/* اسم المقطع النشط */}
          {activeVideoClip && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 flex items-center gap-1.5 z-10">
              <Film className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[160px]">{activeVideoClip.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* شريط التحكم بالتشغيل */}
      <div className="w-full max-w-lg mt-3 shrink-0">
        {/* شريط التقدم القابل للنقر */}
        <div
          className="w-full h-1.5 bg-zinc-800 rounded-full mb-3 cursor-pointer group relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setCurrentTime(Math.max(0, Math.min(ratio * duration, duration)));
          }}
        >
          <div
            style={{ width: `${(currentTime / duration) * 100}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full relative"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* أزرار التحكم الرئيسية */}
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800/80 rounded-2xl px-4 py-2 flex items-center justify-between shadow-xl text-zinc-300">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentTime(0)}
              className="p-1.5 hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-zinc-200"
              title="العودة للبداية (Home)"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
              className="p-2 hover:bg-zinc-800 rounded-xl transition text-zinc-400 hover:text-zinc-100"
              title="إرجاع 5 ثوانٍ (← السهم الأيسر)"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-2xl transition shadow-lg shadow-amber-500/25 active:scale-95 mx-1"
              title="تشغيل / إيقاف (Space)"
            >
              {isPlaying
                ? <Pause className="w-5 h-5 fill-current" />
                : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
              className="p-2 hover:bg-zinc-800 rounded-xl transition text-zinc-400 hover:text-zinc-100"
              title="تقديم 5 ثوانٍ (→ السهم الأيمن)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="font-mono text-xs font-bold text-zinc-200 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
            {formatTimecode(currentTime)}
          </div>

          <button
            onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
              else document.exitFullscreen().catch(() => {});
            }}
            className="p-2 hover:bg-zinc-800 rounded-xl transition text-zinc-400 hover:text-zinc-100"
            title="ملء الشاشة (F11)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
