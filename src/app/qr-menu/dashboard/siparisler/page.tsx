'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  LayoutGrid,
  ChefHat,
  History,
  Bell,
  BellRing,
  Search,
  Filter,
  Calendar,
  Hash,
  Package,
  CheckCircle2,
  Truck,
  Ban,
  Clock,
  ArrowUpDown,
  X,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import OrderKanban from '@/components/qr-menu/OrderKanban';
import KDSView from '@/components/qr-menu/KDSView';
import OrderDetailModal from '@/components/qr-menu/OrderDetailModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Order, OrderStatus, Table } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_RESTAURANT_ID = 'demo-restaurant-001';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  new: {
    label: 'Yeni',
    icon: Package,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
  },
  preparing: {
    label: 'Hazirlaniyor',
    icon: ChefHat,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
  },
  ready: {
    label: 'Hazir',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
  },
  delivered: {
    label: 'Teslim Edildi',
    icon: Truck,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
  },
  cancelled: {
    label: 'Iptal',
    icon: Ban,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_TABLES: Table[] = [
  { id: 't1', restaurant_id: MOCK_RESTAURANT_ID, table_number: '1', capacity: 4, position: { x: 0, y: 0 }, status: 'occupied', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
  { id: 't2', restaurant_id: MOCK_RESTAURANT_ID, table_number: '2', capacity: 2, position: { x: 1, y: 0 }, status: 'occupied', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
  { id: 't3', restaurant_id: MOCK_RESTAURANT_ID, table_number: '3', capacity: 6, position: { x: 2, y: 0 }, status: 'occupied', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
  { id: 't4', restaurant_id: MOCK_RESTAURANT_ID, table_number: '4', capacity: 4, position: { x: 3, y: 0 }, status: 'empty', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
  { id: 't5', restaurant_id: MOCK_RESTAURANT_ID, table_number: '5', capacity: 8, position: { x: 4, y: 0 }, status: 'occupied', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
  { id: 't6', restaurant_id: MOCK_RESTAURANT_ID, table_number: '6', capacity: 2, position: { x: 0, y: 1 }, status: 'empty', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
  { id: 't7', restaurant_id: MOCK_RESTAURANT_ID, table_number: '7', capacity: 4, position: { x: 1, y: 1 }, status: 'occupied', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
  { id: 't8', restaurant_id: MOCK_RESTAURANT_ID, table_number: '8', capacity: 6, position: { x: 2, y: 1 }, status: 'reserved', qr_code_url: null, created_at: '2026-03-15T08:00:00Z' },
];

function generateMockOrders(): Order[] {
  const now = Date.now();
  const items = [
    { name: 'Izgara Kofte', quantity: 2, price: 95, modifiers: ['Acili'] },
    { name: 'Karisik Pizza', quantity: 1, price: 120, modifiers: ['Ekstra Peynir'] },
    { name: 'Tavuk Salata', quantity: 1, price: 65, modifiers: [] },
    { name: 'Adana Kebap', quantity: 3, price: 110, modifiers: ['Acisiz'] },
    { name: 'Hamburger Menu', quantity: 1, price: 85, modifiers: ['Buyuk Boy'] },
    { name: 'Lahmacun', quantity: 4, price: 45, modifiers: [] },
    { name: 'Mercimek Corbasi', quantity: 2, price: 35, modifiers: [] },
    { name: 'Iskender', quantity: 1, price: 145, modifiers: ['Ekstra Tereyag'] },
    { name: 'Su Boregi', quantity: 2, price: 55, modifiers: [] },
    { name: 'Kunefe', quantity: 1, price: 75, modifiers: ['Dondurma ile'] },
  ];

  const orders: Order[] = [
    // Active orders
    {
      id: 'ord-001-aaa',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't1',
      items: [items[0], items[6]],
      total_amount: 260,
      status: 'new',
      notes: 'Kofte iyi pismis olsun',
      waiter_called: true,
      created_at: new Date(now - 5 * 60000).toISOString(),
      updated_at: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: 'ord-002-bbb',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't2',
      items: [items[1]],
      total_amount: 120,
      status: 'new',
      notes: null,
      waiter_called: false,
      created_at: new Date(now - 3 * 60000).toISOString(),
      updated_at: new Date(now - 3 * 60000).toISOString(),
    },
    {
      id: 'ord-003-ccc',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't3',
      items: [items[3], items[8]],
      total_amount: 440,
      status: 'preparing',
      notes: null,
      waiter_called: false,
      created_at: new Date(now - 12 * 60000).toISOString(),
      updated_at: new Date(now - 8 * 60000).toISOString(),
    },
    {
      id: 'ord-004-ddd',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't5',
      items: [items[4], items[2]],
      total_amount: 150,
      status: 'preparing',
      notes: 'Salata soslu olmasin',
      waiter_called: false,
      created_at: new Date(now - 18 * 60000).toISOString(),
      updated_at: new Date(now - 14 * 60000).toISOString(),
    },
    {
      id: 'ord-005-eee',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't7',
      items: [items[7]],
      total_amount: 145,
      status: 'ready',
      notes: null,
      waiter_called: true,
      created_at: new Date(now - 25 * 60000).toISOString(),
      updated_at: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: 'ord-006-fff',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't1',
      items: [items[5], items[9]],
      total_amount: 255,
      status: 'ready',
      notes: null,
      waiter_called: false,
      created_at: new Date(now - 22 * 60000).toISOString(),
      updated_at: new Date(now - 4 * 60000).toISOString(),
    },
    {
      id: 'ord-007-ggg',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't3',
      items: [items[0], items[1], items[9]],
      total_amount: 290,
      status: 'new',
      notes: 'Hepsi ayni anda gelsin',
      waiter_called: false,
      created_at: new Date(now - 1 * 60000).toISOString(),
      updated_at: new Date(now - 1 * 60000).toISOString(),
    },
    // Delivered / history orders
    {
      id: 'ord-008-hhh',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't2',
      items: [items[3], items[6]],
      total_amount: 180,
      status: 'delivered',
      notes: null,
      waiter_called: false,
      created_at: new Date(now - 90 * 60000).toISOString(),
      updated_at: new Date(now - 60 * 60000).toISOString(),
    },
    {
      id: 'ord-009-iii',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't5',
      items: [items[7], items[8]],
      total_amount: 255,
      status: 'delivered',
      notes: null,
      waiter_called: false,
      created_at: new Date(now - 120 * 60000).toISOString(),
      updated_at: new Date(now - 95 * 60000).toISOString(),
    },
    {
      id: 'ord-010-jjj',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't4',
      items: [items[1], items[2], items[9]],
      total_amount: 260,
      status: 'delivered',
      notes: 'Acele etmeyin',
      waiter_called: false,
      created_at: new Date(now - 150 * 60000).toISOString(),
      updated_at: new Date(now - 125 * 60000).toISOString(),
    },
    {
      id: 'ord-011-kkk',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't7',
      items: [items[4]],
      total_amount: 85,
      status: 'cancelled',
      notes: 'Musteri vazgecti',
      waiter_called: false,
      created_at: new Date(now - 180 * 60000).toISOString(),
      updated_at: new Date(now - 175 * 60000).toISOString(),
    },
    {
      id: 'ord-012-lll',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't6',
      items: [items[5], items[6], items[8]],
      total_amount: 135,
      status: 'delivered',
      notes: null,
      waiter_called: false,
      created_at: new Date(now - 200 * 60000).toISOString(),
      updated_at: new Date(now - 170 * 60000).toISOString(),
    },
    {
      id: 'ord-013-mmm',
      restaurant_id: MOCK_RESTAURANT_ID,
      table_id: 't1',
      items: [items[0], items[3], items[7]],
      total_amount: 350,
      status: 'delivered',
      notes: null,
      waiter_called: false,
      created_at: new Date(now - 240 * 60000).toISOString(),
      updated_at: new Date(now - 210 * 60000).toISOString(),
    },
  ];

  return orders;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getTableNumber(order: Order, tables: Table[]): string {
  if (!order.table_id) return '-';
  const table = tables.find((t) => t.id === order.table_id);
  return table ? table.table_number : '-';
}

function getItemCount(order: Order): number {
  if (!order.items || !Array.isArray(order.items)) return 0;
  return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

// ---------------------------------------------------------------------------
// ViewMode type
// ---------------------------------------------------------------------------

type ViewMode = 'kanban' | 'kds';
type MainTab = 'active' | 'history';

// ---------------------------------------------------------------------------
// HistoryFilters
// ---------------------------------------------------------------------------

interface HistoryFilters {
  search: string;
  status: OrderStatus | 'all';
  tableId: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

const DEFAULT_FILTERS: HistoryFilters = {
  search: '',
  status: 'all',
  tableId: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  sortBy: 'date_desc',
};

// ---------------------------------------------------------------------------
// WaiterCallBell - notification bell for active waiter calls
// ---------------------------------------------------------------------------

function WaiterCallBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 rounded-xl border px-4 py-2.5',
        'text-sm font-medium transition-all duration-200',
        count > 0
          ? 'border-red-400/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
          : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20 hover:bg-white/10'
      )}
    >
      {count > 0 ? (
        <motion.div
          animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
        >
          <BellRing className="h-4.5 w-4.5" />
        </motion.div>
      ) : (
        <Bell className="h-4.5 w-4.5" />
      )}
      <span>Garson Cagrisi</span>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white"
        >
          {count}
        </motion.span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ActiveOrdersStats - summary stats bar
// ---------------------------------------------------------------------------

interface ActiveStatsProps {
  orders: Order[];
}

function ActiveOrdersStats({ orders }: ActiveStatsProps) {
  const stats = useMemo(() => {
    const active = orders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    );
    const newCount = orders.filter((o) => o.status === 'new').length;
    const preparingCount = orders.filter((o) => o.status === 'preparing').length;
    const readyCount = orders.filter((o) => o.status === 'ready').length;
    const totalAmount = active.reduce((sum, o) => sum + o.total_amount, 0);

    return { active: active.length, newCount, preparingCount, readyCount, totalAmount };
  }, [orders]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
        <span className="text-xs text-text-muted">Aktif:</span>
        <span className="text-sm font-bold text-accent-orange">{stats.active}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-sky-400/5 px-3 py-1.5">
        <Package className="h-3.5 w-3.5 text-sky-400" />
        <span className="text-xs font-semibold text-sky-400">{stats.newCount}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-amber-400/5 px-3 py-1.5">
        <ChefHat className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-amber-400">{stats.preparingCount}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-400/5 px-3 py-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-400">{stats.readyCount}</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
        <DollarSign className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-xs text-text-muted">Toplam:</span>
        <span className="text-sm font-bold text-text-main">{formatPrice(stats.totalAmount)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HistoryOrderRow - single row in the history table
// ---------------------------------------------------------------------------

interface HistoryRowProps {
  order: Order;
  tables: Table[];
  onOrderClick: (order: Order) => void;
}

function HistoryOrderRow({ order, tables, onOrderClick }: HistoryRowProps) {
  const statusCfg = STATUS_CONFIG[order.status];
  const StatusIcon = statusCfg.icon;
  const tableNumber = getTableNumber(order, tables);
  const itemCount = getItemCount(order);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onOrderClick(order)}
      className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.03]"
    >
      <td className="px-4 py-3">
        <span className="font-mono text-xs font-medium text-text-main">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-sm text-text-main">{tableNumber}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
            statusCfg.bg,
            statusCfg.border
          )}
        >
          <StatusIcon className={cn('h-3 w-3', statusCfg.color)} />
          <span className={cn('text-[11px] font-semibold', statusCfg.color)}>
            {statusCfg.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-muted">{itemCount} urun</td>
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-text-main">
          {formatPrice(order.total_amount)}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-text-muted">
        {formatDateShort(order.created_at)}
      </td>
    </motion.tr>
  );
}

// ---------------------------------------------------------------------------
// OrderHistoryTab - history with filters
// ---------------------------------------------------------------------------

interface OrderHistoryTabProps {
  orders: Order[];
  tables: Table[];
  onOrderClick: (order: Order) => void;
}

function OrderHistoryTab({ orders, tables, onOrderClick }: OrderHistoryTabProps) {
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const historyOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'delivered' || o.status === 'cancelled'
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = [...historyOrders];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.notes && o.notes.toLowerCase().includes(q)) ||
          o.items.some((item) => item.name.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((o) => o.status === filters.status);
    }

    // Table filter
    if (filters.tableId) {
      result = result.filter((o) => o.table_id === filters.tableId);
    }

    // Date range filter
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter((o) => new Date(o.created_at).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 86400000; // include full day
      result = result.filter((o) => new Date(o.created_at).getTime() <= to);
    }

    // Amount range filter
    if (filters.amountMin) {
      const min = parseFloat(filters.amountMin);
      if (!isNaN(min)) result = result.filter((o) => o.total_amount >= min);
    }
    if (filters.amountMax) {
      const max = parseFloat(filters.amountMax);
      if (!isNaN(max)) result = result.filter((o) => o.total_amount <= max);
    }

    // Sort
    switch (filters.sortBy) {
      case 'date_asc':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'amount_desc':
        result.sort((a, b) => b.total_amount - a.total_amount);
        break;
      case 'amount_asc':
        result.sort((a, b) => a.total_amount - b.total_amount);
        break;
      case 'date_desc':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [historyOrders, filters]);

  const totalRevenue = useMemo(
    () =>
      filteredOrders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total_amount, 0),
    [filteredOrders]
  );

  const handleFilterChange = useCallback(
    <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.tableId !== '' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.amountMin !== '' ||
      filters.amountMax !== '',
    [filters]
  );

  return (
    <div className="space-y-4">
      {/* History Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Siparis ara..."
            className="border-white/10 bg-white/5 pl-10 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((p) => !p)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
              showFilters
                ? 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange'
                : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
            )}
          >
            <Filter className="h-4 w-4" />
            Filtreler
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-orange text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              handleFilterChange('sortBy', e.target.value as HistoryFilters['sortBy'])
            }
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-muted outline-none transition-all hover:border-white/20 focus:border-accent-orange/50"
          >
            <option value="date_desc">En Yeni</option>
            <option value="date_asc">En Eski</option>
            <option value="amount_desc">Tutar (Yuksek)</option>
            <option value="amount_asc">Tutar (Dusuk)</option>
          </select>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-muted transition-all hover:border-white/20 hover:text-text-main"
            >
              <X className="h-3.5 w-3.5" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-4 lg:grid-cols-5">
              {/* Status filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Durum
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    handleFilterChange('status', e.target.value as OrderStatus | 'all')
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main outline-none focus:border-accent-orange/50"
                >
                  <option value="all">Tumu</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">Iptal</option>
                </select>
              </div>

              {/* Table filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Masa
                </label>
                <select
                  value={filters.tableId}
                  onChange={(e) => handleFilterChange('tableId', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main outline-none focus:border-accent-orange/50"
                >
                  <option value="">Tumu</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Masa {t.table_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date from */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Baslangic Tarihi
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main outline-none focus:border-accent-orange/50"
                />
              </div>

              {/* Date to */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Bitis Tarihi
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main outline-none focus:border-accent-orange/50"
                />
              </div>

              {/* Amount range */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Tutar Araligi (TL)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-text-main outline-none focus:border-accent-orange/50"
                  />
                  <span className="text-text-muted">-</span>
                  <input
                    type="number"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-text-main outline-none focus:border-accent-orange/50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
        <span className="text-xs text-text-muted">
          {filteredOrders.length} siparis bulundu
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Toplam Gelir:</span>
          <span className="text-sm font-bold text-emerald-400">
            {formatPrice(totalRevenue)}
          </span>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Siparis
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Masa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Urunler
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Tutar
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <History className="h-8 w-8 text-text-muted/30" />
                        <p className="text-sm text-text-muted/50">
                          {hasActiveFilters
                            ? 'Filtrelerle eslesme bulunamadi'
                            : 'Henuz siparis gecmisi yok'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <HistoryOrderRow
                      key={order.id}
                      order={order}
                      tables={tables}
                      onOrderClick={onOrderClick}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton for Orders Content
// ---------------------------------------------------------------------------

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats Bar Skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg bg-white/5" />
        ))}
      </div>

      {/* Kanban Columns Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded bg-white/10" />
                <Skeleton className="h-5 w-24 bg-white/10" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full bg-white/5" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: colIdx === 0 ? 3 : 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-4 w-16 bg-white/5" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-full bg-white/5" />
                    <Skeleton className="h-3 w-2/3 bg-white/5" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
                    <Skeleton className="h-4 w-14 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State for Active Orders
// ---------------------------------------------------------------------------

function EmptyActiveOrders() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-orange/10">
        <ShoppingCart className="h-8 w-8 text-accent-orange" />
      </div>
      <h3 className="mt-6 font-display text-lg font-bold text-text-main">
        Henuz siparis yok
      </h3>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        Aktif siparis bulunmuyor. Musterileriniz QR menu uzerinden siparis verdikce
        burada canli olarak goruntulenecektir.
      </p>
      <div className="mt-5 flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-2 w-2 rounded-full bg-emerald-400"
        />
        <span className="text-xs text-text-muted">Canli dinleniyor - yeni siparisler otomatik gorunecek</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SiparislerPage (Main Page Component)
// ---------------------------------------------------------------------------

export default function SiparislerPage() {
  // ---- State ----
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables] = useState<Table[]>(MOCK_TABLES);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeTab, setActiveTab] = useState<MainTab>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  // ---- Derived state ----
  const activeOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.status !== 'delivered' && o.status !== 'cancelled'
      ),
    [orders]
  );

  const waiterCallCount = useMemo(
    () => activeOrders.filter((o) => o.waiter_called).length,
    [activeOrders]
  );

  // ---- Initial data load ----
  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', MOCK_RESTAURANT_ID)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setOrders(data as Order[]);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback to mock data when Supabase is not available
      }
      setOrders(generateMockOrders());
      setIsLoading(false);
    }

    loadOrders();
  }, []);

  // ---- Supabase Realtime subscription ----
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch {
      // Supabase not configured - use mock data
      return;
    }

    const channel = supabase
      .channel(`orders-page-${MOCK_RESTAURANT_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${MOCK_RESTAURANT_ID}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => [...prev, newOrder]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  // ---- Callbacks ----
  const handleStatusChange = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
            : o
        )
      );

      // Also update selected order if detail modal is open
      setSelectedOrder((prev) =>
        prev && prev.id === orderId
          ? { ...prev, status: newStatus, updated_at: new Date().toISOString() }
          : prev
      );
    },
    []
  );

  const handleOrderClick = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  }, []);

  const handleOrdersUpdate = useCallback((updatedOrders: Order[]) => {
    setOrders(updatedOrders);
  }, []);

  const handleWaiterBellClick = useCallback(() => {
    // Scroll/filter to waiter-called orders - switch to kanban active view
    setActiveTab('active');
    setViewMode('kanban');
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-6 p-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/10">
            <ShoppingCart className="h-5 w-5 text-accent-orange" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-main">Siparisler</h1>
            <p className="text-sm text-text-muted">
              Siparis yonetimi ve takibi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Waiter Call Bell */}
          <WaiterCallBell count={waiterCallCount} onClick={handleWaiterBellClick} />

          {/* Live indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-2 w-2 rounded-full bg-emerald-400"
            />
            <span className="text-xs text-text-muted">Canli</span>
          </div>
        </div>
      </div>

      {/* ---- Main Tabs: Active / History ---- */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as MainTab)}
        className="space-y-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-white/5">
            <TabsTrigger
              value="active"
              className="gap-2 data-[state=active]:bg-accent-orange/10 data-[state=active]:text-accent-orange"
            >
              <LayoutGrid className="h-4 w-4" />
              Aktif Siparisler
              {activeOrders.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-orange/20 px-1.5 text-[10px] font-bold text-accent-orange">
                  {activeOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="gap-2 data-[state=active]:bg-purple-400/10 data-[state=active]:text-purple-400"
            >
              <History className="h-4 w-4" />
              Gecmis
            </TabsTrigger>
          </TabsList>

          {/* View mode toggle (only for active tab) */}
          {activeTab === 'active' && (
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] p-1">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  viewMode === 'kanban'
                    ? 'bg-accent-orange/10 text-accent-orange shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kds')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  viewMode === 'kds'
                    ? 'bg-accent-orange/10 text-accent-orange shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                )}
              >
                <ChefHat className="h-4 w-4" />
                Mutfak (KDS)
              </button>
            </div>
          )}
        </div>

        {/* ---- Active Orders Tab ---- */}
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <OrdersSkeleton />
          ) : activeOrders.length === 0 ? (
            <EmptyActiveOrders />
          ) : (
            <>
              {/* Stats bar */}
              <ActiveOrdersStats orders={orders} />

              {/* View content */}
              <AnimatePresence mode="wait">
                {viewMode === 'kanban' ? (
                  <motion.div
                    key="kanban"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <OrderKanban
                      orders={activeOrders}
                      tables={tables}
                      onStatusChange={handleStatusChange}
                      onOrderClick={handleOrderClick}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="kds"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[600px] overflow-hidden rounded-xl border border-white/10"
                  >
                    <KDSView
                      orders={activeOrders}
                      tables={tables}
                      restaurantId={MOCK_RESTAURANT_ID}
                      onStatusChange={handleStatusChange}
                      onOrdersUpdate={handleOrdersUpdate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </TabsContent>

        {/* ---- History Tab ---- */}
        <TabsContent value="history">
          <OrderHistoryTab
            orders={orders}
            tables={tables}
            onOrderClick={handleOrderClick}
          />
        </TabsContent>
      </Tabs>

      {/* ---- Order Detail Modal ---- */}
      <OrderDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        order={selectedOrder}
        tables={tables}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
