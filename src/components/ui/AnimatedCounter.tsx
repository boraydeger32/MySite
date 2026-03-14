'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  /** Target value to count up to */
  target: number;
  /** Suffix to append after the number (e.g., '+', '%') */
  suffix?: string;
  /** Prefix to prepend before the number (e.g., '$') */
  prefix?: string;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Number of decimal places to show */
  decimals?: number;
  /** Custom className for the counter text */
  className?: string;
  /** Easing function: 'easeOut' (default) or 'linear' */
  easing?: 'easeOut' | 'linear';
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export default function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2000,
  decimals = 0,
  className,
  easing = 'easeOut',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing === 'easeOut' ? easeOutQuart(progress) : progress;
      const currentValue = easedProgress * target;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  }, [target, duration, easing]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || hasAnimated) return;

    // Fallback: if IntersectionObserver is not available, show final value
    if (typeof IntersectionObserver === 'undefined') {
      setDisplayValue(target);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate();
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, hasAnimated, target]);

  const formattedValue =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString('tr-TR');

  return (
    <span
      ref={containerRef}
      className={cn(
        'tabular-nums font-display font-bold text-text-main',
        className
      )}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
