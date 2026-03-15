import type { Metadata } from 'next';
import {
  Globe,
  Search,
  Smartphone,
  Gauge,
  Paintbrush,
  Lock,
  BarChart3,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Layers,
  Code2,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import GlowButton from '@/components/ui/GlowButton';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Kurumsal Web Siteleri',
  description:
    'Markanizi en iyi sekilde yansitan, SEO uyumlu ve mobil oncelikli kurumsal web siteleri. Profesyonel tasarim ve yuksek performans bir arada.',
  openGraph: {
    title: 'Kurumsal Web Siteleri | DevSpark Yazilim',
    description:
      'SEO uyumlu, mobil oncelikli ve profesyonel tasarimli kurumsal web siteleri ile markanizi dijitalde guclendirin.',
    url: 'https://devspark.com.tr/hizmetler/kurumsal-web',
  },
};

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Search className="h-6 w-6" />,
    title: 'SEO Uyumlu',
    description:
      'Google arama sonuclarinda ust siralarda yer almaniz icin teknik SEO altyapisi ve icerik optimizasyonu.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Mobil Oncelikli',
    description:
      'Tum cihazlarda mukemmel gorunen responsive tasarim. Mobil kullanicilar icin optimize edilmis deneyim.',
  },
  {
    icon: <Gauge className="h-6 w-6" />,
    title: 'Yuksek Performans',
    description:
      'Hizli yukleme sureleri ve optimum performans. Lighthouse skorlarinda yuksek puanlar hedefliyoruz.',
  },
  {
    icon: <Paintbrush className="h-6 w-6" />,
    title: 'Modern Tasarim',
    description:
      'Markanizin kimligine uygun, guncel trendleri takip eden, etkileyici ve kullanici dostu arayuz tasarimi.',
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'SSL Guvenlik',
    description:
      'SSL sertifikasi, guvenli baglanti ve veri koruma standartlari ile ziyaretcilerinizin guvenligi oncelikli.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Analitik Entegrasyonu',
    description:
      'Google Analytics ve diger analitik araclarla ziyaretci davranislarini takip edin, veriye dayali kararlar alin.',
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: 'Icerik Yonetimi',
    description:
      'Kolay kullanilir yonetim paneli ile iceriklerinizi teknik bilgiye ihtiyac duymadan guncelleyin.',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'Teknik Destek',
    description:
      'Proje teslimi sonrasinda da yaninizdayiz. 7/24 teknik destek ve duzenli bakim hizmetleri.',
  },
];

const benefits = [
  'Profesyonel marka imaji olusturma',
  'Arama motorlarinda ust siralarda yer alma',
  'Musteri guvenini artirma',
  '7/24 online vitrin olarak calisan site',
  'Rakiplerinizden bir adim onde olma',
  'Sosyal medya entegrasyonu',
  'Hizli ve guvenli hosting altyapisi',
  'Olceklenebilir ve genisletilebilir yapi',
];

