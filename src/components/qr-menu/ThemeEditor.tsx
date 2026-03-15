'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import {
  Palette,
  Type,
  LayoutGrid,
  LayoutList,
  CreditCard,
  AlignVerticalJustifyStart,
  AlignHorizontalJustifyStart,
  Circle,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { themeFonts, type ThemeFont } from '@/lib/fonts';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RestaurantTheme } from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

interface ThemeEditorProps {
  /** Current theme settings */
  theme: RestaurantTheme;
  /** Callback when any theme value changes */
  onChange: (theme: RestaurantTheme) => void;
  /** Callback when user clicks "Save" */
  onSave?: (theme: RestaurantTheme) => void;
  /** Whether save operation is in progress */
  isSaving?: boolean;
  /** Optional className override */
  className?: string;
}

interface ColorFieldConfig {
  key: keyof Pick<
    RestaurantTheme,
    'primaryColor' | 'secondaryColor' | 'backgroundColor' | 'textColor' | 'cardBackground'
  >;
  label: string;
  defaultValue: string;
}

// =============================================================================
// Constants
// =============================================================================

const COLOR_FIELDS: ColorFieldConfig[] = [
  { key: 'primaryColor', label: 'Ana Renk', defaultValue: '#FF6B2B' },
  { key: 'secondaryColor', label: 'Ikincil Renk', defaultValue: '#00D4FF' },
  { key: 'backgroundColor', label: 'Arka Plan', defaultValue: '#050A14' },
  { key: 'textColor', label: 'Yazi Rengi', defaultValue: '#F0F4FF' },
  { key: 'cardBackground', label: 'Kart Arka Plani', defaultValue: '#0D1524' },
];

// ---------------------------------------------------------------------------
// 6 Preset Palettes
// ---------------------------------------------------------------------------

interface ThemePreset {
  key: string;
  label: string;
  description: string;
  colors: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    cardBackground: string;
  };
}

const THEME_PRESETS: ThemePreset[] = [
  {
    key: 'klasik-siyah',
    label: 'Klasik Siyah',
    description: 'Zarif ve minimal siyah tema',
    colors: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#A0A0A0',
      backgroundColor: '#0A0A0A',
      textColor: '#FAFAFA',
      cardBackground: '#1A1A1A',
    },
  },
  {
    key: 'sicak-kahve',
    label: 'Sicak Kahve',
    description: 'Kafe ve pastane icin sicak tonlar',
    colors: {
      primaryColor: '#C67C4E',
      secondaryColor: '#DDC5A2',
      backgroundColor: '#1C1210',
      textColor: '#F5EDE4',
      cardBackground: '#2A1F1A',
    },
  },
  {
    key: 'okyanus',
    label: 'Okyanus',
    description: 'Deniz urunleri icin ferah mavi tonlar',
    colors: {
      primaryColor: '#0EA5E9',
      secondaryColor: '#38BDF8',
      backgroundColor: '#0C1929',
      textColor: '#E0F2FE',
      cardBackground: '#132F4C',
    },
  },
  {
    key: 'gun-batimi',
    label: 'Gun Batimi',
    description: 'Sicak turuncu ve kirmizi tonlar',
    colors: {
      primaryColor: '#F97316',
      secondaryColor: '#FB923C',
      backgroundColor: '#1A0F0A',
      textColor: '#FFF7ED',
      cardBackground: '#2D1B10',
    },
  },
  {
    key: 'nane',
    label: 'Nane',
    description: 'Dogal ve ferah yesil tonlar',
    colors: {
      primaryColor: '#10B981',
      secondaryColor: '#34D399',
      backgroundColor: '#0A1A14',
      textColor: '#ECFDF5',
      cardBackground: '#132D22',
    },
  },
  {
    key: 'luks-mor',
    label: 'Luks Mor',
    description: 'Premium restoranlar icin luks tonlar',
    colors: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#A78BFA',
      backgroundColor: '#0F0A1A',
      textColor: '#F3EEFF',
      cardBackground: '#1A1230',
    },
  },
];

// ---------------------------------------------------------------------------
// Layout options
// ---------------------------------------------------------------------------

const LAYOUT_OPTIONS = [
  { value: 'grid' as const, label: 'Izgara', icon: LayoutGrid },
  { value: 'list' as const, label: 'Liste', icon: LayoutList },
  { value: 'cards' as const, label: 'Kartlar', icon: CreditCard },
];

