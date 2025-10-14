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

class FileUploadService {
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

      // Get auth token - for now, we'll skip token validation in development
      const token = this.getAuthToken();
      // Skip token validation for now since we're using session-based auth

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            options.onProgress?.(progress);
          }
        });

        // Handle successful upload
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                options.onSuccess?.(result);
                resolve(result);
              } else {
                const errorMessage = result.error || 'آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید.';
                options.onError?.(errorMessage);
                reject(new Error(errorMessage));
              }
            } catch (error) {
              const errorMessage = 'خطا در پردازش پاسخ سرور. لطفاً دوباره تلاش کنید.';
              options.onError?.(errorMessage);
              reject(new Error(errorMessage));
            }
          } else {
            let errorMessage = 'آپلود فایل ناموفق بود. لطفاً دوباره تلاش کنید.';
            
            // Try to parse error response for more specific error message
            try {
              const errorData = JSON.parse(xhr.responseText);
              if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch {
              // Use default error message if parsing fails
            }
            
            options.onError?.(errorMessage);
            reject(new Error(errorMessage));
          }
        });

        // Handle upload error
        xhr.addEventListener('error', () => {
          const errorMessage = 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
          options.onError?.(errorMessage);
          reject(new Error(errorMessage));
        });

        // Handle upload abort
        xhr.addEventListener('abort', () => {
          options.onCancel?.();
          reject(new Error('آپلود لغو شد'));
        });

        // Set up request
        xhr.open('POST', '/api/upload-media');
        
        // Set Authorization header if token is available
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        // Send request
        xhr.send(formData);

        // Store xhr reference for potential cancellation
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });
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

export const fileUploadService = new FileUploadService();
export type { UploadProgress, UploadResult, UploadOptions };
