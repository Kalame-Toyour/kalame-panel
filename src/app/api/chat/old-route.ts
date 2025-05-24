// import { MySQLVectorStore } from '@/libs/vectorStore';
// import * as chatDialog from '@/models/ChatDialog';
// import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
// const vectorStore = new MySQLVectorStore();

// const SUPPORTED_COINS = [
//   'bitcoin',
//   'ethereum',
//   'shiba-inu',
//   'dogecoin',
//   'solana',
//   'cardano',
//   'binance-coin',
//   'polkadot',
//   'ripple',
//   'tether',
// ];

// const SYSTEM_PROMPT = `You are a cryptocurrency expert assistant. You MUST follow these strict rules:

//    1. COIN NAME RULES:
//    - You can ONLY use these exact coin names in the cryptoName field: ${SUPPORTED_COINS.join(', ')}
//    - When users ask about cryptocurrencies in any language, you MUST map to these standard English names
//    - Examples:
//      * "بیت کوین" -> cryptoName: "bitcoin"
//      * "اتریوم" -> cryptoName: "ethereum"
//      * "ریپل" or "xrp" -> cryptoName: "ripple"
//      * "دوج کوین" -> cryptoName: "dogecoin"
//      * "شیبا" -> cryptoName: "shiba-inu"

// 2. QUERY CLASSIFICATION:
//    - Price/market queries -> isPriceQuery: true
//    - General information queries -> isPriceQuery: false
//    - Always set cryptoName if any supported coin is mentioned

//    3. LANGUAGE RULES:
//    - Detect user's input language
//    - Provide all responses (generalResponse, analysis, related questions) in the user's language
//    - Match the formal/informal tone of the user's input

// 4. RELATED QUESTIONS:
//    - Include exactly 3 related questions
//    - Use the same language as the user's query
//    - Use first-person perspective
//    - Match the user's tone (formal/informal)

// Remember: NEVER use translated coin names in the cryptoName field - ONLY use the standard English names from the supported list.`;

// // Comprehensive Query Classification Schema
// const queryClassificationSchema = {
//   type: SchemaType.OBJECT,
//   properties: {
//     queryType: {
//       type: SchemaType.STRING,
//       enum: [
//         'general',
//         'price',
//         'news',
//         'specific_news',
//         'technical_analysis',
//         'fundamental_analysis',
//         'comprehensive_analysis',
//       ],
//     },
//     cryptoName: SchemaType.STRING,
//     language: SchemaType.STRING,
//     confidence: SchemaType.NUMBER,
//   },
// };

// // Enhanced Crypto Analysis Route
// export class CryptoAnalysisRouter {
//   private vectorStore: MySQLVectorStore;
//   private genAI: GoogleGenerativeAI;
//   private mlAnalyzer: MachineLearningAnalyzer;
//   private sentimentAnalyzer: SentimentAnalyzer;

//   constructor() {
//     this.vectorStore = new MySQLVectorStore();
//     this.genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
//     this.mlAnalyzer = new MachineLearningAnalyzer();
//     this.sentimentAnalyzer = new SentimentAnalyzer();
//   }

//   // Comprehensive query classification
//   async classifyQuery(inputText: string): Promise<{
//     queryType: string;
//     cryptoName: string;
//     language: string;
//   }> {
//     const classificationModel = this.genAI.getGenerativeModel({
//       model: 'gemini-1.5-flash-8b-001',
//       generationConfig: {
//         temperature: 0.7,
//         responseMimeType: 'application/json',
//         responseSchema: queryClassificationSchema,
//       },
//     });

//     try {
//       // Detect language first
//       const language = await detectLanguage(inputText);

//       // Perform classification
//       const classificationResponse = await classificationModel.generateContent(
//         `Classify the following query:
//         Text: ${inputText}
//         Detected Language: ${language}`,
//       );

//       const classification = JSON.parse(classificationResponse.response.text());

//       return {
//         queryType: classification.queryType || 'general',
//         cryptoName: classification.cryptoName,
//         language,
//       };
//     } catch (error) {
//       console.error('Query classification error:', error);
//       return {
//         queryType: 'general',
//         cryptoName: '',
//         language: 'en',
//       };
//     }
//   }

//   // Advanced context retrieval with ML enhancements
//   async retrieveAdvancedContext(
//     query: string,
//     options: {
//       cryptoName?: string;
//       queryType?: string;
//       limit?: number;
//     } = {},
//   ) {
//     const { cryptoName, queryType, limit = 5 } = options;

//     try {
//       // Enhanced query construction
//       const enhancedQuery = this.constructEnhancedQuery(query, cryptoName, queryType);

