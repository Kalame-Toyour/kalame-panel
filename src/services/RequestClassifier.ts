export type RequestType =
  | 'basic_chat'
  | 'market_analysis'
  | 'portfolio_overview'
  | 'custom_trading_strategy'
  | 'advanced_market_analysis'
  | 'ai_trading_assistant';

export type RequestClassification = {
  type: RequestType;
  tokenCost: number;
  confidence: number;
};

const TOKEN_COSTS: Record<RequestType, number> = {
  basic_chat: 1,
  market_analysis: 5,
  portfolio_overview: 2,
  custom_trading_strategy: 15,
  advanced_market_analysis: 10,
  ai_trading_assistant: 8,
};

// Keywords and patterns for each request type
const REQUEST_PATTERNS: Record<RequestType, string[]> = {
  basic_chat: [
    'what is',
    'how to',
    'can you explain',
    'tell me about',
    'help me understand',
    'what do you think',
  ],
  market_analysis: [
    'market analysis',
    'price analysis',
    'market overview',
    'market trend',
    'price prediction',
    'market sentiment',
    'technical analysis',
    'analyze the market',
  ],
  portfolio_overview: [
    'portfolio',
    'my holdings',
    'my investments',
    'portfolio analysis',
    'asset allocation',
    'portfolio performance',
  ],
  custom_trading_strategy: [
    'trading strategy',
    'investment strategy',
    'trading plan',
    'custom strategy',
    'strategy for',
    'trading approach',
    'risk management strategy',
    'entry exit points',
  ],
  advanced_market_analysis: [
    'detailed analysis',
    'deep dive',
    'comprehensive analysis',
    'advanced technical analysis',
    'correlation analysis',
    'volume analysis',
    'order book analysis',
  ],
  ai_trading_assistant: [
    'trading advice',
    'should i buy',
    'should i sell',
    'trading recommendation',
    'trade suggestion',
    'entry point',
    'exit point',
    'stop loss',
  ],
};

export class RequestClassifier {
  private static async classifyWithAI(text: string): Promise<RequestClassification> {
    // This is a placeholder for actual AI classification
    // You should implement this using your AI model
    // For now, we'll use pattern matching
    return RequestClassifier.classifyWithPatterns(text);
  }

  private static classifyWithPatterns(text: string): RequestClassification {
    const normalizedText = text.toLowerCase();
    let bestMatch: RequestType = 'basic_chat';
    let highestConfidence = 0;

    // Check each request type's patterns
    for (const [type, patterns] of Object.entries(REQUEST_PATTERNS)) {
      const matches = patterns.filter(pattern =>
        normalizedText.includes(pattern.toLowerCase()),
      );

      const confidence = matches.length / patterns.length;
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = type as RequestType;
      }
    }

    return {
      type: bestMatch,
      tokenCost: TOKEN_COSTS[bestMatch],
      confidence: highestConfidence,
    };
  }

  public static async classifyRequest(text: string): Promise<RequestClassification> {
    // First try AI classification
    try {
      return await RequestClassifier.classifyWithAI(text);
    } catch (error) {
      // Fallback to pattern matching if AI fails
      console.warn('AI classification failed, falling back to pattern matching:', error);
      return RequestClassifier.classifyWithPatterns(text);
    }
  }
}
