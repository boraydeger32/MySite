'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPostSerialized {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  coverColor: string;
  author: string;
  readingTime: string;
}

interface BlogListClientProps {
  posts: BlogPostSerialized[];
  categories: string[];
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

export default function BlogListClient({
  posts,
  categories,
}: BlogListClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Tumu');

  const filteredPosts =
    activeCategory === 'Tumu'
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <>
      {/* Category Filter Buttons */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveCategory('Tumu')}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
            activeCategory === 'Tumu'
              ? 'bg-accent-orange text-white shadow-[0_0_20px_rgba(255,107,43,0.3)]'
              : 'border border-white/10 bg-white/5 text-text-muted backdrop-blur-sm hover:border-accent-orange/30 hover:text-text-main'
          )}
        >
          Tumu
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
              activeCategory === category
                ? 'bg-accent-orange text-white shadow-[0_0_20px_rgba(255,107,43,0.3)]'
                : 'border border-white/10 bg-white/5 text-text-muted backdrop-blur-sm hover:border-accent-orange/30 hover:text-text-main'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {filteredPosts.map((post) => (
            <motion.article
              key={post.slug}
              variants={itemVariants}
              layout
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]"
              >
                {/* Cover gradient */}
                <div
                  className="relative h-48 w-full overflow-hidden sm:h-52"
                  style={{
                    background: `linear-gradient(135deg, ${post.coverColor}30 0%, ${post.coverColor} 100%)`,
                  }}
                >
                  {/* Decorative pattern overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_70%)]" />

                  {/* Category tag */}
                  <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col p-5 sm:p-6">
                  <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-text-main transition-colors duration-300 group-hover:text-accent-orange sm:text-xl">
                    {post.title}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {post.excerpt}
                  </p>

                  {/* Meta info */}
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-text-muted sm:gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readingTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {post.author}
                    </span>
                  </div>

                  {/* Read more */}
                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-accent-orange transition-all duration-300 group-hover:gap-2">
                    Devamini Oku
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-text-muted">
            Bu kategoride henuz yazi bulunmuyor.
          </p>
        </div>
      )}
    </>
  );
}
