'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { RESOLUTIONS, Resolution } from '@/types/editor';
import {
  Download,
  X,
  CheckCircle2,
  Cpu,
  Sparkles,
  Layers,
  HardDrive,
  Film,
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setExportModalOpen,
    resolution,
    setResolution,
    fps,
    setFps,
    projectTitle,
    duration,
  } = useEditorStore();

  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'webm' | 'prores'>('mp4');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!isExportModalOpen) return null;

  const currentRes = RESOLUTIONS[resolution];

  // حساب الحجم التقديري للفيديو
  const calculateEstimatedSizeMb = () => {
    let multiplier = 2.5; // 1080p
    if (resolution === '2k') multiplier = 5.0;
    if (resolution === '4k') multiplier = 12.0;
    if (resolution === '8k') multiplier = 38.0;
    if (fps === 60) multiplier *= 1.4;
    return Math.round(duration * multiplier);
  };

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(5);
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            setExportProgress(0);
            alert(`🎉 تم تصدير الفيديو بنجاح بدقة ${currentRes.label} (${currentRes.width}x${currentRes.height})!`);
            setExportModalOpen(false);
          }, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* رأس النافذة */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">تصدير المشروع النهائي</h3>
              <p className="text-[11px] text-zinc-400">معالجة فورية وتصدير عالي السرعة محلياً في المتصفح</p>
            </div>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* جسم النافذة */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* اختيار الدقة (Full HD, 2K, 4K, 8K) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span>اختر دقة التصدير (Resolution)</span>
              <span className="text-[10px] text-amber-400 font-normal">يدعم حتى 8K سينمائي</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(RESOLUTIONS).map((res) => {
                const isSelected = resolution === res.id;
                return (
                  <div
                    key={res.id}
                    onClick={() => setResolution(res.id as Resolution)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                      isSelected
                        ? res.id === '8k'
                          ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/10'
                          : 'bg-amber-950/30 border-amber-500 text-amber-100 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <span>{res.label}</span>
                        {res.badge && (
                          <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-amber-300">
                            {res.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">{res.width} × {res.height}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle2
                        className={`w-4 h-4 ${res.id === '8k' ? 'text-purple-400' : 'text-amber-400'}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* معدل الإطارات Framerate والصيغة Format */}
          <div className="grid grid-cols-2 gap-4">
            {/* معدل الإطارات */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">معدل الإطارات (FPS)</label>
              <div className="grid grid-cols-2 gap-2">
                {[30, 60].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      fps === f
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* صيغة الفيديو */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">صيغة الملف</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['mp4', 'webm', 'prores'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase border transition ${
                      selectedFormat === fmt
                        ? 'bg-zinc-200 text-zinc-950 border-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ملخص الحساب والحجم التقديري */}
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>الحجم التقديري:</span>
              <strong className="text-zinc-200 font-mono">~{calculateEstimatedSizeMb()} ميغابايت</strong>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>تسريع عتادي:</span>
              <strong className="text-emerald-400">WebCodecs GPU</strong>
            </div>
          </div>

          {/* شريط تقدم التصدير عند التشغيل */}
          {isExporting && (
            <div className="space-y-2 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-bold flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400 animate-spin" />
                  جاري تشفير الإطارات بدقة {currentRes.label}...
                </span>
                <span className="text-amber-400 font-mono font-bold">{exportProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${exportProgress}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <button
            onClick={() => setExportModalOpen(false)}
            disabled={isExporting}
            className="px-4 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition"
          >
            إلغاء
          </button>

          <button
            onClick={handleStartExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/25 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'جاري التصدير...' : `بدء التصدير (${resolution.toUpperCase()})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
