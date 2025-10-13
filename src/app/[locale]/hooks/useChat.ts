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
  handleSend: (text?: string, options?: { 
    modelType?: string; 
    webSearch?: boolean; 
    reasoning?: boolean;
    fileUrl?: string;
    fileType?: 'image' | 'pdf';
    fileName?: string;
    fileSize?: number;
  }) => Promise<void>;
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
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastStreamedTextRef = useRef<string>('');
  const lastStreamedMsgIdRef = useRef<string>('');
  const lastStreamedPromptRef = useRef<string>('');
  const messagesRef = useRef<Message[]>([]);
  
  useEffect(() => { messagesRef.current = messages }, [messages]);

  const chatEndRef = useRef<null | HTMLDivElement>(null);
  // const { data: session, update } = useSession();

  // Initialize with null and update in useEffect to avoid hydration mismatch
  const [chatId, setChatId] = useState<string | null>(null);
  
  // Use Next.js hooks to detect URL changes
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Better streaming state management
  useEffect(() => {
    // Log streaming state changes for debugging
    console.log('isStreaming state changed:', isStreaming, 'chatId:', chatId, 'isResetting:', isResetting);
  }, [isStreaming, chatId, isResetting]);

  // Update chatId when URL changes
  useEffect(() => {
    const newChatId = searchParams.get('chat');
    console.log('URL changed, new chatId:', newChatId);
    
    // Only reset if we have a different chatId
    if (newChatId !== chatId) {
      // Stop any ongoing streaming before changing chatId
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      setChatId(newChatId);
      
      // Reset state when chatId changes
      if (newChatId) {
        setIsInitializing(true);
        setMessages([]);
        // Don't set isStreaming to false here - let the streaming logic handle it
        // setIsStreaming(false); // REMOVED THIS LINE
      }
    }
  }, [searchParams, pathname, chatId]);

  // Store initial message when routing
  useEffect(() => {
    if (options?.pendingMessage) {
      // Try to get file info from sessionStorage
      let fileInfo = null;
      try {
        const storedData = sessionStorage.getItem('pendingMessageData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed.fileUrl) {
            fileInfo = {
              fileUrl: parsed.fileUrl,
              fileType: parsed.fileType,
              fileName: parsed.fileName,
              fileSize: parsed.fileSize
            };
            console.log('Retrieved file info from sessionStorage:', fileInfo);
            // Clear the stored data after reading
            sessionStorage.removeItem('pendingMessageData');
          }
        }
      } catch (error) {
        console.error('Error reading pendingMessageData from sessionStorage:', error);
      }
      
      setInitialMessage(options.pendingMessage);
      setHasStartedChat(true);
      setShowInsightCards(false);
      setShowCompactInsights(true);
      
      // Store file info for later use in streaming
      if (fileInfo) {
        // Store in a ref or state for use in handleStreamingMessage
        (window as any).pendingFileInfo = fileInfo;
      }
    }
  }, [options?.pendingMessage, options?.modelType]);

  // Streaming message handler with timeout and error handling
  const handleStreamingMessage = useCallback(async (text: string, modelType: string = 'GPT-4', options?: { 
    reuseLast?: boolean; 
    webSearch?: boolean; 
    reasoning?: boolean;
    fileUrl?: string;
    fileType?: 'image' | 'pdf';
    fileName?: string;
    fileSize?: number;
  }) => {
    if (!chatId || isResetting) {
      console.log('Streaming blocked: chatId missing or resetting');
      return;
    }
    
    // Don't abort if we're reusing the last message
    if (!options?.reuseLast && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    setStreamingError(null);
    let aiMessageId: string;
    
    // Store current chatId to prevent interference
    const currentChatId = chatId;
    console.log('Starting streaming with chatId:', currentChatId, 'text:', text);
    
    if (options && options.reuseLast) {
      const lastAi = [...messagesRef.current].reverse().find(msg => msg.sender === 'ai' && (msg.isStreaming || msg.isError));
      if (lastAi) {
        aiMessageId = lastAi.id;
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
          ...msg, 
          isStreaming: true, 
          isError: false,
          reasoningContent: '',
          isReasoningComplete: false
        } : msg));
      } else {
        aiMessageId = generateMessageId();
        setMessages(prev => [...prev, { 
          id: aiMessageId, 
          text: 'در حال دریافت پاسخ...', 
          sender: 'ai', 
          type: 'text', 
          isStreaming: true, 
          model: modelType,
          reasoningContent: '',
          isReasoningComplete: false
        }]);
      }
    } else {
      aiMessageId = generateMessageId();
      setMessages(prev => [...prev, { 
        id: aiMessageId, 
        text: '', 
        sender: 'ai', 
        type: 'text', 
        isStreaming: true, 
        model: modelType,
          reasoningContent: '',
          isReasoningComplete: false
        }]);
      }
      
      lastStreamedMsgIdRef.current = aiMessageId;
      lastStreamedPromptRef.current = text;
      
      try {
        // Check if chatId has changed during setup or if resetting
        if (currentChatId !== chatId || isResetting) {
          console.log('ChatId changed during setup or resetting, aborting streaming. Current:', currentChatId, 'New:', chatId);
          return;
        }
        
        console.log('useChat - Sending to /api/chat/stream:', {
          text,
          chatId: currentChatId,
          modelType,
          webSearch: options?.webSearch || false,
          reasoning: options?.reasoning || false,
          fileUrl: options?.fileUrl
        });

        // Prepare request body
        const requestBody: any = {
          text, 
          chatId: currentChatId, 
          modelType,
          webSearch: options?.webSearch || false,
          reasoning: options?.reasoning || false
        };

        // Add fileUrl only if it exists and is not undefined
        if (options?.fileUrl) {
          requestBody.fileUrl = options.fileUrl;
        }

        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        let fullContent = '';
        let fullReasoningContent = '';
        const decoder = new TextDecoder();
        let streamTimeout: NodeJS.Timeout | null = setTimeout(() => {
          // Check if chatId has changed before updating
          if (currentChatId === chatId && !isResetting) {
            console.log('Stream timeout reached, setting error state');
            setIsStreaming(false);
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
              ...msg, 
              text: fullContent || 'متاسفانه درخواست شما به دلیل کندی شبکه ناموفق بود. لطفا دوباره تلاش کنید.', 
              isStreaming: false, 
              isError: true,
              isReasoningComplete: true
            } : msg));
            setTimeout(fetchAndUpdateLastAIMessage, 2000);
          }
        }, 15000);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Check if chatId has changed during streaming or if resetting
          if (currentChatId !== chatId || isResetting) {
            console.log('ChatId changed during streaming or resetting, stopping. Current:', currentChatId, 'New:', chatId);
            if (streamTimeout) clearTimeout(streamTimeout);
            return;
          }
          
          if (streamTimeout) {
            clearTimeout(streamTimeout);
            streamTimeout = setTimeout(() => {
              if (currentChatId === chatId && !isResetting) {
                console.log('Stream timeout reset, setting error state');
                setIsStreaming(false);
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                  ...msg, 
                  text: fullContent || 'متاسفانه درخواست شما به دلیل کندی شبکه ناموفق بود. لطفا دوباره تلاش کنید.', 
                  isStreaming: false, 
                  isError: true,
                  isReasoningComplete: true
                } : msg));
                setTimeout(fetchAndUpdateLastAIMessage, 2000);
              }
            }, 15000);
          }
          const chunk = decoder.decode(value);
          console.log('Raw chunk received:', chunk);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              console.log('Processing data line:', data);
              if (data === '[DONE]') {
                console.log('Stream completed, final content:', fullContent);
                if (currentChatId === chatId && !isResetting) {
                  setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                    ...msg, 
                    text: fullContent || 'متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.', 
                    isStreaming: false,
                    isReasoningComplete: true,
                    // Ensure the message is not marked as error if we have content
                    isError: !fullContent || fullContent.trim() === ''
                  } : msg));
                  setIsStreaming(false);
                }
                if (streamTimeout) clearTimeout(streamTimeout);
                return fullContent;
              }
              try {
                // Handle partial JSON data
                let parsed;
                try {
                  parsed = JSON.parse(data);
                  // console.log('Successfully parsed JSON:', parsed);
                } catch {
                  // console.log('Partial JSON data, skipping:', data);
                  continue;
                }
                
                if (parsed.error) {
                  console.log('Error detected in parsed data:', {
                    error: parsed.error,
                    errorType: parsed.errorType,
                    remainingCredit: parsed.remainingCredit,
                    buttonMessage: parsed.buttonMessage
                  });
                  if (currentChatId === chatId && !isResetting) {
                    setIsStreaming(false);
                    setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                      ...msg, 
                      text: parsed.error || 'متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.', 
                      isStreaming: false, 
                      isError: true, 
                      errorType: parsed.errorType || undefined, 
                      showRechargeButton: parsed.errorType === 'no_credit',
                      rechargeButtonText: parsed.buttonMessage || 'خرید اشتراک پیشرفته',
                      remainingCredit: parsed.remainingCredit,
                      isReasoningComplete: true
                    } : msg));
                  }
                  if (parsed.errorType !== 'no_credit') setTimeout(fetchAndUpdateLastAIMessage, 2000);
                  if (streamTimeout) clearTimeout(streamTimeout);
                  return fullContent;
                }
                
                // Handle reasoning content
                if (parsed.type === 'reasoning' && parsed.content) {
                  console.log('Reasoning content found:', parsed.content);
                  fullReasoningContent += parsed.content;
                  lastStreamedTextRef.current = fullReasoningContent;
                  console.log('Updated reasoning content:', fullReasoningContent);
                  if (currentChatId === chatId && !isResetting) {
                    setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                      ...msg, 
                      reasoningContent: fullReasoningContent 
                    } : msg));
                  }
                }
                // Handle main content
                else if (parsed.content) {
                  console.log('Main content found:', parsed.content);
                  // Mark reasoning as complete when main content starts
                  if (fullContent === '' && fullReasoningContent !== '') {
                    if (currentChatId === chatId && !isResetting) {
                      setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                        ...msg, 
                        isReasoningComplete: true 
                      } : msg));
                    }
                  }
                  fullContent += parsed.content;
                  lastStreamedTextRef.current = fullContent;
                  if (currentChatId === chatId && !isResetting) {
                    setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                      ...msg, 
                      text: fullContent 
                    } : msg));
                  }
                } else {
                  console.log('No content in parsed data:', parsed);
                }
              } catch (parseError) {
                console.error('Failed to parse JSON:', parseError, 'Raw data:', data);
                if (data !== '[DONE]') console.warn('Failed to parse streaming data:', data);
              }
            }
          }
        }
        if (streamTimeout) clearTimeout(streamTimeout);
        return fullContent;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Streaming aborted');
          return;
        }
        console.error('Streaming error:', error);
        
        // Determine error message based on error type
        let errorMessage = 'متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.';
        
        if (error instanceof Error) {
          if (error.message?.includes('UND_ERR_SOCKET') || error.message?.includes('other side closed')) {
            errorMessage = 'اتصال شبکه قطع شد. لطفا اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
          } else if (error.message?.includes('timeout')) {
            errorMessage = 'درخواست شما به دلیل کندی شبکه ناموفق بود. لطفا دوباره تلاش کنید.';
          } else if (error.message?.includes('aborted')) {
            errorMessage = 'درخواست شما لغو شد. لطفا دوباره تلاش کنید.';
          }
        }
        
        if (currentChatId === chatId && !isResetting) {
          setIsStreaming(false);
          setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
            ...msg, 
            text: errorMessage, 
            isStreaming: false, 
            isError: true,
            isReasoningComplete: true
          } : msg));
          setTimeout(fetchAndUpdateLastAIMessage, 2000);
        }
        throw error;
      }
    }, [chatId, isResetting])

    // Store the function in a ref to avoid dependency issues
    const handleStreamingMessageRef = useRef(handleStreamingMessage);
    useEffect(() => {
      handleStreamingMessageRef.current = handleStreamingMessage;
    }, [handleStreamingMessage]);

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
            // Don't add the user message again if it already exists
            const userMessageExists = messages.some(msg => 
              msg.sender === 'user' && msg.text === initialMessage
            );
            
            if (!userMessageExists) {
              const userMessage: Message = {
                id: generateMessageId(),
                text: initialMessage,
                sender: 'user',
                type: 'text',
              };
              setMessages(prev => [...prev, userMessage]);
            }
            
            setHasHistory(true);
            setShowInsightCards(false);
            setShowCompactInsights(true);
            
            // Send the message to API with streaming
            try {
              setIsLoading(true);
              console.log('Sending initial message:', initialMessage, 'with chatId:', chatId);
              
              // Get file info from window if available
              const pendingFileInfo = (window as any).pendingFileInfo;
              if (pendingFileInfo) {
                console.log('Using pending file info for initial message:', pendingFileInfo);
                await handleStreamingMessageRef.current(initialMessage, options?.modelType || 'GPT-4', pendingFileInfo);
                // Clear the pending file info after use
                (window as any).pendingFileInfo = null;
              } else {
                await handleStreamingMessageRef.current(initialMessage, options?.modelType || 'GPT-4');
              }
              console.log('Initial message streaming completed');
            } catch (error) {
              console.error('Error sending initial message:', error);
              // Don't hide the AI message box on error, let the streaming logic handle it
            } finally {
              setIsLoading(false);
              setPendingMessageSent(true);
              setInitialMessage(null);
              // Clear pending message in parent component
              if (options?.clearPendingMessage) {
                options.clearPendingMessage();
              }
            }
          } else {
            // Fetch existing chat history only if we don't have messages yet
            if (messages.length === 0) {
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
                  model?: string;
                  reason?: string;
                  message_upload_url?: string;
                }) => ({
                  id: msg.ID.toString(),
                  text: msg.text,
                  sender: msg.sender,
                  type: msg.message_type,
                  createdAt: msg.timestamp,
                  isWelcomeMessage: false,
                  model: msg.model || 'GPT-4',
                  // Handle reasoning content from chat history
                  reasoningContent: msg.reason || undefined,
                  isReasoningComplete: msg.reason ? true : undefined,
                  // Handle file upload URL from chat history
                  ...(msg.message_upload_url && {
                    fileUrl: msg.message_upload_url,
                    fileType: msg.message_upload_url.includes('.pdf') ? 'pdf' as const : 'image' as const,
                    fileName: msg.message_upload_url.split('/').pop() || 'فایل آپلود شده',
                    fileSize: undefined // Size not available in history
                  })
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
          }
        } catch (e) {
          console.error('Error initializing chat:', e);
        } finally {
          setIsInitializing(false);
        }
      }

      initializeChat();
    }, [chatId, initialMessage, pendingMessageSent, options?.modelType]);

  // Send pending message after chatId is set (e.g., after chat creation)
  useEffect(() => {
    if (options?.pendingMessage && chatId && !pendingMessageSent) {
      // Set the initial message to trigger the streaming logic
      setInitialMessage(options.pendingMessage);
      console.log('Pending message set for streaming:', options.pendingMessage);
      // Set loading state immediately when we have a pending message
      setIsLoading(true);
      // Don't mark as sent yet - let the streaming logic handle it
      // setPendingMessageSent(true); // REMOVED THIS LINE
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.pendingMessage, chatId, pendingMessageSent]);

  // Streaming error state and retry logic
  // const [streamingError, setStreamingError] = useState<string | null>(null);
  // const lastStreamedTextRef = useRef<string>('');
  // const lastStreamedMsgIdRef = useRef<string>('');
  // const lastStreamedPromptRef = useRef<string>('');
  // const messagesRef = useRef<Message[]>([])
  // useEffect(() => { messagesRef.current = messages }, [messages])

  // const [isResetting, setIsResetting] = useState(false);

  // Function to update user credit after successful request
  // const updateUserCredit = useCallback(async () => {
  //   try {
  //     const response = await fetch('/api/user/credit');
  //     if (response.ok) {
  //       const data = await response.json();
  //       // Update session with new credit using NextAuth update()
  //       await update({
  //         ...session,
  //         user: {
  //           ...session?.user,
  //           credit: data.credit
  //         }
  //       });
  //       console.log('Credit updated in session:', data.credit);
  //     }
  //   } catch (error) {
  //     console.error('Failed to update credit:', error);
  //   }
  // }, [session, update]);

  // Retry streaming the last failed message
  const retryStreamingMessage = useCallback((opts?: { continueLast?: boolean }) => {
    console.log('Retrying streaming message with options:', opts);
    setStreamingError(null);
    
    // Don't set isStreaming to false if we're in the middle of a reset
    if (!isResetting) {
      setIsStreaming(false);
    }
    
    if (opts && opts.continueLast) {
      // Continue streaming into the last AI message (do not remove it)
      if (lastStreamedPromptRef.current) {
        console.log('Retrying with continueLast option');
        handleStreamingMessage(lastStreamedPromptRef.current, undefined, { reuseLast: true });
      }
    } else {
      // Remove the last failed AI message and re-send
      console.log('Retrying with new message');
      setMessages(prev => prev.filter(msg => msg.id !== lastStreamedMsgIdRef.current));
      if (lastStreamedPromptRef.current) {
        handleStreamingMessage(lastStreamedPromptRef.current);
      }
    }
  }, [handleStreamingMessage, isResetting]);

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

  const handleSend = useCallback(async (text: string = inputText, options?: { 
    modelType?: string; 
    webSearch?: boolean; 
    reasoning?: boolean;
    fileUrl?: string;
    fileType?: 'image' | 'pdf';
    fileName?: string;
    fileSize?: number;
  }) => {
    if (text.trim() === '' || !chatId) {
      return;
    }
    
    console.log('handleSend called with text:', text, 'chatId:', chatId, 'options:', options);
    
    const userMessage: Message = {
      id: generateMessageId(),
      text,
      sender: 'user',
      type: 'text',
      // Add file info if available
      ...(options?.fileUrl && {
        fileUrl: options.fileUrl,
        fileType: options.fileType,
        fileName: options.fileName,
        fileSize: options.fileSize
      })
    };
    
    console.log('Creating user message with file info:', {
      text,
      fileUrl: options?.fileUrl,
      fileType: options?.fileType,
      fileName: options?.fileName,
      fileSize: options?.fileSize
    });
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    handleStartChat();

    try {
      // Use streaming API with new options
      const modelType = options?.modelType || 'GPT-4';
      console.log('Sending message with model:', modelType, 'options:', options);
      await handleStreamingMessage(text, modelType, options);
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
  }, [inputText, chatId, handleStartChat, handleStreamingMessage]);

  const handleSelectAnswer = useCallback((selectedAnswer: string) => {
    setMessages(prev => prev.map(msg =>
      msg.sender === 'ai' ? { ...msg, selectableAnswers: undefined } : msg,
    ));
    // Use the same model type for selected answers
    handleSend(selectedAnswer);
  }, [handleSend]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prevState => !prevState);
  }, []);

  const stopStreaming = useCallback(() => {
    console.log('Stopping streaming manually');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Only set isStreaming to false if we're not in the middle of a chat change
    if (!isResetting) {
      setIsStreaming(false);
    }
  }, [isResetting]);

  // Listen for clear-chat-messages event
  useEffect(() => {
    const clearHandler = () => {
      console.log('Clearing chat messages');
      setMessages([]);
      setInputText('');
      if (setHasStartedChat) setHasStartedChat(false);
      // Stop any ongoing streaming when clearing chat
      if (isStreaming) {
        console.log('Stopping streaming due to chat clear');
        stopStreaming();
      }
    };
    
    const resetHandler = (event: CustomEvent) => {
      console.log('useChat: Complete reset requested:', event.detail);
      
      // Set reset flag immediately
      setIsResetting(true);
      
      // Use setTimeout to ensure this runs after other operations
      setTimeout(() => {
        // Clear all states completely
        setMessages([]);
        setInputText('');
        setHasStartedChat(false);
        setHasUsedChart(false);
        setShowInsightCards(true);
        setShowCompactInsights(false);
        setIsSidebarOpen(false);
        setPendingMessageSent(false);
        setInitialMessage(null);
        
        // Reset streaming states
        setIsStreaming(false);
        setStreamingError(null);
        setIsLoading(false);
        setIsInitializing(false);
        setHasHistory(false);
        
        // Clear refs
        lastStreamedTextRef.current = '';
        lastStreamedMsgIdRef.current = '';
        lastStreamedPromptRef.current = '';
        
        // Abort any ongoing streaming
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        
        // Clear reset flag
        setIsResetting(false);
        
        console.log('useChat: All states reset successfully');
      }, 150); // Longer delay to ensure other operations complete
    };
    
    window.addEventListener('clear-chat-messages', clearHandler);
    window.addEventListener('reset-chat-completely', resetHandler as EventListener);
    return () => {
      window.removeEventListener('clear-chat-messages', clearHandler);
      window.removeEventListener('reset-chat-completely', resetHandler as EventListener);
    };
  }, [setMessages, setHasStartedChat, setInputText, isStreaming, stopStreaming]);

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
