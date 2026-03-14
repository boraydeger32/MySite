'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-bg-dark">
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
        {/* Logo text with pulse */}
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.h1
            className="font-display text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            Dev
            <span className="text-accent-orange">Spark</span>
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="font-body text-sm tracking-[0.3em] text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          YUKLENIYOR
        </motion.p>

        {/* Loading bar */}
        <motion.div
          className="h-[2px] w-32 overflow-hidden rounded-full bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-orange via-accent-purple to-accent-blue"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
