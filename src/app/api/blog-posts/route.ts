import { NextResponse } from 'next/server';

export async function GET() {
  // This is mock data - replace with your actual data fetching logic
  const posts = [
    {
      id: 1,
      title: 'چطور هوش مصنوعی بازی‌های ویدئویی رو به سطح بعدی می‌برد؟',
      excerpt: 'بازی‌های ویدئویی این روزا حسابی خفن شدن و با گرافیک‌های خیره‌کننده، داستان‌های پیچیده و دنیاهای مجازی بزرگ، همه رو مجذوب می‌کنن...',
      author: 'نوید رضایی',
      date: '۲۰ آبان ۱۴۰۳',
      imageUrl: 'https://cdn.coingraam.com/images/news/hmsrt-pump-cover.jpg',
    },
    {
      id: 2,
      title: 'چگونه هوش مصنوعی به باغ‌های آینده کمک می‌کند',
      excerpt: 'طراح برنده جایزه نمایشگاه گل، تام مانلی، به این موضوع می‌پردازد که چطور فناوری می‌تونه زندگی باغبان‌ها رو راحت‌تر کنه...',
      author: 'نوید رضایی',
      date: '۲۰ آبان ۱۴۰۳',
      imageUrl: 'https://cdn.coingraam.com/images/news/btc-80k-cover.jpg',
    },
    {
      id: 3,
      title: 'چطور هوش مصنوعی بازی‌های ویدئویی رو به سطح بعدی می‌برد؟',
      excerpt: 'بازی‌های ویدئویی این روزا حسابی خفن شدن و با گرافیک‌های خیره‌کننده، داستان‌های پیچیده و دنیاهای مجازی بزرگ، همه رو مجذوب می‌کنن...',
      author: 'نوید رضایی',
      date: '۲۰ آبان ۱۴۰۳',
      imageUrl: 'https://cdn.coingraam.com/images/news/hmsrt-pump-cover.jpg',
    },
    {
      id: 4,
      title: 'چگونه هوش مصنوعی به باغ‌های آینده کمک می‌کند',
      excerpt: 'طراح برنده جایزه نمایشگاه گل، تام مانلی، به این موضوع می‌پردازد که چطور فناوری می‌تونه زندگی باغبان‌ها رو راحت‌تر کنه...',
      author: 'نوید رضایی',
      date: '۲۰ آبان ۱۴۰۳',
      imageUrl: 'https://cdn.coingraam.com/images/news/btc-80k-cover.jpg',
    },
    {
      id: 5,
      title: 'چطور هوش مصنوعی بازی‌های ویدئویی رو به سطح بعدی می‌برد؟',
      excerpt: 'بازی‌های ویدئویی این روزا حسابی خفن شدن و با گرافیک‌های خیره‌کننده، داستان‌های پیچیده و دنیاهای مجازی بزرگ، همه رو مجذوب می‌کنن...',
      author: 'نوید رضایی',
      date: '۲۰ آبان ۱۴۰۳',
      imageUrl: 'https://cdn.coingraam.com/images/news/hmsrt-pump-cover.jpg',
    },
    {
      id: 6,
      title: 'چگونه هوش مصنوعی به باغ‌های آینده کمک می‌کند',
      excerpt: 'طراح برنده جایزه نمایشگاه گل، تام مانلی، به این موضوع می‌پردازد که چطور فناوری می‌تونه زندگی باغبان‌ها رو راحت‌تر کنه...',
      author: 'نوید رضایی',
      date: '۲۰ آبان ۱۴۰۳',
      imageUrl: 'https://cdn.coingraam.com/images/news/btc-80k-cover.jpg',
    },
  ];

  return NextResponse.json(posts);
}
