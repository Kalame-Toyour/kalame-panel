import { NextResponse } from 'next/server';

export async function GET() {
  // In a real application, you might fetch this data from a database
  const insightCards = [
    {
      id: '1',
      title: 'Today Price',
      price: '59,900 تومان',
      description: 'بهترین قیمت خرید و فروش رو پیدا کن',
      gradient: 'from-green-500 to-blue-400',
      image: 'https://cdn.coingraam.com/images/dollar3.png',
      type: 'message',
    },
    {
      id: '2',
      title: 'خرید و فروش ارزدیجیتال',
      description: 'با یک دستور هر ارزی که میخوای رو بخر',
      gradient: 'from-green-300 to-purple-400',
      image: 'https://cdn.coingraam.com/images/candlestick-2.png',
      type: 'message',
    },
    {
      id: '3',
      title: 'تحلیل امروز بیت کوین',
      description: 'بیت کوین در راه رسیدن به 70 هزار دلار',
      gradient: 'from-purple-400 to-red-500',
      image: 'https://cdn.coingraam.com/images/bitcoin3d.png',
      type: 'message',
    },
    {
      id: '4',
      title: 'مهم ترین خبر امروز',
      description: 'همستر کامبت روز 5 مهر لیست می شود',
      gradient: 'from-yellow-200 to-orange-400',
      image: 'https://cdn.coingraam.com/images/bitcoin3d.png',
      type: 'message',
    },
  ];

  return NextResponse.json(insightCards);
}
