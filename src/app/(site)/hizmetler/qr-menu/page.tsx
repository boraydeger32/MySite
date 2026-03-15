import type { Metadata } from 'next';
import {
  QrCode,
  Smartphone,
  RefreshCw,
  BarChart3,
  Globe2,
  Palette,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import GlowButton from '@/components/ui/GlowButton';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'QR Menu Sistemleri',
  description:
    'Restoranlariniz icin modern, hizli ve hijyenik dijital QR menu cozumleri. Anlik guncelleme, QR kod entegrasyonu ve analitik paneli ile isletmenizi dijitallestirin.',
  openGraph: {
    title: 'QR Menu Sistemleri | DevSpark Yazilim',
    description:
      'Modern, hizli ve hijyenik dijital QR menu cozumleri ile restoraninizi dijitallestirin.',
    url: 'https://devspark.com.tr/hizmetler/qr-menu',
  },
};

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Kolay Kullanim',
    description:
      'Musterileriniz telefonlariyla QR kodu okutarak saniyeler icinde menunuze ulasir. Uygulama indirmeye gerek yok.',
  },
  {
    icon: <RefreshCw className="h-6 w-6" />,
    title: 'Anlik Guncelleme',
    description:
      'Fiyat degisiklikleri, yeni urunler veya kampanyalar aninda menuye yansir. Basili menu maliyetlerinden kurtulun.',
  },
  {
    icon: <QrCode className="h-6 w-6" />,
    title: 'QR Kod Entegrasyonu',
    description:
      'Her masa icin ozel QR kodlar olusturun. Masa numarasi otomatik olarak siparise eklenir.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Analitik Panel',
    description:
      'Hangi urunler en cok goruntuleniyor, hangi saatlerde trafik yogun? Detayli istatistiklerle isletmenizi yonetin.',
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: 'Coklu Dil Destegi',
    description:
      'Turkce, Ingilizce, Arapca ve daha fazlasi. Turistlere ve yabanci musterilere kendi dillerinde hizmet verin.',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Ozellestirilabilir Tasarim',
    description:
      'Markanizin renkleri, logosu ve tasarim dili ile uyumlu, tamamen size ozel menu arayuzu.',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: '7/24 Erisim',
    description:
      'Menuye her yerden, her zaman erisilir. Bulut tabanli altyapimiz sayesinde kesintisiz hizmet.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Hijyenik Cozum',
    description:
      'Fiziksel menu temasi olmadan dijital menu ile hijyen standartlarinizi yukseltin.',
  },
];

const benefits = [
  'Basili menu maliyetlerinde %80 tasarruf',
  'Musteri memnuniyetinde artis',
  'Siparis surelerinde %40 kisalma',
  'Anlık kampanya ve duyuru imkani',
  'Cevre dostu, kagit israfini onleyin',
  'Profesyonel marka imaji',
  'Detayli musteri analitikleri',
  'Kolay yonetim paneli',
];

export default function QRMenuPage() {
  return (
    <div className="bg-bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pb-28">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/10 via-bg-dark to-accent-purple/10" />
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-orange/8 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-purple/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <span className="mb-6 inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
                QR Menu Cozumleri
              </span>

              {/* Title */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
                Dijital{' '}
                <span className="bg-gradient-to-r from-accent-orange via-accent-purple to-accent-blue bg-clip-text text-transparent">
                  QR Menu
                </span>{' '}
                Sistemi
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-lg leading-relaxed text-text-muted sm:text-xl">
                Restoraninizi dijital caga tasiyoruz. Modern QR menu sistemimiz ile
                musterilerinize hizli, hijyenik ve etkileyici bir menu deneyimi sunun.
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <GlowButton href="/iletisim" variant="solid" size="lg">
                  <Zap className="h-5 w-5" />
                  Ucretsiz Demo Isteyin
                </GlowButton>
                <GlowButton href="#features" variant="glass" size="lg">
                  Ozellikleri Kesfet
                </GlowButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-accent-blue/3 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Ozellikler"
            title="Neden QR Menu?"
            subtitle="Isletmenizi bir adim ileriye tasiyacak kapsamli ozelliklerle donattik."
            gradientTitle
            parallax
            align="center"
          />

          <ScrollReveal
            stagger={0.1}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <ScrollRevealItem key={feature.title}>
                <div className="group h-full rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]">
                  {/* Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-orange/10 text-accent-orange transition-colors duration-300 group-hover:bg-accent-orange/20">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 font-display text-lg font-semibold text-text-main">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-text-muted">
                    {feature.description}
                  </p>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent-purple/5 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Content */}
            <ScrollReveal direction="left">
              <div>
                <span className="mb-4 inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
                  Avantajlar
                </span>
                <h2 className="mb-6 font-display text-3xl font-bold text-text-main sm:text-4xl">
                  QR Menu ile Isletmenize{' '}
                  <span className="bg-gradient-to-r from-accent-orange to-accent-purple bg-clip-text text-transparent">
                    Deger Katin
                  </span>
                </h2>
                <p className="mb-8 text-base leading-relaxed text-text-muted sm:text-lg">
                  Dijital menu sistemi sadece bir menu degil, isletmeniz icin guclu bir
                  yonetim araci. Maliyet tasarrufundan musteri memnuniyetine kadar pek cok
                  avantaj sunuyoruz.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-orange" />
                      <span className="text-sm text-text-muted">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Visual Placeholder */}
            <ScrollReveal direction="right">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-accent-orange/10 via-bg-mid to-accent-purple/10 p-1">
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-bg-dark/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-orange/10">
                      <QrCode className="h-10 w-10 text-accent-orange" />
                    </div>
                    <p className="text-lg font-semibold text-text-main">QR Menu Onizleme</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Interaktif demo icin bizimle iletisime gecin
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing Callout */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-accent-orange/10 via-white/5 to-accent-purple/10 p-8 backdrop-blur-xl sm:p-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
                <div className="text-center lg:text-left">
                  <h3 className="mb-2 font-display text-2xl font-bold text-text-main sm:text-3xl">
                    Uygun Fiyatlarla Baslayın
                  </h3>
                  <p className="max-w-lg text-base text-text-muted">
                    QR Menu sistemimiz aylik abonelik modeli ile calismaktadir. Isletme buyuklugunuze
                    gore en uygun paketi secelim.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <div className="text-center">
                    <div className="font-display text-4xl font-extrabold text-accent-orange">
                      ₺499
                    </div>
                    <p className="text-sm text-text-muted">/ aylik baslayan fiyatlarla</p>
                  </div>
                  <GlowButton href="/iletisim" variant="solid" size="lg">
                    <Users className="h-5 w-5" />
                    Fiyat Teklifi Al
                  </GlowButton>
                </div>
              </div>
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
              Restoraninizi{' '}
              <span className="bg-gradient-to-r from-accent-orange to-accent-purple bg-clip-text text-transparent">
                Dijitallestirmeye
              </span>{' '}
              Hazir Misiniz?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              Ucretsiz demo ile QR Menu sistemimizi yakindan taniyin. Ekibimiz size ozel bir
              sunum hazirlayarak tum sorularinizi yanitlasin.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <GlowButton href="/iletisim" variant="solid" size="lg">
                <Zap className="h-5 w-5" />
                Hemen Baslayın
              </GlowButton>
              <GlowButton href="/hizmetler" variant="glass" size="lg">
                <ArrowRight className="h-5 w-5" />
                Diger Hizmetler
              </GlowButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
