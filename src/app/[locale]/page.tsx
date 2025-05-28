'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import ChatInput from './components/Chat/ChatInput/ChatInput';
import ChatMessageContainer from './components/Chat/ChatMessage/ChatMessageContainer';
import { useChat } from './hooks/useChat';
import fetchWithAuth from './components/utils/fetchWithAuth';
import type { Message } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

const MainPage: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');
  const { user } = useAuth();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isPendingMessageLoading, setIsPendingMessageLoading] = useState(false);
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
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
    chatEndRef,
    handleChartRequest,
    handleCryptoTradeRequest,
    handleCryptoPortfolioRequest,
  } = useChat();

  // Listen for clear-chat-messages event
  useEffect(() => {
    const clearHandler = () => {
      setMessages([]);
      setInputText('');
      if (setHasStartedChat) setHasStartedChat(false);
    };
    window.addEventListener('clear-chat-messages', clearHandler);
    return () => {
      window.removeEventListener('clear-chat-messages', clearHandler);
    };
  }, [setMessages, setHasStartedChat]);

  // Handle chat switching
  useEffect(() => {
    const handleChatSelect = () => {
      setIsSwitchingChat(true);
      setMessages([]);
    };

    window.addEventListener('chat-history-select', handleChatSelect);
    return () => {
      window.removeEventListener('chat-history-select', handleChatSelect);
    };
  }, [setMessages]);

  // Reset switching state when messages are loaded
  useEffect(() => {
    if (isSwitchingChat && messages.length > 0) {
      setIsSwitchingChat(false);
      // Add a small delay to ensure the messages are rendered
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isSwitchingChat, chatEndRef]);

  // Handle pending message after chat creation
  useEffect(() => {
    async function sendPendingMessage() {
      if (pendingMessage && chatId) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: pendingMessage,
          sender: 'user',
          type: 'text',
        };
        setMessages(prev => [...prev, userMessage]);
        setHasStartedChat(true);
        setIsPendingMessageLoading(true);
        
        try {
          const response = await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              chatId,
              text: pendingMessage,
              modelType: 'gpt-4',
              subModel: 'gpt4_standard',
            }),
          });
          
          const data = await response.json();
          if (response.ok && data.success) {
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: data.response,
              sender: 'ai',
              type: 'text',
            };
            setMessages(prev => [...prev, aiMessage]);
          }
        } catch (error) {
          console.error('Error sending pending message:', error);
        } finally {
          setIsPendingMessageLoading(false);
          setPendingMessage(null);
        }
      }
    }

    sendPendingMessage();
  }, [pendingMessage, chatId, setMessages, setHasStartedChat]);

  // Custom handleSend to support chat creation and navigation
  const handleSend = async (text?: string) => {
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
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('chat-history-refresh', { detail: { chatId: data.chat } }));
            }
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
      baseHandleSend(sendText);
      setInputText('');
    }
  };

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
    <div className="relative flex flex-col h-full min-h-screen max-h-screen p-0 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Messages container */}
      <div
        className={
          shouldShowEmptyState
            ? 'flex flex-col items-center justify-center h-full w-full flex-grow-0 overflow-hidden'
            : 'flex-1 flex flex-col overflow-y-auto px-0 mx-0 md:mx-10 min-h-0'
        }
        style={!shouldShowEmptyState ? { maxHeight: 'calc(100vh - 160px)' } : {}}
      >
        {shouldShowEmptyState ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex flex-col items-center gap-2 md:mb-4">
              <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-300 to-blue-100 shadow-lg relative overflow-visible">
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="block w-full h-full rounded-full animate-wave-ring bg-gradient-to-tr from-blue-400/40 to-blue-200/10 dark:from-blue-500/40 dark:to-blue-900/10"></span>
                </span>
                <img src="/kalame-logo.png" alt="Logo" className="size-12 rounded-full object-contain relative z-10" />
              </div>
              <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">چطور می تونم کمکت کنم؟</h2>
              <p className="text-center text-base text-gray-500 dark:text-gray-400">هر سوالی که داری سوال داری بپرس</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-full"
          >
            <div className="flex-1 flex flex-col ">
              <ChatMessageContainer
                messages={messages}
                copyToClipboard={copyToClipboard}
                onSelectAnswer={handleSelectAnswer}
              >
                {(isLoading || isPendingMessageLoading) && (
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
              </ChatMessageContainer>
              <div ref={chatEndRef} />
            </div>
          </motion.div>
        )}
      </div>
      {/* ChatInput always at the bottom */}
      <div className="w-full max-w-2xl md:max-w-[84%] mx-auto px-2 pt-0 mb-1 md:mb-0 bg-transparent z-10 fixed bottom-0 left-0 right-0 md:static md:bottom-auto md:left-auto md:right-auto">
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          handleSend={handleSend}
          isLoading={isLoading || isCreatingChat || isPendingMessageLoading}
          onChartRequest={handleChartRequest}
          onCryptoTradeRequest={handleCryptoTradeRequest}
          onCryptoPortfolioRequest={handleCryptoPortfolioRequest}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      </div>
    </div>
  );
};

export default MainPage;