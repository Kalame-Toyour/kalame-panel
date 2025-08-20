# رفع مشکل Localhost در اندروید

## مشکلات شناسایی شده:

1. **Network Security Config**: تنظیمات امنیتی شبکه تعریف نشده بود
2. **HTTPS vs HTTP**: اپ روی localhost:3000 (HTTP) اجرا می‌شود اما Capacitor روی HTTPS تنظیم شده بود
3. **Mixed Content**: تنظیمات allowMixedContent: false بود
4. **WebView URL**: اپ localhost را لود می‌کرد نه localhost:3000

## تغییرات اعمال شده:

### 1. فایل `network_security_config.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
```

### 2. AndroidManifest.xml
- `android:usesCleartextTraffic="true"`
- `android:networkSecurityConfig="@xml/network_security_config"`

### 3. capacitor.config.ts
- `androidScheme: 'http'`
- `cleartext: true`
- `allowMixedContent: true`

### 4. MainActivity.java
- اضافه کردن متد `loadLocalhostURL()` برای لود کردن localhost:3000
- اضافه کردن متد `tryAlternativeURLs()` برای تلاش URL های مختلف
- بهبود error handling در WebView

### 5. WebViewCrashPreventionService.java
- رفع خطای "f != java.lang.Long" در memory monitoring

## مراحل تست:

1. **Build مجدد اپ**:
   ```bash
   npm run build
   npx cap sync android
   ```

2. **Run مجدد در اندروید استودیو**:
   - Clean Project
   - Rebuild Project
   - Run

3. **تست اتصال**:
   - اطمینان از اینکه اپ React روی localhost:3000 اجرا می‌شود
   - اطمینان از اینکه دستگاه اندروید به همان شبکه متصل است

## نکات مهم:

- اپ React باید روی localhost:3000 اجرا شود
- دستگاه اندروید باید به همان شبکه WiFi متصل باشد
- اگر از emulator استفاده می‌کنید، از 10.0.2.2:3000 استفاده کنید
- اگر از device واقعی استفاده می‌کنید، از IP کامپیوتر استفاده کنید

## عیب‌یابی:

اگر همچنان مشکل دارید:
1. Logcat را بررسی کنید
2. اطمینان حاصل کنید که اپ React روی localhost:3000 اجرا می‌شود
3. تنظیمات firewall را بررسی کنید
4. از IP کامپیوتر به جای localhost استفاده کنید
