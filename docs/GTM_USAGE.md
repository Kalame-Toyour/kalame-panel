# Google Tag Manager Integration Guide

## Overview
This project includes a complete Google Tag Manager (GTM) integration with custom event tracking for better analytics and user behavior insights.

## GTM Container ID
- **Container ID**: `GTM-NZRSLF3P`
- **Verification File**: `google61a3ff9bd5a447a6.html`

## Available Tracking Events

### 1. Page Views
Automatically tracked on every page navigation.

### 2. Chat Interactions
Track user interactions with the chat feature:

```typescript
import { useGTM } from '@/hooks/useGTM'

const { trackChatEvent } = useGTM()

// Track when user sends a message
trackChatEvent('message_sent', 'gpt-4', messageLength)

// Track when user receives a response
trackChatEvent('response_received', 'gpt-4', responseLength)
```

### 3. Image Generation
Track image generation events:

```typescript
const { trackImageGeneration } = useGTM()

// Track image generation
trackImageGeneration(prompt, 'dall-e-3')
```

### 4. User Authentication
Track authentication events:

```typescript
const { trackAuth } = useGTM()

// Track login
trackAuth('login')

// Track logout
trackAuth('logout')

// Track signup
trackAuth('signup')
```

### 5. Premium Upgrades
Track premium subscription events:

```typescript
const { trackPremiumUpgrade } = useGTM()

// Track premium upgrade
trackPremiumUpgrade('premium_monthly', 29.99)
```

### 6. Custom Events
Track any custom event:

```typescript
const { trackCustomEvent } = useGTM()

// Track custom event
trackCustomEvent('feature_used', {
  feature_name: 'voice_to_text',
  duration: 30,
  success: true
})
```

## Implementation Details

### Files Structure
```
src/app/
├── components/
│   ├── GoogleTagManager.tsx    # Main GTM component
│   └── GTMPageTracker.tsx      # Automatic page view tracking
├── hooks/
│   └── useGTM.ts              # Custom hook for GTM events
└── layout.tsx                 # GTM scripts integration

public/
└── google61a3ff9bd5a447a6.html  # Google Search Console verification
```

### GTM Scripts Location
- **Head Script**: Added to `<head>` section in `layout.tsx`
- **Body Script**: Added immediately after `<body>` tag in `layout.tsx`
- **Page Tracker**: Automatically tracks page views on route changes

## Google Search Console
- **Verification File**: `google61a3ff9bd5a447a6.html`
- **Access URL**: `https://kalame.chat/google61a3ff9bd5a447a6.html`

## Best Practices

1. **Event Naming**: Use consistent naming conventions for events
2. **Data Privacy**: Ensure compliance with privacy regulations
3. **Performance**: GTM scripts are loaded asynchronously to avoid blocking
4. **Testing**: Use GTM Preview mode to test events before going live

## Testing
1. Open GTM Preview mode
2. Navigate through the application
3. Verify events are firing correctly
4. Check data in Google Analytics (if connected)

## Troubleshooting
- Ensure GTM container ID is correct
- Check browser console for any JavaScript errors
- Verify dataLayer is properly initialized
- Test in incognito mode to avoid cache issues
