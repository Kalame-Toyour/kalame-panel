import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Zap, X, Image as ImageIcon, Upload, FileText, FileImage, Trash2 } from 'lucide-react';
import { LanguageModel } from './ModelDropdown';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import { useKeyboard } from '../hooks/useKeyboard';
import { useDynamicContent } from '../utils/dynamicContent';
import UploadProgress from './UploadProgress';
import { mobileFileUploadService, UploadProgress as UploadProgressType } from '../services/fileUpload';
import { filePermissionManager } from '../utils/filePermissions';

interface ChatInputModernProps {
  inputText: string;
  setInputText: (value: string) => void;
  handleSend: (text?: string, options?: { 
    modelType?: string; 
    webSearch?: boolean; 
    reasoning?: boolean; 
    fileUrl?: string;
    fileType?: 'image' | 'pdf';
    fileName?: string;
    fileSize?: number;
  }) => void;
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
  const [minHeight, setMinHeight] = useState('20px');
  const [maxHeight, setMaxHeight] = useState('60px');
  const [textareaHeight, setTextareaHeight] = useState(20);
  const [overflow, setOverflow] = useState(false);
  const [fileTypeDialog, setFileTypeDialog] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const shadowRef = useRef<HTMLTextAreaElement>(null);
   const { navigate } = useRouter();
  const { user } = useAuth();
  const { scrollToInput } = useKeyboard();
  const content = useDynamicContent();

  const MAX_ROWS = 3;
  const LINE_HEIGHT = 20;

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

  // Setup dynamic textarea height calculation (similar to web version)
  useEffect(() => {
    if (!inputRef.current || !shadowRef.current) return;
    
    const textarea = inputRef.current;
    const shadow = shadowRef.current;
    const style = window.getComputedStyle(textarea);
    
    // Copy styles to shadow textarea
    shadow.style.width = textarea.offsetWidth + 'px';
    shadow.style.fontSize = style.fontSize;
    shadow.style.fontFamily = style.fontFamily;
    shadow.style.fontWeight = style.fontWeight;
    shadow.style.letterSpacing = style.letterSpacing;
    shadow.style.lineHeight = style.lineHeight;
    shadow.style.padding = style.padding;
    shadow.style.border = style.border;
    shadow.style.boxSizing = style.boxSizing;
    shadow.style.direction = style.direction;
    shadow.style.wordBreak = style.wordBreak;
    shadow.style.whiteSpace = style.whiteSpace;
    shadow.style.overflowWrap = style.overflowWrap;
    shadow.style.wordSpacing = style.wordSpacing;
    shadow.style.textIndent = style.textIndent;
  }, []);

  // Calculate dynamic height based on content
  useEffect(() => {
    if (!inputRef.current || !shadowRef.current) return;
    
    const textarea = inputRef.current;
    const shadow = shadowRef.current;
    
    // Calculate single row height
    shadow.value = '';
    shadow.rows = 1;
    shadow.style.height = 'auto';
    const singleRowHeight = shadow.scrollHeight;
    setMinHeight(`${singleRowHeight}px`);
    
    // Calculate max height for 3 rows
    shadow.rows = MAX_ROWS;
    const computedMaxHeight = shadow.scrollHeight;
    setMaxHeight(`${computedMaxHeight}px`);
    
    // Calculate content height
    shadow.rows = 1;
    shadow.value = localInputText || '';
    shadow.style.height = 'auto';
    const contentHeight = shadow.scrollHeight;
    
    // Set final height
    if (contentHeight <= computedMaxHeight) {
      const finalHeight = Math.max(contentHeight, singleRowHeight);
      textarea.style.height = `${finalHeight}px`;
      setTextareaHeight(finalHeight);
      setOverflow(false);
      textarea.style.overflowY = 'hidden';
    } else {
      textarea.style.height = `${computedMaxHeight}px`;
      setTextareaHeight(computedMaxHeight);
      setOverflow(true);
      textarea.style.overflowY = 'auto';
    }
  }, [localInputText, inputRef]);

