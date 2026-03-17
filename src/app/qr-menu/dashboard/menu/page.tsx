'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Upload,
  Download,
  Percent,
  Sparkles,
  Loader2,
  LayoutGrid,
  List,
  UtensilsCrossed,
  Package,
  AlertTriangle,
  X,
  Check,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import CategorySortable, { type MenuCategory as SortableCategory } from '@/components/qr-menu/CategorySortable';
import MenuItemCard, { MenuItemFormModal } from '@/components/qr-menu/MenuItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type {
  MenuCategory,
  MenuItem,
  MenuCategoryInsert,
  MenuItemInsert,
} from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_RESTAURANT_ID = 'demo-restaurant-001';

// ---------------------------------------------------------------------------
// Mock Data - used when Supabase is not connected
// ---------------------------------------------------------------------------

const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: 'cat-1',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Ana Yemekler',
    icon: 'steak',
    color: '#FF6B2B',
    sort_order: 0,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Pizzalar',
    icon: 'pizza',
    color: '#7C3AED',
    sort_order: 1,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Salatalar',
    icon: 'salad',
    color: '#10B981',
    sort_order: 2,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Icecekler',
    icon: 'drink',
    color: '#00D4FF',
    sort_order: 3,
    is_visible: true,
    available_from: null,
    available_until: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Tatlilar',
    icon: 'dessert',
    color: '#EC4899',
    sort_order: 4,
    is_visible: true,
    available_from: '14:00',
    available_until: '23:00',
    created_at: new Date().toISOString(),
  },
];

const MOCK_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    category_id: 'cat-1',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Izgara Kofte',
    description: 'El yapimi kofte, yaninda pilav ve salata ile servis edilir.',
    price: 180,
    image_url: null,
    calories: 450,
    prep_time: 20,
    allergens: ['gluten'],
    badges: ['populer'],
    modifiers: [
      {
        name: 'Pisirme tercihi',
        options: [
          { label: 'Az pismisc', price: 0 },
          { label: 'Orta', price: 0 },
          { label: 'Cok pismisc', price: 0 },
        ],
      },
    ],
    is_available: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    category_id: 'cat-1',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Adana Kebap',
    description: 'Aci biber ile hazirlanmis ozel Adana kebabi.',
    price: 220,
    image_url: null,
    calories: 520,
    prep_time: 25,
    allergens: ['gluten', 'sut'],
    badges: ['acili', 'sefin_onerisi'],
    modifiers: [
      {
        name: 'Boyut sec',
        options: [
          { label: 'Tek', price: 0 },
          { label: 'Buçuk', price: 50 },
        ],
      },
    ],
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-3',
    category_id: 'cat-1',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Karisik Izgara',
    description: 'Kuzu pirzola, tavuk kanat ve kofte cesitleri.',
    price: 350,
    image_url: null,
    calories: 780,
    prep_time: 30,
    allergens: [],
    badges: ['populer'],
    modifiers: [],
    is_available: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-4',
    category_id: 'cat-2',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Karisik Pizza',
    description: 'Sucuk, salam, mantar, biber, zeytin ve mozzarella peyniri.',
    price: 160,
    image_url: null,
    calories: 620,
    prep_time: 20,
    allergens: ['gluten', 'sut'],
    badges: ['populer'],
    modifiers: [
      {
        name: 'Boyut sec',
        options: [
          { label: 'Kucuk', price: 0 },
          { label: 'Orta', price: 30 },
          { label: 'Buyuk', price: 60 },
        ],
      },
      {
        name: 'Ekstra malzeme',
        options: [
          { label: 'Peynir', price: 15 },
          { label: 'Mantar', price: 10 },
          { label: 'Sucuk', price: 20 },
        ],
      },
    ],
    is_available: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-5',
    category_id: 'cat-2',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Margarita Pizza',
    description: 'Taze domates, mozzarella ve feslegenli klasik pizza.',
    price: 130,
    image_url: null,
    calories: 480,
    prep_time: 18,
    allergens: ['gluten', 'sut'],
    badges: ['vegan'],
    modifiers: [],
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-6',
    category_id: 'cat-3',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Sezar Salata',
    description: 'Izgara tavuk, marul, kruton, parmesan ve sezar sos.',
    price: 120,
    image_url: null,
    calories: 320,
    prep_time: 10,
    allergens: ['gluten', 'sut', 'yumurta'],
    badges: [],
    modifiers: [
      {
        name: 'Ekstra',
        options: [
          { label: 'Ekstra tavuk', price: 25 },
          { label: 'Avokado', price: 20 },
        ],
      },
    ],
    is_available: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-7',
    category_id: 'cat-4',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Taze Limonata',
    description: 'Taze sikilmis limon, nane ve buz.',
    price: 45,
    image_url: null,
    calories: 80,
    prep_time: 5,
    allergens: [],
    badges: ['yeni'],
    modifiers: [],
    is_available: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-8',
    category_id: 'cat-4',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Ayran',
    description: 'Geleneksel Turk ayranii.',
    price: 25,
    image_url: null,
    calories: 60,
    prep_time: 2,
    allergens: ['sut'],
    badges: [],
    modifiers: [],
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-9',
    category_id: 'cat-5',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Kunefe',
    description: 'Sicak servis edilen geleneksel kunefe, antep fistigi ile.',
    price: 95,
    image_url: null,
    calories: 420,
    prep_time: 15,
    allergens: ['gluten', 'sut', 'fistik'],
    badges: ['populer', 'sefin_onerisi'],
    modifiers: [],
    is_available: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-10',
    category_id: 'cat-5',
    restaurant_id: MOCK_RESTAURANT_ID,
    name: 'Sutlac',
    description: 'Firin sutlac, tarifimize ozel.',
    price: 65,
    image_url: null,
    calories: 280,
    prep_time: 5,
    allergens: ['sut', 'gluten'],
    badges: [],
    modifiers: [],
    is_available: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Helper: Generate UUID (client-side fallback)
