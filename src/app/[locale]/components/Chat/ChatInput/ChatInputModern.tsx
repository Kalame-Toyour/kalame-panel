import React, { useState, useEffect } from 'react';
import { Send, Globe, Zap, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { useLocale } from 'next-intl';
import DynamicTextarea from './DynamicTextarea';
import { useRouter } from 'next/navigation';
import { useModel } from '../../../contexts/ModelContext';
import { useTutorial } from '../../../contexts/TutorialContext';
import TutorialDialog from './TutorialDialog';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

interface ChatInputModernProps {
  inputText: string;
  setInputText: (value: string) => void;
  handleSend: (text?: string, options?: { modelType?: string; webSearch?: boolean; reasoning?: boolean }) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  webSearchActive?: boolean;
  reasoningActive?: boolean;
  onShowAuthNotification?: () => void;
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
}: ChatInputModernProps) {
  const locale = useLocale();
  const router = useRouter();
  const { selectedModel } = useModel();
  const { user } = useAuth();
  const { 
    hasSeenReasoningTutorial, 
    hasSeenWebSearchTutorial, 
    setHasSeenReasoningTutorial, 
    setHasSeenWebSearchTutorial 
  } = useTutorial();
  
  const [isRTL, setIsRTL] = useState(locale === 'fa');
  const [reasoning, setReasoning] = useState(reasoningActive);
  const [webSearch, setWebSearch] = useState(webSearchActive);
  const [file, setFile] = useState<File | null>(null);
  const [tutorialDialog, setTutorialDialog] = useState<'reasoning' | 'webSearch' | null>(null);

  // Detect RTL dynamically
  useEffect(() => {
    setIsRTL(locale === 'fa' || (/^[\u0600-\u06FF\s]+$/.test(inputText) && inputText.length > 0));
  }, [inputText, locale]);

  useEffect(() => {
    setReasoning(reasoningActive)
  }, [reasoningActive])
  useEffect(() => {
    setWebSearch(webSearchActive)
  }, [webSearchActive])

  function handleReasoningToggle() { 
    if (!selectedModel?.features?.supportsReasoning) {
      toast.error('مدل انتخاب شده از قابلیت استدلال پشتیبانی نمی‌کند');
      return;
    }
    
    // Show tutorial if user hasn't seen it before
    if (!hasSeenReasoningTutorial) {
      setTutorialDialog('reasoning');
      setHasSeenReasoningTutorial(true);
      return;
    }
    
    setReasoning(v => !v);
  }
  
  function handleWebSearchToggle() { 
    if (!selectedModel?.features?.supportsWebSearch) {
      toast.error('مدل انتخاب شده از قابلیت جست‌وجو در وب پشتیبانی نمی‌کند');
      return;
    }
    
    // Show tutorial if user hasn't seen it before
    if (!hasSeenWebSearchTutorial) {
      setTutorialDialog('webSearch');
      setHasSeenWebSearchTutorial(true);
      return;
    }
    
    setWebSearch(v => !v);
  }
  
  function handleTutorialClose() {
    setTutorialDialog(null);
    
    // Activate the button after tutorial is closed
    if (tutorialDialog === 'reasoning') {
      setReasoning(true);
    } else if (tutorialDialog === 'webSearch') {
      setWebSearch(true);
    }
  }
  
  function handleRemoveFile() { setFile(null) }
  
  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && inputText.trim().length > 0) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function handleSendMessage() {
    if (!selectedModel) return;
    
    handleSend(inputText, {
      modelType: selectedModel.shortName,
      webSearch,
      reasoning
    });
  }

  function handleImageGenerationClick() {
    if (!user) {
      // Show auth notification instead of navigating
      if (onShowAuthNotification) {
        onShowAuthNotification();
      }
      return;
    }
    
    // Navigate to image generation page if user is logged in
    router.push('/image');
  }

  return (
    <>
      <div className="w-full md:max-w-4xl bg-transparent pb-2 md:pr-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Wrapper with background and border */}
        <div className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-2 relative transition-shadow duration-200">
          {/* Input Section */}
          <div className="w-full flex gap-2 mb-0 relative items-end">
            {/* Textarea */}
            <DynamicTextarea
              ref={inputRef}
              inputText={inputText}
              setInputText={setInputText}
              handleKeyPress={handleKeyPress}
              isRTL={isRTL}
              isLoading={isLoading}
            />
            {/* Send/Mic Button for mobile */}
            <div className="sm:hidden flex items-center self-end">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="rounded-full w-10 h-10 bg-black text-white shadow-lg hover:bg-blue-900 hover:text-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-60 transition-all border-2 border-blue-900"
                onClick={handleSendMessage}
                disabled={isLoading || inputText.trim().length === 0}
                aria-label="ارسال پیام"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
          {/* Options Row + Dropdown */}
          <div className="flex w-full items-center gap-2 mt-0 mb-0 sm:gap-2 sm:flex-row flex-row flex-nowrap justify-start sm:justify-start">
            {/* Reasoning Toggle */}
            <Button
              type="button"
              variant={reasoning ? 'secondary' : 'outline'}
              size="sm"
              disabled={!selectedModel?.features?.supportsReasoning}
              className={`rounded-full px-2 py-1 flex items-center gap-1 font-bold transition-all group ${
                !selectedModel?.features?.supportsReasoning 
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed opacity-60' 
                  : reasoning 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200'
              } focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm min-w-[0]`}
              onClick={handleReasoningToggle}
            >
              <Zap size={14} className="mr-1" />
              <span>استدلال</span>
            </Button>
            {/* Web Search Toggle */}
            <Button
              type="button"
              variant={webSearch ? 'secondary' : 'outline'}
              size="sm"
              disabled={!selectedModel?.features?.supportsWebSearch}
              className={`rounded-full px-2 py-1 flex items-center gap-1 font-bold transition-all group ${
                !selectedModel?.features?.supportsWebSearch 
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed opacity-60' 
                  : webSearch 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200'
              } focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm min-w-[0]`}
              onClick={handleWebSearchToggle}
            >
              <Globe size={14} className="mr-1" />
              <span>جست‌و‌جو</span>
            </Button>
            {/* Image Generation Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-2 py-1 flex items-center gap-1 font-bold transition-all group bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm min-w-[0]"
              onClick={handleImageGenerationClick}
            >
              <ImageIcon size={14} className="mr-1" />
              <span>تولید تصویر</span>
            </Button>
            {/* File Upload */}
            {/* <label htmlFor="file-upload-chat" className="flex items-center cursor-pointer rounded-full px-3 py-1 font-bold gap-1 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 focus:ring-2 focus:ring-blue-400 transition-all group">
              <Upload size={16} className="mr-1 rtl:ml-1" />
              <span>فایل</span>
              <input
                id="file-upload-chat"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label> */}
            {file && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 ml-2">
                <span className="truncate max-w-[120px] text-xs text-blue-700 dark:text-blue-300">{file.name}</span>
                <Button type="button" size="icon" variant="ghost" className="p-0 ml-1" onClick={handleRemoveFile} aria-label="حذف فایل">
                  <X size={16} />
                </Button>
              </div>
            )}
            {/* {fileError && <span className="text-xs text-red-500 ml-2">{fileError}</span>} */}
           {/* Send/Mic Button - vertically centered between rows, left side (desktop only) */}
           <div className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 items-center">
               <Button
                 type="button"
                 variant="secondary"
                 size="icon"
                 className="rounded-full w-12 h-12 bg-black text-white shadow-lg hover:bg-blue-900 hover:text-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-60 transition-all border-2 border-blue-900"
                 onClick={handleSendMessage}
                 disabled={isLoading || inputText.trim().length === 0}
                 aria-label="ارسال پیام"
               >
                 <Send size={26} />
               </Button>
           </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial Dialog */}
      <TutorialDialog
        isOpen={tutorialDialog !== null}
        onClose={handleTutorialClose}
        type={tutorialDialog || 'reasoning'}
      />
    </>
  )
}

export default ChatInputModern; 