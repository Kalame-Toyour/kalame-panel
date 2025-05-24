import { type Market, TRADINGVIEW_EXCHANGE_MAP } from '@/types';

export const formatTradingViewSymbol = (exchange: string, market: Market | null): string => {
  if (!market) {
    const exchangePrefix = TRADINGVIEW_EXCHANGE_MAP[exchange as keyof typeof TRADINGVIEW_EXCHANGE_MAP] || 'BINANCE';
    return `${exchangePrefix}:BTCUSDT`;
  }
  const exchangePrefix = TRADINGVIEW_EXCHANGE_MAP[exchange as keyof typeof TRADINGVIEW_EXCHANGE_MAP] || 'BINANCE';
  const baseSymbol = market.base || 'BTC';
  return `${exchangePrefix}:${baseSymbol}USDT`;
};
