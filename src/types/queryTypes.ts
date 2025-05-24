export enum QueryType {
  GENERAL = 'general',
  PRICE = 'price',
  NEWS = 'news',
  GUIDE = 'guide',
  COINDATA = 'coindata',
  TECHNICAL_ANALYSIS = 'technical_analysis',
  FUNDAMENTAL_ANALYSIS = 'fundamental_analysis',
  COMPREHENSIVE_ANALYSIS = 'comprehensive_analysis',
  EXCHANGE = 'exchange',
  WALLET = 'wallet',
  DEFI = 'defi', // New: DeFi-related queries
  NFT = 'nft', // New: NFT-related queries
  SECURITY = 'security', // New: Security and safety queries
  REGULATION = 'regulation', // New: Regulatory and legal queries
  MINING = 'mining', // New: Mining and staking queries
  COMPARISON = 'comparison', // New: Comparing different cryptocurrencies
  ERROR = 'error', // New: Error messages and troubleshooting
  HISTORICAL = 'historical', // New: Historical data and past performance
  PREDICTION = 'prediction', // New: Future predictions and forecasts
  TRENDING = 'trending',
}

export type DocumentMetadata = {
  title: string;
  publishedAt: string;
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  importanceScore: number;
  currencies: string[];
  author?: string;
  imageUrls?: string[];
  contentType: 'news' | 'analysis' | 'guide' | 'tutorial';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  relatedProjects?: string[];
  marketImpact?: {
    short_term: 'positive' | 'negative' | 'neutral';
    long_term: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  validUntil?: string;
  lastVerified?: string;
};

export type DocumentWithMetadata = {
  id?: number;
  content: string;
  embedding?: string;
  tags?: string[];
  topics?: Array<{ name: string; confidence: number }>;
  entityMentions?: Array<{
    entity: string;
    type: 'cryptocurrency' | 'person' | 'organization' | 'technology';
    count: number;
  }>;
  technicalConcepts?: Array<{
    concept: string;
    category: 'protocol' | 'token' | 'technology' | 'trading';
    relevance: number;
  }>;
  metadata: DocumentMetadata;
  similarity?: number;
};

export type MultilingualQueryMap = {
  [language: string]: {
    [key: string]: QueryType;
  };
};

type QueryContext = {
  timeframe?: string;
  location?: string;
  platform?: string;
  contentType?: string[];
  technicalLevel?: string;
  sentiment?: string;
  technicalIndicators?: string[];
};

// Update QueryClassification to include the needed properties
export type QueryClassification = {
  queryType: QueryType;
  cryptoName?: string;
  language: string;
  confidence?: number;
  entities?: Array<{ value: string }>;
  keywords?: string[];
  intent?: {
    primary: string;
    secondary?: string;
    action?: string;
  };
  context?: QueryContext;
};

export type DetailedQueryClassification = {
  subtype?: string;
} & QueryClassification;

export type ContextDocument = {
  content: string;
  similarity: number;
  sentimentScore?: number;
  publishedAt?: string;
  metadata?: Record<string, any>;
};

export type ContextAnalysisResult = {
  documents: DocumentWithMetadata[];
  overallSentiment: number;
  metadata: {
    totalResults: number;
    averageRelevance: number;
    queryTimestamp: string;
    error?: string;
  };
};

export type CryptoAnalysisResult = {
  queryType: QueryType;
  data: any;
  language: string;
  sentiment?: number;
};
