'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Download,
  Edit3,
  Eye,
  QrCode,
  Trash2,
  X,
  PackageOpen,
  Grid3X3,
  Merge,
  Split,
  Archive,
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';
import TableMap from '@/components/qr-menu/TableMap';
import QRCodeGenerator from '@/components/qr-menu/QRCodeGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_PATH = '/MySite';
const RESTAURANT_SLUG = 'demo-restoran';

const STATUS_CONFIG: Record<
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
    label: 'Temizleniyor',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
};

const STATUS_ORDER: TableStatus[] = ['empty', 'occupied', 'reserved', 'cleaning'];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const INITIAL_TABLES: TableData[] = [
  { id: 't1', tableNumber: '1', capacity: 4, status: 'occupied', position: { x: 0, y: 0 } },
  { id: 't2', tableNumber: '2', capacity: 2, status: 'empty', position: { x: 1, y: 0 } },
  { id: 't3', tableNumber: '3', capacity: 6, status: 'reserved', position: { x: 2, y: 0 } },
  { id: 't4', tableNumber: '4', capacity: 4, status: 'empty', position: { x: 4, y: 0 } },
  { id: 't5', tableNumber: '5', capacity: 8, status: 'occupied', position: { x: 0, y: 1 } },
  { id: 't6', tableNumber: '6', capacity: 2, status: 'cleaning', position: { x: 2, y: 1 } },
  { id: 't7', tableNumber: '7', capacity: 4, status: 'empty', position: { x: 3, y: 1 } },
  { id: 't8', tableNumber: '8', capacity: 4, status: 'occupied', position: { x: 5, y: 1 } },
  { id: 't9', tableNumber: '9', capacity: 6, status: 'empty', position: { x: 1, y: 2 } },
  { id: 't10', tableNumber: '10', capacity: 2, status: 'reserved', position: { x: 3, y: 2 } },
  { id: 't11', tableNumber: '11', capacity: 4, status: 'empty', position: { x: 5, y: 2 } },
  { id: 't12', tableNumber: '12', capacity: 8, status: 'occupied', position: { x: 0, y: 3 } },
];

// ---------------------------------------------------------------------------
// Helper: Build menu URL
// ---------------------------------------------------------------------------

