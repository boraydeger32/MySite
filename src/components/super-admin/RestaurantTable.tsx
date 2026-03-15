'use client';

import { useState, useCallback, useMemo, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  MoreHorizontal,
  Building2,
  ShoppingCart,
  Calendar,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RestaurantPlan, RestaurantStatus } from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

export interface RestaurantRow {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  plan: RestaurantPlan;
  status: RestaurantStatus;
  created_at: string;
  last_active: string;
  order_count: number;
  logo_url: string | null;
}

export type SortField =
  | 'name'
  | 'owner_name'
  | 'plan'
  | 'status'
  | 'created_at'
  | 'last_active'
  | 'order_count';

export type SortDirection = 'asc' | 'desc';

export type RestaurantAction = 'view' | 'edit' | 'suspend' | 'activate' | 'delete' | 'impersonate';

interface RestaurantTableProps {
  restaurants: RestaurantRow[];
  onAction: (action: RestaurantAction, restaurant: RestaurantRow) => void;
  className?: string;
}

// =============================================================================
// Plan & Status Display Config
// =============================================================================

const PLAN_CONFIG: Record<RestaurantPlan, { label: string; classes: string }> = {
  free: {
    label: 'Ucretsiz',
    classes: 'border-white/20 bg-white/5 text-text-muted',
  },
  starter: {
    label: 'Starter',
    classes: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
  },
  pro: {
    label: 'Pro',
    classes: 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange',
  },
  enterprise: {
    label: 'Enterprise',
    classes: 'border-accent-purple/30 bg-accent-purple/10 text-accent-purple',
  },
};

const STATUS_CONFIG: Record<
  RestaurantStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  active: {
    label: 'Aktif',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-400',
  },
  suspended: {
    label: 'Askiya Alinmis',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-400',
  },
  deleted: {
    label: 'Silinmis',
    dotColor: 'bg-red-400',
    textColor: 'text-red-400',
  },
};

// =============================================================================
// Column Definitions
// =============================================================================

interface ColumnDef {
  key: SortField;
  label: string;
  icon: ElementType;
  sortable: boolean;
  hideOnMobile?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Restoran', icon: Building2, sortable: true },
  { key: 'owner_name', label: 'Sahip', icon: Building2, sortable: true, hideOnMobile: true },
  { key: 'plan', label: 'Plan', icon: Building2, sortable: true },
  { key: 'status', label: 'Durum', icon: Building2, sortable: true },
  { key: 'created_at', label: 'Kayit Tarihi', icon: Calendar, sortable: true, hideOnMobile: true },
  { key: 'last_active', label: 'Son Aktif', icon: Clock, sortable: true, hideOnMobile: true },
  { key: 'order_count', label: 'Siparis', icon: ShoppingCart, sortable: true, hideOnMobile: true },
];

