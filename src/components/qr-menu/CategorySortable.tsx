'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Plus,
  Clock,
  Palette,
  SmilePlus,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_visible: boolean;
  available_from: string | null;
  available_until: string | null;
}

interface CategorySortableProps {
  categories: MenuCategory[];
  onReorder: (categories: MenuCategory[]) => void;
  onAdd: (category: Omit<MenuCategory, 'id' | 'sort_order'>) => void;
  onEdit: (category: MenuCategory) => void;
  onDelete: (categoryId: string) => void;
  onToggleVisibility: (categoryId: string, visible: boolean) => void;
  className?: string;
}

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  is_visible: boolean;
  available_from: string;
  available_until: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_ICONS = [
  { value: 'coffee', label: 'Kahve', emoji: '☕' },
  { value: 'pizza', label: 'Pizza', emoji: '🍕' },
  { value: 'burger', label: 'Burger', emoji: '🍔' },
  { value: 'salad', label: 'Salata', emoji: '🥗' },
  { value: 'soup', label: 'Corba', emoji: '🍲' },
  { value: 'dessert', label: 'Tatli', emoji: '🍰' },
  { value: 'drink', label: 'Icecek', emoji: '🥤' },
  { value: 'kebab', label: 'Kebap', emoji: '🥙' },
  { value: 'fish', label: 'Balik', emoji: '🐟' },
  { value: 'breakfast', label: 'Kahvalti', emoji: '🍳' },
  { value: 'pasta', label: 'Makarna', emoji: '🍝' },
  { value: 'steak', label: 'Et', emoji: '🥩' },
  { value: 'rice', label: 'Pilav', emoji: '🍚' },
  { value: 'bread', label: 'Ekmek', emoji: '🍞' },
  { value: 'ice-cream', label: 'Dondurma', emoji: '🍦' },
  { value: 'cocktail', label: 'Kokteyl', emoji: '🍹' },
];

const CATEGORY_COLORS = [
  '#FF6B2B', '#00D4FF', '#7C3AED', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#6366F1',
  '#14B8A6', '#8B5CF6', '#F97316', '#06B6D4',
];

const DEFAULT_FORM_DATA: CategoryFormData = {
  name: '',
  icon: 'coffee',
  color: '#FF6B2B',
  is_visible: true,
  available_from: '',
  available_until: '',
};

function getIconEmoji(iconValue: string): string {
  return CATEGORY_ICONS.find((i) => i.value === iconValue)?.emoji ?? '📂';
}

// ---------------------------------------------------------------------------
// SortableCategoryCard
// ---------------------------------------------------------------------------

interface SortableCategoryCardProps {
  category: MenuCategory;
  onEdit: (category: MenuCategory) => void;
  onDelete: (categoryId: string) => void;
  onToggleVisibility: (categoryId: string, visible: boolean) => void;
}

