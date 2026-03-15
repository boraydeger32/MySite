'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Clock,
  Hash,
  StickyNote,
  Printer,
  ChevronRight,
  Package,
  ChefHat,
  CheckCircle2,
  Truck,
  Ban,
  CalendarDays,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Order, OrderStatus, OrderItem, Table } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  tables: Table[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
  }
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
    label: 'Iptal Edildi',
    icon: Ban,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
};

const STATUS_FLOW: OrderStatus[] = ['new', 'preparing', 'ready', 'delivered'];

const PRINT_STYLES = `
@media print {
  body * { visibility: hidden; }
  [role="dialog"], [role="dialog"] * { visibility: visible; }
  [role="dialog"] {
    position: fixed; left: 0; top: 0;
    width: 100%; height: auto;
    background: white; color: black;
    padding: 20px; border: none; box-shadow: none;
  }
  [role="dialog"] button { display: none !important; }
  [role="dialog"] [data-radix-scroll-area-viewport] {
    max-height: none !important; overflow: visible !important;
  }
}
`;

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

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function getElapsedText(createdAt: string): string {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const diffMs = now - created;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const remainingMin = diffMin % 60;

  if (diffHours > 0) {
    return `${diffHours}s ${remainingMin}dk`;
  }
  return `${diffMin}dk`;
}

function getTableNumber(order: Order, tables: Table[]): string {
  if (!order.table_id) return '-';
  const table = tables.find((t) => t.id === order.table_id);
  return table ? table.table_number : '-';
}

function getTableCapacity(order: Order, tables: Table[]): number | null {
  if (!order.table_id) return null;
  const table = tables.find((t) => t.id === order.table_id);
  return table ? table.capacity : null;
}

// ---------------------------------------------------------------------------
// OrderItemRow
// ---------------------------------------------------------------------------

function OrderItemRow({ item, index }: { item: OrderItem; index: number }) {
  const hasModifiers = item.modifiers && item.modifiers.length > 0;
  const lineTotal = item.price * item.quantity;

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Index */}
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/5 text-[10px] font-bold text-text-muted">
        {index + 1}
      </span>

      {/* Item details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-main">
              {item.name}
              <span className="ml-1.5 text-text-muted">x{item.quantity}</span>
            </p>
            {hasModifiers && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.modifiers.map((mod, idx) => (
                  <span
                    key={idx}
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-text-muted"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <span className="text-sm font-semibold text-text-main">
              {formatPrice(lineTotal)}
            </span>
            {item.quantity > 1 && (
              <p className="text-[10px] text-text-muted">
                {formatPrice(item.price)} / adet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusProgressBar
// ---------------------------------------------------------------------------

function StatusProgressBar({ currentStatus }: { currentStatus: OrderStatus }) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {STATUS_FLOW.map((status, idx) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const isActive = idx <= currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={status} className="flex items-center gap-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border transition-all',
                isCurrent
                  ? cn(config.bg, config.border)
                  : isActive
                    ? 'border-white/20 bg-white/10'
                    : 'border-white/5 bg-white/[0.02]'
              )}
              title={config.label}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isCurrent
                    ? config.color
                    : isActive
                      ? 'text-text-main'
                      : 'text-text-muted/40'
                )}
              />
            </div>
            {idx < STATUS_FLOW.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-4',
                  idx < currentIndex ? 'bg-white/20' : 'bg-white/5'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OrderDetailModal (Main Component)
// ---------------------------------------------------------------------------

export default function OrderDetailModal({
  open,
  onOpenChange,
  order,
  tables,
  onStatusChange,
}: OrderDetailModalProps) {
  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const tableNumber = getTableNumber(order, tables);
  const tableCapacity = getTableCapacity(order, tables);
  const items = order.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus =
    currentStatusIndex >= 0 && currentStatusIndex < STATUS_FLOW.length - 1
      ? STATUS_FLOW[currentStatusIndex + 1]
      : null;
  const prevStatus =
    currentStatusIndex > 0 ? STATUS_FLOW[currentStatusIndex - 1] : null;

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleStatusAdvance = useCallback(() => {
    if (nextStatus) {
      onStatusChange(order.id, nextStatus);
    }
  }, [nextStatus, onStatusChange, order.id]);

  const handleStatusRevert = useCallback(() => {
    if (prevStatus) {
      onStatusChange(order.id, prevStatus);
    }
  }, [prevStatus, onStatusChange, order.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <Receipt className="h-5 w-5 text-accent-orange" />
            Siparis Detayi
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            Siparis #{order.id.slice(0, 8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-5 pb-2">
            {/* ---- Status Progress ---- */}
            <div className="flex flex-col items-center gap-2">
              <StatusProgressBar currentStatus={order.status} />
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
                  statusConfig.bg,
                  statusConfig.border
                )}
              >
                <StatusIcon className={cn('h-3.5 w-3.5', statusConfig.color)} />
                <span className={cn('text-xs font-semibold', statusConfig.color)}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* ---- Table & Time Info ---- */}
            <div className="grid grid-cols-2 gap-3">
              {/* Table Info */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10">
                    <Hash className="h-4 w-4 text-accent-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Masa</p>
                    <p className="text-sm font-bold text-text-main">
                      {tableNumber}
                      {tableCapacity && (
                        <span className="ml-1 text-xs font-normal text-text-muted">
                          ({tableCapacity} kisilik)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Info */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10">
                    <Clock className="h-4 w-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Gecen Sure</p>
                    <p className="text-sm font-bold text-text-main">
                      {getElapsedText(order.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ---- Timestamps ---- */}
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Olusturulma: {formatDateTime(order.created_at)}</span>
              </div>
              {order.updated_at && order.updated_at !== order.created_at && (
                <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Son Guncelleme: {formatDateTime(order.updated_at)}</span>
                </div>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* ---- Items List ---- */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-accent-orange" />
                <h3 className="text-sm font-semibold text-text-main">
                  Siparis Kalemleri ({totalItems} urun)
                </h3>
              </div>

              <div className="divide-y divide-white/5">
                {items.map((item, idx) => (
                  <OrderItemRow key={idx} item={item} index={idx} />
                ))}
              </div>

              {/* Total */}
              <div className="mt-3 flex items-center justify-between rounded-lg border border-accent-orange/20 bg-accent-orange/5 px-4 py-3">
                <span className="text-sm font-semibold text-text-main">
                  Toplam
                </span>
                <span className="text-lg font-bold text-accent-orange">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>

            {/* ---- Notes ---- */}
            {order.notes && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-text-main">
                      Notlar
                    </h3>
                  </div>
                  <div className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-3">
                    <p className="whitespace-pre-wrap text-sm text-amber-200/80">
                      {order.notes}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ---- Waiter Call ---- */}
            {order.waiter_called && (
              <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Package className="h-4 w-4 text-red-400" />
                </motion.div>
                <span className="text-xs font-medium text-red-300">
                  Garson cagrisi aktif
                </span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* ---- Action Buttons ---- */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
          {/* Left: Print */}
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrint}
            className="text-text-muted hover:text-text-main"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Yazdir
          </Button>

          {/* Right: Status actions */}
          <div className="flex items-center gap-2">
            {prevStatus && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleStatusRevert}
                className="text-text-muted hover:text-text-main"
              >
                {STATUS_CONFIG[prevStatus].label}
              </Button>
            )}
            {nextStatus && (
              <Button
                type="button"
                onClick={handleStatusAdvance}
                className="bg-accent-orange text-white hover:bg-accent-orange/90"
              >
                {STATUS_CONFIG[nextStatus].label}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* ---- Print Styles (CSS-only print format) ---- */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
    </Dialog>
  );
}
