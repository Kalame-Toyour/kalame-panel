# راهنمای اصلاح Portrait Mode در Android

## مشکل
استفاده از `android:screenOrientation="portrait"` در AndroidManifest.xml deprecated شده است.

## راه‌حل
برای تنظیم portrait mode، باید از `Activity.setRequestedOrientation()` در MainActivity استفاده کنیم.

## تغییرات لازم

### 1. MainActivity.java یا MainActivity.kt

#### برای Java:
```java
package com.kalame.ai;

import android.content.pm.ActivityInfo;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Set portrait orientation
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }
}
```

#### برای Kotlin:
```kotlin
package com.kalame.ai

import android.content.pm.ActivityInfo
import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Set portrait orientation
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }
}
```

### 2. AndroidManifest.xml (اختیاری)

اگر هنوز `android:screenOrientation="portrait"` در AndroidManifest.xml دارید، می‌توانید آن را حذف کنید (کد Java/Kotlin کار می‌کند) یا نگه دارید. اما استفاده از `setRequestedOrientation` در MainActivity بهتر است چون:
- کنترل بیشتری دارید
- می‌توانید در runtime تغییر دهید
- deprecated نیست

```xml
<!-- اگر می‌خواهید حذف کنید: -->
<activity
    android:name=".MainActivity"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    <!-- android:screenOrientation="portrait" --> <!-- این خط را حذف کنید -->
    ...>
```

یا نگه دارید برای fallback:
```xml
<activity
    android:name=".MainActivity"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:screenOrientation="portrait"
    ...>
```

### 3. تست

بعد از اعمال تغییرات:
1. اپ را کاملاً close کنید
2. Rebuild کنید
3. تست کنید که فقط portrait mode کار می‌کند

## مزایا

✅ استفاده از API های modern
✅ کنترل بهتر در runtime
✅ جلوگیری از deprecated warnings
✅ سازگاری با Android جدیدتر

