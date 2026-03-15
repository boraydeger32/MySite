'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Star,
  Flame,
  Leaf,
  Wifi,
  Battery,
  Signal,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThemeFont } from '@/lib/fonts';
import type { RestaurantTheme } from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

interface ThemePreviewProps {
  /** Current theme settings to preview */
  theme: RestaurantTheme;
  /** Restaurant name to display in header */
  restaurantName?: string;
  /** Optional className override */
  className?: string;
}

// =============================================================================
// Mock Data for Preview
// =============================================================================

interface MockCategory {
  id: string;
  name: string;
  emoji: string;
}

interface MockItem {
  id: string;
  name: string;
  description: string;
  price: number;
  badge?: string;
  badgeColor?: string;
  hasImage: boolean;
}

const MOCK_CATEGORIES: MockCategory[] = [
  { id: '1', name: 'Baslangiclar', emoji: '\uD83E\uDD57' },
  { id: '2', name: 'Ana Yemekler', emoji: '\uD83C\uDF56' },
  { id: '3', name: 'Pizzalar', emoji: '\uD83C\uDF55' },
  { id: '4', name: 'Icecekler', emoji: '\uD83E\uDD64' },
  { id: '5', name: 'Tatlilar', emoji: '\uD83C\uDF70' },
];

const MOCK_ITEMS: MockItem[] = [
  {
    id: '1',
    name: 'Izgara Tavuk Salata',
    description: 'Taze yesil yapraklarla servis edilir',
    price: 145,
    badge: 'Populer',
    badgeColor: '#F59E0B',
    hasImage: true,
  },
  {
    id: '2',
    name: 'Karsiik Pizza',
    description: 'Ozel sos, peynir, mantar, biber',
    price: 220,
    badge: 'Yeni',
    badgeColor: '#3B82F6',
    hasImage: true,
  },
  {
    id: '3',
    name: 'Vegan Bowl',
    description: 'Kinoa, avokado, nohut, nar',
    price: 165,
    badge: 'Vegan',
    badgeColor: '#10B981',
    hasImage: true,
  },
  {
    id: '4',
    name: 'Limonata',
    description: 'Ev yapimi taze limonata',
    price: 55,
    hasImage: false,
  },
];

// =============================================================================
// Default Theme Values
// =============================================================================

const DEFAULTS = {
  primaryColor: '#FF6B2B',
  secondaryColor: '#00D4FF',
  backgroundColor: '#050A14',
  textColor: '#F0F4FF',
  cardBackground: '#0D1524',
  fontFamily: 'inter',
  layout: 'grid' as const,
  categoryNavPosition: 'top' as const,
  borderRadius: '12px',
};

// =============================================================================
// Helper: Format price
// =============================================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

// =============================================================================
// Status Bar Component (Phone Top)
// =============================================================================

