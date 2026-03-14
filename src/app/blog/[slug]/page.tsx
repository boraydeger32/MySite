import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug, type BlogFrontmatter } from '@/lib/blog';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import TableOfContents from './TableOfContents';

interface BlogDetailPageProps {
  params: { slug: string };
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

/** Extract headings from raw MDX/markdown content */
function extractHeadings(
  content: string
): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-\u00C0-\u024F]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    headings.push({ id, text, level });
  }

  return headings;
}

/** Custom MDX components for styled prose rendering */
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof props.children === 'string' ? props.children : '';
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-\u00C0-\u024F]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return (
      <h1
        id={id}
        className="mb-6 mt-10 font-display text-3xl font-bold text-text-main sm:text-4xl"
        {...props}
      />
    );
  },
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof props.children === 'string' ? props.children : '';
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-\u00C0-\u024F]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return (
      <h2
        id={id}
        className="mb-4 mt-10 font-display text-2xl font-bold text-text-main sm:text-3xl"
        {...props}
      />
    );
  },
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof props.children === 'string' ? props.children : '';
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-\u00C0-\u024F]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return (
      <h3
        id={id}
        className="mb-3 mt-8 font-display text-xl font-semibold text-text-main sm:text-2xl"
        {...props}
      />
    );
  },
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="mb-5 text-base leading-relaxed text-text-muted sm:text-lg"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-5 ml-6 list-disc space-y-2 text-text-muted" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="mb-5 ml-6 list-decimal space-y-2 text-text-muted"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-base leading-relaxed sm:text-lg" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-text-main" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-accent-orange underline decoration-accent-orange/30 transition-colors hover:text-accent-orange/80"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 border-l-4 border-accent-orange/50 bg-white/5 py-4 pl-6 pr-4 italic text-text-muted"
      {...props}
    />
  ),
  hr: () => (
    <hr className="my-8 border-t border-white/10" />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="mb-5 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-left text-sm text-text-muted" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-white/10 bg-white/5 text-text-main" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 font-semibold" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-accent-orange"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mb-5 overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-4 text-sm"
      {...props}
    />
  ),
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Yazi Bulunamadi',
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: `${post.frontmatter.title} | DevSpark Yazilim Blog`,
      description: post.frontmatter.excerpt,
      url: `https://devspark.com.tr/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Read the raw MDX source for compileMDX
  const filePath = path.join(
    process.cwd(),
    'src/content/blog',
    `${params.slug}.mdx`
  );
  const source = fs.readFileSync(filePath, 'utf-8');

  // Compile MDX using next-mdx-remote/rsc
  const { content } = await compileMDX<BlogFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });

  // Extract headings for TOC
  const headings = extractHeadings(post.content);

  // Get related posts (same category, excluding current)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.frontmatter.category === post.frontmatter.category &&
        p.slug !== post.slug
    )
    .slice(0, 2);

  // If not enough related posts from the same category, fill with others
  if (relatedPosts.length < 2) {
    const otherPosts = allPosts
      .filter(
        (p) =>
          p.slug !== post.slug &&
          !relatedPosts.some((rp) => rp.slug === p.slug)
      )
      .slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...otherPosts);
  }

  return (
    <div className="bg-bg-dark">
      {/* Hero Banner with cover color */}
      <section
        className="relative overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16"
        style={{
          background: `linear-gradient(180deg, ${post.frontmatter.coverColor}15 0%, transparent 100%)`,
        }}
      >
        {/* Gradient background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px]"
            style={{ backgroundColor: `${post.frontmatter.coverColor}15` }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Link
              href="/"
              className="transition-colors hover:text-accent-orange"
            >
              Ana Sayfa
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/blog"
              className="transition-colors hover:text-accent-orange"
            >
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-main">{post.frontmatter.category}</span>
          </nav>

          {/* Category tag */}
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold text-white"
            style={{
              backgroundColor: `${post.frontmatter.coverColor}30`,
              borderColor: `${post.frontmatter.coverColor}50`,
              borderWidth: '1px',
            }}
          >
            {post.frontmatter.category}
          </span>

          {/* Title */}
          <h1 className="mb-6 font-display text-3xl font-extrabold leading-tight text-text-main sm:text-4xl lg:text-5xl">
            {post.frontmatter.title}
          </h1>

          {/* Excerpt */}
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-text-muted sm:text-lg">
            {post.frontmatter.excerpt}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted sm:gap-6">
            <span className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: `${post.frontmatter.coverColor}40` }}
              >
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium text-text-main">
                {post.frontmatter.author}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.frontmatter.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime.text}
            </span>
          </div>
        </div>
      </section>

      {/* Content + TOC Sidebar */}
      <section className="relative overflow-hidden pb-20 sm:pb-24 lg:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/3 blur-[120px]" />
          <div className="absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full bg-accent-blue/3 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-10 lg:gap-12">
            {/* Main Content */}
            <article className="min-w-0 flex-1">
              {/* Cover gradient bar */}
              <div
                className="mb-10 h-1.5 w-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${post.frontmatter.coverColor}, ${post.frontmatter.coverColor}40)`,
                }}
              />

              {/* MDX Content */}
              <div className="prose-custom">{content}</div>

              {/* Author box */}
              <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-white"
                    style={{
                      backgroundColor: `${post.frontmatter.coverColor}30`,
                    }}
                  >
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Yazar</p>
                    <p className="font-display text-lg font-semibold text-text-main">
                      {post.frontmatter.author}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">
                      DevSpark Yazilim ekibinde icerik uretimi ve dijital
                      pazarlama alaninda calismalar yurutmektedir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Back to blog */}
              <div className="mt-8">
                <GlowButton href="/blog" variant="glass" size="md">
                  <ArrowLeft className="h-4 w-4" />
                  Tum Yazilara Don
                </GlowButton>
              </div>
            </article>

            {/* TOC Sidebar (desktop only) */}
            <aside className="hidden w-72 flex-shrink-0 lg:block">
              <TableOfContents headings={headings} />
            </aside>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="relative overflow-hidden border-t border-white/5 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-accent-orange/3 blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-text-main sm:text-3xl">
              Ilgili Yazilar
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]"
                >
                  {/* Cover gradient */}
                  <div
                    className="relative h-40 w-full overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${related.frontmatter.coverColor}30 0%, ${related.frontmatter.coverColor} 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_70%)]" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {related.frontmatter.category}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-text-main transition-colors duration-300 group-hover:text-accent-orange">
                      {related.frontmatter.title}
                    </h3>

                    <div className="mb-3 flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(related.frontmatter.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {related.readingTime.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-medium text-accent-orange transition-all duration-300 group-hover:gap-2">
                      Devamini Oku
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