// =============================================================================
// Helpers
// =============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az once';
  if (diffMins < 60) return `${diffMins} dk once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  if (diffDays < 7) return `${diffDays} gun once`;
  return formatDate(dateString);
}

function sortRestaurants(
  restaurants: RestaurantRow[],
  field: SortField,
  direction: SortDirection
): RestaurantRow[] {
  return [...restaurants].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'tr');
        break;
      case 'owner_name':
        comparison = a.owner_name.localeCompare(b.owner_name, 'tr');
        break;
      case 'plan': {
        const planOrder: Record<RestaurantPlan, number> = {
          free: 0,
          starter: 1,
          pro: 2,
          enterprise: 3,
        };
        comparison = planOrder[a.plan] - planOrder[b.plan];
        break;
      }
      case 'status': {
        const statusOrder: Record<RestaurantStatus, number> = {
          active: 0,
          suspended: 1,
          deleted: 2,
        };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'last_active':
        comparison = new Date(a.last_active).getTime() - new Date(b.last_active).getTime();
        break;
      case 'order_count':
        comparison = a.order_count - b.order_count;
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

// =============================================================================
// Sub-Components
// =============================================================================

function SortButton({
  field,
  currentField,
  currentDirection,
  label,
  onSort,
}: {
  field: SortField;
  currentField: SortField;
  currentDirection: SortDirection;
  label: string;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <button
      className={cn(
        'flex items-center gap-1 text-xs font-medium transition-colors',
        isActive ? 'text-accent-blue' : 'text-text-muted hover:text-text-main'
      )}
      onClick={() => onSort(field)}
      aria-label={`${label} siralamasi`}
    >
      {label}
      {isActive ? (
        currentDirection === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

function RestaurantRowActions({
  restaurant,
  onAction,
}: {
  restaurant: RestaurantRow;
  onAction: (action: RestaurantAction, restaurant: RestaurantRow) => void;
}) {
  const isSuspended = restaurant.status === 'suspended';
  const isDeleted = restaurant.status === 'deleted';

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Quick action buttons - visible on desktop */}
      <div className="hidden items-center gap-1 md:flex">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-blue/30 hover:text-accent-blue"
          onClick={() => onAction('view', restaurant)}
          aria-label={`${restaurant.name} detaylarini goruntule`}
          title="Goruntule"
        >
          <Eye className="h-3.5 w-3.5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-orange/30 hover:text-accent-orange"
          onClick={() => onAction('edit', restaurant)}
          aria-label={`${restaurant.name} duzenle`}
          title="Duzenle"
        >
          <Pencil className="h-3.5 w-3.5" />
        </motion.button>

        {!isDeleted && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors',
              isSuspended
                ? 'text-text-muted hover:border-emerald-500/30 hover:text-emerald-400'
                : 'text-text-muted hover:border-amber-500/30 hover:text-amber-400'
            )}
            onClick={() =>
              onAction(isSuspended ? 'activate' : 'suspend', restaurant)
            }
            aria-label={
              isSuspended
                ? `${restaurant.name} aktif et`
                : `${restaurant.name} askiya al`
            }
            title={isSuspended ? 'Aktif Et' : 'Askiya Al'}
          >
            {isSuspended ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Ban className="h-3.5 w-3.5" />
            )}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-red-500/30 hover:text-red-400"
          onClick={() => onAction('delete', restaurant)}
          aria-label={`${restaurant.name} sil`}
          title="Sil"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Dropdown for mobile + additional actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-white/20 hover:text-text-main md:ml-1"
            aria-label="Diger islemler"
          >
            <MoreHorizontal className="h-4 w-4" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 border-white/10 bg-bg-dark/95 backdrop-blur-xl"
        >
          {/* Show on mobile only */}
          <div className="md:hidden">
            <DropdownMenuItem
              className="cursor-pointer text-text-muted focus:bg-white/5 focus:text-text-main"
              onClick={() => onAction('view', restaurant)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Goruntule
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-text-muted focus:bg-white/5 focus:text-text-main"
              onClick={() => onAction('edit', restaurant)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Duzenle
            </DropdownMenuItem>
            {!isDeleted && (
              <DropdownMenuItem
                className={cn(
                  'cursor-pointer focus:bg-white/5',
                  isSuspended
                    ? 'text-emerald-400 focus:text-emerald-400'
                    : 'text-amber-400 focus:text-amber-400'
                )}
                onClick={() =>
                  onAction(isSuspended ? 'activate' : 'suspend', restaurant)
                }
              >
                {isSuspended ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                {isSuspended ? 'Aktif Et' : 'Askiya Al'}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/10" />
          </div>

          {/* Impersonate - always visible */}
          <DropdownMenuItem
            className="cursor-pointer text-accent-blue focus:bg-accent-blue/10 focus:text-accent-blue"
            onClick={() => onAction('impersonate', restaurant)}
            disabled={restaurant.status !== 'active'}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Restoran Adina Giris
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Delete - always in dropdown */}
          <DropdownMenuItem
            className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400 md:hidden"
            onClick={() => onAction('delete', restaurant)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function RestaurantTable({
  restaurants,
  onAction,
  className,
}: RestaurantTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  const sortedRestaurants = useMemo(
    () => sortRestaurants(restaurants, sortField, sortDirection),
    [restaurants, sortField, sortDirection]
  );

  if (restaurants.length === 0) {
    return (
      <div className={cn('rounded-xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl text-center', className)}>
        <Building2 className="mx-auto h-12 w-12 text-text-muted/50" />
        <h3 className="mt-4 font-display text-lg font-semibold text-text-main">
          Restoran bulunamadi
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Arama kriterlerinize uygun restoran bulunamadi.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden',
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'border-white/10 bg-white/[0.02] text-text-muted',
                  col.hideOnMobile && 'hidden lg:table-cell'
                )}
              >
                {col.sortable ? (
                  <SortButton
                    field={col.key}
                    currentField={sortField}
                    currentDirection={sortDirection}
                    label={col.label}
                    onSort={handleSort}
                  />
                ) : (
                  <span className="text-xs font-medium">{col.label}</span>
                )}
              </TableHead>
            ))}
            <TableHead className="border-white/10 bg-white/[0.02] text-right text-xs font-medium text-text-muted">
              Islemler
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence mode="popLayout">
            {sortedRestaurants.map((restaurant, index) => {
              const planInfo = PLAN_CONFIG[restaurant.plan];
              const statusInfo = STATUS_CONFIG[restaurant.status];

              return (
                <motion.tr
                  key={restaurant.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03] data-[state=selected]:bg-white/5"
                >
                  {/* Name */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-text-muted">
                        {restaurant.logo_url ? (
                          <img
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {restaurant.name}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          /{restaurant.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="hidden py-3 lg:table-cell">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-main">
                        {restaurant.owner_name}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {restaurant.owner_email}
                      </p>
                    </div>
                  </TableCell>

                  {/* Plan */}
                  <TableCell className="py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                        planInfo.classes
                      )}
                    >
                      {planInfo.label}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          statusInfo.dotColor
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs font-medium',
                          statusInfo.textColor
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </span>
                  </TableCell>

                  {/* Registration Date */}
                  <TableCell className="hidden py-3 lg:table-cell">
                    <span className="text-xs text-text-muted">
                      {formatDate(restaurant.created_at)}
                    </span>
                  </TableCell>

                  {/* Last Active */}
                  <TableCell className="hidden py-3 lg:table-cell">
                    <span className="text-xs text-text-muted">
                      {formatRelativeTime(restaurant.last_active)}
                    </span>
                  </TableCell>

                  {/* Order Count */}
                  <TableCell className="hidden py-3 lg:table-cell">
                    <span className="text-sm font-medium text-text-main">
                      {restaurant.order_count.toLocaleString('tr-TR')}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3">
                    <RestaurantRowActions
                      restaurant={restaurant}
                      onAction={onAction}
                    />
                  </TableCell>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* Results count footer */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <p className="text-xs text-text-muted">
          Toplam{' '}
          <span className="font-semibold text-text-main">
            {restaurants.length}
          </span>{' '}
          restoran
        </p>
        <p className="text-xs text-text-muted">
          Siralama:{' '}
          <span className="font-medium text-text-main">
            {COLUMNS.find((c) => c.key === sortField)?.label}
          </span>{' '}
          ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
        </p>
      </div>
    </div>
  );
}
