# Notification Permission Fix for Android 13+

## مشکل

در اندروید 13+ (API 33+)، سیستم عامل نیاز به مجوز `POST_NOTIFICATIONS` برای نمایش نوتیفیکیشن‌ها دارد. مشکل اصلی این بود که:

1. **WebView محدودیت**: `Notification.requestPermission()` در WebView اندروید به درستی کار نمی‌کند
2. **عدم استفاده از API های native**: کد قبلی سعی می‌کرد از API مرورگر استفاده کند که در اپلیکیشن native کار نمی‌کرد
3. **عدم مدیریت صحیح مجوزها**: سیستم قبلی نمی‌توانست وضعیت مجوزهای native را بررسی کند

## راه حل

### 1. MainActivity.java - اضافه کردن متدهای native

```java
// متدهای جدید در AndroidInterface
@android.webkit.JavascriptInterface
public void requestNotificationPermission() {
    // درخواست مجوز POST_NOTIFICATIONS از طریق سیستم اندروید
}

@android.webkit.JavascriptInterface
public String getNotificationPermissionStatus() {
    // بررسی وضعیت مجوز فعلی
}

@android.webkit.JavascriptInterface
public void openNotificationSettings() {
    // باز کردن تنظیمات نوتیفیکیشن اپلیکیشن
}
```

### 2. notificationPermissionManager.ts - مدیریت متمرکز مجوزها

```typescript
export class NotificationPermissionManager {
  // تشخیص پلتفرم (native vs web)
  // تشخیص نسخه اندروید
  // مدیریت مجوزها بر اساس پلتفرم
  // درخواست مجوز از طریق API مناسب
}
```

### 3. NotificationPermissionDialog.tsx - استفاده از manager

```typescript
// استفاده از manager به جای منطق پیچیده
const permissionInfo = await notificationPermissionManager.getPermissionInfo()
const result = await notificationPermissionManager.requestPermission()
```

## نحوه کارکرد

### برای اندروید 13+ روی اپلیکیشن native:

1. **بررسی مجوز**: `AndroidInterface.getNotificationPermissionStatus()` وضعیت فعلی را بررسی می‌کند
2. **درخواست مجوز**: `AndroidInterface.requestNotificationPermission()` دیالوگ سیستم اندروید را نمایش می‌دهد
3. **نتیجه**: سیستم اندروید نتیجه را به WebView برمی‌گرداند
4. **مدیریت**: کد JavaScript نتیجه را دریافت و مدیریت می‌کند

### برای اندروید <13 یا web:

1. **بررسی مجوز**: از `Notification.permission` استفاده می‌شود
2. **درخواست مجوز**: از `Notification.requestPermission()` استفاده می‌شود
3. **مدیریت**: نتیجه مستقیماً در JavaScript مدیریت می‌شود

## مزایای راه حل جدید

1. **قابلیت اطمینان**: استفاده از API های native اندروید برای مجوزها
2. **مدیریت متمرکز**: تمام منطق مجوز در یک کلاس مدیریت می‌شود
3. **سازگاری**: کارکرد صحیح روی تمام پلتفرم‌ها
4. **قابلیت نگهداری**: کد تمیزتر و قابل فهم‌تر
5. **تجربه کاربری بهتر**: دیالوگ‌های مناسب سیستم عامل

## تست

### تست روی اندروید 13+:

1. اپلیکیشن را نصب کنید
2. وارد شوید
3. دیالوگ مجوز نوتیفیکیشن باید نمایش داده شود
4. روی "درخواست مجوز نوتیفیکیشن" کلیک کنید
5. دیالوگ سیستم اندروید باید نمایش داده شود
6. مجوز را بدهید
7. نوتیفیکیشن‌ها باید فعال شوند

### تست روی اندروید <13:

1. اپلیکیشن را نصب کنید
2. وارد شوید
3. دیالوگ مجوز نمایش داده نمی‌شود (مجوز خودکار)
4. نوتیفیکیشن‌ها باید فعال باشند

## عیب‌یابی

### اگر دیالوگ نمایش داده نمی‌شود:

1. **بررسی لاگ‌ها**: در Logcat دنبال پیام‌های `[NotificationManager]` باشید
2. **بررسی AndroidInterface**: مطمئن شوید که `window.AndroidInterface` موجود است
3. **بررسی نسخه اندروید**: مطمئن شوید که نسخه اندروید به درستی تشخیص داده می‌شود

### اگر مجوز درخواست نمی‌شود:

1. **بررسی MainActivity**: مطمئن شوید که متدهای جدید اضافه شده‌اند
2. **بررسی AndroidManifest**: مطمئن شوید که `POST_NOTIFICATIONS` اضافه شده است
3. **بررسی event listeners**: مطمئن شوید که event listeners به درستی تنظیم شده‌اند

## فایل‌های تغییر یافته

1. `android/app/src/main/java/com/kalame/ai/MainActivity.java`
2. `src/components/NotificationPermissionDialog.tsx`
3. `src/App.tsx`
4. `src/utils/notificationPermissionManager.ts` (جدید)

## نتیجه

با این تغییرات، مشکل مجوز نوتیفیکیشن برای اندروید 13+ به طور کامل حل شده و کاربران می‌توانند به راحتی مجوزهای لازم را بدهند.
