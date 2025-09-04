# IP Geolocation Service

This service provides IP-based geolocation checking to detect if users are accessing the application from Iran.

## Features

- **Dual Service Support**: Uses two different IP geolocation services for reliability
- **Fallback Mechanism**: If the primary service fails, automatically tries a backup service
- **Error Handling**: Gracefully handles failures without blocking legitimate users
- **TypeScript Support**: Fully typed interfaces for better development experience

## Services Used

1. **Primary**: `ipapi.co` - Free, reliable, and fast
2. **Fallback**: `ipinfo.io` - Backup service in case primary fails

## Usage

```typescript
import { checkUserLocation, checkUserLocationFallback } from './ipService'

// Check user location
const result = await checkUserLocation()

if (!result.isFromIran) {
  // Show VPN warning
  console.log(`User is from: ${result.country}`)
}
```

## Security Considerations

- Defaults to allowing access if IP check fails (fail-open approach)
- Doesn't store or log user IP addresses
- Uses HTTPS for all API calls
- Implements proper error handling to avoid blocking legitimate users

## Integration

The service is integrated into the pricing page to show a warning banner when users are detected to be using a VPN or accessing from outside Iran.
