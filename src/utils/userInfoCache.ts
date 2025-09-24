/**
 * UserInfo caching utility with 10-minute cache duration
 */

interface CachedUserInfo {
  data: Record<string, unknown>;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const CACHE_KEY = 'userInfo_cache';

class UserInfoCache {
  private cache: CachedUserInfo | null = null;

  constructor() {
    // Load cache from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load userInfo cache from localStorage:', error);
      this.cache = null;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      if (this.cache) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (error) {
      console.error('Failed to save userInfo cache to localStorage:', error);
    }
  }

  get(): Record<string, unknown> | null {
    if (!this.cache) {
      this.loadFromStorage();
    }

    if (!this.cache) {
      return null;
    }

    const now = Date.now();
    if (now > this.cache.expiresAt) {
      // Cache expired
      this.clear();
      return null;
    }

    return this.cache.data;
  }

  set(data: Record<string, unknown>): void {
    const now = Date.now();
    this.cache = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };
    this.saveToStorage();
  }

  clear(): void {
    this.cache = null;
    this.saveToStorage();
  }

  isExpired(): boolean {
    if (!this.cache) return true;
    return Date.now() > this.cache.expiresAt;
  }

  getTimeUntilExpiry(): number {
    if (!this.cache) return 0;
    return Math.max(0, this.cache.expiresAt - Date.now());
  }
}

// Export singleton instance
export const userInfoCache = new UserInfoCache();

// Helper function to check if we should fetch user info
export function shouldFetchUserInfo(forceRefresh: boolean = false): boolean {
  if (forceRefresh) return true;
  return userInfoCache.isExpired();
}

// Helper function to get cached user info
export function getCachedUserInfo(): Record<string, unknown> | null {
  return userInfoCache.get();
}

// Helper function to set cached user info
export function setCachedUserInfo(data: Record<string, unknown>): void {
  userInfoCache.set(data);
}

// Helper function to clear cached user info
export function clearCachedUserInfo(): void {
  userInfoCache.clear();
}
