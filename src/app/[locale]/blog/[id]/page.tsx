import BlogDetailPage from '@/app/[locale]/components/BlogDetailPage';
import React from 'react';

type BlogPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

const fetchBlogPost = async (id: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(`http://localhost:3000/api/blog-posts/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

const BlogDetailServerPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const post = await fetchBlogPost(id);

  return (
    <BlogDetailPage post={post} />
  );
};

export default BlogDetailServerPage;
