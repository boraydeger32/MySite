import type { Metadata } from 'next';
import {
  ShoppingCart,
  CreditCard,
  Package,
  Smartphone,
  Search,
  BarChart3,
  Truck,
  Shield,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Paintbrush,
  Headphones,
  Code2,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import GlowButton from '@/components/ui/GlowButton';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'E-Ticaret Cozumleri',
  description:
    'Guclu e-ticaret platformlari ile online satis yapin. Odeme entegrasyonu, stok yonetimi, mobil uyumlu tasarim ve SEO optimizasyonu ile satisinizi artirin.',
  openGraph: {
    title: 'E-Ticaret Cozumleri | DevSpark Yazilim',
    description:
      'Modern e-ticaret cozumleri ile online satisinizi maksimuma cikarin. Odeme, stok, kargo entegrasyonlari hazir.',
    url: 'https://devspark.com.tr/hizmetler/e-ticaret',
  },
};

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Odeme Entegrasyonu',
    description:
      'Iyzico, PayTR, Stripe ve banka sanal pos entegrasyonlari ile guvenli online odeme altyapisi. Taksit secenekleri ve 3D Secure destegi.',
  },
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Stok Yonetimi',
    description:
      'Gelismis stok takip sistemi ile urunlerinizi kolayca yonetin. Otomatik stok uyarilari ve toplu urun guncelleme ozelligi.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Mobil Uyumlu',
    description:
      'Tum cihazlarda mukemmel alisveris deneyimi sunan responsive tasarim. Mobil kullanicilarin oranini artirin.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'SEO Optimizasyonu',
    description:
      'Urun sayfalari, kategori sayfalar ve blog icerikleri icin kapsamli SEO altyapisi. Google\'da ust siralarda yer alin.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Satis Analitikleri',
    description:
      'Detayli satis raporlari, musteri davranisi analizi ve donusum orani takibi ile veriye dayali kararlar alin.',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Kargo Entegrasyonu',
    description:
      'Yurtici, Aras, MNG, Surat ve diger kargo firmalaryla otomatik entegrasyon. Takip numarasi ve bildirimler otomatik.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Guvenli Alisveris',
    description:
      'SSL sertifikasi, PCI DSS uyumluluk ve gelismis guvenlik onlemleri ile musterilerinizin verilerini koruyun.',
  },
  {
    icon: <ShoppingCart className="h-6 w-6" />,
    title: 'Sepet & Siparis Yonetimi',
    description:
      'Kullanici dostu sepet deneyimi, siparis takibi, otomatik e-posta bildirimleri ve iade yonetim sistemi.',
  },
];

const benefits = [
  '7/24 online satis imkani',
  'Dukkansiz genis kitlelere ulasma',
  'Otomatik stok ve siparis yonetimi',
  'Detayli musteri ve satis analitikleri',
  'Dusuk isletme maliyetleri',
  'Kargo firmasi entegrasyonlari',
  'Taksitli odeme secenekleri',
  'Mobil alisveris deneyimi',
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
    title: 'Ihtiyac Analizi',
    description:
      'Urun yelpazesini, hedef kitlenizi ve pazar dinamiklerini analiz ederek en uygun e-ticaret stratejisini belirliyoruz.',
    icon: <Search className="h-6 w-6" />,
  },
  {
    step: '02',
    title: 'UI/UX Tasarim',
    description:
      'Donusum odakli, kullanici dostu ve markaniza ozel arayuz tasarimlari hazirliyoruz. Alisveris deneyimini optimize ediyoruz.',
    icon: <Paintbrush className="h-6 w-6" />,
  },
  {
    step: '03',
    title: 'Gelistirme & Entegrasyon',
    description:
      'E-ticaret platformunuzu kodluyor, odeme, kargo ve stok entegrasyonlarini tamamliyoruz.',
    icon: <Code2 className="h-6 w-6" />,
  },
  {
    step: '04',
    title: 'Test & Yayinlama',
    description:
      'Kapsamli test sureclerinin ardindan magazanizi yayina aliyoruz. Surekli destek ve optimizasyon sagliyoruz.',
    icon: <Headphones className="h-6 w-6" />,
  },
];

