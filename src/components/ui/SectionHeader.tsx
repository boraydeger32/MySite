'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import GradientText from '@/components/ui/GradientText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type TextAlign = 'left' | 'center' | 'right';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  gradientTitle?: boolean;
  align?: TextAlign;
  className?: string;
  /** Enable GSAP parallax effect on scroll */
  parallax?: boolean;
  /** Show decorative accent line */
  accentLine?: boolean;
  /** Tag/badge text above the title */
  tag?: string;
}

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

export default function SectionHeader({
  title,
  subtitle,
  gradientTitle = false,
  align = 'center',
  className,
  parallax = false,
  accentLine = true,
  tag,
}: SectionHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!parallax || !containerRef.current) return;

      gsap.from(containerRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'top 50%',
          scrub: false,
          toggleActions: 'play none none none',
        },
      });

      // Parallax effect on the title element
      const titleEl = containerRef.current.querySelector('[data-parallax-title]');
      if (titleEl) {
        gsap.to(titleEl, {
          y: -20,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    },
    { scope: containerRef, dependencies: [parallax] }
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col gap-4 mb-12 sm:mb-16',
        alignClasses[align],
        className
      )}
    >
      {/* Tag / Badge */}
      {tag && (
        <span className="inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
          {tag}
        </span>
      )}

      {/* Accent Line */}
      {accentLine && (
        <div
          className={cn(
            'h-1 w-12 rounded-full bg-gradient-to-r from-accent-orange to-accent-purple',
            align === 'center' && 'mx-auto',
            align === 'right' && 'ml-auto'
          )}
        />
      )}

      {/* Title */}
      {gradientTitle ? (
        <div data-parallax-title="">
          <GradientText
            as="h2"
            className="text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            {title}
          </GradientText>
        </div>
      ) : (
        <h2
          className="font-display text-3xl font-bold text-text-main sm:text-4xl lg:text-5xl"
          data-parallax-title=""
        >
          {title}
        </h2>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
