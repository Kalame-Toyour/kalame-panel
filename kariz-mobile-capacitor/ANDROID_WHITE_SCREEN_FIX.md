# رفع مشکل صفحه سفید در اندروید

## مشکل شناسایی شده:

اپ اندروید صفحه سفید نمایش می‌دهد و هیچ محتوایی لود نمی‌شود. این مشکل به دلیل تلاش Capacitor برای لود کردن localhost به جای استفاده از فایل‌های build شده است.

## علت مشکل:

1. **Server Section در capacitor.config.ts**: باعث می‌شود که Capacitor به جای فایل‌های build شده، localhost را لود کند
2. **مسیرهای نسبی در index.html**: فایل‌های CSS و JS با مسیرهای نسبی لود می‌شوند که در اپ اندروید کار نمی‌کنند

## راه‌حل اعمال شده:

### 1. اصلاح capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.kalame.ai',
  appName: 'Kalame AI',
  webDir: 'build',
  // Use built files instead of server
  server: undefined,
  // ... rest of config
};
```

### 2. ساده‌سازی MainActivity.java
- حذف کدهای اضافی localhost loading
- اجازه دادن به Capacitor برای handle کردن فایل‌های build شده
- حفظ back button navigation

### 3. حذف server configuration
- `server: undefined` باعث می‌شود که Capacitor از فایل‌های build شده استفاده کند
- به جای تلاش برای لود کردن localhost

## مراحل تست:

### 1. Build و Sync مجدد
```bash
npm run build
npx cap sync android
```

### 2. در Android Studio
- Clean Project
- Rebuild Project
- Run

### 3. بررسی Logcat
- باید پیام "Loading app at file:///android_asset/public/index.html" را ببینید
- به جای "Loading app at http://localhost"

## نکات مهم:

1. **اپ React باید build شده باشد** (فایل‌ها در پوشه `build`)
2. **server section باید undefined باشد** در capacitor.config.ts
3. **Capacitor باید به طور خودکار فایل‌های build شده را لود کند**
4. **از localhost استفاده نکنید**

## عیب‌یابی:

### اگر همچنان صفحه سفید است:
1. اطمینان از build شدن اپ React
2. اجرای `npx cap sync android`
3. بررسی Logcat برای پیام‌های خطا
4. Clean و Rebuild در Android Studio

### اگر فایل‌ها لود نمی‌شوند:
1. بررسی وجود فایل‌ها در پوشه `build`
2. اطمینان از sync شدن فایل‌ها
3. بررسی capacitor.config.ts

## نتیجه نهایی:

✅ اپ باید محتوای React را نمایش دهد
✅ صفحه سفید برطرف شود
✅ فایل‌های CSS و JS درست لود شوند
✅ Back button navigation کار کند
✅ هیچ crash یا خطایی رخ ندهد

## تغییرات کلیدی:

- `server: undefined` در capacitor.config.ts
- حذف کدهای اضافی localhost loading
- ساده‌سازی MainActivity.java
- اجازه دادن به Capacitor برای handle کردن فایل‌ها

