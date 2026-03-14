'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ParallaxDirection = 'vertical' | 'horizontal';

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  /** Parallax speed multiplier (negative = opposite direction). Default: 0.3 */
  speed?: number;
  /** Direction of the parallax effect. Default: 'vertical' */
  direction?: ParallaxDirection;
  /** Start position of the scroll trigger. Default: 'top bottom' */
  start?: string;
  /** End position of the scroll trigger. Default: 'bottom top' */
  end?: string;
  /** Whether to use scrub (smooth scroll-linked). Default: true */
  scrub?: boolean | number;
  /** Additional GSAP properties to animate (e.g., rotation, scale, opacity) */
  gsapProps?: gsap.TweenVars;
  /** HTML element to render as. Default: 'div' */
  as?: 'div' | 'section' | 'span';
}

export default function ParallaxLayer({
  children,
  className,
  speed = 0.3,
  direction = 'vertical',
  start = 'top bottom',
  end = 'bottom top',
  scrub = true,
  gsapProps,
  as: Tag = 'div',
}: ParallaxLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !elementRef.current) return;

      // Calculate displacement based on speed
      // speed of 1 means element moves 100px over the scroll range
      const displacement = speed * 100;

      const animationProps: gsap.TweenVars = {
        ...(direction === 'vertical'
          ? { y: -displacement }
          : { x: -displacement }),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          end,
          scrub,
        },
        ...gsapProps,
      };

      gsap.to(elementRef.current, animationProps);
    },
    { scope: containerRef, dependencies: [speed, direction, start, end, scrub] }
  );

  return (
    <Tag ref={containerRef as React.RefObject<HTMLDivElement>} className={cn('relative', className)}>
      <div ref={elementRef} className="will-change-transform">
        {children}
      </div>
    </Tag>
  );
}
