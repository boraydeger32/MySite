'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  highlighted: boolean;
  ctaText: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'baslangic',
    name: 'Baslangic',
    description:
      'Kucuk isletmeler ve yeni girisimler icin ideal baslangic paketi.',
    monthlyPrice: 4999,
    features: [
      'Responsive tasarim',
      '5 sayfa web sitesi',
      'Temel SEO optimizasyonu',
      'Iletisim formu',
      'SSL sertifikasi',
      '1 ay ucretsiz destek',
    ],
    highlighted: false,
    ctaText: 'Hemen Basla',
  },
  {
    id: 'profesyonel',
    name: 'Profesyonel',
    description:
      'Buyuyen isletmeler icin kapsamli ve profesyonel cozumler.',
    monthlyPrice: 9999,
    features: [
      'Responsive tasarim',
      '15 sayfa web sitesi',
      'Gelismis SEO optimizasyonu',
      'Blog & icerik yonetimi',
      'E-posta entegrasyonu',
      'Performans optimizasyonu',
      'Sosyal medya entegrasyonu',
      '3 ay ucretsiz destek',
    ],
    highlighted: true,
    ctaText: 'En Populer Plan',
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    description:
      'Buyuk olcekli projeler ve kurumsal firmalar icin ozel cozumler.',
    monthlyPrice: 19999,
    features: [
      'Responsive tasarim',
      'Sinirsiz sayfa',
      'Full SEO paketi',
      'E-ticaret entegrasyonu',
      'Ozel yazilim gelistirme',
      'API entegrasyonlari',
      'A/B test altyapisi',
      'Oncelikli 7/24 destek',
      'Aylik performans raporu',
    ],
    highlighted: false,
    ctaText: 'Iletisime Gec',
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR').format(price);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-bg-mid py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-accent-orange/3 blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-accent-blue/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Fiyatlandirma"
          title="Fiyatlandirma"
          subtitle="Projenizin buyuklugune ve ihtiyaclarina uygun esnek fiyatlandirma secenekleri. Yillik planlarda %20 indirim firsati."
          gradientTitle
          parallax
          align="center"
        />

        {/* Monthly / Yearly Toggle */}
        <div className="mb-12 flex items-center justify-center gap-4 sm:mb-16">
          <span
            className={cn(
              'text-sm font-medium transition-colors duration-300',
              !isYearly ? 'text-text-main' : 'text-text-muted'
            )}
          >
            Aylik
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={isYearly}
            aria-label="Yillik fiyatlandirmaya gec"
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              'relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange',
              isYearly ? 'bg-accent-orange' : 'bg-white/20'
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300',
                isYearly ? 'translate-x-8' : 'translate-x-1'
              )}
            />
          </button>

          <span
            className={cn(
              'text-sm font-medium transition-colors duration-300',
              isYearly ? 'text-text-main' : 'text-text-muted'
            )}
          >
            Yillik
          </span>

          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-accent-orange/20 px-3 py-1 text-xs font-semibold text-accent-orange"
            >
              %20 Indirim
            </motion.span>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <motion.div
          className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {pricingTiers.map((tier) => {
            const price = isYearly
              ? Math.round(tier.monthlyPrice * 12 * 0.8)
              : tier.monthlyPrice;

            return (
              <motion.div key={tier.id} variants={itemVariants}>
                <GlassCard
                  className={cn(
                    'flex h-full flex-col overflow-hidden',
                    tier.highlighted &&
                      'border-accent-orange/50 shadow-[0_0_40px_rgba(255,107,43,0.15)]'
                  )}
                  hoverEffect={!tier.highlighted}
                  padding="none"
                >
                  {/* En Populer Badge */}
                  {tier.highlighted && (
                    <div className="bg-accent-orange py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
                      En Populer
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    {/* Tier Name */}
                    <h3 className="mb-2 font-display text-xl font-semibold text-text-main">
                      {tier.name}
                    </h3>

                    <p className="mb-6 text-sm leading-relaxed text-text-muted">
                      {tier.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <motion.span
                          key={isYearly ? `${tier.id}-yearly` : `${tier.id}-monthly`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="font-display text-4xl font-bold text-text-main"
                        >
                          {formatPrice(price)}
                        </motion.span>
                        <span className="text-lg text-text-muted">&#8378;</span>
                      </div>
                      <span className="text-sm text-text-muted">
                        / {isYearly ? 'yil' : 'ay'}
                      </span>
                      {isYearly && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-1 text-xs text-text-muted"
                        >
                          Aylik{' '}
                          <span className="line-through">
                            {formatPrice(tier.monthlyPrice * 12)}&#8378;
                          </span>{' '}
                          yerine
                        </motion.p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="mb-6 h-px bg-white/10" />

                    {/* Features */}
                    <ul className="mb-8 flex-1 space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm text-text-muted"
                        >
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-orange" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <GlowButton
                      variant={tier.highlighted ? 'solid' : 'glass'}
                      size="md"
                      href="/iletisim"
                      className="w-full justify-center"
                    >
                      {tier.ctaText}
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
