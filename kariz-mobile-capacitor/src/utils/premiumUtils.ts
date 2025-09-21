/**
 * Utility functions for premium subscription management
 */

export interface PremiumUser {
  id: string;
  username?: string | null;
  mobile?: string | null;
  status?: string | null;
  authSource?: string;
  googleAuthId?: string;
  accessToken?: string;
  refreshToken?: string;
  image?: string;
  expiresAt?: number;
  name?: string | null;
  email?: string | null;
  userType?: 'free' | 'promotion' | 'premium';
}

/**
 * Check if user has active premium subscription
 * @param user - User object with premium properties
 * @returns true if user has active premium, false otherwise
 */
export function isUserPremium(user: PremiumUser): boolean {
  if (!user) return false;
  
  // Use userType as the only indicator
  if (user.userType === 'premium') return true;
  if (user.userType === 'promotion') return true; // promotion is also considered premium
  if (user.userType === 'free') return false;
  
  // Default to false if userType is not defined
  return false;
}

// Helper function to get user info from localStorage
export function getUserInfoFromStorage(): PremiumUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const userInfo = JSON.parse(stored);
      return {
        id: userInfo.ID?.toString() || '',
        username: userInfo.username || userInfo.fname,
        userType: userInfo.user_type || 'free'
      };
    }
  } catch (error) {
    console.error('Failed to parse stored user info:', error);
  }
  
  return null;
}

/**
 * Get premium expiration status
 * @param user - User object with premium properties
 * @returns object with expiration info
 */
export function getPremiumExpirationInfo(user: PremiumUser) {
  if (!user || !isUserPremium(user)) {
    return { isExpired: true, daysLeft: 0, expirationDate: null };
  }

  // For now, we don't have expiration info for userType-based premium
  // This can be extended if needed in the future
  return { isExpired: false, daysLeft: Infinity, expirationDate: null };
}

/**
 * Get user account type display text
 * @param user - User object with userType property
 * @returns display text for user account type
 */
export function getUserAccountTypeText(user: PremiumUser): string {
  if (!user) return 'اکانت رایگان';
  
  switch (user.userType) {
    case 'premium':
      return 'اکانت پیشرفته';
    case 'promotion':
      return 'اکانت ویژه الکامپ';
    case 'free':
    default:
      return 'اکانت رایگان';
  }
}

/**
 * Format premium expiration date for display
 * @param premiumExpireTime - ISO date string
 * @returns formatted date string in Persian
 * @deprecated This function is no longer used since we removed premium field
 */
export function formatPremiumExpirationDate(premiumExpireTime: string): string {
  try {
    const date = new Date(premiumExpireTime);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting premium expiration date:', error);
    return 'نامشخص';
  }
}
