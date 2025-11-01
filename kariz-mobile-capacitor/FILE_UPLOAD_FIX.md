# راهنمای اصلاح آپلود فایل در Mobile App

## مشکل
آپلود فایل در موبایل اپ کار نمی‌کرد و خطای CORS می‌داد. حتی در اپ نصب شده روی گوشی هم این مشکل وجود داشت.

## علت مشکل

1. **Development Mode Check**: کد چک می‌کرد که اگر origin شامل localhost باشد، خطای CORS می‌داد. این حتی در موبایل app نصب شده هم ممکن بود true باشد (مثل `capacitor://localhost`).

2. **Token Management**: از localStorage با key `auth-token` استفاده می‌کرد، ولی در پروژه از `kariz_access_token` یا `kariz_user` استفاده می‌شود.

3. **API Endpoint**: درخواست به `/api/upload-media` (Next.js API route) ارسال می‌شد که session-based است، در حالی که موبایل app باید مستقیماً به backend API با token ارسال کند.

4. **CORS Handling**: middleware درست FormData را handle نمی‌کرد و Content-Type را override می‌کرد.

## راه‌حل

### 1. حذف Development Mode Check
Development check حذف شد چون در موبایل app حتی در production هم ممکن است origin شامل localhost باشد.

### 2. استفاده از getAuth Utility
به جای استفاده مستقیم از localStorage، از `getAuth()` utility استفاده می‌شود که با بقیه app سازگار است.

```typescript
import { getAuth } from '../hooks/useAuth';

const user = getAuth();
const token = user?.accessToken || null;
```

### 3. استفاده از Backend API
به جای Next.js API route (`/api/upload-media`)، مستقیماً به backend API ارسال می‌شود:

```typescript
// در middleware
const backendUrl = `${AppConfig.baseApiUrl}/upload-media`;
// که می‌شود: https://api.kalame.chat/kariz/upload-media
```

### 4. اصلاح Middleware برای FormData
Middleware اصلاح شد تا FormData را درست handle کند و Content-Type را override نکند:

```typescript
// Skip Content-Type for FormData - browser will set it with boundary
if (key.toLowerCase() !== 'content-type') {
  requestHeaders[key] = value;
}
```

## تغییرات انجام شده

### فایل‌های تغییر یافته:

1. **`src/services/fileUpload.ts`**:
   - حذف development mode check
   - استفاده از `getAuth()` برای token
   - بهبود progress reporting
   - بهبود error handling
   - پشتیبانی از فرمت‌های مختلف response

2. **`src/utils/apiMiddleware.ts`**:
   - تغییر endpoint از Next.js API route به backend API
   - اصلاح FormData handling
   - حفظ Authorization header
   - بهبود logging

## تست

### مراحل تست:

1. **Build و Sync**:
   ```bash
   cd kariz-mobile-capacitor
   npm run build
   npx cap sync android
   ```

2. **تست در Android**:
   - اپ را build و install کنید
   - وارد حساب کاربری شوید
   - سعی کنید یک عکس آپلود کنید
   - باید آپلود موفق باشد

3. **تست در Development (Browser)**:
   - اگر در browser تست می‌کنید، ممکن است هنوز CORS issue داشته باشید
   - برای توسعه، از Android Studio Emulator یا دستگاه واقعی استفاده کنید

## نکات مهم

1. **Backend API**: مطمئن شوید که backend API (`https://api.kalame.chat/kariz/upload-media`) CORS headers درست دارد.

2. **Authentication**: مطمئن شوید که token معتبر است و در header ارسال می‌شود.

3. **FormData**: Content-Type نباید برای FormData set شود - browser خودش با boundary set می‌کند.

4. **Error Messages**: پیام‌های خطا بهتر شده‌اند تا کاربر بداند مشکل از کجاست.

## عیب‌یابی

### اگر هنوز خطا می‌گیرید:

1. **Console Logs**: به console logs نگاه کنید:
   - `[MobileFileUpload]` logs را بررسی کنید
   - `🔄 Redirecting upload request` log را بررسی کنید
   - مطمئن شوید که token در header است

2. **Network Tab**: در browser dev tools، network tab را بررسی کنید:
   - Request URL باید `https://api.kalame.chat/kariz/upload-media` باشد
   - Authorization header باید موجود باشد
   - Content-Type باید `multipart/form-data` با boundary باشد

3. **Backend Logs**: backend logs را بررسی کنید تا ببینید آیا request رسیده یا نه.

## نتیجه

✅ Development mode check حذف شد  
✅ Token management درست شد  
✅ استفاده از backend API مستقیم  
✅ FormData handling اصلاح شد  
✅ Error handling بهتر شد  
✅ Progress reporting بهتر شد  

