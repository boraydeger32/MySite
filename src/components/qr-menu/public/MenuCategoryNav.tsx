'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MenuCategory } from '@/lib/supabase/types';

// =============================================================================
// Public Menu - Category Navigation
// =============================================================================
// Sticky horizontal category navigation with scroll tracking.
// Used on the public QR menu page: /[restoran-slug]/masa/[masa-no]
// Highlights the active category as the user scrolls through the menu.
// =============================================================================

interface MenuCategoryNavProps {
  /** Visible menu categories sorted by sort_order */
  categories: MenuCategory[];
  /** Currently active category ID (tracked via scroll position) */
  activeCategoryId: string | null;
  /** Called when a category tab is tapped */
  onCategorySelect: (categoryId: string) => void;
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

export default function MenuCategoryNav({
  categories,
  activeCategoryId,
  onCategorySelect,
  primaryColor = '#FF6B2B',
  textColor = '#F0F4FF',
  backgroundColor = '#050A14',
  borderRadius = '12px',
  className,
}: MenuCategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // ---------------------------------------------------------------------------
  // Scroll fade indicators
  // ---------------------------------------------------------------------------

  const updateFadeIndicators = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftFade(scrollLeft > 8);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateFadeIndicators();
    container.addEventListener('scroll', updateFadeIndicators, { passive: true });
    window.addEventListener('resize', updateFadeIndicators);

    return () => {
      container.removeEventListener('scroll', updateFadeIndicators);
      window.removeEventListener('resize', updateFadeIndicators);
    };
  }, [updateFadeIndicators]);

  // ---------------------------------------------------------------------------
  // Scroll the active category tab into view
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!activeCategoryId) return;

    const el = itemRefs.current.get(activeCategoryId);
    const container = scrollContainerRef.current;
    if (!el || !container) return;

    const elLeft = el.offsetLeft;
    const elWidth = el.offsetWidth;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;

    // Scroll into view with padding so the tab is centered-ish
    const targetScroll = elLeft - containerWidth / 2 + elWidth / 2;
    if (
      elLeft < scrollLeft + 40 ||
      elLeft + elWidth > scrollLeft + containerWidth - 40
    ) {
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [activeCategoryId]);

  // ---------------------------------------------------------------------------
  // Handle category click
  // ---------------------------------------------------------------------------

  const handleSelect = useCallback(
    (categoryId: string) => {
      onCategorySelect(categoryId);
    },
    [onCategorySelect]
  );

  // ---------------------------------------------------------------------------
  // Register refs for each category button
  // ---------------------------------------------------------------------------

  const setItemRef = useCallback(
    (categoryId: string) => (el: HTMLButtonElement | null) => {
      if (el) {
        itemRefs.current.set(categoryId, el);
      } else {
        itemRefs.current.delete(categoryId);
      }
    },
    []
  );

  if (categories.length === 0) return null;

  return (
    <div
      className={cn(
        'sticky top-0 z-30 w-full backdrop-blur-md',
        className
      )}
      style={{
        backgroundColor: `${backgroundColor}ee`,
        borderBottom: `1px solid ${textColor}10`,
      }}
    >
      {/* Left fade overlay */}
      {showLeftFade && (
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8"
          style={{
            background: `linear-gradient(to right, ${backgroundColor}ee, transparent)`,
          }}
        />
      )}

      {/* Right fade overlay */}
      {showRightFade && (
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8"
          style={{
            background: `linear-gradient(to left, ${backgroundColor}ee, transparent)`,
          }}
        />
      )}

      {/* Scrollable category tabs */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;

          return (
            <motion.button
              key={category.id}
              ref={setItemRef(category.id)}
              onClick={() => handleSelect(category.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
              style={{
                borderRadius,
                color: isActive ? '#fff' : `${textColor}99`,
                backgroundColor: isActive ? primaryColor : `${textColor}08`,
                border: isActive ? 'none' : `1px solid ${textColor}15`,
              }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isActive}
              role="tab"
            >
              {/* Category icon/emoji */}
              {category.icon && (
                <span className="text-base">{category.icon}</span>
              )}

              {/* Category name */}
              <span>{category.name}</span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: '#fff' }}
                  layoutId="category-active-dot"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
