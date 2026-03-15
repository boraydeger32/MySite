'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Public Menu - Allergen Filter
// =============================================================================
// Toggle chips for filtering menu items by allergens. Displays a horizontal
// scrollable list of allergen chips that customers can toggle on/off.
// Active allergens filter out items containing those allergens.
// Used at /[restoran-slug]/masa/[masa-no]
// =============================================================================

// ---------------------------------------------------------------------------
// Allergen definitions
// ---------------------------------------------------------------------------

export interface AllergenInfo {
  key: string;
  label: string;
  emoji: string;
}

export const ALLERGEN_LIST: AllergenInfo[] = [
  { key: 'gluten', label: 'Gluten', emoji: '\uD83C\uDF3E' },
  { key: 'sut', label: 'Sut', emoji: '\uD83E\uDD5B' },
  { key: 'yumurta', label: 'Yumurta', emoji: '\uD83E\uDD5A' },
  { key: 'fistik', label: 'Fistik', emoji: '\uD83E\uDD5C' },
  { key: 'deniz_urunleri', label: 'Deniz Urunleri', emoji: '\uD83E\uDD90' },
  { key: 'soya', label: 'Soya', emoji: '\uD83C\uDF31' },
  { key: 'susam', label: 'Susam', emoji: '\u2B55' },
  { key: 'kereviz', label: 'Kereviz', emoji: '\uD83E\uDD66' },
  { key: 'hardal', label: 'Hardal', emoji: '\uD83D\uDFE1' },
  { key: 'lupin', label: 'Lupin', emoji: '\uD83C\uDF3B' },
  { key: 'yumusakcalar', label: 'Yumusakcalar', emoji: '\uD83D\uDC19' },
  { key: 'sulfur_dioksit', label: 'Sulfit', emoji: '\uD83E\uDDEA' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AllergenFilterProps {
  /** Currently active allergen keys */
  activeAllergens: string[];
  /** Called when an allergen is toggled */
  onToggle: (allergenKey: string) => void;
  /** Called when all allergens are cleared */
  onClearAll?: () => void;
  /** Theme primary color */
  primaryColor?: string;
  /** Theme text color */
  textColor?: string;
  /** Theme background color */
  backgroundColor?: string;
  /** Theme border radius */
  borderRadius?: string;
  /** Optional className override */
  className?: string;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AllergenFilter({
  activeAllergens,
  onToggle,
  onClearAll,
  primaryColor = '#FF6B2B',
  textColor = '#F0F4FF',
  backgroundColor = '#050A14',
  borderRadius = '12px',
  className,
}: AllergenFilterProps) {
  // ---------------------------------------------------------------------------
  // Toggle handler
  // ---------------------------------------------------------------------------

  const handleToggle = useCallback(
    (key: string) => {
      onToggle(key);
    },
    [onToggle]
  );

  const handleClearAll = useCallback(() => {
    onClearAll?.();
  }, [onClearAll]);

  const hasActiveFilters = activeAllergens.length > 0;

  return (
    <div className={cn('w-full', className)}>
      {/* Header row */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Filter
            className="h-3.5 w-3.5"
            style={{ color: `${textColor}70` }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: `${textColor}80` }}
          >
            Alerjen Filtresi
          </span>
          {hasActiveFilters && (
            <span
              className="flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {activeAllergens.length}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-[10px] font-medium transition-colors"
            style={{ color: `${textColor}60` }}
            aria-label="Tum filtreleri temizle"
          >
            <X className="h-3 w-3" />
            Temizle
          </button>
        )}
      </div>

      {/* Allergen chips (horizontal scroll) */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {ALLERGEN_LIST.map((allergen) => {
          const isActive = activeAllergens.includes(allergen.key);

          return (
            <motion.button
              key={allergen.key}
              type="button"
              onClick={() => handleToggle(allergen.key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-medium',
                'transition-colors duration-200'
              )}
              style={{
                borderRadius,
                backgroundColor: isActive ? `${primaryColor}20` : `${textColor}08`,
                color: isActive ? primaryColor : `${textColor}80`,
                border: `1px solid ${isActive ? `${primaryColor}40` : `${textColor}12`}`,
              }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isActive}
              role="checkbox"
              aria-checked={isActive}
              aria-label={`${allergen.label} filtresi ${isActive ? 'aktif' : 'pasif'}`}
            >
              <span className="text-sm">{allergen.emoji}</span>
              <span>{allergen.label}</span>
              {isActive && <X className="h-3 w-3" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
