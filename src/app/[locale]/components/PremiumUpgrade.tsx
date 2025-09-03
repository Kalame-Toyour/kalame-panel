'use client';

import { Crown, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PremiumUpgradeProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

function PremiumUpgrade({ className = '', variant = 'desktop' }: PremiumUpgradeProps) {
  const router = useRouter();

  const handleUpgradeClick = () => {
    // Navigate to premium upgrade page or show modal
    router.push('/pricing');
  };

  if (variant === 'mobile') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative mx-1 my-0.5 overflow-hidden rounded-xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-1 shadow-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-gray-900/30 ${className}`}
        onClick={handleUpgradeClick}
      >
        {/* Glassmorphism background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-500/15 to-amber-600/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        <div className="relative z-10 flex items-center gap-1.5">
          <div className="flex size-6 items-center justify-center rounded-full bg-amber-500/30 backdrop-blur-sm">
            <Crown className="size-3 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">ارتقا اکانت</p>
          </div>
          <ArrowLeft className="size-3 text-gray-600 dark:text-gray-400" />
        </div>
        
        {/* Glassmorphism hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-white/5 to-orange-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative cursor-pointer overflow-hidden rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2 mt-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/15 dark:hover:bg-gray-900/30 ${className}`}
      onClick={handleUpgradeClick}
    >
      {/* Glassmorphism background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-500/15 to-amber-600/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <div className="relative z-10">
        {/* Ultra compact header */}
        <div className="mb-1 flex items-center gap-1">
          <div className="flex size-5 items-center justify-center rounded-full bg-amber-500/30 backdrop-blur-sm">
            <Crown className="size-2.5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200">ارتقا اکانت</h3>
        </div>

        {/* Mini CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-md bg-gradient-to-r from-amber-500/30 to-orange-500/30 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 backdrop-blur-sm transition-all hover:from-amber-500/40 hover:to-orange-500/40"
        >
          ارتقا
        </motion.button>
      </div>

      {/* Glassmorphism hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-white/5 to-orange-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}

export default PremiumUpgrade;
