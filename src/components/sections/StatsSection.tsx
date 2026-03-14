'use client';

import { motion } from 'framer-motion';
import { Briefcase, SmilePlus, Clock, Headphones } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';

interface StatItem {
  id: string;
  icon: React.ReactNode;
  target: number;
  suffix: string;
  label: string;
  glowColor: string;
}

const stats: StatItem[] = [
  {
    id: 'projects',
    icon: <Briefcase className="h-6 w-6" />,
    target: 150,
    suffix: '+',
    label: 'Tamamlanan Proje',
    glowColor: 'rgba(255, 107, 43, 0.12)',
  },
  {
    id: 'satisfaction',
    icon: <SmilePlus className="h-6 w-6" />,
    target: 98,
    suffix: '%',
    label: 'Musteri Memnuniyeti',
    glowColor: 'rgba(124, 58, 237, 0.12)',
  },
  {
    id: 'experience',
    icon: <Clock className="h-6 w-6" />,
    target: 5,
    suffix: '',
    label: 'Yil Tecrube',
    glowColor: 'rgba(0, 212, 255, 0.12)',
  },
  {
    id: 'support',
    icon: <Headphones className="h-6 w-6" />,
    target: 24,
    suffix: '/7',
    label: 'Destek',
    glowColor: 'rgba(255, 107, 43, 0.12)',
  },
];

const iconVariants = {
  hidden: { scale: 0, rotate: -45 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

export default function StatsSection() {
  return (
    <section
      id="stats"
      className="relative overflow-hidden bg-bg-dark py-16 sm:py-20 lg:py-24"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-accent-orange/3 blur-[100px]" />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-accent-purple/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal
          stagger={0.15}
          className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:gap-10"
        >
          {stats.map((stat) => (
            <ScrollRevealItem key={stat.id}>
              <div className="group relative flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/20 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)] sm:p-8">
                {/* Radial glow background */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at center, ${stat.glowColor}, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-orange/10 text-accent-orange sm:h-14 sm:w-14"
                  variants={iconVariants}
                >
                  {stat.icon}
                </motion.div>

                {/* Counter */}
                <div className="relative mb-2">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    duration={2000}
                    className="text-3xl sm:text-4xl lg:text-5xl"
                  />
                </div>

                {/* Label */}
                <p className="relative font-body text-sm text-text-muted sm:text-base">
                  {stat.label}
                </p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
