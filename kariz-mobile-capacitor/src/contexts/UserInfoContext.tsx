import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { api } from '../utils/api';

interface UserInfo {
  id: string;
  username?: string;
  userType: 'free' | 'promotion' | 'premium';
  credit?: number;
  expireAt?: string;
  [key: string]: unknown;
}

interface ApiUserInfoResponse {
  userInfo: {
    ID: number;
    fname: string;
    lname?: string;
    mobile: string;
    email?: string;
    user_type: 'free' | 'promotion' | 'premium';
    premium: 'yes' | 'no';
    premium_expiretime?: string;
    status: string;
    platform: string;
    permission: number;
    expertise: string;
    from_country: number;
    to_country: number;
    is_block: 'Yes' | 'No';
    is_exchange: 'Yes' | 'No';
    insert_time: string;
    back_doc?: string;
    front_doc?: string;
    doc_status?: string;
    code?: string;
    nickname?: string;
    telegram_chat_id?: string;
    password?: string;
  };
}

interface UserInfoContextType {
  localUserInfo: UserInfo | null;
  updateLocalUserInfo: (userInfo: Partial<UserInfo>) => void;
  clearLocalUserInfo: () => void;
  refreshUserInfo: () => Promise<void>;
  getUserInfo: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

interface UserInfoProviderProps {
  children: ReactNode;
}

export function UserInfoProvider({ children }: UserInfoProviderProps) {
  const [localUserInfo, setLocalUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedUserInfo, setHasFetchedUserInfo] = useState(false);

  const updateLocalUserInfo = useCallback((userInfo: Partial<UserInfo>) => {
    try {
      const updatedInfo = { ...localUserInfo, ...userInfo } as UserInfo;
      setLocalUserInfo(updatedInfo);
      localStorage.setItem('kariz_user_info', JSON.stringify(updatedInfo));
      console.log('User info updated in localStorage:', updatedInfo);
    } catch (error) {
      console.error('Error updating user info:', error);
      setError('Failed to update user info');
    }
  }, [localUserInfo]);

  const getUserInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get access token from auth
      const authData = localStorage.getItem('kariz_user');
      if (!authData) {
        throw new Error('No authentication data found');
      }

      const user = JSON.parse(authData);
      if (!user.accessToken) {
        throw new Error('No access token found');
      }

      // Call the API to get user info
      const data = await api.getWithAuth('/getUserInfo', user.accessToken) as unknown as ApiUserInfoResponse;
      
      if (data.userInfo) {
        const userData = data.userInfo;
        
        const userInfo: UserInfo = {
          id: userData.ID.toString(),
          username: userData.fname || userData.nickname || '',
          userType: userData.user_type || 'free',
          credit: 0, // Not provided in this API response
          expireAt: userData.premium_expiretime,
        };

        // Directly update state and localStorage to avoid dependency issues
        setLocalUserInfo(userInfo);
        localStorage.setItem('kariz_user_info', JSON.stringify(userInfo));
        console.log('User info fetched and stored:', userInfo);
      } else {
        console.error('API call failed - no userInfo in response');
        throw new Error('Failed to get user info from API - no userInfo in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching user info:', err);
      
      // If API call fails, try to use existing localStorage data
      const stored = localStorage.getItem('kariz_user_info');
      if (stored) {
        try {
          const userInfo = JSON.parse(stored) as UserInfo;
          setLocalUserInfo(userInfo);
          console.log('Using cached user info from localStorage:', userInfo);
        } catch (parseError) {
          console.error('Error parsing cached user info:', parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove updateLocalUserInfo dependency

  // Load user info from localStorage on mount
  useEffect(() => {
    const loadUserInfo = () => {
      try {
        const stored = localStorage.getItem('kariz_user_info');
        if (stored) {
          const userInfo = JSON.parse(stored) as UserInfo;
          setLocalUserInfo(userInfo);
        }
      } catch (error) {
        console.error('Error loading user info from localStorage:', error);
        localStorage.removeItem('kariz_user_info');
      }
    };

    loadUserInfo();
  }, []);

  // Fetch user info from API when component mounts and user is authenticated
  useEffect(() => {
    const checkAuthAndFetchUserInfo = async () => {
      // Prevent multiple calls
      if (hasFetchedUserInfo) {
        return;
      }

      try {
        const authData = localStorage.getItem('kariz_user');
        if (authData) {
          const user = JSON.parse(authData);
          if (user.accessToken) {
            console.log('User is authenticated, fetching user info from API...');
            setHasFetchedUserInfo(true);
            await getUserInfo();
          }
        }
      } catch (error) {
        console.error('Error checking auth and fetching user info:', error);
      }
    };

    checkAuthAndFetchUserInfo();
  }, [hasFetchedUserInfo, getUserInfo]);

  // Handle app state changes for user info refresh
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
      const handleAppStateChange = async () => {
        console.log('[UserInfoContext] App became active, refreshing user info...');
        try {
          const authData = localStorage.getItem('kariz_user');
          if (authData) {
            const user = JSON.parse(authData);
            if (user.accessToken) {
              // Force refresh user info when app becomes active
              setHasFetchedUserInfo(false);
              await getUserInfo();
            }
          }
        } catch (error) {
          console.error('[UserInfoContext] Error refreshing user info on app state change:', error);
        }
      };

      // Listen for app state changes
      CapacitorApp.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
        if (isActive) {
          handleAppStateChange();
        }
      });

      return () => {
        CapacitorApp.removeAllListeners();
      };
    }
  }, [getUserInfo]);

  const clearLocalUserInfo = () => {
    setLocalUserInfo(null);
    setHasFetchedUserInfo(false); // Reset flag when clearing user info
    localStorage.removeItem('kariz_user_info');
    console.log('User info cleared from localStorage');
  };

  const refreshUserInfo = async () => {
    setHasFetchedUserInfo(false); // Reset flag to allow refresh
    await getUserInfo();
  };

  const value: UserInfoContextType = {
    localUserInfo,
    updateLocalUserInfo,
    clearLocalUserInfo,
    refreshUserInfo,
    getUserInfo,
    isLoading,
    error,
  };

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfoContext() {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error('useUserInfoContext must be used within a UserInfoProvider');
  }
  return context;
}