//       // Retrieve similar documents
//       const similarDocuments = await this.vectorStore.findSimilar(enhancedQuery, limit);

//       // Advanced sentiment and context analysis
//       const contextAnalysis = await this.sentimentAnalyzer.analyzeContextBatch(
//         similarDocuments.map(doc => doc.content),
//       );

//       return {
//         documents: similarDocuments.map((doc, index) => ({
//           ...doc,
//           sentimentScore: contextAnalysis.sentiments[index],
//           entityExtraction: contextAnalysis.entities[index],
//         })),
//         overallSentiment: contextAnalysis.overallSentiment,
//       };
//     } catch (error) {
//       console.error('Advanced context retrieval failed:', error);
//       return {
//         documents: [],
//         overallSentiment: 0,
//       };
//     }
//   }

//   // Construct enhanced query based on type
//   private constructEnhancedQuery(
//     query: string,
//     cryptoName?: string,
//     queryType?: string,
//   ): string {
//     const queryTypeMap = {
//       news: `Latest news about ${cryptoName || 'cryptocurrency'}`,
//       price: `Current market trends for ${cryptoName}`,
//       technical_analysis: `Technical indicators and chart analysis for ${cryptoName}`,
//       fundamental_analysis: `Fundamental evaluation of ${cryptoName}`,
//       comprehensive_analysis: `Comprehensive cryptocurrency analysis for ${cryptoName}`,
//     };

//     return queryTypeMap[queryType as keyof typeof queryTypeMap] || query;
//   }

//   // Main processing method
//   async processQuery(inputText: string, userId: string) {
//     // Classify the query
//     const { queryType, cryptoName, language } = await this.classifyQuery(inputText);

//     // Retrieve advanced context
//     const { documents: contextDocuments, overallSentiment } = await this.retrieveAdvancedContext(
//       inputText,
//       { cryptoName, queryType },
//     );

//     // Switch case for different query types
//     switch (queryType) {
//       case 'news':
//         return this.handleNewsQuery(contextDocuments, language);

//       case 'price':
//         return this.handlePriceQuery(cryptoName, language);

//       case 'technical_analysis':
//         return this.handleTechnicalAnalysis(cryptoName, contextDocuments);

//       case 'fundamental_analysis':
//         return this.handleFundamentalAnalysis(cryptoName, contextDocuments, overallSentiment);

//       case 'comprehensive_analysis':
//         return this.handleComprehensiveAnalysis(cryptoName, contextDocuments, overallSentiment);

//       default:
//         return this.handleGeneralQuery(inputText, language);
//     }
//   }

//   // Implement specific handlers (placeholders)
//   private async handleNewsQuery(documents: any[], language: string) {
//     // News retrieval and processing logic
//   }

//   private async handlePriceQuery(cryptoName: string, language: string) {
//     // Price-specific query handling
//   }

//   private async handleTechnicalAnalysis(cryptoName: string, documents: any[]) {
//     // Technical analysis logic
//   }

//   private async handleFundamentalAnalysis(
//     cryptoName: string,
//     documents: any[],
//     sentiment: number,
//   ) {
//     // Fundamental analysis logic
//   }

//   private async handleComprehensiveAnalysis(
//     cryptoName: string,
//     documents: any[],
//     sentiment: number,
//   ) {
//     // Comprehensive analysis logic
//   }

//   private async handleGeneralQuery(inputText: string, language: string) {
//     // General query handling
//   }
// }

// // Machine Learning Sentiment Analyzer (Placeholder)
// export class SentimentAnalyzer {
//   async analyzeContextBatch(documents: string[]) {
//     // Advanced sentiment analysis
//     return {
//       sentiments: documents.map(() => Math.random()), // Placeholder
//       entities: documents.map(() => ({})), // Placeholder
//       overallSentiment: 0.5, // Neutral sentiment
//     };
//   }
// }

// // Machine Learning Crypto Analyzer (Placeholder)
// export class MachineLearningAnalyzer {
//   async predictCryptoTrend(cryptoName: string) {
//     // Implement machine learning trend prediction
//     return {
//       shortTermTrend: 'neutral',
//       longTermTrend: 'positive',
//       confidenceScore: 0.75,
//     };
//   }

//   async generateAdvancedInsights(cryptoName: string) {
//     // Generate advanced ML-driven insights
//     return {
//       volatilityIndex: 0.6,
//       correlationFactors: {
//         marketCap: 0.7,
//         tradingVolume: 0.5,
//       },
//       riskProfile: 'moderate',
//     };
//   }
// }

