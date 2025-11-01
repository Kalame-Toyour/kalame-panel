# راهنمای اصلاح درخواست مجوز نوتیفیکیشن Native در Android

## مشکل
درخواست مجوز نوتیفیکیشن در اپ کار نمی‌کرد:
1. وقتی کاربر روی دکمه می‌زد هیچ اتفاقی نمی‌افتاد
2. استفاده از `AndroidInterface` که ممکن بود وجود نداشته باشد
3. متن‌ها می‌گفت "مرورگر" به جای "اپلیکیشن"

## راه‌حل
استفاده از Capacitor PushNotifications API به جای AndroidInterface برای درخواست native permission.

## تغییرات انجام شده

### 1. `notificationPermissionManager.ts`

#### استفاده از Capacitor PushNotifications:
```typescript
import { PushNotifications } from '@capacitor/push-notifications'

// به جای AndroidInterface:
private async requestCapacitorPermission(): Promise<'granted' | 'denied' | 'default'> {
  const result = await PushNotifications.requestPermissions()
  // ...
}
```

#### اصلاح getCurrentPermissionStatus:
- استفاده از `PushNotifications.checkPermissions()` برای native platform
- بررسی صحیح وضعیت permission

#### اصلاح canRequestPermission:
- تبدیل به async function
- استفاده از Capacitor API برای بررسی امکان درخواست

#### اصلاح openNotificationSettings:
- استفاده از Capacitor App plugin برای باز کردن تنظیمات
- Fallback به Browser plugin
- در صورت عدم دسترسی، نمایش راهنما

### 2. `NotificationPermissionDialog.tsx`

#### اصلاح متن‌ها:
- تغییر "مرورگر" به "دستگاه" یا "اپلیکیشن"
- حذف اشاره به مرورگر در native context

#### اصلاح shouldShowRequestButton:
- اضافه کردن چک برای platform !== 'web'

### 3. مزایا

✅ استفاده از Capacitor API (رسمی و پایدار)
✅ کار در همه نسخه‌های Android (13+)
✅ درست handle کردن وضعیت permission
✅ متن‌های مناسب برای اپلیکیشن

## نحوه کارکرد

### Flow:
1. کاربر روی "درخواست مجوز نوتیفیکیشن" کلیک می‌کند
2. `requestPermission()` فراخوانی می‌شود
3. برای native platform: `PushNotifications.requestPermissions()` فراخوانی می‌شود
4. سیستم Android native dialog نمایش می‌دهد
5. نتیجه (granted/denied) برمی‌گردد و handle می‌شود

### برای Android 13+:
- استفاده از `POST_NOTIFICATIONS` permission
- Capacitor خودش این permission را handle می‌کند
- Dialog native Android نمایش داده می‌شود

### برای Android < 13:
- Permission خودکار است
- نیازی به درخواست نیست

## تست

### مراحل تست:

1. **Build و Sync**:
   ```bash
   cd kariz-mobile-capacitor
   npm run build
   npx cap sync android
   ```

2. **تست در Android**:
   - اپ را build و install کنید
   - Dialog نوتیفیکیشن را باز کنید
   - روی "درخواست مجوز نوتیفیکیشن" کلیک کنید
   - باید native Android permission dialog نمایش داده شود
   - اگر اجازه دادید، باید status به "granted" تغییر کند

3. **تست در Android 15**:
   - روی Android 15 تست کنید
   - باید permission dialog نمایش داده شود
   - باید بتوانید permission را grant/deny کنید

## نکات مهم

1. **Capacitor Plugin**: مطمئن شوید `@capacitor/push-notifications` در `package.json` هست

2. **Android Permissions**: در `AndroidManifest.xml` باید permission اضافه شده باشد:
   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```

3. **Native Build**: بعد از تغییرات، باید native code را rebuild کنید

4. **Testing**: همیشه روی دستگاه واقعی تست کنید (نه emulator)

## عیب‌یابی

### اگر permission dialog نمایش داده نمی‌شود:
1. Console logs را بررسی کنید
2. مطمئن شوید `PushNotifications` plugin available است
3. مطمئن شوید در native platform هستید

### اگر permission granted می‌شود ولی کار نمی‌کند:
1. Firebase setup را بررسی کنید
2. FCM token registration را بررسی کنید
3. Backend API را بررسی کنید

