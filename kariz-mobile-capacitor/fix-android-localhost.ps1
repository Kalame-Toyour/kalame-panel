# اسکریپت رفع مشکل Localhost در اندروید
Write-Host "=== رفع مشکل Localhost در اندروید ===" -ForegroundColor Green

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

Write-Host "`n🎯 مراحل بعدی:" -ForegroundColor Yellow
Write-Host "1. در Android Studio: Build > Clean Project" -ForegroundColor White
Write-Host "2. در Android Studio: Build > Rebuild Project" -ForegroundColor White
Write-Host "3. اپ React را روی localhost:3000 اجرا کنید" -ForegroundColor White
Write-Host "4. اپ اندروید را run کنید" -ForegroundColor White

Write-Host "`n📚 برای اطلاعات بیشتر، فایل ANDROID_LOCALHOST_FIX.md را مطالعه کنید." -ForegroundColor Cyan
Write-Host "=== پایان اسکریپت ===" -ForegroundColor Green
