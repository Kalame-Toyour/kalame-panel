'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';

import ChatMessageContainer from './components/Chat/ChatMessage/ChatMessageContainer';
import ChatInputModern from './components/Chat/ChatInput/ChatInputModern';
import { ModelDropdown } from './components/ModelDropdown';
import AuthNotification from './components/AuthNotification';
import fetchWithAuth from './components/utils/fetchWithAuth';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { ModelProvider, useModel } from './contexts/ModelContext';
import { TutorialProvider } from './contexts/TutorialContext';
import type { LanguageModel } from './components/ModelDropdown'
import { PromptSuggestions } from './components/PromptSuggestions'

// Interface for new API response structure
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
}

const MainPageContent: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');
  const startParam = searchParams.get('start');
  const { user } = useAuth();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Store start param in a ref so it persists across rerenders
  const startRef = useRef<string | null>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const hasScrolledToBottomOnChatId = useRef<string | null>(null)
  const [showAuthNotification, setShowAuthNotification] = useState(false)
  const [authNotificationType, setAuthNotificationType] = useState<'chat' | 'image' | null>(null)
  const { selectedModel, setSelectedModel, models, setModels, modelsLoading, setModelsLoading } = useModel();
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [webSearchActive, setWebSearchActive] = useState(false)
  const [reasoningActive, setReasoningActive] = useState(false)
  const [modelTypeParam, setModelTypeParam] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (startParam) startRef.current = startParam;
  }, [startParam]);

  useEffect(() => {
    window.addEventListener('beforeunload', startLoading);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        stopLoading();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', startLoading);
    };
  }, [startLoading, stopLoading]);

  useEffect(() => {
    let isMounted = true
    // Fetch only text models on main chat page
    fetch('/api/language-models?type=text')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data) // Debug log
        if (isMounted && data.models) {
          let allModels: LanguageModel[] = []
          
          // Handle new API structure (array of models)
          if (Array.isArray(data.models)) {
            console.log('Using new API structure (array)') // Debug log
            allModels = data.models.map((model: ApiModel) => ({
              name: model.name,
              shortName: model.short_name,
              icon: model.icon_url,
              tokenCost: model.token_cost,
              provider: model.provider,
              modelPath: model.model_path,
              features: {
                maxTokens: model.max_tokens,
                contextLength: model.context_length,
                temperature: model.temperature,
                supportsStreaming: model.supports_streaming === 1,
                supportsWebSearch: model.supports_web_search === 1,
                supportsReasoning: model.supports_reasoning === 1
              }
            }))
          }
          // Fallback to old nested structure
          else if (data.models.language?.models || data.models.image?.models || data.models.audio?.models) {
            // Add language models
            if (data.models.language?.models) {
              console.log('Language models:', data.models.language.models) // Debug log
              allModels.push(...data.models.language.models)
            }
            
            // Add image models
            if (data.models.image?.models) {
              allModels.push(...data.models.image.models)
            }
            
            // Add audio models
            if (data.models.audio?.models) {
              allModels.push(...data.models.audio.models)
            }
          }
          
          console.log('All models:', allModels) // Debug log
          setModels(allModels)
          if (allModels.length > 0 && !selectedModel && allModels[0]) {
            setSelectedModel(allModels[0])
          }
        } else {
          console.log('No models found or invalid data structure') // Debug log
        }
      })
      .catch(error => {
        console.error('Error fetching models:', error) // Debug log
      })
      .finally(() => { if (isMounted) setModelsLoading(false) })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    // Read params from query string
    const webSearchParam = searchParams.get('webSearch')
    const reasoningParam = searchParams.get('reasoning')
    const modelTypeQ = searchParams.get('modelType')
    setWebSearchActive(webSearchParam === 'true')
    setReasoningActive(reasoningParam === 'true')
    setModelTypeParam(modelTypeQ || undefined)
  }, [searchParams])

  const {
    messages,
    inputText,
    setInputText,
    setMessages,
    handleSend: baseHandleSend,
    handleSelectAnswer,
    isLoading,
    isInitializing,
    hasStartedChat,
    setHasStartedChat,
    // Streaming states
    isStreaming,
    stopStreaming,
    streamingError,
    retryStreamingMessage,
  } = useChat({ 
    pendingMessage: pendingMessage || undefined,
    clearPendingMessage: () => setPendingMessage(null),
    modelType: modelTypeParam || selectedModel?.name || 'GPT-4'
  }); // Pass pendingMessage and modelType to useChat hook

  // Update useChat when selectedModel changes
  useEffect(() => {
    // This will trigger a re-render when selectedModel changes
  }, [selectedModel]);

  // Check character limit for non-logged-in users
  const handleInputChange = useCallback((text: string) => {
    if (!user && text.length > 2) {
      setAuthNotificationType('chat');
      setShowAuthNotification(true);
      // Clear the input text to prevent further typing
      setInputText('');
      return;
    }
    setInputText(text);
  }, [user, setInputText]);

  // Listen for clear-chat-messages event
  useEffect(() => {
    const clearHandler = () => {
      setMessages([]);
      setInputText('');
      if (setHasStartedChat) setHasStartedChat(false);
      // Stop any ongoing streaming when clearing chat
      if (isStreaming) {
        stopStreaming();
      }
    };
    
    const resetHandler = (event: CustomEvent) => {
      console.log('Complete reset requested:', event.detail);
      
      // Use setTimeout to ensure this runs after navigation
      setTimeout(() => {
        // Clear all states completely
        setMessages([]);
        setInputText('');
        setPendingMessage(null);

        setIsCreatingChat(false);
        setIsSwitchingChat(false);
        setShowAuthNotification(false);
        setWebSearchActive(false);
        setReasoningActive(false);
        setModelTypeParam(undefined);
        
        if (setHasStartedChat) setHasStartedChat(false);
        
        // Stop any ongoing streaming
        if (isStreaming) {
          stopStreaming();
        }
        
        // Reset scroll state
        setIsUserAtBottom(true);
        setAutoScroll(true);
        hasScrolledToBottomOnChatId.current = null;
        
        console.log('All states reset successfully');
      }, 100); // Small delay to ensure navigation completes first
    };
    
    window.addEventListener('clear-chat-messages', clearHandler);
    window.addEventListener('reset-chat-completely', resetHandler as EventListener);
    
    return () => {
      window.removeEventListener('clear-chat-messages', clearHandler);
      window.removeEventListener('reset-chat-completely', resetHandler as EventListener);
    };
  }, [setMessages, setHasStartedChat, setInputText, isStreaming, stopStreaming]);

  // Handle chat switching
  useEffect(() => {
    const handleChatSelect = (event: CustomEvent) => {
      // Clear current state
      setIsSwitchingChat(true);
      setMessages([]);
      
      // Stop any ongoing streaming when switching chats
      if (isStreaming) {
        stopStreaming();
      }
      
      // Log the event for debugging
      console.log('Chat history select event received:', event.detail);
    };

    window.addEventListener('chat-history-select', handleChatSelect as EventListener);
    return () => {
      window.removeEventListener('chat-history-select', handleChatSelect as EventListener);
    };
  }, [setMessages, isStreaming, stopStreaming]);

  // تعریف state برای کنترل اسکرول خودکار
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    function handleScroll() {
      const threshold = 80
      if (!container) return;
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      setIsUserAtBottom(atBottom);
    }
    container.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [chatId])

  useEffect(() => {
    // هر بار chatId عوض شد، ریست کن تا بعد از لود پیام‌ها اسکرول اجرا شود
    hasScrolledToBottomOnChatId.current = null
  }, [chatId])

  useEffect(() => {
    if (!chatId || messages.length === 0) return
    if (hasScrolledToBottomOnChatId.current === chatId) return
    hasScrolledToBottomOnChatId.current = chatId
    setTimeout(() => {
      const c1 = scrollContainerRef.current
      if (!c1) return
      c1.scrollTo({ top: c1.scrollHeight, behavior: 'auto' })
      setTimeout(() => {
        const c2 = scrollContainerRef.current
        if (!c2) return
        c2.scrollTo({ top: c2.scrollHeight, behavior: 'smooth' })
      }, 80)
    }, 80)
  }, [chatId, messages.length])

  // اگر پیام‌ها پاک شدند یا چت عوض شد، مقدار ref را ریست کن
  useEffect(() => {
    if (!chatId || messages.length === 0) hasScrolledToBottomOnChatId.current = null
  }, [chatId, messages.length])

  // 2. قطع autoScroll هنگام اسکرول کاربر (حتی در استریم)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    let ticking = false
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!isUserAtBottom) setAutoScroll(false)
          else setAutoScroll(true)
          ticking = false
        })
        ticking = true
      }
    }
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isUserAtBottom])

  // 3. اسکرول خودکار فقط اگر autoScroll فعال باشد و کاربر پایین باشد
  useEffect(() => {
    if (!autoScroll) return
    const container = scrollContainerRef.current
    if (!container) return
    setTimeout(() => {
      if (autoScroll && isUserAtBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    }, 30)
  }, [messages, autoScroll, isUserAtBottom])

  // Reset switching state when messages are loaded
  useEffect(() => {
    if (isSwitchingChat && messages.length > 0) {
      setIsSwitchingChat(false);
      // scrollToBottom(150); // This line is removed as per the new logic
    }
  }, [messages, isSwitchingChat]);

  // For streaming: only scroll if a new line is added to the last AI message and user is at bottom
  // This logic is now handled by the general scrollToBottom logic

   // Custom handleSend to support chat creation and navigation
   const handleSend = useCallback(async (
     text?: string,
     options?: { modelType?: string; webSearch?: boolean; reasoning?: boolean }
   ) => {
     if (!user) {
       setShowAuthNotification(true);
       return;
     }
     const sendText = typeof text === 'string' ? text : inputText;
       // Use params from query string if present
  const modelTypeFinal = modelTypeParam || options?.modelType || selectedModel?.name || 'GPT-4';
     const webSearchFinal = typeof options?.webSearch === 'boolean' ? options.webSearch : webSearchActive;
     const reasoningFinal = typeof options?.reasoning === 'boolean' ? options.reasoning : reasoningActive;
     
     if (chatId === null && user?.id) {
       // Create new chat first
       console.log('Creating new chat for message:', sendText);
       setIsCreatingChat(true);
       
       // Add user message immediately to show it's being processed
       const userMessage = {
         id: Date.now().toString(),
         text: sendText,
         sender: 'user' as const,
         type: 'text' as const,
       };
       setMessages(prev => [...prev, userMessage]);
       setInputText('');
       
       try {
         const res = await fetchWithAuth('/api/chat', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userID: user.id }),
         });
         if (res.ok) {
           const data = await res.json();
           if (data.chat) {
             console.log('Chat created, setting pending message');
             setPendingMessage(sendText);
             
             // Build query params to preserve options
             const params = new URLSearchParams({ chat: data.chat });
             if (modelTypeFinal) params.set('modelType', modelTypeFinal);
             if (webSearchFinal) params.set('webSearch', String(webSearchFinal));
             if (reasoningFinal) params.set('reasoning', String(reasoningFinal));
             await router.replace(`?${params.toString()}`);
             
             // Wait a bit for the router to update and then refresh chat history
             setTimeout(() => {
               window.dispatchEvent(new CustomEvent('chat-history-refresh', { detail: { chatId: data.chat } }));
             }, 100);
           }
         } else {
           console.error('createChat API failed', res.status, await res.text());
           // Remove the user message if chat creation failed
           setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
         }
       } catch (err) {
         console.error('Error in createChat API:', err);
         // Remove the user message if chat creation failed
         setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
       } finally {
         setIsCreatingChat(false);
       }
     } else {
            // Use selected model's name or fallback to 'GPT-4'
     console.log('Sending message to existing chat:', sendText);
     baseHandleSend(sendText, {
       modelType: modelTypeFinal,
       webSearch: webSearchFinal,
       reasoning: reasoningFinal
     });
       setInputText('');
     }
   }, [user, inputText, chatId, router, setIsCreatingChat, setPendingMessage, setInputText, baseHandleSend, selectedModel, modelTypeParam, webSearchActive, reasoningActive, setMessages]);

  // Handle pending message after chat creation - REMOVED: useChat now handles this automatically

  // Log campaign entry after user login if start param exists
  useEffect(() => {
    async function logCampaignIfNeeded() {
      if (!user?.id || !startRef.current) return;
      try {
        await fetchWithAuth('/api/logCampaignEntry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkCode: startRef.current, user_id: user.id })
        });
        // Optionally clear startRef so it doesn't send again
        startRef.current = null;
      } catch (err) {
        console.error('Failed to log campaign entry:', err);
      }
    }
    logCampaignIfNeeded();
  }, [user]);

  const handleAuthRedirect = () => {
    setShowAuthNotification(false);
    setTimeout(() => {
      router.push('/auth');
    }, 300);
  };

  const handleCloseNotification = () => {
    setShowAuthNotification(false);
    setAuthNotificationType(null);
  };

  // Function to show image generation auth notification
  const handleImageAuthNotification = () => {
    setAuthNotificationType('image');
    setShowAuthNotification(true);
  };

  // Check if we should show the empty state
  const shouldShowEmptyState = !hasStartedChat && (!messages || messages.length === 0) && !pendingMessage;

  // Show loading state when switching chats or initializing
  if ((isInitializing && (!messages || messages.length === 0)) || isSwitchingChat) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 opacity-50 blur-lg" />
            <Loader className="relative size-8 text-blue-500" />
          </motion.div>
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-lg font-medium text-transparent">
            در حال بارگذاری...
          </span>
        </motion.div>
      </div>
    );
  }

  // Show loading state when creating chat
  if (isCreatingChat) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 opacity-50 blur-lg" />
            <Loader className="relative size-8 text-blue-500" />
          </motion.div>
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-lg font-medium text-transparent">
            در حال ایجاد چت جدید...
          </span>
        </motion.div>
      </div>
    );
  }

  // Show loading state when processing pending message
  if (pendingMessage && !chatId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 opacity-50 blur-lg" />
            <Loader className="relative size-8 text-blue-500" />
          </motion.div>
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-lg font-medium text-transparent">
            در حال آماده‌سازی چت...
          </span>
        </motion.div>
      </div>
    );
  }

  
  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      <AuthNotification 
        isVisible={showAuthNotification} 
        onClose={handleCloseNotification}
        onLogin={handleAuthRedirect}
        customTitle={authNotificationType === 'image' ? 'ورود برای تولید تصویر' : 'ورود به حساب کاربری'}
        customMessage={authNotificationType === 'image' 
          ? 'برای استفاده از قابلیت تولید تصویر هوشمند، لطفاً وارد حساب کاربری خود شوید.'
          : 'برای گفت‌وگو با هوش مصنوعی کلمه و استفاده از تمامی امکانات، لطفاً وارد حساب کاربری خود شوید.'
        }
        customFeatures={authNotificationType === 'image' 
          ? [
              'تولید تصاویر با کیفیت بالا',
              'تنظیمات پیشرفته تصویر',
              'ذخیره و مدیریت تصاویر'
            ]
          : [
              'دسترسی نامحدود به چت',
              'ذخیره تاریخچه گفت‌وگوها',
              'امکانات پیشرفته'
            ]
        }
      />
      {/* Sticky ModelDropdown at top of chat - Only show after models are loaded */}
      {!modelsLoading && models.length > 0 && (
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md mx-auto md:mx-0 border-gray-100 dark:border-gray-800 flex items-center md:px-4 py-2 ">
          <ModelDropdown
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            models={models}
            loading={modelsLoading}
            className="w-[200px] md:w-[260px]"
            mode="text"
          />
        </div>
      )}
      {/* Main content area with proper overflow handling */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Scrollable message container */}
        <div className="absolute inset-0 overflow-y-auto mb-16 md:mb-1 px-0 mx-0 md:mx-10" ref={scrollContainerRef}>
          {shouldShowEmptyState ? (
            <div className="flex flex-col items-center justify-center pb-20 h-full w-full">
              <div className="flex flex-col items-center gap-2 md:mb-4">
                <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-300 to-blue-100 shadow-lg relative overflow-visible">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="block w-full h-full rounded-full animate-wave-ring bg-gradient-to-tr from-blue-400/40 to-blue-200/10 dark:from-blue-500/40 dark:to-blue-900/10"></span>
                  </span>
                  <Image src="/kalame-logo.png" alt="Logo" width={48} height={48} className="size-12 rounded-full object-contain relative z-10" />
                </div>
                <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">چطور می تونم کمکت کنم؟</h2>
                <p className="text-center text-base text-gray-500 dark:text-gray-400">هر سوالی که در هر زمینه ای داری بپرس</p>
              </div>
              <PromptSuggestions
                onSelectPrompt={(prompt) => {
                  setInputText(prompt)
                  setTimeout(() => { inputRef.current?.focus() }, 50)
                }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col min-h-full overflow-hidden"
            >
              <div className="flex-1 flex flex-col mt-14 md:mt-2">
                <ChatMessageContainer
                  messages={messages}
                  onSelectAnswer={handleSelectAnswer}
                  isUserAtBottom={isUserAtBottom}
                >
                  {isLoading && !isStreaming && (
                    <div className="flex items-center justify-center py-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="relative"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 opacity-50 blur-lg" />
                        <Loader className="relative size-6 text-blue-500" />
                      </motion.div>
                    </div>
                  )}
                  {/* Streaming indicator */}
                  {isStreaming && (
                    <div className="flex items-center justify-center py-4 gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="relative"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 opacity-50 blur-lg" />
                        <Loader className="relative size-6 text-blue-500" />
                      </motion.div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        در حال دریافت پاسخ...
                      </span>
                      {/* <button
                        onClick={stopStreaming}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <StopCircle className="size-4" />
                        توقف
                      </button> */}
                    </div>
                  )}
                </ChatMessageContainer>
                <div ref={chatEndRef} className="h-[100px] md:h-[50px]" id="chat-end-anchor" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {/* Fixed ChatInput at the bottom */}
      {/* <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl px-2 z-20 pt-2 pb-2"> */}
      <div className="fixed md:static bottom-0 w-full flex justify-center px-2 z-20 pt-0 pb-2 bg-transparent">
         <div className="max-w-4xl w-full">
          {streamingError && (
            <div className="w-full max-w-2xl md:max-w-[84%] mx-auto mb-2 flex flex-col items-center justify-center">
              <div className="rounded-xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 px-4 py-3 text-center text-red-700 dark:text-red-200 font-semibold flex flex-col gap-2 shadow">
                <span>{streamingError}</span>
                <button
                  onClick={() => retryStreamingMessage({ continueLast: true })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow hover:from-blue-600 hover:to-blue-800 transition-all"
                  disabled={isStreaming}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19.364A9 9 0 104.582 9.582" /></svg>
                  تلاش مجدد
                </button>
              </div>
            </div>
          )}
          <ChatInputModern
            inputText={inputText}
            setInputText={handleInputChange}
            handleSend={handleSend}
            isLoading={isLoading || isCreatingChat || isStreaming}
            inputRef={inputRef}
            webSearchActive={webSearchActive}
            reasoningActive={reasoningActive}
            onShowAuthNotification={handleImageAuthNotification}
          />
        </div>
      </div>
    </div>
  );
};

const MainPage: React.FC = () => {
  return (
    <ModelProvider>
      <TutorialProvider>
        <MainPageContent />
      </TutorialProvider>
    </ModelProvider>
  );
};

export default MainPage;

