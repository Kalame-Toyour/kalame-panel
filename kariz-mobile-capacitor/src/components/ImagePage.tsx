import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Image as ImageIcon, Download , ArrowRight, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../contexts/RouterContext';
// import { useTheme } from '../contexts/ThemeContext';
import { useToast } from './ui/Toast';
import { api } from '../utils/api';
import type { ApiMediaItem } from '../utils/api';
import { ModelDropdown, type LanguageModel } from './ModelDropdown';

interface ApiModel {
  id: number;
  name: string;
  short_name: string;
  token_cost: number;
  icon_url: string;
  provider: string;
  model_path: string;
  max_tokens: number;
  context_length: number;
  temperature: number;
  supports_streaming: number;
  supports_web_search: number;
  supports_reasoning: number;
  type?: string;
  supported_sizes?: string[];
  supported_sizes_json?: string;
  description?: string;
}

const FALLBACK_RESOLUTIONS = ['256x256', '512x512', '1024x1024'];

export default function ImagePage() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [userImages, setUserImages] = useState<ApiMediaItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  // Debug loadingImages state
  useEffect(() => {
    console.log('⏳ loadingImages state changed:', loadingImages);
  }, [loadingImages]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [sizeOpen, setSizeOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false);
  const sizeDropdownRef = useRef<HTMLDivElement>(null)

  const [models, setModels] = useState<LanguageModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<LanguageModel | null>(null);

  const { user } = useAuth();
  const { navigate } = useRouter();
  // const { theme } = useTheme();
  const { showToast } = useToast();

  // Cleanup refs and timeouts - تعریف شده در ابتدا
  const cleanupRefs = useRef<{
    timers: NodeJS.Timeout[];
    mounted: boolean;
  }>({
    timers: [],
    mounted: true
  });


  // Cleanup function
  const cleanup = useCallback(() => {
    cleanupRefs.current.mounted = false;
    cleanupRefs.current.timers.forEach(timer => clearTimeout(timer));
    cleanupRefs.current.timers = [];
  }, []);


  // Cleanup on unmount
  useEffect(() => {
    console.log('🎬 Component mounted, cleanupRefs.current.mounted:', cleanupRefs.current.mounted);
    
    // اطمینان از اینکه mounted true است
    cleanupRefs.current.mounted = true;
    console.log('✅ Set cleanupRefs.current.mounted to true');
    
    return cleanup;
  }, [cleanup]);

  // Handle key press events (similar to ChatInputModern)
  function handleKeyPress(e: React.KeyboardEvent) {
    // Stop propagation so global listeners (e.g., app back handler) never see Backspace while typing
    if (e.key === 'Backspace') e.stopPropagation()
  }

  const fetchUserImages = useCallback(async () => {

    
    if (!user?.accessToken || !cleanupRefs.current.mounted) {
      return;
    }
    
    try {
      const response = await api.getWithAuth('/getMedia?messageType=image', user.accessToken) as { media: ApiMediaItem[] };
      
      if (response && response.media && cleanupRefs.current.mounted) {
        
        // مرتب کردن تصاویر از جدیدترین به قدیمی‌ترین
        const sortedImages = response.media.sort((a: ApiMediaItem, b: ApiMediaItem) => 
          new Date(b.insert_time).getTime() - new Date(a.insert_time).getTime()
        );
        setUserImages(sortedImages);
        
      } else {
        
      }
    } catch (err) {
      console.error('❌ Error fetching user images:', err);
    } finally {
      if (cleanupRefs.current.mounted) {
        setLoadingImages(false);
      }
    }
  }, [user?.accessToken]);

  useEffect(() => {

    
    if (user?.accessToken && cleanupRefs.current.mounted) {
      fetchUserImages();
    } else {

    }
  }, [user, fetchUserImages]);

  // اضافی: اطمینان از fetchUserImages بعد از mount
  useEffect(() => {
    const timer = setTimeout(() => {

      
      if (user?.accessToken && cleanupRefs.current.mounted && loadingImages) {

        fetchUserImages();
      }
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);
  }, [user?.accessToken, fetchUserImages, loadingImages]);

  useEffect(() => {
    if (!sizeOpen || !cleanupRefs.current.mounted) return;
    
    function onDocClick(e: MouseEvent) {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        if (cleanupRefs.current.mounted) {
          setSizeOpen(false);
        }
      }
    }
    
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [sizeOpen]);

  // Load image models
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (mounted) {
          setModelsLoading(true);
        }
        const resp = await api.get('/language-models?type=image') as { models: ApiModel[] };
        const list = Array.isArray(resp?.models) ? resp.models : [];
        const mapped: LanguageModel[] = list.map(m => {
          let sizes: string[] = [];
          if (Array.isArray(m.supported_sizes)) sizes = m.supported_sizes;
          else if (m.supported_sizes_json) {
            try { sizes = JSON.parse(m.supported_sizes_json) as string[] } catch {}
          }
          return {
            name: m.name,
            shortName: m.short_name,
            icon: m.icon_url,
            tokenCost: m.token_cost,
            provider: m.provider,
            modelPath: m.model_path,
            description: m.description,
            features: {
              maxTokens: m.max_tokens,
              contextLength: m.context_length,
              temperature: m.temperature,
              supportsStreaming: m.supports_streaming === 1,
              supportsWebSearch: m.supports_web_search === 1,
              supportsReasoning: m.supports_reasoning === 1,
            },
            type: m.type,
            supportedSizes: (sizes && sizes.length > 0) ? sizes : FALLBACK_RESOLUTIONS,
          };
        });
        if (!mounted) return;
        setModels(mapped);
        if (mapped.length > 0 && mapped[0]) {
          setSelectedModel(mapped[0]);
          // Set initial size when first model is loaded
          const firstSize = mapped[0].supportedSizes && mapped[0].supportedSizes[0];
          if (firstSize) setSize(firstSize);
        }
      } catch (e) {
        console.error('Failed to load image models', e);
        setModels([]);
      } finally {
        if (mounted) setModelsLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Default size to first supported when model changes
  useEffect(() => {
    if (!selectedModel) return;
    const first = selectedModel.supportedSizes && selectedModel.supportedSizes[0];
    if (first) {
      setSize(first);
    } else {
      setSize(FALLBACK_RESOLUTIONS[0] || '512x512');
    }
  }, [selectedModel]);

  const handleGenerate = async () => {
    if (!user?.accessToken) {
      showToast('لطفا ابتدا وارد حساب کاربری خود شوید', 'error');
      return;
    }
  if (!prompt.trim()) {
      showToast('متن تولید تصویر را وارد کنید', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    setErrorType(null);
    const previousCount = userImages.length;
    try {
      const selectedSize = size || selectedModel?.supportedSizes?.[0] || '512x512';
      const provider = selectedModel?.modelPath || 'openai';
      const requestBody = {
        chatId: '-1',
        prompt,
        model: provider,
        resolution: selectedSize,
      };

      const response = await api.postWithAuthWithTimeout('/generate-image-replicate', requestBody, user.accessToken, 120000) as {
        success: boolean;
        message: string;
        errorType?: string;
        data?: { imageUrl?: string; providerUsed?: string; resolution?: string } | null;
      };

      if (response.success && response.data?.imageUrl) {
        setResult(response.data.imageUrl);
        showToast('تصویر با موفقیت تولید شد', 'success');
        // Refresh user images after generating a new one
        fetchUserImages();
      } else {
        console.error('API returned error:', response);
        setError(response.message || 'خطا در دریافت تصویر.');
        setErrorType(response.errorType || null);
        showToast(response.message || 'خطا در دریافت تصویر.', 'error');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      // If request timed out, server may still complete. Try to recover by polling media.
      const maybeTimeout = (err as { code?: string })?.code === 'ECONNABORTED';
      if (maybeTimeout) {
        showToast('در حال نهایی‌سازی تصویر روی سرور، لطفاً صبر کنید...', 'warning');
        try {
          const attempts = 5;
          const intervalMs = 4000;
          for (let i = 0; i < attempts; i++) {
            await new Promise(res => setTimeout(res, intervalMs));
            if (!user?.accessToken) break;
            const mediaResp = await api.getWithAuth('/getMedia?messageType=image', user.accessToken) as { media: ApiMediaItem[] };
            if (mediaResp && Array.isArray(mediaResp.media)) {
              setUserImages(mediaResp.media);
              const newCount = mediaResp.media.length;
              if (newCount > previousCount) {
                const latest = [...mediaResp.media].sort((a, b) => new Date(b.insert_time).getTime() - new Date(a.insert_time).getTime())[0];
                if (latest?.media_url) {
                  const latestUrl = latest.media_url.startsWith('http') ? latest.media_url : `https://media.kalame.chat${latest.media_url}`;
                  setResult(latestUrl);
                }
                setError(null);
                showToast('تصویر با موفقیت تولید شد', 'success');
                return;
              }
            }
          }
          setError('پاسخ سرور بیش از حد طول کشید. لطفاً دوباره تلاش کنید.');
        } catch (pollErr) {
          console.error('Polling error after timeout:', pollErr);
          setError('پاسخ سرور بیش از حد طول کشید. لطفاً دوباره تلاش کنید.');
        }
      } else {
        setError('خطا در ارتباط با سرور.');
        showToast('خطا در ارتباط با سرور.', 'error');
      }
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
    showToast('تصویر دانلود شد', 'success');
  };

  const handleBack = () => {
    navigate('chat');
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">تولید تصویر</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            {/* راهنمای تولید تصویر بهتر - Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg">💡</span>
                    </div>
                    <h3 className="text-sm font-medium text-blue-800 text-right">راهنمای تولید تصویر حرفه‌ای</h3>
                  </div>
                  <div className={`transform transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {/* محتوای راهنما */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showGuide ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-b-xl border-l border-r border-b border-blue-200 -mt-1">
                  <div className="space-y-3 text-xs text-blue-700">
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
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                توضیح تصویر مورد نظر
              </label>
              <textarea
              className="w-full h-32 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-right text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all duration-200 shadow-sm hover:shadow-md font-sans"
              placeholder="مثال: یک گربه پرشین سفید با چشمان آبی، نشسته روی یک صندلی چوبی، در یک اتاق با نور طبیعی، سبک عکاسی پرتره، کیفیت 4K، جزئیات بالا"
              defaultValue={prompt}
              onChange={(e) => {
                const newValue = e.target.value;    
                setPrompt(newValue);
              }}
              onKeyDown={handleKeyPress}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const newValue = target.value;
                
                setPrompt(newValue);
              }}
              onCompositionStart={() => {
                // Handle composition start if needed
              }}
              onCompositionUpdate={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const newValue = target.value;
                setPrompt(newValue);
              }}
              onCompositionEnd={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const newValue = target.value; 
                setPrompt(newValue);
              }}
              onBlur={(e) => {
              
                // Sync on blur to ensure final state
                const target = e.target as HTMLTextAreaElement;
                if (target.value !== prompt) {
                  setPrompt(target.value);
                }
              }}
              onFocus={() => {
                // Handle focus if needed
              }}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData('text');
                const newValue = prompt + pastedText;
                setPrompt(newValue);
              }}
              dir="rtl"
              lang="fa"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              style={{ 
                direction: 'rtl',
                textAlign: 'right',
                unicodeBidi: 'embed',
                wordBreak: 'normal',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              {prompt.length}/500
            </div>
          </div>

          {/* نمونه پرامپت‌های آماده */}
          <div className="mt-3">
            <h4 className="text-xs font-medium text-gray-600 mb-2">پرامپت‌های آماده:</h4>
            <div className="space-y-1">
              {[
                "منظره کوهستانی با آسمان پر ستاره، سبک نقاشی رنگ روغن",
                "گل‌های رنگارنگ در گلدان سرامیکی، نور طبیعی، کیفیت 4K",
                "شهر مدرن در شب با نورهای رنگی، سبک عکاسی شهری",
                "دریای آرام با غروب خورشید، آبرنگ، جزئیات بالا"
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className="w-full text-right px-1 py-2 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 text-xs">✨</span>
                    <span className="flex-1 leading-snug">{example}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
          <div className="flex flex-col gap-4 mb-6">
          <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">مدل هوش مصنوعی</label>
              <ModelDropdown
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                models={models}
                loading={modelsLoading}
                className="w-full"
                mode="image"
                title="انتخاب مدل تولید تصویر"
              />
              {/* Show description when model is selected */}
              {selectedModel && selectedModel.description && (
                <div className="mt-3">
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {selectedModel.description}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">سایز تصویر</label>
              <div className="relative w-full" ref={sizeDropdownRef}>
                <button
                  type="button"
                  className="rounded-full px-2 py-1.5 md:py-2 flex items-center justify-between gap-2 font-bold min-w-[180px] md:min-w-[180px] w-full whitespace-nowrap bg-white text-gray-600 border border-gray-200 shadow-sm hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-400 transition-all"
                  onClick={() => setSizeOpen(v => !v)}
                  aria-label="انتخاب اندازه تصویر"
                >
                  <span className="text-sm font-bold truncate flex-1 text-right">{size || (selectedModel?.supportedSizes?.[0] || FALLBACK_RESOLUTIONS[0])}</span>
                  <span className="transition-transform duration-300" style={{ transform: sizeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                {sizeOpen && (
                  <div className="absolute z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-2xl w-full">
                    <div className="px-3 md:px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 text-right">انتخاب اندازه تصویر</h3>
                    </div>
                    <div className="py-1 max-h-72 overflow-y-auto">
                      {(selectedModel?.supportedSizes && selectedModel.supportedSizes.length > 0 ? selectedModel.supportedSizes : FALLBACK_RESOLUTIONS).map(opt => (
                        <div
                          key={opt}
                          className={`p-2 md:p-2 hover:bg-gray-50 transition-colors cursor-pointer ${ (size || selectedModel?.supportedSizes?.[0] || FALLBACK_RESOLUTIONS[0]) === opt ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                          onClick={() => { setSize(opt); setSizeOpen(false) }}
                        >
                          <span className="text-xs md:text-sm font-semibold text-gray-900 text-right">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
          <button
            className={`w-full flex items-center justify-center gap-3 rounded-xl py-4 font-bold text-lg mt-6 transition-all duration-200 transform ${
              prompt && !loading 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer hover:scale-[1.02] shadow-lg hover:shadow-xl' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!prompt || loading}
            onClick={handleGenerate}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                در حال تولید... (صبر کنید)
              </>
            ) : (
              <>
                <ImageIcon size={24} />
                تولید عکس با هوش مصنوعی
              </>
            )}
          </button>
          {loading && (
            <div className="text-center text-blue-600 mt-4 animate-pulse">
              تولید عکس ممکن است تا دقایقی طول بکشد. لطفاً صبر کنید...
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-center">
              <div className="text-red-700 font-semibold">{error}</div>
              {errorType === 'credit_error' && (
                <button
                  onClick={() => navigate('pricing')}
                  className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                >
                  افزایش اعتبار
                </button>
              )}
            </div>
          )}
          {result && (
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 text-lg">✨</span>
                </div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">تصویر با موفقیت تولید شد!</h3>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <img
                    src={result.startsWith('http') ? result : `https://media.kalame.chat${result}`}
                    alt="نتیجه تصویر"
                    className="rounded-xl max-w-full max-h-[400px] border-2 border-gray-200 dark:border-gray-600 shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-xl"></div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href={result.startsWith('http') ? result : `https://media.kalame.chat${result}`}
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
                      link.href = result.startsWith('http') ? result : `https://media.kalame.chat${result}`;
                      link.download = `kariz-image-${Date.now()}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast('تصویر دانلود شد', 'success');
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
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
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-right">گالری آثار شما</h2>
            </div>
          </div>
          
          {loadingImages ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">در حال بارگذاری گالری...</p>
            </div>
          ) : userImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {userImages.map((image, index) => (
                <div key={image.ID} className="relative group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md hover:shadow-xl transition-all duration-300">
                    <img
                      src={image.media_url.startsWith('http') ? image.media_url : `https://media.kalame.chat${image.media_url}`}
                      alt={`تصویر ${image.ID}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                      onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : `https://media.kalame.chat${image.media_url}`)}
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    
                    {/* Action buttons */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : `https://media.kalame.chat${image.media_url}`)}
                        className="flex items-center gap-2 text-white bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        مشاهده
                      </button>
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

      {/* Modal for image preview */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">پیش‌نمایش تصویر</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            {modalImage && (
              <img
                src={modalImage}
                alt="پیش‌نمایش تصویر"
                className="rounded-lg w-full mb-4"
              />
            )}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              <Download size={16} />
              دانلود تصویر
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 