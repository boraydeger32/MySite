'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import GradientText from '@/components/ui/GradientText';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function WaveSVG() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden">
      <div className="animate-wave w-[200%]">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-[60px] w-full sm:h-[80px] lg:h-[120px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 55C960 40 1056 20 1152 25C1248 30 1344 60 1392 75L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
            fill="rgba(255,107,43,0.05)"
          />
          <path
            d="M0 80L48 75C96 70 192 60 288 62C384 65 480 80 576 85C672 90 768 85 864 75C960 65 1056 50 1152 48C1248 45 1344 55 1392 60L1440 65V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V80Z"
            fill="rgba(124,58,237,0.04)"
          />
          <path
            d="M0 95L48 92C96 90 192 85 288 85C384 85 480 90 576 93C672 95 768 95 864 92C960 90 1056 85 1152 83C1248 80 1344 80 1392 80L1440 80V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V95Z"
            fill="rgba(0,212,255,0.03)"
          />
        </svg>
      </div>
    </div>
  );
}

function WaveSVGTop() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 overflow-hidden">
      <div className="w-[200%]" style={{ animationDirection: 'reverse' }}>
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-[60px] w-full rotate-180 sm:h-[80px] lg:h-[120px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 55C960 40 1056 20 1152 25C1248 30 1344 60 1392 75L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
            fill="rgba(255,107,43,0.04)"
          />
        </svg>
      </div>
    </div>
  );
}

export default function CtaSection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
    >
      {/* Hero gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B2B]/10 via-[#7C3AED]/15 to-[#00D4FF]/10" />
      <div className="absolute inset-0 bg-bg-dark/80" />

      {/* Radial glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-orange/8 blur-[150px]" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent-purple/6 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 h-[350px] w-[350px] rounded-full bg-accent-blue/5 blur-[100px]" />
      </div>

      {/* Animated wave backgrounds */}
      <WaveSVGTop />
      <WaveSVG />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col items-center"
        >
          {/* Tag */}
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-orange" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-orange">
              Hemen Baslayalim
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={itemVariants}>
            <GradientText
              as="h2"
              gradient="default"
              animated
              duration={8}
              className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Projenizi Hayata Gecirelim
            </GradientText>
          </motion.div>

          {/* Supporting Text */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg md:text-xl"
          >
            Dijital donusum yolculugunuza bugun baslayin. Uzman ekibimiz,
            isletmenizi bir ust seviyeye tasiyacak yaratici ve teknik cozumler
            icin hazir. Ucretsiz danismanlik gorusmesi icin hemen bize ulasin.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6"
          >
            <GlowButton variant="solid" size="lg" href="/iletisim">
              <MessageCircle className="h-5 w-5" />
              Ucretsiz Teklif Alin
            </GlowButton>
            <GlowButton variant="glass" size="lg" href="/hizmetler">
              Hizmetlerimizi Inceleyin
              <ArrowRight className="h-5 w-5" />
            </GlowButton>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { value: '150+', label: 'Tamamlanan Proje' },
              { value: '%98', label: 'Musteri Memnuniyeti' },
              { value: '7/24', label: 'Teknik Destek' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1"
              >
                <span className="font-display text-xl font-bold text-text-main sm:text-2xl">
                  {stat.value}
                </span>
                <span className="text-xs text-text-muted sm:text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
