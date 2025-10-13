import { User } from 'lucide-react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import PremiumUpgrade from '../PremiumUpgrade';
import { isUserPremium } from '@/utils/premiumUtils';
import { useUserInfoContext } from '../../contexts/UserInfoContext';
import { useDynamicContent } from '@/utils/dynamicContent';

type MobileHeaderProps = {
  toggleProfile: () => void;
};

const MobileHeader: React.FC<MobileHeaderProps> = ({ toggleProfile }) => {
  const { user } = useAuth();
  const { localUserInfo } = useUserInfoContext();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');
  const content = useDynamicContent();

  const showPremiumUpgrade = user && localUserInfo && !isUserPremium(localUserInfo) && !chatId;
  const showLogo = !showPremiumUpgrade;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800 md:hidden">
      <button
        onClick={toggleProfile}
        className="rounded-lg p-2 mx-2 font-bold text-primary transition-colors hover:bg-gray-100 dark:text-primary dark:hover:bg-gray-700"
      >
        <User size={30} />
      </button>

      {/* Premium Upgrade Box - Mobile Center - Show only when no chat is active */}
      {showPremiumUpgrade && (
        <div className="flex-1 flex justify-center px-2">
          <PremiumUpgrade variant="mobile" className="max-w-xs" />
        </div>
      )}

      {/* Logo with Animation - Show when user is premium, not logged in, or chat is active */}
      {showLogo && (
        <div className="relative">
          <img
            src={content.logo}
            alt="logo"
            className="w-9 mx-1 animate-[spin_2s_linear_infinite_paused] rounded-2xl transition-all duration-700 hover:rotate-[360deg] hover:scale-110 hover:animate-[spin_7s_linear_infinite_running]
              hover:shadow-lg dark:brightness-110"
          />
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-green-500/20 dark:bg-green-400/30" />
        </div>
      )}

      {/* Right spacer to balance layout when logo is not shown */}
      {!showLogo && <div className="w-[54px]" />}
    </div>
  );
};

export default MobileHeader;
