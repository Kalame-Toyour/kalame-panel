import axios from 'axios';
import { AppConfig } from './AppConfig';

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
  async requestPayment(packageID: number, token: string): Promise<ApiPaymentResponse> {
    const paymentUrl = 'https://api.kalame.chat/payment/requestPayment';
    console.log(`💳 Payment request to: ${paymentUrl}`);
    
    try {
      const response = await axios.post(paymentUrl, { packageID }, {
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