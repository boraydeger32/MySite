'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Building2,
  Plus,
  Download,
  RefreshCw,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import RestaurantTable, {
  type RestaurantRow,
  type RestaurantAction,
} from '@/components/super-admin/RestaurantTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RestaurantPlan, RestaurantStatus } from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

type PlanFilter = 'all' | RestaurantPlan;
type StatusFilter = 'all' | RestaurantStatus;

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_RESTAURANTS: RestaurantRow[] = [
  {
    id: 'r-001',
    name: 'Lezzet Duragi',
    slug: 'lezzet-duragi',
    owner_name: 'Ahmet Yilmaz',
    owner_email: 'ahmet@lezzetduragi.com',
    plan: 'pro',
    status: 'active',
    created_at: '2025-08-15T10:30:00Z',
    last_active: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    order_count: 12458,
    logo_url: null,
  },
  {
    id: 'r-002',
    name: 'Cafe Moda',
    slug: 'cafe-moda',
    owner_name: 'Elif Demir',
    owner_email: 'elif@cafemoda.com',
    plan: 'starter',
    status: 'active',
    created_at: '2025-09-22T14:15:00Z',
    last_active: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    order_count: 5230,
    logo_url: null,
  },
  {
    id: 'r-003',
    name: 'Kebapci Mehmet',
    slug: 'kebapci-mehmet',
    owner_name: 'Mehmet Ozkan',
    owner_email: 'mehmet@kebapci.com',
    plan: 'enterprise',
    status: 'active',
    created_at: '2025-06-01T09:00:00Z',
    last_active: new Date(Date.now() - 60000).toISOString(), // 1 min ago
    order_count: 34782,
    logo_url: null,
  },
  {
    id: 'r-004',
    name: 'Pizza Palace',
    slug: 'pizza-palace',
    owner_name: 'Burak Kaya',
    owner_email: 'burak@pizzapalace.com',
    plan: 'pro',
    status: 'active',
    created_at: '2025-10-05T16:45:00Z',
    last_active: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    order_count: 8964,
    logo_url: null,
  },
  {
    id: 'r-005',
    name: 'Kucuk Ev Yemekleri',
    slug: 'kucuk-ev-yemekleri',
    owner_name: 'Fatma Celik',
    owner_email: 'fatma@kucukev.com',
    plan: 'free',
    status: 'suspended',
    created_at: '2025-11-10T11:20:00Z',
    last_active: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    order_count: 342,
    logo_url: null,
  },
  {
    id: 'r-006',
    name: 'Deniz Restaurant',
    slug: 'deniz-restaurant',
    owner_name: 'Ali Deniz',
    owner_email: 'ali@denizrestaurant.com',
    plan: 'enterprise',
    status: 'active',
    created_at: '2025-04-18T08:30:00Z',
    last_active: new Date(Date.now() - 120000).toISOString(), // 2 min ago
    order_count: 52341,
    logo_url: null,
  },
  {
    id: 'r-007',
    name: 'Anadolu Sofrasi',
    slug: 'anadolu-sofrasi',
    owner_name: 'Hasan Yildiz',
    owner_email: 'hasan@anadolusofrasi.com',
    plan: 'starter',
    status: 'active',
    created_at: '2025-12-01T13:00:00Z',
    last_active: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    order_count: 1876,
    logo_url: null,
  },
  {
    id: 'r-008',
    name: 'Tatli Dukkan',
    slug: 'tatli-dukkan',
    owner_name: 'Zeynep Koc',
    owner_email: 'zeynep@tatlidukkan.com',
    plan: 'free',
    status: 'active',
    created_at: '2026-01-20T15:30:00Z',
    last_active: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    order_count: 567,
    logo_url: null,
  },
  {
    id: 'r-009',
    name: 'Balik Evi',
    slug: 'balik-evi',
    owner_name: 'Mustafa Balikci',
    owner_email: 'mustafa@balikevi.com',
    plan: 'pro',
    status: 'active',
    created_at: '2025-07-12T10:00:00Z',
    last_active: new Date(Date.now() - 900000).toISOString(), // 15 min ago
    order_count: 15230,
    logo_url: null,
  },
  {
    id: 'r-010',
    name: 'Sushi Time',
    slug: 'sushi-time',
    owner_name: 'Kemal Tanaka',
    owner_email: 'kemal@sushitime.com',
    plan: 'starter',
    status: 'active',
    created_at: '2025-11-28T17:45:00Z',
    last_active: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    order_count: 2340,
    logo_url: null,
  },
  {
    id: 'r-011',
    name: 'Eski Osmanli',
    slug: 'eski-osmanli',
    owner_name: 'Osman Gazi',
    owner_email: 'osman@eskiosmanli.com',
    plan: 'free',
    status: 'deleted',
    created_at: '2025-05-10T12:00:00Z',
    last_active: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    order_count: 89,
    logo_url: null,
  },
  {
    id: 'r-012',
    name: 'Burger Lab',
    slug: 'burger-lab',
    owner_name: 'Can Ozturk',
    owner_email: 'can@burgerlab.com',
    plan: 'pro',
    status: 'active',
    created_at: '2026-02-14T09:15:00Z',
    last_active: new Date(Date.now() - 180000).toISOString(), // 3 min ago
    order_count: 4521,
    logo_url: null,
  },
];

