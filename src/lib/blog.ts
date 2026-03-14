import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime, { type ReadTimeResults } from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export interface BlogFrontmatter {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  coverColor: string;
  author: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  readingTime: ReadTimeResults;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);

  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace('.mdx', '');
      const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data, content } = matter(source);

      return {
        slug,
        frontmatter: data as BlogFrontmatter,
        content,
        readingTime: readingTime(content),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const source = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(source);

  return {
    slug,
    frontmatter: data as BlogFrontmatter,
    content,
    readingTime: readingTime(content),
  };
}
