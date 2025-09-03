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
  premium?: 'yes' | 'no';
  premiumExpireTime?: string;
}

/**
 * Check if user has active premium subscription
 * @param user - User object with premium properties
 * @returns true if user has active premium, false otherwise
 */
export function isUserPremium(user: any): boolean {
  if (!user) return false;
  
  // Check if user has premium status
  if (user.premium !== 'yes') return false;
  
  // Check if premium hasn't expired
  if (user.premiumExpireTime) {
    const expireDate = new Date(user.premiumExpireTime);
    const now = new Date();
    return expireDate > now;
  }
  
  // If no expiration date, consider it as active premium
  return true;
}

/**
 * Get premium expiration status
 * @param user - User object with premium properties
 * @returns object with expiration info
 */
export function getPremiumExpirationInfo(user: any) {
  if (!user || user.premium !== 'yes') {
    return { isExpired: true, daysLeft: 0, expirationDate: null };
  }

  if (!user.premiumExpireTime) {
    return { isExpired: false, daysLeft: Infinity, expirationDate: null };
  }

  const expireDate = new Date(user.premiumExpireTime);
  const now = new Date();
  const timeDiff = expireDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    isExpired: daysLeft <= 0,
    daysLeft: Math.max(0, daysLeft),
    expirationDate: expireDate,
  };
}

/**
 * Format premium expiration date for display
 * @param premiumExpireTime - ISO date string
 * @returns formatted date string in Persian
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
