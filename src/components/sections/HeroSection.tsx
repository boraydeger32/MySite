'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import GradientText from '@/components/ui/GradientText';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { useParallax } from '@/hooks/useParallax';

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-32 w-32 animate-pulse rounded-full bg-accent-purple/20" />
    </div>
  ),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
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

export default function HeroSection() {
  const { offset } = useParallax({
    sensitivityX: 0.03,
    sensitivityY: 0.02,
    maxOffset: 25,
    smoothing: 0.08,
  });

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-bg-dark"
    >
      {/* Radial glow backgrounds */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-orange/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-accent-purple/5 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-blue/3 blur-[80px]" />
      </div>

      {/* Floating particles overlay */}
      <FloatingParticles
        count={60}
        mobileCount={25}
        speed={0.2}
        minRadius={0.5}
        maxRadius={2.5}
        minOpacity={0.15}
        maxOpacity={0.5}
        className="z-[1]"
      />

      {/* Three.js scene (parallax-responsive) */}
      <motion.div
        className="absolute inset-0 z-[2]"
        animate={{ x: offset.x * 0.5, y: offset.y * 0.5 }}
        transition={{ type: 'tween', duration: 0 }}
      >
        <HeroScene />
      </motion.div>

      {/* Content overlay */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Tagline badge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-orange" />
            <span className="font-body text-sm text-text-muted">
              Yazilim & Dijital Cozumler
            </span>
          </motion.div>

          {/* Main title with parallax */}
          <motion.div
            variants={itemVariants}
            animate={{ x: offset.x * -0.3, y: offset.y * -0.3 }}
            transition={{ type: 'tween', duration: 0 }}
          >
            <GradientText
              as="h1"
              gradient="default"
              animated
              duration={8}
              className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Dijital Dunyada Farkli Olun
            </GradientText>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl font-body text-base leading-relaxed text-text-muted sm:text-lg md:text-xl"
          >
            DevSpark Yazilim olarak, isletmenizi dijital dunyada one cikaracak
            yenilikci cozumler sunuyoruz. QR Menu sistemlerinden kurumsal web
            sitelerine, e-ticaretten ozel yazilima kadar tum ihtiyaclariniz icin
            yaninizdayiz.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6"
          >
            <GlowButton variant="solid" size="lg" href="/iletisim">
              Ucretsiz Teklif Alin
            </GlowButton>
            <GlowButton variant="glass" size="lg" href="/hizmetler">
              Hizmetlerimiz
            </GlowButton>
          </motion.div>

          {/* Stats mini row */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center gap-8 lg:gap-12"
          >
            {[
              { value: '150+', label: 'Tamamlanan Proje' },
              { value: '%98', label: 'Musteri Memnuniyeti' },
              { value: '5 Yil', label: 'Deneyim' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-display text-2xl font-bold text-text-main sm:text-3xl">
                  {stat.value}
                </span>
                <span className="font-body text-sm text-text-muted">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span className="font-body text-xs tracking-wider text-text-muted">
          Kesfet
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ChevronDown className="h-5 w-5 text-accent-orange" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-32 bg-gradient-to-t from-bg-dark to-transparent" />
    </section>
  );
}
