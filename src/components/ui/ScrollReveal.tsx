'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

type RevealDirection = 'up' | 'down' | 'left' | 'right';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Distance in pixels for the initial offset */
  distance?: number;
  /** Whether to only animate once */
  once?: boolean;
  /** Viewport margin for triggering (e.g., '-100px') */
  viewportMargin?: string;
  /** Enable stagger for child elements (use as parent container) */
  stagger?: number;
  as?: 'div' | 'section' | 'article' | 'span' | 'li';
}

const getDirectionOffset = (
  direction: RevealDirection,
  distance: number
): { x: number; y: number } => {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance };
    case 'down':
      return { x: 0, y: -distance };
    case 'left':
      return { x: distance, y: 0 };
    case 'right':
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: distance };
  }
};

export default function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 30,
  once = true,
  viewportMargin = '-80px',
  stagger,
  as = 'div',
}: ScrollRevealProps) {
  const offset = getDirectionOffset(direction, distance);

  // Stagger mode: parent container that staggers its children
  if (stagger !== undefined) {
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger,
          delayChildren: delay,
        },
      },
    };

    const MotionComponent = motion[as];

    return (
      <MotionComponent
        className={cn(className)}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: viewportMargin }}
      >
        {children}
      </MotionComponent>
    );
  }

  // Single element reveal mode
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      className={cn(className)}
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * Child item variant for use inside a ScrollReveal with stagger.
 * Wrap each child in <ScrollRevealItem> to inherit stagger timing.
 */
interface ScrollRevealItemProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  as?: 'div' | 'article' | 'li' | 'span';
}

export function ScrollRevealItem({
  children,
  className,
  direction = 'up',
  distance = 30,
  duration = 0.5,
  as = 'div',
}: ScrollRevealItemProps) {
  const offset = getDirectionOffset(direction, distance);

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const MotionComponent = motion[as];

  return (
    <MotionComponent className={cn(className)} variants={variants}>
      {children}
    </MotionComponent>
  );
}
