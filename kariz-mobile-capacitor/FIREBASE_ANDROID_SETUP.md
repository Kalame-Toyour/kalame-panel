# راهنمای راه‌اندازی Firebase در Android

## مشکل شناسایی شده

```
cannot find symbol
import com.google.firebase.messaging.FirebaseMessagingService;
```

## علت مشکل

Dependency های Firebase در `build.gradle` فایل‌ها اضافه نشده‌اند.

## راه‌حل پیاده‌سازی شده

### 1. **App-level build.gradle**
فایل `android/app/build.gradle` آپدیت شده:

```gradle
dependencies {
    // Firebase dependencies
    implementation platform('com.google.firebase:firebase-bom:32.7.2')
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'
}
```

### 2. **Plugin-level build.gradle**
فایل `android/capacitor-cordova-android-plugins/build.gradle` آپدیت شده:

```gradle
dependencies {
    // Firebase dependencies
    implementation platform('com.google.firebase:firebase-bom:32.7.2')
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'
}
```

### 3. **gradle.properties**
فایل `android/gradle.properties` آپدیت شده:

```properties
# Firebase configuration
android.enableJetifier=true
```

## مراحل تست

### 1. **Clean Build**
```bash
cd android
./gradlew clean
./gradlew build
```

### 2. **Sync Project**
در Android Studio:
- File → Sync Project with Gradle Files
- Build → Clean Project
- Build → Rebuild Project

### 3. **Check Dependencies**
```bash
cd android
./gradlew app:dependencies
```

## نکات مهم

### 1. **Version Compatibility**
- Firebase BOM version: 32.7.2
- Android Gradle Plugin: 8.7.2
- Compile SDK: 35
- Target SDK: 35

### 2. **Plugin Order**
مطمئن شوید که `google-services` plugin در `build.gradle` اضافه شده:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. **File Structure**
```
android/
├── app/
│   ├── build.gradle (Firebase dependencies)
│   └── google-services.json
├── build.gradle (google-services plugin)
├── capacitor-cordova-android-plugins/
│   └── build.gradle (Firebase dependencies)
└── gradle.properties (Jetifier enabled)
```

## عیب‌یابی بیشتر

### 1. **اگر مشکل ادامه دارد**
- Gradle cache را پاک کنید: `./gradlew cleanBuildCache`
- Android Studio cache را پاک کنید: File → Invalidate Caches
- پروژه را restart کنید

### 2. **Version Conflicts**
- از Firebase BOM استفاده کنید تا version conflicts برطرف شود
- مطمئن شوید که تمام Firebase dependencies از یک BOM استفاده می‌کنند

### 3. **Plugin Compatibility**
- مطمئن شوید که `@capacitor-firebase/messaging` نصب شده
- `capacitor update` را اجرا کنید

## تست نهایی

پس از اعمال تغییرات:

1. **Clean و Rebuild** پروژه
2. **Sync** Gradle files
3. **Compile** پروژه
4. **Run** روی دستگاه یا emulator

## نتیجه

با اعمال این تغییرات:
- Firebase dependencies درست اضافه می‌شوند
- `MyFirebaseMessagingService` compile می‌شود
- Push notifications کار می‌کنند
- WebView crashes برطرف می‌شوند
