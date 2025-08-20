# رفع مشکل Back Button Navigation در اندروید

## مشکل شناسایی شده:

Back button در تمام صفحات یکسان عمل می‌کرد و همیشه پیام "برای خروج دوباره بزنید" را نمایش می‌داد، حتی در صفحاتی که باید به صفحه قبلی برمی‌گشت.

## رفتار صحیح مورد انتظار:

1. **در صفحه اصلی (chat)**: 
   - اولین بار: نمایش پیام "برای خروج دوباره بزنید"
   - دومین بار: خروج از برنامه

2. **در صفحات دیگر (auth, pricing, image, etc.)**:
   - فقط یک بار بک زدن: برگشت به صفحه قبلی
   - بدون نمایش پیام خروج

## راه‌حل اعمال شده:

### 1. اصلاح MainActivity.java
- اضافه کردن JavaScript bridge برای ارتباط با React app
- بررسی وضعیت router context برای تشخیص صفحه فعلی
- handle کردن back button بر اساس صفحه فعلی

### 2. اصلاح App.tsx
- Expose کردن router context به window object
- اضافه کردن goBack function برای MainActivity
- بهبود back button handling

### 3. استفاده از RouterContext
- تشخیص اینکه آیا کاربر در صفحه اصلی است یا نه
- handle کردن navigation بر اساس وضعیت فعلی

## کد نهایی MainActivity.java:

```java
@Override
public void onBackPressed() {
    WebView webView = getBridge().getWebView();
    
    if (webView != null) {
        if (webView.canGoBack()) {
            // اگر WebView بتواند برگردد، برگردد
            webView.goBack();
        } else {
            // بررسی وضعیت router context
            webView.evaluateJavascript(
                "(function() { " +
                "  try { " +
                "    if (window.routerContext && typeof window.routerContext.isAtRoot === 'function') { " +
                "      return window.routerContext.isAtRoot(); " +
                "    } " +
                "    return true; " +
                "  } catch(e) { " +
                "    return true; " +
                "  } " +
                "})();",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        boolean isAtRoot = "true".equals(value);
                        
                        if (isAtRoot) {
                            // در صفحه اصلی - نمایش پیام خروج
                            if (backPressTime + BACK_PRESS_INTERVAL > System.currentTimeMillis()) {
                                // دومین بار - خروج از برنامه
                                MainActivity.super.onBackPressed();
                            } else {
                                // اولین بار - نمایش پیام
                                backPressTime = System.currentTimeMillis();
                                // نمایش toast "برای خروج دوباره بزنید"
                            }
                        } else {
                            // در صفحات دیگر - trigger کردن navigation
                            webView.evaluateJavascript(
                                "(function() { " +
                                "  if (window.routerContext && typeof window.routerContext.goBack === 'function') { " +
                                "    window.routerContext.goBack(); " +
                                "  } " +
                                "})();",
                                null
                            );
                        }
                    }
                }
            );
        }
    }
}
```

## کد نهایی App.tsx:

```typescript
// Expose router context to window for Android back button handling
useEffect(() => {
  if (Capacitor?.isNativePlatform?.()) {
    (window as any).routerContext = {
      isAtRoot: () => isAtRoot(),
      canGoBack: () => canGoBack(),
      currentRoute: currentRoute,
      goBack: () => {
        if (canGoBack()) {
          goBack();
          return true;
        }
        return false;
      }
    };
    
    return () => {
      delete (window as any).routerContext;
    };
  }
}, [isAtRoot, canGoBack, currentRoute, goBack]);
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

### 3. تست Back Button
- در صفحه اصلی: دوبار بک زدن برای خروج
- در صفحات دیگر: یک بار بک زدن برای برگشت

## نتیجه نهایی:

✅ Back button در صفحه اصلی درست کار کند
✅ Back button در صفحات دیگر به صفحه قبلی برگردد
✅ پیام خروج فقط در صفحه اصلی نمایش داده شود
✅ Navigation بین صفحات درست کار کند

## تغییرات کلیدی:

- اضافه کردن JavaScript bridge در MainActivity
- Expose کردن router context در App.tsx
- تشخیص صفحه فعلی برای back button handling
- بهبود navigation logic
