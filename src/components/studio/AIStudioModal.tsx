'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
  Sparkles,
  X,
  Scissors,
  Languages,
  AudioWaveform,
  CheckCircle2,
  Wand2,
  Zap,
} from 'lucide-react';

export const AIStudioModal: React.FC = () => {
  const { isAIModalOpen, setAIModalOpen, splitSelectedClip, updateClip, selectedClipId } =
    useEditorStore();

  const [activeAITab, setActiveAITab] = useState<'silence' | 'captions' | 'voice'>('silence');
  const [silenceThreshold, setSilenceThreshold] = useState(-35);
  const [silencePadding, setSilencePadding] = useState(150);
  const [captionLanguage, setCaptionLanguage] = useState<'ar' | 'en' | 'auto'>('ar');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAIModalOpen) return null;

  const handleApplyAI = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (selectedClipId) {
        updateClip(selectedClipId, { isAiEnhanced: true });
      }
      alert('✨ تم تطبيق معالجة الذكاء الاصطناعي بنجاح على المقطع!');
      setAIModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* رأس النافذة */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                <span>استوديو المونتاج الذكي AutoCut AI</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  الإصدار الذكي
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                أدوات ذكية متطورة لاختصار ساعات المونتاج إلى ثوانٍ معدودة
              </p>
            </div>
          </div>
          <button
            onClick={() => setAIModalOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* أزرار التبويبات الداخلية */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-6 pt-2 gap-3">
          <button
            onClick={() => setActiveAITab('silence')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeAITab === 'silence'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>قص الصمت التلقائي</span>
          </button>

          <button
            onClick={() => setActiveAITab('captions')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeAITab === 'captions'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>الترجمة التلقائية (Captions)</span>
          </button>

          <button
            onClick={() => setActiveAITab('voice')}
            className={`pb-3 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeAITab === 'voice'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AudioWaveform className="w-4 h-4" />
            <span>تنقية وعزل الصوت</span>
          </button>
        </div>

        {/* جسم النافذة */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh]">
          {/* تبويب قص الصمت */}
          {activeAITab === 'silence' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-zinc-300 leading-relaxed">
                يقوم الخوارزم الذكي بفحص ترددات الصوت في الفيديو، وكشف فترات الصمت التي تقل عن عتبة معينة وحذفها فوراً لتسريع إيقاع الفيديو (Jump Cuts).
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* عتبة الصمت */}
                <div className="space-y-2 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">عتبة كشف الصمت (Threshold)</span>
                    <span className="text-amber-400 font-bold font-mono">{silenceThreshold} dB</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={-10}
                    value={silenceThreshold}
                    onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">
                    القيم بين -30 إلى -40 dB هي الأنسب لصوت الكلام الطبيعي.
                  </p>
                </div>

                {/* هامش الأمان */}
                <div className="space-y-2 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">هامش الأمان (Safety Padding)</span>
                    <span className="text-amber-400 font-bold font-mono">{silencePadding} ms</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={10}
                    value={silencePadding}
                    onChange={(e) => setSilencePadding(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">
                    يحمي بداية ونهاية الكلمات من البتر أثناء التقطيع.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* تبويب الترجمة التلقائية */}
          {activeAITab === 'captions' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">لغة الصوت في الفيديو</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ar', label: 'العربية (Arabic 🇸🇦)' },
                    { id: 'en', label: 'الإنجليزية (English 🇺🇸)' },
                    { id: 'auto', label: 'كشف تلقائي (Auto Detect)' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setCaptionLanguage(lang.id as any)}
                      className={`p-3 rounded-2xl text-xs font-bold border text-center transition ${
                        captionLanguage === lang.id
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold text-zinc-200">نمط الخط والأنيميشن:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-indigo-500/30 flex items-center gap-2 text-indigo-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span>تيك توك ديناميكي (MrBeast Style)</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-2 text-zinc-400 font-semibold">
                    <span>ترجمة سينمائية كلاسيكية هادئة</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تبويب عزل الصوت */}
          {activeAITab === 'voice' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs text-zinc-300 leading-relaxed">
                تقنية التعلم العميق لعزل صوت المتحدث بدقة، إزالة أصوات المراوح، صدى الغرفة، وضوضاء الشارع تلقائياً دون التأثير على جودة الصوت الطبيعية.
              </div>

              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-bold">مستوى إزالة الضوضاء الذكية</span>
                  <span className="text-emerald-400 font-bold">95% (استوديو احترافي)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={95}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <button
            onClick={() => setAIModalOpen(false)}
            className="px-4 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition"
          >
            إغلاق
          </button>

          <button
            onClick={handleApplyAI}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition active:scale-95"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isProcessing ? 'جاري التحليل والمعالجة...' : 'تطبيق المعالجة الذكية'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
