'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type GlowButtonVariant = 'solid' | 'glass';
type GlowButtonSize = 'sm' | 'md' | 'lg';

interface GlowButtonProps {
  variant?: GlowButtonVariant;
  size?: GlowButtonSize;
  children: ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
}

const sizeClasses: Record<GlowButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variantClasses: Record<GlowButtonVariant, string> = {
  solid: [
    'bg-accent-orange text-white',
    'hover:shadow-glow-orange',
  ].join(' '),
  glass: [
    'bg-white/5 border border-white/20 backdrop-blur-lg text-text-main',
    'hover:border-accent-orange hover:shadow-glow-orange',
  ].join(' '),
};

export default function GlowButton({
  variant = 'solid',
  size = 'md',
  children,
  className,
  href,
  type = 'button',
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
}: GlowButtonProps) {
  const classes = cn(
    'relative inline-flex items-center justify-center gap-2',
    'rounded-lg font-semibold font-body',
    'transition-all duration-300 overflow-hidden',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  if (href) {
    return (
      <motion.div
        whileHover={disabled ? undefined : { scale: 1.05 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="inline-block"
      >
        <Link href={href} className={classes} aria-label={ariaLabel}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={classes}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
