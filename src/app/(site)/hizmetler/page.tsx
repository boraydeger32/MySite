import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode, Globe, ShoppingCart, Code2, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Hizmetlerimiz',
  description:
    'DevSpark Yazilim olarak QR Menu Sistemleri, Kurumsal Web Siteleri, E-Ticaret Cozumleri ve Ozel Yazilim Gelistirme hizmetleri sunuyoruz.',
  openGraph: {
    title: 'Hizmetlerimiz | DevSpark Yazilim',
    description:
      'QR Menu Sistemleri, Kurumsal Web Siteleri, E-Ticaret Cozumleri ve Ozel Yazilim Gelistirme hizmetleri.',
    url: 'https://devspark.com.tr/hizmetler',
  },
};

interface ServiceOverview {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  features: string[];
  gradient: string;
}

const services: ServiceOverview[] = [
  {
    id: 'qr-menu',
    icon: <QrCode className="h-8 w-8" />,
    title: 'QR Menu Sistemleri',
    description:
      'Restoranlariniz icin modern, hizli ve hijyenik dijital menu cozumleri. Anlik guncelleme, coklu dil destegi ve analitik paneli ile isletmenizi dijitallestirin.',
    href: '/hizmetler/qr-menu',
    features: ['Anlik Guncelleme', 'QR Kod Entegrasyonu', 'Mobil Uyumlu', 'Analitik Panel'],
    gradient: 'from-accent-orange to-accent-purple',
  },
  {
    id: 'kurumsal-web',
    icon: <Globe className="h-8 w-8" />,
    title: 'Kurumsal Web Siteleri',
    description:
      'Markanizi en iyi sekilde yansitan, SEO uyumlu ve mobil oncelikli kurumsal web siteleri. Profesyonel tasarim ve yuksek performans bir arada.',
    href: '/hizmetler/kurumsal-web',
    features: ['SEO Uyumlu', 'Mobil Oncelikli', 'Hizli Yukleme', 'Modern Tasarim'],
    gradient: 'from-accent-blue to-accent-purple',
  },
  {
    id: 'e-ticaret',
    icon: <ShoppingCart className="h-8 w-8" />,
    title: 'E-Ticaret Cozumleri',
    description:
      'Guvenli odeme altyapisi, stok yonetimi ve kullanici dostu arayuz ile online satis platformunuzu kurun. Satisinizi dijitale tasiyin.',
    href: '/hizmetler/e-ticaret',
    features: ['Guvenli Odeme', 'Stok Yonetimi', 'Kargo Entegrasyonu', 'Raporlama'],
    gradient: 'from-accent-purple to-accent-orange',
  },
  {
    id: 'ozel-yazilim',
    icon: <Code2 className="h-8 w-8" />,
    title: 'Ozel Yazilim Gelistirme',
    description:
      'Isletmenizin benzersiz ihtiyaclarina ozel yazilim cozumleri. CRM, ERP, otomasyon sistemleri ve daha fazlasi icin yaninizdayiz.',
    href: '/hizmetler/yazilim',
    features: ['CRM Sistemleri', 'ERP Cozumleri', 'Otomasyon', 'API Entegrasyonu'],
    gradient: 'from-accent-orange to-accent-blue',
  },
];

export default function HizmetlerPage() {
  return (
    <section className="relative overflow-hidden bg-bg-dark pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-20 h-[500px] w-[500px] rounded-full bg-accent-purple/5 blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-orange/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Cozumlerimiz"
          title="Hizmetlerimiz"
          subtitle="Isletmenizin dijital donusumunu hizlandirmak icin kapsamli yazilim ve web cozumleri sunuyoruz. Her projeye ozel yaklasimla en iyi sonuclari elde ediyoruz."
          gradientTitle
          parallax
          align="center"
        />

        {/* Service Cards Grid */}
        <ScrollReveal
          stagger={0.15}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2"
        >
          {services.map((service) => (
            <ScrollRevealItem key={service.id}>
              <Link href={service.href} className="group block h-full">
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_40px_rgba(255,107,43,0.12)]">
                  {/* Gradient accent top bar */}
                  <div
                    className={`absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-gradient-to-r ${service.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  {/* Icon */}
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent-orange/10 text-accent-orange transition-colors duration-300 group-hover:bg-accent-orange/20">
                    {service.icon}
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 font-display text-2xl font-semibold text-text-main">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-6 text-base leading-relaxed text-text-muted">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-text-muted"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent-orange transition-colors duration-300 group-hover:text-accent-blue">
                    <span>Detayli Incele</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
