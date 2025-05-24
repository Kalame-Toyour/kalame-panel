import { useTranslations } from 'next-intl';
import React from 'react';

export const StatsSection = () => {
  const t = useTranslations();

  const exploreItems = [
    {
      title: 'Explore the ecosystem',
      description: 'Explore our ecosystem of AI-powered tools and features',
      icon: (
        <div className="relative size-24">
          <div className="absolute inset-0 -rotate-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-300" />
          <div className="absolute inset-0 rotate-12 rounded-xl bg-gradient-to-r from-orange-300 to-yellow-200 mix-blend-multiply" />
        </div>
      ),
    },
    {
      title: 'Create Art',
      description: 'Transform your ideas into stunning visual masterpieces',
      icon: (
        <div className="relative size-24">
          <div className="animate-spin-slow size-full rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
        </div>
      ),
    },
    {
      title: 'Join Community',
      description: 'Connect with creators and share your artistic journey',
      icon: (
        <div className="relative size-24">
          <div className="absolute inset-0 skew-y-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-200" />
        </div>
      ),
    },
  ];

  return (
    <section className="relative p-6">
      <div className="text-center">
        <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-5xl font-bold text-transparent dark:from-blue-400 dark:to-cyan-400 md:text-6xl">
          {t('features.title')}
        </h2>

        <section className="relative">
          <div className="animate-fade-in absolute inset-0 translate-y-4 transform-gpu bg-white/80 opacity-0 backdrop-blur-lg transition-all duration-1000 ease-out" />
          <div className="relative mx-auto max-w-7xl px-8 py-20">
            <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {exploreItems.map((item, index) => (
                <div
                  key={index}
                  className="group cursor-pointer rounded-3xl bg-white/5 object-cover p-8 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:bg-white/10"
                >
                  <div className="mb-6">{item.icon}</div>
                  <h3 className="mb-4 text-2xl font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <div className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-blue-500">Learn more →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </section>
  );
};
