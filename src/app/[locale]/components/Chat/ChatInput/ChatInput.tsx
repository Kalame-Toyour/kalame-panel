import type { ChatInputProps } from '@/types';
import { checkTextDirection } from '@/libs/textUtils';
import { Send, Sparkles, Bot, ChevronDown, Brain, Zap } from 'lucide-react';
import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import DynamicTextarea from './DynamicTextarea';
import { motion } from 'framer-motion';

const MODELS = [
  { label: 'GPT-4', value: 'gpt-4', icon: <Sparkles size={18} /> },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', icon: <Bot size={18} /> },
  { label: 'Claude', value: 'claude', icon: <Brain size={18} /> },
  { label: 'Gemini', value: 'gemini', icon: <Zap size={18} /> },
];

const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  handleSend,
  isLoading,
}) => {
  const locale = useLocale();
  const [isRTL, setIsRTL] = useState(locale === 'fa');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.value || 'gpt-4');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  useEffect(() => {
    setIsRTL(checkTextDirection(inputText, isRTL));
  }, [inputText, isRTL]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.model-dropdown-container')) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="flex w-full flex-col items-center justify-center bg-transparent px-2 py-4 md:max-w-[100%] mx-auto"
      dir={locale === 'fa' ? 'rtl' : 'ltr'}
    >
      {/* Chat Input Bar */}
      <div
        className="flex w-full items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800 gap-2"
      >
        {/* Model Select Dropdown - inside input bar, left in RTL, right in LTR */}
        {locale === 'fa' && (
          <div className="relative model-dropdown-container">
            <button
              className="flex items-center justify-center w-12 h-8 rounded-full border border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none p-0"
              onClick={() => setShowModelDropdown(v => !v)}
              tabIndex={0}
              aria-label="انتخاب مدل هوش مصنوعی"
              type="button"
              style={{ lineHeight: 0 }}
            >
              <span className="flex items-center justify-center w-5 h-5">
                {MODELS.find(m => m.value === selectedModel)?.icon}
              </span>
              <ChevronDown size={15} className="ml-0.5 rtl:mr-0.5 text-gray-400 dark:text-gray-500" />
            </button>
            {showModelDropdown && (
              <div className="absolute z-50 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg right-0 bottom-full mb-2">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">مدل پاسخگویی را انتخاب کنید</h3>
                </div>
                <div className="py-1">
                  {MODELS.map(model => (
                    <button
                      key={model.value}
                      className={`flex items-center w-full px-3 py-2 gap-2 text-sm rounded-lg transition-all text-right hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedModel === model.value ? 'bg-blue-50 dark:bg-blue-900 font-bold' : ''}`}
                      onClick={() => {
                        setSelectedModel(model.value);
                        setShowModelDropdown(false);
                      }}
                      type="button"
                    >
                      {model.icon}
                      <span>{model.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <DynamicTextarea
          inputText={inputText}
          setInputText={setInputText}
          handleKeyPress={handleKeyPress}
          isRTL={isRTL}
          isLoading={isLoading}
        />
        {/* Model Select for LTR (English) */}
        {locale !== 'fa' && (
          <div className="relative model-dropdown-container">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none p-0"
              onClick={() => setShowModelDropdown(v => !v)}
              tabIndex={0}
              aria-label="Select AI model"
              type="button"
              style={{ lineHeight: 0 }}
            >
              <span className="flex items-center justify-center w-5 h-5">
                {MODELS.find(m => m.value === selectedModel)?.icon}
              </span>
              <ChevronDown size={15} className="mr-1 rtl:ml-1 text-gray-400 dark:text-gray-500" />
            </button>
            {showModelDropdown && (
              <div className="absolute z-50 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg left-0 bottom-full mb-2">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Response Model</h3>
                </div>
                <div className="py-1">
                  {MODELS.map(model => (
                    <button
                      key={model.value}
                      className={`flex items-center w-full px-3 py-2 gap-2 text-sm rounded-lg transition-all text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedModel === model.value ? 'bg-blue-50 dark:bg-blue-900 font-bold' : ''}`}
                      onClick={() => {
                        setSelectedModel(model.value);
                        setShowModelDropdown(false);
                      }}
                      type="button"
                    >
                      {model.icon}
                      <span>{model.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <button
          className="ml-2 rounded-full bg-black p-2 text-white transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          onClick={() => handleSend()}
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="flex items-center justify-center"
            >
              <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="white" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="white"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </motion.span>
          ) : (
            <Send size={22} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
