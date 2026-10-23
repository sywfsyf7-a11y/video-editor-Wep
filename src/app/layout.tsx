import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoCut Studio AI - استوديو المونتاج السحابي الاحترافي',
  description: 'محرر فيديو احترافي متكامل عبر الويب يدعم دقات 1080p, 2K, 4K, 8K وميزات الذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full bg-zinc-950 text-zinc-100 dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full flex flex-col font-['Cairo',sans-serif] overflow-hidden antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
