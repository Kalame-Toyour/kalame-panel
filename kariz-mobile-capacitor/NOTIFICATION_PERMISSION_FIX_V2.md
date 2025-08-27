# Notification Permission Fix V2 - Complete Solution

## مشکلات حل شده

### 1. مشکل اول: عدم تغییر وضعیت پس از دادن مجوز
- **مشکل**: کاربر مجوز می‌داد ولی وضعیت `isRequesting` باقی می‌ماند
- **راه حل**: اضافه کردن event listener برای `notificationPermissionGranted` و مدیریت بهتر وضعیت

### 2. مشکل دوم: عدم فراخوانی registerPushDevice
- **مشکل**: پس از دادن مجوز، `registerPushDevice` فراخوانی نمی‌شد
- **راه حل**: اضافه کردن event listener در App.tsx و فراخوانی خودکار push setup

## تغییرات اعمال شده

### 1. MainActivity.java
```java
// اضافه کردن تاخیر برای اطمینان از پردازش کامل مجوز
new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
    notifyWebViewPermissionResult("granted");
}, 500);
```

### 2. notificationPermissionManager.ts
```typescript
// ارسال event مخصوص برای مجوز داده شده
window.dispatchEvent(new CustomEvent('notificationPermissionGranted', { detail: 'granted' }))
```

### 3. NotificationPermissionDialog.tsx
```typescript
// فراخوانی فوری callback برای مجوز داده شده
if (result === 'granted') {
  setPermissionInfo(prev => ({ ...prev, status: 'granted' }))
  onPermissionGranted() // فراخوانی فوری
  setTimeout(() => onClose(), 1500)
}
```

### 4. App.tsx
```typescript
// اضافه کردن event listener برای مجوز داده شده
useEffect(() => {
  const handlePermissionGranted = async (event: CustomEvent) => {
    if (event.detail === 'granted' && user?.accessToken) {
      // فراخوانی خودکار push setup
      const { initMobilePushRegistration } = await import('./bootstrap/push')
      initMobilePushRegistration()
    }
  }
  
  window.addEventListener('notificationPermissionGranted', handlePermissionGranted)
  return () => window.removeEventListener('notificationPermissionGranted', handlePermissionGranted)
}, [user?.accessToken, showToast])
```

### 5. bootstrap/push.ts
```typescript
// بررسی وضعیت مجوز از localStorage
const permissionStatus = localStorage.getItem('kariz_notification_permission')
if (permissionStatus === 'granted') {
  console.log('[MobilePush] Permission already granted via custom dialog, proceeding with push setup')
} else {
  // ادامه منطق قبلی
}
```

## نحوه کارکرد جدید

### مرحله 1: نمایش دیالوگ
1. کاربر وارد می‌شود
2. دیالوگ مجوز نوتیفیکیشن نمایش داده می‌شود
3. کاربر روی "درخواست مجوز نوتیفیکیشن" کلیک می‌کند

### مرحله 2: درخواست مجوز
1. `AndroidInterface.requestNotificationPermission()` فراخوانی می‌شود
2. دیالوگ سیستم اندروید نمایش داده می‌شود
3. کاربر مجوز را می‌دهد

### مرحله 3: دریافت نتیجه
1. `onRequestPermissionsResult` در MainActivity فراخوانی می‌شود
2. پس از 500ms تاخیر، `notifyWebViewPermissionResult("granted")` فراخوانی می‌شود
3. WebView event `notificationPermissionGranted` ارسال می‌شود

### مرحله 4: مدیریت نتیجه
1. App.tsx event listener فعال می‌شود
2. `initMobilePushRegistration()` فراخوانی می‌شود
3. FCM token دریافت و با سرور ثبت می‌شود
4. نوتیفیکیشن‌ها فعال می‌شوند

### مرحله 5: بستن دیالوگ
1. وضعیت `permissionInfo.status` به `'granted'` تغییر می‌کند
2. پس از 1.5 ثانیه دیالوگ بسته می‌شود
3. پیام موفقیت نمایش داده می‌شود

## مزایای راه حل جدید

1. **مدیریت بهتر وضعیت**: وضعیت `isRequesting` به درستی مدیریت می‌شود
2. **فراخوانی خودکار**: `registerPushDevice` به صورت خودکار فراخوانی می‌شود
3. **همگام‌سازی**: تمام بخش‌های سیستم با هم همگام هستند
4. **تجربه کاربری بهتر**: کاربر فوراً نتیجه را می‌بیند
5. **قابلیت اطمینان**: event system برای مدیریت بهتر نتیجه

## تست

### تست کامل:
1. اپلیکیشن را نصب کنید
2. وارد شوید
3. دیالوگ مجوز نمایش داده می‌شود
4. روی "درخواست مجوز نوتیفیکیشن" کلیک کنید
5. دیالوگ سیستم اندروید نمایش داده می‌شود
6. مجوز را بدهید
7. وضعیت باید فوراً به "نوتیفیکیشن فعال است" تغییر کند
8. پس از 1.5 ثانیه دیالوگ بسته می‌شود
9. پیام "نوتیفیکیشن فعال شد" نمایش داده می‌شود
10. FCM token باید با سرور ثبت شود

### بررسی لاگ‌ها:
- `[NotificationManager] Native permission result received: granted`
- `[App] Notification permission granted event received: granted`
- `[App] Permission granted, initializing push notifications...`
- `[MobilePush] init start`
- `[MobilePush] Permission already granted via custom dialog, proceeding with push setup`
- `[MobilePush] Token registered with server successfully`

## نتیجه

با این تغییرات، مشکل مجوز نوتیفیکیشن برای اندروید 13+ به طور کامل حل شده و:

1. ✅ وضعیت `isRequesting` به درستی مدیریت می‌شود
2. ✅ `registerPushDevice` به صورت خودکار فراخوانی می‌شود
3. ✅ FCM token با سرور ثبت می‌شود
4. ✅ نوتیفیکیشن‌ها فعال می‌شوند
5. ✅ تجربه کاربری بهبود یافته است