  // Scroll to bottom when overflow
  useEffect(() => {
    if (overflow && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollTop = inputRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [overflow, localInputText, inputRef]);

  // Reset capabilities when model changes
  useEffect(() => {
    if (!supportsReasoning) {
      setReasoning(false);
    }
    if (!supportsWebSearch) {
      setWebSearch(false);
    }
  }, [selectedModel, supportsReasoning, supportsWebSearch]);

  // Initialize file permissions on mount
  useEffect(() => {
    const initPermissions = async () => {
      try {
        await filePermissionManager.checkFilePermissions();
      } catch (error) {
        console.error('[ChatInputModern] Error initializing file permissions:', error);
      }
    };
    
    initPermissions();
  }, []);

  // Clear file state when chat is cleared
  useEffect(() => {
    const clearHandler = () => {
      handleRemoveFile();
    };
    
    const resetHandler = () => {
      handleRemoveFile();
    };
    
    window.addEventListener('clear-chat-messages', clearHandler);
    window.addEventListener('reset-chat-completely', resetHandler);
    
    return () => {
      window.removeEventListener('clear-chat-messages', clearHandler);
      window.removeEventListener('reset-chat-completely', resetHandler);
    };
  }, []);

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
    setFilePreview(null);
    setUploadProgress(null);
    setUploadedFileUrl(null);
    setIsUploading(false);
    setUploadError(null);
  }

  function handleCancelUpload() {
    if (isUploading) {
      setIsUploading(false);
      setUploadProgress(null);
      setFile(null);
      setFilePreview(null);
      console.log('آپلود فایل لغو شد');
    }
  }

  async function handleFileUploadClick() {
    // Check file permissions first
    const permissions = await filePermissionManager.checkFilePermissions();
    if (!permissions.granted) {
      console.error('دسترسی به فایل‌ها مجاز نیست');
      return;
    }
    
    setFileTypeDialog(true);
  }

  function handleFileTypeSelect(type: 'image' | 'pdf') {
    setFileTypeDialog(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : '.pdf';
    input.onchange = (e) => {
      const selectedFile = (e.target as HTMLInputElement).files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setUploadError(null);
        
        // Create preview for images
        if (type === 'image') {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFilePreview(e.target?.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setFilePreview(null);
        }
        
        // Start upload immediately
        handleFileUpload(selectedFile);
      }
    };
    input.click();
  }

  async function handleFileUpload(file: File) {
    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const result = await mobileFileUploadService.uploadFile(
        file,
        'current-chat', // TODO: Get actual chat ID
        {
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          onSuccess: (result) => {
            setUploadedFileUrl(result.url!);
            setUploadProgress(null);
            setIsUploading(false);
            console.log(`فایل ${file.type.startsWith('image/') ? 'عکس' : 'PDF'} با موفقیت آپلود شد`);
          },
          onError: (error) => {
            setUploadError(error);
            setUploadProgress(null);
            setIsUploading(false);
            console.error(`خطا در آپلود فایل: ${error}`);
          }
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      setUploadProgress(null);
      setIsUploading(false);
      console.error(`خطا در آپلود فایل: ${errorMessage}`);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function handleKeyPress(e: React.KeyboardEvent) {
    e.stopPropagation();
    
    // Allow Enter to create new lines, Shift+Enter to send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && localInputText.trim().length > 0) {
        handleSendMessage();
      }
    }
    // Shift+Enter creates new line (default behavior)
  }

  function handleSendMessage() {
    // Check if file is still uploading
    if (isUploading) {
      console.error('لطفاً صبر کنید تا فایل آپلود شود');
      return;
    }
    
    // Check if there's an upload error
    if (uploadError) {
      console.error('ابتدا مشکل آپلود فایل را حل کنید');
      return;
    }
    
    // Create message with file info if available
    const messageText = localInputText;
    const fileInfo = file && uploadedFileUrl ? {
      fileType: file.type.startsWith('image/') ? 'image' as const : 'pdf' as const,
      fileName: file.name,
      fileSize: file.size
    } : {};

    console.log('Sending message with file info:', {
      fileUrl: uploadedFileUrl,
      fileInfo,
      hasFile: !!file,
      uploadedFileUrl,
      file
    });

    // Send the message
    handleSend(messageText, {
      modelType: selectedModel?.shortName || 'gpt-4',
      webSearch: webSearch,
      reasoning: reasoning,
      fileUrl: uploadedFileUrl || undefined,
      ...fileInfo
    });

    // Clear file state after sending message
    handleRemoveFile();
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

  // MINIMAL React change handler - Allow multi-line up to 3 lines
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // Let the polling system handle updates - this is just for immediate React sync
    const newValue = e.target.value;
    // Allow newlines but limit to reasonable length
    setLocalInputText(newValue);
  }

  return (
    <div 
      className="chat-input-container w-full" 
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        zIndex: 100
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
            className={`flex-1 resize-none border-none outline-none bg-transparent pb-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm font-sans ${
              overflow ? 'overflow-y-auto' : 'overflow-hidden'
            } overflow-x-hidden`}
            style={{ 
              direction: 'rtl',
              textAlign: 'right',
              minHeight: minHeight,
              maxHeight: maxHeight,
              marginBottom: '10px',
              unicodeBidi: 'plaintext',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.5',
              boxSizing: 'border-box'
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
          {/* Hidden shadow textarea for measuring height */}
          <textarea
            ref={shadowRef}
            tabIndex={-1}
            aria-hidden
            rows={1}
            readOnly
            style={{
              position: 'absolute',
              top: 0,
              left: '-9999px',
              height: 0,
              zIndex: -1,
              overflow: 'hidden',
              resize: 'none',
              pointerEvents: 'none',
              visibility: 'hidden',
              boxSizing: 'border-box'
            }}
          />
          
          <button
            type="button"
            className={`rounded-full w-10 h-10 mt-2 text-white disabled:opacity-60 disabled:bg-gray-400 disabled:text-gray-200 transition-all border-2 disabled:border-gray-400 flex items-center justify-center ${
              content.brandName === 'کلمه'
                ? 'bg-blue-600 border-blue-700'
                : 'bg-purple-600 border-purple-700'
            }`}
            onClick={handleSendMessage}
            disabled={isLoading || localInputText.trim().length === 0 || isUploading || !!uploadError}
            aria-label="ارسال پیام"
          >
            <Send size={18} />
          </button>
        </div>
        
        <div className="flex w-full items-center gap-0.5 mt-0 mb-0.5 flex-row justify-start overflow-x-auto">
          <div
            className={`rounded-full px-1 py-2 flex items-center gap-1 font-bold transition-all duration-200 group border ${
              reasoning 
                ? content.brandName === 'کلمه'
                  ? 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-purple-600 dark:border-purple-700'
                  : 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-purple-600 dark:border-purple-700'
                : supportsReasoning
                  ? content.brandName === 'کلمه'
                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
            } text-xs whitespace-nowrap flex-shrink-0`}
            onClick={handleReasoningToggle}
            title={supportsReasoning ? 'استدلال هوشمند' : 'این مدل از استدلال پشتیبانی نمی‌کند'}
          >
            <Zap size={12} className="mr-1" />
            <span className="text-xs">استدلال</span>
          </div>
          
          <div
            className={`rounded-full px-1 py-2 flex items-center gap-1 font-bold transition-all duration-200 group border ${
              webSearch 
                ? content.brandName === 'کلمه'
                  ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white border-blue-600 dark:border-blue-700'
                  : 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-purple-600 dark:border-purple-700'
                : supportsWebSearch
                  ? content.brandName === 'کلمه'
                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
            } text-xs whitespace-nowrap flex-shrink-0`}
            onClick={handleWebSearchToggle}
            title={supportsWebSearch ? 'جست‌وجو در وب' : 'این مدل از جست‌وجو در وب پشتیبانی نمی‌کند'}
          >
            <Globe size={12} className="mr-1" />
            <span className="text-xs">جست‌و‌جو</span>
          </div>
          
          <div
            className={`rounded-full px-1 py-2 flex items-center gap-1 font-bold transition-all group text-xs whitespace-nowrap flex-shrink-0 border ${
              content.brandName === 'کلمه'
                ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
            onClick={handleFileUploadClick}
          >
            <Upload size={12} className="mr-1" />
            <span className="text-xs">آپلود فایل</span>
          </div>
          
          <div
            className={`rounded-full px-1 py-2 flex items-center gap-1 font-bold transition-all group text-xs whitespace-nowrap flex-shrink-0 border ${
              content.brandName === 'کلمه'
                ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
            onClick={handleImageGenerationClick}
          >
            <ImageIcon size={12} className="mr-1" />
            <span className="text-xs">تولید تصویر</span>
          </div>
        </div>
        
        {/* File Preview Section */}
        {file && (
          <>
            {/* Upload Progress */}
            {isUploading && uploadProgress && (
              <UploadProgress
                progress={uploadProgress.percentage}
                filename={file.name}
                fileType={file.type.startsWith('image/') ? 'image' : 'pdf'}
                onCancel={handleCancelUpload}
              />
            )}
            
            {/* Upload Error */}
            {uploadError && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <X size={16} className="text-red-600 dark:text-red-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-red-900 dark:text-red-100">
                      خطا در آپلود فایل
                    </h4>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                      {uploadError}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex-shrink-0 w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors rounded-full flex items-center justify-center"
                    onClick={handleRemoveFile}
                    aria-label="حذف فایل"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {/* File Preview - Only show when upload is complete or not uploading */}
            {!isUploading && !uploadError && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* File Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      file.type.startsWith('image/') 
                        ? content.brandName === 'کلمه'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-purple-100 dark:bg-purple-900'
                        : content.brandName === 'کلمه'
                          ? 'bg-red-100 dark:bg-red-900'
                          : 'bg-orange-100 dark:bg-orange-900'
                    }`}>
                      {file.type.startsWith('image/') ? (
                        <FileImage size={20} className={
                          content.brandName === 'کلمه'
                            ? 'text-blue-600 dark:text-blue-300'
                            : 'text-purple-600 dark:text-purple-300'
                        } />
                      ) : (
                        <FileText size={20} className={
                          content.brandName === 'کلمه'
                            ? 'text-red-600 dark:text-red-300'
                            : 'text-orange-600 dark:text-orange-300'
                        } />
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          file.type.startsWith('image/')
                            ? content.brandName === 'کلمه'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            : content.brandName === 'کلمه'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {file.type.startsWith('image/') ? 'عکس' : 'PDF'}
                        </span>
                        {uploadedFileUrl && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            آماده
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      className="flex-shrink-0 w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-full flex items-center justify-center"
                      onClick={handleRemoveFile}
                      aria-label="حذف فایل"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Image Preview */}
                {filePreview && (
                  <div className="mt-3">
                    <img
                      src={filePreview}
                      alt="پیش‌نمایش فایل"
                      className="w-full max-w-xs mx-auto rounded-lg border border-gray-200 dark:border-gray-600 max-h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* File Type Selection Dialog */}
      {fileTypeDialog && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" 
          style={{ pointerEvents: 'auto' }}
          onClick={() => setFileTypeDialog(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700 relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                نوع فایل را انتخاب کنید
              </h3>
            </div>
            
            <div className="space-y-3">
              {/* Image Upload Option */}
              <button
                onClick={() => handleFileTypeSelect('image')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 hover:scale-[1.02] ${
                  content.brandName === 'کلمه'
                    ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  content.brandName === 'کلمه'
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-purple-100 dark:bg-purple-900'
                }`}>
                  <FileImage size={24} className={
                    content.brandName === 'کلمه'
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-purple-600 dark:text-purple-300'
                  } />
                </div>
                <div className="text-right flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    آپلود عکس
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    JPG, PNG, GIF, WebP
                  </p>
                </div>
              </button>
              
              {/* PDF Upload Option */}
              <button
                onClick={() => handleFileTypeSelect('pdf')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 hover:scale-[1.02] ${
                  content.brandName === 'کلمه'
                    ? 'border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  content.brandName === 'کلمه'
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-orange-100 dark:bg-orange-900'
                }`}>
                  <FileText size={24} className={
                    content.brandName === 'کلمه'
                      ? 'text-red-600 dark:text-red-300'
                      : 'text-orange-600 dark:text-orange-300'
                  } />
                </div>
                <div className="text-right flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    آپلود PDF
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    فایل‌های PDF
                  </p>
                </div>
              </button>
            </div>
            
            {/* Cancel Button */}
            <button
              onClick={() => setFileTypeDialog(false)}
              className="w-full mt-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInputModern;