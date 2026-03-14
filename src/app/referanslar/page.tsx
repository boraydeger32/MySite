import type { Metadata } from 'next';
import { Zap, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GlowButton from '@/components/ui/GlowButton';
import PortfolioGrid from './PortfolioGrid';

export const metadata: Metadata = {
  title: 'Referanslarimiz',
  description:
    'DevSpark Yazilim olarak tamamladigimiz projeler ve referanslarimiz. QR Menu, Kurumsal Web, E-Ticaret ve Ozel Yazilim projelerimizi inceleyin.',
  openGraph: {
    title: 'Referanslarimiz | DevSpark Yazilim',
    description:
      'Basariyla tamamladigimiz QR Menu, Kurumsal Web, E-Ticaret ve Ozel Yazilim projelerimizi inceleyin.',
    url: 'https://devspark.com.tr/referanslar',
  },
};

export default function ReferanslarPage() {
  return (
    <div className="bg-bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pb-28">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-bg-dark to-accent-orange/10" />
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-purple/8 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-orange/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <span className="mb-6 inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
                Portfolyo
              </span>

              {/* Title */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
                Basariyla Tamamladigimiz{' '}
                <span className="bg-gradient-to-r from-accent-orange via-accent-purple to-accent-blue bg-clip-text text-transparent">
                  Projeler
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-lg leading-relaxed text-text-muted sm:text-xl">
                Her projede kalite ve musteri memnuniyetini on planda tutuyoruz. Farkli
                sektorlerden musterilerimize sundugumuz cozumleri inceleyin.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Portfolio Section with Filters */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-purple/3 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-orange/3 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Projelerimiz"
            title="Referanslarimiz"
            subtitle="Farkli sektorlerden musteri ihtiyaclarina ozel yazilim cozumleri urettik. Projelerimizi kategoriye gore filtreleyebilirsiniz."
            gradientTitle
            parallax
            align="center"
          />

          <PortfolioGrid />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {[
                { value: '150+', label: 'Tamamlanan Proje' },
                { value: '%98', label: 'Musteri Memnuniyeti' },
                { value: '50+', label: 'Aktif Musteri' },
                { value: '5+', label: 'Yillik Deneyim' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
                >
                  <div className="mb-2 font-display text-3xl font-extrabold text-accent-orange sm:text-4xl">
                    {stat.value}
                  </div>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
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
              Projenizi{' '}
              <span className="bg-gradient-to-r from-accent-orange to-accent-purple bg-clip-text text-transparent">
                Hayata Gecirelim
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              Sizin icin de basarili bir proje gelistirmek istiyoruz. Ekibimizle iletisime
              gecin, projenizi birlikte planlayalim.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <GlowButton href="/iletisim" variant="solid" size="lg">
                <Zap className="h-5 w-5" />
                Ucretsiz Teklif Alin
              </GlowButton>
              <GlowButton href="/hizmetler" variant="glass" size="lg">
                <ArrowRight className="h-5 w-5" />
                Hizmetlerimiz
              </GlowButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
