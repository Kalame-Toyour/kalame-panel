'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import fetchWithAuth from '../../components/utils/fetchWithAuth';

interface MediaItem {
  ID: number;
  user_id: number;
  message_id: string;
  message_type: string;
  media_url: string;
  insert_time: string;
}

const IMAGE_SIZES = [
  { label: 'مربع (1:1)', value: '1:1', size: 1 },
  { label: 'عمودی (4:5)', value: '4:5', size: 2 },
  { label: 'افقی (16:9)', value: '16:9', size: 3 },
];

const MODELS = [
  { label: 'تولید تصویر با ChatGPT 4o', value: 'gpt4o', note: '' }
];

const ImageGenerationPage = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState(IMAGE_SIZES[0]?.value || '1:1');
  const [model, setModel] = useState(MODELS[0]?.value || 'gpt4o');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userImages, setUserImages] = useState<MediaItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    fetchUserImages();
  }, []);

  const fetchUserImages = async () => {
    try {
      const res = await fetchWithAuth('/api/media');
      const data = await res.json();
      if (data.media) {
        setUserImages(data.media);
      }
    } catch (err) {
      console.error('Error fetching user images:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const selectedSize = IMAGE_SIZES.find(s => s.value === size)?.size || 1;
      console.log('Sending request with size:', selectedSize);
      
      const requestBody = {
        chatId: '-1',
        prompt,
        modelType: 'midjourney',
        subModel: 'midjourney_2',
        imageSize: selectedSize
      };
      console.log('Request body:', requestBody);

      const res = await fetchWithAuth('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (data.success && data.imageUrl) {
        setResult(data.imageUrl);
        // Refresh user images after generating a new one
        fetchUserImages();
      } else {
        console.error('API returned error:', data);
        setError(data.error || 'خطا در دریافت تصویر.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4" dir="rtl">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 mt-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-right">ساخت تصویر</h1>
        <div className="mb-4">
          <textarea
            className="w-full h-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-right text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="ایده‌های خود را برای خلق تصویر بنویسید..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">سایز تصویر</label>
            <select
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 text-right text-gray-800 dark:text-gray-100 focus:outline-none"
              value={size}
              onChange={e => setSize(e.target.value)}
            >
              {IMAGE_SIZES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">انتخاب مدل تصویر</label>
            <select
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 text-right text-gray-800 dark:text-gray-100 focus:outline-none"
              value={model}
              onChange={e => setModel(e.target.value)}
            >
              {MODELS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} {opt.note}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-lg mt-2 transition-colors ${prompt ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-400 text-white cursor-not-allowed'}`}
          disabled={!prompt || loading}
          onClick={handleGenerate}
        >
          <ImageIcon size={22} />
          {loading ? 'در حال تولید...' : 'تولید عکس'}
        </button>
        {error && <div className="text-center text-red-500 mt-4">{error}</div>}
        {result && (
          <div className="flex flex-col items-center mt-6">
            <img src={result} alt="نتیجه تصویر" className="rounded-lg max-w-full max-h-[400px] border border-gray-200 dark:border-gray-700" />
            <a href={result} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 underline">مشاهده تصویر در تب جدید</a>
          </div>
        )}

        {/* Gallery Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-right">گالری تصاویر شما</h2>
          {loadingImages ? (
            <div className="text-center text-gray-500 dark:text-gray-400">در حال بارگذاری تصاویر...</div>
          ) : userImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userImages.map((image) => (
                <div key={image.ID} className="relative group">
                  <img
                    src={image.media_url}
                    alt={`تصویر ${image.ID}`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a
                      href={image.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      مشاهده
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">هنوز عکسی تولید نشده است.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPage; 