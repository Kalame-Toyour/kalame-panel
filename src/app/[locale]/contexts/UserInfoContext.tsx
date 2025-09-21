'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PremiumUser } from '@/utils/premiumUtils';

interface UserInfoContextType {
  localUserInfo: PremiumUser | null;
  updateLocalUserInfo: (newUserInfo: any) => void;
  clearLocalUserInfo: () => void;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [localUserInfo, setLocalUserInfo] = useState<PremiumUser | null>(null);

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

  const updateLocalUserInfo = useCallback((newUserInfo: any) => {
    try {
      // Update localStorage first for immediate availability
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      
      // Then update state immediately
      const premiumUser: PremiumUser = {
        id: newUserInfo.ID?.toString() || '',
        username: newUserInfo.username || newUserInfo.fname,
        userType: newUserInfo.user_type || 'free',
      };
      
      console.log('Context: Updating localUserInfo state with:', premiumUser);
      setLocalUserInfo(premiumUser);
      
      console.log('Context: LocalStorage updated immediately with userType:', newUserInfo.user_type);
    } catch (error) {
      console.error('Failed to update local user info:', error);
    }
  }, []);

  const clearLocalUserInfo = useCallback(() => {
    setLocalUserInfo(null);
    localStorage.removeItem('userInfo');
  }, []);

  return (
    <UserInfoContext.Provider value={{ localUserInfo, updateLocalUserInfo, clearLocalUserInfo }}>
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
