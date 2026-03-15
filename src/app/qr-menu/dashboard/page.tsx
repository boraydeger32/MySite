'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Users,
  Receipt,
  Star,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
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
  Legend,
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import KPICard from '@/components/qr-menu/KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_KPI = [
  {
    label: 'Bugunun Siparisleri',
    value: 147,
    trend: 12.5,
    trendLabel: 'dune gore',
    icon: ShoppingCart,
    accentColor: 'orange' as const,
  },
  {
    label: 'Bugunun Geliri',
    value: 18420,
    prefix: '₺',
    trend: 8.3,
    trendLabel: 'dune gore',
    icon: DollarSign,
    accentColor: 'green' as const,
  },
  {
    label: 'Aktif Masalar',
    value: 24,
    suffix: '/32',
    trend: -3.2,
    trendLabel: 'dune gore',
    icon: Users,
    accentColor: 'blue' as const,
  },
  {
    label: 'Ort. Siparis Tutari',
    value: 125.3,
    prefix: '₺',
    decimals: 2,
    trend: 5.1,
    trendLabel: 'dune gore',
    icon: Receipt,
    accentColor: 'purple' as const,
  },
  {
    label: 'Musteri Memnuniyeti',
    value: 4.7,
    suffix: '/5',
    decimals: 1,
    trend: 2.0,
    trendLabel: 'gecen haftaya gore',
    icon: Star,
    accentColor: 'orange' as const,
  },
];

const MOCK_WEEKLY_REVENUE = [
  { day: 'Pzt', gelir: 14200, siparis: 98 },
  { day: 'Sal', gelir: 11800, siparis: 82 },
  { day: 'Car', gelir: 15600, siparis: 110 },
  { day: 'Per', gelir: 13400, siparis: 95 },
  { day: 'Cum', gelir: 21000, siparis: 156 },
  { day: 'Cmt', gelir: 24500, siparis: 178 },
  { day: 'Paz', gelir: 18420, siparis: 147 },
];

const MOCK_TOP_PRODUCTS = [
  { name: 'Izgara Kofte', adet: 86, gelir: 4300 },
  { name: 'Karisik Pizza', adet: 72, gelir: 5760 },
  { name: 'Tavuk Salata', adet: 65, gelir: 2925 },
  { name: 'Hamburger Menu', adet: 58, gelir: 4060 },
  { name: 'Adana Kebap', adet: 45, gelir: 3600 },
];

// Hourly heatmap data: rows = days (Mon-Sun), cols = hours (10-23)
const HEATMAP_HOURS = [
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
];
const HEATMAP_DAYS = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'];

const MOCK_HEATMAP: number[][] = [
  [2, 5, 18, 22, 15, 8, 4, 6, 14, 20, 24, 18, 10, 3],  // Mon
  [1, 4, 15, 20, 12, 6, 3, 5, 12, 18, 22, 16, 8, 2],   // Tue
  [3, 6, 20, 25, 18, 10, 5, 8, 16, 22, 28, 20, 12, 4],  // Wed
  [2, 5, 16, 21, 14, 7, 4, 6, 13, 19, 23, 17, 9, 3],   // Thu
  [4, 8, 24, 30, 22, 14, 8, 12, 20, 28, 35, 26, 16, 6], // Fri
  [6, 10, 28, 35, 26, 16, 10, 14, 24, 32, 38, 30, 18, 8],// Sat
  [5, 8, 22, 28, 20, 12, 7, 10, 18, 25, 30, 22, 14, 5], // Sun
];

interface MockOrder {
  id: string;
  table: string;
  items: string;
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  time: string;
}

const MOCK_RECENT_ORDERS: MockOrder[] = [
  { id: 'SIP-1247', table: 'Masa 5', items: 'Izgara Kofte x2, Ayran x2', total: 220, status: 'new', time: '2 dk once' },
  { id: 'SIP-1246', table: 'Masa 12', items: 'Karisik Pizza, Kola x2', total: 165, status: 'preparing', time: '5 dk once' },
  { id: 'SIP-1245', table: 'Masa 3', items: 'Tavuk Salata, Limonata', total: 95, status: 'preparing', time: '8 dk once' },
  { id: 'SIP-1244', table: 'Masa 8', items: 'Hamburger Menu x3', total: 330, status: 'ready', time: '12 dk once' },
  { id: 'SIP-1243', table: 'Masa 1', items: 'Adana Kebap x2, Salgam x2', total: 280, status: 'delivered', time: '18 dk once' },
  { id: 'SIP-1242', table: 'Masa 15', items: 'Makarna, Su x2', total: 78, status: 'delivered', time: '22 dk once' },
];

interface MockTable {
  number: string;
  status: 'empty' | 'occupied' | 'reserved' | 'cleaning';
  guests?: number;
  capacity: number;
  orderTotal?: number;
}

