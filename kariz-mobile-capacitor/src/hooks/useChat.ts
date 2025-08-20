import { useState, useCallback, useRef, useEffect } from 'react';
import { AppConfig } from '../utils/AppConfig';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp?: number;
  isStreaming?: boolean;
  modelType?: string;
  model?: string;
  webSearch?: boolean;
  reasoning?: boolean;
  reasoningContent?: string;
  isReasoningComplete?: boolean;
  isError?: boolean;
  errorType?: string;
  showRechargeButton?: boolean;
}

interface SendOptions {
  modelType?: string;
  webSearch?: boolean;
  reasoning?: boolean;
  user?: any;
}

export function useChat(options?: { chatId?: string | null; user?: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  
  // Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastStreamedTextRef = useRef<string>('');
  const lastStreamedMsgIdRef = useRef<string>('');
  const lastStreamedPromptRef = useRef<string>('');

  // Reset messages when chatId changes
  const chatId = options?.chatId;
  
  // Clear messages when switching chats
  useEffect(() => {
    console.log('useChat: chatId changed to:', chatId);
    if (chatId) {
      console.log('useChat: Clearing messages for new chat:', chatId);
      setMessages([]);
      setHasStartedChat(false);
      setIsStreaming(false);
      setStreamingError(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else if (chatId === null) {
      // Also clear when chatId is explicitly set to null (new chat)
      console.log('useChat: Clearing messages for new chat (null chatId)');
      setMessages([]);
      setHasStartedChat(false);
      setIsStreaming(false);
      setStreamingError(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [chatId]);

  // Streaming message handler with real API integration
  const handleStreamingMessage = useCallback(async (text: string, modelType: string = 'GPT-4', options?: { reuseLast?: boolean; webSearch?: boolean; reasoning?: boolean; user?: any }) => {
    if (!chatId) {
      console.log('Streaming blocked: chatId missing');
      return;
    }
    
    if (!options?.user?.accessToken) {
      throw new Error('No access token provided');
    }
    
    if (!options?.user?.id) {
      throw new Error('No user id provided');
    }
    
    if (!AppConfig.baseApiUrl) {
      throw new Error('No baseApiUrl configured');
    }
    
    // Don't abort if we're reusing the last message
    if (!options?.reuseLast && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    setStreamingError(null);
    let aiMessageId: number;
    
    // Store current chatId to prevent interference
    const currentChatId = chatId;
    
    if (options && options.reuseLast) {
      const lastAi = [...messages].reverse().find(msg => msg.sender === 'ai' && (msg.isStreaming || msg.isError));
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
        aiMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { 
          id: aiMessageId, 
          text: '', 
          sender: 'ai', 
          timestamp: Date.now(),
          isStreaming: true, 
          model: modelType,
          reasoningContent: '',
          isReasoningComplete: false
        }]);
      }
    } else {
      aiMessageId = Date.now() + 1;
      setMessages(prev => [...prev, { 
        id: aiMessageId, 
        text: '', 
        sender: 'ai', 
        timestamp: Date.now(),
        isStreaming: true, 
        model: modelType,
        reasoningContent: '',
        isReasoningComplete: false
      }]);
    }
    
    lastStreamedMsgIdRef.current = aiMessageId.toString();
    lastStreamedPromptRef.current = text;
    
    try {
      if (currentChatId !== chatId) {
        console.log('ChatId changed during setup, aborting streaming');
        return;
      }
      
      const response = await fetch(`${AppConfig.baseApiUrl}/process-text-stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${options.user.accessToken}`
        },
        body: JSON.stringify({
          prompt: text,
          chatId: currentChatId,
          chatCode: currentChatId,
          modelType: modelType || 'GPT-4',
          subModel: modelType || 'gpt4_standard',
          webSearch: options?.webSearch || false,
          reasoning: options?.reasoning || false,
          stream: true
        }),
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
        if (currentChatId === chatId) {
          setIsStreaming(false);
          setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
            ...msg, 
            text: fullContent, 
            isStreaming: false, 
            isError: true,
            isReasoningComplete: true
          } : msg));
        }
      }, 15000);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (currentChatId !== chatId) {
          if (streamTimeout) clearTimeout(streamTimeout);
          return;
        }
        
        if (streamTimeout) {
          clearTimeout(streamTimeout);
          streamTimeout = setTimeout(() => {
            if (currentChatId === chatId) {
              setIsStreaming(false);
              setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                ...msg, 
                text: fullContent, 
                isStreaming: false, 
                isError: true,
                isReasoningComplete: true
              } : msg));
            }
          }, 15000);
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              if (currentChatId === chatId) {
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                  ...msg, 
                  text: fullContent, 
                  isStreaming: false,
                  isReasoningComplete: true
                } : msg));
                setIsStreaming(false);
              }
              if (streamTimeout) clearTimeout(streamTimeout);
              return fullContent;
            }
            try {
              let parsed: any;
              try {
                parsed = JSON.parse(data);
              } catch {
                continue;
              }
              if (parsed.error) {
                if (currentChatId === chatId) {
                  setIsStreaming(false);
                  setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                    ...msg, 
                    text: parsed.error, 
                    isStreaming: false, 
                    isError: true, 
                    errorType: parsed.errorType || undefined, 
                    showRechargeButton: parsed.errorType === 'no_credit',
                    isReasoningComplete: true
                  } : msg));
                }
                if (streamTimeout) clearTimeout(streamTimeout);
                return fullContent;
              }
              if (parsed.type === 'reasoning' && parsed.content) {
                fullReasoningContent += parsed.content;
                if (currentChatId === chatId) {
                  setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                    ...msg, 
                    reasoningContent: fullReasoningContent 
                  } : msg));
                }
              } else if (parsed.content) {
                if (fullContent === '' && fullReasoningContent !== '') {
                  if (currentChatId === chatId) {
                    setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                      ...msg, 
                      isReasoningComplete: true 
                    } : msg));
                  }
                }
                fullContent += parsed.content;
                if (currentChatId === chatId) {
                  setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
                    ...msg, 
                    text: fullContent 
                  } : msg));
                }
              }
            } catch (parseError) {
              continue;
            }
          }
        }
      }
      if (streamTimeout) clearTimeout(streamTimeout);
      return fullContent;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (currentChatId === chatId) {
        setIsStreaming(false);
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { 
          ...msg, 
          text: '', 
          isStreaming: false, 
          isError: true,
          isReasoningComplete: true
        } : msg));
      }
      throw error;
    }
  }, [chatId, messages]);

  const handleSend = useCallback(async (text?: string, options?: SendOptions) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: Date.now(),
      modelType: options?.modelType,
      webSearch: options?.webSearch,
      reasoning: options?.reasoning,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setHasStartedChat(true);

    try {
      // Use streaming API with new options
      const modelType = options?.modelType || 'GPT-4';
      console.log('Sending message with model:', modelType, 'options:', options);
      await handleStreamingMessage(messageText, modelType, { ...options, user: options?.user });
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید. ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'ai',
        timestamp: Date.now(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, handleStreamingMessage]);

  const handleSelectAnswer = useCallback((messageId: number, selectedText: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: selectedText }
          : msg
      )
    );
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setStreamingError(null);
  }, []);

  const retryStreamingMessage = useCallback(async (options?: { continueLast?: boolean }) => {
    if (options?.continueLast && messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
      if (lastUserMessage) {
        const sendOptions: SendOptions = {
          modelType: lastUserMessage.modelType,
          webSearch: lastUserMessage.webSearch,
          reasoning: lastUserMessage.reasoning,
        };
        await handleSend(lastUserMessage.text, sendOptions);
      }
    }
  }, [messages, handleSend]);

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    handleSend,
    handleSelectAnswer,
    isLoading,
    isInitializing,
    hasStartedChat,
    setHasStartedChat,
    // Streaming
    isStreaming,
    stopStreaming,
    streamingError,
    retryStreamingMessage,
  };
}