'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseParallaxOptions {
  /** Horizontal sensitivity multiplier (default: 0.02) */
  sensitivityX?: number;
  /** Vertical sensitivity multiplier (default: 0.02) */
  sensitivityY?: number;
  /** Maximum offset in pixels to clamp movement (default: 30) */
  maxOffset?: number;
  /** Whether to invert the movement direction (default: false) */
  inverted?: boolean;
  /** Smoothing factor between 0-1, higher = more responsive (default: 0.1) */
  smoothing?: number;
  /** Whether the hook is enabled (default: true) */
  enabled?: boolean;
}

interface ParallaxOffset {
  x: number;
  y: number;
}

interface UseParallaxReturn {
  /** Current smoothed x/y offsets in pixels */
  offset: ParallaxOffset;
  /** Whether parallax is active (false on touch devices or when disabled) */
  isActive: boolean;
}

/**
 * Custom hook for mouse-position-based parallax effects.
 * Tracks mousemove events and returns smoothed x/y offset values
 * relative to the viewport center. Uses requestAnimationFrame for
 * performance-optimized smooth interpolation.
 *
 * @example
 * ```tsx
 * const { offset, isActive } = useParallax({ sensitivityX: 0.03 });
 *
 * return (
 *   <motion.div
 *     animate={{ x: offset.x, y: offset.y }}
 *     transition={{ type: 'tween', duration: 0 }}
 *   >
 *     Parallax Element
 *   </motion.div>
 * );
 * ```
 */
export function useParallax(
  options: UseParallaxOptions = {}
): UseParallaxReturn {
  const {
    sensitivityX = 0.02,
    sensitivityY = 0.02,
    maxOffset = 30,
    inverted = false,
    smoothing = 0.1,
    enabled = true,
  } = options;

  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const targetRef = useRef<ParallaxOffset>({ x: 0, y: 0 });
  const currentRef = useRef<ParallaxOffset>({ x: 0, y: 0 });
  const rafIdRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const clamp = useCallback(
    (value: number): number => {
      return Math.max(-maxOffset, Math.min(maxOffset, value));
    },
    [maxOffset]
  );

  const animate = useCallback(() => {
    const dx = targetRef.current.x - currentRef.current.x;
    const dy = targetRef.current.y - currentRef.current.y;

    // Smooth interpolation (lerp)
    currentRef.current.x += dx * smoothing;
    currentRef.current.y += dy * smoothing;

    // Only update state when movement is significant (> 0.1px)
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      setOffset({
        x: Math.round(currentRef.current.x * 100) / 100,
        y: Math.round(currentRef.current.y * 100) / 100,
      });
      rafIdRef.current = requestAnimationFrame(animate);
    } else {
      // Snap to target when close enough
      currentRef.current.x = targetRef.current.x;
      currentRef.current.y = targetRef.current.y;
      setOffset({
        x: targetRef.current.x,
        y: targetRef.current.y,
      });
      isRunningRef.current = false;
    }
  }, [smoothing]);

  const startAnimation = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      rafIdRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    if (!enabled) {
      setIsActive(false);
      return;
    }

    // Detect touch devices
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches);

    if (isTouchDevice) {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    const direction = inverted ? -1 : 1;

    const onMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const deltaX = (e.clientX - centerX) * sensitivityX * direction;
      const deltaY = (e.clientY - centerY) * sensitivityY * direction;

      targetRef.current = {
        x: clamp(deltaX),
        y: clamp(deltaY),
      };

      startAnimation();
    };

    const onMouseLeave = () => {
      targetRef.current = { x: 0, y: 0 };
      startAnimation();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafIdRef.current);
      isRunningRef.current = false;
    };
  }, [
    enabled,
    sensitivityX,
    sensitivityY,
    inverted,
    clamp,
    startAnimation,
  ]);

  return { offset, isActive };
}
