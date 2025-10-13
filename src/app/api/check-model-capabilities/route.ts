import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Mock model capabilities - in real implementation, this would be dynamic
const MODEL_CAPABILITIES = {
  'gpt4-mini': {
    vision: true,
    files: true,
    streaming: true,
    webSearch: true,
    reasoning: false
  },
  'gpt4': {
    vision: true,
    files: true,
    streaming: true,
    webSearch: true,
    reasoning: true
  },
  'claude-3-haiku': {
    vision: true,
    files: true,
    streaming: true,
    webSearch: false,
    reasoning: false
  },
  'claude-3-sonnet': {
    vision: true,
    files: true,
    streaming: true,
    webSearch: false,
    reasoning: true
  },
  'claude-3-opus': {
    vision: true,
    files: true,
    streaming: true,
    webSearch: false,
    reasoning: true
  }
};

const MODEL_DETAILS = {
  'gpt4-mini': {
    name: 'GPT-4 Mini',
    provider: 'openai',
    maxTokens: 4096,
    contextLength: 128000
  },
  'gpt4': {
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 4096,
    contextLength: 128000
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    maxTokens: 4096,
    contextLength: 200000
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 4096,
    contextLength: 200000
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 4096,
    contextLength: 200000
  }
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('modelName');

    if (!modelName) {
      return NextResponse.json(
        { success: false, error: 'Model name is required' },
        { status: 400 }
      );
    }

    const capabilities = MODEL_CAPABILITIES[modelName as keyof typeof MODEL_CAPABILITIES];
    const modelDetails = MODEL_DETAILS[modelName as keyof typeof MODEL_DETAILS];

    if (!capabilities || !modelDetails) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      modelName,
      capabilities,
      modelDetails
    });

  } catch (error) {
    console.error('Model capabilities check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check model capabilities' },
      { status: 500 }
    );
  }
}

