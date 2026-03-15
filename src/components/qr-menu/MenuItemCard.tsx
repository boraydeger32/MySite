'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil,
  Trash2,
  Copy,
  Clock,
  Flame,
  ImageIcon,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Star,
  Leaf,
  FlameKindling,
  ChefHat,
  Sparkles,
  TriangleAlert,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { MenuItem, ModifierGroup, ModifierOption } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLERGEN_LIST = [
  { value: 'gluten', label: 'Gluten', emoji: '\uD83C\uDF3E' },
  { value: 'sut', label: 'Sut', emoji: '\uD83E\uDD5B' },
  { value: 'yumurta', label: 'Yumurta', emoji: '\uD83E\uDD5A' },
  { value: 'fistik', label: 'Fistik', emoji: '\uD83E\uDD5C' },
  { value: 'deniz_urunleri', label: 'Deniz Urunleri', emoji: '\uD83E\uDD90' },
  { value: 'soya', label: 'Soya', emoji: '\uD83C\uDF31' },
  { value: 'susam', label: 'Susam', emoji: '\u2B55' },
  { value: 'kereviz', label: 'Kereviz', emoji: '\uD83E\uDD66' },
  { value: 'hardal', label: 'Hardal', emoji: '\uD83D\uDFE1' },
  { value: 'lupin', label: 'Lupin', emoji: '\uD83C\uDF3B' },
  { value: 'yumusakcalar', label: 'Yumusakcalar', emoji: '\uD83D\uDC19' },
  { value: 'sulfur_dioksit', label: 'Sulfit', emoji: '\uD83E\uDDEA' },
] as const;