const CATEGORY_NAV_OPTIONS = [
  { value: 'top' as const, label: 'Ust', icon: AlignVerticalJustifyStart },
  { value: 'left' as const, label: 'Sol', icon: AlignHorizontalJustifyStart },
  { value: 'floating' as const, label: 'Yuvarlak', icon: Circle },
];

const BORDER_RADIUS_OPTIONS = [
  { value: '0px', label: 'Kare' },
  { value: '8px', label: 'Hafif' },
  { value: '12px', label: 'Orta' },
  { value: '16px', label: 'Yuvarlak' },
  { value: '24px', label: 'Oval' },
];

// ---------------------------------------------------------------------------
// Default theme values
// ---------------------------------------------------------------------------

const DEFAULT_THEME: RestaurantTheme = {
  primaryColor: '#FF6B2B',
  secondaryColor: '#00D4FF',
  backgroundColor: '#050A14',
  textColor: '#F0F4FF',
  cardBackground: '#0D1524',
  fontFamily: 'inter',
  layout: 'grid',
  categoryNavPosition: 'top',
  borderRadius: '12px',
};

// =============================================================================
// Collapsible Section Component
// =============================================================================

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10">
            <Icon className="h-4 w-4 text-accent-orange" />
          </div>
          <span className="text-sm font-semibold text-text-main">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 py-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// ColorPicker Field Component
