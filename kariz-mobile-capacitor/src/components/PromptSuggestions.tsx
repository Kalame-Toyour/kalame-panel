import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

interface PromptSuggestion {
  id: string;
  title: string;
  icon: string; // now a URL
  prompt: string;
  color: string; // e.g. 'from-pink-400 to-fuchsia-500'
}

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

interface ApiSuggestionsResponse {
  suggestions: PromptSuggestion[];
}

// Helper to extract main color from gradient string (e.g. 'from-pink-400 to-fuchsia-500' => 'pink-400')
function extractMainColor(gradient: string) {
  const match = gradient.match(/from-([\w-]+)/);
  return match ? match[1] : 'blue-500';
}

// Tailwind safelist for dynamic colors:
// border-pink-400 border-fuchsia-500 border-green-400 border-blue-500 border-yellow-400 border-orange-400 border-purple-400 border-indigo-500 border-blue-400 border-cyan-400 border-emerald-400 border-lime-400

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      console.log('🔄 Starting to load prompt suggestions...');
      setLoading(true);
      try {
        // Try to fetch from real API first
        const data = await api.get('/promptSuggestions') as ApiSuggestionsResponse;
        console.log('📦 Suggestions data received:', data);
        if (data.suggestions && Array.isArray(data.suggestions)) {
          console.log('✅ Using API suggestions');
          setSuggestions(data.suggestions);
        } else {
          // Fallback to default suggestions if API structure is different
          console.log('⚠️ API structure different, using default suggestions');
          setSuggestions(getDefaultSuggestions());
        }
      } catch (error) {
        console.error('❌ Error fetching suggestions:', error);
        console.log('🔧 Falling back to default suggestions...');
        // Fallback to default suggestions on error
        setSuggestions(getDefaultSuggestions());
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  // Function to get default suggestions with proper structure
  const getDefaultSuggestions = (): PromptSuggestion[] => [
    {
      id: '1',
      title: 'برنامه‌نویسی',
      icon: 'https://img.icons8.com/color/96/000000/python.png',
      prompt: 'چطور می‌تونم در برنامه‌نویسی بهتر بشم؟',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: '2',
      title: 'داستان‌نویسی',
      icon: 'https://img.icons8.com/color/96/000000/book.png',
      prompt: 'یک داستان کوتاه درباره دوستی بنویس',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: '3',
      title: 'کسب و کار',
      icon: 'https://img.icons8.com/color/96/000000/business.png',
      prompt: 'راهنمای کامل برای شروع کسب و کار آنلاین',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: '4',
      title: 'سلامت',
      icon: 'https://img.icons8.com/color/96/000000/health.png',
      prompt: 'نکات مهم برای حفظ سلامتی در زندگی روزمره',
      color: 'from-red-400 to-pink-500'
    },
    {
      id: '5',
      title: 'آموزش',
      icon: 'https://img.icons8.com/color/96/000000/education.png',
      prompt: 'چطور می‌تونم زبان انگلیسی رو بهتر یاد بگیرم؟',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: '6',
      title: 'سفر',
      icon: 'https://img.icons8.com/color/96/000000/travel.png',
      prompt: 'راهنمای سفر به شهرهای مختلف ایران',
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="w-full flex flex-wrap justify-center gap-2 mt-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-xl px-3 py-2 md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 animate-pulse"
            style={{ minWidth: '90px', maxWidth: '200px' }}
          >
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm text-center my-2">{error}</div>;
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="w-full flex flex-wrap justify-center gap-2 mt-4 animate-fade-in">
      {suggestions.map(({ id, title, icon, prompt, color }) => {
        const mainColor = extractMainColor(color);
        const borderClass = `border-${mainColor}`;
        return (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 md:px-4 md:py-2 bg-white dark:bg-gray-900 border ${borderClass} shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-2 transition-all text-xs md:text-sm min-w-[90px] md:min-w-[120px] max-w-xs focus:ring-2 focus:ring-blue-400 focus:outline-none`}
            onClick={() => onSelectPrompt(prompt)}
            aria-label={title}
            style={{ borderWidth: 1.5 }}
          >
            <img 
              src={icon} 
              alt="" 
              className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover drop-shadow" 
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
              }}
            />
            <span className="truncate md:text-sm text-xs font-bold text-gray-800 dark:text-gray-100">{title}</span>
          </button>
        );
      })}
    </div>
  );
}