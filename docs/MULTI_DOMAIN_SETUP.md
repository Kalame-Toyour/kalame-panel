# Multi-Domain Setup Documentation

This document explains how the multi-domain setup works for handling different URLs (kalame.chat and okian.ai) with their respective configurations.

## Overview

The system uses a context-based approach to dynamically handle different site configurations based on the current domain. This allows the same codebase to serve different sites with different:

- Google Tag Manager IDs
- Google Site Verification codes
- Logos and favicons
- Metadata and SEO configurations

## Architecture

### 1. Site Context (`src/contexts/SiteContext.tsx`)

The main context that manages site configurations:

```typescript
interface SiteConfig {
  name: string
  url: string
  gtmId: string
  googleVerification: string
  logo: string
  favicon: string
  themeColor: string
  metadata: {
    title: string
    description: string
    keywords: string[]
  }
}
```

### 2. Server-Side Components

- **`ServerGTM.tsx`**: Handles Google Tag Manager script injection based on domain
- **`DynamicHead.tsx`**: Manages meta tags, favicons, and verification codes
- **`metadata.ts`**: Utility for generating domain-specific metadata

### 3. Client-Side Components

- **`DynamicGTM.tsx`**: Client-side GTM component (alternative to server-side)
- **`DynamicMetadata.tsx`**: Client-side metadata component
- **`SiteInfo.tsx`**: Debug component to display current site configuration

## Configuration

### Site Configurations

#### Kalame.chat
- **GTM ID**: `GTM-NZRSLF3P`
- **Google Verification**: `google61a3ff9bd5a447a6`
- **Logo**: `/kalame-logo.png`
- **Favicon**: `/favicon.ico`
- **Language**: Persian (RTL)

#### Okian.ai
- **GTM ID**: `GTM-NCWJ2BL5`
- **Google Verification**: `googled2b7a47c05e2c4d2`
- **Logo**: `/okian-logo.png`
- **Favicon**: `/okian-favicon.ico`
- **Language**: English (LTR)

## Implementation Details

### Layout Structure

The `layout.tsx` file has been updated to:

1. Wrap the entire app with `SiteProvider`
2. Use server-side components for GTM and metadata
3. Dynamically inject the correct GTM scripts and verification codes

### Domain Detection

The system detects the current domain using:
- Server-side: `headers().get('host')` in server components
- Client-side: `window.location.hostname` in client components

### Google Tag Manager

Each domain has its own GTM container:
- **Kalame.chat**: `GTM-NZRSLF3P`
- **Okian.ai**: `GTM-NCWJ2BL5`

The GTM script is injected both in the `<head>` and as a noscript fallback in the `<body>`.

### Google Site Verification

Each domain has its own verification file:
- **Kalame.chat**: `google61a3ff9bd5a447a6.html`
- **Okian.ai**: `googled2b7a47c05e2c4d2.html`

## Usage

### Adding a New Domain

To add a new domain, update the `siteConfigs` object in `SiteContext.tsx`:

```typescript
const siteConfigs: Record<string, SiteConfig> = {
  'new-domain.com': {
    name: 'New Site',
    url: 'https://new-domain.com',
    gtmId: 'GTM-XXXXXXX',
    googleVerification: 'google-verification-code',
    logo: '/new-logo.png',
    favicon: '/new-favicon.ico',
    themeColor: '#000000',
    metadata: {
      title: 'New Site Title',
      description: 'New site description',
      keywords: ['keyword1', 'keyword2']
    }
  }
}
```

### Using the Context

In any client component:

```typescript
import { useSite } from '@/contexts/SiteContext'

function MyComponent() {
  const { currentSite } = useSite()
  
  if (!currentSite) return <div>Loading...</div>
  
  return <div>Current site: {currentSite.name}</div>
}
```

## Files Created/Modified

### New Files
- `src/contexts/SiteContext.tsx` - Main site context
- `src/app/components/DynamicGTM.tsx` - Client-side GTM component
- `src/app/components/DynamicMetadata.tsx` - Client-side metadata component
- `src/app/components/DynamicHead.tsx` - Server-side head component
- `src/app/components/ServerGTM.tsx` - Server-side GTM component
- `src/app/components/SiteInfo.tsx` - Debug component
- `src/utils/metadata.ts` - Metadata utility
- `public/googled2b7a47c05e2c4d2.html` - Okian.ai verification file
- `public/okian-logo.png` - Placeholder for Okian logo
- `public/okian-favicon.ico` - Placeholder for Okian favicon

### Modified Files
- `src/app/layout.tsx` - Updated to use dynamic components

## Testing

To test the implementation:

1. Deploy the application to both domains
2. Check that the correct GTM ID is loaded for each domain
3. Verify that the correct Google verification code is present
4. Ensure logos and favicons are domain-specific
5. Use the `SiteInfo` component to debug current configuration

## Notes

- The system automatically detects the domain and applies the appropriate configuration
- Server-side components are used for critical elements like GTM and verification codes
- Client-side components are available for dynamic interactions
- All configurations are centralized in the `SiteContext` for easy management
