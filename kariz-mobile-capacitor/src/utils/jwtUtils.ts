/**
 * JWT Utility Functions
 * Simple JWT token decoder for extracting user information
 */

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTPayload {
  sub?: string;
  userId?: string;
  id?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token provided to decodeJWT');
      return null;
    }

    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format - expected 3 parts, got', parts.length);
      return null;
    }

    // Decode header (not used but good to validate)
    const header = JSON.parse(atob(parts[0])) as JWTHeader;
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.warn('JWT token is expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Extract user ID from JWT token
 * @param token - JWT token string
 * @returns User ID string or null if not found
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  // Try different possible user ID fields
  // Check for nested user object first (our current structure)
  if (payload.user && payload.user.ID) {
    return payload.user.ID.toString();
  }
  
  // Fallback to other possible fields
  return payload.sub || payload.userId || payload.id || null;
}

/**
 * Check if JWT token is valid (not expired)
 * @param token - JWT token string
 * @returns boolean indicating if token is valid
 */
export function isTokenValid(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return false;

  // Check expiration
  if (payload.exp && payload.exp < Date.now() / 1000) {
    return false;
  }

  return true;
}

/**
 * Debug function to log JWT token structure
 * @param token - JWT token string
 */
export function debugJWTToken(token: string): void {
  console.log('🔍 Debugging JWT Token:');
  console.log('Token:', token);
  
  const payload = decodeJWT(token);
  if (payload) {
    console.log('Decoded payload:', payload);
    console.log('User object:', payload.user);
    console.log('User ID from user.ID:', payload.user?.ID);
    console.log('User ID from sub:', payload.sub);
    console.log('User ID from userId:', payload.userId);
    console.log('User ID from id:', payload.id);
    
    // Test the getUserIdFromToken function
    const extractedUserId = getUserIdFromToken(token);
    console.log('Final extracted userId:', extractedUserId);
  } else {
    console.log('Failed to decode token');
  }
}

/**
 * Test function to verify JWT token extraction
 * @param token - JWT token string
 * @returns Test result
 */
export function testJWTExtraction(token: string): { success: boolean; userId: string | null; error?: string } {
  try {
    const userId = getUserIdFromToken(token);
    return {
      success: !!userId,
      userId,
      error: userId ? undefined : 'No userId found in token'
    };
  } catch (error) {
    return {
      success: false,
      userId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
