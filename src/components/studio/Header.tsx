'use client';

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { RESOLUTIONS, ASPECT_RATIOS, Resolution, AspectRatio } from '@/types/editor';
import {
  Scissors,
  Sparkles,
  Download,
  Ratio,
  MonitorPlay,
  RotateCcw,
  RotateCw,
  FolderOpen,
  Settings,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    projectTitle,
    setProjectTitle,
    resolution,
    setResolution,
    aspectRatio,
    setAspectRatio,
    setExportModalOpen,
    setAIModalOpen,
  } = useEditorStore();

  const currentRes = RESOLUTIONS[resolution];

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur px-4 flex items-center justify-between select-none z-30">
      {/* القسم الأيمن: الشعار واسم المشروع */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 text-white font-bold">
          <Scissors className="w-5 h-5" />
          <span className="text-sm font-black tracking-wider">AUTOCUT</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-200">
            PRO AI
          </span>
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-1 hidden sm:block" />

        {/* حقل اسم المشروع */}
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="bg-transparent hover:bg-zinc-900 focus:bg-zinc-900 border border-transparent focus:border-zinc-700 px-2.5 py-1 rounded-lg text-sm font-medium text-zinc-200 focus:outline-none transition w-44 md:w-56 truncate"
          title="انقر لتعديل اسم المشروع"
        />

        {/* أزرار التراجع والإعادة */}
        <div className="flex items-center gap-0.5 text-zinc-400">
          <button
            className="p-1.5 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition"
            title="تراجع (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition"
            title="إعادة (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* القسم الأوسط: خيارات الدقة ونسبة العرض (Aspect Ratio) */}
      <div className="hidden lg:flex items-center gap-2">
        {/* قائمة الأبعاد */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl text-xs">
          <Ratio className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            aria-label="نسبة أبعاد الشاشة"
            className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer"
          >
            {Object.values(ASPECT_RATIOS).map((ratio) => (
              <option key={ratio.id} value={ratio.id} className="bg-zinc-900 text-zinc-200">
                {ratio.label} ({ratio.desc})
              </option>
            ))}
          </select>
        </div>

        {/* قائمة الدقات: Full HD, 2K, 4K, 8K */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl text-xs">
          <MonitorPlay className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            aria-label="دقة الفيديو"
            className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
          >
            {Object.values(RESOLUTIONS).map((res) => (
              <option key={res.id} value={res.id} className="bg-zinc-900 text-zinc-200">
                {res.label} — {res.name}
              </option>
            ))}
          </select>
          {currentRes.badge && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                resolution === '8k'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : resolution === '4k'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              {currentRes.badge}
            </span>
          )}
        </div>
      </div>

      {/* القسم الأيسر: زر الذكاء الاصطناعي وزر التصدير */}
      <div className="flex items-center gap-2.5">
        {/* زر أدوات الذكاء الاصطناعي AI */}
        <button
          onClick={() => setAIModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>استوديو AI</span>
        </button>

        {/* زر التصدير Export */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-4 py-1.5 rounded-xl text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>تصدير ({resolution.toUpperCase()})</span>
        </button>
      </div>
    </header>
  );
};
