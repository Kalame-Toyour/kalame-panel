# SMS Retriever API برای تشخیص خودکار کد تایید

## خلاصه
این سیستم از **SMS Retriever API گوگل** برای تشخیص خودکار کد تایید استفاده می‌کند. این روش استانداردترین و امن‌ترین راه حل است که نیازی به دسترسی مستقیم به SMS ندارد.

## مزایای کلیدی ✅
- **بدون نیاز به مجوز SMS**: هیچ مجوز اضافه‌ای برای خواندن SMS لازم نیست
- **کاملاً خودکار**: کد تایید به طور خودکار استخراج و در فیلد قرار داده می‌شود
- **امن و استاندارد**: توسط گوگل پشتیبانی می‌شود و با Google Play Store سازگار است
- **تجربه کاربری بهتر**: کاربر نیازی به تایپ دستی کد ندارد و فرآیند بسیار روان می‌شود

## نحوه کارکرد

### 1. **SMS Retriever API**
- از `SmsRetrieverClient` گوگل استفاده می‌کند
- به صورت خودکار SMS‌های دریافتی را بررسی می‌کند
- کد تایید را از متن SMS استخراج می‌کند
- نیازی به دسترسی مستقیم به SMS نیست

### 2. **الگوهای تشخیص کد**
```java
// الگوهای مختلف برای تشخیص کد تایید
String[] patterns = {
    "کد فعال سازی (\\d{4,6})",        // "کد فعال سازی 6207"
    "کد تایید[\\s:]*([0-9]{4,6})",   // "کد تایید: 1234"
    "verification code[\\s:]*([0-9]{4,6})", // "verification code: 1234"
    "کد[\\s:]*([0-9]{4,6})",          // "کد: 1234"
    "otp[\\s:]*([0-9]{4,6})",         // "OTP: 1234"
    "([0-9]{4,6})"                    // کد 4-6 رقمی ساده
};
```

### 3. **جریان کار**
1. کاربر شماره تلفن را وارد می‌کند
2. سیستم شروع به گوش دادن به SMS‌ها می‌کند
3. وقتی SMS می‌آید، `SmsRetrieverClient` آن را دریافت می‌کند
4. کد تایید از متن SMS استخراج می‌شود
5. کد به صورت خودکار در فیلد مربوطه قرار می‌گیرد
6. فرم به صورت خودکار ارسال می‌شود

## فایل‌های مورد نیاز

### Android
- `MainActivity.java` - مدیریت JavaScript interface و SMS Retriever
- `AndroidManifest.xml` - تعریف مجوزها (نیازی به مجوز SMS نیست)
- `build.gradle` - Google Play Services dependencies

### React/TypeScript
- `smsRetriever.ts` - wrapper برای native API
- `AuthPage.tsx` - استفاده از SMS retriever

## مجوزهای مورد نیاز

### AndroidManifest.xml
```xml
<!-- هیچ مجوز اضافه‌ای برای SMS Retriever API لازم نیست -->
<!-- Google Play Services dependencies در build.gradle -->
```

### build.gradle
```gradle
// Google Play Services for SMS Retriever API
implementation 'com.google.android.gms:play-services-auth:20.7.0'
implementation 'com.google.android.gms:play-services-auth-api-phone:18.0.1'
```

## تنظیمات کاربر

### 1. **نیازی به تنظیمات اضافه نیست**
- SMS Retriever API به صورت خودکار کار می‌کند
- نیازی به فعال‌سازی دسترسی خاص نیست
- فقط Google Play Services باید نصب باشد

### 2. **محدودیت‌ها**
- فقط روی دستگاه‌هایی که Google Play Services نصب دارند کار می‌کند
- نیاز به اتصال اینترنت برای Google Play Services

## تست و دیباگ

### Web Platform
```typescript
// شبیه‌سازی SMS برای تست
(smsRetriever as any).simulateSms('1234');
```

### Android Platform
1. **ارسال SMS واقعی** به شماره تلفن
2. **بررسی لاگ‌ها** در Android Studio
3. **تست با SMS‌های مختلف** برای بررسی الگوها

