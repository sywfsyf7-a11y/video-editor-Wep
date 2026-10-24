'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Clip } from '@/types/editor';
import {
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Magnet,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Type,
  Video,
  Music,
} from 'lucide-react';

// ========================
// أنواع السحب على التايم لاين
// ========================
type DragMode =
  | { kind: 'none' }
  | { kind: 'scrub' }
  | { kind: 'move'; clipId: string; trackId: string; startX: number; origStart: number }
  | { kind: 'trim-left'; clipId: string; trackId: string; startX: number; origStart: number; origDuration: number }
  | { kind: 'trim-right'; clipId: string; trackId: string; startX: number; origDuration: number };

export const Timeline: React.FC = () => {
  const {
    tracks,
    currentTime,
    duration,
    zoom,
    setZoom,
    setCurrentTime,
    selectedClipId,
    selectClip,
    splitSelectedClip,
    deleteSelectedClip,
    updateClip,
    toggleMuteTrack,
    toggleLockTrack,
  } = useEditorStore();

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragMode>({ kind: 'none' });
  const [, forceUpdate] = useState(0); // فقط لإعادة الرسم عند التغيير

  // حساب العرض الكلي للتايم لاين
  const playheadPositionPx = currentTime * zoom;
  const totalTimelineWidthPx = Math.max(duration * zoom, 1400);

  // تحديث الوقت عند السكراب
  const getTimeFromClientX = useCallback(
    (clientX: number): number => {
      if (!timelineContainerRef.current) return 0;
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const scrollLeft = timelineContainerRef.current.scrollLeft;
      const clickX = clientX - rect.left + scrollLeft;
      return Math.max(0, Math.min(clickX / zoom, duration));
    },
    [zoom, duration]
  );

  const getDeltaSeconds = useCallback(
    (currentX: number, startX: number): number => {
      return (currentX - startX) / zoom;
    },
    [zoom]
  );

  // ==================== Mouse Events (global) ====================
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;

      if (drag.kind === 'scrub') {
        setCurrentTime(getTimeFromClientX(e.clientX));
        return;
      }

      if (drag.kind === 'move') {
        const delta = getDeltaSeconds(e.clientX, drag.startX);
        const newStart = Math.max(0, drag.origStart + delta);
        updateClip(drag.clipId, { startTime: newStart });
        return;
      }

      if (drag.kind === 'trim-left') {
        const delta = getDeltaSeconds(e.clientX, drag.startX);
        const newStart = Math.max(0, drag.origStart + delta);
        const maxStart = drag.origStart + drag.origDuration - 0.5;
        const clampedStart = Math.min(newStart, maxStart);
        const newDuration = drag.origDuration - (clampedStart - drag.origStart);
        updateClip(drag.clipId, { startTime: clampedStart, duration: Math.max(0.5, newDuration) });
        return;
      }

      if (drag.kind === 'trim-right') {
        const delta = getDeltaSeconds(e.clientX, drag.startX);
        const newDuration = Math.max(0.5, drag.origDuration + delta);
        updateClip(drag.clipId, { duration: newDuration });
        return;
      }
    };

    const onMouseUp = () => {
      dragRef.current = { kind: 'none' };
      forceUpdate((n) => n + 1);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [getTimeFromClientX, getDeltaSeconds, setCurrentTime, updateClip]);

  // ==================== السكراب على المسطرة ====================
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = { kind: 'scrub' };
    setCurrentTime(getTimeFromClientX(e.clientX));
  };

  // ==================== سحب المقطع للتحريك ====================
  const handleClipMouseDown = (
    e: React.MouseEvent,
    clip: Clip,
    trackId: string
  ) => {
    e.stopPropagation();
    selectClip(clip.id);
    // لا تبدأ سحباً إذا كان المقطع مقفلاً
    const track = tracks.find((t) => t.id === trackId);
    if (track?.isLocked) return;

    dragRef.current = {
      kind: 'move',
      clipId: clip.id,
      trackId,
      startX: e.clientX,
      origStart: clip.startTime,
    };
  };

  // ==================== سحب مقبض التقليص الأيسر ====================
  const handleTrimLeftMouseDown = (
    e: React.MouseEvent,
    clip: Clip,
    trackId: string
  ) => {
    e.stopPropagation();
    const track = tracks.find((t) => t.id === trackId);
    if (track?.isLocked) return;
    dragRef.current = {
      kind: 'trim-left',
      clipId: clip.id,
      trackId,
      startX: e.clientX,
      origStart: clip.startTime,
      origDuration: clip.duration,
    };
  };

  // ==================== سحب مقبض التقليص الأيمن ====================
  const handleTrimRightMouseDown = (
    e: React.MouseEvent,
    clip: Clip,
    trackId: string
  ) => {
    e.stopPropagation();
    const track = tracks.find((t) => t.id === trackId);
    if (track?.isLocked) return;
    dragRef.current = {
      kind: 'trim-right',
      clipId: clip.id,
      trackId,
      startX: e.clientX,
      origDuration: clip.duration,
    };
  };

  // ==================== مسطرة الثواني ====================
  const renderTimeRuler = () => {
    const marks = [];
    const step = zoom < 25 ? 5 : zoom < 50 ? 2 : 1;
    for (let sec = 0; sec <= duration; sec += step) {
      const mins = Math.floor(sec / 60);
      const remainingSecs = Math.floor(sec % 60);
      const label = `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
      marks.push(
        <div
          key={sec}
          style={{ left: `${sec * zoom}px` }}
          className="absolute top-0 bottom-0 flex flex-col justify-between border-l border-zinc-800 pl-1 pointer-events-none"
        >
          <span className="text-[9px] font-mono text-zinc-500 font-semibold">{label}</span>
          <div className="w-px h-1.5 bg-zinc-700" />
        </div>
      );
    }
    return marks;
  };

  // ==================== موجة صوتية ====================
  const renderWaveform = (clipId: string) => {
    const bars = [];
    const seed = clipId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < 40; i++) {
      const heightPercent = 20 + Math.abs(Math.sin(seed + i * 0.7)) * 75;
      bars.push(
        <div
          key={i}
          style={{ height: `${heightPercent}%` }}
          className="w-1 bg-emerald-400/50 rounded-full shrink-0"
        />
      );
    }
    return (
      <div className="absolute inset-x-2 bottom-1.5 top-5 flex items-center gap-0.5 overflow-hidden opacity-60 pointer-events-none">
        {bars}
      </div>
    );
  };

  return (
    <div className="h-72 shrink-0 w-full border-t border-zinc-800 bg-zinc-950 flex flex-col select-none z-20">
      {/* شريط أدوات التايم لاين العلوي */}
      <div className="h-11 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={splitSelectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 rounded-lg text-xs font-bold transition active:scale-95"
            title="تقسيم المقطع عند المؤشر (S)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>تقسيم (Split)</span>
          </button>

          <button
            onClick={deleteSelectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-red-500 hover:text-white text-zinc-300 rounded-lg text-xs font-bold transition active:scale-95"
            title="حذف المقطع المحدد (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-2" />

          <button
            className="p-1.5 bg-zinc-800 text-amber-400 rounded-lg text-xs"
            title="المحاذاة التلقائية المغناطيسية (Snapping)"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* تكبير / تصغير */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(zoom - 5)}
            className="p-1 text-zinc-400 hover:text-zinc-200"
            title="تصغير التايم لاين"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={10}
            max={80}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24 accent-amber-500 cursor-pointer"
          />
          <button
            onClick={() => setZoom(zoom + 5)}
            className="p-1 text-zinc-400 hover:text-zinc-200"
            title="تكبير التايم لاين"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* مساحة التراكات */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* رؤوس التراكات */}
        <div className="w-44 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 z-10">
          <div className="h-7 border-b border-zinc-800 bg-zinc-900/30 flex items-center px-3 text-[10px] font-bold text-zinc-500">
            المسارات (Tracks)
          </div>

          <div className="flex-1 overflow-hidden space-y-1 py-1">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 px-3 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/20"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {track.type === 'video' && <Video className="w-4 h-4 text-blue-400 shrink-0" />}
                  {track.type === 'text' && <Type className="w-4 h-4 text-amber-400 shrink-0" />}
                  {track.type === 'audio' && <Music className="w-4 h-4 text-emerald-400 shrink-0" />}
                  <span className="text-[11px] font-bold text-zinc-300 truncate">{track.title}</span>
                </div>

                <div className="flex items-center gap-1 text-zinc-500">
                  <button onClick={() => toggleMuteTrack(track.id)} className="p-1 hover:text-zinc-200">
                    {track.isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button onClick={() => toggleLockTrack(track.id)} className="p-1 hover:text-zinc-200">
                    {track.isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الخط الزمني القابل للتمرير */}
        <div
          ref={timelineContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-zinc-950/70"
        >
          {/* مسطرة السحب لتغيير الوقت */}
          <div
            style={{ width: `${totalTimelineWidthPx}px` }}
            className="h-7 border-b border-zinc-800 bg-zinc-900/40 relative cursor-col-resize"
            onMouseDown={handleRulerMouseDown}
          >
            {renderTimeRuler()}
          </div>

          {/* مسارات المقاطع */}
          <div
            style={{ width: `${totalTimelineWidthPx}px` }}
            className="relative space-y-1 py-1"
          >
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 relative border-b border-zinc-900 bg-zinc-900/10"
              >
                {track.clips.map((clip) => {
                  const isSelected = selectedClipId === clip.id;
                  const clipLeftPx = clip.startTime * zoom;
                  const clipWidthPx = clip.duration * zoom;
                  const isDragging =
                    (dragRef.current.kind === 'move' && dragRef.current.clipId === clip.id) ||
                    (dragRef.current.kind === 'trim-left' && dragRef.current.clipId === clip.id) ||
                    (dragRef.current.kind === 'trim-right' && dragRef.current.clipId === clip.id);

                  return (
                    <div
                      key={clip.id}
                      onMouseDown={(e) => handleClipMouseDown(e, clip, track.id)}
                      style={{
                        left: `${clipLeftPx}px`,
                        width: `${clipWidthPx}px`,
                      }}
                      className={`absolute top-1 bottom-1 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-shadow border ${
                        isSelected
                          ? 'ring-2 ring-amber-400 border-amber-300 shadow-lg shadow-amber-500/20 z-10'
                          : 'border-zinc-700/60 hover:border-zinc-500'
                      } ${isDragging ? 'opacity-80 ring-2 ring-white/30' : ''}
                      ${
                        clip.type === 'video'
                          ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 text-blue-100'
                          : clip.type === 'text'
                          ? 'bg-gradient-to-r from-amber-900/80 to-orange-900/80 text-amber-100'
                          : 'bg-gradient-to-r from-emerald-950 to-teal-900 text-emerald-200'
                      }`}
                    >
                      {/* موجات صوتية */}
                      {clip.type === 'audio' && renderWaveform(clip.id)}

                      {/* مقبض التقليص الأيسر (Trim Left) */}
                      <div
                        onMouseDown={(e) => handleTrimLeftMouseDown(e, clip, track.id)}
                        className="absolute top-0 bottom-0 right-0 w-2.5 cursor-ew-resize flex items-center justify-center group z-20"
                        style={{ right: 'auto', left: 0 }}
                        title="سحب لضبط نقطة البداية"
                      >
                        <div className="w-1 h-8 bg-white/30 group-hover:bg-amber-400/80 rounded-full transition" />
                      </div>

                      {/* محتوى المقطع */}
                      <div className="flex items-center gap-1.5 truncate z-10 px-3 h-full">
                        {clip.thumbnailUrl && (
                          <img
                            src={clip.thumbnailUrl}
                            alt=""
                            className="w-7 h-7 rounded object-cover shrink-0"
                          />
                        )}
                        <span className="text-[11px] font-bold truncate">{clip.title}</span>
                      </div>

                      <span className="absolute left-2 bottom-1 text-[9px] font-mono opacity-60 z-10">
                        {clip.duration.toFixed(1)}s
                      </span>

                      {/* مقبض التقليص الأيمن (Trim Right) */}
                      <div
                        onMouseDown={(e) => handleTrimRightMouseDown(e, clip, track.id)}
                        className="absolute top-0 bottom-0 left-0 w-2.5 cursor-ew-resize flex items-center justify-center group z-20"
                        style={{ left: 'auto', right: 0 }}
                        title="سحب لضبط نقطة النهاية"
                      >
                        <div className="w-1 h-8 bg-white/30 group-hover:bg-amber-400/80 rounded-full transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* مؤشر التشغيل (Playhead) */}
          <div
            style={{ left: `${playheadPositionPx}px` }}
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none flex flex-col items-center"
          >
            <div className="w-3.5 h-3.5 bg-red-500 transform rotate-45 -mt-1.5 shadow-md shadow-red-500/50" />
          </div>
        </div>
      </div>
    </div>
  );
};
