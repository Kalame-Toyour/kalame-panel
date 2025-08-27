import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

// Import toast functionality
let showToast: ((message: string, type: 'success' | 'error' | 'warning') => void) | null = null;

export const setToastFunction = (toastFn: (message: string, type: 'success' | 'error' | 'warning') => void) => {
  showToast = toastFn;
};

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  credit?: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
  error?: string;
  accessToken?: string;
  refreshToken?: string;
  needUserData?: {
    ID?: number;
    id?: number;
    username?: string;
    name?: string;
    expireAt?: string;
    credit?: number;
  };
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Memoize the auth state check function to prevent unnecessary re-renders
  const checkAuthStatus = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('kariz_user');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        const now = Date.now();
        
        if (user.expiresAt && user.expiresAt > now) {
          return { user, isLoading: false, isAuthenticated: true };
        } else {
          // Token expired, remove from localStorage
          localStorage.removeItem('kariz_user');
          return { user: null, isLoading: false, isAuthenticated: false };
        }
      } else {
        return { user: null, isLoading: false, isAuthenticated: false };
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      return { user: null, isLoading: false, isAuthenticated: false };
    }
  }, []);

  useEffect(() => {
    const authStatus = checkAuthStatus();
    setAuthState(authStatus);
  }, [checkAuthStatus]);

  const login = async (
    phoneOrEmail: string, 
    password: string, 
    type: 'password' | 'code' | 'register' = 'password',
    additionalData: Record<string, unknown> = {}
  ): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      let data: ApiAuthResponse;

      if (type === 'register') {
        // Registration flow
        data = await api.authPost('/registerUser', additionalData) as ApiAuthResponse;
      } else if (type === 'code') {
        // Login with verification code
        data = await api.authPost('/loginWithCode', { mobile: phoneOrEmail, code: password }) as ApiAuthResponse;
      } else {
        // Login with password
        data = await api.authPost('/login', { mobile: phoneOrEmail, pass: password }) as ApiAuthResponse;
      }

      console.log('🔐 Auth response:', { data });

      // Check if we have the new response format with accessToken and needUserData
      if (data.accessToken && data.needUserData) {
        const user: User = {
          id: data.needUserData.ID?.toString() || data.needUserData.id?.toString() || '',
          name: data.needUserData.username || data.needUserData.name || 'کاربر',
          phone: phoneOrEmail,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || '',
          expiresAt: data.needUserData.expireAt ? new Date(data.needUserData.expireAt).getTime() : Date.now() + 60 * 60 * 1000,
          credit: data.needUserData.credit,
          image: 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'
        };

        console.log('✅ User authenticated:', user);

        // Store user in localStorage with additional tokens for redundancy
        localStorage.setItem('kariz_user', JSON.stringify(user));
        localStorage.setItem('kariz_access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('kariz_refresh_token', data.refreshToken);
        }

        // Force update auth state immediately
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        // Force a small delay to ensure state is properly updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Double-check that the state was set correctly
        console.log('🔍 Verifying auth state after login:', { 
          currentState: authState, 
          storedUser: localStorage.getItem('kariz_user'),
          accessToken: localStorage.getItem('kariz_access_token')
        });
        
      } else if (!data.success && data.error) {
        // Handle legacy error format
        const errorMessage = data.error || data.message || 'Authentication failed';
        console.error('❌ Auth error:', errorMessage);
        throw new Error(errorMessage);
      } else {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Memoize refreshAuthState to prevent infinite loops
  const refreshAuthState = useCallback(() => {
    const authStatus = checkAuthStatus();
    setAuthState(authStatus);
    return authStatus.isAuthenticated;
  }, [checkAuthStatus]);

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove user from localStorage
      localStorage.removeItem('kariz_user');
      
      // Clear any cached data or tokens
      localStorage.removeItem('kariz_refresh_token');
      localStorage.removeItem('kariz_access_token');
      
      // Force clear any remaining auth state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // Show success toast
      if (showToast) {
        showToast('با موفقیت از حساب کاربری خود خارج شدید', 'success');
      }
      
      // Force a page refresh to clear any cached state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const refreshUserState = useCallback(() => {
    const authStatus = checkAuthStatus();
    setAuthState(authStatus);
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    refreshUserState,
    refreshAuthState,
  };
}

// Lightweight getter for current user (for non-react modules)
export function getAuth() {
  try {
    // First try to get from kariz_user
    const storedUser = localStorage.getItem('kariz_user');
    if (storedUser) {
      const user = JSON.parse(storedUser) as { accessToken: string; expiresAt?: number }
      
      // Check if token is expired
      if (user.expiresAt && user.expiresAt < Date.now()) {
        // Token expired, remove it
        localStorage.removeItem('kariz_user');
        localStorage.removeItem('kariz_access_token');
        localStorage.removeItem('kariz_refresh_token');
        return null
      }
      
      return user
    }
    
    // Fallback: try to get from individual token storage
    const accessToken = localStorage.getItem('kariz_access_token');
    if (accessToken) {
      // Create a minimal user object with just the access token
      return { accessToken }
    }
    
    return null
  } catch (error) {
    console.error('Error in getAuth:', error);
    // If there's any error parsing, remove the corrupted data
    localStorage.removeItem('kariz_user');
    localStorage.removeItem('kariz_access_token');
    localStorage.removeItem('kariz_refresh_token');
    return null
  }
}