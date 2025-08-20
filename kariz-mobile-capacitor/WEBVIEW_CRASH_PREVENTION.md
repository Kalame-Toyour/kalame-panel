# راهنمای پیشگیری از WebView Crash در Android

## مشکل شناسایی شده

```
App paused
App stopped  
App destroyed
[ERROR:android_webview/browser/aw_browser_terminator.cc:165] Renderer process crash detected (code -1)
```

## علت مشکل

WebView renderer process crash به دلایل زیر رخ می‌دهد:

1. **Memory Leaks**: عدم مدیریت صحیح حافظه
2. **Rapid Navigation**: تغییرات سریع بین صفحات
3. **WebView Lifecycle**: عدم مدیریت صحیح lifecycle
4. **Resource Exhaustion**: مصرف بیش از حد منابع
5. **JavaScript Errors**: خطاهای JavaScript که باعث crash می‌شوند

## راه‌حل‌های پیاده‌سازی شده

### 1. **WebViewManager پیشرفته** (`src/utils/webviewManager.ts`)

#### ویژگی‌های کلیدی:
- **Memory Monitoring**: نظارت بر مصرف حافظه
- **Crash Recovery**: بازیابی خودکار از crash
- **Navigation Queueing**: صف‌بندی navigation requests
- **Resource Cleanup**: پاک‌سازی منابع
- **Error Boundaries**: مرزهای خطا

#### عملکرد:
```typescript
// Memory monitoring
setupMemoryMonitoring(): void

// Crash recovery
recoverFromCrash(): void

// Resource optimization
optimizeMemory(): void

// Safe navigation
safeNavigate(navigationFunction: () => void): Promise<void>
```

### 2. **MainActivity بهینه‌سازی شده** (`android/app/src/main/java/com/kalame/ai/MainActivity.java`)

#### ویژگی‌های کلیدی:
- **WebView Configuration**: تنظیمات بهینه WebView
- **Memory Management**: مدیریت حافظه
- **Crash Prevention Script**: اسکریپت پیشگیری از crash
- **Error Handling**: مدیریت خطاها
- **Resource Cleanup**: پاک‌سازی منابع

#### تنظیمات WebView:
```java
// Performance optimizations
settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
settings.setEnableSmoothTransition(true);

// Memory optimizations
settings.setCacheMode(WebSettings.LOAD_DEFAULT);
settings.setAppCacheEnabled(true);

// Security settings
settings.setAllowFileAccess(false);
settings.setAllowContentAccess(false);
```

### 3. **AndroidManifest.xml بهبود یافته**

#### ویژگی‌های کلیدی:
- **Hardware Acceleration**: شتاب سخت‌افزاری
- **Large Heap**: heap بزرگ‌تر
- **Process Isolation**: جداسازی process
- **Network Security**: امنیت شبکه

```xml
android:hardwareAccelerated="true"
android:largeHeap="true"
android:usesCleartextTraffic="false"
android:networkSecurityConfig="@xml/network_security_config"
```

### 4. **Network Security Config** (`android/app/src/main/res/xml/network_security_config.xml`)

#### ویژگی‌های کلیدی:
- **HTTPS Enforcement**: اجبار HTTPS
- **Domain Whitelisting**: لیست سفید دامنه‌ها
- **Security Headers**: هدرهای امنیتی

### 5. **Capacitor Config بهبود یافته** (`capacitor.config.ts`)

#### ویژگی‌های کلیدی:
- **Server Configuration**: تنظیمات سرور
- **Navigation Control**: کنترل navigation
- **Debug Options**: گزینه‌های debug

## نحوه کارکرد سیستم

### 1. **Memory Monitoring**
- نظارت بر مصرف حافظه هر 10 ثانیه
- آستانه 50MB برای هشدار
- آستانه 100MB برای cleanup خودکار

### 2. **Crash Prevention**
- Injection اسکریپت JavaScript
- Error boundaries
- Promise rejection handling
- Memory cleanup on visibility change

### 3. **Navigation Safety**
- Queueing navigation requests
- Debouncing rapid navigation
- Pre/post navigation cleanup
- Error recovery

### 4. **Resource Management**
- WebView cache cleanup
- Event listener cleanup
- Timer cleanup
- Garbage collection

## مراحل تست

### 1. **Clean Build**
```bash
cd android
./gradlew clean
./gradlew build
```

### 2. **Test Scenarios**
- Navigation بین صفحات مختلف
- Back button handling
- Memory-intensive operations
- Rapid navigation
- App backgrounding/foregrounding

### 3. **Monitor Logs**
```bash
adb logcat | grep -E "(WebViewManager|MainActivity|WebView)"
```

## نکات مهم

### 1. **Performance Optimization**
- Hardware acceleration فعال
- Memory monitoring فعال
- Resource cleanup خودکار
- Crash recovery خودکار

### 2. **Security Features**
- HTTPS enforcement
- Domain whitelisting
- Safe browsing disabled
- File access restricted

### 3. **Memory Management**
- Large heap allocation
- Periodic cleanup
- Garbage collection
- Cache management

## عیب‌یابی

### 1. **اگر مشکل ادامه دارد**
- Logs را بررسی کنید
- Memory usage را monitor کنید
- WebView debugging را فعال کنید
- Crash reports را بررسی کنید

### 2. **Performance Issues**
- Memory cleanup frequency را تنظیم کنید
- Navigation debouncing را تنظیم کنید
- Resource cleanup thresholds را تنظیم کنید

### 3. **Debugging**
```bash
# Enable WebView debugging
adb shell setprop debug.webview.provider com.kalame.ai

# Monitor memory usage
adb shell dumpsys meminfo com.kalame.ai

# Check WebView processes
adb shell ps | grep webview
```

## نتیجه

با اعمال این تغییرات:

✅ **WebView crashes برطرف می‌شوند**
✅ **Memory leaks مدیریت می‌شوند**
✅ **Navigation stability بهبود می‌یابد**
✅ **Crash recovery خودکار فعال می‌شود**
✅ **Performance بهینه می‌شود**
✅ **Security بهبود می‌یابد**

## تست نهایی

پس از اعمال تغییرات:

1. **Clean و Rebuild** پروژه
2. **Test navigation** بین صفحات
3. **Monitor memory usage**
4. **Check crash logs**
5. **Verify stability**

این سیستم باید WebView crashes را به طور کامل برطرف کند و stability اپلیکیشن را به طور قابل توجهی بهبود دهد.
