# Build Fixes for Android

## مشکلات حل شده:

### 1. ViewBinding Error
- خطای `Could not find androidx.databinding:viewbinding:8.12.0` حل شد
- تنظیمات `viewBinding` از `build.gradle` حذف شد

### 2. Dependency Conflicts
- تنظیمات مشکل‌ساز از `styles.xml` حذف شد
- تنظیمات `MainActivity.java` بهبود یافت

## تغییرات انجام شده:

### build.gradle
- حذف `buildFeatures { viewBinding true }`
- حفظ `compileOptions` برای compatibility

### styles.xml
- حذف `windowTranslucentStatus` و `windowTranslucentNavigation`
- حفظ تنظیمات ضروری

### MainActivity.java
- اضافه کردن try-catch برای keyboard handling
- بررسی version compatibility

### gradle.properties
- اضافه کردن تنظیمات optimization
- بهبود memory management

## مراحل Build:

### 1. Clean Build
```bash
cd kariz-mobile-capacitor
npm run build
npx cap sync android
```

### 2. Clean Gradle
```bash
cd android
./gradlew clean
./gradlew cleanBuildCache
```

### 3. Build Android
```bash
./gradlew assembleDebug
# یا
./gradlew assembleRelease
```

## اگر هنوز خطا داشتید:

### 1. Invalidate Caches
- Android Studio → File → Invalidate Caches and Restart

### 2. Sync Project
- Android Studio → File → Sync Project with Gradle Files

### 3. Clean Project
- Android Studio → Build → Clean Project
- Android Studio → Build → Rebuild Project

### 4. Check Dependencies
```bash
./gradlew app:dependencies
```

## Troubleshooting:

### خطای ViewBinding:
- `buildFeatures { viewBinding true }` را حذف کنید
- `androidx.databinding:viewbinding` dependency را چک کنید

### خطای System Bars:
- `windowTranslucentStatus` و `windowTranslucentNavigation` را حذف کنید
- `fitsSystemWindows` را حفظ کنید

### خطای Keyboard:
- `adjustResize` را در AndroidManifest.xml حفظ کنید
- Layout height را بررسی کنید

## نکات مهم:

1. **بعد از تغییرات:**
   - Clean build کنید
   - Gradle cache را پاک کنید
   - دوباره build کنید

2. **اگر هنوز مشکل داشتید:**
   - Android Studio را restart کنید
   - Gradle wrapper را update کنید
   - Dependencies را بررسی کنید

3. **Version Compatibility:**
   - `compileSdkVersion` و `targetSdkVersion` را چک کنید
   - AndroidX versions را بررسی کنید
