import type { InsightCard } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import React, { useState } from 'react';

type InsightsCardsProps = {
  cards: InsightCard[];
  onCardClick: (card: InsightCard) => Promise<void>;
};

const InsightsCards: React.FC<InsightsCardsProps> = ({ cards, onCardClick }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const locale = useLocale();

  const handleCardClick = async (card: InsightCard, index: number) => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setSelectedCardIndex(index);

    // Wait for card click animation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Call the parent handler
    await onCardClick(card);

    // Reset states after all animations complete
    setTimeout(() => {
      setSelectedCardIndex(null);
      setIsAnimating(false);
    }, 1000);
  };
  return (
    <div className="container mx-auto px-4 md:mt-8">
      <h2 className={`text-xl  ${locale === 'fa' ? 'text-right' : 'text-left'} mb-2 font-bold dark:text-white`}>امروز چه خبر؟ ✨</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: selectedCardIndex === null ? 1 : selectedCardIndex === index ? 1 : 0,
                scale: selectedCardIndex === index ? 1.1 : 1,
                y: selectedCardIndex === index ? -20 : 0,
              }}
              exit={{
                opacity: 0,
                scale: selectedCardIndex === index ? 1.2 : 0.8,
                transition: { duration: 0.3 },
              }}
              className={`w-full bg-gradient-to-bl shadow-2xl shadow-primary ${
                card.gradient
              } relative flex h-56 w-full max-w-sm flex-col justify-between overflow-hidden rounded-lg p-5 transition-all duration-300 hover:cursor-pointer sm:h-auto ${
                selectedCardIndex === null ? 'hover:scale-105' : ''
              } hover:shadow-lg`}
              onClick={() => handleCardClick(card, index)}
            >
              <div className="z-10" dir={`${locale === 'fa' ? 'rtl' : 'ltr'}`}>
                <h3 className="mb-2 text-sm font-bold ">{card.title}</h3>
                {card.price && (
                  <p className="mb-2 text-lg font-bold ">{card.price}</p>
                )}
                <p className="text-sm font-bold">{card.description}</p>
              </div>
              <button className="z-10 mt-4 self-center rounded-full bg-black p-1 text-white transition-colors duration-300 hover:bg-gray-800">
                <ArrowLeft className={`${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} size={20} />
              </button>
              <div className="absolute -bottom-4 -left-4 size-24 -rotate-12">
                <img
                  src={card.image}
                  alt={card.title}
                  className="size-full object-contain"
                />
              </div>
              {selectedCardIndex === index && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm dark:bg-gray-800">
                  <Loader2 className="animate-spin text-gray-700 dark:text-gray-300" size={32} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InsightsCards;
