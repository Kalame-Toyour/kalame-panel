import { User, Zap } from 'lucide-react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import PremiumUpgrade from '../PremiumUpgrade';
import { isUserPremium } from '@/utils/premiumUtils';

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
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');

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

      {/* Premium Upgrade Box - Mobile Center - Show only when no chat is active */}
      <div className="flex-1 flex justify-center px-2">
        {user && !isUserPremium(user as any) && !chatId ? (
          <PremiumUpgrade variant="mobile" className="max-w-xs" />
        ) : (
          /* Logo with Animation - Show when user is premium, not logged in, or chat is active */
          <div className="relative">
            <img
              src="/kalame-logo.png"
              alt="logo"
              className="w-9 mx-1 animate-[spin_2s_linear_infinite_paused] rounded-2xl transition-all duration-700 hover:rotate-[360deg] hover:scale-110 hover:animate-[spin_7s_linear_infinite_running]
                hover:shadow-lg dark:brightness-90"
            />
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-green-500/20" />
          </div>
        )}
      </div>

      {/* Right spacer to balance layout */}
      <div className="w-[54px]" />
    </div>
  );
};

export default MobileHeader;