const BADGE_LIST = [
  { value: 'populer', label: 'Populer', icon: Star, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { value: 'vegan', label: 'Vegan', icon: Leaf, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { value: 'acili', label: 'Acili', icon: FlameKindling, color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  { value: 'sefin_onerisi', label: 'Sefin Onerisi', icon: ChefHat, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  { value: 'yeni', label: 'Yeni', icon: Sparkles, color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
] as const;

const DEFAULT_MODIFIER_GROUPS: { name: string; options: { label: string; price: number }[] }[] = [
  {
    name: 'Ekstra malzeme',
    options: [
      { label: 'Peynir', price: 10 },
      { label: 'Mantar', price: 8 },
    ],
  },
  {
    name: 'Pisirme tercihi',
    options: [
      { label: 'Az pismisc', price: 0 },
      { label: 'Orta', price: 0 },
      { label: 'Cok pismisc', price: 0 },
    ],
  },
  {
    name: 'Boyut sec',
    options: [
      { label: 'Kucuk', price: 0 },
      { label: 'Orta', price: 15 },
      { label: 'Buyuk', price: 25 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Zod Schema for Menu Item Form
// ---------------------------------------------------------------------------

const modifierOptionSchema = z.object({
  label: z.string().min(1, 'Secenek adi zorunludur'),
  price: z.coerce.number().min(0, 'Fiyat 0 veya ustu olmalidir'),
});

const modifierGroupSchema = z.object({
  name: z.string().min(1, 'Grup adi zorunludur'),
  options: z.array(modifierOptionSchema).min(1, 'En az bir secenek ekleyin'),
});

const menuItemSchema = z.object({
  name: z.string().min(1, 'Urun adi zorunludur'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Fiyat 0 veya ustu olmalidir'),
  image_url: z.string().url('Gecerli bir URL giriniz').optional().or(z.literal('')),
  calories: z.coerce.number().min(0).optional().or(z.literal(0)),
  prep_time: z.coerce.number().min(0).optional().or(z.literal(0)),
  allergens: z.array(z.string()),
  badges: z.array(z.string()),
  modifiers: z.array(modifierGroupSchema),
  is_available: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onCopy: (item: MenuItem) => void;
  onToggleStock: (itemId: string, available: boolean) => void;
  className?: string;
}

interface MenuItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MenuItem | null;
  onSubmit: (data: MenuItemFormData) => void;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Helper: Format price in TRY
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

// ---------------------------------------------------------------------------
// AllergenChip
// ---------------------------------------------------------------------------

function AllergenChip({ allergen }: { allergen: string }) {
  const info = ALLERGEN_LIST.find((a) => a.value === allergen);
  if (!info) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-orange-400/20 bg-orange-400/5 px-2 py-0.5 text-[10px] font-medium text-orange-300"
      title={info.label}
    >
      <span>{info.emoji}</span>
      {info.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// BadgeChip
// ---------------------------------------------------------------------------

function BadgeChip({ badge }: { badge: string }) {
  const info = BADGE_LIST.find((b) => b.value === badge);
  if (!info) return null;

  const Icon = info.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
        info.color
      )}
    >
      <Icon className="h-3 w-3" />
      {info.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ModifierGroupDisplay (read-only in card)
// ---------------------------------------------------------------------------

function ModifierGroupDisplay({ group }: { group: ModifierGroup }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-xs font-medium text-text-muted transition-colors hover:text-text-main"
      >
        <span>{group.name} ({group.options.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 space-y-0.5">
              {group.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] text-text-muted"
                >
                  <span>{option.label}</span>
                  {option.price > 0 && (
                    <span className="text-accent-orange">+{formatPrice(option.price)}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModifierGroupEditor (in modal form)
// ---------------------------------------------------------------------------

interface ModifierGroupEditorProps {
  groupIndex: number;
  group: ModifierGroup;
  onUpdate: (index: number, group: ModifierGroup) => void;
  onRemove: (index: number) => void;
  errors?: Record<string, { message?: string }>;
}

function ModifierGroupEditor({
  groupIndex,
  group,
  onUpdate,
  onRemove,
}: ModifierGroupEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateGroupName = useCallback(
    (name: string) => {
      onUpdate(groupIndex, { ...group, name });
    },
    [groupIndex, group, onUpdate]
  );

  const addOption = useCallback(() => {
    onUpdate(groupIndex, {
      ...group,
      options: [...group.options, { label: '', price: 0 }],
    });
  }, [groupIndex, group, onUpdate]);

  const updateOption = useCallback(
    (optIndex: number, field: keyof ModifierOption, value: string | number) => {
      const newOptions = group.options.map((opt, i) =>
        i === optIndex ? { ...opt, [field]: value } : opt
      );
      onUpdate(groupIndex, { ...group, options: newOptions });
    },
    [groupIndex, group, onUpdate]
  );

  const removeOption = useCallback(
    (optIndex: number) => {
      const newOptions = group.options.filter((_, i) => i !== optIndex);
      onUpdate(groupIndex, { ...group, options: newOptions });
    },
    [groupIndex, group, onUpdate]
  );

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      {/* Group Header */}
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 shrink-0 text-text-muted" />
        <Input
          value={group.name}
          onChange={(e) => updateGroupName(e.target.value)}
          placeholder="Grup adi (ornegin: Boyut sec)"
          className="h-8 flex-1 border-white/10 bg-white/5 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange focus:ring-accent-orange/50"
        />
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => onRemove(groupIndex)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label="Grubu sil"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 pl-6">
              {group.options.map((option, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(optIdx, 'label', e.target.value)}
                    placeholder="Secenek adi"
                    className="h-8 flex-1 border-white/10 bg-white/5 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange focus:ring-accent-orange/50"
                  />
                  <div className="relative w-24">
                    <Input
                      type="number"
                      value={option.price}
                      onChange={(e) => updateOption(optIdx, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8 border-white/10 bg-white/5 pr-6 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange focus:ring-accent-orange/50"
                      min={0}
                      step={0.01}
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">
                      TL
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(optIdx)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Secenegi sil"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-orange transition-colors hover:bg-accent-orange/10"
              >
                <Plus className="h-3 w-3" />
                Secenek Ekle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MenuItemFormModal
// ---------------------------------------------------------------------------

export function MenuItemFormModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: MenuItemFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price ?? 0,
      image_url: initialData?.image_url ?? '',
      calories: initialData?.calories ?? 0,
      prep_time: initialData?.prep_time ?? 0,
      allergens: initialData?.allergens ?? [],
      badges: initialData?.badges ?? [],
      modifiers: initialData?.modifiers ?? [],
      is_available: initialData?.is_available ?? true,
    },
  });

  const watchedAllergens = watch('allergens');
  const watchedBadges = watch('badges');
  const watchedModifiers = watch('modifiers');

  // Toggle allergen
  const toggleAllergen = useCallback(
    (allergen: string) => {
      const current = watchedAllergens ?? [];
      const next = current.includes(allergen)
        ? current.filter((a) => a !== allergen)
        : [...current, allergen];
      setValue('allergens', next, { shouldValidate: true });
    },
    [watchedAllergens, setValue]
  );

  // Toggle badge
  const toggleBadge = useCallback(
    (badge: string) => {
      const current = watchedBadges ?? [];
      const next = current.includes(badge)
        ? current.filter((b) => b !== badge)
        : [...current, badge];
      setValue('badges', next, { shouldValidate: true });
    },
    [watchedBadges, setValue]
  );

  // Modifier group handlers
  const updateModifierGroup = useCallback(
    (index: number, group: ModifierGroup) => {
      const current = [...(watchedModifiers ?? [])];
      current[index] = group;
      setValue('modifiers', current, { shouldValidate: true });
    },
    [watchedModifiers, setValue]
  );

  const removeModifierGroup = useCallback(
    (index: number) => {
      const current = (watchedModifiers ?? []).filter((_, i) => i !== index);
      setValue('modifiers', current, { shouldValidate: true });
    },
    [watchedModifiers, setValue]
  );

  const addModifierGroup = useCallback(() => {
    const current = watchedModifiers ?? [];
    setValue(
      'modifiers',
      [...current, { name: '', options: [{ label: '', price: 0 }] }],
      { shouldValidate: true }
    );
  }, [watchedModifiers, setValue]);

  // Handle modal open/close - reset form on open
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        reset({
          name: initialData?.name ?? '',
          description: initialData?.description ?? '',
          price: initialData?.price ?? 0,
          image_url: initialData?.image_url ?? '',
          calories: initialData?.calories ?? 0,
          prep_time: initialData?.prep_time ?? 0,
          allergens: initialData?.allergens ?? [],
          badges: initialData?.badges ?? [],
          modifiers: initialData?.modifiers ?? [],
          is_available: initialData?.is_available ?? true,
        });
      }
      onOpenChange(isOpen);
    },
    [initialData, onOpenChange, reset]
  );

  const handleFormSubmit = useCallback(
    (data: MenuItemFormData) => {
      onSubmit(data);
    },
    [onSubmit]
  );

  const inputClasses = cn(
    'border-white/10 bg-white/5 text-text-main placeholder:text-text-muted/50',
    'focus:border-accent-orange focus:ring-accent-orange/50'
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-text-main">
            {isEditing ? 'Urunu Duzenle' : 'Yeni Urun Ekle'}
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            {isEditing
              ? 'Urun bilgilerini guncelleyin.'
              : 'Menunuze yeni bir urun ekleyin.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form
            id="menu-item-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6 pb-2"
          >
            {/* ---- Basic Info ---- */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-main">Temel Bilgiler</h3>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="item-name" className="text-text-main">
                  Urun Adi <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="item-name"
                  {...register('name')}
                  placeholder="ornegin: Izgara Tavuk"
                  className={cn(inputClasses, errors.name && 'border-red-500/50')}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-xs text-red-400" role="alert">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="item-description" className="text-text-main">
                  Aciklama
                </Label>
                <Textarea
                  id="item-description"
                  {...register('description')}
                  placeholder="Urun hakkinda kisa bir aciklama"
                  rows={2}
                  className={cn(inputClasses, 'min-h-[60px]')}
                  disabled={isSubmitting}
                />
              </div>

              {/* Price + Calories + Prep Time row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="item-price" className="text-text-main">
                    Fiyat (TL) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="item-price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price')}
                    placeholder="0.00"
                    className={cn(inputClasses, errors.price && 'border-red-500/50')}
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-400" role="alert">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-calories" className="text-text-main">
                    Kalori (kcal)
                  </Label>
                  <Input
                    id="item-calories"
                    type="number"
                    min="0"
                    {...register('calories')}
                    placeholder="0"
                    className={inputClasses}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-prep-time" className="text-text-main">
                    Hazirlanma (dk)
                  </Label>
                  <Input
                    id="item-prep-time"
                    type="number"
                    min="0"
                    {...register('prep_time')}
                    placeholder="0"
                    className={inputClasses}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="item-image" className="text-text-main">
                  Gorsel URL
                </Label>
                <Input
                  id="item-image"
                  type="url"
                  {...register('image_url')}
                  placeholder="https://ornek.com/gorsel.jpg"
                  className={cn(inputClasses, errors.image_url && 'border-red-500/50')}
                  disabled={isSubmitting}
                />
                {errors.image_url && (
                  <p className="text-xs text-red-400" role="alert">{errors.image_url.message}</p>
                )}
              </div>
            </div>

            {/* ---- Allergens ---- */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-main">
                <TriangleAlert className="h-4 w-4 text-orange-400" />
                Alerjenler
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_LIST.map((allergen) => {
                  const isSelected = (watchedAllergens ?? []).includes(allergen.value);
                  return (
                    <button
                      key={allergen.value}
                      type="button"
                      onClick={() => toggleAllergen(allergen.value)}
                      disabled={isSubmitting}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                        isSelected
                          ? 'border-orange-400/40 bg-orange-400/15 text-orange-300'
                          : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20 hover:text-text-main'
                      )}
                    >
                      <span>{allergen.emoji}</span>
                      {allergen.label}
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---- Badges ---- */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-main">
                <Star className="h-4 w-4 text-amber-400" />
                Etiketler
              </h3>
              <div className="flex flex-wrap gap-2">
                {BADGE_LIST.map((badge) => {
                  const isSelected = (watchedBadges ?? []).includes(badge.value);
                  const Icon = badge.icon;
                  return (
                    <button
                      key={badge.value}
                      type="button"
                      onClick={() => toggleBadge(badge.value)}
                      disabled={isSubmitting}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                        isSelected
                          ? badge.color
                          : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20 hover:text-text-main'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {badge.label}
                      {isSelected && <Check className="ml-0.5 h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---- Modifier Groups ---- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-main">
                  Secim Gruplari
                </h3>
                <button
                  type="button"
                  onClick={addModifierGroup}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-orange transition-colors hover:bg-accent-orange/10"
                >
                  <Plus className="h-3 w-3" />
                  Grup Ekle
                </button>
              </div>

              {(watchedModifiers ?? []).length === 0 ? (
                <p className="text-xs text-text-muted">
                  Henuz secim grubu eklenmedi. Boyut, ekstra malzeme veya pisirme tercihi gibi gruplar ekleyebilirsiniz.
                </p>
              ) : (
                <div className="space-y-3">
                  {(watchedModifiers ?? []).map((group, idx) => (
                    <ModifierGroupEditor
                      key={idx}
                      groupIndex={idx}
                      group={group}
                      onUpdate={updateModifierGroup}
                      onRemove={removeModifierGroup}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ---- Stock Toggle ---- */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
              <Label htmlFor="item-available" className="cursor-pointer text-text-main">
                Stokta Mevcut
              </Label>
              <Controller
                name="is_available"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="item-available"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-text-muted hover:text-text-main"
            disabled={isSubmitting}
          >
            <X className="mr-1.5 h-4 w-4" />
            Iptal
          </Button>
          <Button
            type="submit"
            form="menu-item-form"
            disabled={isSubmitting}
            className="bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" />
            )}
            {isEditing ? 'Guncelle' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// MenuItemCard (Main Component)
// ---------------------------------------------------------------------------

export default function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onCopy,
  onToggleStock,
  className,
}: MenuItemCardProps) {
  const [showModifiers, setShowModifiers] = useState(false);

  const hasAllergens = item.allergens && item.allergens.length > 0;
  const hasBadges = item.badges && item.badges.length > 0;
  const hasModifiers = item.modifiers && item.modifiers.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl',
        'transition-all duration-200',
        'hover:border-white/20 hover:shadow-lg hover:shadow-white/[0.02]',
        !item.is_available && 'opacity-60',
        className
      )}
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white/5">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-text-muted/40" />
            </div>
          )}
          {/* Out of stock overlay */}
          {!item.is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                Tukendi
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name + Price */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-text-main">
                {item.name}
              </h3>
              {item.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">
                  {item.description}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm font-bold text-accent-orange">
              {formatPrice(item.price)}
            </span>
          </div>

          {/* Meta: calories + prep time */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {item.calories != null && item.calories > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                <Flame className="h-3 w-3 text-orange-400" />
                {item.calories} kcal
              </span>
            )}
            {item.prep_time != null && item.prep_time > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                <Clock className="h-3 w-3 text-sky-400" />
                {item.prep_time} dk
              </span>
            )}
          </div>

          {/* Badges */}
          {hasBadges && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.badges.map((badge) => (
                <BadgeChip key={badge} badge={badge} />
              ))}
            </div>
          )}

          {/* Allergens */}
          {hasAllergens && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.allergens.map((allergen) => (
                <AllergenChip key={allergen} allergen={allergen} />
              ))}
            </div>
          )}

          {/* Modifier groups summary */}
          {hasModifiers && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowModifiers(!showModifiers)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-blue transition-colors hover:text-accent-blue/80"
              >
                {showModifiers ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {item.modifiers.length} secim grubu
              </button>
              <AnimatePresence>
                {showModifiers && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1.5 space-y-1.5 overflow-hidden"
                  >
                    {item.modifiers.map((group, idx) => (
                      <ModifierGroupDisplay key={idx} group={group} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-4 py-2">
        {/* Stock toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStock(item.id, !item.is_available)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all',
              item.is_available
                ? 'text-emerald-400 hover:bg-emerald-500/10'
                : 'text-red-400 hover:bg-red-500/10'
            )}
            title={item.is_available ? 'Stokta - tikla tukendi yap' : 'Tukendi - tikla stokta yap'}
          >
            {item.is_available ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {item.is_available ? 'Stokta' : 'Tukendi'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCopy(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            aria-label="Kopyala"
            title="Urunu kopyala"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent-orange/10 hover:text-accent-orange"
            aria-label="Duzenle"
            title="Urunu duzenle"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label="Sil"
            title="Urunu sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
