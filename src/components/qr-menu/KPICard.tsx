'use client';

import { useEffect, useRef, useState, useCallback, type ElementType } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KPICardProps {
  /** Label displayed above the value */
  label: string;
  /** Target numeric value to animate to */
  value: number;
  /** Prefix for the value (e.g., '₺') */
  prefix?: string;
  /** Suffix for the value (e.g., '%', '+') */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Trend percentage (positive = up, negative = down) */
  trend?: number;
  /** Description of the trend period */
  trendLabel?: string;
  /** Lucide icon component */
  icon: ElementType;
  /** Accent color for the icon background */
  accentColor?: 'orange' | 'blue' | 'purple' | 'green' | 'red';
  /** Animation duration in ms */
  duration?: number;
  /** Optional className override */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const accentColorMap: Record<
  string,
  { bg: string; text: string; glow: string }
> = {
  orange: {
    bg: 'bg-accent-orange/10',
    text: 'text-accent-orange',
    glow: 'shadow-[0_0_20px_rgba(255,107,43,0.15)]',
  },
  blue: {
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]',
  },
  purple: {
    bg: 'bg-accent-purple/10',
    text: 'text-accent-purple',
    glow: 'shadow-[0_0_20px_rgba(124,58,237,0.15)]',
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
};

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KPICard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendLabel = 'dune gore',
  icon: Icon,
  accentColor = 'orange',
  duration = 2000,
  className,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const accent = accentColorMap[accentColor];

  const animate = useCallback(() => {
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = easedProgress * value;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  }, [value, duration]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || hasAnimated) return;

    if (typeof IntersectionObserver === 'undefined') {
      setDisplayValue(value);
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
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, hasAnimated, value]);

  const formattedValue =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString('tr-TR');

  const isTrendPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'relative rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl',
        'transition-all duration-300',
        'hover:border-white/20 hover:-translate-y-1',
        accent.glow,
        className
      )}
    >
      {/* Header: icon + label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            accent.bg
          )}
        >
          <Icon className={cn('h-5 w-5', accent.text)} />
        </div>
      </div>

      {/* Value */}
      <div className="mt-3">
        <span className="tabular-nums font-display text-2xl font-bold text-text-main sm:text-3xl">
          {prefix}
          {formattedValue}
          {suffix}
        </span>
      </div>

      {/* Trend indicator */}
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          {isTrendPositive ? (
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                +{Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs font-semibold text-red-400">
                {trend.toFixed(1)}%
              </span>
            </div>
          )}
          <span className="text-xs text-text-muted">{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
