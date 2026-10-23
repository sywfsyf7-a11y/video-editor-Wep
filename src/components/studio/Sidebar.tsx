'use client';

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { SidebarTab } from '@/types/editor';
import {
  FolderOpen,
  Type,
  Music,
  Sparkles,
  Sliders,
  Layers,
  UploadCloud,
  Film,
  Mic,
  Volume2,
  Wand2,
  Scissors,
  CheckCircle2,
  Languages,
  AudioWaveform,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeSidebarTab, setActiveSidebarTab, addClipToTrack, setAIModalOpen } =
    useEditorStore();

  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'ai', label: 'أدوات AI', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'media', label: 'الوسائط', icon: <FolderOpen className="w-5 h-5" /> },
    { id: 'text', label: 'النصوص', icon: <Type className="w-5 h-5" /> },
    { id: 'audio', label: 'الصوتيات', icon: <Music className="w-5 h-5" /> },
    { id: 'transitions', label: 'الانتقالات', icon: <Layers className="w-5 h-5" /> },
    { id: 'effects', label: 'الفلاتر', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-80 md:w-96 shrink-0 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full select-none z-20">
      {/* شريط التبويبات العلوي */}
      <div className="flex items-center border-b border-zinc-800 bg-zinc-900/40 p-1.5 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeSidebarTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSidebarTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition ${
                isActive
                  ? tab.id === 'ai'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-zinc-800 text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* محتوى التبويب المختار */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* ================= تبويب الـ AI ================= */}
        {activeSidebarTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-purple-400">
                <Wand2 className="w-4 h-4" />
                <h3 className="text-xs font-black">حزمة المونتاج الذكي AutoCut AI</h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                أدوات معالجة متقدمة بالذكاء الاصطناعي لقص الفيديوهات، توليد الترجمات، وتحسين الصوت تلقائياً.
              </p>
            </div>

            {/* ميزة قص الصمت التلقائي */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 hover:border-amber-500/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">قص الصمت التلقائي (Auto Silence)</h4>
                    <p className="text-[10px] text-zinc-400">حذف فترات السكوت والتوقفات فورياً</p>
                  </div>
                </div>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  سريع
                </span>
              </div>
              <button
                onClick={() => setAIModalOpen(true)}
                className="w-full py-2 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>ضبط وتطبيق قص الصمت</span>
              </button>
            </div>

            {/* ميزة الترجمة التلقائية بالذكاء الاصطناعي */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 hover:border-indigo-500/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">الترجمة التلقائية (Auto Captions)</h4>
                    <p className="text-[10px] text-zinc-400">توليد نصوص متحركة باللغتين العربية والإنجليزية</p>
                  </div>
                </div>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  دقيق
                </span>
              </div>
              <button
                onClick={() => setAIModalOpen(true)}
                className="w-full py-2 bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>توليد الترجمة التلقائية</span>
              </button>
            </div>

            {/* تنقية الصوت وعزل الضوضاء */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3 hover:border-emerald-500/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <AudioWaveform className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">عزل الضوضاء ورفع الصوت (Voice Clean)</h4>
                    <p className="text-[10px] text-zinc-400">تنقية صوت المايك بدقة الاستوديو</p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Studio HD
                </span>
              </div>
              <button
                onClick={() => setAIModalOpen(true)}
                className="w-full py-2 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>تطبيق عزل الصوت</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= تبويب الوسائط ================= */}
        {activeSidebarTab === 'media' && (
          <div className="space-y-4">
            {/* منطقة الرفع */}
            <div className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-2xl p-6 text-center bg-zinc-900/30 transition cursor-pointer group">
              <UploadCloud className="w-10 h-10 text-zinc-500 group-hover:text-amber-400 mx-auto mb-2 transition" />
              <h4 className="text-xs font-bold text-zinc-200 mb-1">اسحب ملفات الفيديو والصوت هنا</h4>
              <p className="text-[10px] text-zinc-500 mb-3">
                يدعم MP4, MOV, WebM, MP3, WAV (حتى دقة 8K)
              </p>
              <button className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition">
                تصفح من جهازك
              </button>
            </div>

            {/* مكتبة المقاطع الحالية */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 mb-2">مقاطع المشروع</h4>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() =>
                    addClipToTrack('track-video-1', {
                      trackId: 'track-video-1',
                      title: 'لقطة إضافية سينمائية',
                      type: 'video',
                      startTime: 17.5,
                      duration: 6.0,
                      thumbnailUrl:
                        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200',
                      volume: 100,
                      speed: 1,
                      opacity: 100,
                    })
                  }
                  className="relative group bg-zinc-900 border border-zinc-800 hover:border-amber-500 rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200"
                    alt="مقطع"
                    className="w-full h-20 object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-mono px-1 rounded text-zinc-200">
                    00:06
                  </span>
                  <div className="p-1.5 text-[10px] font-semibold text-zinc-300 truncate">
                    لقطة طبيعة 4K
                  </div>
                </div>

                <div
                  onClick={() =>
                    addClipToTrack('track-video-1', {
                      trackId: 'track-video-1',
                      title: 'مشهد حضري ليلي',
                      type: 'video',
                      startTime: 23.5,
                      duration: 5.0,
                      thumbnailUrl:
                        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200',
                      volume: 100,
                      speed: 1,
                      opacity: 100,
                    })
                  }
                  className="relative group bg-zinc-900 border border-zinc-800 hover:border-amber-500 rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200"
                    alt="مقطع"
                    className="w-full h-20 object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] font-mono px-1 rounded text-zinc-200">
                    00:05
                  </span>
                  <div className="p-1.5 text-[10px] font-semibold text-zinc-300 truncate">
                    مشهد ليلي 8K
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= تبويب النصوص ================= */}
        {activeSidebarTab === 'text' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400">قوالب نصوص عربية جاهزة</h4>
            
            <button
              onClick={() =>
                addClipToTrack('track-text-1', {
                  trackId: 'track-text-1',
                  title: 'عنوان سينمائي عريض',
                  type: 'text',
                  startTime: 5.0,
                  duration: 4.0,
                  textContent: 'عنوان جذاب وجريء',
                  fontSize: 48,
                  fontFamily: 'Cairo',
                  textColor: '#ffffff',
                  opacity: 100,
                  volume: 0,
                  speed: 1,
                })
              }
              className="w-full p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-right transition"
            >
              <div className="text-lg font-black text-amber-400 font-sans">عنوان رئيسي ضخم</div>
              <div className="text-[10px] text-zinc-400">مناسب للمقدمات واليوتيوب (Cairo Black)</div>
            </button>

            <button
              onClick={() =>
                addClipToTrack('track-text-1', {
                  trackId: 'track-text-1',
                  title: 'شريط سفلي Lower Third',
                  type: 'text',
                  startTime: 10.0,
                  duration: 5.0,
                  textContent: 'م. سيف - خبير الذكاء الاصطناعي',
                  fontSize: 24,
                  fontFamily: 'Cairo',
                  textColor: '#fef08a',
                  opacity: 100,
                  volume: 0,
                  speed: 1,
                })
              }
              className="w-full p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/50 rounded-xl text-right transition"
            >
              <div className="text-sm font-bold text-indigo-300">شريط تعريفي (Lower Third)</div>
              <div className="text-[10px] text-zinc-400">لأسماء المتحدثين والمقابلات</div>
            </button>
          </div>
        )}

        {/* ================= تبويب الصوتيات ================= */}
        {activeSidebarTab === 'audio' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400">مكتبة الموسيقى والمؤثرات المجانية</h4>
            <div className="space-y-2">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">Cinematic Trailer Beats</h5>
                  <p className="text-[10px] text-zinc-500">حماسي · 02:15</p>
                </div>
                <button
                  onClick={() =>
                    addClipToTrack('track-audio-1', {
                      trackId: 'track-audio-1',
                      title: 'Cinematic Trailer Beats',
                      type: 'audio',
                      startTime: 5.0,
                      duration: 15.0,
                      volume: 80,
                      speed: 1,
                      opacity: 100,
                    })
                  }
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold rounded-lg transition"
                >
                  إضافة +
                </button>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">Whoosh Transition SFX</h5>
                  <p className="text-[10px] text-zinc-500">مؤثر انتقال سريع · 00:02</p>
                </div>
                <button
                  onClick={() =>
                    addClipToTrack('track-audio-1', {
                      trackId: 'track-audio-1',
                      title: 'Whoosh SFX',
                      type: 'audio',
                      startTime: 8.5,
                      duration: 2.0,
                      volume: 90,
                      speed: 1,
                      opacity: 100,
                    })
                  }
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold rounded-lg transition"
                >
                  إضافة +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= تبويب الانتقالات ================= */}
        {activeSidebarTab === 'transitions' && (
          <div className="grid grid-cols-2 gap-2">
            {['Cross Dissolve (تلاشي)', 'Zoom In (تقريب)', 'Slide Left (سحب)', 'Glitch (تشويش)'].map(
              (trans, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-center cursor-pointer transition"
                >
                  <Layers className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                  <span className="text-[11px] font-bold text-zinc-300">{trans}</span>
                </div>
              )
            )}
          </div>
        )}

        {/* ================= تبويب الفلاتر ================= */}
        {activeSidebarTab === 'effects' && (
          <div className="grid grid-cols-2 gap-2">
            {['سينمائي دافئ (Warm Cinema)', 'سايبر بانك (Cyberpunk)', 'أبيض وأسود (Classic B&W)', 'درامي بارد (Cold Drama)'].map(
              (eff, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-center cursor-pointer transition"
                >
                  <Sliders className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                  <span className="text-[11px] font-bold text-zinc-300">{eff}</span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
