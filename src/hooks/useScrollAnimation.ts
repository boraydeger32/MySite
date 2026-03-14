'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  useAnimation,
  type AnimationControls,
  type Variants,
} from 'framer-motion';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface UseScrollAnimationOptions {
  /** Direction the element enters from (default: 'up') */
  direction?: AnimationDirection;
  /** Distance in pixels for the initial offset (default: 40) */
  distance?: number;
  /** Animation duration in seconds (default: 0.6) */
  duration?: number;
  /** Delay in seconds before animation starts (default: 0) */
  delay?: number;
  /** IntersectionObserver threshold (default: 0.15) */
  threshold?: number;
  /** IntersectionObserver rootMargin (default: '0px 0px -60px 0px') */
  rootMargin?: string;
  /** Whether to animate only once (default: true) */
  once?: boolean;
  /** Custom easing curve (default: [0.25, 0.1, 0.25, 1]) */
  ease?: number[];
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLElement | null>;
  controls: AnimationControls;
  variants: Variants;
  isInView: boolean;
}

const getDirectionOffset = (
  direction: AnimationDirection,
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
    case 'none':
      return { x: 0, y: 0 };
    default:
      return { x: 0, y: distance };
  }
};

/**
 * Custom hook for scroll-triggered animations using Framer Motion.
 * Wraps IntersectionObserver to detect when elements enter the viewport,
 * then triggers Framer Motion animation controls.
 *
 * @example
 * ```tsx
 * const { ref, controls, variants } = useScrollAnimation({ direction: 'up' });
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial="hidden"
 *     animate={controls}
 *     variants={variants}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn {
  const {
    direction = 'up',
    distance = 40,
    duration = 0.6,
    delay = 0,
    threshold = 0.15,
    rootMargin = '0px 0px -60px 0px',
    once = true,
    ease = [0.25, 0.1, 0.25, 1],
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const controls = useAnimation();
  const [isInView, setIsInView] = useState(false);
  const hasAnimatedRef = useRef(false);

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
        delay,
        ease,
      },
    },
  };

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];

      if (entry.isIntersecting) {
        if (once && hasAnimatedRef.current) return;

        setIsInView(true);
        hasAnimatedRef.current = true;
        controls.start('visible');
      } else if (!once) {
        setIsInView(false);
        controls.start('hidden');
      }
    },
    [controls, once]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback: if IntersectionObserver is not available, show immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      controls.start('visible');
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [controls, handleIntersection, threshold, rootMargin]);

  return { ref, controls, variants, isInView };
}
