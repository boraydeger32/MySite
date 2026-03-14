import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import SectionHeader from '@/components/ui/SectionHeader';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Dijital dunya hakkinda en son gelismeler, ipuclari ve sektorel trendleri DevSpark blogumuzdan takip edin. QR Menu, E-Ticaret, Kurumsal Web Tasarim ve daha fazlasi.',
  openGraph: {
    title: 'Blog | DevSpark Yazilim',
    description:
      'Dijital dunya hakkinda en son gelismeler, ipuclari ve sektorel trendleri blogumuzdan takip edin.',
    url: 'https://devspark.com.tr/blog',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  // Extract unique categories
  const categories = Array.from(
    new Set(posts.map((post) => post.frontmatter.category))
  );

  return (
    <div className="bg-bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/10 via-bg-dark to-accent-purple/10" />
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-orange/8 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-purple/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeader
              tag="Blog"
              title="Blog"
              subtitle="Dijital dunya hakkinda en son gelismeler, ipuclari ve sektorel trendleri blogumuzdan takip edin."
              gradientTitle
              align="center"
            />
          </div>
        </div>
      </section>

      {/* Blog List */}
      <section className="relative overflow-hidden pb-20 sm:pb-24 lg:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-blue/3 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/3 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlogListClient
            posts={posts.map((post) => ({
              slug: post.slug,
              title: post.frontmatter.title,
              excerpt: post.frontmatter.excerpt,
              date: post.frontmatter.date,
              category: post.frontmatter.category,
              coverColor: post.frontmatter.coverColor,
              author: post.frontmatter.author,
              readingTime: `${Math.ceil(post.readingTime.minutes)} dk okuma`,
            }))}
            categories={categories}
          />
        </div>
      </section>
    </div>
  );
}
