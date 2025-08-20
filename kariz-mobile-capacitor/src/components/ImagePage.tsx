import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Image as ImageIcon, Download , ArrowRight, Loader2, X, ChevronDown } from 'lucide-react';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [sizeOpen, setSizeOpen] = useState(false)
  const sizeDropdownRef = useRef<HTMLDivElement>(null)

  const [models, setModels] = useState<LanguageModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<LanguageModel | null>(null);

  const { user } = useAuth();
  const { navigate } = useRouter();
  // const { theme } = useTheme();
  const { showToast } = useToast();

  // Cleanup refs and timeouts
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

  // Add timer to cleanup list
  const addTimer = useCallback((timer: NodeJS.Timeout) => {
    if (cleanupRefs.current.mounted) {
      cleanupRefs.current.timers.push(timer);
    } else {
      clearTimeout(timer);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle key press events (similar to ChatInputModern)
  function handleKeyPress(e: React.KeyboardEvent) {
    // Stop propagation so global listeners (e.g., app back handler) never see Backspace while typing
    if (e.key === 'Backspace') e.stopPropagation()
  }

  const fetchUserImages = useCallback(async () => {
    if (!user?.accessToken || !cleanupRefs.current.mounted) return;
    
    try {
      const response = await api.getWithAuth('/getMedia?messageType=image', user.accessToken) as { media: ApiMediaItem[] };
      if (response && response.media && cleanupRefs.current.mounted) {
        setUserImages(response.media);
      }
    } catch (err) {
      console.error('Error fetching user images:', err);
    } finally {
      if (cleanupRefs.current.mounted) {
        setLoadingImages(false);
      }
    }
  }, [user?.accessToken]);

  useEffect(() => {
    if (user?.accessToken && cleanupRefs.current.mounted) {
      fetchUserImages();
    }
  }, [user?.accessToken, fetchUserImages]);

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
        provider,
        resolution: selectedSize,
      };

      const response = await api.postWithAuthWithTimeout('/generate-image-edenai', requestBody, user.accessToken, 120000) as {
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
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <textarea
              className="w-full h-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-right text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-sans"
              placeholder="ایده‌های خود را برای خلق تصویر بنویسید..."
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
          </div>
          <div className="flex flex-col gap-4 mb-6">
          <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">مدل هوش مصنوعی</label>
              <ModelDropdown
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
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
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {selectedModel.description}
                    </div>
                  )}
                  {typeof selectedModel.tokenCost === 'number' && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      هزینه تولید هر عکس: {selectedModel.tokenCost.toLocaleString('fa-IR')} تومان
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">سایز تصویر</label>
              <div className="relative w-full" ref={sizeDropdownRef}>
                <button
                  type="button"
                  className="rounded-full px-2 py-1.5 md:py-2 flex items-center justify-between gap-2 font-bold min-w-[180px] md:min-w-[180px] w-full whitespace-nowrap bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
                  onClick={() => setSizeOpen(v => !v)}
                  aria-label="انتخاب اندازه تصویر"
                >
                  <span className="text-sm font-bold truncate flex-1 text-right">{size || (selectedModel?.supportedSizes?.[0] || FALLBACK_RESOLUTIONS[0])}</span>
                  <span className="transition-transform duration-300" style={{ transform: sizeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                {sizeOpen && (
                  <div className="absolute z-50 mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl w-full">
                    <div className="px-3 md:px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-right">انتخاب اندازه تصویر</h3>
                    </div>
                    <div className="py-1 max-h-72 overflow-y-auto">
                      {(selectedModel?.supportedSizes && selectedModel.supportedSizes.length > 0 ? selectedModel.supportedSizes : FALLBACK_RESOLUTIONS).map(opt => (
                        <div
                          key={opt}
                          className={`p-2 md:p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${ (size || selectedModel?.supportedSizes?.[0] || FALLBACK_RESOLUTIONS[0]) === opt ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''}`}
                          onClick={() => { setSize(opt); setSizeOpen(false) }}
                        >
                          <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white text-right">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
          <button
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-lg transition-colors ${
              prompt && !loading 
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            disabled={!prompt || loading}
            onClick={handleGenerate}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ImageIcon size={20} />
            )}
            {loading ? 'در حال تولید...' : 'تولید عکس'}
          </button>
          {loading && (
            <div className="text-center text-blue-600 dark:text-blue-400 mt-4 animate-pulse">
              تولید عکس ممکن است تا دقایقی طول بکشد. لطفاً صبر کنید...
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-center">
              <div className="text-red-700 dark:text-red-200 font-semibold">{error}</div>
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
            <div className="flex flex-col items-center mt-6">
              <img
                src={result.startsWith('http') ? result : `https://media.kalame.chat${result}`}
                alt="نتیجه تصویر"
                className="rounded-lg max-w-full max-h-[300px] border border-gray-200 dark:border-gray-700"
              />
              <a
                href={result.startsWith('http') ? result : `https://media.kalame.chat${result}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                مشاهده تصویر در تب جدید
              </a>
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-row-reverse justify-between items-center mb-6">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {userImages.length > 0 && `${userImages.length} تصویر`}
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-right">گالری تصاویر شما</h2>
          </div>
          
          {loadingImages ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Loader2 size={24} className="animate-spin mx-auto mb-2" />
              در حال بارگذاری تصاویر...
            </div>
          ) : userImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {userImages.map((image) => (
                <div key={image.ID} className="relative group aspect-square">
                  <img
                    src={image.media_url.startsWith('http') ? image.media_url : `https://media.kalame.chat${image.media_url}`}
                    alt={`تصویر ${image.ID}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700 transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                    onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : `https://media.kalame.chat${image.media_url}`)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenModal(image.media_url.startsWith('http') ? image.media_url : `https://media.kalame.chat${image.media_url}`)}
                      className="text-white bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      مشاهده
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">هنوز عکسی تولید نشده است.</div>
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