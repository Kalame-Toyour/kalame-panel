'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import fetchWithAuth from './utils/fetchWithAuth';

type TokenStats = {
  dailyTokensRemaining: number;
  monthlyTokensRemaining: number;
  dailyTokensTotal: number;
  monthlyTokensTotal: number;
  lastDailyReset: string;
  lastMonthlyReset: string;
};

export function TokenDisplay() {
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth('/api/user/tokens');
        if (!response.ok) {
          throw new Error('Failed to fetch token stats');
        }
        const data = await response.json();
        setTokenStats(data);
      } catch (err) {
        setError('خطا در دریافت اطلاعات توکن');
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 space-y-3">
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </Card>
    );
  }

  if (!tokenStats) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Token information unavailable
        </p>
      </Card>
    );
  }

  const dailyPercentage = (tokenStats.dailyTokensRemaining / tokenStats.dailyTokensTotal) * 100;
  const monthlyPercentage = (tokenStats.monthlyTokensRemaining / tokenStats.monthlyTokensTotal) * 100;

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold dark:text-gray-100">Token Balance</h3>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Daily Tokens</span>
            <span className="text-sm font-medium text-blue-500">
              {tokenStats.dailyTokensRemaining}
              {' '}
              /
              {tokenStats.dailyTokensTotal}
            </span>
          </div>
          <Progress value={dailyPercentage} className="h-2" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Tokens</span>
            <span className="text-sm font-medium text-blue-500">
              {tokenStats.monthlyTokensRemaining}
              {' '}
              /
              {tokenStats.monthlyTokensTotal}
            </span>
          </div>
          <Progress value={monthlyPercentage} className="h-2" />
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Next daily reset:
            {getNextResetTime(tokenStats.lastDailyReset)}
          </p>
          <p>
            Next monthly reset:
            {getNextResetTime(tokenStats.lastMonthlyReset, true)}
          </p>
        </div>
      </div>
    </Card>
  );
}

function getNextResetTime(lastReset: string, isMonthly = false): string {
  const lastResetDate = new Date(lastReset);
  const nextReset = new Date(lastResetDate);

  if (isMonthly) {
    nextReset.setMonth(nextReset.getMonth() + 1);
  } else {
    nextReset.setDate(nextReset.getDate() + 1);
  }

  return nextReset.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