const MOCK_ACTIVE_TABLES: MockTable[] = [
  { number: '1', status: 'occupied', guests: 4, capacity: 4, orderTotal: 280 },
  { number: '3', status: 'occupied', guests: 2, capacity: 4, orderTotal: 95 },
  { number: '5', status: 'occupied', guests: 2, capacity: 6, orderTotal: 220 },
  { number: '7', status: 'reserved', capacity: 8 },
  { number: '8', status: 'occupied', guests: 3, capacity: 4, orderTotal: 330 },
  { number: '10', status: 'cleaning', capacity: 2 },
  { number: '12', status: 'occupied', guests: 2, capacity: 4, orderTotal: 165 },
  { number: '15', status: 'occupied', guests: 1, capacity: 2, orderTotal: 78 },
];

interface MockLowStockItem {
  name: string;
  remaining: number;
  unit: string;
  urgency: 'low' | 'critical';
}

const MOCK_LOW_STOCK: MockLowStockItem[] = [
  { name: 'Dana Kiyma', remaining: 2, unit: 'kg', urgency: 'critical' },
  { name: 'Mozzarella Peyniri', remaining: 3, unit: 'kg', urgency: 'critical' },
  { name: 'Domates', remaining: 5, unit: 'kg', urgency: 'low' },
  { name: 'Tavuk Gogsu', remaining: 4, unit: 'kg', urgency: 'low' },
];

// =============================================================================
// Status Helpers
// =============================================================================

const ORDER_STATUS_MAP: Record<MockOrder['status'], { label: string; classes: string }> = {
  new: { label: 'Yeni', classes: 'bg-accent-blue/10 text-accent-blue' },
  preparing: { label: 'Hazirlaniyor', classes: 'bg-amber-500/10 text-amber-400' },
  ready: { label: 'Hazir', classes: 'bg-emerald-500/10 text-emerald-400' },
  delivered: { label: 'Teslim Edildi', classes: 'bg-text-muted/10 text-text-muted' },
};

const TABLE_STATUS_MAP: Record<MockTable['status'], { label: string; dot: string; bg: string }> = {
  empty: { label: 'Bos', dot: 'bg-emerald-400', bg: 'border-emerald-500/20' },
  occupied: { label: 'Dolu', dot: 'bg-accent-orange', bg: 'border-accent-orange/20' },
  reserved: { label: 'Rezerve', dot: 'bg-accent-blue', bg: 'border-accent-blue/20' },
  cleaning: { label: 'Temizleniyor', dot: 'bg-amber-400', bg: 'border-amber-500/20' },
};

// =============================================================================
// Heatmap Color Helper
// =============================================================================

function getHeatmapColor(value: number, max: number): string {
  const intensity = value / max;
  if (intensity < 0.15) return 'bg-white/5';
  if (intensity < 0.3) return 'bg-accent-orange/10';
  if (intensity < 0.5) return 'bg-accent-orange/20';
  if (intensity < 0.7) return 'bg-accent-orange/40';
  if (intensity < 0.85) return 'bg-accent-orange/60';
  return 'bg-accent-orange/80';
}