function buildMenuUrl(tableNumber: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${BASE_PATH}/${RESTAURANT_SLUG}/masa/${tableNumber}`;
  }
  return `${BASE_PATH}/${RESTAURANT_SLUG}/masa/${tableNumber}`;
}

// ---------------------------------------------------------------------------
// Sub-Component: Add/Edit Table Dialog
// ---------------------------------------------------------------------------

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tableNumber: string, capacity: number) => void;
  editingTable?: TableData | null;
}

function TableFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingTable,
}: TableFormDialogProps) {
  const [tableNumber, setTableNumber] = useState(editingTable?.tableNumber ?? '');
  const [capacity, setCapacity] = useState(editingTable?.capacity?.toString() ?? '4');
  const [error, setError] = useState('');

  // Reset form when dialog opens with new data
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && editingTable) {
        setTableNumber(editingTable.tableNumber);
        setCapacity(editingTable.capacity.toString());
      } else if (isOpen) {
        setTableNumber('');
        setCapacity('4');
      }
      setError('');
      onOpenChange(isOpen);
    },
    [editingTable, onOpenChange]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedNumber = tableNumber.trim();
      if (!trimmedNumber) {
        setError('Masa numarasi gereklidir.');
        return;
      }
      const cap = parseInt(capacity, 10);
      if (isNaN(cap) || cap < 1 || cap > 50) {
        setError('Kapasite 1-50 arasinda olmalidir.');
        return;
      }
      onSubmit(trimmedNumber, cap);
      onOpenChange(false);
    },
    [tableNumber, capacity, onSubmit, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-text-main">
            {editingTable ? 'Masa Duzenle' : 'Yeni Masa Ekle'}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            {editingTable
              ? 'Masa bilgilerini guncelleyin.'
              : 'Masa numarasi ve kapasitesini girin.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="table-number"
              className="text-sm font-medium text-text-muted"
            >
              Masa Numarasi
            </label>
            <Input
              id="table-number"
              placeholder="orn. 1, A1, VIP-1"
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                setError('');
              }}
              className="border-white/10 bg-white/5 text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="table-capacity"
              className="text-sm font-medium text-text-muted"
            >
              Kapasite (kisi)
            </label>
            <Input
              id="table-capacity"
              type="number"
              min={1}
              max={50}
              placeholder="4"
              value={capacity}
              onChange={(e) => {
                setCapacity(e.target.value);
                setError('');
              }}
              className="border-white/10 bg-white/5 text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            >
              Iptal
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange transition-colors hover:bg-accent-orange/20"
            >
              {editingTable ? 'Guncelle' : 'Ekle'}
            </motion.button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sub-Component: QR Code Detail Modal
// ---------------------------------------------------------------------------

interface QRDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: TableData | null;
}

function QRDetailModal({ open, onOpenChange, table }: QRDetailModalProps) {
  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-text-main">
            Masa {table.tableNumber} - QR Kod
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            QR kodu indirin veya URL&apos;yi kopyalayin.
          </DialogDescription>
        </DialogHeader>

        <QRCodeGenerator
          restaurantSlug={RESTAURANT_SLUG}
          tableNumber={table.tableNumber}
          size={200}
          className="border-0 bg-transparent p-0"
        />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sub-Component: Delete Confirmation Dialog
// ---------------------------------------------------------------------------

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tableNumber: string;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tableNumber,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-text-main">
            Masa {tableNumber} Sil
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            Bu masayi silmek istediginize emin misiniz? Bu islem geri alinamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
          >
            Iptal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Sil
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sub-Component: Merge Tables Dialog
// ---------------------------------------------------------------------------

interface MergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: TableData[];
  onMerge: (tableIds: string[], newNumber: string, newCapacity: number) => void;
}

function MergeDialog({ open, onOpenChange, tables, onMerge }: MergeDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mergedNumber, setMergedNumber] = useState('');

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectedCapacity = useMemo(
    () =>
      tables
        .filter((t) => selectedIds.includes(t.id))
        .reduce((sum, t) => sum + t.capacity, 0),
    [tables, selectedIds]
  );

  const handleSubmit = useCallback(() => {
    if (selectedIds.length < 2) return;
    const number = mergedNumber.trim() || selectedIds.map((id) => {
      const t = tables.find((tb) => tb.id === id);
      return t?.tableNumber ?? '';
    }).join('+');
    onMerge(selectedIds, number, selectedCapacity);
    setSelectedIds([]);
    setMergedNumber('');
    onOpenChange(false);
  }, [selectedIds, mergedNumber, selectedCapacity, tables, onMerge, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedIds([]);
        setMergedNumber('');
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-text-main">
            Masalari Birlestir
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            Birlestirmek istediginiz masalari secin (en az 2 masa).
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-48 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {tables.map((table) => {
              const selected = selectedIds.includes(table.id);
              return (
                <motion.button
                  key={table.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleToggle(table.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
                    selected
                      ? 'border-accent-orange/50 bg-accent-orange/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className={cn(
                    'text-sm font-bold',
                    selected ? 'text-accent-orange' : 'text-text-main'
                  )}>
                    Masa {table.tableNumber}
                  </span>
                  <span className="text-xs text-text-muted">
                    {table.capacity} kisi
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {selectedIds.length >= 2 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-text-muted">Toplam Kapasite</span>
              <span className="text-sm font-bold text-accent-orange">{selectedCapacity} kisi</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted" htmlFor="merged-number">
                Birlesik Masa Numarasi (opsiyonel)
              </label>
              <Input
                id="merged-number"
                placeholder={selectedIds.map((id) => tables.find((t) => t.id === id)?.tableNumber).join('+')}
                value={mergedNumber}
                onChange={(e) => setMergedNumber(e.target.value)}
                className="border-white/10 bg-white/5 text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
          >
            Iptal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={selectedIds.length < 2}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              selectedIds.length >= 2
                ? 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20'
                : 'border-white/10 bg-white/5 text-text-muted/50 cursor-not-allowed'
            )}
          >
            Birlestir
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sub-Component: Split Table Dialog
// ---------------------------------------------------------------------------

interface SplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: TableData[];
  onSplit: (tableId: string, splitCount: number) => void;
}

function SplitDialog({ open, onOpenChange, tables, onSplit }: SplitDialogProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [splitCount, setSplitCount] = useState('2');

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId]
  );

  const handleSubmit = useCallback(() => {
    if (!selectedTableId) return;
    const count = parseInt(splitCount, 10);
    if (isNaN(count) || count < 2 || count > 10) return;
    onSplit(selectedTableId, count);
    setSelectedTableId(null);
    setSplitCount('2');
    onOpenChange(false);
  }, [selectedTableId, splitCount, onSplit, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedTableId(null);
        setSplitCount('2');
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-text-main">
            Masayi Bol
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            Bolmek istediginiz masayi secin ve kac parcaya bolunecegini belirleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-48 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {tables.filter((t) => t.capacity >= 4).map((table) => (
              <motion.button
                key={table.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTableId(table.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
                  selectedTableId === table.id
                    ? 'border-accent-blue/50 bg-accent-blue/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                <span className={cn(
                  'text-sm font-bold',
                  selectedTableId === table.id ? 'text-accent-blue' : 'text-text-main'
                )}>
                  Masa {table.tableNumber}
                </span>
                <span className="text-xs text-text-muted">
                  {table.capacity} kisi
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {selectedTable && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-text-muted">Mevcut Kapasite</span>
              <span className="text-sm font-bold text-accent-blue">{selectedTable.capacity} kisi</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted" htmlFor="split-count">
                Kac Parcaya Bolunecek
              </label>
              <Input
                id="split-count"
                type="number"
                min={2}
                max={Math.min(10, selectedTable.capacity)}
                value={splitCount}
                onChange={(e) => setSplitCount(e.target.value)}
                className="border-white/10 bg-white/5 text-text-main placeholder:text-text-muted/50 focus:border-accent-blue/50"
              />
              <p className="text-xs text-text-muted">
                Her parcanin kapasitesi: ~{Math.floor(selectedTable.capacity / parseInt(splitCount, 10) || 2)} kisi
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
          >
            Iptal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!selectedTableId}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              selectedTableId
                ? 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20'
                : 'border-white/10 bg-white/5 text-text-muted/50 cursor-not-allowed'
            )}
          >
            Bol
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sub-Component: Table List Row (for list view)
// ---------------------------------------------------------------------------

interface TableListRowProps {
  table: TableData;
  onEdit: (table: TableData) => void;
  onDelete: (table: TableData) => void;
  onQR: (table: TableData) => void;
  onStatusChange: (tableId: string, status: TableStatus) => void;
}

function TableListRow({ table, onEdit, onDelete, onQR, onStatusChange }: TableListRowProps) {
  const status = STATUS_CONFIG[table.status];

  const handleCycleStatus = useCallback(() => {
    const currentIndex = STATUS_ORDER.indexOf(table.status);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    onStatusChange(table.id, STATUS_ORDER[nextIndex]);
  }, [table.id, table.status, onStatusChange]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/[0.07]"
    >
      {/* Table number */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        <span className="font-display text-sm font-bold text-text-main">
          {table.tableNumber}
        </span>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm font-medium text-text-main">
          Masa {table.tableNumber}
        </span>
        <span className="text-xs text-text-muted">
          {table.capacity} kisilik
        </span>
      </div>

      {/* Status badge */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCycleStatus}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors',
          status.bg,
          status.border,
          'border'
        )}
        title="Durumu degistirmek icin tiklayin"
      >
        <span className={cn('h-2 w-2 rounded-full', status.dot)} />
        <span className={cn('text-xs font-medium', status.color)}>{status.label}</span>
      </motion.button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onQR(table)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-orange/30 hover:text-accent-orange"
          aria-label={`Masa ${table.tableNumber} QR kodu`}
          title="QR Kodu"
        >
          <QrCode className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEdit(table)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-blue/30 hover:text-accent-blue"
          aria-label={`Masa ${table.tableNumber} duzenle`}
          title="Duzenle"
        >
          <Edit3 className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(table)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-red-500/30 hover:text-red-400"
          aria-label={`Masa ${table.tableNumber} sil`}
          title="Sil"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Hidden QR Canvas for Bulk Download
// ---------------------------------------------------------------------------

interface HiddenQRCanvasProps {
  tables: TableData[];
  canvasRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

function HiddenQRCanvases({ tables, canvasRefs }: HiddenQRCanvasProps) {
  return (
    <div className="hidden" aria-hidden="true">
      {tables.map((table) => (
        <div
          key={table.id}
          ref={(el) => {
            if (el) {
              canvasRefs.current.set(table.id, el);
            } else {
              canvasRefs.current.delete(table.id);
            }
          }}
        >
          <QRCodeCanvas
            value={buildMenuUrl(table.tableNumber)}
            size={512}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="H"
            marginSize={2}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function MasalarPage() {
  // State
  const [tables, setTables] = useState<TableData[]>(INITIAL_TABLES);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState(6);
  const [gridRows, setGridRows] = useState(4);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [qrDetailTable, setQrDetailTable] = useState<TableData | null>(null);
  const [qrDetailOpen, setQrDetailOpen] = useState(false);
  const [deleteTable, setDeleteTable] = useState<TableData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  // For adding table at specific grid position
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);

  // Refs for bulk QR download
  const qrCanvasRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const counts: Record<TableStatus, number> = {
      empty: 0,
      occupied: 0,
      reserved: 0,
      cleaning: 0,
    };
    tables.forEach((t) => counts[t.status]++);
    return {
      ...counts,
      total: tables.length,
      totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
    };
  }, [tables]);

  // ---------------------------------------------------------------------------
  // CRUD Handlers
  // ---------------------------------------------------------------------------

  const handleAddTable = useCallback(
    (tableNumber: string, capacity: number) => {
      const position = pendingPosition ?? {
        x: tables.length % gridColumns,
        y: Math.floor(tables.length / gridColumns),
      };

      const newTable: TableData = {
        id: `t${Date.now()}`,
        tableNumber,
        capacity,
        status: 'empty',
        position,
      };

      setTables((prev) => [...prev, newTable]);
      setPendingPosition(null);
    },
    [pendingPosition, tables.length, gridColumns]
  );

  const handleEditTable = useCallback(
    (tableNumber: string, capacity: number) => {
      if (!editingTable) return;
      setTables((prev) =>
        prev.map((t) =>
          t.id === editingTable.id
            ? { ...t, tableNumber, capacity }
            : t
        )
      );
      setEditingTable(null);
    },
    [editingTable]
  );

  const handleDeleteTable = useCallback(() => {
    if (!deleteTable) return;
    setTables((prev) => prev.filter((t) => t.id !== deleteTable.id));
    setDeleteTable(null);
  }, [deleteTable]);

  const handleTableMove = useCallback(
    (tableId: string, position: { x: number; y: number }) => {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, position } : t))
      );
    },
    []
  );

  const handleTableRemove = useCallback((tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
  }, []);

  const handleTableAdd = useCallback(
    (position: { x: number; y: number }) => {
      setPendingPosition(position);
      setEditingTable(null);
      setFormDialogOpen(true);
    },
    []
  );

  const handleTableSelect = useCallback((table: TableData) => {
    setQrDetailTable(table);
    setQrDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    (tableId: string, status: TableStatus) => {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status } : t))
      );
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Merge / Split Handlers
  // ---------------------------------------------------------------------------

  const handleMergeTables = useCallback(
    (tableIds: string[], newNumber: string, newCapacity: number) => {
      setTables((prev) => {
        const toMerge = prev.filter((t) => tableIds.includes(t.id));
        const remaining = prev.filter((t) => !tableIds.includes(t.id));
        const firstTable = toMerge[0];
        if (!firstTable) return prev;

        const merged: TableData = {
          id: `t${Date.now()}`,
          tableNumber: newNumber,
          capacity: newCapacity,
          status: 'empty',
          position: firstTable.position,
        };

        return [...remaining, merged];
      });
    },
    []
  );

  const handleSplitTable = useCallback(
    (tableId: string, splitCount: number) => {
      setTables((prev) => {
        const tableToSplit = prev.find((t) => t.id === tableId);
        if (!tableToSplit) return prev;

        const remaining = prev.filter((t) => t.id !== tableId);
        const capacityPerPart = Math.max(1, Math.floor(tableToSplit.capacity / splitCount));

        const newTables: TableData[] = Array.from(
          { length: splitCount },
          (_, i) => ({
            id: `t${Date.now()}-${i}`,
            tableNumber: `${tableToSplit.tableNumber}-${String.fromCharCode(65 + i)}`,
            capacity: i === splitCount - 1
              ? tableToSplit.capacity - capacityPerPart * (splitCount - 1)
              : capacityPerPart,
            status: 'empty' as TableStatus,
            position: {
              x: (tableToSplit.position.x + i) % gridColumns,
              y: tableToSplit.position.y + Math.floor((tableToSplit.position.x + i) / gridColumns),
            },
          })
        );

        return [...remaining, ...newTables];
      });
    },
    [gridColumns]
  );

  // ---------------------------------------------------------------------------
  // Bulk QR Download
  // ---------------------------------------------------------------------------

  const handleBulkDownload = useCallback(async () => {
    if (tables.length === 0) return;
    setBulkDownloading(true);

    try {
      const zip = new JSZip();
      const qrFolder = zip.folder('qr-kodlari');

      if (!qrFolder) {
        setBulkDownloading(false);
        return;
      }

      // Small delay to let hidden canvases render
      await new Promise((resolve) => setTimeout(resolve, 100));

      for (const table of tables) {
        const container = qrCanvasRefs.current.get(table.id);
        if (!container) continue;

        const canvas = container.querySelector('canvas');
        if (!canvas) continue;

        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        if (base64) {
          qrFolder.file(`qr-masa-${table.tableNumber}.png`, base64, {
            base64: true,
          });
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `qr-kodlari-${RESTAURANT_SLUG}.zip`);
    } catch {
      // Silently handle errors - in production we'd show a toast
    } finally {
      setBulkDownloading(false);
    }
  }, [tables]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Masa Yonetimi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Masalarinizi duzenleyin, QR kodlarini olusturun ve indirin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-accent-orange/10 text-accent-orange'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              Harita
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-accent-orange/10 text-accent-orange'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              <Archive className="h-3.5 w-3.5" />
              Liste
            </motion.button>
          </div>

          {/* Edit mode toggle (grid view only) */}
          {viewMode === 'grid' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditMode(!editMode)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                editMode
                  ? 'border-accent-orange/50 bg-accent-orange/10 text-accent-orange'
                  : 'border-white/10 bg-white/5 text-text-muted hover:text-text-main'
              )}
            >
              <Edit3 className="h-3.5 w-3.5" />
              {editMode ? 'Duzenleme Modu' : 'Duzenle'}
            </motion.button>
          )}

          {/* Add table button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setPendingPosition(null);
              setEditingTable(null);
              setFormDialogOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-3 py-2 text-xs font-medium text-accent-orange transition-colors hover:bg-accent-orange/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Masa Ekle
          </motion.button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-text-muted">Toplam Masa</p>
          <p className="mt-0.5 font-display text-xl font-bold text-text-main">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-text-muted">Toplam Kapasite</p>
          <p className="mt-0.5 font-display text-xl font-bold text-text-main">{stats.totalCapacity}</p>
        </div>
        {STATUS_ORDER.map((st) => {
          const config = STATUS_CONFIG[st];
          return (
            <div key={st} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', config.dot)} />
                <p className="text-xs text-text-muted">{config.label}</p>
              </div>
              <p className={cn('mt-0.5 font-display text-xl font-bold', config.color)}>
                {stats[st]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action bar: Merge, Split, Bulk Download */}
      <div className="flex flex-wrap items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMergeDialogOpen(true)}
          disabled={tables.length < 2}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
            tables.length >= 2
              ? 'border-white/10 bg-white/5 text-text-muted hover:border-accent-orange/30 hover:text-accent-orange'
              : 'border-white/5 bg-white/[0.02] text-text-muted/30 cursor-not-allowed'
          )}
        >
          <Merge className="h-3.5 w-3.5" />
          Birlestir
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSplitDialogOpen(true)}
          disabled={tables.filter((t) => t.capacity >= 4).length === 0}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
            tables.filter((t) => t.capacity >= 4).length > 0
              ? 'border-white/10 bg-white/5 text-text-muted hover:border-accent-blue/30 hover:text-accent-blue'
              : 'border-white/5 bg-white/[0.02] text-text-muted/30 cursor-not-allowed'
          )}
        >
          <Split className="h-3.5 w-3.5" />
          Bol
        </motion.button>

        <div className="hidden sm:block sm:flex-1" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBulkDownload}
          disabled={tables.length === 0 || bulkDownloading}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
            tables.length > 0 && !bulkDownloading
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'border-white/5 bg-white/[0.02] text-text-muted/30 cursor-not-allowed'
          )}
        >
          <Download className="h-3.5 w-3.5" />
          {bulkDownloading ? 'Hazirlaniyor...' : `Toplu QR Indir (${tables.length})`}
        </motion.button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Grid View (TableMap)                                                */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'grid' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-text-main">
              Masa Haritasi
            </h2>

            {/* Grid size controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-text-muted" htmlFor="grid-cols">
                  Sutun:
                </label>
                <select
                  id="grid-cols"
                  value={gridColumns}
                  onChange={(e) => setGridColumns(Number(e.target.value))}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-text-main focus:border-accent-orange/50 focus:outline-none"
                >
                  {[4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n} className="bg-bg-dark">
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-text-muted" htmlFor="grid-rows">
                  Satir:
                </label>
                <select
                  id="grid-rows"
                  value={gridRows}
                  onChange={(e) => setGridRows(Number(e.target.value))}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-text-main focus:border-accent-orange/50 focus:outline-none"
                >
                  {[3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n} className="bg-bg-dark">
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <TableMap
            tables={tables}
            columns={gridColumns}
            rows={gridRows}
            editMode={editMode}
            onTableMove={handleTableMove}
            onTableRemove={handleTableRemove}
            onTableAdd={handleTableAdd}
            onTableSelect={handleTableSelect}
            onStatusChange={handleStatusChange}
          />
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* List View                                                           */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-2"
        >
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/5 py-16 backdrop-blur-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                <PackageOpen className="h-7 w-7 text-text-muted/50" />
              </div>
              <p className="font-display text-base font-semibold text-text-main">
                Henuz masa eklenmedi
              </p>
              <p className="text-sm text-text-muted">
                Ilk masanizi ekleyerek baslayabilirsiniz.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPendingPosition(null);
                  setEditingTable(null);
                  setFormDialogOpen(true);
                }}
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange transition-colors hover:bg-accent-orange/20"
              >
                <Plus className="h-4 w-4" />
                Masa Ekle
              </motion.button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tables.map((table) => (
                <TableListRow
                  key={table.id}
                  table={table}
                  onEdit={(t) => {
                    setEditingTable(t);
                    setFormDialogOpen(true);
                  }}
                  onDelete={(t) => {
                    setDeleteTable(t);
                    setDeleteDialogOpen(true);
                  }}
                  onQR={(t) => {
                    setQrDetailTable(t);
                    setQrDetailOpen(true);
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Dialogs                                                             */}
      {/* ------------------------------------------------------------------ */}

      {/* Add / Edit Table Dialog */}
      <TableFormDialog
        open={formDialogOpen}
        onOpenChange={(isOpen) => {
          setFormDialogOpen(isOpen);
          if (!isOpen) {
            setEditingTable(null);
            setPendingPosition(null);
          }
        }}
        onSubmit={editingTable ? handleEditTable : handleAddTable}
        editingTable={editingTable}
      />

      {/* QR Code Detail Modal */}
      <QRDetailModal
        open={qrDetailOpen}
        onOpenChange={setQrDetailOpen}
        table={qrDetailTable}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(isOpen) => {
          setDeleteDialogOpen(isOpen);
          if (!isOpen) setDeleteTable(null);
        }}
        onConfirm={handleDeleteTable}
        tableNumber={deleteTable?.tableNumber ?? ''}
      />

      {/* Merge Tables Dialog */}
      <MergeDialog
        open={mergeDialogOpen}
        onOpenChange={setMergeDialogOpen}
        tables={tables}
        onMerge={handleMergeTables}
      />

      {/* Split Table Dialog */}
      <SplitDialog
        open={splitDialogOpen}
        onOpenChange={setSplitDialogOpen}
        tables={tables}
        onSplit={handleSplitTable}
      />

      {/* Hidden QR Canvases for bulk download */}
      <HiddenQRCanvases tables={tables} canvasRefs={qrCanvasRefs} />
    </div>
  );
}
