import type { Market } from '@/types';
import { useEffect, useState } from 'react';

export const useMarketState = (markets: Market[]) => {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    if (markets && markets.length > 0) {
      const currencies = markets.map(market => ({
        value: market.symbol,
        label: `${market.base}/${market.quote}`,
      }));
      setAvailableCurrencies(currencies);

      // Try to set a default market if not already set
      if (!selectedMarket) {
        const defaultMarket = markets.find(m => m.base === 'BTC' && m.quote === 'USDT') || markets[0];
        if (defaultMarket) {
          setSelectedMarket(defaultMarket);
        }
      }
    }
  }, [markets]);

  const handleMarketChange = (marketOrSymbol: Market | string) => {
    // Check if the input is a string (symbol) or a Market object
    const market = typeof marketOrSymbol === 'string'
      ? markets.find(m => m.symbol === marketOrSymbol)
      : marketOrSymbol;

    if (market) {
      setSelectedMarket(market);
      return market;
    }

    return null;
  };

  return {
    selectedMarket,
    setSelectedMarket,
    availableCurrencies,
    handleMarketChange,
  };
};
