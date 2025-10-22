'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PremiumUser } from '@/utils/premiumUtils';
import { useSession } from 'next-auth/react';

interface UserInfoContextType {
  localUserInfo: PremiumUser | null;
  updateLocalUserInfo: (newUserInfo: Record<string, unknown>) => void;
  clearLocalUserInfo: () => void;
  isFetchingUserInfo: boolean;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [localUserInfo, setLocalUserInfo] = useState<PremiumUser | null>(null);
  const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);
  const { data: session } = useSession();

  const clearLocalUserInfo = useCallback(() => {
    console.log('Clearing local user info and localStorage');
    setLocalUserInfo(null);
    setHasAuthError(false);
    localStorage.removeItem('userInfo');
  }, []);

  // Fetch user info from server when user is authenticated
  const fetchUserInfoFromServer = useCallback(async () => {
    if (!session?.user?.id || isFetchingUserInfo || hasAuthError) return;
    
    // Additional check: if session exists but no access token, don't fetch
    if (!session.user.accessToken) {
      console.log('Session exists but no access token - skipping user info fetch');
      return;
    }
    
    setIsFetchingUserInfo(true);
    try {
      console.log('Fetching user info from server for first visit...');
      const response = await fetch('/api/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceRefresh: true }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info fetched from server:', data.user);
        
        // Update localStorage and state
        const premiumUser: PremiumUser = {
          id: data.user.ID?.toString() || '',
          username: data.user.username || data.user.fname,
          userType: data.user.user_type || 'free',
        };
        
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        setLocalUserInfo(premiumUser);
        console.log('User info updated in context:', premiumUser);
      } else if (response.status === 401) {
        // Token is expired or invalid - clear all local data and set auth error flag
        console.log('User info fetch returned 401 - clearing local data and setting auth error flag');
        setHasAuthError(true);
        clearLocalUserInfo();
        // Don't set isFetchingUserInfo to false here - let the component handle the logout
        return;
      } else {
        console.error('Failed to fetch user info from server:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user info from server:', error);
    } finally {
      setIsFetchingUserInfo(false);
    }
  }, [session?.user?.id, isFetchingUserInfo, hasAuthError, clearLocalUserInfo]);

  useEffect(() => {
    // Load user info from localStorage on mount
    const loadUserInfo = () => {
      try {
        const stored = localStorage.getItem('userInfo');
        if (stored) {
          const userInfo = JSON.parse(stored);
          const premiumUser: PremiumUser = {
            id: userInfo.ID?.toString() || '',
            username: userInfo.username || userInfo.fname,
            userType: userInfo.user_type || 'free',
          };
          console.log('Loaded userInfo from localStorage:', premiumUser);
          setLocalUserInfo(premiumUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
      }
    };

    loadUserInfo();

    // Listen for storage changes (when user info is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userInfo') {
        loadUserInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Reset auth error flag when session changes and clear data when unauthenticated
  useEffect(() => {
    if (session?.user?.id) {
      setHasAuthError(false);
    } else if (!session?.user) {
      // Session is unauthenticated, clear local data
      console.log('Session unauthenticated - clearing local user info');
      clearLocalUserInfo();
    }
  }, [session?.user?.id, session?.user, clearLocalUserInfo]);

  // Fetch user info from server when user is authenticated but no local data exists
  useEffect(() => {
    if (session?.user?.id && !localUserInfo && !isFetchingUserInfo && !hasAuthError && session.user.accessToken) {
      console.log('User is authenticated but no local user info, fetching from server...');
      fetchUserInfoFromServer();
    }
  }, [session?.user?.id, localUserInfo, isFetchingUserInfo, hasAuthError, session?.user?.accessToken, fetchUserInfoFromServer]);

  const updateLocalUserInfo = useCallback((newUserInfo: Record<string, unknown>) => {
    try {
      // Update localStorage first for immediate availability
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      
      // Then update state immediately
      const premiumUser: PremiumUser = {
        id: (newUserInfo.ID as string)?.toString() || '',
        username: (newUserInfo.username as string) || (newUserInfo.fname as string),
        userType: (newUserInfo.user_type as 'free' | 'promotion' | 'premium') || 'free',
      };
      
      console.log('Context: Updating localUserInfo state with:', premiumUser);
      setLocalUserInfo(premiumUser);
      
      console.log('Context: LocalStorage updated immediately with userType:', newUserInfo.user_type);
    } catch (error) {
      console.error('Failed to update local user info:', error);
    }
  }, []);

  return (
    <UserInfoContext.Provider value={{ localUserInfo, updateLocalUserInfo, clearLocalUserInfo, isFetchingUserInfo }}>
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