interface ProcessStep {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const processSteps: ProcessStep[] = [
  {
    step: '01',
    title: 'Analiz & Planlama',
    description:
      'Isletmenizi, hedef kitlenizi ve rakiplerinizi analiz ederek proje yol haritasini cikariyoruz.',
    icon: <Search className="h-6 w-6" />,
  },
  {
    step: '02',
    title: 'Tasarim',
    description:
      'Markaniza ozel, modern ve kullanici deneyimi odakli arayuz tasarimlari hazirliyoruz.',
    icon: <Paintbrush className="h-6 w-6" />,
  },
  {
    step: '03',
    title: 'Gelistirme',
    description:
      'En guncel teknolojilerle hizli, guvenli ve olceklenebilir web sitenizi kodluyoruz.',
    icon: <Code2 className="h-6 w-6" />,
  },
  {
    step: '04',
    title: 'Yayinlama & Destek',
    description:
      'Test sureclerinin ardindan sitenizi yayina aliyoruz ve surekli destek sagliyoruz.',
    icon: <Headphones className="h-6 w-6" />,
  },
];

export default function KurumsalWebPage() {
  return (
    <div className="bg-bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pb-28">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-bg-dark to-accent-purple/10" />
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/8 blur-[150px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent-purple/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <span className="mb-6 inline-block rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-blue">
                Kurumsal Cozumler
              </span>

              {/* Title */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
                Kurumsal{' '}
                <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-orange bg-clip-text text-transparent">
                  Web Sitesi
                </span>{' '}
                Tasarimi
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-lg leading-relaxed text-text-muted sm:text-xl">
                Markanizi dijital dunyada en iyi sekilde temsil edecek, profesyonel ve
                etkileyici kurumsal web siteleri tasarliyoruz. SEO uyumlu, hizli ve guvenli.
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <GlowButton href="/iletisim" variant="solid" size="lg">
                  <Zap className="h-5 w-5" />
                  Proje Baslat
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
          <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-accent-purple/3 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Ozellikler"
            title="Neden Kurumsal Web Sitesi?"
            subtitle="Isletmenizin online varligini guclendiren, profesyonel ve kaliteli web siteleri olusturuyoruz."
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
                <div className="group h-full rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-accent-blue/30 hover:shadow-[0_0_30px_rgba(0,212,255,0.1)]">
                  {/* Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue transition-colors duration-300 group-hover:bg-accent-blue/20">
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

      {/* Process Section */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent-blue/3 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Surecimiz"
            title="Nasil Calisiyoruz?"
            subtitle="Projelerimizi 4 asamali, sistematik bir surecle hayata geciriyoruz."
            gradientTitle
            parallax
            align="center"
          />

          <ScrollReveal
            stagger={0.15}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {processSteps.map((step) => (
              <ScrollRevealItem key={step.step}>
                <div className="relative h-full rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  {/* Step number */}
                  <div className="mb-4 font-display text-5xl font-extrabold text-white/5">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 font-display text-lg font-semibold text-text-main">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-text-muted">
                    {step.description}
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
            {/* Left: Visual Placeholder */}
            <ScrollReveal direction="left">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-accent-blue/10 via-bg-mid to-accent-purple/10 p-1">
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-bg-dark/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-blue/10">
                      <Globe className="h-10 w-10 text-accent-blue" />
                    </div>
                    <p className="text-lg font-semibold text-text-main">Kurumsal Web Onizleme</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Referanslarimizi incelemek icin tiklayın
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Content */}
            <ScrollReveal direction="right">
              <div>
                <span className="mb-4 inline-block rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-blue">
                  Avantajlar
                </span>
                <h2 className="mb-6 font-display text-3xl font-bold text-text-main sm:text-4xl">
                  Kurumsal Web Sitesi ile{' '}
                  <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                    Farkinizi Ortaya Koyun
                  </span>
                </h2>
                <p className="mb-8 text-base leading-relaxed text-text-muted sm:text-lg">
                  Profesyonel bir kurumsal web sitesi, isletmenizin dijital kartviziti olarak calısır.
                  Dogru tasarim ve teknik altyapi ile markanizi bir ust seviyeye tasiyoruz.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-blue" />
                      <span className="text-sm text-text-muted">{benefit}</span>
                    </div>
                  ))}
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
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-accent-blue/10 via-white/5 to-accent-purple/10 p-8 backdrop-blur-xl sm:p-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
                <div className="text-center lg:text-left">
                  <h3 className="mb-2 font-display text-2xl font-bold text-text-main sm:text-3xl">
                    Butcenize Uygun Cozumler
                  </h3>
                  <p className="max-w-lg text-base text-text-muted">
                    Kurumsal web sitesi projelerimiz isletmenizin ihtiyaclarina ve butcesine gore
                    ozellestirilir. Detayli fiyat teklifi icin bize ulasin.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <div className="text-center">
                    <div className="font-display text-4xl font-extrabold text-accent-blue">
                      ₺7.999
                    </div>
                    <p className="text-sm text-text-muted">baslayan fiyatlarla</p>
                  </div>
                  <GlowButton href="/iletisim" variant="solid" size="lg">
                    <Users className="h-5 w-5" />
                    Teklif Isteyin
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
          <div className="absolute inset-0 bg-gradient-to-t from-accent-blue/5 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="mb-6 font-display text-3xl font-bold text-text-main sm:text-4xl lg:text-5xl">
              Dijital Dunyada{' '}
              <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                Profesyonel
              </span>{' '}
              Yerinizi Alin
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              Markaniza ozel, modern ve etkili bir kurumsal web sitesi icin hemen iletisime gecin.
              Uzman ekibimiz projenizi en kisa surede hayata gecirsin.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <GlowButton href="/iletisim" variant="solid" size="lg">
                <Zap className="h-5 w-5" />
                Ucretsiz Danismanlik
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
