import { useState, useEffect, useCallback } from 'react';

export function useInternetConnection() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // Check if we're online
  const checkOnlineStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  // Manual retry function
  const retryConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const isConnected = await checkOnlineStatus();
      setIsOnline(isConnected);
      return isConnected;
    } catch (error) {
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [checkOnlineStatus]);

  // Check connection on mount and when online status changes
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkOnlineStatus();
      setIsOnline(connected);
    };

    checkConnection();

    // Set up event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkOnlineStatus]);

  return {
    isOnline,
    isChecking,
    retryConnection
  };
} 