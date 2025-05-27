'use client';

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const ALLOWED_TYPES = [
  'audio/flac', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/mpga', 'audio/m4a', 'audio/ogg', 'audio/wav', 'audio/webm',
  'video/mp4', 'video/webm',
];
const MAX_SIZE_MB = 30;

const VoiceToTextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('فرمت فایل مجاز نیست.');
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از ۳۰ مگابایت باشد.');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setError(data.error || 'خطا در تبدیل گفتار به متن');
      } else {
        setResult(data.text);
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mt-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 text-right">گفتار به متن <span className="text-lg">↵</span></h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-right">متن‌ها را از فایل‌های صوتی یا ویدیویی ایجاد کنید.</p>
        <div className="flex items-center gap-2 w-full mb-2">
          <label htmlFor="file-upload" className="flex-1 cursor-pointer">
            <div className={`flex items-center border rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-colors ${file ? 'border-blue-500' : ''}`}> 
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 mr-2">
                <Upload className="w-5 h-5 text-gray-400" />
              </span>
              <span className="text-blue-700 dark:text-blue-300 font-semibold text-md">
                {file ? file.name : 'انتخاب فایل برای آپلود'}
              </span>
            </div>
            <input
              id="file-upload"
              ref={inputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div className="text-xs text-gray-400 text-left mb-4">flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm</div>
        {error && <div className="text-center text-red-500 mb-4">{error}</div>}
        <button
          className={`w-full rounded-lg py-3 font-semibold text-lg transition-colors ${file && !loading ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-300 text-white cursor-not-allowed'}`}
          disabled={!file || loading}
          onClick={handleUpload}
        >
          {loading ? 'در حال ارسال و تبدیل...' : 'ارسال فایل'}
        </button>
        {result && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-right text-gray-800 dark:text-gray-100">
            <div className="font-bold mb-2 text-blue-700 dark:text-blue-300">متن استخراج شده:</div>
            <div className="whitespace-pre-line break-words">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceToTextPage;
