'use client';

import React, { useEffect, useRef } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);

  // حلقة المزامنة الزمنية المباشرة عند التشغيل (60 FPS loop)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        const nextTime = currentTime + delta;
        if (nextTime >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(nextTime);
        }
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, duration, setCurrentTime, setIsPlaying]);

  // اختصارات لوحة المفاتيح العالمية (Space, S, Delete, J, L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(Math.max(0, currentTime - (e.shiftKey ? 1 : 5)));
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(Math.min(duration, currentTime + (e.shiftKey ? 1 : 5)));
      } else if (e.key === 's' || e.key === 'S') {
        splitSelectedClip();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedClip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, setCurrentTime, currentTime, duration, splitSelectedClip, deleteSelectedClip]);

  // تحويل الثواني إلى صيغة Timecode (00:00:00:00)
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(
      frames
    ).padStart(2, '0')}`;
  };

  // البحث عن النص الفعال حالياً في التايم لاين
  const activeTextClip = tracks
    .find((t) => t.type === 'text')
    ?.clips.find(
      (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
    );

  // البحث عن مقطع الفيديو الفعال حالياً
  const activeVideoClip = tracks
    .find((t) => t.type === 'video')
    ?.clips.find(
      (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
    );

  // حساب أبعاد إطار الكانفاس وفق نسبة الأبعاد
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] h-full max-h-[440px] max-w-full';
      case '1:1':
        return 'aspect-square h-full max-h-[440px] max-w-full';
      case '4:5':
        return 'aspect-[4/5] h-full max-h-[440px] max-w-full';
      case '21:9':
        return 'aspect-[21/9] w-full max-w-[760px] max-h-[440px]';
      case '16:9':
      default:
        return 'aspect-video w-full max-w-[760px] max-h-[440px]';
    }
  };

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-zinc-950 items-center justify-between p-4 overflow-hidden relative select-none">
      {/* شارة جودة العرض ومعلومات الدقة */}
      <div className="w-full flex items-center justify-between px-2 text-xs z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
            {formatTimecode(currentTime)} / {formatTimecode(duration)}
          </span>
          <span
            className={`font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
              resolution === '8k'
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                : resolution === '4k'
                ? 'bg-amber-900/40 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}
          >
            {currentRes.label} ({currentRes.width}×{currentRes.height})
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span className="bg-zinc-900/60 border border-zinc-800 px-2 py-0.5 rounded">
            {currentRatio.label}
          </span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 60 FPS
          </span>
        </div>
      </div>

      {/* مساحة العرض الرئيسية (Canvas Preview Stage) */}
      <div className="flex-1 w-full min-h-0 min-w-0 flex items-center justify-center p-2 overflow-hidden">
        <div
          className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 flex items-center justify-center transition-all duration-300 ${getAspectRatioClasses()}`}
        >
          {/* عرض الفيديو النشط أو صورة الغلاف */}
          {activeVideoClip?.sourceUrl && activeVideoClip.sourceUrl.startsWith('blob:') ? (
            <video
              ref={videoRef}
              src={activeVideoClip.sourceUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img
              src={
                activeVideoClip?.sourceUrl ||
                'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200'
              }
              alt="معاينة الفيديو"
              className="w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* طبقة النص التفاعلية (Active Text Overlay) */}
          {activeTextClip && (
            <div className="absolute inset-x-0 bottom-12 flex justify-center px-4 pointer-events-none z-10">
              <span
                style={{
                  fontSize: `${activeTextClip.fontSize || 32}px`,
                  color: activeTextClip.textColor || '#ffffff',
                }}
                className="font-black text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-black/40 px-4 py-1.5 rounded-xl border border-white/10"
              >
                {activeTextClip.textContent}
              </span>
            </div>
          )}

          {/* علامة إرشادية لدقة الـ 8K / 4K */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] font-mono font-bold text-white flex items-center gap-1.5 pointer-events-none z-10">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>معاينة حية فائقة الدقة {resolution.toUpperCase()}</span>
          </div>

          {/* اسم المقطع النشط */}
          {activeVideoClip && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] text-zinc-300 flex items-center gap-1.5 pointer-events-none z-10">
              <Film className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[150px]">{activeVideoClip.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* شريط أدوات التحكم بالتشغيل السفلي (Transport Controls) */}
      <div className="w-full max-w-lg bg-zinc-900/80 backdrop-blur border border-zinc-800/80 rounded-2xl px-4 py-2 flex items-center justify-between shadow-xl text-zinc-300 z-10 shrink-0">
        <div className="flex items-center gap-1">
          {/* إرجاع 5 ثواني */}
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
            className="p-2 hover:bg-zinc-800 rounded-xl transition text-zinc-400 hover:text-zinc-100"
            title="إرجاع 5 ثواني (J أو السهم الأيسر)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* زر التشغيل والإيقاف الرئيسي */}
          <button
            onClick={togglePlay}
            className="p-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-2xl transition shadow-lg shadow-amber-500/25 active:scale-95 mx-1"
            title="تشغيل / إيقاف (مسافة Space)"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* تقديم 5 ثواني */}
          <button
            onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
            className="p-2 hover:bg-zinc-800 rounded-xl transition text-zinc-400 hover:text-zinc-100"
            title="تقديم 5 ثواني (L أو السهم الأيمن)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* مؤشر زمني دقيق */}
        <div className="font-mono text-xs font-semibold text-zinc-300 bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800">
          {formatTimecode(currentTime)}
        </div>

        <div className="flex items-center gap-1 text-zinc-400">
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="p-2 hover:bg-zinc-800 rounded-xl transition hover:text-zinc-100"
            title="شاشة كاملة (F11)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
