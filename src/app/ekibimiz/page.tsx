import type { Metadata } from 'next';
import { Zap, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';
import GlowButton from '@/components/ui/GlowButton';
import TeamGrid from './TeamGrid';

export const metadata: Metadata = {
  title: 'Ekibimiz',
  description:
    'DevSpark Yazilim ekibini taniyin. Deneyimli yazilimcilar, tasarimcilar ve proje yoneticilerimiz ile projelerinizi hayata geciriyoruz.',
  openGraph: {
    title: 'Ekibimiz | DevSpark Yazilim',
    description:
      'Deneyimli ve tutkulu ekibimizi taniyin. Her biri alaninda uzman profesyonellerden olusan guclu bir takimiz.',
    url: 'https://devspark.com.tr/ekibimiz',
  },
};

const values = [
  {
    title: 'Inovasyon',
    description:
      'En son teknolojileri takip ediyor ve projelerimizde yenilikci cozumler uretiyoruz.',
    gradient: 'from-accent-orange to-accent-purple',
  },
  {
    title: 'Kalite',
    description:
      'Her projede en yuksek kalite standartlarini hedefliyor, kod kalitesinden tasarima kadar her detaya onem veriyoruz.',
    gradient: 'from-accent-blue to-accent-purple',
  },
  {
    title: 'Isbirligi',
    description:
      'Musterilerimizle yakin isbirligi icinde calisiyor, seffaf iletisim ile projeleri basariya ulastiriyoruz.',
    gradient: 'from-accent-purple to-accent-orange',
  },
];

export default function EkibimizPage() {
  return (
    <div className="bg-bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pb-28">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-bg-dark to-accent-purple/10" />
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/8 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-purple/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <span className="mb-6 inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
                Ekibimiz
              </span>

              {/* Title */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
                Tutkulu ve{' '}
                <span className="bg-gradient-to-r from-accent-orange via-accent-purple to-accent-blue bg-clip-text text-transparent">
                  Deneyimli
                </span>{' '}
                Ekibimiz
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-lg leading-relaxed text-text-muted sm:text-xl">
                Her biri alaninda uzman profesyonellerden olusan ekibimiz, projelerinizi
                hayata gecirmek icin burada. Yenilikci fikirler ve kaliteli cozumler icin
                birlikte calisiyoruz.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-blue/3 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/3 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Takim"
            title="Ekibimizi Taniyin"
            subtitle="Farkli uzmanlik alanlarina sahip deneyimli ekibimiz, her projede en iyi sonucu elde etmek icin bir arada calisiyor."
            gradientTitle
            parallax
            align="center"
          />

          <TeamGrid />
        </div>
      </section>

      {/* Values Section */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-accent-orange/3 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Degerlerimiz"
            title="Bizi Biz Yapan Degerler"
            subtitle="Ekip olarak paylastigimiz degerler, her projemize yansir ve basarimizin temelini olusturur."
            gradientTitle
            parallax
            align="center"
          />

          <ScrollReveal
            stagger={0.15}
            className="grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {values.map((value) => (
              <ScrollRevealItem key={value.title}>
                <div className="group relative h-full rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]">
                  {/* Gradient accent top bar */}
                  <div
                    className={`absolute left-0 top-0 h-1 w-full rounded-t-xl bg-gradient-to-r ${value.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  <h3 className="mb-3 font-display text-xl font-semibold text-text-main">
                    {value.title}
                  </h3>
                  <p className="text-base leading-relaxed text-text-muted">
                    {value.description}
                  </p>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-accent-orange/5 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="mb-6 font-display text-3xl font-bold text-text-main sm:text-4xl lg:text-5xl">
              Ekibimizle{' '}
              <span className="bg-gradient-to-r from-accent-orange to-accent-purple bg-clip-text text-transparent">
                Tanisin
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              Projeniz hakkinda konusmak ve ekibimizle tanismak ister misiniz? Bize ulasin,
              birlikte neler yapabileceğimizi konusalim.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <GlowButton href="/iletisim" variant="solid" size="lg">
                <Zap className="h-5 w-5" />
                Iletisime Gecin
              </GlowButton>
              <GlowButton href="/referanslar" variant="glass" size="lg">
                <ArrowRight className="h-5 w-5" />
                Projelerimizi Inceleyin
              </GlowButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