// // Schemas for structured responses
// const cryptoSchema = {
//   type: SchemaType.OBJECT,
//   properties: {
//     isPriceQuery: {
//       type: SchemaType.BOOLEAN,
//       description: 'Whether the query is about cryptocurrency price or market data',
//     },
//     cryptoName: {
//       type: SchemaType.STRING,
//       description: 'The name or symbol of the cryptocurrency',
//     },
//     generalResponse: {
//       type: SchemaType.STRING,
//       description: 'General response for non-price queries',
//     },
//     queryType: {
//       type: SchemaType.STRING,
//       description: 'Type of query: general, price, news, specific_news',
//       enum: ['general', 'price', 'news', 'specific_news'],
//     },
//     requiresNewsContext: {
//       type: SchemaType.BOOLEAN,
//       description: 'Whether the query requires recent news context',
//     },
//     newsContext: {
//       type: SchemaType.ARRAY,
//       items: {
//         type: SchemaType.OBJECT,
//         properties: {
//           title: SchemaType.STRING,
//           content: SchemaType.STRING,
//           similarity: SchemaType.NUMBER,
//           publishedAt: SchemaType.STRING,
//         },
//       },
//     },
//     relatedQuestions: {
//       type: SchemaType.ARRAY,
//       items: {
//         type: SchemaType.OBJECT,
//         properties: {
//           name: {
//             type: SchemaType.STRING,
//             description: 'A related follow-up question',
//           },
//         },
//       },
//     },
//   },
//   required: ['isPriceQuery', 'requiresNewsContext'],
// };
// const analysisSchema = {
//   type: SchemaType.OBJECT,
//   properties: {
//     fundamentalAnalysis: {
//       type: SchemaType.OBJECT,
//       properties: {
//         summary: SchemaType.STRING,
//         keyInsights: {
//           type: SchemaType.ARRAY,
//           items: SchemaType.STRING,
//         },
//         sentimentScore: SchemaType.NUMBER,
//       },
//     },
//     technicalAnalysis: {
//       type: SchemaType.OBJECT,
//       properties: {
//         trend: SchemaType.STRING,
//         supportLevel: SchemaType.NUMBER,
//         resistanceLevel: SchemaType.NUMBER,
//         indicators: {
//           type: SchemaType.OBJECT,
//           properties: {
//             rsi: SchemaType.NUMBER,
//             macd: SchemaType.STRING,
//             movingAverages: {
//               type: SchemaType.OBJECT,
//               properties: {
//                 shortTerm: SchemaType.NUMBER,
//                 longTerm: SchemaType.NUMBER,
//               },
//             },
//           },
//         },
//       },
//     },
//     overallRecommendation: SchemaType.STRING,
//     riskAssessment: SchemaType.STRING,
//   },
// };

// // Utility function to fetch comprehensive chart data
// async function fetchCryptocurrencyChartData(
//   currencyName: string,
//   token: string,
// ): Promise<{
//     priceHistory: Array<{
//       date: string;
//       price: number;
//       volume: number;
//     }>;
//     technicalIndicators: {
//       rsi: number;
//       macd: string;
//       movingAverages: {
//         shortTerm: number;
//         longTerm: number;
//       };
//     };
//   }> {
//   try {
//     const response = await fetch(`https://api.coingraam.com/api/v1/advanced-chart?coin=${currencyName}&period=90d`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Chart API Error: ${response.status}`);
//     }

//     const data = await response.json();
//     return {
//       priceHistory: data.priceHistory,
//       technicalIndicators: {
//         rsi: data.rsi,
//         macd: data.macd,
//         movingAverages: {
//           shortTerm: data.shortTermMA,
//           longTerm: data.longTermMA,
//         },
//       },
//     };
//   } catch (error) {
//     console.error('Error fetching chart data:', error);
//     throw error;
//   }
// }

// // Utility function to fetch cryptocurrency price
// async function fetchCryptocurrencyPrice(currencyName: string, token: string): Promise<any> {
//   try {
//     const response = await fetch(`https://api.coingraam.com/api/v1/chart-list?sort=rank-asc&coin=${currencyName}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching coin price:', error);
//     throw error;
//   }
// }

// // Enhanced context retrieval for comprehensive analysis
// async function retrieveComprehensiveContext(
//   cryptoName: string,
//   limit: number = 5,
// ): Promise<{
//     newsContext: Array<{
//       title: string;
//       content: string;
//       similarity: number;
//       publishedAt: string;
//     }>;
//     sentimentAnalysis: number;
//   }> {
//   try {
//     // Fetch relevant news
//     const similarDocuments = await vectorStore.findSimilar(
//       `Latest comprehensive analysis of ${cryptoName} cryptocurrency`,
//       limit,
//     );

