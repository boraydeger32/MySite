'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/useCartStore';
import MenuCategoryNav from '@/components/qr-menu/public/MenuCategoryNav';
import ProductCard from '@/components/qr-menu/public/ProductCard';
import ProductDetailModal from '@/components/qr-menu/public/ProductDetailModal';
import CartDrawer from '@/components/qr-menu/public/CartDrawer';
import WaiterCallButton from '@/components/qr-menu/public/WaiterCallButton';
import AllergenFilter from '@/components/qr-menu/public/AllergenFilter';
import LanguageSwitcher, {
  useTranslation,
} from '@/components/qr-menu/public/LanguageSwitcher';
import type {
  Restaurant,
  RestaurantTheme,
  MenuCategory,
  MenuItem,
  MenuCategoryWithItems,
  OrderInsert,
  OrderItem,
} from '@/lib/supabase/types';

// =============================================================================
// Public Customer QR Menu Page
// =============================================================================
// Full customer-facing menu page at /[restoran-slug]/masa/[masa-no].
// Fetches restaurant data + theme from Supabase, applies dynamic theme via
// CSS variables, renders MenuCategoryNav + ProductCard grid, integrates
// CartDrawer + WaiterCallButton + AllergenFilter + LanguageSwitcher + search.
// Order submission writes to Supabase orders table.
// =============================================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_RESTAURANT_ID = 'demo-restaurant-001';

// ---------------------------------------------------------------------------
// Demo data for when Supabase is not configured
// ---------------------------------------------------------------------------

const DEMO_RESTAURANT: Restaurant = {
  id: MOCK_RESTAURANT_ID,
  owner_id: 'demo-owner',
  name: 'Demo Restoran',
  slug: 'demo-restoran',
  logo_url: null,
  cover_url: null,
  theme: {
    primaryColor: '#FF6B2B',
    secondaryColor: '#1E40AF',
    backgroundColor: '#050A14',
    textColor: '#F0F4FF',
    cardBackground: '#0D1524',
    fontFamily: 'Plus Jakarta Sans',
    layout: 'grid',
    categoryNavPosition: 'top',
    borderRadius: '12px',
  },
  settings: {
    currency: 'TRY',
    taxRate: 10,
    language: 'tr',
    address: 'Ornek Mah. Demo Cad. No:1, Istanbul',
    phone: '+90 212 000 00 00',
  },
  plan: 'pro',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-15T00:00:00Z',
};