function PhoneStatusBar({ textColor }: { textColor: string }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-1.5"
      style={{ color: textColor }}
    >
      <span className="text-[10px] font-semibold">12:30</span>
      <div className="flex items-center gap-1">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <Battery className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

// =============================================================================
// Category Nav Components
// =============================================================================

function CategoryNavTop({
  categories,
  primaryColor,
  textColor,
  backgroundColor,
  borderRadius,
}: {
  categories: MockCategory[];
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: string;
}) {
  return (
    <div
      className="flex gap-1.5 overflow-x-hidden px-3 py-2"
      style={{ backgroundColor }}
    >
      {categories.map((cat, idx) => (
        <div
          key={cat.id}
          className="flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-[9px] font-medium whitespace-nowrap"
          style={{
            backgroundColor: idx === 0 ? primaryColor : 'transparent',
            color: idx === 0 ? '#fff' : `${textColor}99`,
            borderRadius,
            border: idx === 0 ? 'none' : `1px solid ${textColor}20`,
          }}
        >
          <span>{cat.emoji}</span>
          {cat.name}
        </div>
      ))}
    </div>
  );
}

function CategoryNavLeft({
  categories,
  primaryColor,
  textColor,
}: {
  categories: MockCategory[];
  primaryColor: string;
  textColor: string;
}) {
  return (
    <div className="flex w-14 shrink-0 flex-col gap-1 py-2 pl-2">
      {categories.slice(0, 4).map((cat, idx) => (
        <div
          key={cat.id}
          className="flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-center"
          style={{
            backgroundColor: idx === 0 ? `${primaryColor}20` : 'transparent',
            borderLeft: idx === 0 ? `2px solid ${primaryColor}` : '2px solid transparent',
          }}
        >
          <span className="text-sm">{cat.emoji}</span>
          <span
            className="text-[7px] font-medium leading-tight"
            style={{ color: idx === 0 ? primaryColor : `${textColor}80` }}
          >
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryNavFloating({
  categories,
  primaryColor,
  textColor,
  borderRadius,
}: {
  categories: MockCategory[];
  primaryColor: string;
  textColor: string;
  borderRadius: string;
}) {
  return (
    <div className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2">
      <div
        className="flex items-center gap-1 px-2 py-1.5 shadow-lg"
        style={{
          backgroundColor: `${primaryColor}ee`,
          borderRadius: `calc(${borderRadius} + 4px)`,
        }}
      >
        {categories.slice(0, 4).map((cat) => (
          <div
            key={cat.id}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            title={cat.name}
          >
            <span className="text-xs">{cat.emoji}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Menu Item Card Components (by layout type)
// =============================================================================

function GridItemCard({
  item,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
}: {
  item: MockItem;
  primaryColor: string;
  textColor: string;
  cardBackground: string;
  borderRadius: string;
}) {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        backgroundColor: cardBackground,
        borderRadius,
        border: `1px solid ${textColor}10`,
      }}
    >
      {/* Image placeholder */}
      <div
        className="relative h-16 w-full"
        style={{ backgroundColor: `${textColor}08` }}
      >
        {item.hasImage && (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xl opacity-40">
              {item.id === '1' ? '\uD83E\uDD57' : item.id === '2' ? '\uD83C\uDF55' : item.id === '3' ? '\uD83E\uDD57' : '\uD83E\uDD64'}
            </span>
          </div>
        )}
        {item.badge && (
          <div
            className="absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white"
            style={{ backgroundColor: item.badgeColor }}
          >
            {item.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h4
          className="truncate text-[9px] font-semibold"
          style={{ color: textColor }}
        >
          {item.name}
        </h4>
        <p
          className="mt-0.5 truncate text-[7px]"
          style={{ color: `${textColor}70` }}
        >
          {item.description}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className="text-[9px] font-bold"
            style={{ color: primaryColor }}
          >
            {formatPrice(item.price)}
          </span>
          <div
            className="flex h-4 w-4 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-[8px] font-bold leading-none">+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItemCard({
  item,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
}: {
  item: MockItem;
  primaryColor: string;
  textColor: string;
  cardBackground: string;
  borderRadius: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{
        backgroundColor: cardBackground,
        borderRadius,
        border: `1px solid ${textColor}10`,
      }}
    >
      {/* Small thumbnail */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${textColor}08` }}
      >
        <span className="text-sm opacity-50">
          {item.id === '1' ? '\uD83E\uDD57' : item.id === '2' ? '\uD83C\uDF55' : item.id === '3' ? '\uD83E\uDD57' : '\uD83E\uDD64'}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h4
            className="truncate text-[9px] font-semibold"
            style={{ color: textColor }}
          >
            {item.name}
          </h4>
          {item.badge && (
            <span
              className="shrink-0 rounded-full px-1 py-px text-[6px] font-bold text-white"
              style={{ backgroundColor: item.badgeColor }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p
          className="truncate text-[7px]"
          style={{ color: `${textColor}70` }}
        >
          {item.description}
        </p>
      </div>

      {/* Price */}
      <span
        className="shrink-0 text-[9px] font-bold"
        style={{ color: primaryColor }}
      >
        {formatPrice(item.price)}
      </span>
    </div>
  );
}

function CardsItemCard({
  item,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
}: {
  item: MockItem;
  primaryColor: string;
  textColor: string;
  cardBackground: string;
  borderRadius: string;
}) {
  return (
    <div
      className="flex gap-2.5 p-2.5"
      style={{
        backgroundColor: cardBackground,
        borderRadius,
        border: `1px solid ${textColor}10`,
      }}
    >
      {/* Image */}
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden"
        style={{
          borderRadius: `calc(${borderRadius} - 4px)`,
          backgroundColor: `${textColor}08`,
        }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-lg opacity-40">
            {item.id === '1' ? '\uD83E\uDD57' : item.id === '2' ? '\uD83C\uDF55' : item.id === '3' ? '\uD83E\uDD57' : '\uD83E\uDD64'}
          </span>
        </div>
        {item.badge && (
          <div
            className="absolute left-0.5 top-0.5 rounded-full px-1 py-px text-[6px] font-bold text-white"
            style={{ backgroundColor: item.badgeColor }}
          >
            {item.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h4
            className="text-[9px] font-semibold leading-tight"
            style={{ color: textColor }}
          >
            {item.name}
          </h4>
          <p
            className="mt-0.5 line-clamp-2 text-[7px] leading-tight"
            style={{ color: `${textColor}70` }}
          >
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold"
            style={{ color: primaryColor }}
          >
            {formatPrice(item.price)}
          </span>
          <div
            className="flex h-5 items-center gap-0.5 rounded-full px-2 text-[7px] font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Ekle
            <ChevronRight className="h-2.5 w-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ThemePreview({
  theme,
  restaurantName = 'Restoran Adiniz',
  className,
}: ThemePreviewProps) {
  // Merge theme with defaults
  const t = useMemo(
    () => ({
      primaryColor: theme.primaryColor ?? DEFAULTS.primaryColor,
      secondaryColor: theme.secondaryColor ?? DEFAULTS.secondaryColor,
      backgroundColor: theme.backgroundColor ?? DEFAULTS.backgroundColor,
      textColor: theme.textColor ?? DEFAULTS.textColor,
      cardBackground: theme.cardBackground ?? DEFAULTS.cardBackground,
      fontFamily: theme.fontFamily ?? DEFAULTS.fontFamily,
      layout: theme.layout ?? DEFAULTS.layout,
      categoryNavPosition: theme.categoryNavPosition ?? DEFAULTS.categoryNavPosition,
      borderRadius: theme.borderRadius ?? DEFAULTS.borderRadius,
    }),
    [theme]
  );

  const themeFont = useMemo(() => getThemeFont(t.fontFamily), [t.fontFamily]);

  // ---------------------------------------------------------------------------
  // Render item based on layout
  // ---------------------------------------------------------------------------

  const renderItem = (item: MockItem) => {
    const commonProps = {
      item,
      primaryColor: t.primaryColor,
      textColor: t.textColor,
      cardBackground: t.cardBackground,
      borderRadius: t.borderRadius,
    };

    switch (t.layout) {
      case 'list':
        return <ListItemCard key={item.id} {...commonProps} />;
      case 'cards':
        return <CardsItemCard key={item.id} {...commonProps} />;
      case 'grid':
      default:
        return <GridItemCard key={item.id} {...commonProps} />;
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Phone Label */}
      <p className="mb-3 text-xs font-medium text-text-muted">Canli Onizleme</p>

      {/* Phone Frame */}
      <motion.div
        layout
        className="relative w-[280px] overflow-hidden rounded-[2.5rem] border-[3px] border-white/20 bg-black shadow-2xl shadow-black/50"
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />

        {/* Screen Content */}
        <div
          className={cn('relative min-h-[520px] overflow-hidden', themeFont.className)}
          style={{
            backgroundColor: t.backgroundColor,
            fontFamily: `var(${themeFont.variable}), sans-serif`,
          }}
        >
          {/* Status Bar */}
          <PhoneStatusBar textColor={t.textColor} />

          {/* Restaurant Header */}
          <div className="relative px-4 pb-3 pt-5">
            {/* Cover gradient */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${t.primaryColor}40, ${t.secondaryColor}20, transparent)`,
              }}
            />

            <div className="relative">
              {/* Restaurant name */}
              <h3
                className="text-sm font-bold"
                style={{ color: t.textColor }}
              >
                {restaurantName}
              </h3>
              <p
                className="mt-0.5 text-[8px]"
                style={{ color: `${t.textColor}80` }}
              >
                Masa 5 &bull; Acik
              </p>

              {/* Search bar */}
              <div
                className="mt-2.5 flex items-center gap-2 px-2.5 py-1.5"
                style={{
                  backgroundColor: `${t.textColor}08`,
                  borderRadius: t.borderRadius,
                  border: `1px solid ${t.textColor}15`,
                }}
              >
                <Search
                  className="h-3 w-3"
                  style={{ color: `${t.textColor}50` }}
                />
                <span
                  className="text-[8px]"
                  style={{ color: `${t.textColor}50` }}
                >
                  Menu&apos;de ara...
                </span>
              </div>
            </div>
          </div>

          {/* Content area with category nav */}
          <div className={cn('flex flex-1', t.categoryNavPosition === 'left' && 'flex-row')}>
            {/* Category Nav - Left */}
            {t.categoryNavPosition === 'left' && (
              <CategoryNavLeft
                categories={MOCK_CATEGORIES}
                primaryColor={t.primaryColor}
                textColor={t.textColor}
              />
            )}

            <div className="flex-1">
              {/* Category Nav - Top */}
              {t.categoryNavPosition === 'top' && (
                <CategoryNavTop
                  categories={MOCK_CATEGORIES}
                  primaryColor={t.primaryColor}
                  textColor={t.textColor}
                  backgroundColor={t.backgroundColor}
                  borderRadius={t.borderRadius}
                />
              )}

              {/* Section Title */}
              <div className="flex items-center justify-between px-3 py-2">
                <h4
                  className="text-[10px] font-bold"
                  style={{ color: t.textColor }}
                >
                  Ana Yemekler
                </h4>
                <span
                  className="text-[8px]"
                  style={{ color: `${t.textColor}60` }}
                >
                  4 urun
                </span>
              </div>

              {/* Menu Items */}
              <div
                className={cn(
                  'px-3 pb-20',
                  t.layout === 'grid'
                    ? 'grid grid-cols-2 gap-2'
                    : 'flex flex-col gap-2'
                )}
              >
                {MOCK_ITEMS.map(renderItem)}
              </div>
            </div>
          </div>

          {/* Floating Category Nav */}
          {t.categoryNavPosition === 'floating' && (
            <CategoryNavFloating
              categories={MOCK_CATEGORIES}
              primaryColor={t.primaryColor}
              textColor={t.textColor}
              borderRadius={t.borderRadius}
            />
          )}

          {/* Bottom Bar - Cart */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-4 py-3 backdrop-blur-md"
            style={{
              backgroundColor: `${t.backgroundColor}ee`,
              borderTop: `1px solid ${t.textColor}10`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="relative flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${t.primaryColor}20` }}
              >
                <ShoppingCart
                  className="h-4 w-4"
                  style={{ color: t.primaryColor }}
                />
                <div
                  className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white"
                  style={{ backgroundColor: t.primaryColor }}
                >
                  3
                </div>
              </div>
              <div>
                <p
                  className="text-[8px] font-medium"
                  style={{ color: t.textColor }}
                >
                  3 urun
                </p>
                <p
                  className="text-[9px] font-bold"
                  style={{ color: t.primaryColor }}
                >
                  {formatPrice(530)}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1 px-4 py-2 text-[9px] font-bold text-white"
              style={{
                backgroundColor: t.primaryColor,
                borderRadius: t.borderRadius,
              }}
            >
              Sepeti Gor
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-white/30" />
      </motion.div>
    </div>
  );
}
