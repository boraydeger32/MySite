'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import ThemeEditor from '@/components/qr-menu/ThemeEditor';
import ThemePreview from '@/components/qr-menu/ThemePreview';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { RestaurantTheme } from '@/lib/supabase/types';

// =============================================================================
// Constants
// =============================================================================

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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

// =============================================================================
// Image Upload Section Component
// =============================================================================

interface ImageUploadProps {
  label: string;
  description: string;
  currentUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading: boolean;
  accept?: string;
}

function ImageUploadField({
  label,
  description,
  currentUrl,
  onUpload,
  onRemove,
  isUploading,
  accept = 'image/jpeg,image/png,image/webp,image/svg+xml',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Gecersiz dosya tipi. JPEG, PNG, WebP veya SVG yukleyiniz.');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Dosya boyutu 2MB\'dan kucuk olmalidir.');
        return;
      }

      await onUpload(file);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onUpload]
  );

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-semibold text-text-main">{label}</Label>
        <p className="mt-0.5 text-xs text-text-muted">{description}</p>
      </div>

      {currentUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          {/* Preview */}
          <div className="relative h-32 w-full overflow-hidden bg-white/5">
            <img
              src={currentUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity hover:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="text-white hover:bg-white/20"
                disabled={isUploading}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Degistir
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onRemove}
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                disabled={isUploading}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Kaldir
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all',
            isUploading
              ? 'cursor-not-allowed border-white/10 bg-white/[0.02]'
              : 'border-white/15 bg-white/[0.02] hover:border-accent-orange/40 hover:bg-accent-orange/5'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-accent-orange" />
              <span className="text-xs text-text-muted">Yukleniyor...</span>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <ImageIcon className="h-5 w-5 text-text-muted" />
              </div>
              <span className="text-xs font-medium text-text-muted">
                Gorsel yuklemek icin tiklayin
              </span>
              <span className="text-[10px] text-text-muted/60">
                JPEG, PNG, WebP, SVG &bull; Maks. 2MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// =============================================================================
// Mobile Panel Toggle (for mobile responsive)
// =============================================================================

interface PanelToggleProps {
  activePanel: 'editor' | 'preview';
  onToggle: (panel: 'editor' | 'preview') => void;
}

function PanelToggle({ activePanel, onToggle }: PanelToggleProps) {
  return (
    <div className="flex rounded-xl border border-white/10 bg-white/[0.02] p-1 lg:hidden">
      <button
        type="button"
        onClick={() => onToggle('editor')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
          activePanel === 'editor'
            ? 'bg-accent-orange/10 text-accent-orange'
            : 'text-text-muted hover:text-text-main'
        )}
      >
        <Settings2 className="h-4 w-4" />
        Duzenleyici
      </button>
      <button
        type="button"
        onClick={() => onToggle('preview')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
          activePanel === 'preview'
            ? 'bg-accent-orange/10 text-accent-orange'
            : 'text-text-muted hover:text-text-main'
        )}
      >
        <Smartphone className="h-4 w-4" />
        Onizleme
      </button>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function TemaPage() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [theme, setTheme] = useState<RestaurantTheme>(DEFAULT_THEME);
  const [restaurantName, setRestaurantName] = useState('Restoran Adiniz');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activePanel, setActivePanel] = useState<'editor' | 'preview'>('editor');

  // ---------------------------------------------------------------------------
  // Load existing theme on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function loadRestaurantTheme() {
      try {
        const supabase = createClient();

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Fetch restaurant data for the logged-in user
          const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select('name, theme, logo_url, cover_url')
            .eq('owner_id', user.id)
            .single();

          if (error) {
            // If no restaurant found, use defaults (may be new user)
            if (error.code !== 'PGRST116') {
              // PGRST116 = no rows returned, which is OK for new users
              throw error;
            }
          }

          if (restaurant) {
            setRestaurantName(restaurant.name || 'Restoran Adiniz');
            setTheme({ ...DEFAULT_THEME, ...(restaurant.theme as RestaurantTheme) });
            setLogoUrl(restaurant.logo_url);
            setCoverUrl(restaurant.cover_url);
          }
        }
      } catch (err) {
        // Silently fall back to defaults - common in development without Supabase
      } finally {
        setIsLoading(false);
      }
    }

    loadRestaurantTheme();
  }, []);

  // ---------------------------------------------------------------------------
  // Theme Change Handler
  // ---------------------------------------------------------------------------

  const handleThemeChange = useCallback((newTheme: RestaurantTheme) => {
    setTheme(newTheme);
    setHasUnsavedChanges(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Save Theme to Supabase
  // ---------------------------------------------------------------------------

  const handleSaveTheme = useCallback(async (themeToSave: RestaurantTheme) => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Oturumunuz sona ermis. Lutfen tekrar giris yapin.');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('restaurants')
        .update({
          theme: themeToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('owner_id', user.id);

      if (error) throw error;

      setHasUnsavedChanges(false);
      toast.success('Tema basariyla kaydedildi!', {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } catch (err) {
      toast.error('Tema kaydedilirken bir hata olustu. Lutfen tekrar deneyin.', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Image Upload Handlers
  // ---------------------------------------------------------------------------

  const uploadImage = useCallback(
    async (
      file: File,
      bucket: string,
      fieldName: 'logo_url' | 'cover_url'
    ): Promise<string | null> => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error('Oturumunuz sona ermis. Lutfen tekrar giris yapin.');
          return null;
        }

        // Generate unique file name
        const fileExt = file.name.split('.').pop() ?? 'jpg';
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // Update restaurant record
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({
            [fieldName]: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('owner_id', user.id);

        if (updateError) throw updateError;

        return publicUrl;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const handleLogoUpload = useCallback(
    async (file: File) => {
      setIsUploadingLogo(true);
      try {
        const url = await uploadImage(file, 'restaurant-logos', 'logo_url');
        if (url) {
          setLogoUrl(url);
          toast.success('Logo basariyla yuklendi!');
        }
      } catch {
        toast.error('Logo yuklenirken bir hata olustu.');
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [uploadImage]
  );

  const handleCoverUpload = useCallback(
    async (file: File) => {
      setIsUploadingCover(true);
      try {
        const url = await uploadImage(file, 'covers', 'cover_url');
        if (url) {
          setCoverUrl(url);
          toast.success('Kapak fotografi basariyla yuklendi!');
        }
      } catch {
        toast.error('Kapak fotografi yuklenirken bir hata olustu.');
      } finally {
        setIsUploadingCover(false);
      }
    },
    [uploadImage]
  );

  const handleRemoveLogo = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from('restaurants')
        .update({
          logo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('owner_id', user.id);

      setLogoUrl(null);
      toast.success('Logo kaldirildi.');
    } catch {
      toast.error('Logo kaldirilirken bir hata olustu.');
    }
  }, []);

  const handleRemoveCover = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from('restaurants')
        .update({
          cover_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('owner_id', user.id);

      setCoverUrl(null);
      toast.success('Kapak fotografi kaldirildi.');
    } catch {
      toast.error('Kapak fotografi kaldirilirken bir hata olustu.');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="h-8 w-8 animate-spin text-accent-orange" />
          <p className="text-sm text-text-muted">Tema ayarlari yukleniyor...</p>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col gap-4"
    >
      {/* ================================================================== */}
      {/* Page Header */}
      {/* ================================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-main sm:text-2xl">
            Tema ve Gorunum
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Restoraninizin QR menusunun gorunumunu ozellestirin
          </p>
        </div>

        {/* Save button (desktop) */}
        <div className="hidden items-center gap-3 sm:flex">
          {hasUnsavedChanges && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-amber-400"
            >
              Kaydedilmemis degisiklikler var
            </motion.span>
          )}
          <Button
            type="button"
            onClick={() => handleSaveTheme(theme)}
            disabled={isSaving}
            className="bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Kaydediliyor...' : 'Temayi Kaydet'}
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Mobile Panel Toggle */}
      {/* ================================================================== */}
      <PanelToggle activePanel={activePanel} onToggle={setActivePanel} />

      {/* ================================================================== */}
      {/* Split Panel Layout */}
      {/* ================================================================== */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* ============================================================== */}
        {/* Left Panel: Editor Controls */}
        {/* ============================================================== */}
        <div
          className={cn(
            'flex w-full flex-col gap-6 overflow-y-auto lg:w-[420px] lg:shrink-0',
            activePanel === 'editor' ? 'block' : 'hidden lg:block'
          )}
        >
          {/* -------------------------------------------------------------- */}
          {/* Image Uploads Section */}
          {/* -------------------------------------------------------------- */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10">
                <Upload className="h-4 w-4 text-accent-orange" />
              </div>
              Gorseller
            </h3>

            <div className="space-y-5">
              <ImageUploadField
                label="Restoran Logosu"
                description="Menu basliginda gorunecek logonuz (Onerilen: 200x200px)"
                currentUrl={logoUrl}
                onUpload={handleLogoUpload}
                onRemove={handleRemoveLogo}
                isUploading={isUploadingLogo}
              />

              <ImageUploadField
                label="Kapak Fotografi"
                description="Menu ust kisimda gorunecek arka plan gorseli (Onerilen: 1200x400px)"
                currentUrl={coverUrl}
                onUpload={handleCoverUpload}
                onRemove={handleRemoveCover}
                isUploading={isUploadingCover}
              />
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Theme Editor Component */}
          {/* -------------------------------------------------------------- */}
          <ThemeEditor
            theme={theme}
            onChange={handleThemeChange}
            onSave={handleSaveTheme}
            isSaving={isSaving}
          />
        </div>

        {/* ============================================================== */}
        {/* Right Panel: Live Preview */}
        {/* ============================================================== */}
        <div
          className={cn(
            'flex flex-1 flex-col items-center justify-start overflow-y-auto',
            activePanel === 'preview' ? 'block' : 'hidden lg:flex'
          )}
        >
          {/* Sticky container for centering */}
          <div className="sticky top-0 flex flex-col items-center py-4">
            <ThemePreview
              theme={theme}
              restaurantName={restaurantName}
            />

            {/* Preview info */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-[11px] text-text-muted/60">
                Degisiklikler anlik olarak yansitilir
              </p>

              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="text-[11px] font-medium text-amber-400">
                    Kaydedilmemis degisiklikler
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Mobile Save Button (fixed at bottom) */}
      {/* ================================================================== */}
      <div className="border-t border-white/10 pt-4 sm:hidden">
        <Button
          type="button"
          onClick={() => handleSaveTheme(theme)}
          disabled={isSaving}
          className="w-full bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Kaydediliyor...' : 'Temayi Kaydet'}
        </Button>
      </div>
    </motion.div>
  );
}
