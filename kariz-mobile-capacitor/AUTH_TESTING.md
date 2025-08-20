# تست Authentication در اپلیکیشن موبایل

## تغییرات انجام شده:

### 1. **رفع مشکلات UI:**
✅ رنگ دکمه‌ها درست شد
✅ دکمه دارک/لایت مود بهبود یافت
✅ خوانایی دکمه‌ها بهتر شد

### 2. **اتصال به API واقعی:**
✅ حذف mock API endpoints
✅ اتصال مستقیم به سرور `https://api.kalame.chat/auth`
✅ بهبود error handling
✅ اضافه شدن console logs برای debugging

### 3. **Authentication Flow واقعی:**

#### **مرحله 1: وارد کردن شماره موبایل**
- شماره موبایل باید 11 رقم باشد
- تبدیل اعداد فارسی به انگلیسی
- ارسال درخواست به `/submit-phone-number`

#### **مرحله 2: تشخیص نوع کاربر**
- **کاربر جدید:** نمایش فرم ثبت نام
- **کاربر موجود:** نمایش گزینه‌های ورود

#### **ورود کاربر موجود:**
- **روش 1:** ورود با رمز عبور
- **روش 2:** ورود با کد یکبار مصرف

#### **ثبت نام کاربر جدید:**
- وارد کردن کد تایید
- وارد کردن نام
- وارد کردن رمز عبور (حداقل 6 کاراکتر)

### 4. **API Endpoints مورد استفاده:**

```
POST /auth/submit-phone-number
POST /auth/login
POST /auth/loginWithCode
POST /auth/register-user
POST /auth/
```

### 5. **Error Handling:**
✅ نمایش پیام‌های خطا به فارسی
✅ Toast notifications برای success/error
✅ Console logs برای debugging
✅ Validation مناسب

### 6. **Features اضافه شده:**
✅ Auto-submit کد تایید پس از وارد کردن 4 رقم
✅ تبدیل اعداد فارسی به انگلیسی
✅ Persistent authentication state
✅ Dark mode support
✅ Responsive design

## نحوه تست:

### **برای تست با شماره‌های واقعی:**
1. شماره موبایل معتبر وارد کنید
2. کد تایید واقعی را وارد کنید
3. اطلاعات ثبت نام را تکمیل کنید

### **برای تست با شماره‌های موجود:**
1. شماره موبایل موجود را وارد کنید
2. رمز عبور یا کد تایید را وارد کنید

### **Debugging:**
- Console logs برای مشاهده API responses
- Toast notifications برای feedback
- Error messages به فارسی

## نکات مهم:
- اپلیکیشن حالا به سرور واقعی متصل است
- تمام درخواست‌ها به `https://api.kalame.chat/auth` ارسال می‌شوند
- Error handling بهبود یافته است
- UI/UX بهتر شده است 