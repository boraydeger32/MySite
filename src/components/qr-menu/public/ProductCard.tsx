'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Leaf,
  FlameKindling,
  ChefHat,
  Sparkles,
  Clock,
  Flame,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/lib/supabase/types';

// =============================================================================
// Public Menu - Product Card
// =============================================================================
// Displays a menu item card on the public QR menu. Shows product image, name,
// description, price, allergen icons, and badges. Tapping opens the detail modal.
// Used at /[restoran-slug]/masa/[masa-no]
// =============================================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLERGEN_MAP: Record<string, { label: string; emoji: string }> = {
  gluten: { label: 'Gluten', emoji: '\uD83C\uDF3E' },
  sut: { label: 'Sut', emoji: '\uD83E\uDD5B' },
  yumurta: { label: 'Yumurta', emoji: '\uD83E\uDD5A' },
  fistik: { label: 'Fistik', emoji: '\uD83E\uDD5C' },
  deniz_urunleri: { label: 'Deniz Urunleri', emoji: '\uD83E\uDD90' },
  soya: { label: 'Soya', emoji: '\uD83C\uDF31' },
  susam: { label: 'Susam', emoji: '\u2B55' },
  kereviz: { label: 'Kereviz', emoji: '\uD83E\uDD66' },
  hardal: { label: 'Hardal', emoji: '\uD83D\uDFE1' },
  lupin: { label: 'Lupin', emoji: '\uD83C\uDF3B' },
  yumusakcalar: { label: 'Yumusakcalar', emoji: '\uD83D\uDC19' },
  sulfur_dioksit: { label: 'Sulfit', emoji: '\uD83E\uDDEA' },
};

const BADGE_MAP: Record<string, { label: string; icon: typeof Star; color: string }> = {
  populer: { label: 'Populer', icon: Star, color: '#F59E0B' },
  vegan: { label: 'Vegan', icon: Leaf, color: '#10B981' },
  acili: { label: 'Acili', icon: FlameKindling, color: '#EF4444' },
  sefin_onerisi: { label: 'Sefin Onerisi', icon: ChefHat, color: '#8B5CF6' },
  yeni: { label: 'Yeni', icon: Sparkles, color: '#0EA5E9' },
};

// ---------------------------------------------------------------------------
// Helper: Format price in TRY
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductCardProps {
  /** The menu item data */
  item: MenuItem;
  /** Called when the card is tapped to open detail modal */
  onSelect: (item: MenuItem) => void;
  /** Theme primary color */
  primaryColor?: string;
  /** Theme text color */
  textColor?: string;
  /** Theme card background color */
  cardBackground?: string;
  /** Theme border radius */
  borderRadius?: string;
  /** Display layout mode */
  layout?: 'grid' | 'list' | 'cards';
  /** Optional className override */
  className?: string;
}

// ---------------------------------------------------------------------------
// AllergenIcon (compact, for card display)
// ---------------------------------------------------------------------------

function AllergenIcon({ allergen }: { allergen: string }) {
  const info = ALLERGEN_MAP[allergen];
  if (!info) return null;

  return (
    <span
      className="inline-flex items-center justify-center text-sm"
      title={info.label}
      role="img"
      aria-label={info.label}
    >
      {info.emoji}
    </span>
  );
}

// ---------------------------------------------------------------------------
// BadgePill
// ---------------------------------------------------------------------------

