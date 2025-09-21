import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useSessionRefresh() {
  const { data: session, update: updateSession } = useSession();

  const refreshSession = useCallback(async (newData: any) => {
    if (!session || !updateSession) return;

    try {
      console.log('Refreshing session with new data:', newData);
      
      // Update the session with new data
      const updatedSession = await updateSession({
        ...session,
        user: {
          ...session.user,
          ...newData,
        },
      });

      console.log('Session refreshed successfully:', updatedSession);
      return updatedSession;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      throw error;
    }
  }, [session, updateSession]);

  return { refreshSession };
}
