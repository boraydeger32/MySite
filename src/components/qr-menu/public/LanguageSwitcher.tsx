'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';

// =============================================================================
// Public Menu - Language Switcher
// =============================================================================
// TR/EN toggle with hardcoded translations. Uses a small Zustand store to
// manage the current language selection across the public menu.
// Used at /[restoran-slug]/masa/[masa-no]
// =============================================================================

// ---------------------------------------------------------------------------
// Language Type & Translations Store
// ---------------------------------------------------------------------------

export type Language = 'tr' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggle: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'tr',
  setLanguage: (language) => set({ language }),
  toggle: () =>
    set((state) => ({
      language: state.language === 'tr' ? 'en' : 'tr',
    })),
}));

// ---------------------------------------------------------------------------
// Hardcoded translations dictionary
// ---------------------------------------------------------------------------

export const translations: Record<Language, Record<string, string>> = {
  tr: {
    // Cart
    'cart.title': 'Sepetim',
    'cart.empty': 'Sepetiniz bos',
    'cart.clear': 'Temizle',
    'cart.total': 'Toplam',
    'cart.submit': 'Siparis Ver',

    // Product
    'product.addToCart': 'Sepete Ekle',
    'product.outOfStock': 'Tukendi',
    'product.specialNotes': 'Ozel Notlar',
    'product.specialNotesPlaceholder': 'ornegin: Sosunu az olsun...',
    'product.allergenInfo': 'Alerjen Bilgisi',
    'product.prepTime': 'dk hazirlanma',
    'product.free': 'Ucretsiz',

    // Waiter
    'waiter.call': 'Garson Cagir',
    'waiter.calling': 'Cagriliyor...',
    'waiter.called': 'Garson Cagirildi',

    // Allergen filter
    'allergen.filter': 'Alerjen Filtresi',
    'allergen.clearAll': 'Temizle',

    // General
    'general.search': 'Menu\'de ara...',
    'general.close': 'Kapat',
    'general.add': 'Ekle',
    'general.remove': 'Kaldir',
    'general.quantity': 'Adet',
  },
  en: {
    // Cart
    'cart.title': 'My Cart',
    'cart.empty': 'Your cart is empty',
    'cart.clear': 'Clear',
    'cart.total': 'Total',
    'cart.submit': 'Place Order',

    // Product
    'product.addToCart': 'Add to Cart',
    'product.outOfStock': 'Sold Out',
    'product.specialNotes': 'Special Notes',
    'product.specialNotesPlaceholder': 'e.g.: Less sauce please...',
    'product.allergenInfo': 'Allergen Info',
    'product.prepTime': 'min preparation',
    'product.free': 'Free',

    // Waiter
    'waiter.call': 'Call Waiter',
    'waiter.calling': 'Calling...',
    'waiter.called': 'Waiter Called',

    // Allergen filter
    'allergen.filter': 'Allergen Filter',
    'allergen.clearAll': 'Clear',

    // General
    'general.search': 'Search menu...',
    'general.close': 'Close',
    'general.add': 'Add',
    'general.remove': 'Remove',
    'general.quantity': 'Quantity',
  },
};

// ---------------------------------------------------------------------------
// Helper hook: get translation function
// ---------------------------------------------------------------------------

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] ?? key;
    },
    [language]
  );

  return { t, language };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LanguageSwitcherProps {
  /** Theme primary color */
  primaryColor?: string;
  /** Theme text color */
  textColor?: string;
  /** Theme border radius */
  borderRadius?: string;
  /** Optional className override */
  className?: string;
}

// ---------------------------------------------------------------------------
// Language options
// ---------------------------------------------------------------------------

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: 'tr', label: 'TR', flag: '\uD83C\uDDF9\uD83C\uDDF7' },
  { value: 'en', label: 'EN', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function LanguageSwitcher({
  primaryColor = '#FF6B2B',
  textColor = '#F0F4FF',
  borderRadius = '12px',
  className,
}: LanguageSwitcherProps) {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const handleSelect = useCallback(
    (lang: Language) => {
      setLanguage(lang);
    },
    [setLanguage]
  );

  return (
    <div
      className={cn('flex items-center gap-1 p-1', className)}
      style={{
        backgroundColor: `${textColor}08`,
        borderRadius,
        border: `1px solid ${textColor}10`,
      }}
      role="radiogroup"
      aria-label="Dil secimi"
    >
      <Languages
        className="mx-1 h-3.5 w-3.5 shrink-0"
        style={{ color: `${textColor}50` }}
      />

      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = language === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              'relative flex items-center gap-1 px-2.5 py-1 text-xs font-semibold',
              'transition-colors duration-200'
            )}
            style={{
              borderRadius: `calc(${borderRadius} - 4px)`,
              color: isActive ? '#fff' : `${textColor}60`,
            }}
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                className="absolute inset-0"
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: `calc(${borderRadius} - 4px)`,
                }}
                layoutId="language-active-bg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <span className="relative text-sm">{option.flag}</span>
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
