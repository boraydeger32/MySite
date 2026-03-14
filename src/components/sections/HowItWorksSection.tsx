'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Palette, Code2, Rocket } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 'discovery',
    number: 1,
    icon: <Search className="h-6 w-6" />,
    title: 'Kesif Toplantisi',
    description:
      'Projenizin hedeflerini, ihtiyaclarinizi ve beklentilerinizi detayli bir sekilde analiz ediyoruz.',
  },
  {
    id: 'design',
    number: 2,
    icon: <Palette className="h-6 w-6" />,
    title: 'Tasarim & Prototip',
    description:
      'Kullanici deneyimini on planda tutarak modern ve etkileyici tasarimlar olusturuyoruz.',
  },
  {
    id: 'development',
    number: 3,
    icon: <Code2 className="h-6 w-6" />,
    title: 'Gelistirme',
    description:
      'En son teknolojileri kullanarak projenizi titizlikle kodluyor ve test ediyoruz.',
  },
  {
    id: 'launch',
    number: 4,
    icon: <Rocket className="h-6 w-6" />,
    title: 'Lansman & Destek',
    description:
      'Projenizi yayina aliyoruz ve sonrasinda 7/24 teknik destek sagliyoruz.',
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

function ConnectorLine({ inView }: { inView: boolean }) {
  return (
    <>
      {/* Horizontal connector - desktop only */}
      <svg
        className="pointer-events-none absolute left-0 top-[52px] hidden w-full lg:block"
        height="4"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="12.5%"
          y1="2"
          x2="87.5%"
          y2="2"
          stroke="url(#horizontal-gradient)"
          strokeWidth="2"
          strokeDasharray="8 6"
          strokeLinecap="round"
          className="transition-all duration-[2s] ease-out"
          style={{
            strokeDashoffset: inView ? 0 : 200,
          }}
        />
        <defs>
          <linearGradient id="horizontal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B2B" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Vertical connector - mobile/tablet only */}
      <svg
        className="pointer-events-none absolute left-[27px] top-0 h-full w-4 lg:hidden"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="8"
          y1="60"
          x2="8"
          y2="calc(100% - 60)"
          stroke="url(#vertical-gradient)"
          strokeWidth="2"
          strokeDasharray="8 6"
          strokeLinecap="round"
          className="transition-all duration-[2s] ease-out"
          style={{
            strokeDashoffset: inView ? 0 : 400,
          }}
        />
        <defs>
          <linearGradient id="vertical-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6B2B" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-bg-dark py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent-orange/3 blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-accent-blue/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Surecimiz"
          title="Nasil Calisiyoruz?"
          subtitle="Projenizi fikir asamasindan canliya tasimak icin izledigimiz 4 adimlik surec."
          gradientTitle
          parallax
          align="center"
        />

        {/* Steps Container */}
        <div ref={sectionRef} className="relative">
          {/* Animated connector line */}
          <ConnectorLine inView={isInView} />

          {/* Desktop: Horizontal layout / Mobile: Vertical layout */}
          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                custom={index}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="relative flex flex-row items-start gap-4 lg:flex-col lg:items-center lg:text-center"
              >
                {/* Numbered Circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="group relative flex h-14 w-14 items-center justify-center">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-orange via-accent-purple to-accent-blue opacity-20 blur-md transition-opacity duration-300 group-hover:opacity-40" />

                    {/* Circle background */}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-bg-mid transition-all duration-300 group-hover:border-accent-orange/40">
                      {/* Number */}
                      <span className="font-display text-lg font-bold text-accent-orange">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 lg:mt-6">
                  {/* Icon */}
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-orange/10 text-accent-orange lg:mx-auto">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 font-display text-lg font-semibold text-text-main sm:text-xl">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