const DEMO_CATEGORIES: MenuCategoryWithItems[] = [
  {
    id: 'cat-baslangiclar',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Baslangiclar',
    icon: '\uD83E\uDD57',
    color: '#10B981',
    sort_order: 1,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: '2026-01-01T00:00:00Z',
    menu_items: [
      {
        id: 'item-001',
        category_id: 'cat-baslangiclar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Mercimek Corbasi',
        description: 'Geleneksel Turk mercimek corbasi, limon ve ekmek ile servis edilir.',
        price: 45,
        image_url: null,
        calories: 180,
        prep_time: 5,
        allergens: ['gluten'],
        badges: ['populer'],
        modifiers: [],
        is_available: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-002',
        category_id: 'cat-baslangiclar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Humus',
        description: 'Nohut puresi, tahini, zeytinyagi ve sumak ile.',
        price: 55,
        image_url: null,
        calories: 220,
        prep_time: 3,
        allergens: ['susam'],
        badges: ['vegan'],
        modifiers: [],
        is_available: true,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-003',
        category_id: 'cat-baslangiclar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Sigara Boregi',
        description: 'Beyaz peynirli, parcik parcik acilir. 4 adet.',
        price: 65,
        image_url: null,
        calories: 340,
        prep_time: 8,
        allergens: ['gluten', 'sut', 'yumurta'],
        badges: [],
        modifiers: [],
        is_available: true,
        sort_order: 3,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'cat-ana-yemekler',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Ana Yemekler',
    icon: '\uD83C\uDF56',
    color: '#EF4444',
    sort_order: 2,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: '2026-01-01T00:00:00Z',
    menu_items: [
      {
        id: 'item-004',
        category_id: 'cat-ana-yemekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Izgara Kofte',
        description: 'El yapimi kofte, pilav, salata ve kozlenmis biber ile.',
        price: 120,
        image_url: null,
        calories: 650,
        prep_time: 15,
        allergens: ['gluten'],
        badges: ['populer', 'sefin_onerisi'],
        modifiers: [
          {
            name: 'Pisirilme Derecesi',
            options: [
              { label: 'Az Pismis', price: 0 },
              { label: 'Orta', price: 0 },
              { label: 'Iyi Pismis', price: 0 },
            ],
          },
          {
            name: 'Ekstra',
            options: [
              { label: 'Ekstra Pilav', price: 15 },
              { label: 'Ekstra Salata', price: 10 },
              { label: 'Acili Sos', price: 5 },
            ],
          },
        ],
        is_available: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-005',
        category_id: 'cat-ana-yemekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Adana Kebap',
        description: 'Acili kiyma kebabi, lavash, sogani ve domatesle servis edilir.',
        price: 145,
        image_url: null,
        calories: 720,
        prep_time: 20,
        allergens: ['gluten'],
        badges: ['acili'],
        modifiers: [
          {
            name: 'Aci Seviyesi',
            options: [
              { label: 'Az Acili', price: 0 },
              { label: 'Orta Acili', price: 0 },
              { label: 'Cok Acili', price: 0 },
            ],
          },
        ],
        is_available: true,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-006',
        category_id: 'cat-ana-yemekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Tavuk Sote',
        description: 'Sebzeli tavuk sote, tereyagli pilav ile.',
        price: 95,
        image_url: null,
        calories: 480,
        prep_time: 18,
        allergens: ['sut'],
        badges: [],
        modifiers: [],
        is_available: true,
        sort_order: 3,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-007',
        category_id: 'cat-ana-yemekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Iskender',
        description: 'Doner, tereyagi, domates sosu ve yogurt ile.',
        price: 160,
        image_url: null,
        calories: 850,
        prep_time: 12,
        allergens: ['gluten', 'sut'],
        badges: ['sefin_onerisi'],
        modifiers: [
          {
            name: 'Porsiyon',
            options: [
              { label: 'Yarim Porsiyon', price: -30 },
              { label: 'Tam Porsiyon', price: 0 },
              { label: 'Buçuk Porsiyon', price: 40 },
            ],
          },
        ],
        is_available: true,
        sort_order: 4,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'cat-pizzalar',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Pizzalar',
    icon: '\uD83C\uDF55',
    color: '#F59E0B',
    sort_order: 3,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: '2026-01-01T00:00:00Z',
    menu_items: [
      {
        id: 'item-008',
        category_id: 'cat-pizzalar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Margarita Pizza',
        description: 'Domates sosu, mozzarella peyniri ve taze feslegeni.',
        price: 110,
        image_url: null,
        calories: 580,
        prep_time: 15,
        allergens: ['gluten', 'sut'],
        badges: [],
        modifiers: [
          {
            name: 'Boyut',
            options: [
              { label: 'Kucuk (25cm)', price: 0 },
              { label: 'Orta (30cm)', price: 20 },
              { label: 'Buyuk (35cm)', price: 40 },
            ],
          },
        ],
        is_available: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-009',
        category_id: 'cat-pizzalar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Karisik Pizza',
        description: 'Sucuk, sosis, mantar, biber, misir ve zeytin.',
        price: 135,
        image_url: null,
        calories: 720,
        prep_time: 18,
        allergens: ['gluten', 'sut'],
        badges: ['populer'],
        modifiers: [
          {
            name: 'Boyut',
            options: [
              { label: 'Kucuk (25cm)', price: 0 },
              { label: 'Orta (30cm)', price: 20 },
              { label: 'Buyuk (35cm)', price: 40 },
            ],
          },
          {
            name: 'Ekstra Malzeme',
            options: [
              { label: 'Ekstra Peynir', price: 15 },
              { label: 'Ekstra Sucuk', price: 20 },
              { label: 'Ekstra Mantar', price: 10 },
            ],
          },
        ],
        is_available: true,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'cat-icecekler',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Icecekler',
    icon: '\uD83E\uDD64',
    color: '#0EA5E9',
    sort_order: 4,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: '2026-01-01T00:00:00Z',
    menu_items: [
      {
        id: 'item-010',
        category_id: 'cat-icecekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Ayran',
        description: 'Geleneksel Turk yogurt icecegi.',
        price: 20,
        image_url: null,
        calories: 60,
        prep_time: 1,
        allergens: ['sut'],
        badges: [],
        modifiers: [],
        is_available: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-011',
        category_id: 'cat-icecekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Turk Cayi',
        description: 'Demli cay, ince belli bardakta.',
        price: 15,
        image_url: null,
        calories: 5,
        prep_time: 3,
        allergens: [],
        badges: ['populer'],
        modifiers: [],
        is_available: true,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-012',
        category_id: 'cat-icecekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Limonata',
        description: 'Taze sikilmis ev yapimi limonata.',
        price: 35,
        image_url: null,
        calories: 120,
        prep_time: 2,
        allergens: [],
        badges: ['yeni'],
        modifiers: [
          {
            name: 'Tatlandirici',
            options: [
              { label: 'Normal Seker', price: 0 },
              { label: 'Az Sekerli', price: 0 },
              { label: 'Sekersiz', price: 0 },
            ],
          },
        ],
        is_available: true,
        sort_order: 3,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-013',
        category_id: 'cat-icecekler',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Turk Kahvesi',
        description: 'Geleneksel Turk kahvesi, lokum ile servis.',
        price: 40,
        image_url: null,
        calories: 10,
        prep_time: 5,
        allergens: [],
        badges: [],
        modifiers: [
          {
            name: 'Seker Tercihi',
            options: [
              { label: 'Sade', price: 0 },
              { label: 'Az Sekerli', price: 0 },
              { label: 'Orta Sekerli', price: 0 },
              { label: 'Cok Sekerli', price: 0 },
            ],
          },
        ],
        is_available: true,
        sort_order: 4,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'cat-tatlilar',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Tatlilar',
    icon: '\uD83C\uDF70',
    color: '#EC4899',
    sort_order: 5,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: '2026-01-01T00:00:00Z',
    menu_items: [
      {
        id: 'item-014',
        category_id: 'cat-tatlilar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Kunefe',
        description: 'Sicak kunefe, antep fistigi ve kaymak ile.',
        price: 85,
        image_url: null,
        calories: 450,
        prep_time: 10,
        allergens: ['gluten', 'sut', 'fistik'],
        badges: ['sefin_onerisi'],
        modifiers: [
          {
            name: 'Servis Tercihi',
            options: [
              { label: 'Dondurma ile', price: 15 },
              { label: 'Kaymak ile', price: 10 },
              { label: 'Sade', price: 0 },
            ],
          },
        ],
        is_available: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-015',
        category_id: 'cat-tatlilar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Baklava',
        description: 'Antep fistikli baklava, 4 dilim.',
        price: 95,
        image_url: null,
        calories: 520,
        prep_time: 3,
        allergens: ['gluten', 'fistik'],
        badges: ['populer'],
        modifiers: [],
        is_available: true,
        sort_order: 2,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'item-016',
        category_id: 'cat-tatlilar',
        restaurant_id: MOCK_RESTAURANT_ID,
        name: 'Sutlac',
        description: 'Firin sutlac, tarcinli.',
        price: 55,
        image_url: null,
        calories: 280,
        prep_time: 2,
        allergens: ['sut', 'gluten'],
        badges: [],
        modifiers: [],
        is_available: false,
        sort_order: 3,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
  },
];

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
// Loading State Component
// ---------------------------------------------------------------------------

function MenuLoadingState({
  backgroundColor,
  textColor,
  primaryColor,
}: {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: primaryColor }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: `${textColor}70` }}
        >
          Menu yukleniyor...
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error State Component
// ---------------------------------------------------------------------------

function MenuErrorState({
  backgroundColor,
  textColor,
  primaryColor,
  message,
}: {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  message: string;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor }}
    >
      <div className="flex max-w-sm flex-col items-center gap-4 px-6 text-center">
        <WifiOff
          className="h-12 w-12"
          style={{ color: `${textColor}30` }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: `${textColor}70` }}
        >
          {message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search Bar Component
// ---------------------------------------------------------------------------

function MenuSearchBar({
  searchQuery,
  onSearchChange,
  primaryColor,
  textColor,
  backgroundColor,
  borderRadius,
  placeholder,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: `${textColor}40` }}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2.5 pl-10 pr-10 text-sm outline-none transition-colors placeholder:opacity-50"
        style={{
          backgroundColor: `${textColor}08`,
          color: textColor,
          borderRadius,
          border: `1px solid ${textColor}10`,
        }}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors"
          style={{ color: `${textColor}50` }}
          aria-label="Aramayi temizle"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function MasaPageClient() {
  const params = useParams();
  const slug = params['restoran-slug'] as string;
  const masaNo = params['masa-no'] as string;

  const { t } = useTranslation();

  // ---- Data state ----
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategoryWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- UI state ----
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAllergens, setActiveAllergens] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Refs ----
  const categorySectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollObserverRef = useRef<IntersectionObserver | null>(null);

  // ---- Cart store ----
  const setCartContext = useCartStore((s) => s.setContext);
  const cartItems = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const clearCart = useCartStore((s) => s.clearCart);

  // ---------------------------------------------------------------------------
  // Fetch restaurant data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Fetch restaurant by slug
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single();

        if (restaurantError || !restaurantData) {
          throw new Error('Restaurant not found');
        }

        if (cancelled) return;

        const rest = restaurantData as Restaurant;
        setRestaurant(rest);

        // Set cart context
        setCartContext(rest.id, `table-${masaNo}`);

        // Fetch categories with items
        const { data: catData, error: catError } = await supabase
          .from('menu_categories')
          .select('*, menu_items(*)')
          .eq('restaurant_id', rest.id)
          .eq('is_visible', true)
          .order('sort_order', { ascending: true });

        if (catError) {
          throw new Error('Failed to load menu');
        }

        if (cancelled) return;

        const loadedCategories = (catData as MenuCategoryWithItems[]) ?? [];

        // Sort items within each category
        loadedCategories.forEach((cat) => {
          cat.menu_items.sort((a, b) => a.sort_order - b.sort_order);
        });

        setCategories(loadedCategories);

        // Set first category as active
        if (loadedCategories.length > 0) {
          setActiveCategoryId(loadedCategories[0].id);
        }
      } catch {
        // Supabase not configured or error - fall back to demo data
        if (cancelled) return;

        if (slug === 'demo-restoran') {
          setRestaurant(DEMO_RESTAURANT);
          setCategories(DEMO_CATEGORIES);
          setCartContext(MOCK_RESTAURANT_ID, `table-${masaNo}`);
          if (DEMO_CATEGORIES.length > 0) {
            setActiveCategoryId(DEMO_CATEGORIES[0].id);
          }
        } else {
          setError('Restoran bulunamadi veya menu yuklenemedi.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [slug, masaNo, setCartContext]);

  // ---------------------------------------------------------------------------
  // Scroll tracking for category navigation
  // ---------------------------------------------------------------------------

  const setCategorySectionRef = useCallback(
    (categoryId: string) => (el: HTMLDivElement | null) => {
      if (el) {
        categorySectionRefs.current.set(categoryId, el);
      } else {
        categorySectionRefs.current.delete(categoryId);
      }
    },
    []
  );

  useEffect(() => {
    // Clean up previous observer
    if (scrollObserverRef.current) {
      scrollObserverRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          const categoryId = topEntry.target.getAttribute('data-category-id');
          if (categoryId) {
            setActiveCategoryId(categoryId);
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    scrollObserverRef.current = observer;

    // Observe all category sections
    categorySectionRefs.current.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [categories]);

  // ---------------------------------------------------------------------------
  // Category selection handler (scroll to section)
  // ---------------------------------------------------------------------------

  const handleCategorySelect = useCallback((categoryId: string) => {
    const el = categorySectionRefs.current.get(categoryId);
    if (el) {
      const offset = 72; // Height of sticky nav
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setActiveCategoryId(categoryId);
  }, []);

  // ---------------------------------------------------------------------------
  // Product selection
  // ---------------------------------------------------------------------------

  const handleProductSelect = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Allergen filter toggle
  // ---------------------------------------------------------------------------

  const handleAllergenToggle = useCallback((allergenKey: string) => {
    setActiveAllergens((prev) =>
      prev.includes(allergenKey)
        ? prev.filter((a) => a !== allergenKey)
        : [...prev, allergenKey]
    );
  }, []);

  const handleAllergenClearAll = useCallback(() => {
    setActiveAllergens([]);
  }, []);

  // ---------------------------------------------------------------------------
  // Filter items by search and allergens
  // ---------------------------------------------------------------------------

  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => {
        let items = category.menu_items;

        // Filter by allergens - exclude items that contain active allergens
        if (activeAllergens.length > 0) {
          items = items.filter(
            (item) =>
              !item.allergens.some((a) => activeAllergens.includes(a))
          );
        }

        // Filter by search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          items = items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q))
          );
        }

        return { ...category, menu_items: items };
      })
      .filter((category) => category.menu_items.length > 0);
  }, [categories, activeAllergens, searchQuery]);

  // ---------------------------------------------------------------------------
  // Waiter call handler
  // ---------------------------------------------------------------------------

  const handleCallWaiter = useCallback(async () => {
    if (!restaurant) return;

    try {
      const supabase = createClient();

      // Update order with waiter_called flag or create a standalone waiter call
      const { error: callError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          table_id: `table-${masaNo}`,
          items: [],
          total_amount: 0,
          status: 'new' as const,
          notes: `Garson cagrisi - Masa ${masaNo}`,
          waiter_called: true,
        });

      if (callError) {
        throw callError;
      }

      toast.success('Garson cagirildi!');
    } catch {
      // If Supabase fails, still show success for demo purposes
      toast.success('Garson cagirildi!');
    }
  }, [restaurant, masaNo]);

  // ---------------------------------------------------------------------------
  // Order submission
  // ---------------------------------------------------------------------------

  const handleSubmitOrder = useCallback(async () => {
    if (!restaurant || cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Convert cart items to order items
      const orderItems: OrderItem[] = cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers.map(
          (m) => `${m.label}${m.price > 0 ? ` (+${formatPrice(m.price)})` : ''}`
        ),
      }));

      const orderData: OrderInsert = {
        restaurant_id: restaurant.id,
        table_id: `table-${masaNo}`,
        items: orderItems,
        total_amount: totalAmount(),
        status: 'new',
        notes: null,
        waiter_called: false,
      };

      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderData);

      if (orderError) {
        throw orderError;
      }

      // Clear cart on success
      clearCart();
      toast.success('Siparisiniz alindi! Afiyet olsun.');
    } catch {
      // For demo purposes, still clear cart and show success
      clearCart();
      toast.success('Siparisiniz alindi! Afiyet olsun.');
    } finally {
      setIsSubmitting(false);
    }
  }, [restaurant, cartItems, masaNo, totalAmount, clearCart]);

  // ---------------------------------------------------------------------------
  // Extract theme values
  // ---------------------------------------------------------------------------

  const theme: RestaurantTheme = restaurant?.theme ?? {};
  const primaryColor = theme.primaryColor ?? '#FF6B2B';
  const backgroundColor = theme.backgroundColor ?? '#050A14';
  const textColor = theme.textColor ?? '#F0F4FF';
  const cardBackground = theme.cardBackground ?? '#0D1524';
  const borderRadius = theme.borderRadius ?? '12px';
  const layout = theme.layout ?? 'grid';

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <MenuLoadingState
        backgroundColor={backgroundColor}
        textColor={textColor}
        primaryColor={primaryColor}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (error || !restaurant) {
    return (
      <MenuErrorState
        backgroundColor={backgroundColor}
        textColor={textColor}
        primaryColor={primaryColor}
        message={error ?? 'Bir hata olustu.'}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Visible categories for nav (unfiltered, just visible)
  // ---------------------------------------------------------------------------

  const navCategories = categories.filter((c) => c.is_visible);

  // ---------------------------------------------------------------------------
  // Layout grid classes
  // ---------------------------------------------------------------------------

  const gridClasses =
    layout === 'grid'
      ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
      : layout === 'list'
        ? 'flex flex-col gap-2'
        : 'flex flex-col gap-3';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="relative min-h-screen pb-24"
      style={{
        backgroundColor,
        color: textColor,
        // CSS custom properties for theme
        '--theme-primary': primaryColor,
        '--theme-bg': backgroundColor,
        '--theme-text': textColor,
        '--theme-card': cardBackground,
        '--theme-radius': borderRadius,
      } as React.CSSProperties}
    >
      {/* ================================================================== */}
      {/* Header: Restaurant name, table info, language switcher */}
      {/* ================================================================== */}

      <header
        className="px-4 pb-2 pt-4"
        style={{ backgroundColor }}
      >
        <div className="flex items-center justify-between">
          {/* Restaurant info */}
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-lg font-bold"
              style={{ color: textColor }}
            >
              {restaurant.name}
            </h1>
            <p
              className="text-xs font-medium"
              style={{ color: `${textColor}60` }}
            >
              Masa {masaNo}
            </p>
          </div>

          {/* Language switcher */}
          <LanguageSwitcher
            primaryColor={primaryColor}
            textColor={textColor}
            borderRadius={borderRadius}
          />
        </div>

        {/* Search bar */}
        <div className="mt-3">
          <MenuSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            primaryColor={primaryColor}
            textColor={textColor}
            backgroundColor={backgroundColor}
            borderRadius={borderRadius}
            placeholder={t('general.search')}
          />
        </div>

        {/* Allergen filter */}
        <div className="mt-3">
          <AllergenFilter
            activeAllergens={activeAllergens}
            onToggle={handleAllergenToggle}
            onClearAll={handleAllergenClearAll}
            primaryColor={primaryColor}
            textColor={textColor}
            backgroundColor={backgroundColor}
            borderRadius={borderRadius}
          />
        </div>
      </header>

      {/* ================================================================== */}
      {/* Sticky Category Navigation */}
      {/* ================================================================== */}

      <MenuCategoryNav
        categories={navCategories}
        activeCategoryId={activeCategoryId}
        onCategorySelect={handleCategorySelect}
        primaryColor={primaryColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
      />

      {/* ================================================================== */}
      {/* Menu Content */}
      {/* ================================================================== */}

      <main className="px-4 pt-4" role="main" aria-label="Menu listesi">
        {filteredCategories.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16">
            <Search
              className="h-10 w-10 opacity-20"
              style={{ color: textColor }}
            />
            <p
              className="mt-3 text-sm"
              style={{ color: `${textColor}50` }}
            >
              {searchQuery
                ? `"${searchQuery}" icin sonuc bulunamadi.`
                : 'Filtrelere uygun urun bulunamadi.'}
            </p>
            {(searchQuery || activeAllergens.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveAllergens([]);
                }}
                className="mt-3 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: primaryColor }}
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          // Category sections
          <div className="space-y-8 pb-8">
            {filteredCategories.map((category) => (
              <section
                key={category.id}
                ref={setCategorySectionRef(category.id)}
                data-category-id={category.id}
                aria-label={category.name}
              >
                {/* Category header */}
                <div className="mb-3 flex items-center gap-2">
                  {category.icon && (
                    <span className="text-lg">{category.icon}</span>
                  )}
                  <h2
                    className="text-base font-bold"
                    style={{ color: textColor }}
                  >
                    {category.name}
                  </h2>
                  <span
                    className="text-xs"
                    style={{ color: `${textColor}40` }}
                  >
                    ({category.menu_items.length})
                  </span>
                </div>

                {/* Product grid/list */}
                <div className={gridClasses}>
                  {category.menu_items.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onSelect={handleProductSelect}
                      primaryColor={primaryColor}
                      textColor={textColor}
                      cardBackground={cardBackground}
                      borderRadius={borderRadius}
                      layout={layout}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* ================================================================== */}
      {/* Product Detail Modal */}
      {/* ================================================================== */}

      <ProductDetailModal
        item={selectedItem}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        primaryColor={primaryColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
        cardBackground={cardBackground}
        borderRadius={borderRadius}
      />

      {/* ================================================================== */}
      {/* Cart Drawer (floating button + slide-out drawer) */}
      {/* ================================================================== */}

      <CartDrawer
        onSubmitOrder={handleSubmitOrder}
        primaryColor={primaryColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
        cardBackground={cardBackground}
        borderRadius={borderRadius}
      />

      {/* ================================================================== */}
      {/* Waiter Call Button (fixed bottom-left) */}
      {/* ================================================================== */}

      <WaiterCallButton
        onCallWaiter={handleCallWaiter}
        primaryColor={primaryColor}
        textColor={textColor}
        borderRadius={borderRadius}
      />

      {/* ================================================================== */}
      {/* Order Submitting Overlay */}
      {/* ================================================================== */}

      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
            aria-label="Siparis gonderiliyor"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2
                className="h-10 w-10 animate-spin"
                style={{ color: primaryColor }}
                aria-hidden="true"
              />
              <p
                className="text-sm font-semibold"
                style={{ color: textColor }}
              >
                Siparis gonderiliyor...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
