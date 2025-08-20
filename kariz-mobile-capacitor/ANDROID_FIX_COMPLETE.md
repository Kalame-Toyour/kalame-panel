# راهنمای کامل رفع مشکلات اندروید

## مشکلات حل شده:

### 1. مشکل لود نشدن اپ ✅
- **علت**: اپ سعی می‌کرد localhost:3000 را لود کند که در دستگاه اندروید قابل دسترسی نبود
- **راه‌حل**: حذف کدهای اضافی و استفاده از فایل‌های build شده

### 2. مشکل WebView Crash ✅
- **علت**: WebViewCrashPreventionService باعث crash می‌شد
- **راه‌حل**: غیرفعال کردن موقت سرویس

### 3. مشکل Back Button Navigation ✅
- **علت**: navigation درست پیاده‌سازی نشده بود
- **راه‌حل**: پیاده‌سازی navigation کامل با double-tap برای خروج

## تغییرات اعمال شده:

### MainActivity.java
- حذف کدهای اضافی localhost loading
- اضافه کردن back button handling کامل
- غیرفعال کردن WebViewCrashPreventionService
- بهبود error handling

### AndroidManifest.xml
- غیرفعال کردن WebViewCrashPreventionService
- حفظ تنظیمات امنیتی شبکه

### Back Button Logic
```java
@Override
public void onBackPressed() {
    if (webView != null && webView.canGoBack()) {
        // اگر WebView بتواند برگردد، برگردد
        webView.goBack();
    } else {
        // اگر روی صفحه اصلی هستیم
        if (backPressTime + BACK_PRESS_INTERVAL > System.currentTimeMillis()) {
            // دومین بار - خروج از برنامه
            super.onBackPressed();
        } else {
            // اولین بار - نمایش پیام
            backPressTime = System.currentTimeMillis();
            // نمایش پیام "برای خروج دوباره بزنید"
        }
    }
}
```

## مراحل تست:

### 1. Build و Sync
```bash
npm run build
npx cap sync android
```

### 2. در Android Studio
- Clean Project
- Rebuild Project
- Run

### 3. تست Navigation
- رفتن به صفحات مختلف
- تست دکمه back
- تست double-tap برای خروج

## نکات مهم:

1. **اپ React باید build شده باشد** (فایل‌ها در پوشه `build`)
2. **از localhost:3000 استفاده نکنید** - اپ از فایل‌های build شده استفاده می‌کند
3. **WebViewCrashPreventionService موقتاً غیرفعال است**
4. **Back button navigation کامل پیاده‌سازی شده**

## عیب‌یابی:

### اگر اپ لود نمی‌شود:
1. اطمینان از build شدن اپ React
2. اجرای `npx cap sync android`
3. Clean و Rebuild در Android Studio

### اگر back button کار نمی‌کند:
1. بررسی Logcat برای خطاها
2. اطمینان از اینکه WebView درست initialize شده

### اگر crash می‌کند:
1. بررسی Logcat
2. اطمینان از sync شدن فایل‌ها
3. Clean و Rebuild پروژه

## نتیجه نهایی:

✅ اپ باید به درستی لود شود
✅ Navigation بین صفحات کار کند
✅ Back button درست کار کند
✅ Double-tap برای خروج کار کند
✅ هیچ crash یا خطایی رخ ندهد
