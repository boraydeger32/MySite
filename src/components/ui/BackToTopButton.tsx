'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const SCROLL_THRESHOLD = 300;

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    // Check initial position
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-accent-orange/90 text-white shadow-glow-orange backdrop-blur-sm transition-colors duration-300 hover:bg-accent-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          aria-label="Sayfa basina don"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
