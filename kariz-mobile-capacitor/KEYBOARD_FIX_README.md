# Keyboard and System Bar Fixes for Android

## مشکلات حل شده:

### 1. Status Bar و Navigation Bar
- اپ دیگر کل صفحه را نمی‌گیرد
- System bars به درستی نمایش داده می‌شوند
- رنگ‌های status bar و navigation bar تنظیم شده‌اند

### 2. Keyboard Handling
- چت اینپوت با باز شدن کیبورد بالا می‌آید
- صفحه از بالای کیبورد در نظر گرفته می‌شود
- فاصله‌ها از بالا و پایین درست شده‌اند

### 3. Viewport Management
- Safe area insets به درستی اعمال می‌شوند
- System bars محترم شمرده می‌شوند
- Layout به درستی با keyboard تطبیق می‌یابد

## تغییرات انجام شده:

### AndroidManifest.xml
- `android:windowSoftInputMode="adjustResize"` برای keyboard handling بهتر

### styles.xml
- تنظیمات `fitsSystemWindows` و `windowDrawsSystemBarBackgrounds`
- تنظیمات `windowTranslucentStatus` و `windowTranslucentNavigation`

### activity_main.xml
- اضافه کردن `android:fitsSystemWindows="true"` به layout

### MainActivity.java
- متد `setupKeyboardHandling()` برای تنظیمات بهتر window
- تنظیمات immersive mode برای system bars

### App.tsx
- حذف transform های اضافی
- اضافه کردن safe area insets
- بهبود viewport handling

### ChatInputModern.tsx
- بهبود positioning برای keyboard
- اضافه کردن safe area support

### safe-area.css
- CSS برای safe area support
- Keyboard handling styles

## نکات مهم:

1. **بعد از تغییرات:**
   - اپ را کاملاً close کنید (از recent apps)
   - دوباره build کنید
   - تست کنید

2. **اگر هنوز مشکل داشتید:**
   - فایل‌های native را بررسی کنید
   - تنظیمات Android Studio را چک کنید
   - Device settings را بررسی کنید

3. **تست:**
   - روی دستگاه‌های مختلف Android تست کنید
   - Keyboard behavior را بررسی کنید
   - System bars را چک کنید

## تنظیمات اضافی:

اگر هنوز مشکل keyboard دارید، یکی از این گزینه‌ها را امتحان کنید:

```xml
android:windowSoftInputMode="adjustPan"
android:windowSoftInputMode="adjustResize"
android:windowSoftInputMode="adjustPan|stateHidden"
```

## Build و Deploy:

```bash
# Clean build
cd kariz-mobile-capacitor
npm run build
npx cap sync android

# Build Android
cd android
./gradlew clean
./gradlew assembleDebug

# یا برای release
./gradlew assembleRelease
```

## Troubleshooting:

1. **Keyboard نمی‌آید بالا:**
   - `adjustResize` را امتحان کنید
   - Layout height را بررسی کنید

2. **System bars نمایش داده نمی‌شوند:**
   - `fitsSystemWindows` را چک کنید
   - Theme settings را بررسی کنید

3. **Layout خراب می‌شود:**
   - Safe area insets را بررسی کنید
   - CSS positioning را چک کنید
