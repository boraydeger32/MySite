'use client';

import { motion } from 'framer-motion';
import GradientText from '@/components/ui/GradientText';
import GlowButton from '@/components/ui/GlowButton';
import { Home, SearchX } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 107, 43, 0.1) 0%, rgba(124, 58, 237, 0.05) 40%, transparent 70%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 0.6, 0.4] }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 0.5, 0.3] }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex max-w-2xl flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 icon */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg"
        >
          <SearchX className="h-12 w-12 text-accent-orange" />
        </motion.div>

        {/* Large 404 number */}
        <motion.div variants={itemVariants}>
          <GradientText
            as="h1"
            gradient="default"
            animated
            className="text-[8rem] font-extrabold leading-none sm:text-[10rem]"
          >
            404
          </GradientText>
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={itemVariants}
          className="mt-4 font-display text-3xl font-bold text-text-main sm:text-4xl"
        >
          Sayfa Bulunamadi
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-md font-body text-lg leading-relaxed text-text-muted"
        >
          Aradiginiz sayfa tasinmis, silinmis veya hic var olmamis olabilir.
          Ana sayfaya donerek yolculugunuza devam edebilirsiniz.
        </motion.p>

        {/* Decorative line */}
        <motion.div
          variants={itemVariants}
          className="my-8 h-px w-32 bg-gradient-to-r from-transparent via-accent-orange/50 to-transparent"
        />

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <GlowButton href="/" variant="solid" size="lg">
            <Home className="h-5 w-5" />
            Ana Sayfaya Don
          </GlowButton>
        </motion.div>

        {/* Floating decorative particles */}
        <motion.div
          className="absolute -left-20 top-0 h-2 w-2 rounded-full bg-accent-orange/30"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-16 bottom-10 h-3 w-3 rounded-full bg-accent-purple/30"
          animate={{
            y: [0, -15, 0],
            x: [0, -8, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute left-10 bottom-20 h-1.5 w-1.5 rounded-full bg-accent-blue/30"
          animate={{
            y: [0, -25, 0],
            x: [0, 5, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </motion.div>
    </section>
  );
}
