'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-accent-orange"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
