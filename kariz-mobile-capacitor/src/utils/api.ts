import axios from 'axios';
import { AppConfig } from './AppConfig';
import { getUserIdFromToken } from './jwtUtils';

// API Response Types
interface ApiModel {
  id: number;
  name: string;
  short_name: string;
  token_cost: number;
  icon_url: string;
  provider: string;
  model_path: string;
  max_tokens: number;
  context_length: number;
  temperature: number;
  supports_streaming: number;
  supports_web_search: number;
  supports_reasoning: number;
  // Image model fields
  type?: string;
  supported_sizes?: string[];
  supported_sizes_json?: string;
}

interface ApiModelsResponse {
  models: ApiModel[];
}

interface ApiSuggestion {
  id: string;
  title: string;
  icon: string;
  prompt: string;
  color: string;
}

interface ApiSuggestionsResponse {
  suggestions: ApiSuggestion[];
}

interface ApiAuthResponse {
  success: boolean;
  message: string;
  data: {
    isNewUser?: boolean;
    sent?: boolean;
    token?: string;
    user?: {
      id: number;
      name: string;
      phone: string;
    };
  };
}

interface ApiChatResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    model: string;
    tokens_used: number;
  };
}

interface ApiChatHistoryResponse {
  chats: Array<{
    id: string;
    date: string | number | Date;
    title?: string;
    text?: string;
  }>;
}

interface ApiFeedbackResponse {
  success: boolean;
  message: string;
  data: { [key: string]: unknown } | null;
}

interface ApiMediaItem {
  ID: number;
  user_id: number;
  message_id: string;
  message_type: string;
  media_url: string;
  insert_time: string;
}

interface ApiMediaResponse {
  media: ApiMediaItem[];
}

interface ApiGenerateImageResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
  };
}

export type { ApiMediaItem, ApiMediaResponse, ApiGenerateImageResponse };

interface ApiPaymentResponse {
  payment?: string;
  error?: string;
}

