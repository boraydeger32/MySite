'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  QrCode,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

type DateRange = '7gun' | '30gun' | '90gun';
type RevenueView = 'gunluk' | 'haftalik' | 'aylik';

interface RevenueDataPoint {
  label: string;
  gelir: number;
  siparis: number;
}

interface ProductData {
  name: string;
  adet: number;
  gelir: number;
}

interface CategorySalesData {
  name: string;
  value: number;
  color: string;
}

interface TableOccupancy {
  table: string;
  occupancyRate: number;
  totalOrders: number;
  avgDuration: number;
}

interface FeedbackItem {
  category: string;
  positive: number;
  negative: number;
  total: number;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_DAILY_REVENUE: RevenueDataPoint[] = [
  { label: '8 Mar', gelir: 12400, siparis: 85 },
  { label: '9 Mar', gelir: 14200, siparis: 98 },
  { label: '10 Mar', gelir: 11800, siparis: 82 },
  { label: '11 Mar', gelir: 15600, siparis: 110 },
  { label: '12 Mar', gelir: 13400, siparis: 95 },
  { label: '13 Mar', gelir: 21000, siparis: 156 },
  { label: '14 Mar', gelir: 24500, siparis: 178 },
];

const MOCK_WEEKLY_REVENUE: RevenueDataPoint[] = [
  { label: 'Hft 1', gelir: 72000, siparis: 520 },
  { label: 'Hft 2', gelir: 85600, siparis: 610 },
  { label: 'Hft 3', gelir: 79200, siparis: 565 },
  { label: 'Hft 4', gelir: 92400, siparis: 680 },
];

const MOCK_MONTHLY_REVENUE: RevenueDataPoint[] = [
  { label: 'Oca', gelir: 245000, siparis: 1820 },
  { label: 'Sub', gelir: 268000, siparis: 1950 },
  { label: 'Mar', gelir: 312000, siparis: 2240 },
];

const MOCK_TOP_PRODUCTS: ProductData[] = [
  { name: 'Izgara Kofte', adet: 342, gelir: 17100 },
  { name: 'Karisik Pizza', adet: 288, gelir: 23040 },
  { name: 'Tavuk Salata', adet: 265, gelir: 11925 },
  { name: 'Hamburger Menu', adet: 230, gelir: 16100 },
  { name: 'Adana Kebap', adet: 198, gelir: 15840 },
  { name: 'Lahmacun', adet: 176, gelir: 7040 },
  { name: 'Pide Cesitleri', adet: 154, gelir: 10780 },
];

const MOCK_BOTTOM_PRODUCTS: ProductData[] = [
  { name: 'Meyve Tabagi', adet: 12, gelir: 720 },
  { name: 'Sogan Halkasi', adet: 18, gelir: 540 },
  { name: 'Tiramisu', adet: 22, gelir: 1320 },
  { name: 'Cheesecake', adet: 28, gelir: 1960 },
  { name: 'Cikolata Sufle', adet: 34, gelir: 2380 },
];

const CATEGORY_COLORS = ['#FF6B2B', '#00D4FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const MOCK_CATEGORY_SALES: CategorySalesData[] = [
  { name: 'Ana Yemekler', value: 42, color: CATEGORY_COLORS[0] },
  { name: 'Pizzalar', value: 22, color: CATEGORY_COLORS[1] },
  { name: 'Salatalar', value: 12, color: CATEGORY_COLORS[2] },
  { name: 'Icecekler', value: 10, color: CATEGORY_COLORS[3] },
  { name: 'Tatlilar', value: 8, color: CATEGORY_COLORS[4] },
  { name: 'Baslangiclar', value: 6, color: CATEGORY_COLORS[5] },
];

const HEATMAP_HOURS = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
const HEATMAP_DAYS = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'];

const MOCK_HEATMAP: number[][] = [
  [2, 5, 18, 22, 15, 8, 4, 6, 14, 20, 24, 18, 10, 3],
  [1, 4, 15, 20, 12, 6, 3, 5, 12, 18, 22, 16, 8, 2],
  [3, 6, 20, 25, 18, 10, 5, 8, 16, 22, 28, 20, 12, 4],
  [2, 5, 16, 21, 14, 7, 4, 6, 13, 19, 23, 17, 9, 3],
  [4, 8, 24, 30, 22, 14, 8, 12, 20, 28, 35, 26, 16, 6],
  [6, 10, 28, 35, 26, 16, 10, 14, 24, 32, 38, 30, 18, 8],
  [5, 8, 22, 28, 20, 12, 7, 10, 18, 25, 30, 22, 14, 5],
];

const MOCK_TABLE_OCCUPANCY: TableOccupancy[] = [
  { table: 'Masa 1', occupancyRate: 85, totalOrders: 42, avgDuration: 55 },
  { table: 'Masa 2', occupancyRate: 72, totalOrders: 36, avgDuration: 48 },
  { table: 'Masa 3', occupancyRate: 90, totalOrders: 45, avgDuration: 62 },
  { table: 'Masa 4', occupancyRate: 45, totalOrders: 22, avgDuration: 38 },
  { table: 'Masa 5', occupancyRate: 68, totalOrders: 34, avgDuration: 52 },
  { table: 'Masa 6', occupancyRate: 78, totalOrders: 39, avgDuration: 45 },
  { table: 'Masa 7', occupancyRate: 55, totalOrders: 28, avgDuration: 42 },
  { table: 'Masa 8', occupancyRate: 92, totalOrders: 48, avgDuration: 68 },
  { table: 'Masa 9', occupancyRate: 38, totalOrders: 18, avgDuration: 35 },
  { table: 'Masa 10', occupancyRate: 82, totalOrders: 41, avgDuration: 58 },
];

const MOCK_QR_STATS = {
  totalScans: 4826,
  uniqueScans: 3214,
  scanTrend: 14.2,
  topDevice: 'iOS',
  conversionRate: 68.5,
  avgSessionDuration: '4m 32s',
  peakHour: '20:00',
  dailyAvg: 172,
};

const MOCK_FEEDBACK: FeedbackItem[] = [
  { category: 'Yemek Kalitesi', positive: 245, negative: 18, total: 263 },
  { category: 'Hizmet Hizi', positive: 198, negative: 42, total: 240 },
  { category: 'Menu Cesitliligi', positive: 176, negative: 24, total: 200 },
  { category: 'Fiyat/Performans', positive: 156, negative: 38, total: 194 },
  { category: 'Temizlik', positive: 220, negative: 12, total: 232 },
];

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

function getOccupancyColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-400';
  if (rate >= 60) return 'bg-accent-blue';
  if (rate >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function getOccupancyBarColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-400/80';
  if (rate >= 60) return 'bg-accent-blue/80';
  if (rate >= 40) return 'bg-amber-400/80';
  return 'bg-red-400/80';
}

// =============================================================================
// Custom Recharts Tooltips
// =============================================================================

interface RevenueTooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: RevenueTooltipPayload[];
  label?: string;
}

