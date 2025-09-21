'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  access_level?: 'full' | 'limited' | 'premium'
}

const ImageGenerationPage = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<string>('');
  // Model shortName is read from selectedModel; no separate model state needed
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryInfo, setRetryInfo] = useState<string | null>(null);
  const [isCreditError, setIsCreditError] = useState(false);
  const [isDailyLimitError, setIsDailyLimitError] = useState(false);
  const [userImages, setUserImages] = useState<MediaItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [models, setModels] = useState<LanguageModel[]>([])
  const [modelsLoading, setModelsLoading] = useState<boolean>(true)
  const [selectedModel, setSelectedModel] = useState<LanguageModel | null>(null)
  const [showGuide, setShowGuide] = useState(false);

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
              accessLevel: m.access_level || 'full',
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
        // مرتب کردن تصاویر از جدیدترین به قدیمی‌ترین
        const sortedImages = data.media.sort((a: MediaItem, b: MediaItem) => 
          new Date(b.insert_time).getTime() - new Date(a.insert_time).getTime()
        );
        setUserImages(sortedImages);
      }
    } catch (err) {
      console.error('Error fetching user images:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleGenerate = async (retryCount = 0) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setRetryInfo(null);
    setIsCreditError(false);
    setIsDailyLimitError(false);
    
    // Validate inputs
    if (!prompt.trim()) {
      setError('لطفاً متن تولید تصویر را وارد کنید.');
      setLoading(false);
      return;
    }
    
    if (!selectedModel?.modelPath) {
      setError('لطفاً مدل تولید تصویر را انتخاب کنید.');
      setLoading(false);
      return;
    }
    
    try {
      const selectedSize = size || (selectedModel?.supportedSizes && selectedModel.supportedSizes[0]) || '512x512'
      const provider = selectedModel?.modelPath || 'openai'
      const requestBody = {
        chatId: '-1',
        prompt: prompt.trim(),
        model:provider,
        resolution: selectedSize,
      }
      console.log('Request body:', requestBody);

      const res = await fetchWithAuth('/api/generate-image-replicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }, 0, 300000); // 5 minutes timeout for image generation
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (data?.success && data?.data?.imageUrl) {
        setResult(data.data.imageUrl);
        // Refresh user images after generating a new one
        fetchUserImages();
      } else {
        console.error('API returned error:', data);
        // Show more specific error messages
        let errorMessage = 'خطا در دریافت تصویر.';
        
        // Handle specific error types first
        if (data?.errorType === 'ai_response_error') {
          errorMessage = 'مشکل در تولید تصویر توسط هوش مصنوعی. لطفاً دوباره تلاش کنید.';
        } else if (data?.errorType === 'insufficient_credit' || data?.errorType === 'credit_error') {
          errorMessage = data.message || 'اعتبار کافی برای تولید تصویر ندارید.';
          setIsCreditError(true);
        } else if (data?.errorType === 'invalid_provider') {
          errorMessage = 'مدل انتخابی در حال حاضر در دسترس نیست. لطفاً مدل دیگری انتخاب کنید.';
        } else if (data?.errorType === 'timeout_error') {
          errorMessage = 'تولید تصویر بیش از حد انتظار طول کشید. لطفاً دوباره تلاش کنید.';
        } else if (data?.errorType === 'daily_limit_exceeded') {
          errorMessage = data.message || 'حد مجاز روزانه تولید تصویر تمام شده است.';
          console.log('Setting daily limit error states:', { isDailyLimitError: true, isCreditError: true });
          setIsDailyLimitError(true);
          setIsCreditError(true); // Also set credit error to show upgrade button
        } else if (data?.message) {
          // Fallback to message if no specific error type
          errorMessage = data.message;
        }
        setError(errorMessage);
        
        // Log additional debug info
        console.log('Request details:', {
          provider: selectedModel?.modelPath,
          resolution: size,
          prompt: prompt.substring(0, 50) + '...',
          remainingCredit: data?.remainingCredit,
          retryCount,
          errorType: data?.errorType,
          isCreditError,
          isDailyLimitError
        });
        
        // Auto-retry once for AI response errors
        if (data?.errorType === 'ai_response_error' && retryCount === 0) {
          console.log('Retrying image generation due to AI response error...');
          setRetryInfo('تلاش مجدد...');
          setTimeout(() => handleGenerate(1), 2000); // Retry after 2 seconds
          return;
        }
        
        // Try fallback model for invalid provider errors
        if (data?.errorType === 'invalid_provider' && retryCount === 0 && models.length > 1) {
          const fallbackModel = models.find(m => m.modelPath !== selectedModel?.modelPath);
          if (fallbackModel) {
            console.log('Trying fallback model:', fallbackModel.name);
            setRetryInfo(`تلاش با مدل ${fallbackModel.name}...`);
            setSelectedModel(fallbackModel);
            setTimeout(() => handleGenerate(1), 1000);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Error generating image:', err);
      
      // Handle timeout errors specifically
      if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        setError('تولید تصویر بیش از حد انتظار طول کشید. لطفاً دوباره تلاش کنید.');
        return;
      }
      
      // Retry once for network errors
      if (retryCount === 0) {
        console.log('Retrying image generation due to network error...');
        setRetryInfo('تلاش مجدد بعد از خطای شبکه...');
        setTimeout(() => handleGenerate(1), 2000);
        return;
      }
      
      setError('خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
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

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col overflow-visible min-h-full"
  >
    <div className="flex-1 min-h-0 flex flex-col bg-gray-100 dark:bg-gray-900 py-8 pb-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-1 md:px-4 w-full space-y-8">
        {/* Form Section */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-right">ساخت تصویر</h1>
          <div className="mb-6">
            {/* راهنمای تولید تصویر بهتر - Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full p-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-lg">💡</span>
                    </div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 text-right">راهنمای تولید تصویر حرفه‌ای</h3>
                  </div>
                  <div className={`transform transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {/* محتوای راهنما */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showGuide ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-b-xl border-l border-r border-b border-blue-200 dark:border-blue-700/50 -mt-1">
                  <div className="space-y-3 text-xs text-blue-700 dark:text-blue-300">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><strong>جزئیات دقیق:</strong> به جای &ldquo;یک گل&rdquo; بنویسید &ldquo;گل رز قرمز زیبا با قطرات شبنم روی برگ‌ها&rdquo;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><strong>سبک هنری:</strong> مثل &ldquo;نقاشی رنگ روغن&rdquo;، &ldquo;عکاسی پرتره&rdquo;، &ldquo;هنر دیجیتال&rdquo;، &ldquo;آبرنگ&rdquo;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><strong>نورپردازی:</strong> &ldquo;نور طبیعی&rdquo;، &ldquo;نور طلایی غروب&rdquo;، &ldquo;نور نرم&rdquo;، &ldquo;سایه‌های تند&rdquo;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><strong>زاویه دید:</strong> &ldquo;نمای نزدیک&rdquo;، &ldquo;نمای کلی&rdquo;، &ldquo;از بالا&rdquo;، &ldquo;پرسپکتیو سه‌بعدی&rdquo;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><strong>کیفیت:</strong> &ldquo;کیفیت 4K&rdquo;، &ldquo;جزئیات بالا&rdquo;، &ldquo;وضوح فوق‌العاده&rdquo; را اضافه کنید</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ناحیه ورودی متن */}
            <div className="relative">
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                توضیح تصویر مورد نظر
              </label>
              <textarea
                className="w-full h-32 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-right text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="مثال: یک گربه پرشین سفید با چشمان آبی، نشسته روی یک صندلی چوبی، در یک اتاق با نور طبیعی، سبک عکاسی پرتره، کیفیت 4K، جزئیات بالا"
                value={prompt}
                onChange={e => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    setPrompt(value);
                  }
                }}
                maxLength={1000}
                dir="rtl"
              />
              <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                {prompt.length}/1000
              </div>
            </div>

            {/* نمونه پرامپت‌های آماده */}
            <motion.div 
              className="mt-3"
              initial={{ opacity: 1, height: 'auto' }}
              animate={{ 
                opacity: prompt.length > 3 ? 0 : 1,
                height: prompt.length > 3 ? 0 : 'auto',
                marginTop: prompt.length > 3 ? 0 : 12
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">پرامپت‌های آماده:</h4>
              <div className="space-y-1">
                {[
                  "منظره کوهستانی با آسمان پر ستاره، سبک نقاشی رنگ روغن",
                  "گل‌های رنگارنگ در گلدان سرامیکی، نور طبیعی، کیفیت 4K",
                  "شهر مدرن در شب با نورهای رنگی، سبک عکاسی شهری",
                  "دریای آرام با غروب خورشید، آبرنگ، جزئیات بالا"
                ].map((example, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setPrompt(example)}
                    className="w-full text-right px-1 py-2 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-200 transition-colors border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ 
                      opacity: prompt.length > 3 ? 0 : 1,
                      y: prompt.length > 3 ? -10 : 0
                    }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 text-xs">✨</span>
                      <span className="flex-1 leading-snug">{example}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
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
            className={`w-full flex items-center justify-center gap-3 rounded-xl py-4 font-bold text-lg mt-6 transition-all duration-200 transform ${
              prompt && !loading 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer hover:scale-[1.02] shadow-lg hover:shadow-xl' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            disabled={!prompt || loading}
            onClick={() => handleGenerate()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                {retryInfo || 'در حال تولید... (صبر کنید)'}
              </>
            ) : (
              <>
                <ImageIcon size={24} />
                تولید عکس با هوش مصنوعی
              </>
            )}
          </button>
          {loading && (
            <div className="text-center text-blue-600 dark:text-blue-400 mt-4 animate-pulse">
              <p className="mb-2">تولید عکس ممکن است تا  دقایقی طول بکشد. لطفاً صبر کنید...</p>
              {retryInfo && (
                <p className="text-sm text-amber-600 dark:text-amber-400">{retryInfo}</p>
              )}
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
              <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
              {/* Show retry suggestion for certain error types */}
              {(error.includes('مشکل در تولید تصویر') || error.includes('ناموفق بود')) && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center mt-2">
                  💡 نکته: تغییر متن یا انتخاب مدل دیگر ممکن است مفید باشد
                </p>
              )}
              {/* Show upgrade button for credit errors and daily limit errors */}
              {(isCreditError || isDailyLimitError) && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleUpgrade}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Crown className="w-5 h-5" />
                    {isDailyLimitError ? 'ارتقا بسته و تولید عکس' : 'ارتقا اکانت و ساخت تصویر'}
                  </button>
                </div>
              )}
            </div>
          )}
          {result && (
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 text-lg">✨</span>
                </div>
                <h3 className="text-lg font-bold text-green-800 dark:text-green-200">تصویر با موفقیت تولید شد!</h3>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <img
                    src={result.startsWith('http') ? result : AppConfig.mediaBaseUrl + result}
                    alt="نتیجه تصویر"
                    className="rounded-xl max-w-full max-h-[500px] border-2 border-gray-200 dark:border-gray-600 shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-xl"></div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href={result.startsWith('http') ? result : AppConfig.mediaBaseUrl + result}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    مشاهده در تب جدید
                  </a>
                  
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = result.startsWith('http') ? result : AppConfig.mediaBaseUrl + result;
                      link.download = `kariz-image-${Date.now()}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    <Download size={16} />
                    دانلود تصویر
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Gallery Section */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex flex-row-reverse justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              {userImages.length > 0 && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{userImages.length} تصویر</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-300 text-lg">🎨</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-right">گالری آثار شما</h2>
            </div>
          </div>
          
          {loadingImages ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">در حال بارگذاری گالری...</p>
            </div>
          ) : userImages.length > 0 ? (
            <div className="relative">
              {/* Scroll indicators */}
              <div className="absolute top-0 right-0 left-0 h-4 bg-gradient-to-b from-white dark:from-gray-800 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 left-0 h-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent z-10 pointer-events-none"></div>
              
              {/* Enhanced Scrollable container */}
              <div className="overflow-y-auto pr-2 -mr-2 pb-4 max-h-[600px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userImages.map((image, index) => (
                    <div key={image.ID} className="relative group">
                      <div className="relative h-52 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md hover:shadow-xl transition-all duration-300">
                        <img
                          src={image.media_url.startsWith('http') ? image.media_url : AppConfig.mediaBaseUrl + image.media_url}
                          alt={`تصویر ${image.ID}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                          onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : AppConfig.mediaBaseUrl + image.media_url)}
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        
                        {/* Action buttons */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : AppConfig.mediaBaseUrl + image.media_url)}
                              className="flex items-center gap-2 text-white bg-blue-600/90 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              مشاهده
                            </button>
                          </div>
                        </div>
                        
                        {/* Image number badge */}
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          #{index + 1}
                        </div>
                      </div>
                      
                      {/* Image date */}
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        {new Date(image.insert_time).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <ImageIcon size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-600 dark:text-gray-400 font-medium">هنوز تصویری تولید نکرده‌اید</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">پس از تولید اولین تصویر، اینجا نمایش داده خواهد شد</p>
              </div>
            </div>
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