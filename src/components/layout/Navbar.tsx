'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlowButton from '@/components/ui/GlowButton';
import MobileMenu from '@/components/layout/MobileMenu';

const NAV_LINKS = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Hizmetler', href: '/hizmetler' },
  { label: 'Referanslar', href: '/referanslar' },
  { label: 'Ekibimiz', href: '/ekibimiz' },
  { label: 'Blog', href: '/blog' },
  { label: 'Iletisim', href: '/iletisim' },
];

const SERVICE_LINKS = [
  { label: 'QR Menu Sistemi', href: '/hizmetler/qr-menu' },
  { label: 'Kurumsal Web Sitesi', href: '/hizmetler/kurumsal-web' },
  { label: 'E-Ticaret Cozumleri', href: '/hizmetler/e-ticaret' },
  { label: 'Ozel Yazilim', href: '/hizmetler/yazilim' },
];

const SCROLL_THRESHOLD = 50;

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-80 transition-all duration-300',
          isScrolled
            ? 'bg-bg-dark/80 shadow-lg shadow-black/20 backdrop-blur-xl'
            : 'bg-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <nav
          className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          aria-label="Ana navigasyon"
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2"
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

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              if (link.label === 'Hizmetler') {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-accent-orange'
                          : 'text-text-muted hover:text-text-main'
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          isDropdownOpen ? 'rotate-180' : ''
                        )}
                      />
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent-orange"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute left-0 top-full pt-2"
                        >
                          <div className="w-56 overflow-hidden rounded-xl border border-white/10 bg-bg-dark/95 p-2 shadow-xl shadow-black/30 backdrop-blur-xl">
                            {SERVICE_LINKS.map((subLink) => (
                              <Link
                                key={subLink.href}
                                href={subLink.href}
                                className={cn(
                                  'block rounded-lg px-3 py-2.5 text-sm transition-colors',
                                  pathname === subLink.href
                                    ? 'bg-accent-orange/10 text-accent-orange'
                                    : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                                )}
                              >
                                {subLink.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-accent-orange'
                      : 'text-text-muted hover:text-text-main'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent-orange"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <GlowButton href="/iletisim" variant="solid" size="sm">
                Teklif Al
              </GlowButton>
            </div>

            {/* Mobile hamburger */}
            <motion.button
              onClick={toggleMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-main transition-colors hover:border-accent-orange/50 hover:text-accent-orange lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isMobileMenuOpen ? 'Menuyu kapat' : 'Menuyu ac'}
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        links={NAV_LINKS}
        serviceLinks={SERVICE_LINKS}
        pathname={pathname}
      />
    </>
  );
}
