import type { Metadata } from 'next';
import {
  Code2,
  Blocks,
  Cloud,
  Database,
  Cpu,
  GitBranch,
  Shield,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Search,
  Paintbrush,
  Workflow,
  Settings,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import GlowButton from '@/components/ui/GlowButton';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Ozel Yazilim Gelistirme',
  description:
    'Isletmenize ozel yazilim cozumleri gelistiriyoruz. API entegrasyonu, bulut cozumler, veritabani tasarimi ve mikro servis mimarisi ile dijital donusumunuzu hizlandirin.',
  openGraph: {
    title: 'Ozel Yazilim Gelistirme | DevSpark Yazilim',
    description:
      'Isletmenize ozel, olceklenebilir ve yuksek performansli yazilim cozumleri. API, bulut, veritabani ve daha fazlasi.',
    url: 'https://devspark.com.tr/hizmetler/yazilim',
  },
};

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Code2 className="h-6 w-6" />,
    title: 'Ozel Yazilim Gelistirme',
    description:
      'Isletmenizin ihtiyaclarina ozel, sifirdan tasarlanan yazilim cozumleri. Hazir paketlerin otesinde, tam size uygun sistemler.',
  },
  {
    icon: <Blocks className="h-6 w-6" />,
    title: 'API Entegrasyonu',
    description:
      'Mevcut sistemlerinizi birbiriyle konusturun. RESTful ve GraphQL API gelistirme, ucuncu parti servis entegrasyonlari.',
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    title: 'Bulut Cozumler',
    description:
      'AWS, Google Cloud ve Azure uzerinde olceklenebilir bulut mimarileri. Yuksek erisilebilirlik ve maliyet optimizasyonu.',
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: 'Veritabani Tasarimi',
    description:
      'Yuksek performansli veritabani mimarisi. PostgreSQL, MongoDB, Redis ve diger teknolojilerle optimize edilmis veri yonetimi.',
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    title: 'Mikro Servis Mimarisi',
    description:
      'Olceklenebilir ve bagimsiz deploy edilebilen mikro servisler. Konteyner teknolojileri ile modern altyapi.',
  },
  {
    icon: <GitBranch className="h-6 w-6" />,
    title: 'DevOps & CI/CD',
    description:
      'Otomatik test, build ve deploy surecleri. GitHub Actions, Docker ve Kubernetes ile kesintisiz gelistirme dongusu.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Guvenlik & Uyumluluk',
    description:
      'OWASP standartlarinda guvenlik, veri sifreleme ve KVKK uyumlu yazilim gelistirme pratikleri.',
  },
  {
    icon: <Workflow className="h-6 w-6" />,
    title: 'Is Sureci Otomasyonu',
    description:
      'Tekrarlayan is sureclerini otomatiklestirin. Verimlilik artisi ve insan hatasi minimizasyonu icin akilli cozumler.',
  },
];

const benefits = [
  'Isletmeye ozel, esnek cozumler',
  'Olceklenebilir ve surdurulebilir mimari',
  'Mevcut sistemlerle sorunsuz entegrasyon',
  'Yuksek performans ve guvenilirlik',
  'Agile/Scrum metodolojisi ile gelistirme',
  'Kapsamli dokumantasyon',
  'Surekli destek ve bakim',
  'Kaynak kodu mulkiyeti size ait',
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
    title: 'Kesif & Analiz',
    description:
      'Isletmenizin mevcut sureclerini, ihtiyaclarini ve hedeflerini derinlemesine analiz ediyoruz. Teknik gereksinim dokumani hazirliyoruz.',
    icon: <Search className="h-6 w-6" />,
  },
  {
    step: '02',
    title: 'Mimari & Tasarim',
    description:
      'Sistem mimarisini, veritabani semasiini ve kullanici arayuzunu tasarliyoruz. Prototip ile onay aliyoruz.',
    icon: <Paintbrush className="h-6 w-6" />,
  },
  {
    step: '03',
    title: 'Agile Gelistirme',
    description:
      '2 haftalik sprintlerle iteratif gelistirme. Her sprint sonunda calisir yazilim teslim ediyoruz, geri bildirimlerinizi entegre ediyoruz.',
    icon: <Code2 className="h-6 w-6" />,
  },
  {
    step: '04',
    title: 'Test & Deploy',
    description:
      'Kapsamli test surecleri (unit, integration, e2e) ve otomatik CI/CD pipeline ile guvenli yayinlama. Surekli izleme ve optimizasyon.',
    icon: <Settings className="h-6 w-6" />,
  },
];

