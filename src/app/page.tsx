'use client';

import React from 'react';
import { Header } from '@/components/studio/Header';
import { Sidebar } from '@/components/studio/Sidebar';
import { PreviewPlayer } from '@/components/studio/PreviewPlayer';
import { Inspector } from '@/components/studio/Inspector';
import { Timeline } from '@/components/studio/Timeline';
import { ExportModal } from '@/components/studio/ExportModal';
import { AIStudioModal } from '@/components/studio/AIStudioModal';

export default function StudioPage() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 select-none">
      {/* 1. الشريط العلوي */}
      <Header />

      {/* 2. منطقة العمل الرئيسية (الشريط الجانبي + مشغل المعاينة + لوحة الخصائص) */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 min-w-0 w-full relative">
        {/* شريط الأدوات والوسائط الجانبي */}
        <Sidebar />

        {/* شاشة المعاينة المركزية مع إمكانية عرض الدقات 1080p, 2K, 4K, 8K */}
        <PreviewPlayer />

        {/* لوحة التحكم بالخصائص والتعديل على المقطع المحدد */}
        <Inspector />
      </div>

      {/* 3. الخط الزمني متعدد التراكات (Multi-Track Timeline) */}
      <Timeline />

      {/* 4. النوافذ المنبثقة: التصدير واستوديو الذكاء الاصطناعي */}
      <ExportModal />
      <AIStudioModal />
    </div>
  );
}
