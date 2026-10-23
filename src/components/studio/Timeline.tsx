'use client';

import React, { useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
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
    toggleMuteTrack,
    toggleLockTrack,
  } = useEditorStore();

  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // حساب موضع مؤشر الوقت (Playhead) بالبكسل
  const playheadPositionPx = currentTime * zoom;
  const totalTimelineWidthPx = Math.max(duration * zoom, 1200);

  // النقر على مسطرة الوقت لتحريك المؤشر
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const newTime = Math.max(0, Math.min(clickX / zoom, duration));
    setCurrentTime(newTime);
  };

  // توليد علامات الثواني للمسطرة
  const renderTimeRuler = () => {
    const marks = [];
    const step = zoom < 25 ? 5 : zoom < 50 ? 2 : 1; // خطوة العلامات حسب الزووم
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

  return (
    <div className="h-72 shrink-0 w-full border-t border-zinc-800 bg-zinc-950 flex flex-col select-none z-20">
      {/* شريط أدوات التايم لاين العلوي */}
      <div className="h-11 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-zinc-900/50">
        {/* أزرار العمليات: قص، حذف، مغناطيس */}
        <div className="flex items-center gap-1">
          <button
            onClick={splitSelectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 rounded-lg text-xs font-bold transition"
            title="تقسيم المقطع عند المؤشر (S)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>تقسيم (Split)</span>
          </button>

          <button
            onClick={deleteSelectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-red-500 hover:text-white text-zinc-300 rounded-lg text-xs font-bold transition"
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

        {/* التحكم بمستوى تكبير وتصغير التايم لاين Zoom */}
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

      {/* مساحة التراكات ومسار المؤشر */}
      <div className="flex-1 flex overflow-hidden">
        {/* أسماء التراكات والأقفال الجانبية (Track Headers) */}
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
                  <button
                    onClick={() => toggleMuteTrack(track.id)}
                    className="p-1 hover:text-zinc-200"
                  >
                    {track.isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleLockTrack(track.id)}
                    className="p-1 hover:text-zinc-200"
                  >
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

        {/* مساحة الخط الزمني القابلة للسحب (Scrollable Timeline Canvas) */}
        <div
          ref={timelineContainerRef}
          onClick={handleTimelineClick}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-zinc-950/70 cursor-pointer"
        >
          {/* مسطرة الثواني */}
          <div
            style={{ width: `${totalTimelineWidthPx}px` }}
            className="h-7 border-b border-zinc-800 bg-zinc-900/40 relative"
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

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectClip(clip.id);
                      }}
                      style={{
                        left: `${clipLeftPx}px`,
                        width: `${clipWidthPx}px`,
                      }}
                      className={`absolute top-1 bottom-1 rounded-xl px-2.5 flex items-center justify-between overflow-hidden cursor-pointer transition border ${
                        isSelected
                          ? 'ring-2 ring-amber-400 border-amber-300 shadow-lg shadow-amber-500/20 z-10'
                          : 'border-zinc-700/60 hover:border-zinc-500'
                      } ${
                        clip.type === 'video'
                          ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 text-blue-100'
                          : clip.type === 'text'
                          ? 'bg-gradient-to-r from-amber-900/80 to-orange-900/80 text-amber-100'
                          : 'bg-gradient-to-r from-emerald-950 to-teal-900 text-emerald-200'
                      }`}
                    >
                      {/* محتوى المقطع */}
                      <div className="flex items-center gap-1.5 truncate">
                        {clip.thumbnailUrl && (
                          <img
                            src={clip.thumbnailUrl}
                            alt=""
                            className="w-7 h-7 rounded object-cover shrink-0"
                          />
                        )}
                        <span className="text-[11px] font-bold truncate">{clip.title}</span>
                      </div>

                      <span className="text-[9px] font-mono opacity-60 shrink-0">
                        {clip.duration.toFixed(1)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* مؤشر التشغيل الأحمر التفاعلي (Playhead Scrubber) */}
          <div
            style={{ left: `${playheadPositionPx}px` }}
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none flex flex-col items-center"
          >
            {/* رأس المؤشر المقلوب */}
            <div className="w-3.5 h-3.5 bg-red-500 transform rotate-45 -mt-1.5 shadow-md shadow-red-500/50" />
          </div>
        </div>
      </div>
    </div>
  );
};
