'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';

type Category = 'Tumu' | 'QR Menu' | 'Kurumsal' | 'E-Ticaret';

interface Project {
  id: string;
  name: string;
  client: string;
  category: Category;
  gradient: string;
  description: string;
  technologies: string[];
  testimonial: {
    text: string;
    author: string;
    role: string;
  };
}

const categories: Category[] = ['Tumu', 'QR Menu', 'Kurumsal', 'E-Ticaret'];

const projects: Project[] = [
  {
    id: 'qr-menu-lezzet',
    name: 'QR Menu Sistemi',
    client: 'Lezzet Duragi Restaurant',
    category: 'QR Menu',
    gradient: 'from-accent-orange/40 via-accent-purple/30 to-accent-blue/20',
    description:
      'Istanbul\'un en populer restoranlarindan biri icin gelistirdigimiz dijital QR menu sistemi. Coklu dil destegi, anlik guncelleme ve analitik paneli ile isletmenin dijital donusumunu saglandi.',
    technologies: ['Next.js', 'React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    testimonial: {
      text: 'QR menu sistemi sayesinde musterilerimiz artik daha hizli siparis veriyor. Basili menu maliyetlerimiz neredeyse sifira indi.',
      author: 'Ahmet Yildiz',
      role: 'Isletme Sahibi',
    },
  },
  {
    id: 'kurumsal-techcorp',
    name: 'Kurumsal Web Sitesi',
    client: 'TechCorp Turkiye',
    category: 'Kurumsal',
    gradient: 'from-accent-blue/40 via-accent-purple/30 to-accent-orange/20',
    description:
      'Turkiye\'nin oncu teknoloji sirketlerinden TechCorp icin hazirlanan kurumsal web sitesi. SEO odakli, yuksek performansli ve mobil oncelikli modern tasarim ile marka degerini dijitale yansittik.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vercel'],
    testimonial: {
      text: 'DevSpark ekibi bizim vizyonumuzu mukemmel bir sekilde dijitale tasidi. Web sitemiz artik markamizi en iyi sekilde temsil ediyor.',
      author: 'Mehmet Kaya',
      role: 'Pazarlama Direktoru',
    },
  },
  {
    id: 'eticaret-moda',
    name: 'E-Ticaret Platformu',
    client: 'ModaShop Online',
    category: 'E-Ticaret',
    gradient: 'from-accent-purple/40 via-accent-orange/30 to-accent-blue/20',
    description:
      'Turkiye\'nin buyuyen moda markasi ModaShop icin kapsamli bir e-ticaret platformu. Guvenli odeme entegrasyonu, stok yonetimi, kargo takibi ve gelismis raporlama ozellikleri ile donattik.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
    testimonial: {
      text: 'Online satis platformumuz sayesinde ciromuz %200 artti. Ozellikle mobil uyumlu tasarim musterilerimizin alisveris deneyimini cok iyilestirdi.',
      author: 'Zeynep Demir',
      role: 'Kurucu & CEO',
    },
  },
  {
    id: 'kurumsal-otel',
    name: 'Otel Yonetim Sistemi',
    client: 'Gunes Otelcilik',
    category: 'Kurumsal',
    gradient: 'from-accent-orange/30 via-accent-blue/40 to-accent-purple/20',
    description:
      'Gunes Otelcilik zinciri icin gelistirilen kapsamli otel yonetim ve rezervasyon sistemi. Online rezervasyon, oda yonetimi, misafir iliskileri ve gelir raporlama modulleri ile donatildi.',
    technologies: ['Next.js', 'Express.js', 'MySQL', 'Docker', 'AWS'],
    testimonial: {
      text: 'Rezervasyon sistemimiz artik cok daha verimli calisiyor. Misafir memnuniyetimiz gozle gorulur sekilde artti.',
      author: 'Ali Ozturk',
      role: 'Genel Mudur',
    },
  },
  {
    id: 'eticaret-biofarm',
    name: 'Organik Market',
    client: 'BioFarm Organik',
    category: 'E-Ticaret',
    gradient: 'from-accent-blue/30 via-accent-orange/20 to-accent-purple/40',
    description:
      'BioFarm Organik icin gelistirilen online organik market platformu. Taze urun takibi, abonelik sistemi, teslimat planlama ve organik sertifika dogrulama ozellikleri ile sektorunde fark yaratti.',
    technologies: ['React', 'GraphQL', 'Node.js', 'MongoDB', 'Cloudflare'],
    testimonial: {
      text: 'E-ticaret platformumuz musterilerimize organik urunlere kolayca ulasmalarini sagliyor. Abonelik sistemi sayesinde duzenlisatislarimiz %150 artti.',
      author: 'Selin Arslan',
      role: 'Operasyon Muduru',
    },
  },
  {
    id: 'kurumsal-steel',
    name: 'Kurumsal Web Sitesi',
    client: 'SteelBuild Insaat',
    category: 'Kurumsal',
    gradient: 'from-accent-purple/30 via-accent-blue/20 to-accent-orange/40',
    description:
      'SteelBuild Insaat icin profesyonel kurumsal web sitesi ve proje portfolyo platformu. Devam eden projeler, tamamlanan isler, sirket hakkinda ve kariyer sayfalarini kapsayan genis bir icerik altyapisi.',
    technologies: ['Next.js', 'Sanity CMS', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    testimonial: {
      text: 'Yeni web sitemiz sirketimizin profesyonel imajini guclu bir sekilde yansitıyor. Proje portfolyomuz potansiyel musterileri etkilemekte buyuk rol oynuyor.',
      author: 'Burak Celik',
      role: 'Satis Direktoru',
    },
  },
];

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

export default function PortfolioGrid() {
  const [activeFilter, setActiveFilter] = useState<Category>('Tumu');

  const filteredProjects =
    activeFilter === 'Tumu'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* Filter Buttons */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3 sm:mb-12">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => setActiveFilter(category)}
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

                {/* Category Badge */}
                <div className="absolute left-4 top-4">
                  <span className="inline-block rounded-full bg-bg-dark/70 px-3 py-1 text-xs font-medium text-accent-orange backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                  <GlowButton variant="solid" size="sm">
                    Detay Gor
                  </GlowButton>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-5 sm:p-6">
                <h3 className="mb-1 font-display text-lg font-semibold text-text-main sm:text-xl">
                  {project.name}
                </h3>
                <p className="mb-3 text-sm font-medium text-accent-orange">
                  {project.client}
                </p>
                <p className="mb-4 text-sm leading-relaxed text-text-muted line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Testimonial Snippet */}
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <Quote className="mb-1.5 h-4 w-4 text-accent-orange/60" />
                  <p className="mb-2 text-xs italic leading-relaxed text-text-muted line-clamp-2">
                    &ldquo;{project.testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-orange/20 text-[8px] font-bold text-accent-orange">
                      {project.testimonial.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span className="text-xs text-text-muted">
                      {project.testimonial.author},{' '}
                      <span className="text-text-muted/70">
                        {project.testimonial.role}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