//     // Calculate overall sentiment
//     const sentimentScores = similarDocuments.map(doc =>
//       Number.parseFloat(doc.metadata?.sentiment || '0'),
//     );
//     const averageSentiment = sentimentScores.length > 0
//       ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
//       : 0;

//     return {
//       newsContext: similarDocuments.map(doc => ({
//         title: doc.metadata?.title || 'Untitled News',
//         content: doc.content,
//         similarity: doc.similarity,
//         publishedAt: doc.metadata?.publishedAt || new Date().toISOString(),
//       })),
//       sentimentAnalysis: averageSentiment,
//     };
//   } catch (error) {
//     console.error('Comprehensive context retrieval failed:', error);
//     return {
//       newsContext: [],
//       sentimentAnalysis: 0,
//     };
//   }
// }
// async function retrieveNewsContext(query: string, options: {
//   cryptoName?: string;
//   isNewsQuery?: boolean;
//   limit?: number;
// }): Promise<Array<{
//     title: string;
//     content: string;
//     similarity: number;
//     publishedAt: string;
//   }>> {
//   const { cryptoName, isNewsQuery, limit = 5 } = options;

//   // Construct an enhanced query for news retrieval
//   const enhancedQuery = isNewsQuery
//     ? `Latest cryptocurrency news${cryptoName ? ` about ${cryptoName}` : ''}`
//     : `${query}${cryptoName ? ` related to ${cryptoName} cryptocurrency` : ''}`;

//   try {
//     const similarDocuments = await vectorStore.findSimilar(enhancedQuery, limit);

//     return similarDocuments.map(doc => ({
//       title: doc.metadata?.title || 'Untitled News',
//       content: doc.content,
//       similarity: doc.similarity,
//       publishedAt: doc.metadata?.publishedAt || new Date().toISOString(),
//     }));
//   } catch (error) {
//     console.error('News context retrieval failed:', error);
//     return [];
//   }
// }

// // Retrieve contextual information from vector store
// async function retrieveRelevantContext(query: string, cryptoName?: string): Promise<string> {
//   try {
//     // Enhance query with cryptocurrency context if available
//     const enhancedQuery = cryptoName
//       ? `${query} related to ${cryptoName} cryptocurrency`
//       : query;

//     const similarDocuments = await vectorStore.findSimilar(enhancedQuery, 3);

//     if (similarDocuments.length === 0) {
//       console.warn(`No similar context found for query: ${query}`);
//       return 'No recent relevant news or context available.';
//     }

//     return similarDocuments
//       .map(doc => `Context Snippet (Relevance: ${doc.similarity.toFixed(2)}): ${doc.content}`)
//       .join('\n\n');
//   } catch (error) {
//     console.error('Context retrieval failed:', error);
//     return 'Unable to retrieve contextual information.';
//   }
// }

// // Construct enhanced prompt with context
// async function constructEnhancedPrompt(
//   originalQuery: string,
//   context: string,
//   cryptoName?: string,
//   priceData?: any,
// ): Promise<string> {
//   const contextSection = context
//     ? `
//     Contextual Information:
//     ${context}
//   `
//     : '';

//   const priceDataSection = priceData
//     ? `
//     Current Market Data:
//     Price: ${priceData.content[0].priceUsd}
//     24h Change: ${priceData.content[0].changePercent24HrUsd}%
//     Volume: ${priceData.content[0].volumeUsd24Hr}
//     Market Cap: ${priceData.content[0].marketCapUsd}
//   `
//     : '';

//   return `
//     ${SYSTEM_PROMPT}

//     User Query: ${originalQuery}
//     ${cryptoName ? `Cryptocurrency Focus: ${cryptoName}` : ''}

//     ${contextSection}
//     ${priceDataSection}

//     Provide a comprehensive, nuanced response that:
//     1. Directly answers the user's query
//     2. Incorporates contextual information if relevant
//     3. Maintains a professional yet engaging tone
//   `;
// }

// export async function POST(req: Request) {
//   try {
//     const { inputText, messageHistory, userId } = await req.json();

//     if (!inputText) {
//       return new Response('Input text is required', { status: 400 });
//     }

//     // Initial model for query classification
//     // Detect user's language
//     const userLanguage = await detectLanguage(inputText);

