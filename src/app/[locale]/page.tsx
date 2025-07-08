'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

import ChatMessageContainer from './components/Chat/ChatMessage/ChatMessageContainer';
import ChatInput from './components/Chat/ChatInput/ChatInput';
import fetchWithAuth from './components/utils/fetchWithAuth';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';

const MainPage: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');
  const startParam = searchParams.get('start');
  const { user } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isPendingMessageLoading, setIsPendingMessageLoading] = useState(false);
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Store start param in a ref so it persists across rerenders
  const startRef = useRef<string | null>(null);

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
    handleChartRequest,
    handleCryptoTradeRequest,
    handleCryptoPortfolioRequest,
    // Streaming states
    isStreaming,
    stopStreaming,
    streamingError,
    retryStreamingMessage,
  } = useChat({ modelType: selectedModel });

  // Check character limit for non-logged-in users
  const handleInputChange = useCallback((text: string) => {
    if (!user && text.length > 40) {
      toast.success('برای گفت وگو با کلمه باید وارد حساب کاربری خود بشوید');
      setTimeout(() => {
        router.push('/auth');
      }, 1200);
      // Clear the input text to prevent further typing
      setInputText('');
      return;
    }
    setInputText(text);
  }, [user, router, setInputText]);

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
    window.addEventListener('clear-chat-messages', clearHandler);
    return () => {
      window.removeEventListener('clear-chat-messages', clearHandler);
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

  // Function to check if user is at the bottom of the chat
  const isUserAtBottom = useCallback(() => {
    const threshold = -5 // px
    const scrollContainer = document.querySelector('.absolute.inset-0.overflow-y-auto');
    if (!scrollContainer) return true;
    return scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < threshold;
  }, []);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = useCallback((delay = 100) => {
    setTimeout(() => {
      const scrollContainer = document.querySelector('.absolute.inset-0.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      // Also scroll window to bottom for mobile
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 50);
    }, delay);
  }, [chatEndRef, isStreaming]);

  // Track if user is at bottom
  const [userAtBottom, setUserAtBottom] = useState(true);
  useEffect(() => {
    const scrollContainer = document.querySelector('.absolute.inset-0.overflow-y-auto');
    if (!scrollContainer) return;
    function handleScroll() {
      setUserAtBottom(isUserAtBottom());
    }
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isUserAtBottom]);

  // After sending a message, always scroll to bottom
  useEffect(() => {
    if (!userAtBottom) return;
    if (messages.length > 0 && !isSwitchingChat) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && !lastMsg.isStreaming) {
        scrollToBottom(150);
      }
    }
  }, [messages, isSwitchingChat, scrollToBottom, userAtBottom]);

  // Reset switching state when messages are loaded
  useEffect(() => {
    if (isSwitchingChat && messages.length > 0) {
      setIsSwitchingChat(false);
      scrollToBottom(150);
    }
  }, [messages, isSwitchingChat, scrollToBottom]);

  // For streaming: only scroll if a new line is added to the last AI message and user is at bottom
  // This logic is now handled by the general scrollToBottom logic

   // Custom handleSend to support chat creation and navigation
   const handleSend = useCallback(async (text?: string) => {
    if (!user) {
      toast.success('برای گفت وگو با کلمه باید وارد حساب کاربری خود بشوید');
      setTimeout(() => {
        router.push('/auth');
      }, 1200);
      return;
    }
    const sendText = typeof text === 'string' ? text : inputText;
    if (chatId === null && user?.id) {
      // Create new chat first
      setIsCreatingChat(true);
      try {
        const res = await fetchWithAuth('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID: user.id }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.chat) {
            setPendingMessage(sendText);
            setInputText('');
            await router.replace(`?chat=${data.chat}`);
            // Use useEffect for window operations instead of conditional checks
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('chat-history-refresh', { detail: { chatId: data.chat } }));
            }, 0);
          }
        } else {
          console.error('createChat API failed', res.status, await res.text());
        }
      } catch (err) {
        console.error('Error in createChat API:', err);
      } finally {
        setIsCreatingChat(false);
      }
    } else {
      baseHandleSend(sendText, selectedModel);
      setInputText('');
      // Scroll to bottom after sending a message
      scrollToBottom(200);
    }
  }, [user, inputText, chatId, router, setIsCreatingChat, setPendingMessage, setInputText, baseHandleSend, scrollToBottom, selectedModel]);

  // Handle pending message after chat creation
  useEffect(() => {
    if (pendingMessage && chatId && !isCreatingChat && !isLoading) {
      setIsPendingMessageLoading(true);
      handleSend(pendingMessage)
        .catch((error) => {
          console.error('Error sending pending message:', error);
          // Authentication errors will be handled by fetchWithAuth
          // which will redirect to auth page if needed
        })
        .finally(() => {
          setPendingMessage(null);
          setIsPendingMessageLoading(false);
        });
    }
  }, [pendingMessage, chatId, isCreatingChat, isLoading, handleSend]);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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

  
  return (
    <div className="flex flex-col h-screen w-full font-sans bg-white dark:bg-gray-900 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Main content area with proper overflow handling */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Scrollable message container */}
        <div className="absolute inset-0 overflow-y-auto  px-0 mx-0 md:mx-10">
          {shouldShowEmptyState ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
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
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col min-h-full"
            >
              <div className="flex-1 flex flex-col mt-14 md:mt-2">
                <ChatMessageContainer
                  messages={messages}
                  copyToClipboard={copyToClipboard}
                  onSelectAnswer={handleSelectAnswer}
                >
                  {(isLoading || isPendingMessageLoading) && !isStreaming && (
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
                <div ref={chatEndRef} className="h-[120px] md:h-[140px]" id="chat-end-anchor" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {/* Fixed ChatInput at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 w-full px-2  z-20 pt-2 pb-2">
        <div className={`max-w-2xl md:max-w-[84%] mx-auto ${isSidebarCollapsed ? 'md:mr-[150px]' : 'md:mr-[400px] md:ml-[120px]'}`}>
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
          <ChatInput
            inputText={inputText}
            setInputText={handleInputChange}
            handleSend={handleSend}
            isLoading={isLoading || isCreatingChat || isPendingMessageLoading || isStreaming}
            onChartRequest={handleChartRequest}
            onCryptoTradeRequest={handleCryptoTradeRequest}
            onCryptoPortfolioRequest={handleCryptoPortfolioRequest}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;