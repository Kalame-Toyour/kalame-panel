# اسکریپت Build و Sync برای اندروید
Write-Host "=== Build و Sync پروژه اندروید ===" -ForegroundColor Green

# بررسی وجود package.json
if (-not (Test-Path "package.json")) {
    Write-Host "❌ فایل package.json یافت نشد!" -ForegroundColor Red
    Write-Host "لطفاً این اسکریپت را از پوشه اصلی پروژه اجرا کنید." -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 در حال build کردن پروژه React..." -ForegroundColor Cyan
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build موفقیت‌آمیز بود!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build ناموفق بود!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ خطا در build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 در حال sync کردن با Capacitor..." -ForegroundColor Cyan
try {
    npx cap sync android
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Sync موفقیت‌آمیز بود!" -ForegroundColor Green
    } else {
        Write-Host "❌ Sync ناموفق بود!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ خطا در sync: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "📱 در حال باز کردن Android Studio..." -ForegroundColor Cyan
try {
    npx cap open android
    Write-Host "✅ Android Studio باز شد!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ خطا در باز کردن Android Studio: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "لطفاً Android Studio را به صورت دستی باز کنید." -ForegroundColor Yellow
}

Write-Host "`n🎯 مراحل بعدی در Android Studio:" -ForegroundColor Yellow
Write-Host "1. Build > Clean Project" -ForegroundColor White
Write-Host "2. Build > Rebuild Project" -ForegroundColor White
Write-Host "3. Run اپ" -ForegroundColor White

Write-Host "`n📚 تغییرات اعمال شده:" -ForegroundColor Cyan
Write-Host "✅ حذف کدهای localhost loading اضافی" -ForegroundColor Green
Write-Host "✅ غیرفعال کردن WebViewCrashPreventionService" -ForegroundColor Green
Write-Host "✅ پیاده‌سازی back button navigation کامل" -ForegroundColor Green
Write-Host "✅ اضافه کردن double-tap برای خروج" -ForegroundColor Green

Write-Host "`n⚠️ نکات مهم:" -ForegroundColor Yellow
Write-Host "- اپ React باید build شده باشد" -ForegroundColor White
Write-Host "- از localhost:3000 استفاده نکنید" -ForegroundColor White
Write-Host "- اپ از فایل‌های build شده استفاده می‌کند" -ForegroundColor White

Write-Host "`n📖 برای اطلاعات بیشتر، فایل ANDROID_FIX_COMPLETE.md را مطالعه کنید." -ForegroundColor Cyan
Write-Host "=== پایان اسکریپت ===" -ForegroundColor Green