function SortableCategoryCard({
  category,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasTimeRestriction = category.available_from || category.available_until;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl',
        'transition-all duration-200',
        isDragging && 'z-50 border-accent-orange/40 bg-white/10 shadow-lg shadow-accent-orange/10',
        !isDragging && 'hover:border-white/20',
        !category.is_visible && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <button
        className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/10 hover:text-text-main active:cursor-grabbing"
        aria-label="Siralama icin surukle"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Icon + Color indicator */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <span>{getIconEmoji(category.icon)}</span>
      </div>

      {/* Category info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-text-main">
            {category.name}
          </h3>
          {/* Color dot */}
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        {hasTimeRestriction && (
          <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <Clock className="h-3 w-3" />
            <span>
              {category.available_from || '00:00'} - {category.available_until || '23:59'}
            </span>
          </div>
        )}
      </div>

      {/* Visibility toggle */}
      <button
        onClick={() => onToggleVisibility(category.id, !category.is_visible)}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          category.is_visible
            ? 'text-emerald-400 hover:bg-emerald-500/10'
            : 'text-text-muted hover:bg-white/10'
        )}
        aria-label={category.is_visible ? 'Gizle' : 'Goster'}
        title={category.is_visible ? 'Gorunur - tikla gizle' : 'Gizli - tikla goster'}
      >
        {category.is_visible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      {/* Edit button */}
      <button
        onClick={() => onEdit(category)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent-orange/10 hover:text-accent-orange"
        aria-label="Duzenle"
        title="Kategori duzenle"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {/* Delete button */}
      <button
        onClick={() => onDelete(category.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
        aria-label="Sil"
        title="Kategori sil"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DragOverlay card (visual clone while dragging)
// ---------------------------------------------------------------------------

function DragOverlayCard({ category }: { category: MenuCategory }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-accent-orange/30 bg-bg-dark/95 p-4 shadow-xl shadow-accent-orange/10 backdrop-blur-xl">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-accent-orange">
        <GripVertical className="h-5 w-5" />
      </div>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <span>{getIconEmoji(category.icon)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-text-main">
          {category.name}
        </h3>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryFormModal
// ---------------------------------------------------------------------------

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CategoryFormData;
  title: string;
  onSubmit: (data: CategoryFormData) => void;
}

function CategoryFormModal({
  open,
  onOpenChange,
  initialData,
  title,
  onSubmit,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData ?? DEFAULT_FORM_DATA
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return;
      onSubmit(formData);
      onOpenChange(false);
    },
    [formData, onSubmit, onOpenChange]
  );

  const updateField = useCallback(
    <K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Reset form when opened with new data
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setFormData(initialData ?? DEFAULT_FORM_DATA);
      }
      onOpenChange(isOpen);
    },
    [initialData, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-main">{title}</DialogTitle>
          <DialogDescription className="text-text-muted">
            Kategori bilgilerini doldurun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-text-main">
              Kategori Adi
            </Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="ornegin: Ana Yemekler"
              className="border-white/10 bg-white/5 text-text-main placeholder:text-text-muted/50 focus:border-accent-orange focus:ring-accent-orange/50"
              required
              autoFocus
            />
          </div>

          {/* Icon selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-text-main">
              <SmilePlus className="h-4 w-4" />
              Ikon
            </Label>
            <div className="grid grid-cols-8 gap-1.5">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => updateField('icon', icon.value)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-base transition-all',
                    formData.icon === icon.value
                      ? 'bg-accent-orange/20 ring-2 ring-accent-orange/50'
                      : 'bg-white/5 hover:bg-white/10'
                  )}
                  title={icon.label}
                  aria-label={icon.label}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-text-main">
              <Palette className="h-4 w-4" />
              Renk
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateField('color', color)}
                  className={cn(
                    'relative h-8 w-full rounded-lg transition-all',
                    formData.color === color && 'ring-2 ring-white/60 ring-offset-2 ring-offset-bg-dark'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Renk: ${color}`}
                >
                  {formData.color === color && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
            <Label htmlFor="category-visible" className="cursor-pointer text-text-main">
              Gorunurluk
            </Label>
            <Switch
              id="category-visible"
              checked={formData.is_visible}
              onCheckedChange={(checked) => updateField('is_visible', checked)}
            />
          </div>

          {/* Time-based availability */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-text-main">
              <Clock className="h-4 w-4" />
              Zaman Bazli Kullanilabilirlik
            </Label>
            <p className="text-xs text-text-muted">
              Bos birakirsaniz kategori tum gun gorunur olur.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="available-from" className="text-xs text-text-muted">
                  Baslangic
                </Label>
                <Input
                  id="available-from"
                  type="time"
                  value={formData.available_from}
                  onChange={(e) => updateField('available_from', e.target.value)}
                  className="border-white/10 bg-white/5 text-text-main focus:border-accent-orange focus:ring-accent-orange/50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="available-until" className="text-xs text-text-muted">
                  Bitis
                </Label>
                <Input
                  id="available-until"
                  type="time"
                  value={formData.available_until}
                  onChange={(e) => updateField('available_until', e.target.value)}
                  className="border-white/10 bg-white/5 text-text-main focus:border-accent-orange focus:ring-accent-orange/50"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-text-muted hover:text-text-main"
            >
              <X className="mr-1.5 h-4 w-4" />
              Iptal
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim()}
              className="bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-50"
            >
              <Check className="mr-1.5 h-4 w-4" />
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Component: CategorySortable
// ---------------------------------------------------------------------------

export default function CategorySortable({
  categories,
  onReorder,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisibility,
  className,
}: CategorySortableProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categoryIds = useMemo(
    () => categories.map((c) => c.id),
    [categories]
  );

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeId) ?? null,
    [categories, activeId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);

      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(categories, oldIndex, newIndex).map(
        (cat, index) => ({ ...cat, sort_order: index })
      );

      onReorder(reordered);
    },
    [categories, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleAddSubmit = useCallback(
    (data: CategoryFormData) => {
      onAdd({
        name: data.name,
        icon: data.icon,
        color: data.color,
        is_visible: data.is_visible,
        available_from: data.available_from || null,
        available_until: data.available_until || null,
      });
    },
    [onAdd]
  );

  const handleEditSubmit = useCallback(
    (data: CategoryFormData) => {
      if (!editingCategory) return;
      onEdit({
        ...editingCategory,
        name: data.name,
        icon: data.icon,
        color: data.color,
        is_visible: data.is_visible,
        available_from: data.available_from || null,
        available_until: data.available_until || null,
      });
      setEditingCategory(null);
    },
    [editingCategory, onEdit]
  );

  const openEditModal = useCallback((category: MenuCategory) => {
    setEditingCategory(category);
  }, []);

  const editFormData: CategoryFormData | undefined = editingCategory
    ? {
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        is_visible: editingCategory.is_visible,
        available_from: editingCategory.available_from ?? '',
        available_until: editingCategory.available_until ?? '',
      }
    : undefined;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-text-main">
            Kategoriler
          </h2>
          <p className="text-sm text-text-muted">
            Surukleyerek siralama yapabilirsiniz.
          </p>
        </div>
        <motion.button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-orange/90"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori Ekle
        </motion.button>
      </div>

      {/* Category list */}
      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-orange/10">
            <Plus className="h-7 w-7 text-accent-orange" />
          </div>
          <h3 className="mt-4 font-display text-base font-semibold text-text-main">
            Henuz kategori yok
          </h3>
          <p className="mt-1 max-w-xs text-sm text-text-muted">
            Ilk kategorinizi olusturarak menunuzu duzenlemeye baslayin.
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 bg-accent-orange text-white hover:bg-accent-orange/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Ilk Kategoriyi Olustur
          </Button>
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={categoryIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <SortableCategoryCard
                      category={category}
                      onEdit={openEditModal}
                      onDelete={onDelete}
                      onToggleVisibility={onToggleVisibility}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeCategory ? (
              <DragOverlayCard category={activeCategory} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add Category Modal */}
      <CategoryFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Yeni Kategori Ekle"
        onSubmit={handleAddSubmit}
      />

      {/* Edit Category Modal */}
      <CategoryFormModal
        open={!!editingCategory}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
        initialData={editFormData}
        title="Kategori Duzenle"
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
