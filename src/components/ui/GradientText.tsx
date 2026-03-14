'use client';

import { type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  gradient?: 'default' | 'orange-purple' | 'purple-blue' | 'orange-blue';
  animated?: boolean;
  /** Animation duration in seconds */
  duration?: number;
}

const gradientMap: Record<string, string> = {
  default: 'from-[#FF6B2B] via-[#7C3AED] to-[#00D4FF]',
  'orange-purple': 'from-[#FF6B2B] via-[#FF8F5E] to-[#7C3AED]',
  'purple-blue': 'from-[#7C3AED] via-[#A855F7] to-[#00D4FF]',
  'orange-blue': 'from-[#FF6B2B] via-[#FF6B2B] to-[#00D4FF]',
};

export default function GradientText({
  children,
  className,
  as: Tag = 'span',
  gradient = 'default',
  animated = true,
  duration = 6,
}: GradientTextProps) {
  const Component = Tag as ElementType;

  return (
    <Component
      className={cn(
        'bg-gradient-to-r bg-clip-text font-display text-transparent',
        gradientMap[gradient],
        animated && 'animate-gradient-shift bg-[length:200%_200%]',
        className
      )}
      style={animated ? { animationDuration: `${duration}s` } : undefined}
    >
      {children}
    </Component>
  );
}
