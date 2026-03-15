'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ImageIcon,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore, type CartItem } from '@/store/useCartStore';

// =============================================================================
// Public Menu - Cart Drawer
// =============================================================================
// Floating cart button showing item count badge + slide-out drawer with item
// list, quantity controls, total, and "Siparis Ver" submit button.
// Used at /[restoran-slug]/masa/[masa-no]
// =============================================================================

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
// Helper: Calculate single cart item total
// ---------------------------------------------------------------------------

function itemTotal(item: CartItem): number {
  const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
  return (item.price + modifierTotal) * item.quantity;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CartDrawerProps {
  /** Called when customer submits the order */
  onSubmitOrder?: () => void;
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
  /** Optional className override */
  className?: string;
}

// ---------------------------------------------------------------------------
// Cart Item Row Sub-component
// ---------------------------------------------------------------------------

function CartItemRow({
  item,
  primaryColor,
  textColor,
  cardBackground,
  borderRadius,
}: {
  item: CartItem;
  primaryColor: string;
  textColor: string;
  cardBackground: string;
  borderRadius: string;
}) {
  const incrementQuantity = useCartStore((s) => s.incrementQuantity);
  const decrementQuantity = useCartStore((s) => s.decrementQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const total = itemTotal(item);
  const hasModifiers = item.modifiers.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 p-3"
      style={{
        backgroundColor: cardBackground,
        borderRadius,
        border: `1px solid ${textColor}10`,
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative h-14 w-14 shrink-0 overflow-hidden"
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
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="line-clamp-1 text-sm font-semibold"
            style={{ color: textColor }}
          >
            {item.name}
          </h4>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => removeItem(item.cartId)}
            className="shrink-0 rounded-full p-1 transition-colors hover:bg-red-500/20"
            aria-label={`${item.name} kaldir`}
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </button>
        </div>

        {/* Modifiers */}
        {hasModifiers && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {item.modifiers.map((mod) => (
              <span
                key={`${mod.groupName}-${mod.label}`}
                className="text-[10px]"
                style={{ color: `${textColor}60` }}
              >
                {mod.label}
                {mod.price > 0 && ` (+${formatPrice(mod.price)})`}
                {item.modifiers.indexOf(mod) < item.modifiers.length - 1 && ','}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <p
            className="mt-0.5 line-clamp-1 text-[10px] italic"
            style={{ color: `${textColor}40` }}
          >
            Not: {item.notes}
          </p>
        )}

        {/* Quantity controls + price */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => decrementQuantity(item.cartId)}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
              style={{
                backgroundColor: `${textColor}10`,
                color: textColor,
                border: `1px solid ${textColor}15`,
              }}
              aria-label="Adet azalt"
            >
              <Minus className="h-3 w-3" />
            </button>

            <span
              className="min-w-[1.25rem] text-center text-sm font-bold"
              style={{ color: textColor }}
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => incrementQuantity(item.cartId)}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
              style={{
                backgroundColor: primaryColor,
                color: '#fff',
              }}
              aria-label="Adet artir"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span
            className="text-sm font-bold"
            style={{ color: primaryColor }}
          >
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Drawer overlay animation variants
// ---------------------------------------------------------------------------

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CartDrawer({
  onSubmitOrder,
  primaryColor = '#FF6B2B',
  textColor = '#F0F4FF',
  backgroundColor = '#050A14',
  cardBackground = '#0D1524',
  borderRadius = '12px',
  className,
}: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const clearCart = useCartStore((s) => s.clearCart);

  const itemCount = totalItems();
  const total = totalAmount();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmitOrder?.();
    setIsOpen(false);
  }, [onSubmitOrder]);

  const handleClear = useCallback(() => {
    clearCart();
  }, [clearCart]);

  // Don't render the FAB if cart is empty
  if (itemCount === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <AnimatePresence>
        {itemCount > 0 && !isOpen && (
          <motion.button
            type="button"
            onClick={handleOpen}
            className={cn(
              'fixed bottom-6 right-6 z-40 flex items-center gap-2 shadow-2xl',
              'transition-shadow duration-300',
              className
            )}
            style={{
              backgroundColor: primaryColor,
              borderRadius,
              padding: '14px 20px',
              boxShadow: `0 8px 32px ${primaryColor}40`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Sepeti ac - ${itemCount} urun`}
          >
            <ShoppingCart className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">
              {formatPrice(total)}
            </span>

            {/* Item count badge */}
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold"
              style={{ color: primaryColor }}
            >
              {itemCount}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer Overlay + Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleClose}
            />

            {/* Drawer Panel */}
            <motion.div
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col"
              style={{
                backgroundColor,
                borderLeft: `1px solid ${textColor}10`,
              }}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-label="Sepet"
              aria-modal="true"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: `1px solid ${textColor}10` }}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                  />
                  <h2
                    className="text-lg font-bold"
                    style={{ color: textColor }}
                  >
                    Sepetim
                  </h2>
                  <span
                    className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {itemCount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                      aria-label="Sepeti temizle"
                    >
                      Temizle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    style={{
                      backgroundColor: `${textColor}10`,
                      color: textColor,
                    }}
                    aria-label="Sepeti kapat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-4">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <ShoppingCart
                        className="h-12 w-12 opacity-20"
                        style={{ color: textColor }}
                      />
                      <p
                        className="mt-3 text-sm"
                        style={{ color: `${textColor}50` }}
                      >
                        Sepetiniz bos
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <CartItemRow
                          key={item.cartId}
                          item={item}
                          primaryColor={primaryColor}
                          textColor={textColor}
                          cardBackground={cardBackground}
                          borderRadius={borderRadius}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>

              {/* Footer: Total + Submit */}
              {items.length > 0 && (
                <div
                  className="px-5 pb-5 pt-3"
                  style={{ borderTop: `1px solid ${textColor}10` }}
                >
                  {/* Total line */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="text-sm font-medium"
                      style={{ color: `${textColor}80` }}
                    >
                      Toplam
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: textColor }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold text-white"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius,
                      boxShadow: `0 4px 16px ${primaryColor}30`,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Siparis Ver
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
