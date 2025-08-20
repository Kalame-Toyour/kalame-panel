# Kariz Mobile Capacitor App

این اپلیکیشن موبایل React Native با Capacitor است که برای چت هوشمند طراحی شده است.

## ویژگی‌ها

- 🚀 چت هوشمند با مدل‌های مختلف AI
- 📱 رابط کاربری بهینه شده برای موبایل
- 🔄 دریافت داینامیک مدل‌ها از سرور اصلی
- 💡 پیشنهادات هوشمند برای شروع چت
- 🌙 پشتیبانی از تم تاریک
- 📊 نمایش وضعیت استریمینگ

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js (نسخه 16 یا بالاتر)
- npm یا yarn
- Android Studio (برای توسعه Android)
- Xcode (برای توسعه iOS - فقط macOS)

### نصب وابستگی‌ها

```bash
npm install
```

### راه‌اندازی اپلیکیشن

```bash
npm start
```

### ساخت برای موبایل

#### Android

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

#### iOS

```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## ساختار پروژه

```
src/
├── components/          # کامپوننت‌های React
│   ├── ChatInputModern.tsx
│   ├── ModelDropdown.tsx
│   ├── PromptSuggestions.tsx
│   └── ...
├── contexts/           # Context های React
│   ├── ModelContext.tsx
│   └── LoadingContext.tsx
├── hooks/              # Custom Hooks
│   ├── useAuth.ts
│   └── useChat.ts
├── utils/              # Utility Functions
│   ├── AppConfig.ts    # تنظیمات اپلیکیشن
│   └── api.ts          # API utilities
└── App.tsx            # کامپوننت اصلی
```

## API Integration

این اپلیکیشن از API های اصلی پروژه استفاده می‌کند:

### مدل‌های زبان
- **Endpoint**: `https://api.kalame.chat/kariz/language-models`
- **Method**: GET
- **Response**: لیست مدل‌های موجود با جزئیات کامل

### پیشنهادات چت
- **Endpoint**: `https://api.kalame.chat/kariz/prompt-suggestions`
- **Method**: GET
- **Response**: لیست پیشنهادات برای شروع چت

## تغییرات اخیر

### v0.1.0
- ✅ یکپارچه‌سازی با API سرور اصلی
- ✅ دریافت داینامیک مدل‌ها از سرور
- ✅ نمایش پیشنهادات هوشمند
- ✅ بهبود رابط کاربری موبایل
- ✅ پشتیبانی از تم تاریک
- ✅ حذف Express و استفاده از API های اصلی

## توسعه

### اضافه کردن مدل جدید

مدل‌های جدید باید از طریق API سرور اصلی اضافه شوند.

### اضافه کردن پیشنهاد جدید

پیشنهادات جدید باید از طریق API سرور اصلی اضافه شوند.

## عیب‌یابی

### مشکل در اتصال به API
- مطمئن شوید که سرور اصلی در دسترس است
- آدرس‌های API را در `src/utils/AppConfig.ts` بررسی کنید
- Console مرورگر را برای خطاها بررسی کنید

### مشکل در نمایش مدل‌ها
- اتصال به اینترنت را بررسی کنید
- API سرور اصلی را بررسی کنید
- Console مرورگر را برای خطاها بررسی کنید

## مشارکت

برای مشارکت در توسعه:

1. پروژه را Fork کنید
2. یک شاخه جدید ایجاد کنید
3. تغییرات خود را اعمال کنید
4. Pull Request ارسال کنید

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.