//     // Initial classification with enhanced schema
//     const classificationModel = genAI.getGenerativeModel({
//       model: 'gemini-1.5-flash-8b-001',
//       generationConfig: {
//         temperature: 0.7,
//         responseMimeType: 'application/json',
//         responseSchema: {
//           type: SchemaType.OBJECT,
//           properties: {
//             cryptoName: SchemaType.STRING,
//             isAnalysisQuery: SchemaType.BOOLEAN,
//           },
//         },
//       },
//     });

//     // Add language information to the query
//     const enhancedQuery = `
//         Query Language: ${userLanguage}
//         Original Query: ${inputText}
//       `;

//     const classificationChat = classificationModel.startChat({
//       history: messageHistory || [],
//     });

//     // Classify the query
//     const classificationResponse = await classificationChat.sendMessage(enhancedQuery);
//     const parsedClassification = JSON.parse(classificationResponse.response.text());

//     console.log('Query Classification:', parsedClassification);

//     switch (parsedClassification.queryType) {
//       case 'news':
//       case 'specific_news':
//       // Retrieve news context
//       { const newsContext = await retrieveNewsContext(inputText, {
//         cryptoName: parsedClassification.cryptoName,
//         isNewsQuery: true,
//       });

//       // Generate news summary using Gemini
//       const newsModel = genAI.getGenerativeModel({
//         model: 'gemini-1.5-flash-8b-001',
//         generationConfig: {
//           temperature: 0.6,
//           language: userLanguage,
//         },
//       });

//       const newsPrompt = `
//           Summarize the following news articles in ${userLanguage}:
//           ${newsContext.map(article =>
//             `Title: ${article.title}\nContent: ${article.content}\n`,
//           ).join('\n\n')}
//         `;

//       const newsResponse = await newsModel.generateContent(newsPrompt);

//       return new Response(JSON.stringify({
//         text: newsResponse.response.text(),
//         newsContext,
//         language: userLanguage,
//       }), { status: 200 });
//       }

//       // ... handle other query types similarly
//     }

//     // Retrieve contextual information
//     const context = await retrieveRelevantContext(
//       inputText,
//       parsedClassification.cryptoName,
//     );

//     // If a cryptocurrency is identified
//     if (parsedClassification.cryptoName) {
//       const token = process.env.COINGRAAM_API_TOKEN ?? '';
//       const priceData = await fetchCryptocurrencyPrice(
//         parsedClassification.cryptoName,
//         token,
//       );

//       // Determine which model and prompt to use based on query type
//       if (parsedClassification.isPriceQuery) {
//         const analysisModel = genAI.getGenerativeModel({
//           model: 'gemini-1.5-flash-8b-001',
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 2048,
//             responseMimeType: 'application/json',
//             responseSchema: analysisSchema,
//           },
//         });

//         const enhancedPrompt = await constructEnhancedPrompt(
//           inputText,
//           context,
//           parsedClassification.cryptoName,
//           priceData,
//         );

//         const analysisResponse = await analysisModel.generateContent(enhancedPrompt);
//         const analysis = JSON.parse(analysisResponse.response.text());

//         const finalResponse = {
//           text: analysis.analysis,
//           coinData: priceData.content[0],
//           isPriceQuery: true,
//           relatedQuestions: analysis.relatedQuestions,
//           newsContext: context,
//         };

//         await chatDialog.insertChatDialog(userId, inputText, 'Text_Message');
//         return new Response(JSON.stringify(finalResponse), {
//           status: 200,
//           headers: { 'Content-Type': 'application/json' },
//         });
//       } else {
//         // General cryptocurrency information query
//         const generalModel = genAI.getGenerativeModel({
//           model: 'gemini-1.5-flash-8b-001',
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 2048,
//           },
//         });

//         const enhancedPrompt = await constructEnhancedPrompt(
//           inputText,
//           context,
//           parsedClassification.cryptoName,
//         );

//         const generalResponse = await generalModel.generateContent(enhancedPrompt);

//         const finalResponse = {
//           text: generalResponse.response.text(),
//           coinData: priceData.content[0],
//           isPriceQuery: false,
//           relatedQuestions: parsedClassification.relatedQuestions,
//         };

//         await chatDialog.insertChatDialog(userId, inputText, 'Text_Message');
//         return new Response(JSON.stringify(finalResponse), {
//           status: 200,
//           headers: { 'Content-Type': 'application/json' },
//         });
//       }
//     }

//     // For non-crypto queries
//     return new Response(JSON.stringify({
//       text: parsedClassification.generalResponse,
//       isPriceQuery: false,
//       relatedQuestions: parsedClassification.relatedQuestions,
//     }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error in POST route:', error);
//     return new Response(JSON.stringify({
//       error: 'Internal Server Error',
//       details: (error as Error).message,
//     }), { status: 500 });
//   }
// }
