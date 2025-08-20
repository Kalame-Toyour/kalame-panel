# رفع مشکل صفحه سفید - راه‌حل ساده

## مشکل شناسایی شده:

اپ اندروید صفحه سفید نمایش می‌دهد و Capacitor سعی می‌کند `https://localhost/` را لود کند به جای استفاده از فایل‌های build شده.

## علت مشکل:

1. **Server Section در capacitor.config.ts**: باعث می‌شود که Capacitor localhost را لود کند
2. **WebView Override**: MainActivity WebView را به صورت دستی override می‌کرد که با Capacitor تداخل داشت
3. **کدهای اضافی**: کدهای WebView crash prevention باعث تداخل می‌شدند

## راه‌حل اعمال شده:

### 1. اصلاح capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.kalame.ai',
  appName: 'Kalame AI',
  webDir: 'build',
  // Server section کاملاً حذف شد
  plugins: {
    // ... rest of config
  }
};
```

### 2. ساده‌سازی MainActivity.java
- حذف تمام کدهای WebView override
- حذف WebView crash prevention
- حذف WebView clients
- فقط back button handling باقی ماند
- استفاده از Capacitor default WebView

### 3. حذف کدهای اضافی
- `setupWebViewCrashPrevention()` حذف شد
- `setupWebViewClients()` حذف شد
- `injectCrashPreventionScript()` حذف شد
- تمام cleanup methods حذف شدند

## کد نهایی MainActivity.java:

```java
public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private long backPressTime = 0;
    private static final int BACK_PRESS_INTERVAL = 2000;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.i(TAG, "MainActivity created - using Capacitor default WebView");
    }

    @Override
    public void onBackPressed() {
        WebView webView = getBridge().getWebView();
        
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            if (backPressTime + BACK_PRESS_INTERVAL > System.currentTimeMillis()) {
                super.onBackPressed();
            } else {
                backPressTime = System.currentTimeMillis();
                // نمایش پیام "برای خروج دوباره بزنید"
            }
        }
    }
}
```

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
- به جای "Loading app at https://localhost/"

## نکات مهم:

1. **اپ React باید build شده باشد**
2. **server section باید کاملاً حذف شود**
3. **MainActivity باید ساده باشد**
4. **بگذارید Capacitor خودش WebView را handle کند**

## نتیجه نهایی:

✅ اپ باید محتوای React را نمایش دهد
✅ صفحه سفید برطرف شود
✅ فایل‌های CSS و JS درست لود شوند
✅ Back button navigation کار کند
✅ هیچ crash یا خطایی رخ ندهد

## تغییرات کلیدی:

- حذف کامل server section از capacitor.config.ts
- ساده‌سازی MainActivity.java
- حذف تمام WebView override ها
- استفاده از Capacitor default behavior
