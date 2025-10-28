import React, { useState, useEffect } from 'react';
import { Send, Globe, Zap, X, Image as ImageIcon, Upload, FileText, FileImage, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { useLocale } from 'next-intl';
import DynamicTextarea from './DynamicTextarea';
import { useRouter } from 'next/navigation';
import { useModel } from '../../../contexts/ModelContext';
import { useTutorial } from '../../../contexts/TutorialContext';
import TutorialDialog from './TutorialDialog';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useDynamicContent } from '@/utils/dynamicContent';
import UploadProgress from './UploadProgress';
import { fileUploadService, UploadProgress as UploadProgressType } from '@/services/fileUpload';

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
  const content = useDynamicContent();
  
  const [isRTL, setIsRTL] = useState(locale === 'fa');
  const [reasoning, setReasoning] = useState(reasoningActive);
  const [webSearch, setWebSearch] = useState(webSearchActive);
  const [file, setFile] = useState<File | null>(null);
  const [tutorialDialog, setTutorialDialog] = useState<'reasoning' | 'webSearch' | null>(null);
  const [fileTypeDialog, setFileTypeDialog] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Clear file state when chat is cleared or reset
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
  }, [])

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
      toast('آپلود فایل لغو شد', { icon: 'ℹ️' });
    }
  }

  function handleFileUploadClick() {
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
    // For now, allow uploads without strict authentication check
    // if (!user) {
    //   toast.error('برای آپلود فایل باید وارد حساب کاربری خود شوید');
    //   return;
    // }

    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const result = await fileUploadService.uploadFile(
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
            toast.success(`فایل ${file.type.startsWith('image/') ? 'عکس' : 'PDF'} با موفقیت آپلود شد`);
          },
          onError: (error) => {
            setUploadError(error);
            setUploadProgress(null);
            setIsUploading(false);
            toast.error(`خطا در آپلود فایل: ${error}`);
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
      toast.error(`خطا در آپلود فایل: ${errorMessage}`);
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
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && inputText.trim().length > 0) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function handleSendMessage() {
    if (!selectedModel) return;
    
    // Check if file is still uploading
    if (isUploading) {
      toast.error('لطفاً صبر کنید تا فایل آپلود شود');
      return;
    }
    
    // Check if there's an upload error
    if (uploadError) {
      toast.error('ابتدا مشکل آپلود فایل را حل کنید');
      return;
    }
    
    console.log('ChatInputModern - Sending message with model:', {
      selectedModelName: selectedModel.name,
      selectedModelShortName: selectedModel.shortName,
      modelType: selectedModel.shortName,
      hasFile: !!file,
      uploadedFileUrl
    });
    
    // Create message with file info if available
    const messageText = inputText;
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
      modelType: selectedModel.shortName,
      webSearch,
      reasoning,
      fileUrl: uploadedFileUrl || undefined,
      ...fileInfo
    });

    // Clear file state after sending message
    handleRemoveFile();
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
        <div className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-2 relative transition-shadow duration-200 max-h-[200px] md:max-h-none overflow-hidden">
          {/* Input Section */}
          <div className="w-full flex gap-2 mb-0 relative items-end">
            {/* Send Button - Desktop (positioned based on file upload) */}
            <div className={`hidden sm:flex items-center transition-all duration-300 mt-1 md:mt-2 ${
              file ? 'absolute left-4 top-1/2 -translate-y-1/2 z-20' : 'absolute left-4 top-1/2 -translate-y-1/2 z-10'
            }`}>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className={`rounded-full w-12 h-12 bg-black text-white shadow-lg focus:outline-none disabled:opacity-60 transition-all border-2 ${
                  content.brandName === 'کلمه'
                    ? 'hover:bg-blue-900 hover:text-blue-200 hover:!bg-blue-900 focus:ring-4 focus:ring-blue-400 border-blue-900'
                    : 'hover:bg-purple-900 hover:text-purple-200 hover:!bg-purple-900 focus:ring-4 focus:ring-purple-400 border-purple-900'
                }`}
                onClick={handleSendMessage}
                disabled={isLoading || inputText.trim().length === 0 || isUploading || !!uploadError}
                aria-label="ارسال پیام"
              >
                <Send size={26} />
              </Button>
            </div>
            
            {/* Textarea */}
            <DynamicTextarea
              ref={inputRef}
              inputText={inputText}
              setInputText={setInputText}
              handleKeyPress={handleKeyPress}
              isRTL={isRTL}
              isLoading={isLoading}
            />
            
            {/* Send Button - Mobile */}
            <div className="sm:hidden flex items-center self-end">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className={`rounded-full w-10 h-10 bg-black text-white shadow-lg focus:outline-none disabled:opacity-60 transition-all border-2 ${
                  content.brandName === 'کلمه'
                    ? 'hover:bg-blue-900 hover:text-blue-200 hover:!bg-blue-900 focus:ring-4 focus:ring-blue-400 border-blue-900'
                    : 'hover:bg-purple-900 hover:text-purple-200 hover:!bg-purple-900 focus:ring-4 focus:ring-purple-400 border-purple-900'
                }`}
                onClick={handleSendMessage}
                disabled={isLoading || inputText.trim().length === 0 || isUploading || !!uploadError}
                aria-label="ارسال پیام"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
          {/* Options Row + Dropdown */}
          <div className="compact-buttons flex w-full items-center gap-0.5 sm:gap-2 lg:gap-3 mt-0 mb-0 sm:flex-row flex-row flex-wrap justify-start sm:justify-start">
            {/* Reasoning Toggle */}
            <Button
              type="button"
              variant={reasoning ? 'secondary' : 'outline'}
              size="sm"
              disabled={!selectedModel?.features?.supportsReasoning}
              className={`rounded-full px-1 py-1 lg:px-3 lg:py-2 flex items-center gap-0.5 lg:gap-2 font-bold transition-all group min-w-fit ${
                !selectedModel?.features?.supportsReasoning 
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed opacity-60' 
                  : reasoning 
                    ? content.brandName === 'کلمه'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : content.brandName === 'کلمه'
                      ? 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 hover:!bg-blue-50 dark:hover:!bg-blue-900'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-200 hover:!bg-purple-50 dark:hover:!bg-purple-900'
              } focus:ring-2 ${content.brandName === 'کلمه' ? 'focus:ring-blue-400' : 'focus:ring-purple-400'} text-xs lg:text-sm`}
              onClick={handleReasoningToggle}
            >
              <Zap size={12} className="mr-0.5" />
              <span className="mr-0.5">استدلال</span>
            </Button>
            {/* Web Search Toggle */}
            <Button
              type="button"
              variant={webSearch ? 'secondary' : 'outline'}
              size="sm"
              disabled={!selectedModel?.features?.supportsWebSearch}
              className={`rounded-full px-1 py-1 lg:px-3 lg:py-2 flex items-center gap-0.5 lg:gap-2 font-bold transition-all group min-w-fit ${
                !selectedModel?.features?.supportsWebSearch 
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed opacity-60' 
                  : webSearch 
                    ? content.brandName === 'کلمه'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : content.brandName === 'کلمه'
                      ? 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 hover:!bg-blue-50 dark:hover:!bg-blue-900'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-200 hover:!bg-purple-50 dark:hover:!bg-purple-900'
              } focus:ring-2 ${content.brandName === 'کلمه' ? 'focus:ring-blue-400' : 'focus:ring-purple-400'} text-xs lg:text-sm`}
              onClick={handleWebSearchToggle}
            >
              <Globe size={12} className="mr-0.5" />
              <span className="mr-0.5">جست‌و‌جو</span>
            </Button>
            {/* File Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`rounded-full px-1 py-1 flex items-center  font-bold transition-all group bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 focus:ring-2 text-xs  ${
                content.brandName === 'کلمه'
                  ? 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 hover:!bg-blue-50 dark:hover:!bg-blue-900 focus:ring-blue-400'
                  : 'hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-200 hover:!bg-purple-50 dark:hover:!bg-purple-900 focus:ring-purple-400'
              }`}
              onClick={handleFileUploadClick}
            >
              <Upload size={12} className="mr-0.5" />
              <span className="mr-0.5">آپلود فایل</span>
            </Button>
            {/* Image Generation Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`rounded-full px-1 py-1 flex items-center font-bold transition-all group bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 focus:ring-2 text-xs  ${
                content.brandName === 'کلمه'
                  ? 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-200 hover:!bg-blue-50 dark:hover:!bg-blue-900 focus:ring-blue-400'
                  : 'hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-200 hover:!bg-purple-50 dark:hover:!bg-purple-900 focus:ring-purple-400'
              }`}
              onClick={handleImageGenerationClick}
            >
              <ImageIcon size={12} className="mr-0.5" />
              <span className="mr-0.5">تولید تصویر</span>
            </Button>
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
                    <div className=" w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
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
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className=" w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      onClick={handleRemoveFile}
                      aria-label="حذف فایل"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* File Preview - Only show when upload is complete or not uploading */}
              {!isUploading && !uploadError && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* File Icon */}
                      <div className={` w-10 h-10 rounded-lg flex items-center justify-center ${
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
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className=" w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={handleRemoveFile}
                        aria-label="حذف فایل"
                      >
                        <Trash2 size={16} />
                      </Button>
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
      </div>
      
      {/* Tutorial Dialog */}
      <TutorialDialog
        isOpen={tutorialDialog !== null}
        onClose={handleTutorialClose}
        type={tutorialDialog || 'reasoning'}
      />
      
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
    </>
  )
}

export default ChatInputModern; 