// src/types/index.ts

import type { DocumentWithMetadata } from './queryTypes';

export type MessageType = 'text' | 'chart' | 'crypto-trade-form' | 'portfolio' | 'insight-response';

export type ExchangeAccount = {
  exchangeId: string;
  apiKey: string;
  secret: string;
};
export type Message = { 
  id: string ;
  type: MessageType;
  text: string ;
  sender: 'user' | 'ai';
  isWelcomeMessage?: boolean;
  isStreaming?: boolean;
  selectableAnswers?: string[];
  symbol?: string;
  chartKey?: number;
  videoUrl?: string;
  coverUrl?: string;
  coinData?: any;
  language?: string;
  isPriceQuery?: boolean;
  isError?: boolean;
  errorType?: string;
  showRechargeButton?: boolean;
};

export type CryptoAnalysis = {
  currentPrice: string;
  priceChange: {
    percentage: string;
    amount: string;
  };
  detailedAnalysis: {
    analysis: {
      current_price_assessment: {
        price: string;
        assessment: string;
      };
      price_change_analysis: {
        change: string;
        assessment: string;
      };
      technical_indicators: {
        assessment: string;
      };
      market_sentiment: {
        assessment: string;
      };
      trading_recommendation: {
        recommendation: string;
        explanation: string;
      };
      additional_notes: string[];
    };
  };
};

// Base types
export type BaseNewsItem = {
  id: number;
  title: string;
  content: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
};

export type NewsSentiment = 'positive' | 'neutral' | 'negative';

export type NewsMetrics = {
  sentiment: NewsSentiment;
  importanceScore: number; // 0-10
  relevance?: number; // 0-1
};

export type NewsVotes = {
  positive: number;
  negative: number;
  important: number;
};

// Combined types
export type NewsItem = BaseNewsItem & NewsMetrics;

export type AnalyzedNewsItem = NewsItem & {
  votes: NewsVotes;
  marketImpact?: MarketImpact;
};

// Market impact types
export type ImpactType = 'positive' | 'negative' | 'neutral';

export type MarketImpact = {
  impact: ImpactType;
  confidence: number; // 0-1
  keyFactors: string[];
};

export type MarketImpactAnalysis = {
  shortTerm: MarketImpact;
  longTerm: MarketImpact;
  relevantNews: Array<{
    title: string;
    sentiment: NewsSentiment;
    importance: number;
    timestamp: string;
  }>;
  overallAssessment: string;
};

export type NewsAnalysis = {
  latestNews: AnalyzedNewsItem[];
  metrics: {
    overallSentiment: number; // -1 to 1
    sentimentTrend: NewsSentiment;
    topKeywords: string[];
  };
  marketImpact: MarketImpactAnalysis;
};

type PricePrediction = {
  predictedPrice: number | null;
  confidence: number;
  timestamp: string;
  error?: string;
};

export type TechnicalAnalysis = {
  rsi: {
    value: number;
    trend: string;
    history: number[];
  };
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: string;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    width: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    trend: string;
  };
  prediction: PricePrediction;
};

export type VectorSearchResult = {
  id: number;
  content: string;
  similarity: number;
};

export type CoinData = {
  image: string | undefined;
  rank: string;
  changePercent24HrUsd: number;
  changePercent7dUsd: number;
  changePercent30dUsd: number;
  changePercent1yUsd: number;
  marketCapUsd: number;
  volumeUsd24Hr: number;
  ath: string;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: any;
  website: string | undefined;
  twitter: any;
  priceUsd: any;
  name: string;
  symbol: string;
  price: number;
  amount: number;
  tradingviewSymbol: string;
  detailedAnalysis?: any;
  error?: string;
};

export type ApiChatResponse = {
  detailedAnalysis?: any;
  text?: string;
  queryType?: string;
  coinData?: CoinData;
  contextDocuments?: DocumentWithMetadata;
  language?: string;
  sentiment?: number;
  isPriceQuery?: boolean;
  relatedQuestions?: Array<{ name: string }>;
  error?: string;
};

export type CurrencyInputProps = {
  isBuying: boolean;
  fromCurrency: string;
  fromBalance: number | undefined;
  firstAmount: string;
  secondAmount: string;
  selectedMarket: Market | null;
  handleFirstAmountChange: (value: string) => void;
  handleSecondAmountChange: (value: string) => void;
};