export default function YazilimPage() {
  return (
    <div className="bg-bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pb-28">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-bg-dark to-accent-orange/10" />
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/8 blur-[150px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent-orange/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <span className="mb-6 inline-block rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-blue">
                Ozel Yazilim
              </span>

              {/* Title */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
                Ozel{' '}
                <span className="bg-gradient-to-r from-accent-blue via-accent-orange to-accent-purple bg-clip-text text-transparent">
                  Yazilim
                </span>{' '}
                Gelistirme
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-lg leading-relaxed text-text-muted sm:text-xl">
                Isletmenizin benzersiz ihtiyaclarina ozel yazilim cozumleri gelistiriyoruz.
                API entegrasyonlarindan bulut mimarilerine, fikrinizi gercege donusturuyoruz.
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <GlowButton href="/iletisim" variant="solid" size="lg">
                  <Zap className="h-5 w-5" />
                  Projenizi Anlatın
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
          <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-accent-orange/3 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Ozellikler"
            title="Neler Yapiyoruz?"
            subtitle="Modern teknolojiler ve en iyi pratiklerle isletmenize deger katan yazilim cozumleri."
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
            title="Gelistirme Surecimiz"
            subtitle="Agile metodoloji ile seffaf ve verimli bir gelistirme sureci izliyoruz."
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
          <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent-orange/5 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Visual Placeholder */}
            <ScrollReveal direction="left">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-accent-blue/10 via-bg-mid to-accent-orange/10 p-1">
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-bg-dark/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-blue/10">
                      <Code2 className="h-10 w-10 text-accent-blue" />
                    </div>
                    <p className="text-lg font-semibold text-text-main">Yazilim Cozumleri</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Projelerimizi incelemek icin referanslar sayfasini ziyaret edin
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
                  Ozel Yazilim ile{' '}
                  <span className="bg-gradient-to-r from-accent-blue to-accent-orange bg-clip-text text-transparent">
                    Rekabet Avantaji
                  </span>
                </h2>
                <p className="mb-8 text-base leading-relaxed text-text-muted sm:text-lg">
                  Hazir yazilimlar isletmenizin benzersiz sureclerine tam uyum saglamaz. Ozel
                  yazilim ile is sureclerinizi optimize edin, verimliligizi artirin ve
                  rakiplerinizin onune gecin.
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
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-accent-blue/10 via-white/5 to-accent-orange/10 p-8 backdrop-blur-xl sm:p-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
                <div className="text-center lg:text-left">
                  <h3 className="mb-2 font-display text-2xl font-bold text-text-main sm:text-3xl">
                    Projenize Ozel Fiyatlandirma
                  </h3>
                  <p className="max-w-lg text-base text-text-muted">
                    Her yazilim projesi benzersizdir. Projenizin kapsamina, teknik gereksinimlerine
                    ve zaman cizelgesine gore ozel fiyat teklifi hazirliyoruz.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <div className="text-center">
                    <div className="font-display text-4xl font-extrabold text-accent-blue">
                      Ozel Teklif
                    </div>
                    <p className="text-sm text-text-muted">projenize ozel fiyatlandirma</p>
                  </div>
                  <GlowButton href="/iletisim" variant="solid" size="lg">
                    <Users className="h-5 w-5" />
                    Teklif Alin
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
              Fikrinizi{' '}
              <span className="bg-gradient-to-r from-accent-blue to-accent-orange bg-clip-text text-transparent">
                Yazilima
              </span>{' '}
              Donusturelim
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              Projenizi anlatın, uzman ekibimiz size en uygun teknoloji stack&apos;i ve cozum
              mimarisini onererek hemen gelistirmeye baslasın.
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