function BadgePill({ badge }: { badge: string }) {
  const info = BADGE_MAP[badge];
  if (!info) return null;

  const Icon = info.icon;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
      style={{ backgroundColor: info.color }}
    >
      <Icon className="h-3 w-3" />
      {info.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Card animation variants
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

// ---------------------------------------------------------------------------
// Grid Layout Card
// ---------------------------------------------------------------------------

function GridCard({
  item,
  onSelect,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
  className,
}: ProductCardProps) {
  const hasAllergens = item.allergens && item.allergens.length > 0;
  const hasBadges = item.badges && item.badges.length > 0;

  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(item)}
      className={cn(
        'flex w-full flex-col overflow-hidden text-left',
        'transition-shadow duration-200',
        !item.is_available && 'opacity-50',
        className
      )}
      style={{
        backgroundColor: cardBackground,
        borderRadius,
        border: `1px solid ${textColor}10`,
      }}
      disabled={!item.is_available}
      aria-label={`${item.name} - ${formatPrice(item.price)}`}
    >
      {/* Image */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ backgroundColor: `${textColor}08` }}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon
              className="h-8 w-8 opacity-20"
              style={{ color: textColor }}
            />
          </div>
        )}

        {/* Badges overlay */}
        {hasBadges && (
          <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
            {item.badges.map((badge) => (
              <BadgePill key={badge} badge={badge} />
            ))}
          </div>
        )}

        {/* Out of stock overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white">
              Tukendi
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3
          className="line-clamp-1 text-sm font-semibold"
          style={{ color: textColor }}
        >
          {item.name}
        </h3>

        {item.description && (
          <p
            className="mt-0.5 line-clamp-2 text-xs"
            style={{ color: `${textColor}70` }}
          >
            {item.description}
          </p>
        )}

        {/* Allergen icons */}
        {hasAllergens && (
          <div className="mt-1.5 flex flex-wrap gap-0.5">
            {item.allergens.map((allergen) => (
              <AllergenIcon key={allergen} allergen={allergen} />
            ))}
          </div>
        )}

        {/* Price + meta */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span
            className="text-sm font-bold"
            style={{ color: primaryColor }}
          >
            {formatPrice(item.price)}
          </span>

          {item.prep_time != null && item.prep_time > 0 && (
            <span
              className="flex items-center gap-0.5 text-[10px]"
              style={{ color: `${textColor}60` }}
            >
              <Clock className="h-3 w-3" />
              {item.prep_time} dk
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// List Layout Card
// ---------------------------------------------------------------------------

function ListCard({
  item,
  onSelect,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
  className,
}: ProductCardProps) {
  const hasAllergens = item.allergens && item.allergens.length > 0;
  const hasBadges = item.badges && item.badges.length > 0;

  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      className={cn(
        'flex w-full items-center gap-3 text-left',
        'transition-shadow duration-200',
        !item.is_available && 'opacity-50',
        className
      )}
      style={{
        backgroundColor: cardBackground,
        borderRadius,
        border: `1px solid ${textColor}10`,
        padding: '10px',
      }}
      disabled={!item.is_available}
      aria-label={`${item.name} - ${formatPrice(item.price)}`}
    >
      {/* Thumbnail */}
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden"
        style={{
          borderRadius: `calc(${borderRadius} - 4px)`,
          backgroundColor: `${textColor}08`,
        }}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon
              className="h-5 w-5 opacity-20"
              style={{ color: textColor }}
            />
          </div>
        )}

        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-[8px] font-bold text-white">Tukendi</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          <h3
            className="line-clamp-1 flex-1 text-sm font-semibold"
            style={{ color: textColor }}
          >
            {item.name}
          </h3>
          {hasBadges && (
            <div className="flex shrink-0 gap-1">
              {item.badges.slice(0, 2).map((badge) => (
                <BadgePill key={badge} badge={badge} />
              ))}
            </div>
          )}
        </div>

        {item.description && (
          <p
            className="mt-0.5 line-clamp-1 text-xs"
            style={{ color: `${textColor}70` }}
          >
            {item.description}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-3">
          {/* Allergen icons */}
          {hasAllergens && (
            <div className="flex gap-0.5">
              {item.allergens.slice(0, 4).map((allergen) => (
                <AllergenIcon key={allergen} allergen={allergen} />
              ))}
              {item.allergens.length > 4 && (
                <span
                  className="text-[10px]"
                  style={{ color: `${textColor}50` }}
                >
                  +{item.allergens.length - 4}
                </span>
              )}
            </div>
          )}

          {item.prep_time != null && item.prep_time > 0 && (
            <span
              className="flex items-center gap-0.5 text-[10px]"
              style={{ color: `${textColor}60` }}
            >
              <Clock className="h-3 w-3" />
              {item.prep_time} dk
            </span>
          )}

          {item.calories != null && item.calories > 0 && (
            <span
              className="flex items-center gap-0.5 text-[10px]"
              style={{ color: `${textColor}60` }}
            >
              <Flame className="h-3 w-3" />
              {item.calories} kcal
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <span
        className="shrink-0 text-sm font-bold"
        style={{ color: primaryColor }}
      >
        {formatPrice(item.price)}
      </span>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Cards Layout (horizontal image + content)
// ---------------------------------------------------------------------------

function LargeCard({
  item,
  onSelect,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
  className,
}: ProductCardProps) {
  const hasAllergens = item.allergens && item.allergens.length > 0;
  const hasBadges = item.badges && item.badges.length > 0;

  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      className={cn(
        'flex w-full gap-3 text-left',
        'transition-shadow duration-200',
        !item.is_available && 'opacity-50',
        className
      )}
      style={{
        backgroundColor: cardBackground,
        borderRadius,
        border: `1px solid ${textColor}10`,
        padding: '12px',
      }}
      disabled={!item.is_available}
      aria-label={`${item.name} - ${formatPrice(item.price)}`}
    >
      {/* Image */}
      <div
        className="relative h-24 w-24 shrink-0 overflow-hidden"
        style={{
          borderRadius: `calc(${borderRadius} - 4px)`,
          backgroundColor: `${textColor}08`,
        }}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon
              className="h-6 w-6 opacity-20"
              style={{ color: textColor }}
            />
          </div>
        )}

        {hasBadges && (
          <div className="absolute left-1 top-1 flex flex-col gap-0.5">
            {item.badges.slice(0, 2).map((badge) => (
              <BadgePill key={badge} badge={badge} />
            ))}
          </div>
        )}

        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
              Tukendi
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3
            className="line-clamp-1 text-sm font-semibold"
            style={{ color: textColor }}
          >
            {item.name}
          </h3>

          {item.description && (
            <p
              className="mt-0.5 line-clamp-2 text-xs leading-relaxed"
              style={{ color: `${textColor}70` }}
            >
              {item.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-1.5 flex items-center gap-2">
            {hasAllergens && (
              <div className="flex gap-0.5">
                {item.allergens.slice(0, 5).map((allergen) => (
                  <AllergenIcon key={allergen} allergen={allergen} />
                ))}
              </div>
            )}

            {item.prep_time != null && item.prep_time > 0 && (
              <span
                className="flex items-center gap-0.5 text-[10px]"
                style={{ color: `${textColor}60` }}
              >
                <Clock className="h-3 w-3" />
                {item.prep_time} dk
              </span>
            )}

            {item.calories != null && item.calories > 0 && (
              <span
                className="flex items-center gap-0.5 text-[10px]"
                style={{ color: `${textColor}60` }}
              >
                <Flame className="h-3 w-3" />
                {item.calories}
              </span>
            )}
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <span
            className="text-base font-bold"
            style={{ color: primaryColor }}
          >
            {formatPrice(item.price)}
          </span>

          <div
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Ekle
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Main Component (delegates to layout variant)
// ---------------------------------------------------------------------------

export default function ProductCard(props: ProductCardProps) {
  const { layout = 'grid' } = props;

  switch (layout) {
    case 'list':
      return <ListCard {...props} />;
    case 'cards':
      return <LargeCard {...props} />;
    case 'grid':
    default:
      return <GridCard {...props} />;
  }
}
