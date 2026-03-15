'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Users,
  QrCode,
  GripVertical,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TableStatus = 'empty' | 'occupied' | 'reserved' | 'cleaning';

interface TableData {
  id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  position: { x: number; y: number };
}

interface TableMapProps {
  /** Array of table data to render */
  tables: TableData[];
  /** Grid columns count */
  columns?: number;
  /** Grid rows count */
  rows?: number;
  /** Called when a table is placed or moved */
  onTableMove?: (tableId: string, position: { x: number; y: number }) => void;
  /** Called when a table is removed */
  onTableRemove?: (tableId: string) => void;
  /** Called when a new table is added at a position */
  onTableAdd?: (position: { x: number; y: number }) => void;
  /** Called when a table is clicked for QR code generation */
  onTableSelect?: (table: TableData) => void;
  /** Called when table status is changed */
  onStatusChange?: (tableId: string, status: TableStatus) => void;
  /** Whether the map is in edit mode */
  editMode?: boolean;
  /** Additional className */
  className?: string;
}

// ---------------------------------------------------------------------------
// Status Configuration
// ---------------------------------------------------------------------------

const statusConfig: Record<
  TableStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  empty: {
    label: 'Bos',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  occupied: {
    label: 'Dolu',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  reserved: {
    label: 'Rezerve',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  cleaning: {
    label: 'Temizlik',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
};

const statusOrder: TableStatus[] = ['empty', 'occupied', 'reserved', 'cleaning'];

const cellVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

interface TableCellProps {
  table: TableData;
  editMode: boolean;
  onRemove?: (tableId: string) => void;
  onSelect?: (table: TableData) => void;
  onStatusChange?: (tableId: string, status: TableStatus) => void;
}

function TableCell({
  table,
  editMode,
  onRemove,
  onSelect,
  onStatusChange,
}: TableCellProps) {
  const status = statusConfig[table.status];

  const handleCycleStatus = useCallback(() => {
    if (!onStatusChange) return;
    const currentIndex = statusOrder.indexOf(table.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onStatusChange(table.id, statusOrder[nextIndex]);
  }, [table.id, table.status, onStatusChange]);

  return (
    <motion.div
      variants={cellVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={cn(
        'group relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all duration-200',
        status.bg,
        status.border,
        'hover:shadow-lg hover:shadow-black/20',
        !editMode && 'cursor-pointer hover:-translate-y-0.5'
      )}
      onClick={() => {
        if (!editMode && onSelect) {
          onSelect(table);
        }
      }}
    >
      {/* Edit mode controls */}
      {editMode && (
        <div className="absolute -right-1 -top-1 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(table.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/30"
            aria-label={`Masa ${table.tableNumber} sil`}
            title="Masayi sil"
          >
            <Trash2 className="h-3 w-3" />
          </motion.button>
        </div>
      )}

      {/* Drag handle (edit mode) */}
      {editMode && (
        <div className="absolute left-1 top-1 text-text-muted/30 transition-colors group-hover:text-text-muted/60">
          <GripVertical className="h-3 w-3" />
        </div>
      )}

      {/* Table number */}
      <span className={cn('font-display text-base font-bold', status.color)}>
        {table.tableNumber}
      </span>

      {/* Capacity */}
      <div className="flex items-center gap-1">
        <Users className={cn('h-3 w-3', status.color)} />
        <span className={cn('text-xs font-medium', status.color)}>
          {table.capacity}
        </span>
      </div>

      {/* Status badge */}
      <div
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5',
          status.bg,
          editMode && 'cursor-pointer'
        )}
        onClick={(e) => {
          if (editMode) {
            e.stopPropagation();
            handleCycleStatus();
          }
        }}
        title={editMode ? 'Durumu degistirmek icin tiklayin' : undefined}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
        <span className={cn('text-[10px] font-medium', status.color)}>
          {status.label}
        </span>
        {editMode && (
          <ArrowUpDown className={cn('h-2.5 w-2.5', status.color)} />
        )}
      </div>

      {/* QR code indicator (non-edit mode) */}
      {!editMode && (
        <div className="absolute bottom-1 right-1 text-text-muted/30 transition-colors group-hover:text-accent-orange">
          <QrCode className="h-3.5 w-3.5" />
        </div>
      )}
    </motion.div>
  );
}

interface EmptyCellProps {
  position: { x: number; y: number };
  editMode: boolean;
  onAdd?: (position: { x: number; y: number }) => void;
}

function EmptyCell({ position, editMode, onAdd }: EmptyCellProps) {
  if (!editMode) return <div className="h-full w-full" />;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAdd?.(position)}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-lg border border-dashed border-white/10 transition-all duration-200',
        'hover:border-accent-orange/30 hover:bg-accent-orange/5'
      )}
      aria-label={`Konum ${position.x + 1},${position.y + 1} ye masa ekle`}
      title="Masa ekle"
    >
      <Plus className="h-5 w-5 text-text-muted/30 transition-colors group-hover:text-accent-orange" />
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TableMap({
  tables,
  columns = 6,
  rows = 4,
  onTableMove,
  onTableRemove,
  onTableAdd,
  onTableSelect,
  onStatusChange,
  editMode = false,
  className,
}: TableMapProps) {
  const [draggedTable, setDraggedTable] = useState<string | null>(null);

  // Build a lookup map: "x,y" -> TableData
  const tablePositionMap = useMemo(() => {
    const map = new Map<string, TableData>();
    tables.forEach((table) => {
      const key = `${table.position.x},${table.position.y}`;
      map.set(key, table);
    });
    return map;
  }, [tables]);

  // Handle drag start
  const handleDragStart = useCallback(
    (tableId: string) => {
      if (!editMode) return;
      setDraggedTable(tableId);
    },
    [editMode]
  );

  // Handle drop on empty cell
  const handleDrop = useCallback(
    (position: { x: number; y: number }) => {
      if (!draggedTable || !onTableMove) return;
      onTableMove(draggedTable, position);
      setDraggedTable(null);
    },
    [draggedTable, onTableMove]
  );

  // Count stats
  const stats = useMemo(() => {
    const counts: Record<TableStatus, number> = {
      empty: 0,
      occupied: 0,
      reserved: 0,
      cleaning: 0,
    };
    tables.forEach((t) => {
      counts[t.status]++;
    });
    return counts;
  }, [tables]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Status legend and stats */}
      <div className="flex flex-wrap items-center gap-3">
        {statusOrder.map((status) => {
          const config = statusConfig[status];
          return (
            <div
              key={status}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <span className={cn('h-2.5 w-2.5 rounded-full', config.dot)} />
              <span className="text-xs font-medium text-text-muted">
                {config.label}
              </span>
              <span className={cn('text-xs font-bold', config.color)}>
                {stats[status]}
              </span>
            </div>
          );
        })}

        <div className="ml-auto flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
          <span className="text-xs font-medium text-text-muted">Toplam</span>
          <span className="text-xs font-bold text-text-main">
            {tables.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(80px, 1fr))`,
        }}
        role="grid"
        aria-label="Masa haritasi"
      >
        <AnimatePresence mode="popLayout">
          {Array.from({ length: rows }, (_, rowIdx) =>
            Array.from({ length: columns }, (_, colIdx) => {
              const key = `${colIdx},${rowIdx}`;
              const table = tablePositionMap.get(key);

              if (table) {
                return (
                  <div
                    key={key}
                    role="gridcell"
                    draggable={editMode}
                    onDragStart={() => handleDragStart(table.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop({ x: colIdx, y: rowIdx })}
                    className={cn(
                      editMode && 'cursor-grab active:cursor-grabbing'
                    )}
                  >
                    <TableCell
                      table={table}
                      editMode={editMode}
                      onRemove={onTableRemove}
                      onSelect={onTableSelect}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={key}
                  role="gridcell"
                  onDragOver={(e) => {
                    if (editMode) e.preventDefault();
                  }}
                  onDrop={() => handleDrop({ x: colIdx, y: rowIdx })}
                >
                  <EmptyCell
                    position={{ x: colIdx, y: rowIdx }}
                    editMode={editMode}
                    onAdd={onTableAdd}
                  />
                </div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Edit mode hint */}
      {editMode && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-text-muted"
        >
          Bos hucrelerine tiklayarak masa ekleyin. Masalari surukleyerek
          tasiyabilirsiniz.
        </motion.p>
      )}
    </div>
  );
}
