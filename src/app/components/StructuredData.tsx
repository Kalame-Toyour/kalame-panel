export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "هوش مصنوعی کلمه",
    "alternateName": "کلمه",
    "description": "با هوش مصنوعی کلمه به صورت رایگان با قوی‌ترین مدل (ChatGPT) به فارسی چت کنید، عکس تولید کنید و از یک دستیار هوشمند فارسی‌زبان بهره ببرید و هر روز اعتبار رایگان دریافت کنید!",
    "url": "https://kalame.chat",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IRR",
      "description": "استفاده رایگان از هوش مصنوعی"
    },
    "creator": {
      "@type": "Organization",
      "name": "تیم کلمه",
      "url": "https://kalame.chat"
    },
    "inLanguage": "fa-IR",
    "isAccessibleForFree": true,
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "keywords": "هوش مصنوعی, ChatGPT, چت جی پی تی, دستیار هوش مصنوعی, هوش مصنوعی فارسی, تولید عکس, چت رایگان, AI فارسی",
    "featureList": [
      "چت با هوش مصنوعی",
      "تولید تصویر",
      "تبدیل متن به گفتار",
      "تبدیل گفتار به متن",
      "پشتیبانی از زبان فارسی"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
