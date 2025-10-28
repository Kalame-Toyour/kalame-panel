import { getServerDynamicContent } from '@/utils/serverDynamicContent'

export default async function StructuredData() {
  const content = await getServerDynamicContent()
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": content.siteName,
    "alternateName": content.brandName,
    "description": content.description,
    "url": `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}`,
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
      "name": `تیم ${content.brandName}`,
      "url": `https://${content.brandName === 'کلمه' ? 'kalame.chat' : 'okian.ai'}`
    },
    "inLanguage": "fa-IR",
    "isAccessibleForFree": true,
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "keywords": content.brandName === 'کلمه' 
      ? "هوش مصنوعی, ChatGPT, چت جی پی تی, دستیار هوش مصنوعی, هوش مصنوعی فارسی, تولید عکس, چت رایگان, AI فارسی"
      : "هوش مصنوعی, اوکیان, ChatGPT, دستیار هوش مصنوعی, هوش مصنوعی فارسی, تولید تصویر, چت هوش مصنوعی, AI فارسی, پلتفرم هوش مصنوعی",
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
