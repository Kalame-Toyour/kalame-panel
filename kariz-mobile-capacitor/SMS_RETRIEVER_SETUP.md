# راهنمای راه‌اندازی SMS Retriever

## توضیحات
این قابلیت به کاربران اندروید اجازه می‌دهد که کدهای تایید SMS را به صورت خودکار تشخیص دهند و در فیلد مربوطه وارد کنند.

## نحوه پیاده‌سازی
این قابلیت با استفاده از Android SMS Retriever API و JavaScript Interface پیاده‌سازی شده است.

## تنظیمات اندروید

### 1. مجوزهای لازم در `android/app/src/main/AndroidManifest.xml`
```xml
<!-- SMS Permissions for SMS Retriever -->
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
```

### 2. پیاده‌سازی در `MainActivity.java`
- `AndroidInterface` class برای ارتباط JavaScript با Android
- `BroadcastReceiver` برای دریافت SMS
- مدیریت مجوزهای SMS

### 3. Dependencies در `android/app/build.gradle`
```gradle
// SMS Retriever dependencies
implementation 'com.google.android.gms:play-services-auth:20.7.0'
implementation 'com.google.android.gms:play-services-auth-api-phone:18.0.1'
```

## نحوه کارکرد

### 1. شروع گوش دادن به SMS
- وقتی کاربر شماره تلفن را وارد می‌کند و به مرحله 2 می‌رود
- `startSmsRetriever()` از JavaScript فراخوانی می‌شود
- Android SMS receiver ثبت می‌شود
- یک نشانگر وضعیت نمایش داده می‌شود

### 2. تشخیص خودکار کد
- وقتی SMS دریافت می‌شود، `BroadcastReceiver` آن را دریافت می‌کند
- متن SMS به WebView ارسال می‌شود
- JavaScript کد تایید را استخراج می‌کند
- کد به صورت خودکار در فیلد مربوطه وارد می‌شود
- اگر کد 4 رقمی باشد، فرم به صورت خودکار submit می‌شود

### 3. الگوهای تشخیص کد
سیستم از الگوهای زیر برای تشخیص کد استفاده می‌کند:
- `1234` - کد 4 رقمی ساده
- `کد تایید: 1234` - فارسی
- `verification code: 1234` - انگلیسی
- `کد: 1234` - فارسی کوتاه
- `code: 1234` - انگلیسی کوتاه

## تست

### Web Platform
- دکمه "تست" برای شبیه‌سازی SMS
- کلیک روی دکمه باعث می‌شود کد "1234" به صورت خودکار وارد شود

### Android Platform
- ارسال SMS واقعی با کد تایید
- سیستم باید کد را تشخیص دهد و وارد کند

## نکات مهم

1. **مجوزها**: کاربر باید مجوزهای SMS را بدهد
2. **زمان گوش دادن**: سیستم تا 2 دقیقه گوش می‌دهد
3. **Fallback**: در صورت خطا، سیستم به حالت عادی برمی‌گردد
4. **Web Support**: در وب، فقط شبیه‌سازی انجام می‌شود
5. **Android API**: از Android SMS Retriever API استفاده می‌کند

## عیب‌یابی

### مشکل: کد تشخیص داده نمی‌شود
- بررسی کنید که SMS شامل یکی از الگوهای پشتیبانی شده باشد
- مطمئن شوید که مجوزهای SMS داده شده باشد
- لاگ‌های کنسول را بررسی کنید
- بررسی کنید که `MainActivity.java` درست compile شده باشد

### مشکل: پلاگین کار نمی‌کند
- مطمئن شوید که `npx cap sync android` اجرا شده باشد
- بررسی کنید که dependency ها در `build.gradle` اضافه شده باشند
- پروژه را rebuild کنید
- بررسی کنید که مجوزهای SMS در `AndroidManifest.xml` اضافه شده باشند

## ساخت و تست

### 1. Sync کردن با Capacitor
```bash
npx cap sync android
```

### 2. Build کردن پروژه
```bash
npx cap build android
```

### 3. اجرا روی دستگاه
```bash
npx cap run android
```

## منابع
- [Android SMS Retriever API Documentation](https://developers.google.com/identity/sms-retriever)
- [Android BroadcastReceiver Documentation](https://developer.android.com/reference/android/content/BroadcastReceiver)
- [Capacitor Android Development](https://capacitorjs.com/docs/android)