export default function ETicaretPage() {
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
              <span className="mb-6 inline-block rounded-full border border-accent-purple/30 bg-accent-purple/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-purple">
                E-Ticaret Cozumleri
              </span>

              {/* Title */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
                Profesyonel{' '}
                <span className="bg-gradient-to-r from-accent-purple via-accent-orange to-accent-blue bg-clip-text text-transparent">
                  E-Ticaret
                </span>{' '}
                Platformu
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-lg leading-relaxed text-text-muted sm:text-xl">
                Online satisinizi maksimuma cikarin. Modern e-ticaret altyapimiz ile odeme,
                kargo, stok yonetimi ve daha fazlasini tek platformda birlestirin.
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <GlowButton href="/iletisim" variant="solid" size="lg">
                  <Zap className="h-5 w-5" />
                  E-Ticaret Kurun
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
          <div className="absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-accent-orange/3 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Ozellikler"
            title="Neden E-Ticaret?"
            subtitle="Guclu altyapi ve zengin ozellik seti ile online satisinizi bir ust seviyeye tasiyoruz."
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
                <div className="group h-full rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-accent-purple/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  {/* Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-purple/10 text-accent-purple transition-colors duration-300 group-hover:bg-accent-purple/20">
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
          <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent-purple/3 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Surecimiz"
            title="E-Ticaret Yolculugunuz"
            subtitle="Fikrinizden yayina, sistematik bir surecle e-ticaret platformunuzu hayata geciriyoruz."
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-purple/10 text-accent-purple">
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
            {/* Left: Content */}
            <ScrollReveal direction="left">
              <div>
                <span className="mb-4 inline-block rounded-full border border-accent-purple/30 bg-accent-purple/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-purple">
                  Avantajlar
                </span>
                <h2 className="mb-6 font-display text-3xl font-bold text-text-main sm:text-4xl">
                  E-Ticaret ile{' '}
                  <span className="bg-gradient-to-r from-accent-purple to-accent-orange bg-clip-text text-transparent">
                    Sinirsiz Satis
                  </span>
                </h2>
                <p className="mb-8 text-base leading-relaxed text-text-muted sm:text-lg">
                  E-ticaret platformumuz sadece bir online magaza degil, isletmeniz icin guclu bir
                  satis ve yonetim araci. Fiziksel sinirlamalarin otesine gecin, 7/24 satis yapin.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-purple" />
                      <span className="text-sm text-text-muted">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Visual Placeholder */}
            <ScrollReveal direction="right">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-accent-purple/10 via-bg-mid to-accent-orange/10 p-1">
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-bg-dark/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-purple/10">
                      <ShoppingCart className="h-10 w-10 text-accent-purple" />
                    </div>
                    <p className="text-lg font-semibold text-text-main">E-Ticaret Onizleme</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Demo magazamizi incelemek icin iletisime gecin
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
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-accent-purple/10 via-white/5 to-accent-orange/10 p-8 backdrop-blur-xl sm:p-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
                <div className="text-center lg:text-left">
                  <h3 className="mb-2 font-display text-2xl font-bold text-text-main sm:text-3xl">
                    Online Mağazanızı Kurun
                  </h3>
                  <p className="max-w-lg text-base text-text-muted">
                    E-ticaret projeleriniz icin isletme buyuklugunuze ve ihtiyaclariniza gore
                    ozellestirilmis fiyat teklifleri sunuyoruz.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <div className="text-center">
                    <div className="font-display text-4xl font-extrabold text-accent-purple">
                      ₺14.999
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
          <div className="absolute inset-0 bg-gradient-to-t from-accent-purple/5 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="mb-6 font-display text-3xl font-bold text-text-main sm:text-4xl lg:text-5xl">
              Online Satis{' '}
              <span className="bg-gradient-to-r from-accent-purple to-accent-orange bg-clip-text text-transparent">
                Maceraniza
              </span>{' '}
              Baslayin
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              E-ticaret platformunuzu kurmak icin hemen iletisime gecin. Uzman ekibimiz
              isletmenize ozel bir cozum tasarlayarak sizi online satisa hazirlassin.
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
