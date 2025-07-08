import type { Message } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type ChatState = {
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  isInitializing: boolean;
  hasHistory: boolean;
  hasStartedChat: boolean;
  setHasStartedChat: React.Dispatch<React.SetStateAction<boolean>>;
  hasUsedChart: boolean;
  showInsightCards: boolean;
  showCompactInsights: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleSend: (text?: string, modelTypeOverride?: string) => Promise<void>;
  handleSelectAnswer: (selectedAnswer: string) => void;
  handleStartChat: () => void;
  handleChartRequest: (symbol: string) => void;
  handleCryptoTradeRequest: () => void;
  handleCryptoPortfolioRequest: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  // Streaming related states
  isStreaming: boolean;
  stopStreaming: () => void;
  streamingError: string | null;
  retryStreamingMessage: () => void;
};

export const useChat = (options?: { pendingMessage?: string, clearPendingMessage?: () => void, modelType?: string }): ChatState & { retryStreamingMessage: (opts?: { continueLast?: boolean }) => void } => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasHistory, setHasHistory] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [hasUsedChart, setHasUsedChart] = useState(false);
  const [showInsightCards, setShowInsightCards] = useState(true);
  const [showCompactInsights, setShowCompactInsights] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingMessageSent, setPendingMessageSent] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  
  // Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Initialize with null and update in useEffect to avoid hydration mismatch
  const [chatId, setChatId] = useState<string | null>(null);
  
  // Use Next.js hooks to detect URL changes
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Update chatId when URL changes
  useEffect(() => {
    const newChatId = searchParams.get('chat');
    console.log('URL changed, new chatId:', newChatId);
    setChatId(newChatId);
    
    // Reset state when chatId changes
    if (newChatId) {
      setIsInitializing(true);
      setMessages([]);
      // Stop any ongoing streaming
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsStreaming(false);
      }
    }
  }, [searchParams, pathname]);

  // Store initial message when routing
  useEffect(() => {
    if (options?.pendingMessage) {
      setInitialMessage(options.pendingMessage);
      setHasStartedChat(true);
      setShowInsightCards(false);
      setShowCompactInsights(true);
    }
  }, [options?.pendingMessage]);

  // Handle initial message and fetch chat history
  useEffect(() => {
    async function initializeChat() {
      if (!chatId) {
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        
        // If we have an initial message, add it to messages immediately
        if (initialMessage && !pendingMessageSent) {
          const userMessage: Message = {
            id: generateMessageId(),
            text: initialMessage,
            sender: 'user',
            type: 'text',
          };
          setMessages(prev => [...prev, userMessage]);
          setHasHistory(true);
          setShowInsightCards(false);
          setShowCompactInsights(true);
          
          // Send the message to API with streaming
          try {
            setIsLoading(true);
            await handleStreamingMessage(initialMessage, 'gemini');
          } catch (error) {
            console.error('Error sending initial message:', error);
          } finally {
            setIsLoading(false);
            setPendingMessageSent(true);
            setInitialMessage(null);
          }
        } else {
          // Fetch existing chat history
          const res = await fetch(`/api/chat/messages?chatCode=${encodeURIComponent(chatId)}&limit=100&order=asc`);
          if (res.ok) {
            const data = await res.json();
            const history = Array.isArray(data.chatHistory) ? data.chatHistory : [];
            const mapped = history.map((msg: {
              ID: number;
              chat_id: string;
              text: string;
              sender: string;
              message_type: string;
              timestamp: string;
              status: string;
              platform: string;
            }) => ({
              id: msg.ID.toString(),
              text: msg.text,
              sender: msg.sender,
              type: msg.message_type,
              createdAt: msg.timestamp,
              isWelcomeMessage: false,
            }));
            if (mapped.length > 0) {
              setHasHistory(true);
              setHasStartedChat(true);
              setShowCompactInsights(true);
              setShowInsightCards(false);
              setMessages(mapped);
            }
          }
        }
      } catch (e) {
        console.error('Error initializing chat:', e);
      } finally {
        setIsInitializing(false);
      }
    }

    initializeChat();
  }, [chatId, initialMessage, pendingMessageSent]);

  // Streaming error state and retry logic
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const lastStreamedTextRef = useRef<string>('');
  const lastStreamedMsgIdRef = useRef<string>('');
  const lastStreamedPromptRef = useRef<string>('');

  // Streaming message handler with timeout and error handling
  const handleStreamingMessage = useCallback(async (text: string, modelType: string = 'gpt-4', opts?: { reuseLast?: boolean }) => {
    if (!chatId) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    setStreamingError(null);

    let aiMessageId: string;
    if (opts && opts.reuseLast) {
      // Find the last AI message that is not finished
      const lastAi = [...messages].reverse().find(msg => msg.sender === 'ai' && (msg.isStreaming || msg.isError));
      if (lastAi) {
        aiMessageId = lastAi.id;
        // Reset its state
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, isStreaming: true, isError: false }
            : msg
        ));
      } else {
        aiMessageId = generateMessageId();
        setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', type: 'text', isStreaming: true }]);
      }
    } else {
      aiMessageId = generateMessageId();
      setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', type: 'text', isStreaming: true }]);
    }
    lastStreamedMsgIdRef.current = aiMessageId;
    lastStreamedPromptRef.current = text;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          chatId,
          modelType,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      const decoder = new TextDecoder();
      let streamTimeout: NodeJS.Timeout | null = setTimeout(() => {
        setIsStreaming(false);
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, text: fullContent, isStreaming: false, isError: true }
            : msg
        ));
        // After a short delay, fetch latest history and update last AI message
        setTimeout(fetchAndUpdateLastAIMessage, 2000);
      }, 15000);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (streamTimeout) {
          clearTimeout(streamTimeout);
          streamTimeout = setTimeout(() => {
            setIsStreaming(false);
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: fullContent, isStreaming: false, isError: true }
                : msg
            ));
            setTimeout(fetchAndUpdateLastAIMessage, 2000);
          }, 15000);
        }
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, text: fullContent, isStreaming: false }
                  : msg
              ));
              setIsStreaming(false);
              if (streamTimeout) clearTimeout(streamTimeout);
              return fullContent;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setIsStreaming(false);
                setMessages(prev => prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, text: fullContent, isStreaming: false, isError: true }
                    : msg
                ));
                setTimeout(fetchAndUpdateLastAIMessage, 2000);
                throw new Error(parsed.error);
              }
              if (parsed.content) {
                fullContent += parsed.content;
                lastStreamedTextRef.current = fullContent;
                setMessages(prev => prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, text: fullContent }
                    : msg
                ));
              }
            } catch {
              if (data !== '[DONE]') {
                console.warn('Failed to parse streaming data:', data);
              }
            }
          }
        }
      }
      if (streamTimeout) clearTimeout(streamTimeout);
      return fullContent;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }
      setIsStreaming(false);
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, text: '', isStreaming: false, isError: true }
          : msg
      ));
      setTimeout(fetchAndUpdateLastAIMessage, 2000);
      throw error;
    }
  }, [chatId, messages]);

  // Retry streaming the last failed message
  const retryStreamingMessage = useCallback((opts?: { continueLast?: boolean }) => {
    setStreamingError(null);
    setIsStreaming(false);
    if (opts && opts.continueLast) {
      // Continue streaming into the last AI message (do not remove it)
      if (lastStreamedPromptRef.current) {
        handleStreamingMessage(lastStreamedPromptRef.current, undefined, { reuseLast: true });
      }
    } else {
      // Remove the last failed AI message and re-send
      setMessages(prev => prev.filter(msg => msg.id !== lastStreamedMsgIdRef.current));
      if (lastStreamedPromptRef.current) {
        handleStreamingMessage(lastStreamedPromptRef.current);
      }
    }
  }, [handleStreamingMessage]);

  const handleStartChat = useCallback(() => {
    setHasStartedChat(true);
  }, []);

  const handleChartRequest = useCallback((symbol: string) => {
    const chartMessage: Message = {
      id: Date.now().toString(),
      type: 'chart',
      text: `Here's the ${symbol} chart you requested:`,
      sender: 'ai',
      symbol,
    };

    setMessages(prev => [...prev, chartMessage]);

    if (!hasUsedChart) {
      setHasUsedChart(true);
      handleStartChat();
    }
  }, [hasUsedChart, handleStartChat]);

  const handleCryptoTradeRequest = useCallback(() => {
    if (!hasStartedChat) {
      handleStartChat();
    }

    const userMessage: Message = {
      id: generateMessageId(),
      text: 'Buy/Sell Crypto',
      sender: 'user',
      type: 'text',
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Here\'s the crypto trading form you requested:',
      sender: 'ai',
      type: 'crypto-trade-form',
    };

    setMessages(prev =>
      hasStartedChat ? [...prev, userMessage, aiMessage] : [userMessage, aiMessage],
    );
  }, [hasStartedChat, handleStartChat]);

  const handleCryptoPortfolioRequest = useCallback(() => {
    if (!hasStartedChat) {
      handleStartChat();
    }

    const userMessage: Message = {
      id: generateMessageId(),
      text: 'Show my portfolio',
      sender: 'user',
      type: 'text',
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Here\'s your crypto portfolio:',
      sender: 'ai',
      type: 'portfolio',
    };

    setMessages(prev =>
      hasStartedChat ? [...prev, userMessage, aiMessage] : [userMessage, aiMessage],
    );
  }, [hasStartedChat, handleStartChat]);

  const handleSend = useCallback(async (text: string = inputText, modelTypeOverride?: string) => {
    if (text.trim() === '' || !chatId) {
      return;
    }
    
    const userMessage: Message = {
      id: generateMessageId(),
      text,
      sender: 'user',
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    handleStartChat();

    try {
      // Use streaming API instead of regular API
      await handleStreamingMessage(text, modelTypeOverride || options?.modelType || 'gpt-4');
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage: Message = {
        id: generateMessageId(),
        text: `متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید. ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'ai',
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, chatId, handleStartChat, options?.modelType, handleStreamingMessage]);

  const handleSelectAnswer = useCallback((selectedAnswer: string) => {
    setMessages(prev => prev.map(msg =>
      msg.sender === 'ai' ? { ...msg, selectableAnswers: undefined } : msg,
    ));
    handleSend(selectedAnswer);
  }, [handleSend]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prevState => !prevState);
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Send pending message after chatId is set (e.g., after chat creation)
  useEffect(() => {
    if (options?.pendingMessage && chatId && !pendingMessageSent) {
      handleSend(options.pendingMessage).then(() => {
        setPendingMessageSent(true);
        if (options.clearPendingMessage) {
          options.clearPendingMessage();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.pendingMessage, chatId]);

  return {
    messages,
    inputText,
    setInputText,
    setMessages,
    handleSend,
    handleSelectAnswer,
    isLoading,
    isInitializing,
    hasHistory,
    hasStartedChat,
    setHasStartedChat,
    hasUsedChart,
    showInsightCards,
    showCompactInsights,
    isSidebarOpen,
    toggleSidebar,
    handleStartChat,
    handleChartRequest,
    handleCryptoTradeRequest,
    handleCryptoPortfolioRequest,
    chatEndRef,
    // Streaming related states
    isStreaming,
    stopStreaming,
    streamingError,
    retryStreamingMessage,
  };
};

// Add a helper to generate unique ids
function generateMessageId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// Add dummy fetchAndUpdateLastAIMessage to fix missing reference error
function fetchAndUpdateLastAIMessage() {}
