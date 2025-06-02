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
  handleSend: (text?: string) => Promise<void>;
  handleSelectAnswer: (selectedAnswer: string) => void;
  handleStartChat: () => void;
  handleChartRequest: (symbol: string) => void;
  handleCryptoTradeRequest: () => void;
  handleCryptoPortfolioRequest: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
};

export const useChat = (options?: { pendingMessage?: string, clearPendingMessage?: () => void }): ChatState => {
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
            id: Date.now().toString(),
            text: initialMessage,
            sender: 'user',
            type: 'text',
          };
          setMessages([userMessage]);
          setHasHistory(true);
          setShowInsightCards(false);
          setShowCompactInsights(true);
          
          // Send the message to API
          try {
            setIsLoading(true);
            const response = await fetch('/api/chat/messages', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                chatId,
                text: initialMessage,
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
            const history = data.chatHistory || [];
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
      id: Date.now().toString(),
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
      id: Date.now().toString(),
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

  const handleSend = useCallback(async (text: string = inputText) => {
    if (text.trim() === '' || !chatId) {
      return;
    }
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    handleStartChat();

    try {
      // Send user message to API and get AI response
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // This ensures cookies are sent with the request
        body: JSON.stringify({
          chatId,
          text,
          modelType: 'gpt-4',
          subModel: 'gpt4_standard',
        }),
      });
      const data = await response.json();
      console.log('Response from external API:', data, 'Status:', response.status);
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'خطا در دریافت پاسخ از هوش مصنوعی');
      }
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: 'ai',
        type: 'text',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید. ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'ai',
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, chatId, handleStartChat]);

  const handleSelectAnswer = useCallback((selectedAnswer: string) => {
    setMessages(prev => prev.map(msg =>
      msg.sender === 'ai' ? { ...msg, selectableAnswers: undefined } : msg,
    ));
    handleSend(selectedAnswer);
  }, [handleSend]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prevState => !prevState);
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
  };
};
