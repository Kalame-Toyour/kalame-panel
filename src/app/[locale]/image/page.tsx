'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download } from 'lucide-react';
import fetchWithAuth from '../components/utils/fetchWithAuth';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { AppConfig } from '@/utils/AppConfig';
import { ModelDropdown, type LanguageModel } from '../components/ModelDropdown'
import { SimpleDropdown } from '../components/SimpleDropdown'

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

// Local type matching API response for models
interface ApiModel {
  id: number
  name: string
  short_name: string
  token_cost: number
  icon_url: string
  provider: string
  model_path: string
  max_tokens: number
  context_length: number
  temperature: number
  supports_streaming: number
  supports_web_search: number
  supports_reasoning: number
  type?: string
  supported_sizes?: string[]
  supported_sizes_json?: string
  description?: string
}

const ImageGenerationPage = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<string>('');
  // Model shortName is read from selectedModel; no separate model state needed
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userImages, setUserImages] = useState<MediaItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [models, setModels] = useState<LanguageModel[]>([])
  const [modelsLoading, setModelsLoading] = useState<boolean>(true)
  const [selectedModel, setSelectedModel] = useState<LanguageModel | null>(null)

  useEffect(() => {
    fetchUserImages();
  }, []);

  // Fetch image models for dropdown
  useEffect(() => {
    let isMounted = true
    setModelsLoading(true)
    fetch('/api/language-models?type=image')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (Array.isArray(data.models)) {
          const mapped: LanguageModel[] = data.models.map((m: ApiModel) => {
            let sizes: string[] | undefined
            if (Array.isArray(m.supported_sizes)) sizes = m.supported_sizes
            else if (m.supported_sizes_json) {
              try {
                const parsed = JSON.parse(m.supported_sizes_json)
                if (Array.isArray(parsed)) sizes = parsed
              } catch {}
            }
            return {
              name: m.name,
              shortName: m.short_name,
              icon: m.icon_url,
              tokenCost: m.token_cost,
              provider: m.provider,
              modelPath: m.model_path,
              description: m.description,
              type: m.type,
              supportedSizes: sizes,
              features: {
                maxTokens: m.max_tokens,
                contextLength: m.context_length,
                temperature: m.temperature,
                supportsStreaming: m.supports_streaming === 1,
                supportsWebSearch: m.supports_web_search === 1,
                supportsReasoning: m.supports_reasoning === 1,
              },
            }
          })
          setModels(mapped)
          const first = mapped[0] ?? null
          if (first) {
            setSelectedModel(first)
            // Set initial size when first model is loaded
            const firstSize = first.supportedSizes && first.supportedSizes[0];
            if (firstSize) setSize(firstSize);
          }
        }
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setModelsLoading(false) })
    return () => { isMounted = false }
  }, [])
  
  // Update size when model changes: pick first supported size
  useEffect(() => {
    if (!selectedModel) return
    const firstSize = (selectedModel.supportedSizes && selectedModel.supportedSizes[0]) || ''
    setSize(firstSize)
  }, [selectedModel])

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
      const selectedSize = size || (selectedModel?.supportedSizes && selectedModel.supportedSizes[0]) || '512x512'
      const provider = selectedModel?.modelPath || 'openai'
      const requestBody = {
        chatId: '-1',
        prompt,
        provider,
        resolution: selectedSize,
      }
      console.log('Request body:', requestBody);

      const res = await fetchWithAuth('/api/generate-image-edenai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (data?.success && data?.data?.imageUrl) {
        setResult(data.data.imageUrl);
        // Refresh user images after generating a new one
        fetchUserImages();
      } else {
        console.error('API returned error:', data);
        setError(data?.message || 'خطا در دریافت تصویر.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (imgUrl: string) => {
    setModalImage(imgUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  const handleDownload = () => {
    if (!modalImage) return;
    const link = document.createElement('a');
    link.href = modalImage;
    link.download = 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // window.open(modalImage, '_blank', 'noopener,noreferrer');

  };

  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col overflow-visible min-h-full"
  >
    <div className="flex-1 min-h-0 flex flex-col bg-gray-100 dark:bg-gray-900 py-8 pb-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 w-full space-y-8">
        {/* Form Section */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
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
            {/* مدل هوش مصنوعی - اول */}
            <div className="flex-1 min-w-0">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">مدل هوش مصنوعی</label>
              <ModelDropdown
                selectedModel={selectedModel}
                setSelectedModel={(m) => { setSelectedModel(m) }}
                models={models}
                loading={modelsLoading}
                className="w-full"
                mode="image"
                title="انتخاب مدل تولید تصویر"
              />
              {/* Show description and cost when model is selected */}
              {selectedModel && (
                <div className="mt-3 space-y-2">
                  {selectedModel.description && (
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {selectedModel.description}
                    </div>
                  )}
                  {typeof selectedModel.tokenCost === 'number' && (
                    <div className="text-xs md:text-sm text-amber-700 dark:text-amber-300 font-medium">
                      هزینه تولید هر عکس: {selectedModel.tokenCost.toLocaleString('fa-IR')} تومان
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* سایز تصویر - دوم */}
            <div className="flex-1 min-w-0">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">سایز تصویر</label>
              <SimpleDropdown
                options={(selectedModel?.supportedSizes && selectedModel.supportedSizes.length > 0)
                  ? selectedModel.supportedSizes.map(s => ({ label: s, value: s }))
                  : IMAGE_SIZES.map(s => ({ label: s.label, value: s.value }))}
                value={size}
                onChange={setSize}
                title="انتخاب اندازه تصویر"
                className="w-full"
              />
            </div>
          </div>
          <button
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-lg mt-2 transition-colors ${prompt && !loading ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-gray-400 text-white cursor-not-allowed'}`}
            disabled={!prompt || loading}
            onClick={handleGenerate}
          >
            <ImageIcon size={22} />
            {loading ? 'در حال تولید... ( صبر کنید)' : 'تولید عکس'}
          </button>
          {loading && (
            <div className="text-center text-blue-600 dark:text-blue-400 mt-4 animate-pulse">
              تولید عکس ممکن است تا دقایقی طول بکشد. لطفاً صبر کنید...
            </div>
          )}
          {error && <div className="text-center text-red-500 mt-4">{error}</div>}
          {result && (
            <div className="flex flex-col items-center mt-6">
              <img
                src={result.startsWith('http') ? result : AppConfig.mediaBaseUrl + result}
                alt="نتیجه تصویر"
                className="rounded-lg max-w-full max-h-[400px] border border-gray-200 dark:border-gray-700"
              />
              <a
                href={result.startsWith('http') ? result : AppConfig.mediaBaseUrl + result}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                مشاهده تصویر در تب جدید
              </a>
            </div>
          )}
        </div>

        {/* Gallery Section with fixed height and scroll */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex flex-row-reverse justify-between items-center mb-6">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {userImages.length > 0 && `${userImages.length} تصویر`}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-right">گالری تصاویر شما</h2>
          </div>
          
          {loadingImages ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">در حال بارگذاری تصاویر...</div>
          ) : userImages.length > 0 ? (
            <div className="relative">
              {/* Scroll indicators */}
              <div className="absolute top-0 right-0 left-0 h-4 bg-gradient-to-b from-white dark:from-gray-800 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 left-0 h-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent z-10 pointer-events-none"></div>
              
              {/* Scrollable container with fixed height */}
              <div className="overflow-y-auto pr-2 -mr-2 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userImages.map((image) => (
                    <div key={image.ID} className="relative group h-48">
                      <img
                        src={image.media_url.startsWith('http') ? image.media_url : AppConfig.mediaBaseUrl + image.media_url}
                        alt={`تصویر ${image.ID}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700 transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                        onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : AppConfig.mediaBaseUrl + image.media_url)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : AppConfig.mediaBaseUrl + image.media_url)}
                          className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          مشاهده
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">هنوز عکسی تولید نشده است.</div>
          )}
        </div>
      </div>
    </div>

    {/* Modal for image preview */}
    {modalOpen && (
      <Dialog open={modalOpen} onClose={handleCloseModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-60" onClick={handleCloseModal} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-w-2xl w-full z-50 flex flex-col items-center">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 left-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              aria-label="بستن"
            >
              ×
            </button>
            {modalImage && (
              <img
                src={typeof modalImage === 'string' ? (modalImage.startsWith('http') ? modalImage : AppConfig.mediaBaseUrl + modalImage) : ''}
                alt="پیش‌نمایش تصویر"
                className="rounded-lg max-w-full max-h-[60vh] border border-gray-200 dark:border-gray-700 mb-4"
              />
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold mt-2"
            >
              <Download size={20} />
              دانلود تصویر
            </button>
          </div>
        </div>
      </Dialog>
    )}
  </motion.div>
);
};

export default ImageGenerationPage;