'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';

type Category = 'Tumu' | 'QR Menu' | 'Kurumsal' | 'E-Ticaret';

interface Project {
  id: string;
  name: string;
  client: string;
  category: Category;
  gradient: string;
}

const categories: Category[] = ['Tumu', 'QR Menu', 'Kurumsal', 'E-Ticaret'];

const projects: Project[] = [
  {
    id: 'qr-menu-lezzet',
    name: 'QR Menu Sistemi',
    client: 'Lezzet Duragi Restaurant',
    category: 'QR Menu',
    gradient: 'from-accent-orange/40 via-accent-purple/30 to-accent-blue/20',
  },
  {
    id: 'kurumsal-techcorp',
    name: 'Kurumsal Web Sitesi',
    client: 'TechCorp Turkiye',
    category: 'Kurumsal',
    gradient: 'from-accent-blue/40 via-accent-purple/30 to-accent-orange/20',
  },
  {
    id: 'eticaret-moda',
    name: 'E-Ticaret Platformu',
    client: 'ModaShop Online',
    category: 'E-Ticaret',
    gradient: 'from-accent-purple/40 via-accent-orange/30 to-accent-blue/20',
  },
  {
    id: 'kurumsal-otel',
    name: 'Otel Yonetim Sistemi',
    client: 'Gunes Otelcilik',
    category: 'Kurumsal',
    gradient: 'from-accent-orange/30 via-accent-blue/40 to-accent-purple/20',
  },
  {
    id: 'eticaret-biofarm',
    name: 'Organik Market',
    client: 'BioFarm Organik',
    category: 'E-Ticaret',
    gradient: 'from-accent-blue/30 via-accent-orange/20 to-accent-purple/40',
  },
  {
    id: 'kurumsal-steel',
    name: 'Kurumsal Web Sitesi',
    client: 'SteelBuild Insaat',
    category: 'Kurumsal',
    gradient: 'from-accent-purple/30 via-accent-blue/20 to-accent-orange/40',
  },
];

const filterButtonVariants = {
  inactive: {
    scale: 1,
  },
  active: {
    scale: 1,
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
};

export default function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState<Category>('Tumu');

  const filteredProjects =
    activeFilter === 'Tumu'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section
      id="portfolio"
      className="relative overflow-hidden bg-bg-dark py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-purple/3 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-orange/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Portfolyo"
          title="Referanslarimiz"
          subtitle="Basariyla tamamladigimiz projelerden bazilari. Her projede kalite ve musteri memnuniyetini on planda tutuyoruz."
          gradientTitle
          parallax
          align="center"
        />

        {/* Filter Buttons */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3 sm:mb-12">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveFilter(category)}
              variants={filterButtonVariants}
              animate={activeFilter === category ? 'active' : 'inactive'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative rounded-full px-5 py-2 text-sm font-semibold font-body transition-all duration-300',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange',
                activeFilter === category
                  ? 'bg-accent-orange text-white shadow-glow-orange'
                  : 'border border-white/10 bg-white/5 text-text-muted backdrop-blur-sm hover:border-accent-orange/30 hover:text-text-main'
              )}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Project Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.article
                key={project.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]"
              >
                {/* Gradient Placeholder Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110',
                      project.gradient
                    )}
                  />
                  {/* Grid pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <GlowButton variant="solid" size="sm">
                      Detay Gor
                    </GlowButton>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-5">
                  <h3 className="mb-1 font-display text-lg font-semibold text-text-main">
                    {project.name}
                  </h3>
                  <p className="mb-2 text-sm text-text-muted">{project.client}</p>
                  <span className="inline-block rounded-full bg-accent-orange/10 px-3 py-1 text-xs font-medium text-accent-orange">
                    {project.category}
                  </span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
