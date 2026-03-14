'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_DURATION = 2000;

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-bg-dark"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255, 107, 43, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.6] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          {/* Logo container */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Logo text */}
            <motion.div
              className="relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.h1
                className="font-display text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                Dev
                <span className="text-accent-orange">Spark</span>
              </motion.h1>

              {/* Reveal line sweeping across the text */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 0.8,
                  delay: 0.6,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="font-body text-sm tracking-[0.3em] text-text-muted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              DIJITAL DONUSUMUN ADRESI
            </motion.p>

            {/* Loading bar */}
            <motion.div
              className="mt-4 h-[2px] w-32 overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent-orange via-accent-purple to-accent-blue"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 0.8,
                  delay: 1.1,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
