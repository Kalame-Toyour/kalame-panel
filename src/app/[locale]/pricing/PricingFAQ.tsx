import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

export const PricingFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: 'What\'s included in the Basic plan?',
      answer: 'The Basic plan includes our core AI chat assistant for market analysis, basic portfolio tracking capabilities, fundamental market insights, and standard email support. Perfect for beginners exploring crypto trading.',
    },
    {
      question: 'How does the Plus plan enhance my trading?',
      answer: 'The Plus plan unlocks advanced features like real-time market alerts, custom trading strategies, detailed portfolio analytics, unlimited AI interactions, and priority support. You\'ll get deeper market insights and personalized trading recommendations.',
    },
    {
      question: 'Can I switch between monthly and yearly plans?',
      answer: 'Yes! You can switch between plans at any time. When upgrading to yearly, you\'ll instantly save 20% compared to monthly payments. Your benefits will be adjusted immediately, and any remaining balance will be prorated.',
    },
    {
      question: 'Are there any hidden fees or charges?',
      answer: 'No hidden fees! The price you see is what you pay. All features listed in your chosen plan are included without any additional charges. Plus plan members also get early access to new features at no extra cost.',
    },
    {
      question: 'What happens if I exceed usage limits?',
      answer: 'Basic plan users have reasonable monthly limits for AI interactions. Instead of charging overage fees, we\'ll notify you when you\'re approaching limits and suggest upgrading to Plus for unlimited usage.',
    },
    {
      question: 'How does priority support work?',
      answer: 'Plus members get faster response times (typically within 2 hours), dedicated technical support for complex trading queries, and access to advanced troubleshooting. Basic users receive standard support within 24 hours.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 14-day money-back guarantee for Plus subscriptions. If you\'re not satisfied with our service, contact support within 14 days of purchase for a full refund.',
    },
    {
      question: 'Can I use the service on multiple devices?',
      answer: 'Yes! Both Basic and Plus plans support unlimited devices. Your account syncs seamlessly across web, mobile, and desktop applications, ensuring consistent trading insights everywhere.',
    },
  ];

  return (
    <section className="relative overflow-hidden py-14">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="mb-4 text-center text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="mb-12 text-center text-gray-600 dark:text-gray-300">
          Everything you need to know about our pricing and features
        </p>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="animate-fade-in rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-xl font-medium text-gray-900 dark:text-white">
                  {item.question}
                </span>
                {openIndex === index
                  ? (
                      <Minus className="size-5 text-blue-600 dark:text-blue-400" />
                    )
                  : (
                      <Plus className="size-5 text-blue-600 dark:text-blue-400" />
                    )}
              </button>
              <div
                className={`overflow-hidden px-6 transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-4' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
