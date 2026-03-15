'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Clock,
  Flame,
  ShoppingCart,
  ZoomIn,
  ZoomOut,
  ImageIcon,
  Check,
  Star,
  Leaf,
  FlameKindling,
  ChefHat,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCartStore, type CartModifier } from '@/store/useCartStore';
import type { MenuItem, ModifierGroup, ModifierOption } from '@/lib/supabase/types';

// =============================================================================
// Public Menu - Product Detail Modal
// =============================================================================
// Full-screen modal showing product details with image zoom, modifier selection
// checkboxes, add-on options, quantity selector, special notes textarea, and
// "Sepete Ekle" button that uses useCartStore.
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

interface ProductDetailModalProps {
  /** The menu item to display (null = closed) */
  item: MenuItem | null;
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onOpenChange: (open: boolean) => void;
  /** Theme primary color */
  primaryColor?: string;
  /** Theme text color */
  textColor?: string;
  /** Theme background color */
  backgroundColor?: string;
  /** Theme card background */
  cardBackground?: string;
  /** Theme border radius */
  borderRadius?: string;
}

// ---------------------------------------------------------------------------
// Selected modifier state
// ---------------------------------------------------------------------------

interface SelectedModifier {
  groupName: string;
  optionLabel: string;
  price: number;
}

// ---------------------------------------------------------------------------
// Image Zoom Sub-component
// ---------------------------------------------------------------------------

