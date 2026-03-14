'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

interface BlogPreview {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  coverColor: string;
  author: string;
  readingTime: string;
}

const blogPosts: BlogPreview[] = [
  {
    slug: 'kurumsal-web-tasarim',
    title: 'Kurumsal Web Sitesi Yaptirirken Dikkat Edilmesi Gerekenler',
    excerpt:
      'Profesyonel bir kurumsal web sitesi yaptirmadan once bilmeniz gereken kritik noktalar, dikkat edilmesi gereken hatalar ve basarili bir web projesi icin rehber.',
    date: '2025-03-01',
    category: 'Kurumsal',
    coverColor: '#00D4FF',
    author: 'Metin Bektemur',
    readingTime: '7 dk',
  },
  {
    slug: 'e-ticaret-trendleri',
    title: '2025 E-Ticaret Trendleri: Turkiye Pazari',
    excerpt:
      'Turkiye e-ticaret pazarinda 2025 yilinda one cikan trendler, teknolojiler ve basarili olmak icin bilmeniz gerekenler.',
    date: '2025-02-10',
    category: 'E-Ticaret',
    coverColor: '#7C3AED',
    author: 'Huseyin Kaplan',
    readingTime: '6 dk',
  },
  {
    slug: 'qr-menu-nedir',
    title: 'QR Menu Nedir? Restoraninizi Nasil Dijitallestirir?',
    excerpt:
      'QR menu sistemleri ile restoraninizi dijital caga tasiyin. Maliyet avantajlarindan musteri deneyimine kadar tum detaylari kesfet.',
    date: '2025-01-15',
    category: 'QR Menu',
    coverColor: '#FF6B2B',
    author: 'Bora Aydeger',
    readingTime: '8 dk',
  },
];

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
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function BlogPreviewSection() {
  return (
    <section
      id="blog"
      className="relative overflow-hidden bg-bg-dark py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-orange/3 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Blog"
          title="Blog"
          subtitle="Dijital dunya hakkinda en son gelismeler, ipuclari ve sektorel trendleri blogumuzdan takip edin."
          gradientTitle
          parallax
          align="center"
        />

        {/* Blog Cards Grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {blogPosts.map((post) => (
            <motion.article key={post.slug} variants={itemVariants}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]"
              >
                {/* Cover gradient */}
                <div
                  className="relative h-48 w-full overflow-hidden"
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
                  <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-text-main transition-colors duration-300 group-hover:text-accent-orange">
                    {post.title}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {post.excerpt}
                  </p>

                  {/* Meta info */}
                  <div className="mb-4 flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readingTime}
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

        {/* View all blog posts link */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-text-muted backdrop-blur-sm transition-all duration-300 hover:border-accent-orange/30 hover:text-accent-orange"
          >
            Tum Yazilari Gor
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
