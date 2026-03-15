'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { List } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is currently intersecting
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-28">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <List className="h-4 w-4 text-accent-orange" />
          <span className="text-sm font-semibold text-text-main">
            Icerik Tablosu
          </span>
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-white/10" />

        {/* Links */}
        <nav className="flex flex-col gap-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              className={cn(
                'text-left text-sm leading-relaxed transition-all duration-200',
                'rounded-md px-3 py-1.5 hover:bg-white/5',
                heading.level === 3 && 'pl-6',
                activeId === heading.id
                  ? 'border-l-2 border-accent-orange bg-accent-orange/5 text-accent-orange'
                  : 'border-l-2 border-transparent text-text-muted hover:text-text-main'
              )}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