function ZoomableImage({
  src,
  alt,
  primaryColor,
  textColor,
}: {
  src: string;
  alt: string;
  primaryColor: string;
  textColor: string;
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      {/* Standard image with zoom button */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-110"
          style={{
            backgroundColor: `${primaryColor}cc`,
            color: '#fff',
          }}
          aria-label="Gorseli buyut"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Fullscreen zoom overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
          >
            <motion.img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label="Kapat"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Modifier Group Sub-component
// ---------------------------------------------------------------------------

function ModifierGroupSection({
  group,
  selectedModifiers,
  onToggle,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
}: {
  group: ModifierGroup;
  selectedModifiers: SelectedModifier[];
  onToggle: (groupName: string, option: ModifierOption) => void;
  primaryColor: string;
  textColor: string;
  cardBackground: string;
  borderRadius: string;
}) {
  return (
    <div className="space-y-2.5">
      <h4
        className="text-sm font-semibold"
        style={{ color: textColor }}
      >
        {group.name}
      </h4>
      <div className="space-y-1.5">
        {group.options.map((option) => {
          const isSelected = selectedModifiers.some(
            (m) => m.groupName === group.name && m.optionLabel === option.label
          );

          return (
            <button
              key={`${group.name}-${option.label}`}
              type="button"
              onClick={() => onToggle(group.name, option)}
              className="flex w-full items-center gap-3 px-3 py-2.5 transition-colors"
              style={{
                backgroundColor: isSelected ? `${primaryColor}15` : `${textColor}05`,
                borderRadius,
                border: `1px solid ${isSelected ? `${primaryColor}40` : `${textColor}10`}`,
              }}
            >
              <Checkbox
                checked={isSelected}
                className={cn(
                  'h-5 w-5 shrink-0 rounded border-2',
                  'data-[state=checked]:border-transparent'
                )}
                style={{
                  borderColor: isSelected ? primaryColor : `${textColor}30`,
                  backgroundColor: isSelected ? primaryColor : 'transparent',
                  color: isSelected ? '#fff' : 'transparent',
                }}
                tabIndex={-1}
                aria-hidden
              />
              <span
                className="flex-1 text-left text-sm"
                style={{ color: textColor }}
              >
                {option.label}
              </span>
              {option.price > 0 && (
                <span
                  className="shrink-0 text-sm font-medium"
                  style={{ color: primaryColor }}
                >
                  +{formatPrice(option.price)}
                </span>
              )}
              {option.price === 0 && (
                <span
                  className="shrink-0 text-xs"
                  style={{ color: `${textColor}50` }}
                >
                  Ucretsiz
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quantity Selector Sub-component
// ---------------------------------------------------------------------------

function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  primaryColor,
  textColor,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  primaryColor: string;
  textColor: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-all disabled:opacity-30"
        style={{
          backgroundColor: `${textColor}10`,
          color: textColor,
          border: `1px solid ${textColor}20`,
        }}
        aria-label="Adet azalt"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span
        className="min-w-[2rem] text-center text-xl font-bold"
        style={{ color: textColor }}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-all"
        style={{
          backgroundColor: primaryColor,
          color: '#fff',
        }}
        aria-label="Adet artir"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ProductDetailModal({
  item,
  open,
  onOpenChange,
  primaryColor = '#FF6B2B',
  textColor = '#F0F4FF',
  backgroundColor = '#050A14',
  cardBackground = '#0D1524',
  borderRadius = '12px',
}: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Local state
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [notes, setNotes] = useState('');

  // ---------------------------------------------------------------------------
  // Reset state when modal opens with a new item
  // ---------------------------------------------------------------------------

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        // Reset on close
        setQuantity(1);
        setSelectedModifiers([]);
        setNotes('');
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  // ---------------------------------------------------------------------------
  // Modifier toggle
  // ---------------------------------------------------------------------------

  const toggleModifier = useCallback(
    (groupName: string, option: ModifierOption) => {
      setSelectedModifiers((prev) => {
        const exists = prev.some(
          (m) => m.groupName === groupName && m.optionLabel === option.label
        );
        if (exists) {
          return prev.filter(
            (m) => !(m.groupName === groupName && m.optionLabel === option.label)
          );
        }
        return [...prev, { groupName, optionLabel: option.label, price: option.price }];
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Computed total
  // ---------------------------------------------------------------------------

  const modifierTotal = useMemo(
    () => selectedModifiers.reduce((sum, m) => sum + m.price, 0),
    [selectedModifiers]
  );

  const unitPrice = item ? item.price + modifierTotal : 0;
  const totalPrice = unitPrice * quantity;

  // ---------------------------------------------------------------------------
  // Add to cart
  // ---------------------------------------------------------------------------

  const handleAddToCart = useCallback(() => {
    if (!item) return;

    const cartModifiers: CartModifier[] = selectedModifiers.map((m) => ({
      groupName: m.groupName,
      label: m.optionLabel,
      price: m.price,
    }));

    addItem({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      modifiers: cartModifiers,
      notes: notes.trim(),
      image_url: item.image_url,
    });

    // Close modal and reset
    handleOpenChange(false);
  }, [item, selectedModifiers, quantity, notes, addItem, handleOpenChange]);

  // ---------------------------------------------------------------------------
  // Quantity handlers
  // ---------------------------------------------------------------------------

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  }, []);

  // ---------------------------------------------------------------------------
  // Don't render content if no item
  // ---------------------------------------------------------------------------

  if (!item) return null;

  const hasAllergens = item.allergens && item.allergens.length > 0;
  const hasBadges = item.badges && item.badges.length > 0;
  const hasModifiers = item.modifiers && item.modifiers.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[95vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        style={{
          backgroundColor,
          border: `1px solid ${textColor}15`,
          borderRadius: `calc(${borderRadius} + 4px)`,
        }}
      >
        {/* Accessible title (visually hidden if image is shown) */}
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <DialogDescription className="sr-only">
          {item.description ?? `${item.name} urun detaylari`}
        </DialogDescription>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="pb-32">
            {/* Image section */}
            {item.image_url ? (
              <ZoomableImage
                src={item.image_url}
                alt={item.name}
                primaryColor={primaryColor}
                textColor={textColor}
              />
            ) : (
              <div
                className="flex aspect-[16/10] w-full items-center justify-center"
                style={{ backgroundColor: `${textColor}08` }}
              >
                <ImageIcon
                  className="h-16 w-16 opacity-15"
                  style={{ color: textColor }}
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-5 px-5 pt-5">
              {/* Header: Name + Badges */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2
                    className="text-xl font-bold leading-tight"
                    style={{ color: textColor }}
                  >
                    {item.name}
                  </h2>
                  <span
                    className="shrink-0 text-xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    {formatPrice(item.price)}
                  </span>
                </div>

                {/* Badges */}
                {hasBadges && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.badges.map((badge) => {
                      const info = BADGE_MAP[badge];
                      if (!info) return null;
                      const Icon = info.icon;
                      return (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: info.color }}
                        >
                          <Icon className="h-3 w-3" />
                          {info.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Description */}
                {item.description && (
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: `${textColor}80` }}
                  >
                    {item.description}
                  </p>
                )}

                {/* Meta: prep time + calories */}
                <div className="mt-3 flex flex-wrap gap-4">
                  {item.prep_time != null && item.prep_time > 0 && (
                    <span
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: `${textColor}70` }}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {item.prep_time} dk hazirlanma
                    </span>
                  )}
                  {item.calories != null && item.calories > 0 && (
                    <span
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: `${textColor}70` }}
                    >
                      <Flame className="h-3.5 w-3.5" />
                      {item.calories} kcal
                    </span>
                  )}
                </div>
              </div>

              {/* Allergens */}
              {hasAllergens && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: `${textColor}05`,
                    border: `1px solid ${textColor}10`,
                  }}
                >
                  <div className="mb-2 flex items-center gap-1.5">
                    <TriangleAlert
                      className="h-4 w-4"
                      style={{ color: '#F59E0B' }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: `${textColor}90` }}
                    >
                      Alerjen Bilgisi
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.allergens.map((allergen) => {
                      const info = ALLERGEN_MAP[allergen];
                      if (!info) return null;
                      return (
                        <span
                          key={allergen}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                          style={{
                            backgroundColor: `${textColor}08`,
                            color: `${textColor}90`,
                            border: `1px solid ${textColor}15`,
                          }}
                        >
                          <span>{info.emoji}</span>
                          {info.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modifier groups */}
              {hasModifiers && (
                <div className="space-y-4">
                  <div
                    className="h-px w-full"
                    style={{ backgroundColor: `${textColor}10` }}
                  />
                  {item.modifiers.map((group, idx) => (
                    <ModifierGroupSection
                      key={`${group.name}-${idx}`}
                      group={group}
                      selectedModifiers={selectedModifiers}
                      onToggle={toggleModifier}
                      primaryColor={primaryColor}
                      textColor={textColor}
                      cardBackground={cardBackground}
                      borderRadius={borderRadius}
                    />
                  ))}
                </div>
              )}

              {/* Special notes */}
              <div className="space-y-2">
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: `${textColor}10` }}
                />
                <label
                  htmlFor="product-notes"
                  className="text-sm font-semibold"
                  style={{ color: textColor }}
                >
                  Ozel Notlar
                </label>
                <Textarea
                  id="product-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ornegin: Sosunu az olsun, acisiz yapiniz..."
                  rows={3}
                  maxLength={500}
                  className="resize-none border text-sm"
                  style={{
                    backgroundColor: `${textColor}05`,
                    borderColor: `${textColor}15`,
                    color: textColor,
                    borderRadius,
                  }}
                />
                <p
                  className="text-right text-[10px]"
                  style={{ color: `${textColor}40` }}
                >
                  {notes.length}/500
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed bottom bar: Quantity + Add to cart */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-3 backdrop-blur-xl"
          style={{
            backgroundColor: `${backgroundColor}ee`,
            borderTop: `1px solid ${textColor}10`,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Quantity selector */}
            <QuantitySelector
              quantity={quantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              primaryColor={primaryColor}
              textColor={textColor}
            />

            {/* Add to cart button */}
            <motion.button
              type="button"
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold text-white"
              style={{
                backgroundColor: primaryColor,
                borderRadius,
              }}
              whileTap={{ scale: 0.97 }}
              disabled={!item.is_available}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Sepete Ekle</span>
              <span className="opacity-80">-</span>
              <span>{formatPrice(totalPrice)}</span>
            </motion.button>
          </div>

          {/* Selected modifiers summary */}
          {selectedModifiers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 flex flex-wrap gap-1.5"
            >
              {selectedModifiers.map((mod) => (
                <span
                  key={`${mod.groupName}-${mod.optionLabel}`}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}30`,
                  }}
                >
                  <Check className="h-2.5 w-2.5" />
                  {mod.optionLabel}
                  {mod.price > 0 && ` (+${formatPrice(mod.price)})`}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
