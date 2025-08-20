# Debug Guide - API Connection Issues

## مشکل CORS و 504

اگر با خطاهای CORS یا 504 مواجه شدید، این راهنما را دنبال کنید:

## 1. بررسی لاگ‌ها

ابتدا Console مرورگر را باز کنید (F12) و لاگ‌های زیر را بررسی کنید:

### لاگ‌های مورد انتظار:
```
🧪 Testing API Connection...
🔗 Base URL: https://api.kalame.chat/kariz
🌐 API Request: GET https://api.kalame.chat/kariz/language-models
📡 Response Status: 200 OK
✅ API Success: {models: [...]}
```

### لاگ‌های خطا:
```
❌ API Error: 504 - Gateway Timeout
💥 API Request Failed: TypeError: Failed to fetch
```

## 2. بررسی‌های اولیه

### ✅ سرور اصلی در دسترس است؟
```bash
# بررسی کنید که سرور اصلی پاسخ می‌دهد
curl https://api.kalame.chat/kariz/language-models
```

### ✅ API endpoints کار می‌کنند؟
- `https://api.kalame.chat/kariz/language-models`
- `https://api.kalame.chat/kariz/prompt-suggestions`

## 3. راه‌حل‌های احتمالی

### مشکل 1: CORS Error
**راه‌حل:** 
- سرور اصلی باید CORS headers را درست تنظیم کند
- مطمئن شوید که سرور `Access-Control-Allow-Origin` را درست تنظیم کرده

### مشکل 2: 504 Gateway Timeout
**راه‌حل:**
- سرور اصلی را بررسی کنید
- بررسی کنید که API endpoints در سرور اصلی درست کار می‌کنند

### مشکل 3: Network Error
**راه‌حل:**
- اینترنت را بررسی کنید
- Firewall را بررسی کنید
- VPN را خاموش کنید

### مشکل 4: SSL/TLS Error
**راه‌حل:**
- مطمئن شوید که HTTPS درست کار می‌کند
- بررسی کنید که certificate معتبر است

## 4. تست دستی API

### تست با curl:
```bash
curl -X GET https://api.kalame.chat/kariz/language-models
curl -X GET https://api.kalame.chat/kariz/prompt-suggestions
```

### تست با Postman:
- URL: `https://api.kalame.chat/kariz/language-models`
- Method: GET
- Headers: `Accept: application/json`

## 5. تنظیمات AppConfig

### Production API:
```typescript
baseApiUrl: 'https://api.kalame.chat/kariz'
```

## 6. لاگ‌های مفید

### در Console مرورگر:
```javascript
// تست دستی API
fetch('https://api.kalame.chat/kariz/language-models')
  .then(res => res.json())
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Error:', err));
```

### در Network Tab:
- Status Code: 200 OK
- Response Headers: `content-type: application/json`
- Response Body: JSON data

## 7. عیب‌یابی پیشرفته

### بررسی Network Tab:
1. F12 → Network Tab
2. Reload صفحه
3. بررسی درخواست‌های API
4. بررسی Response Headers

### بررسی Console:
1. F12 → Console Tab
2. بررسی خطاهای JavaScript
3. بررسی لاگ‌های API

### بررسی Application Tab:
1. F12 → Application Tab
2. Storage → Local Storage
3. بررسی cache و cookies

## 8. تماس با پشتیبانی

اگر مشکل حل نشد:
1. Screenshot از Console
2. Screenshot از Network Tab
3. لاگ‌های کامل
4. توضیح مراحل انجام شده 