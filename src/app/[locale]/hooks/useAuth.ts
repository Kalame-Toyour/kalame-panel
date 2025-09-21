import { useSession } from 'next-auth/react';
import { useUserInfoContext } from '../contexts/UserInfoContext';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const { localUserInfo } = useUserInfoContext();

  // Use localUserInfo as the primary source for user data when available
  const user = localUserInfo ? {
    id: localUserInfo.id,
    name: localUserInfo.username,
    userType: localUserInfo.userType,
    // Keep other session data for compatibility
    ...session?.user
  } : session?.user;

  return {
    user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    updateSession: update,
  };
}