type ApiResponse = ApiModelsResponse | ApiSuggestionsResponse | ApiAuthResponse | ApiChatResponse | ApiChatHistoryResponse | ApiFeedbackResponse | ApiMediaResponse | ApiGenerateImageResponse | { success: boolean; message: string; data: null };

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: AppConfig.baseApiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status}`);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    console.error('❌ Error Details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  async get(endpoint: string): Promise<ApiResponse> {
    console.log(`🌐 GET request to: ${AppConfig.baseApiUrl}${endpoint}`);
    return await apiClient.get(endpoint);
  },

  async post(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse> {
    console.log(`🌐 POST request to: ${AppConfig.baseApiUrl}${endpoint}`);
    return await apiClient.post(endpoint, data);
  },

  async getWithAuth(endpoint: string, token: string): Promise<ApiResponse> {
    console.log(`🔐 Auth GET request to: ${AppConfig.baseApiUrl}${endpoint}`);
    return await apiClient.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async postWithAuth(endpoint: string, data: Record<string, unknown>, token: string): Promise<ApiResponse> {
    console.log(`🔐 Auth POST request to: ${AppConfig.baseApiUrl}${endpoint}`);
    return await apiClient.post(endpoint, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  // POST with auth and custom timeout (useful for long-running operations like image generation)
  async postWithAuthWithTimeout(endpoint: string, data: Record<string, unknown>, token: string, timeoutMs: number): Promise<ApiResponse> {
    console.log(`🔐 Auth POST (custom timeout ${timeoutMs}ms) to: ${AppConfig.baseApiUrl}${endpoint}`)
    return await apiClient.post(endpoint, data, {
      timeout: timeoutMs,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
  },

  // Special method for auth endpoints that bypasses the base URL
  async authPost(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse> {
    const authUrl = `${AppConfig.authApiUrl}${endpoint}`;
    console.log(`🔐 Auth request to: ${authUrl}`);
    
    const response = await axios.post(authUrl, data, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    return response.data;
  },

  // Payment API - direct request to payment endpoint
  async requestPayment(packageID: number, token: string, discountCode?: string, discountPercent?: number, finalPrice?: number, discountId?: number): Promise<ApiPaymentResponse> {
    const paymentUrl = 'https://api.kalame.chat/payment/requestPaymentApp';
    console.log(`💳 Payment request to: ${paymentUrl}`);
    
    try {
      // Extract userId from token
      const userId = getUserIdFromToken(token);
      if (!userId) {
        throw new Error('Unable to extract userId from token');
      }
      
      // Prepare request body
      const requestBody: { 
        packageID: number; 
        userId: string;
        discountCode?: string;
        discountPercent?: number;
        finalPrice?: number;
        discountId?: number;
      } = { 
        packageID, 
        userId 
      };
      
      // Add discount information if provided
      if (discountCode) {
        requestBody.discountCode = discountCode;
        requestBody.discountPercent = discountPercent;
        requestBody.finalPrice = finalPrice;
        requestBody.discountId = discountId;
        console.log('Payment request with discount:', { discountCode, discountPercent, finalPrice, discountId, packageID, userId });
      } else {
        console.log('Payment request for package:', packageID, 'userId:', userId);
      }
      
      const response = await axios.post(paymentUrl, requestBody, {
        timeout: 15000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('✅ Payment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment API Error:', error);
      throw error;
    }
  },

  // Feedback API
  async submitFeedback(messageId: string, feedbackType: 'like' | 'dislike', feedbackText?: string, token?: string): Promise<ApiFeedbackResponse> {
    try {
      const data = {
        messageId,
        feedbackType,
        feedbackText: feedbackText || ''
      };

      if (token) {
        return await this.postWithAuth('/feedback', data, token) as ApiFeedbackResponse;
      } else {
        return await this.post('/feedback', data) as ApiFeedbackResponse;
      }
    } catch (error) {
      console.error('❌ Feedback API Error:', error);
      throw error;
    }
  },

  // Discount API with retry mechanism
  async checkDiscount(code: string, token: string, retryCount = 0): Promise<{ success: boolean; message: string; discountId?: number; discount_percent?: number }> {
    const maxRetries = 2;
    
    try {
      console.log(`🎫 Checking discount code: ${code} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // Extract userId from token
      const userId = getUserIdFromToken(token);
      console.log('Extracted userId:', userId);
      
      if (!userId) {
        throw new Error('Unable to extract userId from token');
      }

      const requestBody = { 
        code: code.trim(), 
        userId 
      };

      // Try primary endpoint first
      let response;
      try {
        response = await axios.post('https://api.kalame.chat/payment/checkDiscount', requestBody, {
          timeout: 30000, // 30 seconds timeout
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      } catch (primaryError) {
        console.log('Primary endpoint failed, trying alternative...');
        // Try alternative endpoint if primary fails
        response = await axios.post('https://api.kalame.chat/payment/checkDiscount', requestBody, {
          timeout: 60000, // 60 seconds timeout for retry
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }

      console.log('✅ Discount check response:', response.data);
      console.log('Response structure analysis:', {
        hasID: !!response.data.ID,
        hasDiscountPercent: response.data.discount_percent !== undefined,
        hasSuccess: response.data.success !== undefined,
        hasDiscount: !!response.data.discount,
        discountPercent: response.data.discount_percent,
        discountObjectPercent: response.data.discount?.discount_percent,
        ID: response.data.ID,
        discountObjectID: response.data.discount?.ID
      });
      
      // Handle different response structures
      const responseData = response.data;
      
      // If response has success field and discount object (standard API response)
      if (responseData.success && responseData.discount) {
        console.log('✅ Parsing standard API response with discount object:', {
          success: responseData.success,
          discountId: responseData.discount.ID,
          discount_percent: responseData.discount.discount_percent,
          message: responseData.message
        });
        return {
          success: responseData.success,
          message: responseData.message || 'کد تخفیف با موفقیت اعمال شد',
          discountId: responseData.discount.ID,
          discount_percent: responseData.discount.discount_percent
        };
      }
      
      // If response is the discount object directly (legacy case)
      if (responseData.ID && responseData.discount_percent !== undefined) {
        console.log('✅ Parsing direct discount object:', {
          ID: responseData.ID,
          discount_percent: responseData.discount_percent
        });
        return {
          success: true,
          message: 'کد تخفیف با موفقیت اعمال شد',
          discountId: responseData.ID,
          discount_percent: responseData.discount_percent
        };
      }
      
      // If response has success field (other standard API response)
      if (responseData.success !== undefined) {
        return responseData;
      }
      
      // Fallback - assume success if we got here
      return {
        success: true,
        message: 'کد تخفیف با موفقیت اعمال شد',
        discountId: responseData.ID || responseData.discountId,
        discount_percent: responseData.discount_percent || 0
      };
    } catch (error: any) {
      console.error(`❌ Discount API Error (attempt ${retryCount + 1}):`, error);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED' && retryCount < maxRetries) {
        console.log(`⏳ Timeout occurred, retrying... (${retryCount + 1}/${maxRetries})`);
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.checkDiscount(code, token, retryCount + 1);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('درخواست زمان زیادی طول کشید. لطفاً دوباره تلاش کنید.');
      } else if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'خطا در بررسی کد تخفیف';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
      } else {
        // Something else happened
        throw new Error('خطای غیرمنتظره در بررسی کد تخفیف');
      }
    }
  }
  ,
  // Notifications: device registration for push (mobile)
  async registerPushDevice(params: { platform: 'android' | 'ios'; provider?: 'fcm'; token: string; appVersion?: string; appBuild?: string; deviceId?: string; device?: { model?: string; manufacturer?: string; osVersion?: string; isVirtual?: boolean; language?: string; timezone?: string; tzOffsetMin?: number } }, authToken?: string): Promise<{ success: boolean }> {
    const endpoint = '/notifications/register-device'
    if (authToken) {
      return await this.postWithAuth(endpoint, params, authToken) as { success: boolean }
    }
    return await this.post(endpoint, params) as { success: boolean }
  },
  async unregisterPushDevice(params: { token: string }, authToken?: string): Promise<{ success: boolean }> {
    const endpoint = '/notifications/unregister-device'
    if (authToken) {
      return await this.postWithAuth(endpoint, params, authToken) as { success: boolean }
    }
    return await this.post(endpoint, params) as { success: boolean }
  }
}; 