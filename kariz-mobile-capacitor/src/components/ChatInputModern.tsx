import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Zap, X, Image as ImageIcon } from 'lucide-react';
import { LanguageModel } from './ModelDropdown';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import { useKeyboard } from '../hooks/useKeyboard';
import { keyboardInputFix } from '../utils/keyboardInputFix';

interface ChatInputModernProps {
  inputText: string;
  setInputText: (value: string) => void;
  handleSend: (text?: string, options?: { modelType?: string; webSearch?: boolean; reasoning?: boolean }) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  webSearchActive?: boolean;
  reasoningActive?: boolean;
  onShowAuthNotification?: () => void;
  selectedModel?: LanguageModel | null;
  setWebSearchActive?: (value: boolean) => void;
  setReasoningActive?: (value: boolean) => void;
}

function ChatInputModern({
  inputText,
  setInputText,
  handleSend,
  isLoading,
  inputRef,
  webSearchActive = false,
  reasoningActive = false,
  onShowAuthNotification,
  selectedModel,
  setWebSearchActive,
  setReasoningActive,
}: ChatInputModernProps) {
  // Local state for input text to avoid conflicts
  const [localInputText, setLocalInputText] = useState(inputText || '');
  const [reasoning, setReasoning] = useState(reasoningActive);
  const [webSearch, setWebSearch] = useState(webSearchActive);
  const [file, setFile] = useState<File | null>(null);
  const [textareaHeight, setTextareaHeight] = useState(20);
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { scrollToInput } = useKeyboard();

  // Check if current model supports reasoning and web search
  const supportsReasoning = selectedModel?.features?.supportsReasoning || false;
  const supportsWebSearch = selectedModel?.features?.supportsWebSearch || false;

  useEffect(() => {
    setReasoning(reasoningActive)
  }, [reasoningActive])
  useEffect(() => {
    setWebSearch(webSearchActive)
  }, [webSearchActive])

  // Monitor input text changes for debugging
  useEffect(() => {
    console.log('ChatInputModern - inputText changed:', inputText, 'Length:', inputText?.length || 0);
  }, [inputText]);

  // Sync local input text with prop (but only when it's actually different)
  useEffect(() => {
    if (inputText !== localInputText) {
      console.log('Syncing local state with prop:', inputText, '->', localInputText);
      setLocalInputText(inputText || '');
    }
  }, [inputText, localInputText]);

  // Simplified input handling - remove complex observers that can interfere with input methods
  useEffect(() => {
    if (!inputRef.current) return;
    
    const textarea = inputRef.current;
    
    // Simple periodic sync as fallback only
    const interval = setInterval(() => {
      if (textarea.value !== localInputText) {
        setLocalInputText(textarea.value);
        setInputText(textarea.value);
      }
    }, 500); // Less frequent to avoid interference
    
    return () => {
      clearInterval(interval);
    };
  }, [localInputText, inputRef]);

  // Register textarea with keyboard input fix and force update textarea value when localInputText changes
  useEffect(() => {
    if (inputRef.current) {
      // Register with keyboard input fix for enhanced handling
      keyboardInputFix.registerInput(inputRef.current);
      
      // Force update textarea value
      if (inputRef.current.value !== localInputText) {
        console.log('Forcing textarea value update:', localInputText);
        inputRef.current.value = localInputText;
      }
    }
    
    return () => {
      if (inputRef.current) {
        keyboardInputFix.unregisterInput(inputRef.current);
      }
    };
  }, [localInputText, inputRef]);

  // Reset capabilities when model changes
  useEffect(() => {
    if (!supportsReasoning) {
      setReasoning(false);
    }
    if (!supportsWebSearch) {
      setWebSearch(false);
    }
  }, [selectedModel, supportsReasoning, supportsWebSearch]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 20; // Approximate line height
      const maxHeight = lineHeight * 4; // Max 4 lines
      
      const newHeight = Math.min(scrollHeight, maxHeight);
      setTextareaHeight(newHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Add scroll if content exceeds max height
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [localInputText, inputRef]);

  function handleReasoningToggle() { 
    if (supportsReasoning) {
      const newValue = !reasoning;
      setReasoning(newValue);
      setReasoningActive?.(newValue);
    }
  }
  
  function handleWebSearchToggle() { 
    if (supportsWebSearch) {
      const newValue = !webSearch;
      setWebSearch(newValue);
      setWebSearchActive?.(newValue);
    }
  }
  
  function handleRemoveFile() { setFile(null) }
  
  function handleKeyPress(e: React.KeyboardEvent) {
    // Prevent all keyboard events from bubbling to avoid conflicts with back button handler
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && localInputText.trim().length > 0) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function handleSendMessage() {
    handleSend(localInputText, {
      modelType: selectedModel?.shortName || 'gpt-4',
      webSearch: webSearch,
      reasoning: reasoning
    });
  }

  function handleImageGenerationClick() {
    // Check if user is authenticated
    if (!user || !user.accessToken) {
      // Show auth notification
      if (onShowAuthNotification) {
        onShowAuthNotification();
      }
    } else {
      // Navigate to image generation page
      navigate('image');
    }
  }

  return (
    <div 
      className="w-full" 
      dir="rtl"
      style={{
        // Simple layout without keyboard handling
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Wrapper with background and border */}
      <div 
        className="w-full rounded-2xl mb-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-1 flex flex-col gap-2 relative transition-shadow duration-200"
        style={{
          // Simple styling without keyboard handling
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {/* Input Section */}
        <div className="w-full flex gap-2 mb-0 relative items-end">
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={localInputText}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalInputText(newValue);
              setInputText(newValue);
            }}
            onKeyDown={handleKeyPress}
            onInput={(e) => {
              // Fallback for input method editors and some mobile keyboards
              const target = e.target as HTMLTextAreaElement;
              const newValue = target.value;
              if (newValue !== localInputText) {
                setLocalInputText(newValue);
                setInputText(newValue);
              }
            }}
            onCompositionEnd={(e) => {
              // Handle composition for languages like Chinese, Japanese, Korean
              const target = e.target as HTMLTextAreaElement;
              const newValue = target.value;
              setLocalInputText(newValue);
              setInputText(newValue);
            }}
            onFocus={() => {
              // Handle focus for mobile keyboard
              if (Capacitor.isNativePlatform()) {
                // Scroll to input when focused using our custom hook
                setTimeout(() => {
                  if (inputRef.current) {
                    scrollToInput(inputRef.current);
                  }
                }, 300);
              }
            }}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 resize-none border-none outline-none bg-transparent pb-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-relaxed overflow-y-auto font-sans"
            style={{ 
              direction: 'rtl',
              textAlign: 'right',
              height: `${textareaHeight}px`,
              minHeight: '20px',
              maxHeight: '80px', // 4 lines * 20px
              unicodeBidi: 'embed',
              wordBreak: 'normal',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
            disabled={isLoading}
            rows={1}
            dir="rtl"
            lang="fa"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {/* Send Button for mobile */}
            <button
              type="button"
              className="rounded-full w-10 h-10 mt-2 bg-blue-600 text-white disabled:opacity-60 disabled:bg-gray-400 disabled:text-gray-200  transition-all border-2 border-blue-700 disabled:border-gray-400 flex items-center justify-center"
              onClick={handleSendMessage}
              disabled={isLoading || localInputText.trim().length === 0}
              aria-label="ارسال پیام"
            >
              <Send size={18} />
            </button>
          
        </div>
        {/* Options Row */}
        <div className="flex w-full items-center gap-2 mt-0 mb-0 flex-row  justify-start">
          {/* Reasoning Toggle */}
          <div
            className={`rounded-full px-2 py-2 flex items-center gap-1 font-bold transition-all duration-200 group border ${
              reasoning 
                ? 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-purple-600 dark:border-purple-700' 
                : supportsReasoning
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
            } text-xs min-w-[0]`}
            onClick={handleReasoningToggle}
            title={supportsReasoning ? 'استدلال هوشمند' : 'این مدل از استدلال پشتیبانی نمی‌کند'}
          >
            <Zap size={14} className="mr-1" />
            <span>استدلال</span>
          </div>
          {/* Web Search Toggle */}
          <div
            className={`rounded-full px-2 py-2 flex items-center gap-1 font-bold transition-all duration-200 group border ${
              webSearch 
                ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white border-blue-600 dark:border-blue-700' 
                : supportsWebSearch
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
            } text-xs min-w-[0]`}
            onClick={handleWebSearchToggle}
            title={supportsWebSearch ? 'جست‌وجو در وب' : 'این مدل از جست‌وجو در وب پشتیبانی نمی‌کند'}
          >
            <Globe size={14} className="mr-1" />
            <span>جست‌و‌جو</span>
          </div>
          {/* Image Generation Button */}
          <div
            className="rounded-full px-2 py-2 flex items-center gap-1 font-bold transition-all group bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs min-w-[0] border border-gray-300 dark:border-gray-600"
            onClick={handleImageGenerationClick}
          >
            <ImageIcon size={14} className="mr-1" />
            <span>تولید تصویر</span>
          </div>
          {file && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 ml-2">
              <span className="truncate max-w-[120px] text-xs text-blue-700 dark:text-blue-300">{file.name}</span>
              <button type="button" className="p-0 ml-1" onClick={handleRemoveFile} aria-label="حذف فایل">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatInputModern; 