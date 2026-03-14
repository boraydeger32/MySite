'use client';

import { motion } from 'framer-motion';
import { QrCode, Globe, ShoppingCart, Code2 } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import ServiceCard from '@/components/ui/ServiceCard';

interface ServiceItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const services: ServiceItem[] = [
  {
    id: 'qr-menu',
    icon: <QrCode className="h-7 w-7" />,
    title: 'QR Menu Sistemleri',
    description:
      'Restoranlariniz icin modern, hizli ve hijyenik dijital menu cozumleri. Anlik guncelleme, coklu dil destegi ve analitik paneli ile isletmenizi dijitallestirin.',
    href: '/hizmetler/qr-menu',
  },
  {
    id: 'kurumsal-web',
    icon: <Globe className="h-7 w-7" />,
    title: 'Kurumsal Web Siteleri',
    description:
      'Markanizi en iyi sekilde yansitan, SEO uyumlu ve mobil oncelikli kurumsal web siteleri. Profesyonel tasarim ve yuksek performans bir arada.',
    href: '/hizmetler/kurumsal-web',
  },
  {
    id: 'e-ticaret',
    icon: <ShoppingCart className="h-7 w-7" />,
    title: 'E-Ticaret Cozumleri',
    description:
      'Guvenli odeme altyapisi, stok yonetimi ve kullanici dostu arayuz ile online satis platformunuzu kurun. Satisinizi dijitale tasiyin.',
    href: '/hizmetler/e-ticaret',
  },
  {
    id: 'ozel-yazilim',
    icon: <Code2 className="h-7 w-7" />,
    title: 'Ozel Yazilim Gelistirme',
    description:
      'Isletmenizin benzersiz ihtiyaclarina ozel yazilim cozumleri. CRM, ERP, otomasyon sistemleri ve daha fazlasi icin yaninizdayiz.',
    href: '/hizmetler/yazilim',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-bg-dark py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent-purple/3 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-blue/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Hizmetlerimiz"
          title="Neler Yapiyoruz?"
          subtitle="Isletmenizin dijital donusumunu hizlandirmak icin kapsamli yazilim ve web cozumleri sunuyoruz."
          gradientTitle
          parallax
          align="center"
        />

        {/* Service Cards Grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={itemVariants}>
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                href={service.href}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
