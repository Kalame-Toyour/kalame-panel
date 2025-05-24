'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
};

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const router = useRouter();
  const locale = useLocale();

  const handleClick = () => {
    router.push(`/blog/${post.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-200 hover:shadow-xl dark:bg-gray-800 dark:hover:bg-gray-700"
      onClick={handleClick}
    >
      <div className="relative h-48 md:h-56 ">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="size-full object-cover"
        />
      </div>
      <div className="p-6">
        <h2 className={`mb-2 text-xl font-bold ${locale === 'fa' ? 'text-right' : 'text-left'} text-gray-700 dark:text-gray-200`}>{post.title}</h2>
        <p dir="rtl" className={`mb-4 text-gray-600 dark:text-gray-300 ${locale === 'fa' ? 'text-right' : 'text-left'}`}>{post.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span dir="rtl">{post.date}</span>
          {/* <span>نویسنده: {post.author}</span> */}
        </div>
      </div>
    </motion.div>
  );
};

const BlogSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-300 dark:bg-gray-700" />
            <div className="p-6">
              <div className="mb-4 h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="mb-2 h-4 w-full rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-2/3 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [isCollapsed, setIsCollapsed] = useState(false);
  // const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('sidebar');

  const fetchBlogPosts = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/blog-posts');
      const data = await response.json();
      setPosts(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return (
    <>
      <div className="chat-container fixed inset-0 -z-10" />
      <div className="relative flex min-h-screen ">

        <div className={`flex-1 transition-all
      duration-300`}
        >

          <div className="p-6">
            <h1 className={`mb-2 text-3xl font-bold md:mb-4 ${locale === 'fa' ? 'text-right' : 'text-left'}  dark:text-gray-100`}>{t('blog')}</h1>

            {isLoading
              ? (
                  <BlogSkeleton />
                )
              : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {posts.map(post => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
