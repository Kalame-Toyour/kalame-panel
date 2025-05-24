'use client';

import type { Components } from 'react-markdown';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

type BlogPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

const BlogDetailSkeleton = () => {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4 h-8 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />

      <div className="mb-8 flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
        <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700" />
      </div>

      {[1, 2, 3].map(i => (
        <React.Fragment key={i}>
          <div className="mb-6 h-64 rounded-xl bg-gray-300 dark:bg-gray-700" />
          <div className="mb-8 space-y-3">
            <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-4 w-11/12 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-4 w-4/5 rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
const BlogDetailPage = ({
  post,
}: {
  post: BlogPost | null;

}) => {
  const router = useRouter();
  const locale = useLocale();

  const t = useTranslations('sidebar');
  const t2 = useTranslations('common');

  const handleBack = () => {
    router.push('/blog');
  };

  // Custom components for markdown rendering
  const MarkdownComponents: Components = {

    img: ({ node, ...props }) => (
      <div className="my-8">
        <img
          {...props}
          className="w-full rounded-xl"
          loading="lazy"
          alt={props.alt || 'Blog image'}
        />
      </div>
    ),
    p: ({ children }) => (
      <p className="mb-6 text-right leading-relaxed text-gray-800 dark:text-gray-200">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="mb-6 text-right text-3xl font-bold dark:text-gray-100">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 text-right text-2xl font-bold dark:text-gray-100">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-4 text-right text-2xl font-bold dark:text-gray-100">
        {children}
      </h3>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-blue-500 transition-colors duration-200 hover:text-blue-600">
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="mb-6 list-inside list-disc text-right">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className={`mb-6 list-inside list-decimal ${locale === 'fa' ? 'text-right' : 'text-left'} `}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="mb-2 text-right">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`my-4 border-r-4 border-gray-300 pr-4 ${locale === 'fa' ? 'text-right' : 'text-left'} `}>
        {children}
      </blockquote>
    ),

  };
  return (
    <div className="flex">
      <div className="flex-1 transition-all duration-300">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="mb-6 flex w-full">
            <button
              onClick={handleBack}
              className="flex items-center text-left text-gray-600 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-400"
            >
              <ChevronRight className={`size-6 ${locale === 'fa' ? 'rotate-0' : 'rotate-180'}`} />
              <span>{t('blog')}</span>
            </button>
          </div>
          {!post
            ? (
                <BlogDetailSkeleton />
              )
            : (
                <article className="rounded-2xl bg-white p-2 shadow-lg dark:bg-gray-800 md:p-6">
                  <h1 className={`mb-4 text-3xl font-bold ${locale === 'fa' ? 'text-right' : 'text-left'} dark:text-gray-100`}>
                    {post.title}
                  </h1>
                  <div className="mb-8 flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span>{post.date}</span>
                  </div>
                  <div>
                    <MarkdownRenderer
                      content={post.content}
                      components={MarkdownComponents}
                    />
                  </div>
                </article>
              )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
