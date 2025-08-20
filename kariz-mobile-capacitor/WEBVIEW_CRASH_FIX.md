# راهنمای رفع WebView Crashes در اپلیکیشن موبایل

## مشکل شناسایی شده

```
App paused
App stopped
App destroyed
[ERROR:android_webview/browser/aw_browser_terminator.cc:165] Renderer process crash detected (code -1)
```

این خطا معمولاً هنگام navigation بین صفحات رخ می‌دهد و باعث crash شدن WebView renderer process می‌شود.

## علل احتمالی

### 1. **Memory Leaks**
- عدم پاکسازی event listeners
- عدم پاکسازی timers و timeouts
- عدم پاکسازی state هنگام unmount شدن کامپوننت‌ها

### 2. **Rapid Navigation**
- کلیک‌های سریع روی دکمه‌های navigation
- عدم مدیریت state navigation
- تداخل بین navigation requests

### 3. **WebView Lifecycle Issues**
- عدم مدیریت صحیح lifecycle WebView
- مشکلات در Android WebView
- عدم cleanup مناسب

## راه‌حل‌های پیاده‌سازی شده

### 1. **WebViewManager Utility**
فایل `src/utils/webviewManager.ts` ایجاد شده که:
- Navigation requests را queue می‌کند
- از rapid navigation جلوگیری می‌کند
- Error handling مناسب دارد
- Memory cleanup انجام می‌دهد

### 2. **RouterContext بهبود یافته**
- Navigation state management بهتر
- Debouncing برای navigation
- Error handling و recovery
- Memory leak prevention

### 3. **Component Cleanup**
- useEffect cleanup functions
- Timer cleanup
- Event listener cleanup
- State reset on unmount

### 4. **Back Button Handling بهبود یافته**
- Prevention of multiple rapid presses
- Navigation state checking
- Error handling
- Graceful fallbacks

## نحوه استفاده

### 1. **Safe Navigation**
```typescript
import { safeNavigate } from './utils/webviewManager';

// به جای navigate مستقیم
safeNavigate(() => {
  // navigation logic here
});
```

### 2. **Component Cleanup**
```typescript
useEffect(() => {
  // setup logic
  
  return () => {
    // cleanup logic
    clearTimeout(timer);
    removeEventListener('event', handler);
  };
}, []);
```

### 3. **Navigation State Management**
```typescript
const { isNavigating, canGoBack } = useRouter();

if (isNavigating) {
  // Show loading or disable navigation
  return;
}
```

## تست و بررسی

### 1. **Logcat Monitoring**
```bash
adb logcat | grep -i "webview\|crash\|error\|router"
```

### 2. **Navigation Testing**
- رفتن به صفحه image
- زدن back button
- بررسی عدم crash شدن
- تست rapid navigation

### 3. **Memory Monitoring**
- بررسی memory usage
- بررسی event listeners
- بررسی timers

## نکات مهم

### 1. **Development**
- همیشه از cleanup functions استفاده کنید
- از rapid navigation جلوگیری کنید
- Error boundaries پیاده‌سازی کنید

### 2. **Testing**
- روی دستگاه واقعی تست کنید
- Navigation edge cases را تست کنید
- Memory usage را monitor کنید

### 3. **Production**
- Error logging فعال کنید
- Crash reporting پیاده‌سازی کنید
- User feedback مناسب ارائه دهید

## عیب‌یابی بیشتر

### 1. **اگر مشکل ادامه دارد**
- Logcat را بررسی کنید
- Memory usage را چک کنید
- Navigation flow را بررسی کنید

### 2. **Performance Optimization**
- Lazy loading کامپوننت‌ها
- Code splitting
- Bundle size optimization

### 3. **Android Specific**
- WebView version compatibility
- Android API level compatibility
- Device-specific issues

## نتیجه

با پیاده‌سازی این راه‌حل‌ها:
- WebView crashes کاهش می‌یابد
- Navigation پایدارتر می‌شود
- User experience بهبود می‌یابد
- Memory leaks برطرف می‌شود

## منابع مفید

- [Android WebView Documentation](https://developer.android.com/reference/android/webkit/WebView)
- [Capacitor Navigation Best Practices](https://capacitorjs.com/docs/guides/navigation)
- [React Navigation Troubleshooting](https://reactnavigation.org/docs/troubleshooting)
