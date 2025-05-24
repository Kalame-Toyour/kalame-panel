import { useEffect, useState } from 'react';
import fetchWithAuth from '../components/utils/fetchWithAuth';

export type TokenStats = {
  dailyTokensRemaining: number;
  monthlyTokensRemaining: number;
  dailyTokensTotal: number;
  monthlyTokensTotal: number;
  lastDailyReset: string;
  lastMonthlyReset: string;
};

export function useTokens() {
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenStats = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/user/tokens');
      if (!response.ok) {
        throw new Error('Failed to fetch token stats');
      }
      const data = await response.json();
      setTokenStats(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching token stats:', error);
      setError('Failed to load token information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenStats();
  }, []);

  return {
    tokenStats,
    loading,
    error,
    refetch: fetchTokenStats,
  };
}
