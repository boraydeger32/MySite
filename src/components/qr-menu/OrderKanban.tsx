'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronRight,
  Package,
  ChefHat,
  CheckCircle2,
  Truck,
  StickyNote,
  Hash,
  Users,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus, OrderWithTable, Table } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderKanbanProps {
  orders: Order[];
  tables: Table[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick: (order: Order) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KANBAN_COLUMNS: {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  accentColor: string;
  bgGlow: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  nextStatus: OrderStatus | null;
  nextLabel: string | null;
}[] = [
  {
    status: 'new',
    label: 'Yeni',
    icon: Package,
    accentColor: 'text-sky-400',
    bgGlow: 'shadow-[0_0_20px_rgba(56,189,248,0.08)]',
    borderColor: 'border-sky-400/20',
    badgeBg: 'bg-sky-400/10',
    badgeText: 'text-sky-400',
    nextStatus: 'preparing',
    nextLabel: 'Hazirlaniyor',
  },
  {
    status: 'preparing',
    label: 'Hazirlaniyor',
    icon: ChefHat,
    accentColor: 'text-amber-400',
    bgGlow: 'shadow-[0_0_20px_rgba(251,191,36,0.08)]',
    borderColor: 'border-amber-400/20',
    badgeBg: 'bg-amber-400/10',
    badgeText: 'text-amber-400',
    nextStatus: 'ready',
    nextLabel: 'Hazir',
  },
  {
    status: 'ready',
    label: 'Hazir',
    icon: CheckCircle2,
    accentColor: 'text-emerald-400',
    bgGlow: 'shadow-[0_0_20px_rgba(52,211,153,0.08)]',
    borderColor: 'border-emerald-400/20',
    badgeBg: 'bg-emerald-400/10',
    badgeText: 'text-emerald-400',
    nextStatus: 'delivered',
    nextLabel: 'Teslim Edildi',
  },
  {
    status: 'delivered',
    label: 'Teslim Edildi',
    icon: Truck,
    accentColor: 'text-purple-400',
    bgGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.08)]',
    borderColor: 'border-purple-400/20',
    badgeBg: 'bg-purple-400/10',
    badgeText: 'text-purple-400',
    nextStatus: null,
    nextLabel: null,
  },
];

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
// ElapsedTime - shows real-time elapsed since order creation
// ---------------------------------------------------------------------------

function ElapsedTime({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculate = useCallback(() => {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const diffMs = now - created;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const remainingMin = diffMin % 60;

    if (diffHours > 0) {
      setElapsed(`${diffHours}s ${remainingMin}dk`);
    } else {
      setElapsed(`${diffMin}dk`);
    }
  }, [createdAt]);

  useEffect(() => {
    calculate();
    intervalRef.current = setInterval(calculate, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calculate]);

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
      <Clock className="h-3 w-3" />
      {elapsed}
    </span>
  );
}

// ---------------------------------------------------------------------------
// OrderCard
// ---------------------------------------------------------------------------

interface OrderCardProps {
  order: Order;
  tables: Table[];
  column: (typeof KANBAN_COLUMNS)[number];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onClick: () => void;
}

const cardVariants = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const columnEntryVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
};

