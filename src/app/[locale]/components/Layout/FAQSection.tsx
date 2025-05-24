import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations();

  const faqItems = [
    {
      question: t('faq.items.what.question'),
      answer: t('faq.items.what.answer'),
    },
    // Add more FAQ items from translations
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden py-14">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="mb-4 text-center text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          {t('faq.title')}
        </h2>
        <p className="mb-12 text-center text-gray-600 dark:text-gray-300">
          {t('faq.subtitle')}
        </p>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="faq-item translate-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50"
              style={{
                transitionDelay: `${index * 100}ms`,
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
                      <Minus className="size-5 text-amber-600 dark:text-amber-400" />
                    )
                  : (
                      <Plus className="size-5 text-amber-600 dark:text-amber-400" />
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
