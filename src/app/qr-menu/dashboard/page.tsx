'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Users,
  Receipt,
  Clock,
  ArrowRight,
  Plus,
  UtensilsCrossed,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import KPICard from '@/components/qr-menu/KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// =============================================================================
// Types
// =============================================================================

interface KPIData {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend: number;
  trendLabel: string;
  icon: typeof ShoppingCart;
  accentColor: 'orange' | 'green' | 'blue' | 'purple';
}

interface WeeklyDataPoint {
  day: string;
  gelir: number;
  siparis: number;
}

interface TopProduct {
  name: string;
  adet: number;
  gelir: number;
}

interface RecentOrder {
  id: string;
  table: string;
  items: string;
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  time: string;
}

interface ActiveTable {
  number: string;
  status: 'empty' | 'occupied' | 'reserved' | 'cleaning';
  capacity: number;
  orderTotal?: number;
}

// =============================================================================
// Helpers
// =============================================================================

const TURKISH_DAYS = ['Paz', 'Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt'];

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az once';
  if (mins < 60) return `${mins} dk once`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat once`;
  return `${Math.floor(hours / 24)} gun once`;
}

function formatOrderItems(items: Array<{ name: string; quantity: number }>): string {
  return items.map((i) => (i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name)).join(', ');
}

function getStartOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// =============================================================================
// Status Helpers
// =============================================================================

const ORDER_STATUS_MAP: Record<RecentOrder['status'], { label: string; classes: string }> = {
  new: { label: 'Yeni', classes: 'bg-accent-blue/10 text-accent-blue' },
  preparing: { label: 'Hazirlaniyor', classes: 'bg-amber-500/10 text-amber-400' },
  ready: { label: 'Hazir', classes: 'bg-emerald-500/10 text-emerald-400' },
  delivered: { label: 'Teslim Edildi', classes: 'bg-text-muted/10 text-text-muted' },
};

const TABLE_STATUS_MAP: Record<ActiveTable['status'], { label: string; dot: string; bg: string }> = {
  empty: { label: 'Bos', dot: 'bg-emerald-400', bg: 'border-emerald-500/20' },
  occupied: { label: 'Dolu', dot: 'bg-accent-orange', bg: 'border-accent-orange/20' },
  reserved: { label: 'Rezerve', dot: 'bg-accent-blue', bg: 'border-accent-blue/20' },
  cleaning: { label: 'Temizleniyor', dot: 'bg-amber-400', bg: 'border-amber-500/20' },
};

// =============================================================================
// Loading Skeleton
// =============================================================================

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
              <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
            </div>
            <Skeleton className="mt-3 h-7 w-20 bg-white/10" />
            <Skeleton className="mt-2 h-3 w-28 bg-white/5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <Skeleton className="h-5 w-28 bg-white/10" />
          <Skeleton className="mt-4 h-[280px] w-full rounded-lg bg-white/5" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <Skeleton className="h-5 w-28 bg-white/10" />
          <Skeleton className="mt-4 h-[280px] w-full rounded-lg bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <Skeleton className="h-5 w-28 bg-white/10" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-white/5" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <Skeleton className="h-5 w-24 bg-white/10" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Empty State
// =============================================================================

function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-orange/10">
        <UtensilsCrossed className="h-8 w-8 text-accent-orange" />
      </div>
      <h3 className="mt-6 font-display text-lg font-bold text-text-main">
        Restoraniniza Hos Geldiniz!
      </h3>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        Dashboard&apos;iniz henuz bos gorunuyor. Menunuzu olusturarak baslayabilirsiniz.
        Kategoriler ve urunler eklendikce burada istatistikler goruntulenecektir.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-accent-orange text-white hover:bg-accent-orange/90">
          <Link href="/qr-menu/dashboard/menu">
            <Plus className="mr-2 h-4 w-4" />
            Ilk Kategorinizi Olusturun
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-main"
        >
          <Link href="/qr-menu/dashboard/masalar">
            Masalari Ayarlayin
          </Link>
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Custom Recharts Tooltip
// =============================================================================

interface CustomTooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-bg-dark/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'gelir' ? `₺${entry.value.toLocaleString('tr-TR')}` : entry.value}
        </p>
      ))}
    </div>
  );
}

// =============================================================================
// Dashboard Page
// =============================================================================

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  // Data states
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [activeTables, setActiveTables] = useState<ActiveTable[]>([]);

  // ---------------------------------------------------------------------------
  // Fetch dashboard data from Supabase
  // ---------------------------------------------------------------------------

  const fetchDashboardData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get restaurant
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!restaurant) return;
      const restaurantId = restaurant.id;

      // Parallel queries
      const todayStart = getStartOfToday();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [todayResult, tablesResult, weekResult, recentResult] = await Promise.all([
        supabase
          .from('orders')
          .select('total_amount, items, status')
          .eq('restaurant_id', restaurantId)
          .gte('created_at', todayStart)
          .neq('status', 'cancelled'),
        supabase
          .from('tables')
          .select('table_number, capacity, status')
          .eq('restaurant_id', restaurantId),
        supabase
          .from('orders')
          .select('total_amount, created_at, status')
          .eq('restaurant_id', restaurantId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .neq('status', 'cancelled'),
        supabase
          .from('orders')
          .select('id, total_amount, items, status, created_at, tables(table_number)')
          .eq('restaurant_id', restaurantId)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      const todayOrders = todayResult.data || [];
      const allTables = tablesResult.data || [];
      const weekOrders = weekResult.data || [];
      const recent = recentResult.data || [];

      // Check if there's any data at all
      if (todayOrders.length === 0 && weekOrders.length === 0 && allTables.length === 0) {
        setHasData(false);
        return;
      }
      setHasData(true);

      // --- KPI Calculations ---
      const todayCount = todayOrders.length;
      const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0);
      const occupiedTables = allTables.filter((t) => t.status === 'occupied').length;
      const avgOrder = todayCount > 0 ? todayRevenue / todayCount : 0;

      setKpiData([
        {
          label: 'Bugunun Siparisleri',
          value: todayCount,
          trend: 0,
          trendLabel: 'bugun',
          icon: ShoppingCart,
          accentColor: 'orange',
        },
        {
          label: 'Bugunun Geliri',
          value: todayRevenue,
          prefix: '₺',
          trend: 0,
          trendLabel: 'bugun',
          icon: DollarSign,
          accentColor: 'green',
        },
        {
          label: 'Aktif Masalar',
          value: occupiedTables,
          suffix: `/${allTables.length}`,
          trend: 0,
          trendLabel: 'toplam',
          icon: Users,
          accentColor: 'blue',
        },
        {
          label: 'Ort. Siparis Tutari',
          value: avgOrder,
          prefix: '₺',
          decimals: 2,
          trend: 0,
          trendLabel: 'bugun',
          icon: Receipt,
          accentColor: 'purple',
        },
      ]);

      // --- Weekly Revenue Chart ---
      const dayMap = new Map<string, { gelir: number; siparis: number }>();
      const dayLabels = new Map<string, string>();

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dayMap.set(key, { gelir: 0, siparis: 0 });
        dayLabels.set(key, TURKISH_DAYS[d.getDay()]);
      }

      weekOrders.forEach((o) => {
        const key = o.created_at.split('T')[0];
        const entry = dayMap.get(key);
        if (entry) {
          entry.gelir += Number(o.total_amount);
          entry.siparis += 1;
        }
      });

      const weeklyData: WeeklyDataPoint[] = [];
      dayMap.forEach((val, key) => {
        weeklyData.push({
          day: dayLabels.get(key) || key,
          gelir: Math.round(val.gelir),
          siparis: val.siparis,
        });
      });
      setWeeklyRevenue(weeklyData);

      // --- Top Products ---
      const productCounts = new Map<string, { adet: number; gelir: number }>();
      todayOrders.forEach((order) => {
        const items = order.items as Array<{ name: string; quantity: number; price: number }>;
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const existing = productCounts.get(item.name) || { adet: 0, gelir: 0 };
            existing.adet += item.quantity;
            existing.gelir += item.price * item.quantity;
            productCounts.set(item.name, existing);
          });
        }
      });

      const sorted = Array.from(productCounts.entries())
        .map(([name, data]) => ({ name, adet: data.adet, gelir: Math.round(data.gelir) }))
        .sort((a, b) => b.adet - a.adet)
        .slice(0, 5);
      setTopProducts(sorted);

      // --- Recent Orders ---
      const formatted: RecentOrder[] = recent.map((o) => {
        const items = o.items as Array<{ name: string; quantity: number }>;
        const tableRaw = o.tables as unknown;
        const tableInfo = (Array.isArray(tableRaw) ? tableRaw[0] : tableRaw) as { table_number: string } | null;
        return {
          id: `SIP-${o.id.slice(0, 4).toUpperCase()}`,
          table: tableInfo ? `Masa ${tableInfo.table_number}` : '-',
          items: Array.isArray(items) ? formatOrderItems(items) : '',
          total: Number(o.total_amount),
          status: o.status as RecentOrder['status'],
          time: formatRelativeTime(o.created_at),
        };
      });
      setRecentOrders(formatted);

      // --- Active Tables ---
      const tableData: ActiveTable[] = allTables
        .filter((t) => t.status !== 'empty')
        .map((t) => ({
          number: t.table_number,
          status: t.status as ActiveTable['status'],
          capacity: t.capacity,
        }));
      setActiveTables(tableData);

    } catch (err) {
      console.error('[Dashboard] Veri yuklenemedi:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Restoraninizin genel durumunu buradan takip edebilirsiniz.
          </p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Restoraninizin genel durumunu buradan takip edebilirsiniz.
          </p>
        </div>
        <DashboardEmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-main">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Restoraninizin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            prefix={kpi.prefix}
            suffix={kpi.suffix}
            decimals={kpi.decimals}
            trend={kpi.trend}
            trendLabel={kpi.trendLabel}
            icon={kpi.icon}
            accentColor={kpi.accentColor}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Weekly Revenue */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">Haftalik Gelir</h2>
              <p className="text-xs text-text-muted">Son 7 gun</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-orange" />
                Gelir (₺)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
                Siparis
              </span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#8892A4', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#8892A4', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₺${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892A4', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line yAxisId="left" type="monotone" dataKey="gelir" name="gelir" stroke="#FF6B2B" strokeWidth={2.5} dot={{ r: 4, fill: '#FF6B2B', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#FF6B2B', strokeWidth: 2, stroke: '#fff' }} />
                <Line yAxisId="right" type="monotone" dataKey="siparis" name="siparis" stroke="#00D4FF" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#00D4FF', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00D4FF', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-text-main">En Cok Satanlar</h2>
            <p className="text-xs text-text-muted">Bugunun ilk 5 urunu</p>
          </div>
          {topProducts.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topProducts} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#F0F4FF', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="adet" name="adet" fill="#FF6B2B" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-text-muted">
              Henuz bugun siparis yok
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Orders + Active Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">Son Siparisler</h2>
              <p className="text-xs text-text-muted">Son {recentOrders.length} siparis</p>
            </div>
            <Link href="/qr-menu/dashboard/siparisler" className="flex items-center gap-1 text-xs font-medium text-accent-orange transition-colors hover:text-accent-orange/80">
              Tumunu Gor
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 text-left text-xs font-medium text-text-muted">Siparis</th>
                    <th className="pb-3 text-left text-xs font-medium text-text-muted">Masa</th>
                    <th className="hidden pb-3 text-left text-xs font-medium text-text-muted sm:table-cell">Urunler</th>
                    <th className="pb-3 text-right text-xs font-medium text-text-muted">Tutar</th>
                    <th className="pb-3 text-center text-xs font-medium text-text-muted">Durum</th>
                    <th className="pb-3 text-right text-xs font-medium text-text-muted">Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const statusInfo = ORDER_STATUS_MAP[order.status];
                    return (
                      <tr key={order.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5">
                        <td className="py-3 text-sm font-medium text-text-main">{order.id}</td>
                        <td className="py-3 text-sm text-text-muted">{order.table}</td>
                        <td className="hidden max-w-[200px] truncate py-3 text-sm text-text-muted sm:table-cell">{order.items}</td>
                        <td className="py-3 text-right text-sm font-semibold text-text-main">₺{order.total.toLocaleString('tr-TR')}</td>
                        <td className="py-3 text-center">
                          <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusInfo.classes)}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 text-right text-xs text-text-muted">
                          <span className="flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" />
                            {order.time}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-text-muted">
              Henuz siparis yok
            </div>
          )}
        </div>

        {/* Active Tables */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">Aktif Masalar</h2>
              <p className="text-xs text-text-muted">
                {activeTables.filter((t) => t.status === 'occupied').length} dolu / {activeTables.length} masa
              </p>
            </div>
            <Link href="/qr-menu/dashboard/masalar" className="flex items-center gap-1 text-xs font-medium text-accent-orange transition-colors hover:text-accent-orange/80">
              Tum Masalar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {activeTables.length > 0 ? (
            <>
              <div className="grid grid-cols-4 gap-2">
                {activeTables.map((table) => {
                  const statusInfo = TABLE_STATUS_MAP[table.status];
                  return (
                    <div
                      key={table.number}
                      className={cn('flex flex-col items-center rounded-lg border bg-white/5 p-2.5 transition-colors hover:bg-white/10', statusInfo.bg)}
                    >
                      <span className="text-sm font-bold text-text-main">{table.number}</span>
                      <span className={cn('mt-1 h-1.5 w-1.5 rounded-full', statusInfo.dot)} />
                      {table.orderTotal && (
                        <span className="mt-1 text-[10px] font-medium text-text-muted">₺{table.orderTotal}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
                {Object.entries(TABLE_STATUS_MAP).map(([, info]) => (
                  <span key={info.label} className="flex items-center gap-1">
                    <span className={cn('h-2 w-2 rounded-full', info.dot)} />
                    {info.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-text-muted">
              Henuz masa eklenmemis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
