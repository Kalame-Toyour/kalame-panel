import { AppConfig } from '../utils/AppConfig';
import { Capacitor } from '@capacitor/core';
import { getAuth } from '../hooks/useAuth';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  type?: 'image' | 'pdf';
  filename?: string;
  size?: number;
  error?: string;
}

interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

class MobileFileUploadService {
  private activeUploads = new Map<string, AbortController>();

  async uploadFile(
    file: File,
    chatId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const abortController = new AbortController();
    
    this.activeUploads.set(uploadId, abortController);

    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);

      // Get auth token from getAuth utility (consistent with rest of app)
      const user = getAuth();
      const token = user?.accessToken || null;
      console.log(`[MobileFileUpload] File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
      console.log(`[MobileFileUpload] ChatId: ${chatId}`);
      console.log(`[MobileFileUpload] Token available: ${!!token}`);
      console.log(`[MobileFileUpload] Is native platform: ${Capacitor.isNativePlatform()}`);
      console.log(`[MobileFileUpload] Current origin: ${window.location.origin}`);

      // Use relative URL to go through middleware (middleware handles CORS and redirects)
      // The apiMiddleware will intercept this and redirect to the proper endpoint
      const uploadUrl = '/api/upload-media';
      console.log(`[MobileFileUpload] Uploading to: ${uploadUrl} (will be handled by middleware)`);
      
      return new Promise(async (resolve, reject) => {
        try {
          
          // Simulate progress for fetch (since fetch doesn't have built-in progress)
          const progressInterval = setInterval(() => {
            options.onProgress?.({
              loaded: 0,
              total: file.size,
              percentage: 50 // Simulate 50% progress
            });
          }, 100);
          
          // Create headers
          // Don't set Content-Type for FormData - browser will set it with boundary
          const headers: Record<string, string> = {
            'Accept': 'application/json',
          };
          
          // Add Authorization header if token is available
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          console.log(`[MobileFileUpload] Sending request with headers:`, Object.keys(headers));
          
          // Use fetch - middleware will intercept and handle CORS
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers,
            body: formData,
            signal: abortController.signal,
            // Don't set mode or credentials - let middleware handle it
          });
          
          // Set progress to 100% before processing response
          clearInterval(progressInterval);
          options.onProgress?.({
            loaded: file.size,
            total: file.size,
            percentage: 100
          });
          
          console.log(`[MobileFileUpload] Response status: ${response.status}`);
          console.log(`[MobileFileUpload] Response headers:`, Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const result = await response.json();
            console.log(`[MobileFileUpload] Parsed result:`, result);
            
            // Backend API might return different format - check both
            if (result.success || result.url) {
              // Map backend response to expected format
              const uploadResult: UploadResult = {
                success: true,
                url: result.url || result.data?.url,
                type: file.type.startsWith('image/') ? 'image' : 'pdf',
                filename: file.name,
                size: file.size
              };
              console.log(`[MobileFileUpload] Upload successful:`, uploadResult);
              options.onSuccess?.(uploadResult);
              resolve(uploadResult);
            } else {
              const errorMessage = result.error || result.message || 'آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید.';
              console.error(`[MobileFileUpload] Upload failed: ${errorMessage}`);
              options.onError?.(errorMessage);
              reject(new Error(errorMessage));
            }
          } else {
            let errorMessage = 'آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید.';
            
            try {
              const errorData = await response.json();
              if (errorData.error) {
                errorMessage = errorData.error;
              } else if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch {
              // Use default error message if parsing fails
              if (response.status === 401) {
                errorMessage = 'دسترسی غیرمجاز. لطفاً وارد حساب کاربری خود شوید.';
              } else if (response.status === 413) {
                errorMessage = 'حجم فایل بیش از حد مجاز است.';
              } else if (response.status >= 500) {
                errorMessage = 'خطا در سرور. لطفاً بعداً تلاش کنید.';
              }
            }
            
            console.error(`[MobileFileUpload] HTTP error ${response.status}: ${errorMessage}`);
            options.onError?.(errorMessage);
            reject(new Error(errorMessage));
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            options.onCancel?.();
            reject(new Error('آپلود لغو شد'));
          } else {
            const errorMessage = 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
            console.error(`[MobileFileUpload] Network error:`, error);
            options.onError?.(errorMessage);
            reject(new Error(errorMessage));
          }
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید.';
      options.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  cancelUpload(uploadId: string): void {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(uploadId);
    }
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const ALLOWED_PDF_TYPES = ['application/pdf'];

    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'حجم فایل بیش از 10 مگابایت است' };
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isPDF = ALLOWED_PDF_TYPES.includes(file.type);

    if (!isImage && !isPDF) {
      return { 
        valid: false, 
        error: 'نوع فایل نامعتبر است. فقط تصاویر (JPEG, PNG, GIF, WebP) و فایل‌های PDF مجاز هستند' 
      };
    }

    return { valid: true };
  }

}

export const mobileFileUploadService = new MobileFileUploadService();
export type { UploadProgress, UploadResult, UploadOptions };