// =============================================================================
// Loading Skeleton for Dashboard Content
// =============================================================================

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
              <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
            </div>
            <Skeleton className="mt-3 h-7 w-20 bg-white/10" />
            <Skeleton className="mt-2 h-3 w-28 bg-white/5" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
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

      {/* Heatmap */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <Skeleton className="h-5 w-44 bg-white/10" />
        <Skeleton className="mt-4 h-[200px] w-full rounded-lg bg-white/5" />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <Skeleton className="h-5 w-28 bg-white/10" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-white/5" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <Skeleton className="h-5 w-24 bg-white/10" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <Skeleton className="h-5 w-32 bg-white/10" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Empty State for Dashboard (when restaurant has no data yet)
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
  const [hasData, setHasData] = useState(true);

  const heatmapMax = useMemo(
    () => Math.max(...MOCK_HEATMAP.flat()),
    []
  );

  // Simulate data loading (replace with real API call when connected)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // In a real app, check if restaurant has any data
      setHasData(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Dashboard
          </h1>
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
          <h1 className="font-display text-2xl font-bold text-text-main">
            Dashboard
          </h1>
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
        <h1 className="font-display text-2xl font-bold text-text-main">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Restoraninizin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards Row                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {MOCK_KPI.map((kpi, index) => (
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
            className={cn(
              index === 0 && 'sm:col-span-2 lg:col-span-1'
            )}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts Row: 7-day revenue + top 5 products                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 7-Day Revenue Line Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">
                Haftalik Gelir
              </h2>
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
              <LineChart data={MOCK_WEEKLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#8892A4', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#8892A4', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₺${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#8892A4', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="gelir"
                  name="gelir"
                  stroke="#FF6B2B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#FF6B2B', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#FF6B2B', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="siparis"
                  name="siparis"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 3, fill: '#00D4FF', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#00D4FF', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Products Bar Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-text-main">
              En Cok Satanlar
            </h2>
            <p className="text-xs text-text-muted">Bugunun ilk 5 urunu</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={MOCK_TOP_PRODUCTS}
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#8892A4', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#F0F4FF', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="adet"
                  name="adet"
                  fill="#FF6B2B"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hourly Heatmap                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4">
          <h2 className="font-display text-base font-semibold text-text-main">
            Saatlik Siparis Yogunlugu
          </h2>
          <p className="text-xs text-text-muted">
            Son 7 gunluk siparis dagilimi (saatlik ortalama)
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Column headers (hours) */}
            <div className="mb-1 flex">
              <div className="w-12 shrink-0" />
              {HEATMAP_HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-[11px] font-medium text-text-muted"
                >
                  {hour}:00
                </div>
              ))}
            </div>
            {/* Rows (days) */}
            {HEATMAP_DAYS.map((day, dayIdx) => (
              <div key={day} className="mb-1 flex items-center">
                <div className="w-12 shrink-0 text-xs font-medium text-text-muted">
                  {day}
                </div>
                {MOCK_HEATMAP[dayIdx].map((val, hourIdx) => (
                  <div key={hourIdx} className="flex-1 px-0.5">
                    <div
                      className={cn(
                        'aspect-[2/1] rounded-sm transition-colors',
                        getHeatmapColor(val, heatmapMax)
                      )}
                      title={`${day} ${HEATMAP_HOURS[hourIdx]}:00 - ${val} siparis`}
                    />
                  </div>
                ))}
              </div>
            ))}
            {/* Legend */}
            <div className="mt-3 flex items-center justify-end gap-1.5">
              <span className="text-[10px] text-text-muted">Az</span>
              {['bg-white/5', 'bg-accent-orange/10', 'bg-accent-orange/20', 'bg-accent-orange/40', 'bg-accent-orange/60', 'bg-accent-orange/80'].map(
                (color, i) => (
                  <div key={i} className={cn('h-3 w-5 rounded-sm', color)} />
                )
              )}
              <span className="text-[10px] text-text-muted">Cok</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom Row: Recent Orders + Active Tables + Low Stock               */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">
                Son Siparisler
              </h2>
              <p className="text-xs text-text-muted">Son 6 siparis</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-accent-orange transition-colors hover:text-accent-orange/80">
              Tumunu Gor
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
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
                {MOCK_RECENT_ORDERS.map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
                    >
                      <td className="py-3 text-sm font-medium text-text-main">
                        {order.id}
                      </td>
                      <td className="py-3 text-sm text-text-muted">{order.table}</td>
                      <td className="hidden max-w-[200px] truncate py-3 text-sm text-text-muted sm:table-cell">
                        {order.items}
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-text-main">
                        ₺{order.total.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                            statusInfo.classes
                          )}
                        >
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
        </div>

        {/* Right column: Active Tables + Low Stock */}
        <div className="flex flex-col gap-4">
          {/* Active Tables Grid */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-text-main">
                  Aktif Masalar
                </h2>
                <p className="text-xs text-text-muted">
                  {MOCK_ACTIVE_TABLES.filter((t) => t.status === 'occupied').length} dolu / {MOCK_ACTIVE_TABLES.length} masa
                </p>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-accent-orange transition-colors hover:text-accent-orange/80">
                Tum Masalar
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MOCK_ACTIVE_TABLES.map((table) => {
                const statusInfo = TABLE_STATUS_MAP[table.status];
                return (
                  <div
                    key={table.number}
                    className={cn(
                      'flex flex-col items-center rounded-lg border bg-white/5 p-2.5 transition-colors hover:bg-white/10',
                      statusInfo.bg
                    )}
                  >
                    <span className="text-sm font-bold text-text-main">
                      {table.number}
                    </span>
                    <span
                      className={cn('mt-1 h-1.5 w-1.5 rounded-full', statusInfo.dot)}
                    />
                    {table.orderTotal && (
                      <span className="mt-1 text-[10px] font-medium text-text-muted">
                        ₺{table.orderTotal}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
              {Object.entries(TABLE_STATUS_MAP).map(([, info]) => (
                <span key={info.label} className="flex items-center gap-1">
                  <span className={cn('h-2 w-2 rounded-full', info.dot)} />
                  {info.label}
                </span>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-text-main">
                  Dusuk Stok Uyarilari
                </h2>
                <p className="text-xs text-text-muted">
                  {MOCK_LOW_STOCK.filter((i) => i.urgency === 'critical').length} kritik urun
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {MOCK_LOW_STOCK.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2',
                    item.urgency === 'critical'
                      ? 'border-red-500/20 bg-red-500/5'
                      : 'border-amber-500/20 bg-amber-500/5'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Package
                      className={cn(
                        'h-4 w-4',
                        item.urgency === 'critical'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      )}
                    />
                    <span className="text-sm font-medium text-text-main">
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      item.urgency === 'critical'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    )}
                  >
                    {item.remaining} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
