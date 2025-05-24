import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    updateSession: update,
  };
}
