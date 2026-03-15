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
  Hash,
  Maximize2,
  Minimize2,
  Bell,
  StickyNote,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderStatus, OrderItem, Table } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KDSViewProps {
  orders: Order[];
  tables: Table[];
  restaurantId: string;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onOrdersUpdate?: (orders: Order[]) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** KDS only shows active orders (not delivered or cancelled) */
const KDS_STATUSES: {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  accentColor: string;
  bgColor: string;
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
    bgColor: 'bg-sky-400/10',
    borderColor: 'border-sky-400/30',
    badgeBg: 'bg-sky-400/15',
    badgeText: 'text-sky-400',
    nextStatus: 'preparing',
    nextLabel: 'Hazirlaniyor',
  },
  {
    status: 'preparing',
    label: 'Hazirlaniyor',
    icon: ChefHat,
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
    badgeBg: 'bg-amber-400/15',
    badgeText: 'text-amber-400',
    nextStatus: 'ready',
    nextLabel: 'Hazir',
  },
  {
    status: 'ready',
    label: 'Hazir',
    icon: CheckCircle2,
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/30',
    badgeBg: 'bg-emerald-400/15',
    badgeText: 'text-emerald-400',
    nextStatus: 'delivered',
    nextLabel: 'Teslim Edildi',
  },
];

