import { User, Zap } from 'lucide-react';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

type MobileHeaderProps = {
  toggleProfile: () => void;
};

type ExtendedUser = {
  subscription?: {
    tier: 'free' | 'pro';
    tokens: {
      dailyTokensRemaining: number;
      dailyTokensTotal: number;
    };
  };
};

const MobileHeader: React.FC<MobileHeaderProps> = ({ toggleProfile }) => {
  const { user } = useAuth();
  const extendedUser = user as unknown as ExtendedUser;

  const defaultTokens = {
    dailyTokensRemaining: extendedUser?.subscription?.tier === 'pro' ? 100 : 5,
    dailyTokensTotal: extendedUser?.subscription?.tier === 'pro' ? 100 : 5,
  };

  // const tokens = extendedUser?.subscription?.tokens || defaultTokens;
  // const tokensUsed = tokens.dailyTokensTotal - (tokens.dailyTokensRemaining || 0);
  // const percentage = (tokensUsed / tokens.dailyTokensTotal) * 100;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900 md:hidden">
      <button
        onClick={toggleProfile}
        className="rounded-lg p-2 mx-2 font-bold text-primary transition-colors hover:bg-gray-100 dark:text-primary dark:hover:bg-gray-800"
      >
        <User size={30} />
      </button>

      {/* Token Usage Display */}
      {/* <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative mx-2 inline-flex items-center rounded-full bg-amber-100 p-3 dark:bg-amber-900/40">
          <div className="relative z-10 flex items-center gap-1.5">
            <Zap className="text-amber-500 dark:text-amber-300" size={14} />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {tokensUsed}
              {' / '}
              {tokens.dailyTokensTotal}
            </span>
          </div>
          <div className="absolute inset-0 rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 opacity-20 transition-all duration-500 dark:from-amber-600 dark:to-amber-400"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div> */}

      {/* Logo with Animation */}
      <div className="relative">
        <img
          src="/kalame-logo.png"
          alt="logo"
          className="w-9 mx-1 animate-[spin_2s_linear_infinite_paused] rounded-2xl transition-all duration-700 hover:rotate-[360deg] hover:scale-110 hover:animate-[spin_7s_linear_infinite_running]
            hover:shadow-lg dark:brightness-90"
        />
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-green-500/20" />
      </div>
    </div>
  );
};

export default MobileHeader;