// =============================================================================

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-text-muted">{label}</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 transition-all hover:border-white/20"
          style={{ backgroundColor: value }}
          aria-label={`${label} renk secici`}
        />
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
            #
          </span>
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed={false}
            className={cn(
              'h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-7 pr-3',
              'text-xs font-mono uppercase text-text-main',
              'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
              'transition-colors'
            )}
          />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <HexColorPicker
                color={value}
                onChange={onChange}
                className="!w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ThemeEditor({
  theme,
  onChange,
  onSave,
  isSaving = false,
  className,
}: ThemeEditorProps) {
  // Merge theme with defaults
  const currentTheme = useMemo<RestaurantTheme>(
    () => ({ ...DEFAULT_THEME, ...theme }),
    [theme]
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const updateField = useCallback(
    <K extends keyof RestaurantTheme>(key: K, value: RestaurantTheme[K]) => {
      onChange({ ...currentTheme, [key]: value });
    },
    [currentTheme, onChange]
  );

  const applyPreset = useCallback(
    (preset: ThemePreset) => {
      onChange({
        ...currentTheme,
        ...preset.colors,
      });
    },
    [currentTheme, onChange]
  );

  const resetTheme = useCallback(() => {
    onChange(DEFAULT_THEME);
  }, [onChange]);

  const handleSave = useCallback(() => {
    onSave?.(currentTheme);
  }, [currentTheme, onSave]);

  // Check if current colors match a preset
  const activePresetKey = useMemo(() => {
    return THEME_PRESETS.find(
      (p) =>
        p.colors.primaryColor === currentTheme.primaryColor &&
        p.colors.secondaryColor === currentTheme.secondaryColor &&
        p.colors.backgroundColor === currentTheme.backgroundColor &&
        p.colors.textColor === currentTheme.textColor &&
        p.colors.cardBackground === currentTheme.cardBackground
    )?.key ?? null;
  }, [currentTheme]);

  // Group fonts by category
  const fontsByCategory = useMemo(() => {
    const grouped: Record<string, ThemeFont[]> = {
      'sans-serif': [],
      serif: [],
      display: [],
    };
    for (const font of themeFonts) {
      grouped[font.category]?.push(font);
    }
    return grouped;
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-4">
        <h2 className="text-lg font-bold text-text-main">Tema Duzenleyici</h2>
        <button
          type="button"
          onClick={resetTheme}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
          title="Varsayilanlara sifirla"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Sifirla
        </button>
      </div>

      <ScrollArea className="flex-1 pr-1">
        <div className="space-y-4 pb-4">
          {/* ================================================================ */}
          {/* Preset Palettes */}
          {/* ================================================================ */}
          <Section title="Hazir Temalar" icon={Sparkles} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2">
              {THEME_PRESETS.map((preset) => {
                const isActive = activePresetKey === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      'group relative flex flex-col gap-2 rounded-lg border p-3 text-left transition-all',
                      isActive
                        ? 'border-accent-orange/50 bg-accent-orange/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                    )}
                  >
                    {/* Color preview dots */}
                    <div className="flex items-center gap-1.5">
                      {Object.values(preset.colors).map((color, idx) => (
                        <div
                          key={idx}
                          className="h-4 w-4 rounded-full border border-white/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Label */}
                    <div>
                      <span className="text-xs font-semibold text-text-main">
                        {preset.label}
                      </span>
                      <p className="mt-0.5 text-[10px] leading-tight text-text-muted">
                        {preset.description}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-orange"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ================================================================ */}
          {/* Color Pickers */}
          {/* ================================================================ */}
          <Section title="Renkler" icon={Palette} defaultOpen={true}>
            <div className="space-y-4">
              {COLOR_FIELDS.map((field) => (
                <ColorPickerField
                  key={field.key}
                  label={field.label}
                  value={(currentTheme[field.key] as string) ?? field.defaultValue}
                  onChange={(color) => updateField(field.key, color)}
                />
              ))}
            </div>
          </Section>

          {/* ================================================================ */}
          {/* Typography */}
          {/* ================================================================ */}
          <Section title="Tipografi" icon={Type} defaultOpen={false}>
            <div className="space-y-3">
              {/* Sans-serif fonts */}
              <div>
                <Label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Sans-Serif
                </Label>
                <div className="space-y-1">
                  {fontsByCategory['sans-serif'].map((font) => (
                    <FontOption
                      key={font.key}
                      font={font}
                      isSelected={currentTheme.fontFamily === font.key}
                      onSelect={() => updateField('fontFamily', font.key)}
                    />
                  ))}
                </div>
              </div>

              {/* Serif fonts */}
              <div>
                <Label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Serif
                </Label>
                <div className="space-y-1">
                  {fontsByCategory['serif'].map((font) => (
                    <FontOption
                      key={font.key}
                      font={font}
                      isSelected={currentTheme.fontFamily === font.key}
                      onSelect={() => updateField('fontFamily', font.key)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ================================================================ */}
          {/* Layout Options */}
          {/* ================================================================ */}
          <Section title="Duzen" icon={LayoutGrid} defaultOpen={false}>
            <div className="space-y-5">
              {/* Menu layout */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-text-muted">
                  Menu Gorunumu
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentTheme.layout === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('layout', option.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-all',
                          isSelected
                            ? 'border-accent-orange/50 bg-accent-orange/10 text-accent-orange'
                            : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20 hover:text-text-main'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[11px] font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category navigation position */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-text-muted">
                  Kategori Navigasyonu
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_NAV_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentTheme.categoryNavPosition === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('categoryNavPosition', option.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-all',
                          isSelected
                            ? 'border-accent-orange/50 bg-accent-orange/10 text-accent-orange'
                            : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20 hover:text-text-main'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[11px] font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border radius */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-text-muted">
                  Kose Yuvarlaklik
                </Label>
                <div className="flex flex-wrap gap-2">
                  {BORDER_RADIUS_OPTIONS.map((option) => {
                    const isSelected = currentTheme.borderRadius === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('borderRadius', option.value)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                          isSelected
                            ? 'border-accent-orange/50 bg-accent-orange/10 text-accent-orange'
                            : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20 hover:text-text-main'
                        )}
                      >
                        <div
                          className="h-3 w-3 border border-current"
                          style={{ borderRadius: option.value }}
                        />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>
        </div>
      </ScrollArea>

      {/* Save Button */}
      {onSave && (
        <div className="border-t border-white/10 pt-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-50"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Kaydediliyor...' : 'Temayi Kaydet'}
          </Button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FontOption Sub-Component
// =============================================================================

interface FontOptionProps {
  font: ThemeFont;
  isSelected: boolean;
  onSelect: () => void;
}

function FontOption({ font, isSelected, onSelect }: FontOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
        isSelected
          ? 'border-accent-orange/50 bg-accent-orange/10'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn('text-base text-text-main', font.className)}
          style={{ fontFamily: `var(${font.variable})` }}
        >
          Aa
        </span>
        <div>
          <span className="text-xs font-medium text-text-main">{font.label}</span>
          <span className="ml-1.5 text-[10px] text-text-muted">({font.category})</span>
        </div>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-orange"
        >
          <Check className="h-3 w-3 text-white" />
        </motion.div>
      )}
    </button>
  );
}
