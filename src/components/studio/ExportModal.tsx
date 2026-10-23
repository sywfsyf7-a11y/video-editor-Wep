'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { RESOLUTIONS, Resolution } from '@/types/editor';
import { useExportEngine } from '@/hooks/useExportEngine';
import {
  Download,
  X,
  CheckCircle2,
  Cpu,
  HardDrive,
  Film,
  AlertCircle,
  ExternalLink,
  Loader2,
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
    uploadedMedia,
  } = useEditorStore();

  const { progress, startExport, cancelExport, resetExport } = useExportEngine();

  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'webm' | 'prores'>('mp4');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  if (!isExportModalOpen) return null;

  const currentRes = RESOLUTIONS[resolution];

  const estimatedSizeMb = () => {
    let m = 2.5;
    if (resolution === '2k') m = 5;
    if (resolution === '4k') m = 12;
    if (resolution === '8k') m = 38;
    if (fps === 60) m *= 1.4;
    return Math.round(duration * m);
  };

  const handleStartExport = async () => {
    setOutputUrl(null);

    const blobs = uploadedMedia.map((m) => ({ id: m.id, url: m.url, name: m.name }));

    if (blobs.length === 0) {
      // تصدير تجريبي بدون ملفات حقيقية
      alert('⚠️ يرجى رفع فيديو أولاً من تبويب الوسائط لتصدير ملف MP4 حقيقي.\n\nفي الوقت الحالي لا توجد مقاطع فيديو حقيقية في مشروعك.');
      return;
    }

    await startExport({
      resolution,
      fps,
      format: selectedFormat,
      uploadedBlobs: blobs,
      onComplete: (url) => setOutputUrl(url),
      onError: (msg) => console.error('Export error:', msg),
    });
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `${projectTitle.replace(/\s+/g, '_')}_${resolution}_${fps}fps.${selectedFormat}`;
    a.click();
  };

  const handleClose = () => {
    if (progress.status === 'processing') {
      if (confirm('هل تريد إلغاء عملية التصدير الجارية؟')) {
        cancelExport();
      } else return;
    }
    resetExport();
    setOutputUrl(null);
    setExportModalOpen(false);
  };

  const isExporting = progress.status === 'loading-ffmpeg' || progress.status === 'processing';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

        {/* رأس النافذة */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">تصدير المشروع النهائي</h3>
              <p className="text-[11px] text-zinc-400">معالجة سريعة محلياً عبر FFmpeg.wasm · بدون رفع لسيرفرات</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">

          {/* ملفات المشروع المرفوعة */}
          <div className="p-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-zinc-300">مقاطع الفيديو في المشروع:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full ${uploadedMedia.filter(m => m.type === 'video').length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {uploadedMedia.filter(m => m.type === 'video').length} مقطع فيديو حقيقي
              </span>
            </div>
            {uploadedMedia.length === 0 && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                لم يتم رفع أي فيديو. ادخل تبويب الوسائط وارفع مقاطعك أولاً.
              </p>
            )}
          </div>

          {/* اختيار الدقة */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span>دقة التصدير</span>
              <span className="text-[10px] text-amber-400 font-normal">حتى 8K سينمائي</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(RESOLUTIONS).map((res) => {
                const isSelected = resolution === res.id;
                return (
                  <button
                    key={res.id}
                    disabled={isExporting}
                    onClick={() => setResolution(res.id as Resolution)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between disabled:opacity-50 ${
                      isSelected
                        ? res.id === '8k'
                          ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10'
                          : 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-black flex items-center gap-1.5 ${isSelected ? (res.id === '8k' ? 'text-purple-200' : 'text-amber-100') : 'text-zinc-300'}`}>
                        {res.label}
                        {res.badge && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-extrabold text-amber-300">{res.badge}</span>}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{res.width} × {res.height}</div>
                    </div>
                    {isSelected && <CheckCircle2 className={`w-4 h-4 mt-0.5 ${res.id === '8k' ? 'text-purple-400' : 'text-amber-400'}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FPS + Format */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">معدل الإطارات</label>
              <div className="grid grid-cols-2 gap-2">
                {[30, 60].map((f) => (
                  <button key={f} disabled={isExporting} onClick={() => setFps(f)}
                    className={`py-2 rounded-xl text-xs font-bold border transition disabled:opacity-50 ${fps === f ? 'bg-amber-500 text-zinc-950 border-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}>
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">صيغة الملف</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['mp4', 'webm', 'prores'] as const).map((fmt) => (
                  <button key={fmt} disabled={isExporting} onClick={() => setSelectedFormat(fmt)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase border transition disabled:opacity-50 ${selectedFormat === fmt ? 'bg-zinc-200 text-zinc-950 border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}>
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* الحجم التقديري */}
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>الحجم التقديري:</span>
              <strong className="text-zinc-200 font-mono">~{estimatedSizeMb()} MB</strong>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>معالجة:</span>
              <strong className="text-emerald-400">FFmpeg.wasm · GPU</strong>
            </div>
          </div>

          {/* شريط التقدم */}
          {progress.status !== 'idle' && (
            <div className="space-y-2 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className={`font-bold flex items-center gap-2 ${progress.status === 'error' ? 'text-red-400' : progress.status === 'done' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {progress.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {progress.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                  {progress.message}
                </span>
                <span className="font-mono font-bold text-amber-400">{progress.percent}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress.percent}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${progress.status === 'done' ? 'bg-emerald-500' : progress.status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                />
              </div>

              {/* زر التحميل بعد الانتهاء */}
              {progress.status === 'done' && outputUrl && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الفيديو ({resolution.toUpperCase()} · {fps} FPS)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* الأزرار */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <button
            onClick={handleClose}
            className="px-4 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition"
          >
            {isExporting ? 'إلغاء التصدير' : 'إغلاق'}
          </button>

          {progress.status !== 'done' && (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              {isExporting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التصدير...</>
                : <><Film className="w-4 h-4" /> بدء التصدير ({resolution.toUpperCase()})</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
