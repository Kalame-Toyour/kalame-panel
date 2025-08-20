# راهنمای راه‌اندازی Firebase برای اپلیکیشن موبایل

## مراحل راه‌اندازی

### 1. ایجاد پروژه Firebase

1. به [Firebase Console](https://console.firebase.google.com/) بروید
2. پروژه جدید ایجاد کنید یا پروژه موجود را انتخاب کنید
3. نام پروژه را `kariz-mobile` یا نام دلخواه قرار دهید

### 2. اضافه کردن اپلیکیشن Android

1. در Firebase Console، روی آیکون Android کلیک کنید
2. Package name را `com.kalame.ai` قرار دهید
3. App nickname را `Kariz Mobile` قرار دهید
4. روی "Register app" کلیک کنید

### 3. دانلود فایل google-services.json

1. فایل `google-services.json` را دانلود کنید
2. آن را در مسیر `android/app/` قرار دهید
3. مطمئن شوید که فایل در `.gitignore` قرار ندارد (برای امنیت)

### 4. فعال‌سازی Cloud Messaging

1. در Firebase Console، به بخش "Cloud Messaging" بروید
2. Server key را کپی کنید (برای ارسال نوتیفیکیشن از سرور)
3. در بخش "Cloud Messaging" > "FCM registration tokens" می‌توانید توکن‌های ثبت شده را ببینید

### 5. تنظیمات اپلیکیشن

#### AndroidManifest.xml
فایل `AndroidManifest.xml` آپدیت شده و شامل:
- مجوزهای نوتیفیکیشن برای Android 13+ (API 33+)
- سرویس Firebase Messaging
- مجوزهای FCM
- تنظیمات پیش‌فرض نوتیفیکیشن

#### build.gradle
فایل `build.gradle` شامل:
- Google Services plugin
- Firebase dependencies
- تنظیمات Android SDK

### 6. مجوزهای نوتیفیکیشن در Android 13+

#### مجوزهای ضروری:
```xml
<!-- Android 13+ (API 33+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- سایر مجوزها -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

#### نکات مهم:
- `POST_NOTIFICATIONS` باید در runtime درخواست شود
- کاربر باید به صورت دستی مجوز را بدهد
- در Android 12 و پایین‌تر، این مجوز به صورت خودکار اعطا می‌شود

### 7. تست نوتیفیکیشن

1. اپلیکیشن را build و نصب کنید
2. وارد حساب کاربری شوید
3. دیالوگ درخواست مجوز نوتیفیکیشن نمایش داده می‌شود
4. مجوز را بدهید
5. FCM token در سرور ثبت می‌شود

## ساختار فایل‌ها

### google-services.json
```json
{
  "project_info": {
    "project_number": "123456789",
    "project_id": "kariz-mobile-12345",
    "storage_bucket": "kariz-mobile-12345.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:abcdef123456",
        "android_client_info": {
          "package_name": "com.kalame.ai"
        }
      },
      "oauth_client": [],
      "api_key": [
        {
          "current_key": "AIzaSyC..."
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

## عیب‌یابی

### مشکل: نوتیفیکیشن کار نمی‌کند

#### بررسی‌های اولیه:
1. فایل `google-services.json` را بررسی کنید
2. مجوزهای نوتیفیکیشن را در تنظیمات دستگاه بررسی کنید
3. Logcat را برای خطاهای Firebase بررسی کنید

#### بررسی مجوزها:
```bash
# در Logcat دنبال این پیام‌ها بگردید:
adb logcat | grep -i "notification\|permission\|firebase"
```

#### بررسی FCM:
```bash
# بررسی اتصال به Google Play Services
adb shell dumpsys package com.google.android.gms | grep -i "version"
```

### مشکل: FCM token دریافت نمی‌شود

#### بررسی‌ها:
1. اتصال اینترنت را بررسی کنید
2. Google Play Services را آپدیت کنید
3. اپلیکیشن را uninstall و دوباره نصب کنید
4. Logcat را برای خطاهای Firebase بررسی کنید

#### کدهای خطا:
- `MISSING_INSTANCEID_SERVICE`: Google Play Services مشکل دارد
- `SERVICE_NOT_AVAILABLE`: سرویس Firebase در دسترس نیست
- `TOO_MANY_REGISTRATIONS`: تعداد ثبت‌ها بیش از حد است

### مشکل: نوتیفیکیشن در foreground نمایش داده نمی‌شود

#### بررسی‌ها:
1. کد `onMessage` در `push.ts` را بررسی کنید
2. مجوزهای نوتیفیکیشن را بررسی کنید
3. Notification Channel را بررسی کنید

### مشکل: مجوز POST_NOTIFICATIONS در Android 13+

#### راه‌حل:
1. مطمئن شوید که `targetSdkVersion` 33 یا بالاتر است
2. مجوز را در runtime درخواست کنید
3. از `FirebaseMessaging.requestPermissions()` استفاده کنید

#### کد نمونه:
```typescript
// درخواست مجوز Firebase (شامل POST_NOTIFICATIONS)
await FirebaseMessaging.requestPermissions()

// بررسی وضعیت مجوز
const perm = await PushNotifications.checkPermissions()
if (perm.receive === 'granted') {
  // مجوز داده شده
} else {
  // مجوز داده نشده
}
```

## نکات مهم

### 1. امنیت
- فایل `google-services.json` را در repository قرار ندهید
- API keys را محافظت کنید
- از HTTPS برای ارتباطات استفاده کنید

### 2. Testing
- از دستگاه واقعی برای تست استفاده کنید (نه emulator)
- Google Play Services باید نصب و به‌روز باشد
- اتصال اینترنت پایدار داشته باشید

### 3. Permissions
- مجوزهای نوتیفیکیشن باید در runtime درخواست شوند
- کاربر باید به صورت دستی مجوز را بدهد
- در Android 13+، `POST_NOTIFICATIONS` ضروری است

### 4. Background
- نوتیفیکیشن‌ها در background به صورت خودکار نمایش داده می‌شوند
- از Notification Channel برای Android 8+ استفاده کنید
- Priority و Importance را تنظیم کنید

### 5. Performance
- FCM token را در سرور ذخیره کنید
- از retry mechanism برای ثبت token استفاده کنید
- Error handling مناسب پیاده‌سازی کنید

## منابع مفید

- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android Notification Permissions](https://developer.android.com/develop/ui/views/notifications/notification-permission)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Capacitor Firebase Messaging](https://capacitorjs.com/docs/plugins/firebase-messaging)

## پشتیبانی

در صورت بروز مشکل:
1. Logcat را بررسی کنید
2. مستندات Firebase را مطالعه کنید
3. از Firebase Console برای بررسی وضعیت استفاده کنید
4. با تیم توسعه تماس بگیرید
