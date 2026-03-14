'use client';

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  serviceLinks: NavLink[];
  pathname: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const menuVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: { duration: 0.15 },
  },
};

export default function MobileMenu({
  isOpen,
  onClose,
  links,
  serviceLinks,
  pathname,
}: MobileMenuProps) {
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 z-90 bg-bg-dark/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <motion.nav
            className="fixed inset-y-0 right-0 z-100 flex w-full max-w-sm flex-col bg-bg-dark/95 backdrop-blur-xl"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Mobil navigasyon menusu"
          >
            {/* Close button */}
            <div className="flex items-center justify-end p-6">
              <motion.button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-main transition-colors hover:border-accent-orange/50 hover:text-accent-orange"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Menuyu kapat"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Navigation links */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-4">
              {links.map((link) => {
                const isActive = pathname === link.href;

                if (link.label === 'Hizmetler') {
                  return (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`block rounded-lg px-4 py-3 text-lg font-semibold font-display transition-colors ${
                          isActive || pathname.startsWith('/hizmetler')
                            ? 'bg-accent-orange/10 text-accent-orange'
                            : 'text-text-main hover:bg-white/5 hover:text-accent-orange'
                        }`}
                      >
                        {link.label}
                      </Link>
                      {/* Service sub-links */}
                      <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-4">
                        {serviceLinks.map((subLink) => (
                          <Link
                            key={subLink.href}
                            href={subLink.href}
                            onClick={onClose}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              pathname === subLink.href
                                ? 'text-accent-orange'
                                : 'text-text-muted hover:text-text-main'
                            }`}
                          >
                            {subLink.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`block rounded-lg px-4 py-3 text-lg font-semibold font-display transition-colors ${
                        isActive
                          ? 'bg-accent-orange/10 text-accent-orange'
                          : 'text-text-main hover:bg-white/5 hover:text-accent-orange'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* CTA Button */}
              <motion.div variants={itemVariants} className="mt-6">
                <GlowButton
                  href="/iletisim"
                  variant="solid"
                  size="lg"
                  className="w-full justify-center"
                  onClick={onClose}
                >
                  Teklif Al
                </GlowButton>
              </motion.div>
            </div>

            {/* Bottom info */}
            <motion.div
              variants={itemVariants}
              className="border-t border-white/10 p-6"
            >
              <p className="text-sm text-text-muted">
                info@devspark.com.tr
              </p>
              <p className="mt-1 text-sm text-text-muted">
                +90 (212) 000 00 00
              </p>
            </motion.div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
