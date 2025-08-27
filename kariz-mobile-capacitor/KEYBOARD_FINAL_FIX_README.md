# Keyboard and System Bar Final Fixes

## مشکلات حل شده:

### 1. ChatInput روی Navigation Bar
- `position: fixed` از ChatInputModern حذف شد
- ChatInput حالا در container اصلی قرار دارد
- Navigation bar دیگر پوشیده نمی‌شود

### 2. Keyboard Handling
- `android:windowSoftInputMode="adjustPan"` برای Android
- Transform در App.tsx برای keyboard height
- Safe area fallback values اضافه شد

### 3. System Bars
- `fitsSystemWindows="true"` حفظ شد
- `windowDrawsSystemBarBackgrounds="true"` اضافه شد
- Safe area insets با fallback values

## تغییرات کلیدی:

### AndroidManifest.xml
```xml
android:windowSoftInputMode="adjustPan"
```

### styles.xml
```xml
<item name="android:windowDrawsSystemBarBackgrounds">true</item>
<item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
```

### App.tsx
```tsx
// Keyboard handling
transform: isKeyboardVisible ? `translateY(-${keyboardHeight}px)` : 'translateY(0)',
transition: 'transform 0.3s ease-in-out'
```

### ChatInputModern.tsx
```tsx
// Changed from fixed to relative positioning
position: 'relative'
```

### safe-area.css
```css
/* Fallback values for Android */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 24px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 48px);
}
```

## نحوه کارکرد:

1. **Keyboard باز می‌شود**: App.tsx کل container را بالا می‌برد
2. **ChatInput**: در container اصلی قرار دارد و بالا می‌آید
3. **System Bars**: محترم شمرده می‌شوند
4. **Safe Area**: با fallback values کار می‌کند

## تست:

1. **Navigation Bar**: باید دیده شود و ChatInput روی آن نرود
2. **Keyboard**: باید ChatInput را بالا ببرد
3. **System Bars**: باید درست نمایش داده شوند
4. **Layout**: نباید خراب شود

## اگر هنوز مشکل داشتید:

### 1. AndroidManifest.xml
```xml
android:windowSoftInputMode="adjustResize"
```

### 2. styles.xml
```xml
<item name="android:windowTranslucentNavigation">true</item>
```

### 3. MainActivity.java
```java
// Remove immersive mode
getWindow().getDecorView().setSystemUiVisibility(
    android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
);
```

## Build و Deploy:

```bash
cd kariz-mobile-capacitor
npm run build
npx cap sync android

cd android
./gradlew clean
./gradlew assembleDebug
```

## نکات مهم:

1. **adjustPan vs adjustResize**: adjustPan برای keyboard height، adjustResize برای layout
2. **Safe Area**: در Android با fallback values کار می‌کند
3. **Positioning**: ChatInput باید relative باشد نه fixed
4. **Transform**: در App.tsx برای keyboard height استفاده می‌شود