export type TradeFormState = {
  fromCurrency: string;
  firstAmount: string;
  secondAmount: string;
  isBuying: boolean;
  selectedExchange: string;
  selectedMarket: Market | null;
};

export type InsightCard = {
  id: string;
  title: string;
  price?: string;
  description: string;
  gradient: string;
  image: string;
  category: 'market' | 'defi' | 'nft' | 'news';
};

export type InsightResponse = {
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    coverUrl?: string;
    response: string;
    category: string;
  };
};

export type ArticleData = {
  ID: number | bigint; // Match the schema's ID field name
  external_id: string;
  source: string;
  title: string;
  content: string;
  summary?: string;
  market_impact?: string;
  published_at: Date | string;
  importance_score?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  status?: 'Active' | 'Inactive';
};

export type ChatInputProps = {
  inputText: string;
  setInputText: (text: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  onChartRequest: (symbol: string) => void;
  onCryptoTradeRequest: () => void;
  onCryptoPortfolioRequest: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
};

export type ChatMessageContainerProps = {
  messages: Message[];
  copyToClipboard: (text: string) => void;
  onSelectAnswer: (text: string) => void;
};

export type Market = {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  active: boolean;
  type: string;
  spot: boolean;
};

export type ExchangeOption = {
  value: string;
  label: string;
  ccxtId: string;
};

export type Balance = {
  [key: string]: number;
};

export type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  label: string;
  type?: 'currency' | 'exchange';
};

// constants.ts
export const EXCHANGE_ICONS = {
  'صرافی بایننس': '/images/exchanges/binance.png',
  'صرافی بینگ ایکس': '/images/exchanges/bingx.png',
  'صرافی مکس': '/images/exchanges/mexc.png',
  'صرافی ال بنک': '/images/exchanges/lbank.png',
};

export const CURRENCY_ICONS = {
  BTC: '/images/currencies/bitcoin.png',
  USDT: '/images/currencies/tether.png',
  IRT: '/images/currencies/toman.png',
};

export const EXCHANGES: ExchangeOption[] = [
  { value: 'صرافی بایننس', label: 'صرافی بایننس', ccxtId: 'binance' },
  { value: 'صرافی بینگ ایکس', label: 'صرافی بینگ ایکس', ccxtId: 'bingx' },
  { value: 'صرافی مکس', label: 'صرافی مکس', ccxtId: 'mexc' },
  { value: 'صرافی ال بنک', label: 'صرافی ال بنک', ccxtId: 'lbank' },
];

export const TRADINGVIEW_EXCHANGE_MAP = {
  'صرافی بایننس': 'BINANCE',
  'صرافی بینگ ایکس': 'BINGX',
  'صرافی مکس': 'MEXC',
  'صرافی ال بنک': 'LBANK',
};

export const CURRENCY_MAP = {
  'تومان': 'IRT',
  'بیت کوین': 'btc',
  'USDT': 'USDT',
};
export type OHLCVData = {
  timestamp: number;
  close: number;
};

export type ChartDataPoint = {
  time: number;
  value: number;
};

export type ProcessedAsset = {
  coin: string;
  amount: number;
  currentPrice: number;
  valueUSD: number;
};

export type ProfitLossData = {
  percentChange: number;
  amountChange: number;
  isProfit: boolean;
  firstTotalValue: number;
};

export type PortfolioChartProps = {
  portfolioChartData: OHLCVData[];
  profitLossData: ProfitLossData;
  chartTimeframe: '1h' | '1d' | '1w';
  onTimeframeChange: (timeframe: '1h' | '1d' | '1w') => void;
};

export type AssetsHistoryProps = {
  selectedTab: 'history' | 'assets';
  trades: any[];
  processedAssets: ProcessedAsset[];
  isLoadingAssetPrices: boolean;
  onTabChange: (tab: 'history' | 'assets') => void;
};

export type PortfolioHeaderProps = {
  selectedExchange: string;
  isExchangeDropdownOpen: boolean;
  searchQuery: string;
  exchangeDropdownRef: React.RefObject<HTMLDivElement>;
  onExchangeChange: (newExchange: string) => void;
  onOpenDropdownChange: (isOpen: boolean) => void;
  onSearchQueryChange: (query: string) => void;
};
