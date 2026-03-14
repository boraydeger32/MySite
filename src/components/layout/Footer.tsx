'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaXTwitter, FaInstagram } from 'react-icons/fa6';
import NewsletterForm from '@/components/forms/NewsletterForm';
import { cn } from '@/lib/utils';

const SERVICE_LINKS = [
  { label: 'QR Menu Sistemi', href: '/hizmetler/qr-menu' },
  { label: 'Kurumsal Web Sitesi', href: '/hizmetler/kurumsal-web' },
  { label: 'E-Ticaret Cozumleri', href: '/hizmetler/e-ticaret' },
  { label: 'Ozel Yazilim', href: '/hizmetler/yazilim' },
];

const QUICK_LINKS = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Hizmetler', href: '/hizmetler' },
  { label: 'Referanslar', href: '/referanslar' },
  { label: 'Ekibimiz', href: '/ekibimiz' },
  { label: 'Blog', href: '/blog' },
  { label: 'Iletisim', href: '/iletisim' },
];

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/devsparktr',
    icon: FaGithub,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/devspark-yazilim',
    icon: FaLinkedinIn,
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/devsparktr',
    icon: FaXTwitter,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/devsparktr',
    icon: FaInstagram,
  },
];

const CONTACT_INFO = [
  {
    icon: MapPin,
    text: 'Maslak Mah., Buyukdere Cad. No:123 Sariyer/Istanbul',
  },
  {
    icon: Phone,
    text: '+90 (212) 000 00 00',
    href: 'tel:+902120000000',
  },
  {
    icon: Mail,
    text: 'info@devspark.com.tr',
    href: 'mailto:info@devspark.com.tr',
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-bg-dark">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-accent-orange/5 blur-[100px]" />
        <div className="absolute -top-32 right-1/4 h-64 w-64 rounded-full bg-accent-purple/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-16"
        >
          {/* Column 1: Logo & Description */}
          <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="group mb-4 inline-flex items-center gap-2"
              aria-label="DevSpark Anasayfa"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-orange/10 transition-colors group-hover:bg-accent-orange/20">
                <Zap className="h-5 w-5 text-accent-orange" />
              </span>
              <span className="font-display text-xl font-bold text-text-main">
                Dev
                <span className="text-accent-orange">Spark</span>
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-text-muted">
              Dijital donusumunuzu guclu ve yenilikci yazilim cozumleriyle gerceklestiriyoruz.
              QR Menu, Kurumsal Web, E-Ticaret ve Ozel Yazilim hizmetleri.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    'border border-white/10 bg-white/5',
                    'text-text-muted transition-all duration-300',
                    'hover:border-accent-orange/50 hover:bg-accent-orange/10 hover:text-accent-orange hover:shadow-[0_0_15px_rgba(255,107,43,0.2)]'
                  )}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Hizmetler */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-main">
              Hizmetler
            </h3>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent-orange"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Hizli Linkler */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-main">
              Hizli Linkler
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent-orange"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Iletisim */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-main">
              Iletisim
            </h3>
            <ul className="mb-6 space-y-3">
              {CONTACT_INFO.map((item) => {
                const content = (
                  <span className="flex items-start gap-2.5 text-sm text-text-muted transition-colors hover:text-text-main">
                    <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-orange" />
                    <span>{item.text}</span>
                  </span>
                );

                return (
                  <li key={item.text}>
                    {item.href ? (
                      <a href={item.href}>{content}</a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-text-main">
                Bultenimize Abone Olun
              </h4>
              <NewsletterForm />
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-6 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {currentYear} DevSpark Yazilim. Tum haklari saklidir.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/gizlilik-politikasi"
              className="text-xs text-text-muted transition-colors hover:text-accent-orange"
            >
              Gizlilik Politikasi
            </Link>
            <span className="text-white/10">|</span>
            <Link
              href="/kullanim-kosullari"
              className="text-xs text-text-muted transition-colors hover:text-accent-orange"
            >
              Kullanim Kosullari
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
