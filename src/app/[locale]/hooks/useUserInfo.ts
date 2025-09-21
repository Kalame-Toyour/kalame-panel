import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserInfoContext } from '../contexts/UserInfoContext';
import { shouldFetchUserInfo, getCachedUserInfo, setCachedUserInfo } from '@/utils/userInfoCache';

interface UserInfo {
  ID?: number;
  username?: string;
  user_type?: 'free' | 'promotion' | 'premium';
  credit?: number;
  expireAt?: string;
  [key: string]: unknown;
}

interface UseUserInfoReturn {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshUserInfo: (forceRefresh?: boolean) => Promise<void>;
  updateUserInfo: (forceRefresh?: boolean) => Promise<void>;
}

export function useUserInfo(): UseUserInfoReturn {
  const { data: session, update: updateSession } = useSession();
  const { localUserInfo, updateLocalUserInfo, clearLocalUserInfo } = useUserInfoContext();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUpdatingRef = useRef<boolean>(false);

  // Use localUserInfo as the primary source of truth
  const effectiveUserInfo = localUserInfo ? {
    ID: parseInt(localUserInfo.id),
    username: localUserInfo.username || undefined,
    user_type: localUserInfo.userType,
  } : userInfo;

  const refreshUserInfo = useCallback(async (forceRefresh = false) => {
    if (!session?.user?.id) {
      setError('No active session');
      return;
    }

    if (isUpdatingRef.current) {
      console.log('User info update already in progress, skipping...');
      return;
    }

    isUpdatingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceRefresh }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user info');
      }

      // Update localStorage immediately first for instant UI updates
      console.log('About to update localStorage with userType:', data.user.user_type);
      updateLocalUserInfo(data.user);
      console.log('LocalStorage updated immediately with userType:', data.user.user_type);
      
      // Then update state
      setUserInfo(data.user);
      
      // Update session with new data if provided
      if (data.sessionUpdate) {
        console.log('Updating session with new data:', data.sessionUpdate);
        try {
          // Use updateSession to update the session object
          const updatedSession = await updateSession({
            ...session,
            user: {
              ...session.user,
              ...data.sessionUpdate,
            },
          });
          console.log('Session updated successfully via updateSession:', updatedSession);
        } catch (error) {
          console.error('Failed to update session:', error);
        }
      }

      console.log('User info refreshed:', data.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error refreshing user info:', err);
    } finally {
      setIsLoading(false);
      isUpdatingRef.current = false;
    }
  }, [updateSession, updateLocalUserInfo, session]);

  const updateUserInfo = useCallback(async (forceRefresh = false) => {
    if (!session?.user?.id) {
      setError('No active session');
      return;
    }

    // Check if we should fetch from cache or API
    if (!forceRefresh && !shouldFetchUserInfo(forceRefresh)) {
      const cachedData = getCachedUserInfo();
      if (cachedData) {
        console.log('Using cached user info');
        updateLocalUserInfo(cachedData);
        setUserInfo(cachedData);
        return cachedData;
      }
    }

    if (isUpdatingRef.current) {
      console.log('User info update already in progress, skipping...');
      return;
    }

    isUpdatingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceRefresh }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user info');
      }

      // Cache the user info for 10 minutes
      setCachedUserInfo(data.user);

      // Update localStorage immediately first for instant UI updates
      console.log('About to update localStorage with userType:', data.user.user_type);
      updateLocalUserInfo(data.user);
      console.log('LocalStorage updated immediately with userType:', data.user.user_type);
      
      // Then update state
      setUserInfo(data.user);
      
      // Update session with new data if provided
      if (data.sessionUpdate) {
        console.log('Updating session with new data:', data.sessionUpdate);
        try {
          // Use updateSession to update the session object
          const updatedSession = await updateSession({
            ...session,
            user: {
              ...session.user,
              ...data.sessionUpdate,
            },
          });
          console.log('Session updated successfully via updateSession:', updatedSession);
        } catch (error) {
          console.error('Failed to update session:', error);
        }
      }

      console.log('User info updated:', data.user);
      return data; // Return data for success handling
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating user info:', err);
      throw err; // Re-throw for error handling
    } finally {
      setIsLoading(false);
      isUpdatingRef.current = false;
    }
  }, [updateSession, updateLocalUserInfo, session]);

  // Clear local user info when session ends
  useEffect(() => {
    if (!session?.user?.id) {
      clearLocalUserInfo();
    }
  }, [session?.user?.id, clearLocalUserInfo]);

  return {
    userInfo: effectiveUserInfo,
    isLoading,
    error,
    refreshUserInfo,
    updateUserInfo,
  };
}