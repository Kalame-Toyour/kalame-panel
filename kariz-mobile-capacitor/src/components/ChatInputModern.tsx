import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Zap, X, Image as ImageIcon } from 'lucide-react';
import { LanguageModel } from './ModelDropdown';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import { useKeyboard } from '../hooks/useKeyboard';

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
  isKeyboardVisible?: boolean;
  keyboardHeight?: number;
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
  isKeyboardVisible = false,
  keyboardHeight = 0,
}: ChatInputModernProps) {
  // Local state for input text to avoid conflicts
  const [localInputText, setLocalInputText] = useState(inputText || '');
  const [reasoning, setReasoning] = useState(reasoningActive);
  const [webSearch, setWebSearch] = useState(webSearchActive);
  const [file, setFile] = useState<File | null>(null);
  const [textareaHeight, setTextareaHeight] = useState(20);
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { isVisible: hookIsKeyboardVisible, height: hookKeyboardHeight, scrollToInput } = useKeyboard();

  // Use props if provided, otherwise fall back to hook values
  const finalIsKeyboardVisible = isKeyboardVisible !== undefined ? isKeyboardVisible : hookIsKeyboardVisible;
  const finalKeyboardHeight = keyboardHeight !== undefined ? keyboardHeight : hookKeyboardHeight;

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



  // Monitor textarea value changes using MutationObserver
  useEffect(() => {
    if (!inputRef.current) return;
    
    const textarea = inputRef.current;
    
    // Create a MutationObserver to watch for value changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const newValue = textarea.value;
          console.log('MutationObserver detected value change:', newValue);
          if (newValue !== localInputText) {
            setLocalInputText(newValue);
            setInputText(newValue);
          }
        }
      });
    });
    
    // Start observing
    observer.observe(textarea, {
      attributes: true,
      attributeFilter: ['value']
    });
    
    // Also set up a periodic check for value changes
    const interval = setInterval(() => {
      if (textarea.value !== localInputText) {
        console.log('Periodic check detected value change:', textarea.value, '->', localInputText);
        setLocalInputText(textarea.value);
        setInputText(textarea.value);
      }
    }, 100);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [localInputText, inputRef]);

  // Force update textarea value when localInputText changes
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== localInputText) {
      console.log('Forcing textarea value update:', localInputText);
      inputRef.current.value = localInputText;
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
    // Stop propagation so global listeners (e.g., app back handler) never see Backspace while typing
    if (e.key === 'Backspace') e.stopPropagation()
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
        // Simple positioning since app is repositioned
        position: 'relative',
        // Use flexbox for proper layout
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        // Ensure the container adapts to available space
        width: '100%',
        maxWidth: '100%',
        // Add smooth transitions
        transition: 'all 0.3s ease-in-out'
      }}
    >
      {/* Wrapper with background and border */}
      <div 
        className="w-full rounded-2xl mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-1 flex flex-col gap-2 relative transition-shadow duration-200"
        style={{
          // Ensure proper positioning and visibility
          position: 'relative',
          zIndex: 10,
          // Use flexbox for proper content layout
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          // Ensure the container doesn't cause layout issues
          minHeight: 'auto',
          maxHeight: 'none',
          // Add smooth transitions
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Input Section */}
        <div className="w-full flex gap-2 mb-0 relative items-end">
          {/* Textarea */}
          <textarea
            ref={inputRef}
            defaultValue={localInputText}
            onBeforeInput={() => {
              // Handle before input if needed
            }}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalInputText(newValue);
              setInputText(newValue);
            }}
            onKeyDown={handleKeyPress}
            onKeyPress={() => {
              // Handle key press if needed
            }}
            onKeyUp={() => {
              // Handle key up if needed
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              const newValue = target.value;
              setLocalInputText(newValue);
              setInputText(newValue);
            }}
            onCompositionStart={() => {
              // Handle composition start if needed
            }}
            onCompositionUpdate={(e) => {
              const target = e.target as HTMLTextAreaElement;
              const newValue = target.value;
              setLocalInputText(newValue);
              setInputText(newValue);
            }}
            onCompositionEnd={(e) => {
              const target = e.target as HTMLTextAreaElement;
              const newValue = target.value;
              setLocalInputText(newValue);
              setInputText(newValue);
            }}
            onBlur={(e) => {
              // Sync on blur to ensure final state
              const target = e.target as HTMLTextAreaElement;
              if (target.value !== localInputText) {
                setLocalInputText(target.value);
                setInputText(target.value);
              }
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
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              const newValue = localInputText + pastedText;
              setLocalInputText(newValue);
              setInputText(newValue);
            }}
            onCut={() => {
              console.log('Cut event');
            }}
            onSelect={() => {
              console.log('Select event');
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
              className="rounded-full w-10 h-10 mt-2 bg-black text-white shadow-lg hover:bg-blue-900 hover:text-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-60 transition-all border-2 border-blue-900 flex items-center justify-center"
              onClick={handleSendMessage}
              disabled={isLoading || localInputText.trim().length === 0}
              aria-label="ارسال پیام"
            >
              <Send size={18} />
            </button>
          
        </div>
        {/* Options Row */}
        <div className="flex w-full items-center gap-2 mt-0 mb-0 flex-row flex-nowrap justify-start">
          {/* Reasoning Toggle */}
          <button
            type="button"
            className={`rounded-full px-2 py-1 flex items-center gap-1 font-bold transition-all group border reasoning-button ${
              reasoning 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-600' 
                : supportsReasoning
                  ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 border-gray-300 dark:border-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
            } text-xs min-w-[0]`}
            onClick={handleReasoningToggle}
            disabled={!supportsReasoning}
            title={supportsReasoning ? 'استدلال هوشمند' : 'این مدل از استدلال پشتیبانی نمی‌کند'}
          >
            <Zap size={14} className="mr-1" />
            <span>استدلال</span>
          </button>
          {/* Web Search Toggle */}
          <button
            type="button"
            className={`rounded-full px-2 py-1 flex items-center gap-1 font-bold transition-all group border websearch-button ${
              webSearch 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-600' 
                : supportsWebSearch
                  ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 border-gray-300 dark:border-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
            } text-xs min-w-[0]`}
            onClick={handleWebSearchToggle}
            disabled={!supportsWebSearch}
            title={supportsWebSearch ? 'جست‌وجو در وب' : 'این مدل از جست‌وجو در وب پشتیبانی نمی‌کند'}
          >
            <Globe size={14} className="mr-1" />
            <span>جست‌و‌جو</span>
          </button>
          {/* Image Generation Button */}
          <button
            type="button"
            className="rounded-full px-2 py-1 flex items-center gap-1 font-bold transition-all group bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400 text-xs min-w-[0] border border-gray-300 dark:border-gray-600"
            onClick={handleImageGenerationClick}
          >
            <ImageIcon size={14} className="mr-1" />
            <span>تولید تصویر</span>
          </button>
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