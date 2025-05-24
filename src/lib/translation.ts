import { prisma } from './prisma';

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Use environment variable for API key
const API_KEY = process.env.HUGGING_FACE_API_KEY;

interface CacheEntry {
  text: string;
  timestamp: number;
}

export async function translateToEnglish(text: string): Promise<string> {
  // Check if API key is available
  if (!API_KEY) {
    console.error('Hugging Face API key is not configured');
    return text; // Return original text if API key is not available
  }

  // Check cache first
  const cachedEntry = translationCache.get(text);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
    return cachedEntry.text;
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            src_lang: "fa_XX",
            tgt_lang: "en_XX",
            max_length: 128,
            num_beams: 4,
            early_stopping: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translation = data[0].translation_text;
    
    // Cache the translation with timestamp
    translationCache.set(text, {
      text: translation,
      timestamp: Date.now()
    });
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
}

export async function translateToPersian(text: string): Promise<string> {
  // Check if API key is available
  if (!API_KEY) {
    console.error('Hugging Face API key is not configured');
    return text; // Return original text if API key is not available
  }

  // Check cache first
  const cachedEntry = translationCache.get(text);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
    return cachedEntry.text;
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            src_lang: "en_XX",
            tgt_lang: "fa_XX",
            max_length: 128,
            num_beams: 4,
            early_stopping: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translation = data[0].translation_text;
    
    // Cache the translation with timestamp
    translationCache.set(text, {
      text: translation,
      timestamp: Date.now()
    });
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
} 