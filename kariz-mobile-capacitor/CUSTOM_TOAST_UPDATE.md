# Custom Toast Update - Android App

## Overview
The Android app has been updated to use custom toast messages with the Vazir font instead of the default system toast, providing better visual consistency and Persian text support.

## Changes Made

### 1. Custom Toast Layout
- **File**: `android/app/src/main/res/layout/custom_toast.xml`
- **Purpose**: Custom layout for toast messages with Vazir font
- **Features**: 
  - Rounded corners with custom background
  - Vazir font for Persian text
  - Custom styling and positioning

### 2. Toast Background
- **File**: `android/app/src/main/res/drawable/toast_background.xml`
- **Purpose**: Custom background for toast messages
- **Features**:
  - Dark theme with rounded corners
  - Subtle border for better visibility
  - Professional appearance

### 3. Font Resources
- **Files**: 
  - `android/app/src/main/res/font/vazir.xml`
  - `android/app/src/main/res/font/vazir_regular.ttf`
  - `android/app/src/main/res/font/vazir_bold.ttf`
- **Purpose**: Vazir font family for Persian text support
- **Source**: Copied from `public/fonts/` directory

### 4. MainActivity Updates
- **File**: `android/app/src/main/java/com/kalame/ai/MainActivity.java`
- **Changes**:
  - Added `showCustomToast()` helper method
  - Updated both toast instances to use custom toast
  - Improved code maintainability
  - Better Persian text rendering

## Benefits

1. **Persian Text Support**: Vazir font provides excellent Persian text rendering
2. **Visual Consistency**: Custom design matches app theme
3. **Better UX**: Improved readability and professional appearance
4. **Code Quality**: Reduced duplication with helper method
5. **Maintainability**: Centralized toast styling

## Technical Details

### Toast Implementation
```java
private void showCustomToast(String message) {
    android.view.LayoutInflater inflater = getLayoutInflater();
    android.view.View layout = inflater.inflate(R.layout.custom_toast, null);
    
    android.widget.TextView text = layout.findViewById(R.id.toast_text);
    text.setText(message);
    
    android.widget.Toast toast = new android.widget.Toast(this);
    toast.setGravity(android.view.Gravity.BOTTOM | android.view.Gravity.CENTER_HORIZONTAL, 0, 100);
    toast.setDuration(android.widget.Toast.LENGTH_SHORT);
    toast.setView(layout);
    toast.show();
}
```

### Layout Structure
- **LinearLayout**: Main container with custom background
- **TextView**: Text display with Vazir font
- **Custom styling**: Colors, padding, and text properties

### Font Configuration
- **Regular weight**: For normal text
- **Bold weight**: For emphasis when needed
- **TTF format**: Native Android support

## Usage

The custom toast is automatically used for:
1. **First back press**: "برای خروج از برنامه دوباره روی دکمه بازگشت بزنید"
2. **Fallback back press**: Same message when WebView is unavailable

## Testing

To test the custom toast:
1. Build and install the app
2. Navigate to any page
3. Press back button once
4. Verify the custom toast appears with Vazir font
5. Press back button again to exit

## Notes

- Vazir font provides excellent Persian text support
- Toast positioning is optimized for bottom center
- Custom background ensures visibility on all screen types
- Font files are properly included in the APK

## Files Modified

- `android/app/src/main/java/com/kalame/ai/MainActivity.java`
- `android/app/src/main/res/layout/custom_toast.xml` (new)
- `android/app/src/main/res/drawable/toast_background.xml` (new)
- `android/app/src/main/res/font/vazir.xml` (new)
- `android/app/src/main/res/font/vazir_regular.ttf` (new)
- `android/app/src/main/res/font/vazir_bold.ttf` (new)
