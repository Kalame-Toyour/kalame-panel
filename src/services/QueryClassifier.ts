/* eslint-disable no-console */
import type { DetailedQueryClassification } from '@/types/queryTypes';
import { QueryType } from '@/types/queryTypes';
import { type GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const SUPPORTED_COINS = [
  'bitcoin',
  'ethereum',
  'shiba-inu',
  'dogecoin',
  'solana',
  'cardano',
  'binance-coin',
  'polkadot',
  'ripple',
  'tether',
];

const queryClassificationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    queryType: {
      type: SchemaType.STRING,
      description: 'The type of cryptocurrency query (general, price, news, coindata, technical_analysis, fundamental_analysis, comprehensive_analysis, guide, exchange, wallet, defi, nft, security, regulation, mining, comparison, error, historical, prediction, trending)',
    },
    cryptoName: {
      type: SchemaType.STRING,
      description: 'The standardized name of the cryptocurrency mentioned in the query',
    },
    language: {
      type: SchemaType.STRING,
      description: 'The detected language of the query (e.g., en, fa, es, fr, de, zh, ar)',
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: 'Confidence score of the classification between 0 and 1',
    },
    subtype: {
      type: SchemaType.STRING,
      description: 'More specific categorization of the query',
    },
    entities: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: 'Related entities (coins, exchanges, etc.)',
    },
    keywords: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: 'Important keywords from the query',
    },
    intent: {
      type: SchemaType.OBJECT,
      properties: {
        primary: {
          type: SchemaType.STRING,
          description: 'Primary intent of the query',
        },
        secondary: {
          type: SchemaType.STRING,
          description: 'Secondary intent if present',
        },
        action: {
          type: SchemaType.STRING,
          description: 'Specific action requested',
        },
      },
      required: ['primary'],
      description: 'User intent analysis',
    },
    context: {
      type: SchemaType.OBJECT,
      properties: {
        timeframe: {
          type: SchemaType.STRING,
          enum: ['1h', '24h', '7d', '30d', 'all'],
          description: 'Time frame for the query like today(is 24h), this week(is 7d), this month(is 30d), etc.',
        },
        location: {
          type: SchemaType.STRING,
          description: 'Geographic location context',
        },
        platform: {
          type: SchemaType.STRING,
          description: 'Platform or service context',
        },
        sortBy: {
          type: SchemaType.STRING,
          enum: ['latest', 'relevance', 'importance'],
          description: 'How to sort the results',
        },
        contentType: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
            enum: ['news', 'analysis', 'guide', 'tutorial'],
          },
          description: 'Types of content requested',
        },
        technicalLevel: {
          type: SchemaType.STRING,
          enum: ['beginner', 'intermediate', 'advanced', 'all'],
          description: 'Technical level requested',
        },
        sentiment: {
          type: SchemaType.STRING,
          enum: ['positive', 'negative', 'neutral', 'all'],
          description: 'Sentiment filter requested',
        },
      },
      description: 'Additional context information',
    },
  },
  required: ['queryType', 'language', 'confidence', 'entities', 'keywords', 'intent'],
} as any;

export class QueryClassifier {
  private genAI: GoogleGenerativeAI;

  constructor(genAI: GoogleGenerativeAI) {
    this.genAI = genAI;
  }

  async classify(inputText: string): Promise<DetailedQueryClassification> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash-8b-001',
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: queryClassificationSchema,
        },
      });

      const classificationPrompt = `
      You are a multilingual cryptocurrency expert assistant. Analyze this query: "${inputText}"

      Important: Provide a detailed classification of this query, considering:
      1. The query's language and any cultural context
      2. The main topic and intent
      3. Supported cryptocurrencies: ${SUPPORTED_COINS.join(', ')}
      4. Map non-English crypto names to English (e.g., "بیت کوین" -> "bitcoin")
      5. The type of information or action being requested

      The query should be classified into one of these types:
      ${Object.values(QueryType).join(', ')}

      Consider the full context and meaning, not just keywords.
      
      Return a JSON object with the classification details.`;

      const classificationResponse = await model.generateContent(classificationPrompt);
      const responseText = classificationResponse.response.text().trim();

      // Additional cleanup in case the model still includes any unwanted characters
      const cleanJson = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const classificationJson = JSON.parse(cleanJson);

      console.log('Query classification result:', classificationJson);
      // Simple validation of model response
      return {
        queryType: this.validateQueryType(classificationJson.queryType),
        cryptoName: this.validateCryptoName(classificationJson.cryptoName),
        language: classificationJson.language,
        confidence: classificationJson.confidence,
        entities: classificationJson.entities || [],
        keywords: classificationJson.keywords || [],
        intent: classificationJson.intent || { primary: 'unknown' },
        context: classificationJson.context || {},
      };
    } catch (error) {
      console.error('Query classification error:', error);
      return this.getDefaultClassification();
    }
  }

  // Simple validation methods instead of extensive mappings
  private validateQueryType(queryType: string): QueryType {
    return Object.values(QueryType).includes(queryType as QueryType)
      ? queryType as QueryType
      : QueryType.GENERAL;
  }

  private validateCryptoName(cryptoName: string | null): string | undefined {
    if (!cryptoName) {
      return undefined;
    }
    return SUPPORTED_COINS.includes(cryptoName.toLowerCase())
      ? cryptoName.toLowerCase()
      : undefined;
  }

  private getDefaultClassification(): DetailedQueryClassification {
    return {
      queryType: QueryType.GENERAL,
      language: 'en',
      confidence: 0.5,
      entities: [],
      keywords: [],
      intent: { primary: 'unknown' },
    };
  }
}
