'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const rafId = useRef<number>(0);

  const springConfig = { damping: 25, stiffness: 300, restDelta: 0.001 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    setMounted(true);

    // Detect touch devices
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;

    if (isTouchDevice) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]') !== null;
      setIsHovering(isInteractive);
    };

    const onMouseLeave = () => {
      cursorX.set(-100);
      cursorY.set(-100);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [cursorX, cursorY]);

  // Don't render on touch devices or before mount
  if (!mounted || isTouch) return null;

  const size = isHovering ? 48 : 20;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border-2 border-white mix-blend-difference"
      style={{
        x: smoothX,
        y: smoothY,
        width: size,
        height: size,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        width: size,
        height: size,
        opacity: isHovering ? 0.8 : 0.6,
      }}
      transition={{
        width: { type: 'spring', stiffness: 300, damping: 20 },
        height: { type: 'spring', stiffness: 300, damping: 20 },
        opacity: { duration: 0.2 },
      }}
      aria-hidden="true"
    />
  );
}
