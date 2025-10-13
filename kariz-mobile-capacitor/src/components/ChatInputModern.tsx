import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Zap, X, Image as ImageIcon } from 'lucide-react';
import { LanguageModel } from './ModelDropdown';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import { useKeyboard } from '../hooks/useKeyboard';
import { useDynamicContent } from '../utils/dynamicContent';

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
  const [localInputText, setLocalInputText] = useState(inputText || '');
  const [reasoning, setReasoning] = useState(reasoningActive);
  const [webSearch, setWebSearch] = useState(webSearchActive);
  const [file, setFile] = useState<File | null>(null);
  const [textareaHeight, setTextareaHeight] = useState(20);
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { scrollToInput } = useKeyboard();
  const content = useDynamicContent();

  const supportsReasoning = selectedModel?.features?.supportsReasoning || false;
  const supportsWebSearch = selectedModel?.features?.supportsWebSearch || false;

  useEffect(() => {
    setReasoning(reasoningActive);
  }, [reasoningActive]);
  
  useEffect(() => {
    setWebSearch(webSearchActive);
  }, [webSearchActive]);

  // Sync with parent component
  useEffect(() => {
    if (inputText !== localInputText) {
      setLocalInputText(inputText || '');
    }
  }, [inputText]);

  // SWIFTKEY FIX: Simplified approach using only DOM polling
  useEffect(() => {
    if (!inputRef.current) return;
    
    const textarea = inputRef.current;
    let lastValue = textarea.value;
    
    // Continuous monitoring for SwiftKey compatibility
    const pollForChanges = () => {
      const currentValue = textarea.value;
      
      if (currentValue !== lastValue) {
        console.log('[SwiftKey Poll] Change detected:', {
          old: lastValue, 
          new: currentValue,
          length: currentValue.length
        });
        
        lastValue = currentValue;
        setLocalInputText(currentValue);
        setInputText(currentValue);
      }
    };
    
    // Poll every 30ms for responsive SwiftKey support
    const pollInterval = setInterval(pollForChanges, 30);
    
    // Also check on any activity
    const activityEvents = ['keydown', 'keyup', 'input', 'textInput', 'beforeinput'];
    
    const handleActivity = () => {
      // Check after a brief delay to catch SwiftKey changes
      setTimeout(pollForChanges, 0);
      setTimeout(pollForChanges, 10);
      setTimeout(pollForChanges, 50);
    };
    
    activityEvents.forEach(event => {
      textarea.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      clearInterval(pollInterval);
      activityEvents.forEach(event => {
        textarea.removeEventListener(event, handleActivity);
      });
    };
  }, [setInputText]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 20;
      const maxHeight = lineHeight * 4;
      
      const newHeight = Math.min(scrollHeight, maxHeight);
      setTextareaHeight(newHeight);
      textarea.style.height = `${newHeight}px`;
      
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [localInputText]);

  // Reset capabilities when model changes
  useEffect(() => {
    if (!supportsReasoning) {
      setReasoning(false);
    }
    if (!supportsWebSearch) {
      setWebSearch(false);
    }
  }, [selectedModel, supportsReasoning, supportsWebSearch]);

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
  
  function handleRemoveFile() { 
    setFile(null);
  }
  
  function handleKeyPress(e: React.KeyboardEvent) {
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && localInputText.trim().length > 0) {
      e.preventDefault();
      handleSendMessage();
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
    if (!user || !user.accessToken) {
      if (onShowAuthNotification) {
        onShowAuthNotification();
      }
    } else {
      navigate('image');
    }
  }

  // MINIMAL React change handler
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // Let the polling system handle updates - this is just for immediate React sync
    const newValue = e.target.value;
    setLocalInputText(newValue);
  }

  return (
    <div 
      className="w-full" 
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <div 
        className="w-full rounded-2xl mb-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-1 flex flex-col gap-2 relative transition-shadow duration-200"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        <div className="w-full flex gap-2 mb-0 relative items-end">
          {/* SwiftKey optimized textarea */}
          <textarea
            ref={inputRef}
            value={localInputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              if (Capacitor.isNativePlatform()) {
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
              maxHeight: '80px',
              unicodeBidi: 'plaintext',
              wordBreak: 'normal',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
            disabled={isLoading}
            rows={1}
            dir="auto"
            inputMode="text"
            enterKeyHint="send"
            // SwiftKey specific optimizations
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
            autoCapitalize="off"
          />
          
          <button
            type="button"
            className={`rounded-full w-10 h-10 mt-2 text-white disabled:opacity-60 disabled:bg-gray-400 disabled:text-gray-200 transition-all border-2 disabled:border-gray-400 flex items-center justify-center ${
              content.brandName === 'کلمه'
                ? 'bg-blue-600 border-blue-700'
                : 'bg-purple-600 border-purple-700'
            }`}
            onClick={handleSendMessage}
            disabled={isLoading || localInputText.trim().length === 0}
            aria-label="ارسال پیام"
          >
            <Send size={18} />
          </button>
        </div>
        
        <div className="flex w-full items-center gap-2 mt-0 mb-0 flex-row justify-start">
          <div
            className={`rounded-full px-2 py-2 flex items-center gap-1 font-bold transition-all duration-200 group border ${
              reasoning 
                ? content.brandName === 'کلمه'
                  ? 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-purple-600 dark:border-purple-700'
                  : 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-purple-600 dark:border-purple-700'
                : supportsReasoning
                  ? content.brandName === 'کلمه'
                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
            } text-xs min-w-[0]`}
            onClick={handleReasoningToggle}
            title={supportsReasoning ? 'استدلال هوشمند' : 'این مدل از استدلال پشتیبانی نمی‌کند'}
          >
            <Zap size={14} className="mr-1" />
            <span>استدلال</span>
          </div>
          
          <div
            className={`rounded-full px-2 py-2 flex items-center gap-1 font-bold transition-all duration-200 group border ${
              webSearch 
                ? content.brandName === 'کلمه'
                  ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white border-blue-600 dark:border-blue-700'
                  : 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-purple-600 dark:border-purple-700'
                : supportsWebSearch
                  ? content.brandName === 'کلمه'
                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
            } text-xs min-w-[0]`}
            onClick={handleWebSearchToggle}
            title={supportsWebSearch ? 'جست‌وجو در وب' : 'این مدل از جست‌وجو در وب پشتیبانی نمی‌کند'}
          >
            <Globe size={14} className="mr-1" />
            <span>جست‌و‌جو</span>
          </div>
          
          <div
            className={`rounded-full px-2 py-2 flex items-center gap-1 font-bold transition-all group text-xs min-w-[0] border ${
              content.brandName === 'کلمه'
                ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
            onClick={handleImageGenerationClick}
          >
            <ImageIcon size={14} className="mr-1" />
            <span>تولید تصویر</span>
          </div>
          
          {file && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 ml-2">
              <span className={`truncate max-w-[120px] text-xs ${
                content.brandName === 'کلمه'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-purple-700 dark:text-purple-300'
              }`}>{file.name}</span>
              <button type="button" className="p-0 ml-1" onClick={handleRemoveFile} aria-label="حذف فایل">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInputModern;