'use client';

import { useState, useCallback, useRef } from 'react';

export type ExportStatus = 'idle' | 'loading-ffmpeg' | 'processing' | 'done' | 'error';

export interface ExportProgress {
  status: ExportStatus;
  percent: number;
  message: string;
  outputUrl?: string;
  error?: string;
}

/**
 * هوك التصدير الحقيقي باستخدام FFmpeg.wasm
 * يعالج الفيديوهات المرفوعة محلياً داخل المتصفح بدون أي سيرفر خارجي
 */
export function useExportEngine() {
  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    percent: 0,
    message: '',
  });
  const ffmpegRef = useRef<any>(null);
  const abortRef = useRef(false);

  const resetExport = useCallback(() => {
    abortRef.current = false;
    setProgress({ status: 'idle', percent: 0, message: '' });
  }, []);

  /**
   * تصدير المشروع الحالي إلى ملف MP4
   * يدعم الدقات: 1080p, 2K, 4K, 8K مع الترميز عبر WebAssembly
   */
  const startExport = useCallback(async (options: {
    resolution: string;
    fps: number;
    format: 'mp4' | 'webm' | 'prores';
    uploadedBlobs: { id: string; url: string; name: string }[];
    onComplete: (url: string) => void;
    onError: (msg: string) => void;
  }) => {
    abortRef.current = false;

    try {
      // الخطوة 1: تحميل مكتبة FFmpeg
      setProgress({ status: 'loading-ffmpeg', percent: 5, message: 'تحميل محرك المعالجة (FFmpeg.wasm)...' });

      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      if (abortRef.current) return;

      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on('progress', ({ progress: p }: { progress: number }) => {
        setProgress({
          status: 'processing',
          percent: Math.round(20 + p * 75),
          message: `جاري ترميز الفيديو بدقة ${options.resolution.toUpperCase()}... ${Math.round(p * 100)}%`,
        });
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      if (abortRef.current) return;

      setProgress({ status: 'processing', percent: 20, message: 'تحليل المقاطع وإعداد ملفات الإدخال...' });

      // الخطوة 2: تحميل ملفات الفيديو إلى نظام ملفات FFmpeg الافتراضي
      const inputFiles: string[] = [];

      for (let i = 0; i < options.uploadedBlobs.length; i++) {
        const blob = options.uploadedBlobs[i];
        const fileName = `input_${i}.mp4`;

        setProgress({
          status: 'processing',
          percent: 20 + Math.round((i / options.uploadedBlobs.length) * 15),
          message: `تحميل الملف ${i + 1}/${options.uploadedBlobs.length}: ${blob.name}`,
        });

        let fileData;
        try {
          fileData = await fetchFile(blob.url);
        } catch (fetchErr) {
          console.warn(`CORS or network error fetching ${blob.url}, attempting fallback fetch via proxy/mode...`, fetchErr);
          const response = await fetch(blob.url, { mode: 'cors' });
          if (!response.ok) throw new Error(`فشل تحميل الملف ${blob.name} بسبب قيود الأمان (CORS). يرجى رفع الملف محلياً.`);
          const blobData = await response.blob();
          fileData = await fetchFile(blobData);
        }
        await ffmpeg.writeFile(fileName, fileData);
        inputFiles.push(fileName);
      }

      if (abortRef.current) return;
      if (inputFiles.length === 0) {
        throw new Error('لا توجد ملفات فيديو للتصدير. يرجى رفع فيديو أولاً.');
      }

      setProgress({ status: 'processing', percent: 35, message: 'بناء سلسلة الترميز...' });

      // حساب الدقة المستهدفة
      const resMap: Record<string, [number, number]> = {
        '1080p': [1920, 1080],
        '2k': [2560, 1440],
        '4k': [3840, 2160],
        '8k': [7680, 4320],
      };
      const [targetW, targetH] = resMap[options.resolution] || [1920, 1080];

      // الخطوة 3: بناء قائمة الملفات للدمج
      let concatContent = '';
      inputFiles.forEach((f) => {
        concatContent += `file '${f}'\n`;
      });
      await ffmpeg.writeFile('concat.txt', concatContent);

      setProgress({ status: 'processing', percent: 40, message: 'بدء عملية الترميز...' });

      const outputFile = `output.${options.format === 'webm' ? 'webm' : 'mp4'}`;
      const codec = options.format === 'webm' ? 'libvpx-vp9' : 'libx264';
      const pixFmt = options.format === 'webm' ? 'yuv420p' : 'yuv420p';

      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-vf', `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2`,
        '-c:v', codec,
        '-r', String(options.fps),
        '-pix_fmt', pixFmt,
        '-preset', 'ultrafast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        outputFile,
      ]);

      if (abortRef.current) return;

      setProgress({ status: 'processing', percent: 95, message: 'إعداد الملف النهائي للتحميل...' });

      // الخطوة 4: قراءة الملف الناتج وإنشاء رابط تحميل
      const outputData = await ffmpeg.readFile(outputFile);
      const mimeType = options.format === 'webm' ? 'video/webm' : 'video/mp4';
      // Cast through unknown to handle Uint8Array<SharedArrayBuffer> vs BlobPart incompatibility
      const blob = new Blob([outputData as unknown as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setProgress({
        status: 'done',
        percent: 100,
        message: 'اكتمل التصدير! الفيديو جاهز للتحميل.',
        outputUrl: url,
      });

      options.onComplete(url);

    } catch (err: any) {
      if (!abortRef.current) {
        const errMsg = err?.message || 'حدث خطأ غير متوقع أثناء التصدير.';
        setProgress({
          status: 'error',
          percent: 0,
          message: errMsg,
          error: errMsg,
        });
        options.onError(errMsg);
      }
    }
  }, []);

  const cancelExport = useCallback(() => {
    abortRef.current = true;
    if (ffmpegRef.current) {
      try { ffmpegRef.current.terminate(); } catch {}
    }
    setProgress({ status: 'idle', percent: 0, message: 'تم إلغاء التصدير.' });
  }, []);

  return { progress, startExport, cancelExport, resetExport };
}