// ---------------------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

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
// CSV Helpers
// ---------------------------------------------------------------------------

function itemsToCSV(items: MenuItem[], categories: MenuCategory[]): string {
  const header = 'Kategori,Urun Adi,Aciklama,Fiyat,Kalori,Hazirlanma (dk),Alerjenler,Etiketler,Stokta';
  const rows = items.map((item) => {
    const catName = categories.find((c) => c.id === item.category_id)?.name ?? '';
    const allergens = item.allergens.join(';');
    const badges = item.badges.join(';');
    const desc = (item.description ?? '').replace(/"/g, '""');
    return `"${catName}","${item.name}","${desc}",${item.price},${item.calories ?? 0},${item.prep_time ?? 0},"${allergens}","${badges}",${item.is_available ? 'Evet' : 'Hayir'}`;
  });
  return [header, ...rows].join('\n');
}

function downloadCSV(csvContent: string, filename: string) {
  const bom = '\uFEFF'; // UTF-8 BOM for Turkish characters
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// BulkPriceModal
// ---------------------------------------------------------------------------

interface BulkPriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (type: 'increase' | 'discount', percentage: number) => void;
}

function BulkPriceModal({ open, onOpenChange, onApply }: BulkPriceModalProps) {
  const [type, setType] = useState<'increase' | 'discount'>('increase');
  const [percentage, setPercentage] = useState('10');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = parseFloat(percentage);
      if (isNaN(value) || value <= 0 || value > 100) {
        toast.error('Gecerli bir yuzde degeri giriniz (1-100)');
        return;
      }
      onApply(type, value);
      onOpenChange(false);
      setPercentage('10');
    },
    [type, percentage, onApply, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-main">Toplu Fiyat Guncelleme</DialogTitle>
          <DialogDescription className="text-text-muted">
            Secili kategorideki tum urunlere yuzdelik fiyat degisikligi uygulayin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selection */}
          <div className="space-y-2">
            <Label className="text-text-main">Islem Turu</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('increase')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                  type === 'increase'
                    ? 'border-accent-orange/40 bg-accent-orange/10 text-accent-orange'
                    : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                )}
              >
                <Percent className="h-4 w-4" />
                Zam Uygula
              </button>
              <button
                type="button"
                onClick={() => setType('discount')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                  type === 'discount'
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                )}
              >
                <Percent className="h-4 w-4" />
                Indirim Uygula
              </button>
            </div>
          </div>

          {/* Percentage input */}
          <div className="space-y-2">
            <Label htmlFor="bulk-percentage" className="text-text-main">
              Yuzde (%)
            </Label>
            <div className="relative">
              <Input
                id="bulk-percentage"
                type="number"
                min="1"
                max="100"
                step="0.1"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="border-white/10 bg-white/5 pr-8 text-text-main placeholder:text-text-muted/50 focus:border-accent-orange focus:ring-accent-orange/50"
                placeholder="10"
                autoFocus
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                %
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {type === 'increase'
                ? `Tum fiyatlar %${percentage || '0'} arttirilacak.`
                : `Tum fiyatlar %${percentage || '0'} indirilecek.`}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-text-muted hover:text-text-main"
            >
              <X className="mr-1.5 h-4 w-4" />
              Iptal
            </Button>
            <Button
              type="submit"
              className={cn(
                'text-white',
                type === 'increase'
                  ? 'bg-accent-orange hover:bg-accent-orange/90'
                  : 'bg-emerald-500 hover:bg-emerald-500/90'
              )}
            >
              <Check className="mr-1.5 h-4 w-4" />
              Uygula
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeletons
// ---------------------------------------------------------------------------

function CategoryListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component: MenuManagementPage
// ---------------------------------------------------------------------------

export default function MenuManagementPage() {
  // State
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [restaurantSlug, setRestaurantSlug] = useState('lezzet-duragi');

  // Modal states
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // ---------------------------------------------------------------------------
  // Data Loading - try Supabase first, fallback to mock data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const supabase = createClient();

        // Fetch restaurant slug for current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: restaurant } = await supabase
            .from('restaurants')
            .select('slug')
            .eq('owner_id', user.id)
            .single();
          if (restaurant?.slug) setRestaurantSlug(restaurant.slug);
        }

        // Attempt to fetch categories
        const { data: catData, error: catError } = await supabase
          .from('menu_categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (catError) throw catError;

        // Attempt to fetch items
        const { data: itemData, error: itemError } = await supabase
          .from('menu_items')
          .select('*')
          .order('sort_order', { ascending: true });

        if (itemError) throw itemError;

        setCategories(catData ?? []);
        setItems(itemData ?? []);

        // Auto-select first category if available
        if (catData && catData.length > 0) {
          setSelectedCategoryId(catData[0].id);
        }
      } catch {
        // Fallback to mock data when Supabase is not available
        setCategories(MOCK_CATEGORIES);
        setItems(MOCK_ITEMS);
        setSelectedCategoryId(MOCK_CATEGORIES[0]?.id ?? null);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // ---------------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------------

  const sortableCategories: SortableCategory[] = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon ?? 'coffee',
        color: c.color ?? '#FF6B2B',
        sort_order: c.sort_order,
        is_visible: c.is_visible,
        available_from: c.available_from,
        available_until: c.available_until,
      })),
    [categories]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by selected category
    if (selectedCategoryId) {
      result = result.filter((item) => item.category_id === selectedCategoryId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description?.toLowerCase().includes(query) ?? false)
      );
    }

    return result;
  }, [items, selectedCategoryId, searchQuery]);

  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.category_id] = (counts[item.category_id] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const totalItems = items.length;
  const availableItems = items.filter((i) => i.is_available).length;
  const outOfStockItems = totalItems - availableItems;

  // ---------------------------------------------------------------------------
  // Category Handlers
  // ---------------------------------------------------------------------------

  const handleCategoryReorder = useCallback(
    async (reordered: SortableCategory[]) => {
      // Update local state immediately for optimistic UI
      setCategories((prev) =>
        prev.map((cat) => {
          const reorderedCat = reordered.find((r) => r.id === cat.id);
          return reorderedCat ? { ...cat, sort_order: reorderedCat.sort_order } : cat;
        }).sort((a, b) => a.sort_order - b.sort_order)
      );

      // Persist to Supabase
      try {
        const supabase = createClient();
        const updates = reordered.map((cat) =>
          supabase
            .from('menu_categories')
            .update({ sort_order: cat.sort_order })
            .eq('id', cat.id)
        );
        await Promise.all(updates);
      } catch {
        // Silent fail - local state is already updated
      }
    },
    []
  );

  const handleCategoryAdd = useCallback(
    async (category: Omit<SortableCategory, 'id' | 'sort_order'>) => {
      const newId = generateId();
      const newSortOrder = categories.length;
      const newCategory: MenuCategory = {
        id: newId,
        restaurant_id: MOCK_RESTAURANT_ID,
        name: category.name,
        icon: category.icon,
        color: category.color,
        sort_order: newSortOrder,
        is_visible: category.is_visible,
        available_from: category.available_from,
        available_until: category.available_until,
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      setCategories((prev) => [...prev, newCategory]);

      // Auto-select new category if none selected
      if (!selectedCategoryId) {
        setSelectedCategoryId(newId);
      }

      toast.success(`"${category.name}" kategorisi eklendi`);

      // Persist to Supabase
      try {
        const supabase = createClient();
        const insert: MenuCategoryInsert = {
          id: newId,
          restaurant_id: MOCK_RESTAURANT_ID,
          name: category.name,
          icon: category.icon,
          color: category.color,
          sort_order: newSortOrder,
          is_visible: category.is_visible,
          available_from: category.available_from,
          available_until: category.available_until,
        };
        await supabase.from('menu_categories').insert(insert);
      } catch {
        // Silent fail - local state is already updated
      }
    },
    [categories.length, selectedCategoryId]
  );

  const handleCategoryEdit = useCallback(async (category: SortableCategory) => {
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id
          ? {
              ...c,
              name: category.name,
              icon: category.icon,
              color: category.color,
              is_visible: category.is_visible,
              available_from: category.available_from,
              available_until: category.available_until,
            }
          : c
      )
    );

    toast.success(`"${category.name}" guncellendi`);

    // Persist to Supabase
    try {
      const supabase = createClient();
      await supabase
        .from('menu_categories')
        .update({
          name: category.name,
          icon: category.icon,
          color: category.color,
          is_visible: category.is_visible,
          available_from: category.available_from,
          available_until: category.available_until,
        })
        .eq('id', category.id);
    } catch {
      // Silent fail
    }
  }, []);

  const handleCategoryDelete = useCallback(
    async (categoryId: string) => {
      const cat = categories.find((c) => c.id === categoryId);
      const itemCount = categoryItemCounts[categoryId] ?? 0;

      if (itemCount > 0) {
        toast.error(`"${cat?.name}" kategorisinde ${itemCount} urun var. Once urunleri silin veya tasyin.`);
        return;
      }

      // Optimistic update
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));

      // If deleted category was selected, select the first remaining
      if (selectedCategoryId === categoryId) {
        const remaining = categories.filter((c) => c.id !== categoryId);
        setSelectedCategoryId(remaining[0]?.id ?? null);
      }

      toast.success(`"${cat?.name}" silindi`);

      // Persist to Supabase
      try {
        const supabase = createClient();
        await supabase.from('menu_categories').delete().eq('id', categoryId);
      } catch {
        // Silent fail
      }
    },
    [categories, categoryItemCounts, selectedCategoryId]
  );

  const handleCategoryToggleVisibility = useCallback(
    async (categoryId: string, visible: boolean) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, is_visible: visible } : c))
      );

      const cat = categories.find((c) => c.id === categoryId);
      toast.success(`"${cat?.name}" ${visible ? 'gorunur yapildi' : 'gizlendi'}`);

      try {
        const supabase = createClient();
        await supabase
          .from('menu_categories')
          .update({ is_visible: visible })
          .eq('id', categoryId);
      } catch {
        // Silent fail
      }
    },
    [categories]
  );

  // ---------------------------------------------------------------------------
  // Item Handlers
  // ---------------------------------------------------------------------------

  const handleItemSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!selectedCategoryId && !editingItem) {
        toast.error('Once bir kategori secin');
        return;
      }

      setIsSubmittingItem(true);

      try {
        if (editingItem) {
          // Update existing item
          const updatedItem: MenuItem = {
            ...editingItem,
            name: data.name as string,
            description: (data.description as string) || null,
            price: data.price as number,
            image_url: (data.image_url as string) || null,
            calories: (data.calories as number) || null,
            prep_time: (data.prep_time as number) || null,
            allergens: (data.allergens as string[]) ?? [],
            badges: (data.badges as string[]) ?? [],
            modifiers: (data.modifiers as MenuItem['modifiers']) ?? [],
            is_available: data.is_available as boolean,
          };

          setItems((prev) =>
            prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          );

          toast.success(`"${updatedItem.name}" guncellendi`);

          // Persist to Supabase
          try {
            const supabase = createClient();
            await supabase
              .from('menu_items')
              .update({
                name: updatedItem.name,
                description: updatedItem.description,
                price: updatedItem.price,
                image_url: updatedItem.image_url,
                calories: updatedItem.calories,
                prep_time: updatedItem.prep_time,
                allergens: updatedItem.allergens,
                badges: updatedItem.badges,
                modifiers: updatedItem.modifiers,
                is_available: updatedItem.is_available,
              })
              .eq('id', editingItem.id);
          } catch {
            // Silent fail
          }
        } else {
          // Create new item
          const newId = generateId();
          const categoryId = selectedCategoryId!;
          const sortOrder = items.filter((i) => i.category_id === categoryId).length;

          const newItem: MenuItem = {
            id: newId,
            category_id: categoryId,
            restaurant_id: MOCK_RESTAURANT_ID,
            name: data.name as string,
            description: (data.description as string) || null,
            price: data.price as number,
            image_url: (data.image_url as string) || null,
            calories: (data.calories as number) || null,
            prep_time: (data.prep_time as number) || null,
            allergens: (data.allergens as string[]) ?? [],
            badges: (data.badges as string[]) ?? [],
            modifiers: (data.modifiers as MenuItem['modifiers']) ?? [],
            is_available: data.is_available as boolean,
            sort_order: sortOrder,
            created_at: new Date().toISOString(),
          };

          setItems((prev) => [...prev, newItem]);
          toast.success(`"${newItem.name}" eklendi`);

          // Persist to Supabase
          try {
            const supabase = createClient();
            const insert: MenuItemInsert = {
              id: newId,
              category_id: categoryId,
              restaurant_id: MOCK_RESTAURANT_ID,
              name: newItem.name,
              description: newItem.description,
              price: newItem.price,
              image_url: newItem.image_url,
              calories: newItem.calories,
              prep_time: newItem.prep_time,
              allergens: newItem.allergens,
              badges: newItem.badges,
              modifiers: newItem.modifiers,
              is_available: newItem.is_available,
              sort_order: sortOrder,
            };
            await supabase.from('menu_items').insert(insert);
          } catch {
            // Silent fail
          }
        }

        setIsItemFormOpen(false);
        setEditingItem(null);
      } finally {
        setIsSubmittingItem(false);
      }
    },
    [editingItem, selectedCategoryId, items]
  );

  const handleItemEdit = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  }, []);

  const handleItemDelete = useCallback(async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.success(`"${item?.name}" silindi`);

    try {
      const supabase = createClient();
      await supabase.from('menu_items').delete().eq('id', itemId);
    } catch {
      // Silent fail
    }
  }, [items]);

  const handleItemCopy = useCallback(
    async (item: MenuItem) => {
      const newId = generateId();
      const sortOrder = items.filter((i) => i.category_id === item.category_id).length;

      const copiedItem: MenuItem = {
        ...item,
        id: newId,
        name: `${item.name} (Kopya)`,
        sort_order: sortOrder,
        created_at: new Date().toISOString(),
      };

      setItems((prev) => [...prev, copiedItem]);
      toast.success(`"${item.name}" kopyalandi`);

      try {
        const supabase = createClient();
        const insert: MenuItemInsert = {
          id: newId,
          category_id: copiedItem.category_id,
          restaurant_id: copiedItem.restaurant_id,
          name: copiedItem.name,
          description: copiedItem.description,
          price: copiedItem.price,
          image_url: copiedItem.image_url,
          calories: copiedItem.calories,
          prep_time: copiedItem.prep_time,
          allergens: copiedItem.allergens,
          badges: copiedItem.badges,
          modifiers: copiedItem.modifiers,
          is_available: copiedItem.is_available,
          sort_order: sortOrder,
        };
        await supabase.from('menu_items').insert(insert);
      } catch {
        // Silent fail
      }
    },
    [items]
  );

  const handleItemToggleStock = useCallback(
    async (itemId: string, available: boolean) => {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_available: available } : i))
      );

      const item = items.find((i) => i.id === itemId);
      toast.success(`"${item?.name}" ${available ? 'stokta' : 'tukendi olarak isaretlendi'}`);

      try {
        const supabase = createClient();
        await supabase
          .from('menu_items')
          .update({ is_available: available })
          .eq('id', itemId);
      } catch {
        // Silent fail
      }
    },
    [items]
  );

  // ---------------------------------------------------------------------------
  // Bulk Price Update
  // ---------------------------------------------------------------------------

  const handleBulkPriceUpdate = useCallback(
    async (type: 'increase' | 'discount', percentage: number) => {
      if (!selectedCategoryId) {
        toast.error('Once bir kategori secin');
        return;
      }

      const multiplier = type === 'increase' ? 1 + percentage / 100 : 1 - percentage / 100;
      const categoryItems = items.filter((i) => i.category_id === selectedCategoryId);

      if (categoryItems.length === 0) {
        toast.error('Bu kategoride urun bulunmuyor');
        return;
      }

      setIsSaving(true);

      const updatedItems = items.map((item) => {
        if (item.category_id !== selectedCategoryId) return item;
        return {
          ...item,
          price: Math.round(item.price * multiplier * 100) / 100,
        };
      });

      setItems(updatedItems);

      const catName = selectedCategory?.name ?? '';
      const action = type === 'increase' ? 'zamlandirildi' : 'indirildi';
      toast.success(`${catName} kategorisindeki ${categoryItems.length} urun fiyati %${percentage} ${action}`);

      // Persist to Supabase
      try {
        const supabase = createClient();
        const updates = updatedItems
          .filter((i) => i.category_id === selectedCategoryId)
          .map((item) =>
            supabase
              .from('menu_items')
              .update({ price: item.price })
              .eq('id', item.id)
          );
        await Promise.all(updates);
      } catch {
        // Silent fail
      } finally {
        setIsSaving(false);
      }
    },
    [items, selectedCategoryId, selectedCategory]
  );

  // ---------------------------------------------------------------------------
  // CSV Export
  // ---------------------------------------------------------------------------

  const handleCSVExport = useCallback(() => {
    const csv = itemsToCSV(items, categories);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `menu-${timestamp}.csv`);
    toast.success('CSV dosyasi indirildi');
  }, [items, categories]);

  // ---------------------------------------------------------------------------
  // CSV Import
  // ---------------------------------------------------------------------------

  const handleCSVImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const rows = parseCSV(text);

        if (rows.length < 2) {
          toast.error('CSV dosyasi bos veya hatali format');
          return;
        }

        // Skip header row
        const dataRows = rows.slice(1);
        let importedCount = 0;

        for (const row of dataRows) {
          if (row.length < 4) continue;

          const [catName, name, description, priceStr, caloriesStr, prepTimeStr, allergensStr, badgesStr, stockStr] = row;

          if (!name?.trim()) continue;

          // Find or create category
          let category = categories.find(
            (c) => c.name.toLowerCase() === catName?.toLowerCase()
          );

          if (!category && catName?.trim()) {
            const newCatId = generateId();
            const newCategory: MenuCategory = {
              id: newCatId,
              restaurant_id: MOCK_RESTAURANT_ID,
              name: catName.trim(),
              icon: 'coffee',
              color: '#FF6B2B',
              sort_order: categories.length,
              is_visible: true,
              available_from: null,
              available_until: null,
              created_at: new Date().toISOString(),
            };
            setCategories((prev) => [...prev, newCategory]);
            category = newCategory;
          }

          if (!category) continue;

          const newItem: MenuItem = {
            id: generateId(),
            category_id: category.id,
            restaurant_id: MOCK_RESTAURANT_ID,
            name: name.trim(),
            description: description?.trim() || null,
            price: parseFloat(priceStr ?? '0') || 0,
            image_url: null,
            calories: parseInt(caloriesStr ?? '0', 10) || null,
            prep_time: parseInt(prepTimeStr ?? '0', 10) || null,
            allergens: allergensStr ? allergensStr.split(';').filter(Boolean) : [],
            badges: badgesStr ? badgesStr.split(';').filter(Boolean) : [],
            modifiers: [],
            is_available: stockStr?.toLowerCase() !== 'hayir',
            sort_order: items.filter((i) => i.category_id === category!.id).length + importedCount,
            created_at: new Date().toISOString(),
          };

          setItems((prev) => [...prev, newItem]);
          importedCount++;
        }

        if (importedCount > 0) {
          toast.success(`${importedCount} urun basariyla iceri aktarildi`);
        } else {
          toast.error('Iceri aktarilacak urun bulunamadi');
        }
      } catch {
        toast.error('CSV dosyasi okunurken hata olustu');
      }
    };
    input.click();
  }, [categories, items]);

  // ---------------------------------------------------------------------------
  // AI Description Mock
  // ---------------------------------------------------------------------------

  const handleAIDescription = useCallback(() => {
    toast.info('AI aciklama olusturucu yakinda kullanima sunulacak!', {
      description: 'Bu ozellik yapim asamasindadir. Menunuzdeki urunler icin otomatik aciklama olusturulacak.',
      duration: 4000,
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Category Selection
  // ---------------------------------------------------------------------------

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Menu Yonetimi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Kategorilerinizi ve urunlerinizi duzenleyin.
          </p>
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted">
            <Package className="h-3.5 w-3.5" />
            {totalItems} Urun
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            {availableItems} Stokta
          </div>
          {outOfStockItems > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-1.5 text-xs font-medium text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {outOfStockItems} Tukendi
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={handleCSVExport}
          variant="ghost"
          size="sm"
          className="border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-main"
        >
          <Download className="mr-1.5 h-4 w-4" />
          CSV Indir
        </Button>
        <Button
          onClick={handleCSVImport}
          variant="ghost"
          size="sm"
          className="border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-main"
        >
          <Upload className="mr-1.5 h-4 w-4" />
          CSV Yukle
        </Button>
        <Button
          onClick={() => setIsBulkPriceOpen(true)}
          variant="ghost"
          size="sm"
          className="border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-main"
          disabled={!selectedCategoryId}
        >
          <Percent className="mr-1.5 h-4 w-4" />
          Toplu Fiyat
        </Button>
        <Button
          onClick={handleAIDescription}
          variant="ghost"
          size="sm"
          className="border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-main"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          AI Aciklama
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="border border-accent-orange/30 bg-accent-orange/5 text-accent-orange hover:bg-accent-orange/10 hover:text-accent-orange"
          onClick={() => window.open(`/${restaurantSlug}/masa/1`, '_blank')}
        >
          <Eye className="mr-1.5 h-4 w-4" />
          QR Menuyu Gor
        </Button>

        {isSaving && (
          <div className="ml-2 inline-flex items-center gap-1.5 text-xs text-text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Kaydediliyor...
          </div>
        )}
      </div>

      {/* Main Layout: Categories (Left) + Items (Right) */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Panel: Categories */}
        <div className="space-y-4">
          {isLoading ? (
            <CategoryListSkeleton />
          ) : (
            <>
              <CategorySortable
                categories={sortableCategories}
                onReorder={handleCategoryReorder}
                onAdd={handleCategoryAdd}
                onEdit={handleCategoryEdit}
                onDelete={handleCategoryDelete}
                onToggleVisibility={handleCategoryToggleVisibility}
              />

              {/* Category selection list (clickable) */}
              {categories.length > 0 && (
                <div className="space-y-1">
                  <p className="px-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                    Kategori Sec
                  </p>
                  {categories.map((category) => {
                    const isSelected = category.id === selectedCategoryId;
                    const count = categoryItemCounts[category.id] ?? 0;

                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          isSelected
                            ? 'bg-accent-orange/10 text-accent-orange'
                            : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                        )}
                      >
                        <span className="truncate">{category.name}</span>
                        <span
                          className={cn(
                            'ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs',
                            isSelected
                              ? 'bg-accent-orange/20 text-accent-orange'
                              : 'bg-white/10 text-text-muted'
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {/* Show All option */}
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      !selectedCategoryId
                        ? 'bg-accent-orange/10 text-accent-orange'
                        : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                    )}
                  >
                    <span>Tum Urunler</span>
                    <span
                      className={cn(
                        'ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs',
                        !selectedCategoryId
                          ? 'bg-accent-orange/20 text-accent-orange'
                          : 'bg-white/10 text-text-muted'
                      )}
                    >
                      {totalItems}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel: Items */}
        <div className="space-y-4">
          {/* Items Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                  style={{ backgroundColor: `${selectedCategory.color ?? '#FF6B2B'}20` }}
                >
                  <UtensilsCrossed className="h-4 w-4" style={{ color: selectedCategory.color ?? '#FF6B2B' }} />
                </div>
              )}
              <h2 className="font-display text-lg font-bold text-text-main">
                {selectedCategory?.name ?? 'Tum Urunler'}
              </h2>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-text-muted">
                {filteredItems.length} urun
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Urun ara..."
                  className="h-9 border-white/10 bg-white/5 pl-9 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange focus:ring-accent-orange/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted transition-colors hover:text-text-main"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors',
                    viewMode === 'grid'
                      ? 'bg-accent-orange/10 text-accent-orange'
                      : 'text-text-muted hover:text-text-main'
                  )}
                  aria-label="Izgara gorunumu"
                  title="Izgara gorunumu"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors',
                    viewMode === 'list'
                      ? 'bg-accent-orange/10 text-accent-orange'
                      : 'text-text-muted hover:text-text-main'
                  )}
                  aria-label="Liste gorunumu"
                  title="Liste gorunumu"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Add item button */}
              <motion.button
                onClick={() => {
                  setEditingItem(null);
                  setIsItemFormOpen(true);
                }}
                disabled={!selectedCategoryId}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={!selectedCategoryId ? 'Once bir kategori secin' : 'Yeni urun ekle'}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Urun Ekle</span>
              </motion.button>
            </div>
          </div>

          {/* Items Content */}
          {isLoading ? (
            <ItemGridSkeleton />
          ) : filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center"
            >
              {searchQuery ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                    <Search className="h-7 w-7 text-text-muted" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-text-main">
                    Sonuc bulunamadi
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-text-muted">
                    &ldquo;{searchQuery}&rdquo; ile eslesen urun bulunamadi.
                  </p>
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="ghost"
                    className="mt-4 text-accent-orange hover:text-accent-orange/80"
                  >
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Aramayi Temizle
                  </Button>
                </>
              ) : selectedCategoryId ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-orange/10">
                    <Plus className="h-7 w-7 text-accent-orange" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-text-main">
                    Bu kategoride urun yok
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-text-muted">
                    Ilk urunumuzu ekleyerek menunuzu olusturmaya baslayin.
                  </p>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setIsItemFormOpen(true);
                    }}
                    className="mt-5 bg-accent-orange text-white hover:bg-accent-orange/90"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Ilk Urunu Ekle
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                    <UtensilsCrossed className="h-7 w-7 text-text-muted" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-text-main">
                    Kategori secin
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-text-muted">
                    Sol panelden bir kategori secerek urunleri goruntuleyebilirsiniz.
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div
                className={cn(
                  'gap-4',
                  viewMode === 'grid'
                    ? 'grid sm:grid-cols-2'
                    : 'flex flex-col'
                )}
              >
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleItemEdit}
                    onDelete={handleItemDelete}
                    onCopy={handleItemCopy}
                    onToggleStock={handleItemToggleStock}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Menu Item Form Modal */}
      <MenuItemFormModal
        open={isItemFormOpen}
        onOpenChange={(open) => {
          setIsItemFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        initialData={editingItem}
        onSubmit={handleItemSubmit}
        isSubmitting={isSubmittingItem}
      />

      {/* Bulk Price Modal */}
      <BulkPriceModal
        open={isBulkPriceOpen}
        onOpenChange={setIsBulkPriceOpen}
        onApply={handleBulkPriceUpdate}
      />
    </div>
  );
}