function OrderCard({
  order,
  tables,
  column,
  onStatusChange,
  onClick,
}: OrderCardProps) {
  const tableNumber = getTableNumber(order, tables);
  const itemCount = getItemCount(order);
  const hasNotes = !!order.notes;
  const isWaiterCalled = order.waiter_called;

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl',
        'transition-all duration-200',
        'hover:border-white/20 hover:shadow-lg hover:shadow-white/[0.02]'
      )}
    >
      {/* Waiter call indicator */}
      {isWaiterCalled && (
        <div className="absolute right-2 top-2 z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20"
          >
            <Bell className="h-3.5 w-3.5 text-red-400" />
          </motion.div>
        </div>
      )}

      <div className="p-3">
        {/* Header: Table number + Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('flex items-center gap-1 rounded-md px-2 py-0.5', column.badgeBg)}>
              <Hash className={cn('h-3 w-3', column.badgeText)} />
              <span className={cn('text-xs font-bold', column.badgeText)}>
                {tableNumber}
              </span>
            </div>
          </div>
          <ElapsedTime createdAt={order.created_at} />
        </div>

        {/* Body: Item count + Total */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Users className="h-3.5 w-3.5" />
            <span>
              {itemCount} {itemCount === 1 ? 'urun' : 'urun'}
            </span>
          </div>
          <span className="text-sm font-bold text-text-main">
            {formatPrice(order.total_amount)}
          </span>
        </div>

        {/* Notes indicator */}
        {hasNotes && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/5 px-2 py-1.5">
            <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
            <p className="line-clamp-1 text-[11px] text-amber-300/80">
              {order.notes}
            </p>
          </div>
        )}

        {/* Action: Move to next status - 44px min touch target */}
        {column.nextStatus && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, column.nextStatus!);
            }}
            className={cn(
              'mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2',
              'border border-white/10 bg-white/[0.03] text-xs font-medium text-text-muted',
              'transition-all duration-200',
              'hover:border-white/20 hover:bg-white/[0.06] hover:text-text-main',
              'active:scale-[0.97]'
            )}
          >
            {column.nextLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// KanbanColumn
// ---------------------------------------------------------------------------

interface KanbanColumnProps {
  column: (typeof KANBAN_COLUMNS)[number];
  orders: Order[];
  tables: Table[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick: (order: Order) => void;
}

function KanbanColumn({
  column,
  orders,
  tables,
  onStatusChange,
  onOrderClick,
}: KanbanColumnProps) {
  const Icon = column.icon;

  return (
    <motion.div
      variants={columnEntryVariants}
      className={cn(
        'flex min-w-[280px] flex-1 flex-col rounded-xl border bg-white/[0.02] backdrop-blur-sm',
        // On mobile, snap to full-width columns for easier horizontal swiping
        'snap-center sm:snap-align-none',
        column.borderColor,
        column.bgGlow
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4.5 w-4.5', column.accentColor)} />
          <h3 className="text-sm font-semibold text-text-main">
            {column.label}
          </h3>
        </div>
        <span
          className={cn(
            'flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold',
            column.badgeBg,
            column.badgeText
          )}
        >
          {orders.length}
        </span>
      </div>

      {/* Column Body */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-1 items-center justify-center py-8"
            >
              <p className="text-xs text-text-muted/50">Siparis yok</p>
            </motion.div>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                tables={tables}
                column={column}
                onStatusChange={onStatusChange}
                onClick={() => onOrderClick(order)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// OrderKanban (Main Component)
// ---------------------------------------------------------------------------

export default function OrderKanban({
  orders,
  tables,
  onStatusChange,
  onOrderClick,
  className,
}: OrderKanbanProps) {
  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      new: [],
      preparing: [],
      ready: [],
      delivered: [],
      cancelled: [],
    };

    for (const order of orders) {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    }

    // Sort each group by created_at descending (newest first)
    for (const key of Object.keys(grouped) as OrderStatus[]) {
      grouped[key].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return grouped;
  }, [orders]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
          },
        },
      }}
      className={cn(
        // Base horizontal scroll with momentum scrolling
        'flex gap-4 overflow-x-auto pb-4',
        // Snap scroll for mobile - columns snap into view when swiping
        'snap-x snap-mandatory sm:snap-none',
        // Smooth momentum scrolling on iOS
        '[&::-webkit-scrollbar]:h-1.5',
        '[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10',
        '[&::-webkit-scrollbar-thumb:hover]:bg-white/20',
        // Scroll padding for snap alignment
        'scroll-pl-4 scroll-pr-4',
        className
      )}
    >
      {KANBAN_COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          column={column}
          orders={ordersByStatus[column.status] || []}
          tables={tables}
          onStatusChange={onStatusChange}
          onOrderClick={onOrderClick}
        />
      ))}
    </motion.div>
  );
}
