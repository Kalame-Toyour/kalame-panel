import { NextResponse } from 'next/server';

// Define the expected request body schema
// const requestSchema = z.object({
//   cardId: z.string()
// });

// Define types for our responses
type InsightResponse = {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  coverUrl?: string;
  response: string;
  category: string;
};

// Mock database of insight responses
const insightResponses: Record<string, InsightResponse> = {
  'crypto-update': {
    id: 'crypto-update',
    title: 'Crypto Market Update',
    description: 'Latest cryptocurrency market trends and analysis',
    coverUrl: '/images/crypto-cover.jpg', // Add your cover image paths
    response: `روند بازار رمزارزها در 24 ساعت گذشته مثبت بوده است...`,
    category: 'market',
  },
  'defi-news': {
    id: 'defi-news',
    title: 'DeFi Update',
    description: 'Latest developments in decentralized finance',
    videoUrl: 'https://roozdl.musicmelnet.com//2024/music/9/New/Ashvan%20-%20Vaghteshe%20Beri%20480p.mp4',
    coverUrl: 'https://cdn.coingraam.com/images/news/aptos-october-cover.jpg',
    response: `اخبار مهم دیفای امروز...`,
    category: 'defi',
  },
  'defi': {
    id: 'defi',
    title: 'DeFi Update',
    description: 'Latest developments in decentralized finance',
    videoUrl: 'https://example.com/video.mp4',
    coverUrl: 'https://cdn.coingraam.com/images/news/aptos-october-cover.jpg',
    response: `اخبار مهم دیفای امروز...`,
    category: 'defi',
  },
  'nft': {
    id: 'nft',
    title: 'DeFi Update',
    description: 'Latest developments in decentralized finance',
    videoUrl: 'https://example.com/video.mp4',
    coverUrl: '/images/defi-cover.jpg',
    response: `اخبار مهم دیفای امروز...`,
    category: 'defi',
  },
  // Add more insight responses as needed
};

export async function POST(_req: Request) {
  try {
    // const body = await req.json();
    // const { cardId } = requestSchema.parse(body);

    // console.log('Processing insight request:', cardId);

    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const insight = insightResponses['defi-news'];
    if (!insight) {
      return NextResponse.json(
        { error: 'Insight not found', details: `No insight found for ID: ` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    console.error('Error processing insight request:', error);

    // if (error instanceof z.ZodError) {
    //   return NextResponse.json(
    //     { error: 'Invalid request format', details: error.errors },
    //     { status: 400 }
    //   );
    // }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