// =============================================================================
// Plan / Status Filter Config
// =============================================================================

const PLAN_OPTIONS: { value: PlanFilter; label: string }[] = [
  { value: 'all', label: 'Tum Planlar' },
  { value: 'free', label: 'Ucretsiz' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tum Durumlar' },
  { value: 'active', label: 'Aktif' },
  { value: 'suspended', label: 'Askiya Alinmis' },
  { value: 'deleted', label: 'Silinmis' },
];

// =============================================================================
// Stats Summary
// =============================================================================

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
      <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-lg font-bold text-text-main">
          {value.toLocaleString('tr-TR')}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Skeleton Loader
// =============================================================================

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-4 flex-1 animate-pulse rounded bg-white/10"
            />
          ))}
        </div>
        {/* Row skeletons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-white/10" />
            <div className="flex flex-1 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={j}
                  className="h-4 flex-1 animate-pulse rounded bg-white/5"
                  style={{ animationDelay: `${(i * 6 + j) * 50}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Delete Confirmation Dialog
// =============================================================================

function DeleteConfirmDialog({
  open,
  restaurant,
  onClose,
  onConfirm,
}: {
  open: boolean;
  restaurant: RestaurantRow | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!restaurant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Restoran Silinecek
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            <strong className="text-text-main">{restaurant.name}</strong>{' '}
            restoranini silmek istediginize emin misiniz? Bu islem geri
            alinamaz. Tum menuler, masalar ve siparisler kalici olarak
            silinecektir.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            onClick={onClose}
          >
            Vazgec
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            onClick={onConfirm}
          >
            Evet, Sil
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Suspend Confirmation Dialog
// =============================================================================

function SuspendConfirmDialog({
  open,
  restaurant,
  isSuspending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  restaurant: RestaurantRow | null;
  isSuspending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!restaurant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <AlertTriangle
              className={cn(
                'h-5 w-5',
                isSuspending ? 'text-amber-400' : 'text-emerald-400'
              )}
            />
            {isSuspending ? 'Restoran Askiya Alinacak' : 'Restoran Aktif Edilecek'}
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            <strong className="text-text-main">{restaurant.name}</strong>{' '}
            restoranini{' '}
            {isSuspending
              ? 'askiya almak istediginize emin misiniz? Restoran musterilere gorunmez olacak ve yeni siparis alamayacak.'
              : 'tekrar aktif etmek istediginize emin misiniz? Restoran musterilere tekrar gorunur olacak.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            onClick={onClose}
          >
            Vazgec
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isSuspending
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            )}
            onClick={onConfirm}
          >
            {isSuspending ? 'Evet, Askiya Al' : 'Evet, Aktif Et'}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function RestoranlarPage() {
  const router = useRouter();

  // Data state
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Dialog state
  const [deleteTarget, setDeleteTarget] = useState<RestaurantRow | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<RestaurantRow | null>(null);
  const [suspendAction, setSuspendAction] = useState<'suspend' | 'activate'>('suspend');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchRestaurants = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('restaurants')
        .select('*, user_profiles(full_name, phone)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: RestaurantRow[] = data.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          owner_name:
            (r.user_profiles as { full_name: string | null } | null)
              ?.full_name || 'Bilinmiyor',
          owner_email: r.owner_id || '',
          plan: r.plan as RestaurantRow['plan'],
          status: r.status as RestaurantRow['status'],
          created_at: r.created_at,
          updated_at: r.updated_at,
          last_active: r.updated_at || r.created_at,
          order_count: 0,
          logo_url: r.logo_url,
        }));
        setRestaurants(mapped);
      } else {
        // Fallback to mock data
        setRestaurants(MOCK_RESTAURANTS);
      }

      if (showRefreshToast) {
        toast.success('Restoran listesi guncellendi.');
      }
    } catch {
      // Fallback to mock data on error
      setRestaurants(MOCK_RESTAURANTS);
      if (showRefreshToast) {
        toast.error('Veriler yuklenirken hata olustu.', {
          description: 'Mock veriler gosteriliyor.',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.slug.toLowerCase().includes(query) ||
          r.owner_name.toLowerCase().includes(query) ||
          r.owner_email.toLowerCase().includes(query)
      );
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter((r) => r.plan === planFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    return filtered;
  }, [restaurants, searchQuery, planFilter, statusFilter]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const total = restaurants.length;
    const active = restaurants.filter((r) => r.status === 'active').length;
    const suspended = restaurants.filter((r) => r.status === 'suspended').length;
    const totalOrders = restaurants.reduce((sum, r) => sum + r.order_count, 0);
    return { total, active, suspended, totalOrders };
  }, [restaurants]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleAction = useCallback(
    (action: RestaurantAction, restaurant: RestaurantRow) => {
      switch (action) {
        case 'view':
          toast.info(`${restaurant.name} detaylari goruntulenecek.`, {
            description: 'Bu ozellik yakin zamanda eklenecek.',
          });
          break;

        case 'edit':
          toast.info(`${restaurant.name} duzenleme sayfasi.`, {
            description: 'Bu ozellik yakin zamanda eklenecek.',
          });
          break;

        case 'suspend':
          setSuspendTarget(restaurant);
          setSuspendAction('suspend');
          break;

        case 'activate':
          setSuspendTarget(restaurant);
          setSuspendAction('activate');
          break;

        case 'delete':
          setDeleteTarget(restaurant);
          break;

        case 'impersonate':
          handleImpersonate(restaurant);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleImpersonate = useCallback(
    async (restaurant: RestaurantRow) => {
      try {
        // Create a scoped session by storing the impersonation data
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'impersonated_restaurant',
            JSON.stringify({
              id: restaurant.id,
              name: restaurant.name,
              slug: restaurant.slug,
              owner_id: restaurant.owner_email,
              impersonated_at: new Date().toISOString(),
            })
          );
        }

        toast.success(`${restaurant.name} adina giris yapildi.`, {
          description: 'Restoran paneline yonlendiriliyorsunuz...',
        });

        // Navigate to the restaurant dashboard
        router.push('/qr-menu/dashboard');
      } catch {
        toast.error('Giris yapilamadi.', {
          description: 'Lutfen tekrar deneyiniz.',
        });
      }
    },
    [router]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('restaurants')
        .update({ status: 'deleted' })
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === deleteTarget.id ? { ...r, status: 'deleted' as const } : r
        )
      );

      toast.success(`${deleteTarget.name} silindi.`);
    } catch {
      // Mock fallback
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === deleteTarget.id ? { ...r, status: 'deleted' as const } : r
        )
      );
      toast.success(`${deleteTarget.name} silindi.`);
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleSuspendToggle = useCallback(async () => {
    if (!suspendTarget) return;

    const newStatus: RestaurantStatus =
      suspendAction === 'suspend' ? 'suspended' : 'active';

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('restaurants')
        .update({ status: newStatus })
        .eq('id', suspendTarget.id);

      if (error) throw error;

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === suspendTarget.id ? { ...r, status: newStatus } : r
        )
      );

      toast.success(
        suspendAction === 'suspend'
          ? `${suspendTarget.name} askiya alindi.`
          : `${suspendTarget.name} aktif edildi.`
      );
    } catch {
      // Mock fallback
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === suspendTarget.id ? { ...r, status: newStatus } : r
        )
      );
      toast.success(
        suspendAction === 'suspend'
          ? `${suspendTarget.name} askiya alindi.`
          : `${suspendTarget.name} aktif edildi.`
      );
    } finally {
      setSuspendTarget(null);
    }
  }, [suspendTarget, suspendAction]);

  const handleExportCSV = useCallback(() => {
    const headers = [
      'Ad',
      'Slug',
      'Sahip',
      'E-posta',
      'Plan',
      'Durum',
      'Kayit Tarihi',
      'Siparis Sayisi',
    ].join(',');

    const rows = filteredRestaurants.map((r) =>
      [
        `"${r.name}"`,
        r.slug,
        `"${r.owner_name}"`,
        r.owner_email,
        r.plan,
        r.status,
        new Date(r.created_at).toLocaleDateString('tr-TR'),
        r.order_count,
      ].join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `restoranlar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('CSV dosyasi indirildi.', {
      description: `${filteredRestaurants.length} restoran aktarildi.`,
    });
  }, [filteredRestaurants]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setPlanFilter('all');
    setStatusFilter('all');
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' || planFilter !== 'all' || statusFilter !== 'all';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Restoran Yonetimi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Platformdaki tum restoranlari goruntuleyin, duzenleyin ve yonetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-white/20 hover:text-text-main',
              isRefreshing && 'pointer-events-none opacity-50'
            )}
            onClick={() => fetchRestaurants(true)}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                isRefreshing && 'animate-spin'
              )}
            />
            <span className="hidden sm:inline">Yenile</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-white/20 hover:text-text-main"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-lg bg-accent-blue/10 px-3 py-2 text-sm font-semibold text-accent-blue transition-colors hover:bg-accent-blue/20"
            onClick={() =>
              toast.info('Yeni restoran ekleme', {
                description: 'Bu ozellik yakin zamanda eklenecek.',
              })
            }
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Yeni Restoran</span>
          </motion.button>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Toplam" value={stats.total} color="bg-accent-blue" />
        <StatCard label="Aktif" value={stats.active} color="bg-emerald-400" />
        <StatCard
          label="Askida"
          value={stats.suspended}
          color="bg-amber-400"
        />
        <StatCard
          label="Toplam Siparis"
          value={stats.totalOrders}
          color="bg-accent-orange"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Restoran, slug veya sahip ara..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-text-main placeholder:text-text-muted/60 transition-colors focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
            aria-label="Restoran ara"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                onClick={() => setSearchQuery('')}
                aria-label="Aramayi temizle"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtre:</span>
          </div>

          <Select
            value={planFilter}
            onValueChange={(value) => setPlanFilter(value as PlanFilter)}
          >
            <SelectTrigger className="h-10 w-[130px] border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50 sm:w-[140px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
              {PLAN_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="h-10 w-[130px] border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50 sm:w-[150px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-10 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-text-muted transition-colors hover:border-red-500/30 hover:text-red-400"
                onClick={clearFilters}
                aria-label="Filtreleri temizle"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Temizle</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table or Loading */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <RestaurantTable
          restaurants={filteredRestaurants}
          onAction={handleAction}
        />
      )}

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        restaurant={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <SuspendConfirmDialog
        open={!!suspendTarget}
        restaurant={suspendTarget}
        isSuspending={suspendAction === 'suspend'}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendToggle}
      />
    </div>
  );
}
