import { AppConfig } from '../utils/AppConfig';

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

      // Get auth token
      const token = this.getAuthToken();
      console.log(`[MobileFileUpload] File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
      console.log(`[MobileFileUpload] ChatId: ${chatId}`);
      console.log(`[MobileFileUpload] Token available: ${!!token}`);

      // For development, we need to handle CORS differently
      // In production mobile app, this won't be an issue
      return new Promise(async (resolve, reject) => {
        try {
          // Check if we're in development mode
          const isDevelopment = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1');
          
          if (isDevelopment) {
            // In development, show a clear message about the CORS issue
            const errorMessage = 'آپلود فایل در حالت توسعه در دسترس نیست. این مشکل به دلیل محدودیت‌های CORS است. لطفاً از نسخه تولیدی موبایل استفاده کنید.';
            console.warn(`[MobileFileUpload] Development mode detected - CORS issue prevents file upload`);
            console.warn(`[MobileFileUpload] Solution: Use production mobile app or configure development server`);
            options.onError?.(errorMessage);
            reject(new Error(errorMessage));
            return;
          }
          
          // Use relative URL to go through middleware (for production)
          const uploadUrl = '/api/upload-media';
          console.log(`[MobileFileUpload] Uploading to: ${uploadUrl}`);
          console.log(`[MobileFileUpload] Current origin: ${window.location.origin}`);
          
          // Simulate progress for fetch (since fetch doesn't have built-in progress)
          const progressInterval = setInterval(() => {
            options.onProgress?.({
              loaded: 0,
              total: file.size,
              percentage: 50 // Simulate 50% progress
            });
          }, 100);
          
          // Create headers
          const headers: Record<string, string> = {
            'Accept': 'application/json',
          };
          
          // Add Authorization header if token is available
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          // Use fetch with middleware
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers,
            body: formData,
            signal: abortController.signal,
          });
          
          // Clear progress interval
          clearInterval(progressInterval);
          
          console.log(`[MobileFileUpload] Response status: ${response.status}`);
          
          if (response.ok) {
            const result = await response.json();
            console.log(`[MobileFileUpload] Parsed result:`, result);
            
            if (result.success) {
              options.onSuccess?.(result);
              resolve(result);
            } else {
              const errorMessage = result.error || 'آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید.';
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
              }
            } catch {
              // Use default error message if parsing fails
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

  private getAuthToken(): string | null {
    // Get token from localStorage, session storage, or cookies
    if (typeof window !== 'undefined') {
      // Try localStorage first
      let token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
      
      // If no token in storage, try to get from cookies
      if (!token) {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
        if (authCookie) {
          token = authCookie.split('=')[1] || null;
        }
      }
      
      return token;
    }
    return null;
  }
}

export const mobileFileUploadService = new MobileFileUploadService();
export type { UploadProgress, UploadResult, UploadOptions };