/** Urgency thresholds in minutes */
const URGENCY = {
  normal: 10,
  warning: 20,
  critical: 30,
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTableNumber(order: Order, tables: Table[]): string {
  if (!order.table_id) return '-';
  const table = tables.find((t) => t.id === order.table_id);
  return table ? table.table_number : '-';
}

function getElapsedMinutes(createdAt: string): number {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  return Math.floor((now - created) / 60000);
}

function getUrgencyLevel(
  minutes: number
): 'normal' | 'warning' | 'critical' {
  if (minutes >= URGENCY.critical) return 'critical';
  if (minutes >= URGENCY.warning) return 'warning';
  return 'normal';
}

function getUrgencyStyles(level: 'normal' | 'warning' | 'critical') {
  switch (level) {
    case 'critical':
      return {
        border: 'border-red-500/60',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
        timeBg: 'bg-red-500/20',
        timeText: 'text-red-400',
        pulse: true,
      };
    case 'warning':
      return {
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        timeBg: 'bg-amber-500/15',
        timeText: 'text-amber-400',
        pulse: false,
      };
    default:
      return {
        border: 'border-white/10',
        glow: '',
        timeBg: 'bg-white/5',
        timeText: 'text-text-muted',
        pulse: false,
      };
  }
}

function formatElapsed(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}s ${mins}dk`;
  }
  return `${mins}dk`;
}

function getStatusConfig(status: OrderStatus) {
  return KDS_STATUSES.find((s) => s.status === status) ?? KDS_STATUSES[0];
}

// ---------------------------------------------------------------------------
// KDSElapsedTime - large real-time elapsed display
// ---------------------------------------------------------------------------

function KDSElapsedTime({ createdAt }: { createdAt: string }) {
  const [minutes, setMinutes] = useState(() => getElapsedMinutes(createdAt));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calculate = useCallback(() => {
    setMinutes(getElapsedMinutes(createdAt));
  }, [createdAt]);

  useEffect(() => {
    calculate();
    intervalRef.current = setInterval(calculate, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calculate]);

  const urgency = getUrgencyLevel(minutes);
  const styles = getUrgencyStyles(urgency);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
        styles.timeBg
      )}
    >
      {urgency === 'critical' ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <AlertTriangle className={cn('h-4 w-4', styles.timeText)} />
        </motion.div>
      ) : (
        <Timer className={cn('h-4 w-4', styles.timeText)} />
      )}
      <span className={cn('text-lg font-bold tabular-nums', styles.timeText)}>
        {formatElapsed(minutes)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KDSOrderCard - simplified card optimized for kitchen display
// ---------------------------------------------------------------------------

interface KDSOrderCardProps {
  order: Order;
  tables: Table[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const kdsCardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

function KDSOrderCard({ order, tables, onStatusChange }: KDSOrderCardProps) {
  const tableNumber = getTableNumber(order, tables);
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const elapsedMin = getElapsedMinutes(order.created_at);
  const urgency = getUrgencyLevel(elapsedMin);
  const urgencyStyles = getUrgencyStyles(urgency);
  const items = order.items || [];

  return (
    <motion.div
      layout
      variants={kdsCardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border bg-white/[0.03] backdrop-blur-sm',
        urgencyStyles.border,
        urgencyStyles.glow,
        urgencyStyles.pulse && 'animate-pulse-subtle'
      )}
    >
      {/* Header: Order number + Table + Status */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Order short ID */}
          <div className={cn('rounded-lg px-2.5 py-1', statusConfig.bgColor)}>
            <span className={cn('text-sm font-bold', statusConfig.accentColor)}>
              #{order.id.slice(0, 6).toUpperCase()}
            </span>
          </div>

          {/* Table number */}
          <div className="flex items-center gap-1.5">
            <Hash className="h-4 w-4 text-text-muted" />
            <span className="text-lg font-bold text-text-main">
              Masa {tableNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1',
              statusConfig.bgColor,
              statusConfig.borderColor
            )}
          >
            <StatusIcon className={cn('h-3.5 w-3.5', statusConfig.accentColor)} />
            <span className={cn('text-xs font-semibold', statusConfig.accentColor)}>
              {statusConfig.label}
            </span>
          </div>

          {/* Elapsed time */}
          <KDSElapsedTime createdAt={order.created_at} />
        </div>
      </div>

      {/* Waiter call indicator */}
      {order.waiter_called && (
        <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/10 px-4 py-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Bell className="h-4 w-4 text-red-400" />
          </motion.div>
          <span className="text-sm font-medium text-red-300">
            Garson cagrisi aktif
          </span>
        </div>
      )}

      {/* Body: Items list - large font for readability */}
      <div className="flex-1 px-4 py-3">
        <div className="space-y-2">
          {items.map((item, idx) => (
            <KDSItemRow key={idx} item={item} />
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-sm font-medium text-amber-300/90">
              {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Status action button */}
      {statusConfig.nextStatus && (
        <div className="border-t border-white/5 px-4 py-3">
          <button
            type="button"
            onClick={() => onStatusChange(order.id, statusConfig.nextStatus!)}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3',
              'text-base font-bold transition-all duration-200',
              order.status === 'new' &&
                'border border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20',
              order.status === 'preparing' &&
                'border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20',
              order.status === 'ready' &&
                'border border-purple-400/30 bg-purple-400/10 text-purple-400 hover:bg-purple-400/20'
            )}
          >
            {statusConfig.nextLabel}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// KDSItemRow - single item with large font for kitchen readability
// ---------------------------------------------------------------------------

function KDSItemRow({ item }: { item: OrderItem }) {
  const hasModifiers = item.modifiers && item.modifiers.length > 0;

  return (
    <div className="flex items-start gap-3">
      {/* Quantity badge */}
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-orange/15 text-sm font-bold text-accent-orange">
        {item.quantity}x
      </span>

      <div className="min-w-0 flex-1">
        {/* Item name - large and bold for kitchen visibility */}
        <p className="text-lg font-bold leading-tight text-text-main">
          {item.name}
        </p>
        {/* Modifiers */}
        {hasModifiers && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {item.modifiers.map((mod, idx) => (
              <span
                key={idx}
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-text-muted"
              >
                {mod}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KDSColumnHeader
// ---------------------------------------------------------------------------

interface KDSColumnHeaderProps {
  config: (typeof KDS_STATUSES)[number];
  count: number;
}

function KDSColumnHeader({ config, count }: KDSColumnHeaderProps) {
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
      <div className="flex items-center gap-3">
        <Icon className={cn('h-6 w-6', config.accentColor)} />
        <h2 className="text-xl font-bold text-text-main">{config.label}</h2>
      </div>
      <span
        className={cn(
          'flex h-8 min-w-[32px] items-center justify-center rounded-full px-3 text-sm font-bold',
          config.badgeBg,
          config.badgeText
        )}
      >
        {count}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KDSView (Main Component) - Fullscreen Kitchen Display System
// ---------------------------------------------------------------------------

export default function KDSView({
  orders,
  tables,
  restaurantId,
  onStatusChange,
  onOrdersUpdate,
  className,
}: KDSViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  // ---- Supabase Realtime subscription ----
  useEffect(() => {
    if (!restaurantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`kds-orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          if (!onOrdersUpdate) return;

          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            onOrdersUpdate([...orders, newOrder]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order;
            onOrdersUpdate(
              orders.map((o) => (o.id === updated.id ? updated : o))
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            onOrdersUpdate(orders.filter((o) => o.id !== deleted.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, orders, onOrdersUpdate]);

  // ---- Fullscreen toggle ----
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fullscreen request denied - silently handle
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        // Exit fullscreen failed - silently handle
      });
    }
  }, []);

  // ---- Listen for fullscreen changes (e.g. pressing Escape) ----
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ---- Group active orders by status ----
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, Order[]> = {
      new: [],
      preparing: [],
      ready: [],
    };

    for (const order of orders) {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    }

    // Sort each group by created_at ascending (oldest first = most urgent)
    for (const key of Object.keys(grouped)) {
      grouped[key].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return grouped;
  }, [orders]);

  // ---- Count total active orders ----
  const totalActive = useMemo(
    () =>
      KDS_STATUSES.reduce(
        (sum, col) => sum + (ordersByStatus[col.status]?.length || 0),
        0
      ),
    [ordersByStatus]
  );

  // ---- Current time display ----
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Intl.DateTimeFormat('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date())
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full flex-col bg-bg-dark',
        isFullscreen && 'fixed inset-0 z-[9999]',
        className
      )}
    >
      {/* ---- KDS Header Bar ---- */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-accent-orange" />
            <h1 className="text-xl font-bold text-text-main">
              Mutfak Ekrani
            </h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
            <span className="text-sm text-text-muted">Aktif Siparis:</span>
            <span className="text-sm font-bold text-accent-orange">
              {totalActive}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Clock */}
          <div className="flex items-center gap-2 text-text-muted">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm tabular-nums">{currentTime}</span>
          </div>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2',
              'text-sm font-medium text-text-muted transition-all duration-200',
              'hover:border-white/20 hover:bg-white/10 hover:text-text-main'
            )}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Kucult
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Tam Ekran
              </>
            )}
          </button>
        </div>
      </div>

      {/* ---- KDS Columns Grid ---- */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {KDS_STATUSES.map((statusConfig) => {
          const columnOrders = ordersByStatus[statusConfig.status] || [];

          return (
            <div
              key={statusConfig.status}
              className="flex flex-1 flex-col border-r border-white/5 last:border-r-0"
            >
              {/* Column Header */}
              <KDSColumnHeader config={statusConfig} count={columnOrders.length} />

              {/* Column Body - scrollable */}
              <div className="flex-1 overflow-y-auto p-3">
                <AnimatePresence mode="popLayout">
                  {columnOrders.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-full items-center justify-center"
                    >
                      <p className="text-sm text-text-muted/40">
                        Siparis yok
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {columnOrders.map((order) => (
                        <KDSOrderCard
                          key={order.id}
                          order={order}
                          tables={tables}
                          onStatusChange={onStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- KDS Footer (fullscreen only) ---- */}
      {isFullscreen && (
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-6 py-2">
          <div className="flex items-center gap-6">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {'< '}{URGENCY.normal}dk Normal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {URGENCY.normal}-{URGENCY.critical}dk Uyari
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {'> '}{URGENCY.critical}dk Kritik
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Canli guncelleme aktif</span>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-2 w-2 rounded-full bg-emerald-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
