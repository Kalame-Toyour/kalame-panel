import type { InsightCard } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import React, { useState } from 'react';

type CompactInsightsProps = {
  cards: InsightCard[];
  onCardClick: (card: InsightCard) => Promise<void>;
  isLoading?: boolean;
};

export function CompactInsightsSkeleton() {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array.from({ length: 4 })].map((_, index) => (
          <div
            key={index}
            className="relative flex h-20 w-full animate-pulse flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-bl from-gray-200 to-gray-300 p-3 dark:from-gray-700 dark:to-gray-800"
          >
            <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-end justify-between">
              <div className="size-8 rounded-lg bg-gray-300 dark:bg-gray-600" />
              <div className="size-6 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CompactInsights: React.FC<CompactInsightsProps> = ({ cards, onCardClick, isLoading }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const locale = useLocale();

  if (isLoading) {
    return <CompactInsightsSkeleton />;
  }

  const handleCardClick = async (card: InsightCard, index: number) => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setSelectedCardIndex(index);

    await new Promise(resolve => setTimeout(resolve, 500));
    await onCardClick(card);

    setTimeout(() => {
      setSelectedCardIndex(null);
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto mt-1 px-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:mx-6 lg:grid-cols-4">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: selectedCardIndex === null ? 1 : selectedCardIndex === index ? 1 : 0.5,
                scale: selectedCardIndex === index ? 1.05 : 1,
                y: selectedCardIndex === index ? 5 : 0,
              }}
              exit={{
                opacity: 0,
                scale: selectedCardIndex === index ? 1.1 : 0.95,
                transition: { duration: 0.2 },
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(card, index)}
              className={`relative flex h-20 w-full flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-bl p-3 shadow-sm shadow-primary ${
                card.gradient
              } transition-all duration-300 hover:cursor-pointer hover:shadow-md`}
            >
              <div className="z-10" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="line-clamp-1 flex-1 text-sm font-bold text-white">{card.title}</h3>
                  {card.price && (
                    <span className="text-xs font-medium text-white/90">{card.price}</span>
                  )}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="absolute -bottom-2 -left-2 size-12 -rotate-12">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="size-full object-contain"
                  />
                </div>
                <div className="ml-auto">
                  <button className="z-10 rounded-full bg-black/20 p-1 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-black/40">
                    <ArrowLeft className={locale === 'fa' ? 'rotate-0' : 'rotate-180'} size={14} />
                  </button>
                </div>
              </div>
              {selectedCardIndex === index && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm dark:bg-gray-800/30">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompactInsights;
