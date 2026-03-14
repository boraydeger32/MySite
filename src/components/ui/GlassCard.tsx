'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'orange' | 'blue' | 'purple';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
}

const glowColorMap: Record<string, { border: string; shadow: string }> = {
  orange: {
    border: 'hover:border-[#FF6B2B]/30',
    shadow: 'hover:shadow-[0_0_30px_rgba(255,107,43,0.15)]',
  },
  blue: {
    border: 'hover:border-[#00D4FF]/30',
    shadow: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]',
  },
  purple: {
    border: 'hover:border-[#7C3AED]/30',
    shadow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
  },
};

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const cardVariants: Variants = {
  initial: {
    y: 0,
  },
  hover: {
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

export default function GlassCard({
  children,
  className,
  hoverEffect = true,
  glowColor = 'orange',
  padding = 'md',
  as = 'div',
}: GlassCardProps) {
  const glow = glowColorMap[glowColor];
  const MotionComponent = motion[as];

  const classes = cn(
    'relative rounded-xl',
    'border border-white/10 bg-white/5 backdrop-blur-xl',
    'transition-all duration-300',
    paddingClasses[padding],
    hoverEffect && [
      'hover:-translate-y-2',
      glow.border,
      glow.shadow,
    ],
    className
  );

  if (!hoverEffect) {
    return (
      <MotionComponent className={classes}>
        {children}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      className={classes}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
    >
      {children}
    </MotionComponent>
  );
}
