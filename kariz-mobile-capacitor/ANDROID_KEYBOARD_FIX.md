# راهنمای اصلاح Keyboard Handling در Android

## مشکل
وقتی کیبرد باز می‌شود، ChatInputModern زیر کیبرد می‌رود و کاربر نمی‌بیند چی می‌نویسد.

## راه‌حل
استفاده از `adjustResize` برای Android که viewport را resize می‌کند و ChatInputModern بالای کیبرد می‌آید.

## تغییرات لازم

### 1. AndroidManifest.xml

در فایل `android/app/src/main/AndroidManifest.xml`، activity را پیدا کنید و `android:windowSoftInputMode` را تنظیم کنید:

```xml
<activity
    android:name=".MainActivity"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:windowSoftInputMode="adjustResize"
    ...>
```

### 2. styles.xml (اختیاری اما توصیه می‌شود)

در فایل `android/app/src/main/res/values/styles.xml` یا `android/app/src/main/res/values-v21/styles.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <!-- Other styles -->
        
        <!-- System bars -->
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        
        <!-- Status bar -->
        <item name="android:statusBarColor">@android:color/transparent</item>
        
        <!-- Navigation bar -->
        <item name="android:navigationBarColor">@android:color/transparent</item>
    </style>
</resources>
```

### 3. activity_main.xml (اگر وجود دارد)

در فایل `android/app/src/main/res/layout/activity_main.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true"
    android:orientation="vertical">
    
    <!-- Content will be added by Capacitor -->
</LinearLayout>
```

### 4. کد React (انجام شده)

در `App.tsx` و `ChatInputModern.tsx` تغییرات لازم انجام شده:
- استفاده از `useKeyboard` hook برای تشخیص کیبرد
- Transform کردن ChatInputModern با `translateY` وقتی کیبرد باز است
- استفاده از safe area insets

## نحوه کارکرد

1. **Keyboard باز می‌شود**: 
   - Android با `adjustResize` viewport را resize می‌کند
   - `useKeyboard` hook تغییرات viewport را تشخیص می‌دهد
   - `App.tsx` ChatInputModern را با `translateY` بالا می‌برد

2. **Keyboard بسته می‌شود**:
   - `useKeyboard` تشخیص می‌دهد
   - ChatInputModern به موقعیت اصلی برمی‌گردد

## تست

1. اپ را باز کنید
2. روی ChatInputModern کلیک کنید
3. کیبرد باید باز شود و ChatInputModern باید بالای کیبرد بماند
4. کاربر باید ببیند چی می‌نویسد

## مشکلات احتمالی

### اگر ChatInputModern هنوز زیر کیبرد می‌رود:
1. مطمئن شوید `android:windowSoftInputMode="adjustResize"` در AndroidManifest.xml است
2. مطمئن شوید `fitsSystemWindows="true"` در layout است
3. اپ را کاملاً close و دوباره build کنید

### اگر layout خراب می‌شود:
1. چک کنید که `transform` در App.tsx درست اعمال شده
2. چک کنید که safe area insets درست محاسبه می‌شوند