## لاگ‌های مهم

### MainActivity
```
[MainActivity] SMS retriever started successfully
[MainActivity] SMS retrieved successfully: کد فعال سازی 6207
[MainActivity] Verification code extracted: 6207 from SMS: کد فعال سازی 6207
```

### AuthPage
```
[AuthPage] SMS retriever set up successfully
[AuthPage] SMS code received: 6207
[AuthPage] SMS retriever stopped
```

## عیب‌یابی

### مشکل: کد تشخیص داده نمی‌شود
1. **بررسی الگوی SMS** - ممکن است الگوی جدیدی نیاز باشد
2. **بررسی لاگ‌ها** برای خطاهای احتمالی
3. **بررسی Google Play Services** - باید نصب و فعال باشد

### مشکل: SMS Retriever کار نمی‌کند
1. **بررسی dependencies** در build.gradle
2. **بررسی کد Java** برای خطاهای syntax
3. **بررسی Google Play Services** - باید نصب باشد

### مشکل: فقط در برخی دستگاه‌ها کار می‌کند
1. **بررسی Google Play Services** - باید نصب باشد
2. **بررسی نسخه اندروید** - نیاز به API 18+
3. **بررسی اتصال اینترنت** - برای Google Play Services

## بهینه‌سازی

### 1. **Timeout مدیریت**
- بعد از 2 دقیقه، گوش دادن متوقف می‌شود
- از مصرف باتری اضافی جلوگیری می‌شود

### 2. **Fallback به Mock**
- در صورت عدم دسترسی به native API، از mock استفاده می‌شود
- اپ در همه شرایط کار می‌کند

### 3. **الگوهای هوشمند**
- الگوهای مختلف برای زبان‌های مختلف
- پشتیبانی از فرمت‌های مختلف SMS

## امنیت

### 1. **عدم دسترسی مستقیم به SMS**
- هیچ دسترسی مستقیم به SMS وجود ندارد
- فقط از طریق Google Play Services API

### 2. **محدودیت دسترسی**
- فقط کدهای 4-6 رقمی استخراج می‌شوند
- از استخراج اطلاعات حساس جلوگیری می‌شود

### 3. **لاگ محدود**
- فقط اطلاعات ضروری لاگ می‌شوند
- از لاگ کردن اطلاعات حساس جلوگیری می‌شود

## نمونه SMS

### فارسی
```
سلام
به سامانه هوشمند کلمه خوش آمدید
کد فعال سازی 6207
لغو11
```

### انگلیسی
```
Welcome to Kalame AI
Your verification code is: 1234
Reply STOP to unsubscribe
```

## آینده

### قابلیت‌های پیشنهادی
1. **پشتیبانی از الگوهای بیشتر** برای زبان‌های مختلف
2. **یادگیری الگوهای جدید** از کاربر
3. **تشخیص هوشمند** نوع کد (تایید، OTP، رمز)
4. **پشتیبانی از فرمت‌های جدید** SMS

## منابع مفید

- [SMS Retriever API Documentation](https://developers.google.com/identity/sms-retriever)
- [Android SMS Retriever Guide](https://developer.android.com/guide/topics/connectivity/sms-retriever)
- [Google Play Services Auth](https://developers.google.com/android/guides/auth)
- [Capacitor Android Development](https://capacitorjs.com/docs/android)

## نکات مهم

### 1. **Google Play Services**
- SMS Retriever API فقط روی دستگاه‌هایی که Google Play Services نصب دارند کار می‌کند
- در چین و برخی کشورها ممکن است محدودیت داشته باشد

### 2. **فرمت SMS**
- SMS باید شامل کد تایید باشد
- الگوهای مختلف پشتیبانی می‌شوند
- کد باید 4-6 رقمی باشد

### 3. **عملکرد**
- تشخیص خودکار و سریع
- نیازی به تایپ دستی کد نیست
- تجربه کاربری بهتر
