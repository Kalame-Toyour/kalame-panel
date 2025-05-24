import type { InsightCard } from '@/types';
import { useCallback, useState } from 'react';

type InsightCardsState = {
  insightCards: InsightCard[];
  isLoadingInsightCards: boolean;
  handleCardClick: (card: InsightCard) => Promise<void>;
  fetchInsightCards: () => Promise<void>;
};

export const useInsightCards = (): InsightCardsState => {
  const [insightCards, setInsightCards] = useState<InsightCard[]>([]);
  const [isLoadingInsightCards, setIsLoadingInsightCards] = useState(true);

  const handleCardClick = useCallback(async (_card: InsightCard) => {
    try {
      // Implement your card click logic here
      // Example: You might want to fetch more details or perform some action
    } catch (error) {
      console.error('Error handling card click:', error);
    }
  }, []);

  const fetchInsightCards = useCallback(async () => {
    setIsLoadingInsightCards(true);
    try {
      const response = await fetch(`/api/insights`);
      if (!response.ok) {
        throw new Error('Failed to fetch insight cards');
      }
      const data = await response.json();
      setInsightCards(data);
    } catch (error) {
      console.error('Error fetching insight cards:', error);
    } finally {
      setIsLoadingInsightCards(false);
    }
  }, []);

  return {
    insightCards,
    isLoadingInsightCards,
    fetchInsightCards,
    handleCardClick,
  };
};
