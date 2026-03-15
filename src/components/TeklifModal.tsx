'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Globe,
  ShoppingCart,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// =============================================================================
// TeklifModal - Service Selection Modal
// =============================================================================
// Displays 4 service cards as radio options. Only "QR Menu Sistemi" is active;
// the other 3 (Kurumsal Web Sitesi, E-Ticaret, Mobil Uygulama) are disabled
// with a "Yakinda" badge. Selecting QR Menu and clicking the CTA navigates
// the user to /qr-menu/giris.
// =============================================================================

interface TeklifModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  href: string;
  glowColor: string;
  iconColor: string;
}

const services: ServiceOption[] = [
  {
    id: 'qr-menu',
    title: 'QR Menu Sistemi',
    description:
      'Restoraniniz icin dijital menu, siparis takibi ve masa yonetimi.',
    icon: QrCode,
    enabled: true,
    href: '/qr-menu/giris',
    glowColor: 'rgba(255, 107, 43, 0.15)',
    iconColor: 'text-[#FF6B2B]',
  },
  {
    id: 'kurumsal',
    title: 'Kurumsal Web Sitesi',
    description:
      'Profesyonel ve modern kurumsal web sitesi cozumleri.',
    icon: Globe,
    enabled: false,
    href: '#',
    glowColor: 'rgba(0, 212, 255, 0.15)',
    iconColor: 'text-[#00D4FF]',
  },
  {
    id: 'e-ticaret',
    title: 'E-Ticaret Cozumu',
    description:
      'Online satis platformu ve entegre odeme sistemleri.',
    icon: ShoppingCart,
    enabled: false,
    href: '#',
    glowColor: 'rgba(124, 58, 237, 0.15)',
    iconColor: 'text-[#7C3AED]',
  },
  {
    id: 'mobil',
    title: 'Mobil Uygulama',
    description:
      'iOS ve Android icin ozel mobil uygulama gelistirme.',
    icon: Smartphone,
    enabled: false,
    href: '#',
    glowColor: 'rgba(34, 197, 94, 0.15)',
    iconColor: 'text-emerald-400',
  },
];

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  }),
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
};

const buttonVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.4, type: 'spring', stiffness: 200, damping: 20 },
  },
};

export default function TeklifModal({ open, onOpenChange }: TeklifModalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>('qr-menu');

  const selectedService = services.find((s) => s.id === selectedId);

  function handleContinue() {
    if (!selectedService?.enabled) return;
    onOpenChange(false);
    router.push(selectedService.href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/10 bg-[#0D1524]/95 backdrop-blur-xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-text-main font-display">
            Hizmet Secin
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            Baslamak istediginiz hizmeti secin. Diger hizmetlerimiz cok yakinda aktif olacak.
          </DialogDescription>
        </DialogHeader>

        {/* Service Cards */}
        <div className="px-6 pb-2">
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isSelected = selectedId === service.id;
                const isDisabled = !service.enabled;

                return (
                  <motion.button
                    key={service.id}
                    custom={index}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) setSelectedId(service.id);
                    }}
                    className={cn(
                      'relative flex flex-col items-start gap-3 rounded-xl p-4 text-left',
                      'border transition-all duration-300',
                      isDisabled && 'cursor-not-allowed opacity-50',
                      isSelected && !isDisabled
                        ? 'border-[#FF6B2B]/50 bg-[#FF6B2B]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20',
                      !isDisabled && !isSelected && 'hover:bg-white/[0.08]'
                    )}
                    style={{
                      boxShadow: isSelected && !isDisabled
                        ? `0 0 24px ${service.glowColor}`
                        : undefined,
                    }}
                  >
                    {/* Yakinda Badge */}
                    {isDisabled && (
                      <span className="absolute top-3 right-3 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Yakinda
                      </span>
                    )}

                    {/* Selected indicator */}
                    {isSelected && !isDisabled && (
                      <motion.div
                        layoutId="selected-indicator"
                        className="absolute top-3 right-3 h-3 w-3 rounded-full bg-[#FF6B2B]"
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        'bg-white/5 border border-white/10',
                        isSelected && !isDisabled && 'border-[#FF6B2B]/30'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          isDisabled ? 'text-text-muted' : service.iconColor
                        )}
                      />
                    </div>

                    {/* Text */}
                    <div>
                      <h3
                        className={cn(
                          'text-sm font-semibold',
                          isDisabled ? 'text-text-muted' : 'text-text-main'
                        )}
                      >
                        {service.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                        {service.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </AnimatePresence>
        </div>

        {/* Footer / CTA */}
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-6 py-4 mt-4"
        >
          <p className="text-xs text-text-muted">
            {selectedService?.enabled
              ? `${selectedService.title} secildi`
              : 'Lutfen aktif bir hizmet secin'}
          </p>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedService?.enabled}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
              'text-sm font-semibold text-white transition-all duration-300',
              selectedService?.enabled
                ? 'bg-[#FF6B2B] hover:bg-[#FF6B2B]/90 hover:shadow-[0_0_20px_rgba(255,107,43,0.3)]'
                : 'cursor-not-allowed bg-white/10 text-text-muted'
            )}
          >
            Devam Et
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
