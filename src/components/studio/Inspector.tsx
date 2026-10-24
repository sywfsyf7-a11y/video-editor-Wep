'use client';

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
  Sliders,
  Volume2,
  Gauge,
  Eye,
  Type,
  Sparkles,
  Trash2,
  Scissors,
  Sun,
  Contrast,
  Droplets,
  Palette,
} from 'lucide-react';

// مساعد لعرض شريط التمرير مع قيمته
function GradeSlider({
  label,
  icon,
  value,
  min,
  max,
  defaultVal,
  unit,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  defaultVal: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const isDefault = value === defaultVal;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-bold ${isDefault ? 'text-zinc-500' : 'text-amber-400'}`}>
            {value}{unit}
          </span>
          {!isDefault && (
            <button
              onClick={() => onChange(defaultVal)}
              className="text-[9px] text-zinc-500 hover:text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded font-bold transition"
            >
              إعادة ضبط
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-500 cursor-pointer"
      />
    </div>
  );
}

export const Inspector: React.FC = () => {
  const { tracks, selectedClipId, updateClip, deleteSelectedClip, splitSelectedClip } =
    useEditorStore();

  const selectedClip = tracks
    .flatMap((t) => t.clips)
    .find((c) => c.id === selectedClipId);

  if (!selectedClip) {
    return (
      <aside className="w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col items-center justify-center text-center select-none text-zinc-500">
        <Sliders className="w-8 h-8 mb-2 opacity-40" />
        <h4 className="text-xs font-bold text-zinc-400">لا يوجد مقطع محدد</h4>
        <p className="text-[11px] text-zinc-600 mt-1 max-w-[180px]">
          انقر على أي مقطع في شريط التايم لاين لتعديل خصائصه وسرعته ومؤثراته.
        </p>
      </aside>
    );
  }

  // قيم ضبط الألوان مع الافتراضيات
  const brightness = selectedClip.brightness ?? 100;
  const contrast = selectedClip.contrast ?? 100;
  const saturation = selectedClip.saturation ?? 100;
  const hue = selectedClip.hue ?? 0;

  const hasColorGrading =
    brightness !== 100 || contrast !== 100 || saturation !== 100 || hue !== 0;

  const resetColorGrading = () => {
    updateClip(selectedClip.id, { brightness: 100, contrast: 100, saturation: 100, hue: 0 });
  };

  return (
    <aside className="w-72 md:w-80 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col h-full overflow-y-auto select-none space-y-5">
      {/* رأس اللوحة */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-500">
            {selectedClip.type === 'video'
              ? 'خصائص الفيديو'
              : selectedClip.type === 'text'
              ? 'خصائص النص'
              : 'خصائص الصوت'}
          </span>
          <h3 className="text-xs font-bold text-zinc-200 truncate max-w-[170px]">
            {selectedClip.title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={splitSelectedClip}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 rounded-lg transition"
            title="قص وتقسيم عند المؤشر (S)"
          >
            <Scissors className="w-4 h-4" />
          </button>
          <button
            onClick={deleteSelectedClip}
            className="p-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg transition"
            title="حذف المقطع (Delete)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* محرر النص */}
      {selectedClip.type === 'text' && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            محتوى النص
          </label>
          <textarea
            value={selectedClip.textContent || ''}
            onChange={(e) => updateClip(selectedClip.id, { textContent: e.target.value })}
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none transition resize-none"
          />

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">حجم الخط</span>
              <span className="text-amber-400 font-mono font-bold">{selectedClip.fontSize || 32}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={96}
              value={selectedClip.fontSize || 32}
              onChange={(e) => updateClip(selectedClip.id, { fontSize: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* السرعة */}
      <div className="space-y-2 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-zinc-400" /> سرعة العرض
          </span>
          <span className="text-amber-400 font-mono font-bold">{selectedClip.speed}x</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[0.5, 1, 1.5, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => updateClip(selectedClip.id, { speed: spd })}
              className={`py-1 rounded-lg text-[10px] font-bold transition ${
                selectedClip.speed === spd
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* الصوت */}
      <div className="space-y-2 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" /> مستوى الصوت
          </span>
          <span className="text-zinc-200 font-mono font-bold">{selectedClip.volume}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={selectedClip.volume}
          onChange={(e) => updateClip(selectedClip.id, { volume: Number(e.target.value) })}
          className="w-full accent-amber-500 cursor-pointer"
        />
      </div>

      {/* الشفافية */}
      <div className="space-y-2 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" /> الشفافية
          </span>
          <span className="text-zinc-200 font-mono font-bold">{selectedClip.opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={selectedClip.opacity}
          onChange={(e) => updateClip(selectedClip.id, { opacity: Number(e.target.value) })}
          className="w-full accent-amber-500 cursor-pointer"
        />
      </div>

      {/* ==================== ضبط الألوان (Color Grading) ==================== */}
      {(selectedClip.type === 'video' || selectedClip.type === 'text') && (
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              ضبط الألوان (Color Grading)
            </span>
            {hasColorGrading && (
              <button
                onClick={resetColorGrading}
                className="text-[10px] text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-red-500/10 px-2 py-0.5 rounded-lg font-bold transition"
              >
                إعادة ضبط الكل
              </button>
            )}
          </div>

          <GradeSlider
            label="السطوع"
            icon={<Sun className="w-3.5 h-3.5 text-yellow-400" />}
            value={brightness}
            min={50}
            max={150}
            defaultVal={100}
            unit="%"
            onChange={(v) => updateClip(selectedClip.id, { brightness: v })}
          />

          <GradeSlider
            label="التباين"
            icon={<Contrast className="w-3.5 h-3.5 text-zinc-300" />}
            value={contrast}
            min={50}
            max={150}
            defaultVal={100}
            unit="%"
            onChange={(v) => updateClip(selectedClip.id, { contrast: v })}
          />

          <GradeSlider
            label="التشبع"
            icon={<Droplets className="w-3.5 h-3.5 text-blue-400" />}
            value={saturation}
            min={0}
            max={200}
            defaultVal={100}
            unit="%"
            onChange={(v) => updateClip(selectedClip.id, { saturation: v })}
          />

          <GradeSlider
            label="درجة اللون (Hue)"
            icon={<Palette className="w-3.5 h-3.5 text-purple-400" />}
            value={hue}
            min={-180}
            max={180}
            defaultVal={0}
            unit="°"
            onChange={(v) => updateClip(selectedClip.id, { hue: v })}
          />

          {/* معاينة مدمجة للفلتر */}
          {hasColorGrading && (
            <div className="mt-1 p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-400">
              <span className="font-mono text-[9px] text-amber-400/80 font-bold truncate">
                filter: brightness({brightness}%) contrast({contrast}%) saturate({saturation}%) hue-rotate({hue}deg)
              </span>
            </div>
          )}
        </div>
      )}

      {/* AI Enhancement */}
      <div className="p-3 bg-gradient-to-br from-purple-950/30 to-zinc-900 border border-purple-500/20 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> معالجة بالذكاء الاصطناعي
          </span>
          <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
            نشط
          </span>
        </div>
        <p className="text-[10px] text-zinc-400">
          تم تمكين عزل الصوت الذكي وتحسين الدقة إلى 4K/8K تلقائياً لهذا المقطع.
        </p>
      </div>
    </aside>
  );
};
