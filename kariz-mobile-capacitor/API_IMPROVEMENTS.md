# API Improvements and CORS Solutions

## Overview
The mobile app has been updated with a robust API utility that handles CORS issues and provides fallback mechanisms.

## Key Improvements

### 1. Axios Integration
- Replaced `fetch` with `axios` for better error handling
- Added request/response interceptors for CORS headers
- Improved timeout handling (10s for direct requests, 15s for proxy requests)

### 2. CORS Handling Strategy
The API utility now uses a multi-layered approach:

1. **Direct Request**: First attempts direct API call with proper headers
2. **CORS Proxy**: If direct request fails, tries multiple CORS proxies:
   - `https://cors-anywhere.herokuapp.com/`
   - `https://api.allorigins.win/raw?url=`
   - `https://corsproxy.io/?`
3. **Mock Data**: If all else fails, returns realistic mock data

### 3. Mock Data Structure
The API provides realistic mock data for development:

#### Language Models
```json
{
  "models": [
    {
      "id": 1,
      "name": "GPT-4",
      "short_name": "gpt4",
      "token_cost": 0.01,
      "icon_url": "https://img.icons8.com/?size=192&id=TUk7vxvtu6hX&format=png",
      "provider": "openai",
      "model_path": "openai/gpt-4o",
      "max_tokens": 4096,
      "context_length": 128000,
      "temperature": 0.7,
      "supports_streaming": 1,
      "supports_web_search": 1,
      "supports_reasoning": 0
    },
    {
      "id": 6,
      "name": "Claude 4 Sonnet",
      "short_name": "claude4-sonnet",
      "token_cost": 0.015,
      "icon_url": "https://images.seeklogo.com/logo-png/55/2/claude-logo-png_seeklogo-554534.png",
      "provider": "anthropic",
      "model_path": "anthropic/claude-sonnet-4",
      "max_tokens": 4096,
      "context_length": 128000,
      "temperature": 0.7,
      "supports_streaming": 1,
      "supports_web_search": 1,
      "supports_reasoning": 1
    },
    {
      "id": 9,
      "name": "Gemini 2.5 Flash",
      "short_name": "gemini-2.5-flash",
      "token_cost": 0.0075,
      "icon_url": "https://images.seeklogo.com/logo-png/61/2/gemini-icon-logo-png_seeklogo-611605.png",
      "provider": "google",
      "model_path": "google/gemini-2.5-flash",
      "max_tokens": 4096,
      "context_length": 128000,
      "temperature": 0.7,
      "supports_streaming": 1,
      "supports_web_search": 1,
      "supports_reasoning": 1
    }
  ]
}
```

#### Prompt Suggestions
```json
{
  "suggestions": [
    {
      "id": "1",
      "text": "چطور می‌تونم در برنامه‌نویسی بهتر بشم؟",
      "category": "programming"
    },
    {
      "id": "2",
      "text": "یک داستان کوتاه درباره دوستی بنویس",
      "category": "creative"
    },
    {
      "id": "3",
      "text": "راهنمای کامل برای شروع کسب و کار آنلاین",
      "category": "business"
    },
    {
      "id": "4",
      "text": "نکات مهم برای حفظ سلامتی در زندگی روزمره",
      "category": "health"
    },
    {
      "id": "5",
      "text": "چطور می‌تونم زبان انگلیسی رو بهتر یاد بگیرم؟",
      "category": "education"
    },
    {
      "id": "6",
      "text": "راهنمای سفر به شهرهای مختلف ایران",
      "category": "travel"
    }
  ]
}
```

## API Endpoints

### Base Configuration
- **Base URL**: `https://api.kalame.chat/kariz`
- **Auth URL**: `https://api.kalame.chat/auth`
- **Media URL**: `https://media.kalame.chat`

### Available Endpoints
- `GET /language-models` - Get available AI models
- `GET /promptSuggestions` - Get chat prompt suggestions
- `POST /chat` - Send chat message
- `POST /auth/login` - User authentication
- `GET /user/profile` - Get user profile (with auth)

## Error Handling

### CORS Error Detection
The API utility detects CORS errors by checking:
- `error.code === 'ERR_NETWORK'`
- `error.message.includes('CORS')`

### Fallback Strategy
1. **Direct Request**: `apiClient.get(endpoint)`
2. **CORS Proxy**: Multiple proxy attempts
3. **Mock Data**: Realistic fallback data

## Usage Examples

### Basic GET Request
```typescript
import { api } from '../utils/api';

// This will try direct request, then CORS proxy, then return mock data
const models = await api.get('/language-models');
```

### POST Request with Data
```typescript
const response = await api.post('/chat', {
  message: 'Hello',
  model: 'gpt-4'
});
```

### Authenticated Request
```typescript
const profile = await api.getWithAuth('/user/profile', 'your-token-here');
```

## Development vs Production

### Development
- Uses mock data when API is unreachable
- Provides detailed console logging
- Includes CORS proxy fallbacks

### Production
- Should work with proper CORS headers
- Minimal logging
- Direct API calls only

## Troubleshooting

### Common Issues

1. **CORS Errors**: The app will automatically fall back to mock data
2. **Network Timeout**: Increased timeout for proxy requests
3. **API Unavailable**: Mock data ensures app functionality

### Debug Information
The API utility provides detailed console logging:
- `🌐 API Request: GET /language-models`
- `✅ API Success: 200`
- `🔄 CORS error detected, returning mock data`
- `❌ CORS proxy failed: Network Error`

## Dependencies

### Required Packages
```json
{
  "axios": "^1.6.0"
}
```

### Installation
```bash
npm install axios
```

## Future Improvements

1. **Service Worker**: For offline functionality
2. **Request Caching**: To reduce API calls
3. **Retry Logic**: Exponential backoff for failed requests
4. **Real-time Updates**: WebSocket integration for live chat 