function RevenueTooltip({ active, payload, label }: RevenueTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-bg-dark/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name === 'gelir'
            ? `Gelir: ₺${entry.value.toLocaleString('tr-TR')}`
            : `Siparis: ${entry.value}`}
        </p>
      ))}
    </div>
  );
}

interface BarTooltipPayload {
  color: string;
  name: string;
  value: number;
  payload: ProductData;
}

interface BarTooltipProps {
  active?: boolean;
  payload?: BarTooltipPayload[];
}

function ProductBarTooltip({ active, payload }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-bg-dark/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs font-semibold text-text-main">{data.name}</p>
      <p className="text-sm text-accent-orange">Satis: {data.adet} adet</p>
      <p className="text-sm text-accent-blue">Gelir: ₺{data.gelir.toLocaleString('tr-TR')}</p>
    </div>
  );
}

interface PieTooltipPayload {
  name: string;
  value: number;
  payload: CategorySalesData;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayload[];
}

function CategoryPieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-bg-dark/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-0.5 text-xs font-semibold text-text-main">{data.name}</p>
      <p className="text-sm font-semibold" style={{ color: data.payload.color }}>
        %{data.value}
      </p>
    </div>
  );
}

// =============================================================================
// Sub-Components
// =============================================================================

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const options: { key: DateRange; label: string }[] = [
    { key: '7gun', label: 'Son 7 Gun' },
    { key: '30gun', label: 'Son 30 Gun' },
    { key: '90gun', label: 'Son 90 Gun' },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-text-muted">
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Tarih Araligi:</span>
      </div>
      <div className="flex rounded-lg border border-white/10 bg-white/5">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-all',
              'first:rounded-l-lg last:rounded-r-lg',
              value === opt.key
                ? 'bg-accent-orange text-white'
                : 'text-text-muted hover:text-text-main hover:bg-white/5'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RevenueViewToggleProps {
  value: RevenueView;
  onChange: (value: RevenueView) => void;
}

function RevenueViewToggle({ value, onChange }: RevenueViewToggleProps) {
  const options: { key: RevenueView; label: string }[] = [
    { key: 'gunluk', label: 'Gunluk' },
    { key: 'haftalik', label: 'Haftalik' },
    { key: 'aylik', label: 'Aylik' },
  ];

  return (
    <div className="flex rounded-lg border border-white/10 bg-white/5">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium transition-all',
            'first:rounded-l-lg last:rounded-r-lg',
            value === opt.key
              ? 'bg-accent-orange/20 text-accent-orange'
              : 'text-text-muted hover:text-text-main hover:bg-white/5'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Heatmap Tooltip
// =============================================================================

interface HeatmapCellProps {
  value: number;
  day: string;
  hour: string;
  max: number;
}

function HeatmapCell({ value, day, hour, max }: HeatmapCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex-1 px-0.5">
      <div
        className={cn(
          'aspect-[2/1] rounded-sm transition-colors cursor-pointer',
          getHeatmapColor(value, max)
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-bg-dark/95 px-2.5 py-1.5 shadow-xl backdrop-blur-xl">
          <p className="text-[11px] font-medium text-text-muted">{day} {hour}:00</p>
          <p className="text-xs font-semibold text-accent-orange">{value} siparis</p>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white/10" />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Analytics Page
// =============================================================================

export default function AnalitikPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30gun');
  const [revenueView, setRevenueView] = useState<RevenueView>('gunluk');

  const heatmapMax = useMemo(
    () => Math.max(...MOCK_HEATMAP.flat()),
    []
  );

  const revenueData = useMemo(() => {
    switch (revenueView) {
      case 'gunluk':
        return MOCK_DAILY_REVENUE;
      case 'haftalik':
        return MOCK_WEEKLY_REVENUE;
      case 'aylik':
        return MOCK_MONTHLY_REVENUE;
    }
  }, [revenueView]);

  const totalRevenue = useMemo(
    () => revenueData.reduce((sum, d) => sum + d.gelir, 0),
    [revenueData]
  );

  const totalOrders = useMemo(
    () => revenueData.reduce((sum, d) => sum + d.siparis, 0),
    [revenueData]
  );

  const avgFeedbackScore = useMemo(() => {
    const totalPositive = MOCK_FEEDBACK.reduce((s, f) => s + f.positive, 0);
    const totalAll = MOCK_FEEDBACK.reduce((s, f) => s + f.total, 0);
    return ((totalPositive / totalAll) * 5).toFixed(1);
  }, []);

  const handleExportPDF = () => {
    toast.success('PDF raporu hazirlaniyor...', {
      description: 'Rapor birkaç saniye icinde indirilecek.',
      duration: 3000,
    });

    setTimeout(() => {
      toast.info('PDF raporu hazir!', {
        description: 'Bu ozellik yakin zamanda aktif olacak.',
        duration: 4000,
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header + Date Range                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Analitik
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Restoraninizin performans metrikleri ve detayli istatistikler.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            onClick={handleExportPDF}
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg px-4',
              'bg-accent-orange text-white text-sm font-medium',
              'transition-all hover:bg-accent-orange/90',
              'active:scale-[0.97]'
            )}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF Rapor</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Summary KPI Row                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10">
              <TrendingUp className="h-4 w-4 text-accent-orange" />
            </div>
            <span className="text-xs font-medium text-text-muted">Toplam Gelir</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-text-main sm:text-2xl">
            ₺{totalRevenue.toLocaleString('tr-TR')}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              +12.5%
            </span>
            <span className="text-[10px] text-text-muted">onceki doneme gore</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10">
              <BarChart3 className="h-4 w-4 text-accent-blue" />
            </div>
            <span className="text-xs font-medium text-text-muted">Toplam Siparis</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-text-main sm:text-2xl">
            {totalOrders.toLocaleString('tr-TR')}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              +8.3%
            </span>
            <span className="text-[10px] text-text-muted">onceki doneme gore</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/10">
              <QrCode className="h-4 w-4 text-accent-purple" />
            </div>
            <span className="text-xs font-medium text-text-muted">QR Tarama</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-text-main sm:text-2xl">
            {MOCK_QR_STATS.totalScans.toLocaleString('tr-TR')}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              +{MOCK_QR_STATS.scanTrend}%
            </span>
            <span className="text-[10px] text-text-muted">onceki doneme gore</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Star className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-text-muted">Memnuniyet</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-text-main sm:text-2xl">
            {avgFeedbackScore}/5
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              +2.1%
            </span>
            <span className="text-[10px] text-text-muted">onceki doneme gore</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Revenue Line Chart                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-text-main">
              Gelir Trendi
            </h2>
            <p className="text-xs text-text-muted">
              {revenueView === 'gunluk' && 'Son 7 gunluk gelir ve siparis'}
              {revenueView === 'haftalik' && 'Son 4 haftalik gelir ve siparis'}
              {revenueView === 'aylik' && 'Son 3 aylik gelir ve siparis'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RevenueViewToggle value={revenueView} onChange={setRevenueView} />
            <div className="hidden items-center gap-4 text-xs text-text-muted sm:flex">
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
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8892A4', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#8892A4', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₺${(v / 1000).toFixed(0)}k` : `₺${v}`
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#8892A4', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<RevenueTooltip />} />
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

      {/* ------------------------------------------------------------------ */}
      {/* Product Charts Row: Top + Bottom Sellers + Pie Chart                */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top Sellers Bar Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-text-main">
              En Cok Satan Urunler
            </h2>
            <p className="text-xs text-text-muted">Secili donem - ilk 7 urun</p>
          </div>
          <div className="h-[320px] w-full">
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
                  tick={{ fill: '#F0F4FF', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={95}
                />
                <Tooltip content={<ProductBarTooltip />} />
                <Bar
                  dataKey="adet"
                  name="adet"
                  fill="#FF6B2B"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Sellers Bar Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-text-main">
              En Az Satan Urunler
            </h2>
            <p className="text-xs text-text-muted">Secili donem - son 5 urun</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={MOCK_BOTTOM_PRODUCTS}
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
                  tick={{ fill: '#F0F4FF', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={95}
                />
                <Tooltip content={<ProductBarTooltip />} />
                <Bar
                  dataKey="adet"
                  name="adet"
                  fill="#EF4444"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Pie Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-text-main">
              Kategori Dagilimi
            </h2>
            <p className="text-xs text-text-muted">Satis bazli yuzdelik oran</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CATEGORY_SALES}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {MOCK_CATEGORY_SALES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {MOCK_CATEGORY_SALES.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate text-xs text-text-muted">{cat.name}</span>
                <span className="ml-auto text-xs font-semibold text-text-main">%{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hourly Order Density Heatmap                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-text-main">
              Saatlik Siparis Yogunlugu
            </h2>
            <p className="text-xs text-text-muted">
              Haftalik siparis dagilimi (saatlik ortalama)
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10">
            <Activity className="h-4 w-4 text-accent-orange" />
          </div>
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
                  <HeatmapCell
                    key={hourIdx}
                    value={val}
                    day={day}
                    hour={HEATMAP_HOURS[hourIdx]}
                    max={heatmapMax}
                  />
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
      {/* Table Occupancy + QR Scan Stats                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Table Occupancy */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">
                Masa Doluluk Oranlari
              </h2>
              <p className="text-xs text-text-muted">Secili donem ortalamalari</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10">
              <Users className="h-4 w-4 text-accent-blue" />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {MOCK_TABLE_OCCUPANCY.map((table) => (
              <div key={table.table} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs font-medium text-text-muted">
                  {table.table}
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                      getOccupancyBarColor(table.occupancyRate)
                    )}
                    style={{ width: `${table.occupancyRate}%` }}
                  />
                </div>
                <span className={cn(
                  'w-10 text-right text-xs font-bold',
                  table.occupancyRate >= 80 ? 'text-emerald-400' :
                  table.occupancyRate >= 60 ? 'text-accent-blue' :
                  table.occupancyRate >= 40 ? 'text-amber-400' : 'text-red-400'
                )}>
                  %{table.occupancyRate}
                </span>
                <span className="hidden w-16 text-right text-[11px] text-text-muted sm:block">
                  {table.totalOrders} siparis
                </span>
              </div>
            ))}
          </div>
          {/* Occupancy Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Yuksek (%80+)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent-blue" />
              Orta (%60-79)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Dusuk (%40-59)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Cok Dusuk (&lt;%40)
            </span>
          </div>
        </div>

        {/* QR Scan Stats */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">
                QR Kod Istatistikleri
              </h2>
              <p className="text-xs text-text-muted">Tarama ve kullanim verileri</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/10">
              <QrCode className="h-4 w-4 text-accent-purple" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-[11px] font-medium text-text-muted">Toplam Tarama</p>
              <p className="mt-1 font-display text-xl font-bold text-text-main">
                {MOCK_QR_STATS.totalScans.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-[11px] font-medium text-text-muted">Tekil Tarama</p>
              <p className="mt-1 font-display text-xl font-bold text-text-main">
                {MOCK_QR_STATS.uniqueScans.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-[11px] font-medium text-text-muted">Donusum Orani</p>
              <p className="mt-1 font-display text-xl font-bold text-emerald-400">
                %{MOCK_QR_STATS.conversionRate}
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-[11px] font-medium text-text-muted">Gunluk Ort.</p>
              <p className="mt-1 font-display text-xl font-bold text-text-main">
                {MOCK_QR_STATS.dailyAvg}
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-[11px] font-medium text-text-muted">Ort. Oturum</p>
              <p className="mt-1 font-display text-xl font-bold text-text-main">
                {MOCK_QR_STATS.avgSessionDuration}
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-[11px] font-medium text-text-muted">Yogun Saat</p>
              <p className="mt-1 font-display text-xl font-bold text-accent-orange">
                {MOCK_QR_STATS.peakHour}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10">
              <TrendingUp className="h-4 w-4 text-accent-blue" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-main">
                Tarama artisi: <span className="text-emerald-400">+{MOCK_QR_STATS.scanTrend}%</span>
              </p>
              <p className="text-[10px] text-text-muted">
                En cok kullanilan cihaz: {MOCK_QR_STATS.topDevice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Customer Feedback Summary                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-text-main">
              Musteri Geri Bildirimleri
            </h2>
            <p className="text-xs text-text-muted">
              Kategoriye gore memnuniyet puanlari
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-main">{avgFeedbackScore}/5</p>
              <p className="text-[10px] text-text-muted">Genel Puan</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-left text-xs font-medium text-text-muted">Kategori</th>
                <th className="pb-3 text-center text-xs font-medium text-text-muted">
                  <span className="flex items-center justify-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-emerald-400" />
                    Olumlu
                  </span>
                </th>
                <th className="pb-3 text-center text-xs font-medium text-text-muted">
                  <span className="flex items-center justify-center gap-1">
                    <ThumbsDown className="h-3 w-3 text-red-400" />
                    Olumsuz
                  </span>
                </th>
                <th className="pb-3 text-center text-xs font-medium text-text-muted">Toplam</th>
                <th className="pb-3 text-left text-xs font-medium text-text-muted">Memnuniyet</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FEEDBACK.map((item) => {
                const satisfactionRate = Math.round((item.positive / item.total) * 100);
                return (
                  <tr
                    key={item.category}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
                  >
                    <td className="py-3 text-sm font-medium text-text-main">
                      {item.category}
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-sm font-semibold text-emerald-400">
                        {item.positive}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-sm font-semibold text-red-400">
                        {item.negative}
                      </span>
                    </td>
                    <td className="py-3 text-center text-sm text-text-muted">
                      {item.total}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-white/5">
                          <div
                            className={cn(
                              'absolute inset-y-0 left-0 rounded-full',
                              satisfactionRate >= 90 ? 'bg-emerald-400' :
                              satisfactionRate >= 75 ? 'bg-accent-blue' :
                              satisfactionRate >= 60 ? 'bg-amber-400' : 'bg-red-400'
                            )}
                            style={{ width: `${satisfactionRate}%` }}
                          />
                        </div>
                        <span className={cn(
                          'text-xs font-bold',
                          satisfactionRate >= 90 ? 'text-emerald-400' :
                          satisfactionRate >= 75 ? 'text-accent-blue' :
                          satisfactionRate >= 60 ? 'text-amber-400' : 'text-red-400'
                        )}>
                          %{satisfactionRate}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
