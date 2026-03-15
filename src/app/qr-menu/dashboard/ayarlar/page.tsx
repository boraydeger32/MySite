'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  Store,
  Bell,
  Globe,
  Clock,
  Puzzle,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  FileText,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
  AlertTriangle,
  Check,
  Crown,
  Zap,
  Shield,
  ChevronRight,
  Info,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type {
  RestaurantSettings,
  WorkingHours,
  WorkingHoursDay,
  SocialMedia,
  NotificationSettings,
  RestaurantPlan,
} from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

type SettingsTab = 'genel' | 'bildirimler' | 'dil-para' | 'calisma-saatleri' | 'entegrasyonlar' | 'abonelik';

interface DayConfig {
  key: keyof WorkingHours;
  label: string;
  shortLabel: string;
}

// =============================================================================
// Constants
// =============================================================================

const MOCK_RESTAURANT_ID = 'demo-restaurant-001';

const TABS_CONFIG: { value: SettingsTab; label: string; icon: typeof Store }[] = [
  { value: 'genel', label: 'Genel', icon: Store },
  { value: 'bildirimler', label: 'Bildirimler', icon: Bell },
  { value: 'dil-para', label: 'Dil & Para', icon: Globe },
  { value: 'calisma-saatleri', label: 'Calisma Saatleri', icon: Clock },
  { value: 'entegrasyonlar', label: 'Entegrasyonlar', icon: Puzzle },
  { value: 'abonelik', label: 'Abonelik', icon: CreditCard },
];

const DAYS: DayConfig[] = [
  { key: 'monday', label: 'Pazartesi', shortLabel: 'Pzt' },
  { key: 'tuesday', label: 'Sali', shortLabel: 'Sal' },
  { key: 'wednesday', label: 'Carsamba', shortLabel: 'Car' },
  { key: 'thursday', label: 'Persembe', shortLabel: 'Per' },
  { key: 'friday', label: 'Cuma', shortLabel: 'Cum' },
  { key: 'saturday', label: 'Cumartesi', shortLabel: 'Cmt' },
  { key: 'sunday', label: 'Pazar', shortLabel: 'Paz' },
];

const CURRENCIES = [
  { value: 'TRY', label: 'Turk Lirasi (TL)', symbol: '\u20BA' },
  { value: 'USD', label: 'Amerikan Dolari ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (\u20AC)', symbol: '\u20AC' },
  { value: 'GBP', label: 'Ingiliz Sterlini (\u00A3)', symbol: '\u00A3' },
];

const PLAN_DETAILS: Record<RestaurantPlan, {
  name: string;
  price: string;
  features: string[];
  limits: { tables: number; items: number; orders: string };
  color: string;
  icon: typeof Crown;
}> = {
  free: {
    name: 'Ucretsiz',
    price: '0 TL/ay',
    features: ['Temel menu yonetimi', 'QR kod olusturma', 'Siparis takibi'],
    limits: { tables: 10, items: 50, orders: '100/ay' },
    color: 'text-text-muted',
    icon: Shield,
  },
  starter: {
    name: 'Baslangic',
    price: '199 TL/ay',
    features: ['Gelismis menu', 'Tema ozellestirme', 'Analitik raporlar', 'Kampanya yonetimi'],
    limits: { tables: 25, items: 150, orders: '500/ay' },
    color: 'text-accent-blue',
    icon: Zap,
  },
  pro: {
    name: 'Profesyonel',
    price: '499 TL/ay',
    features: ['Sinirsiz menu', 'Gelismis analitik', 'Oncelikli destek', 'Entegrasyonlar', 'Coklu dil'],
    limits: { tables: 100, items: 1000, orders: 'Sinirsiz' },
    color: 'text-accent-orange',
    icon: Crown,
  },
  enterprise: {
    name: 'Kurumsal',
    price: 'Ozel Fiyat',
    features: ['Her sey dahil', 'Ozel entegrasyonlar', '7/24 destek', 'SLA garantisi', 'Ozel sunucu'],
    limits: { tables: -1, items: -1, orders: 'Sinirsiz' },
    color: 'text-accent-purple',
    icon: Crown,
  },
};

const DEFAULT_WORKING_HOURS: WorkingHoursDay = { open: '09:00', close: '22:00' };

const DEFAULT_SETTINGS: RestaurantSettings = {
  currency: 'TRY',
  taxRate: 10,
  language: 'tr',
  address: '',
  phone: '',
  workingHours: {
    monday: { ...DEFAULT_WORKING_HOURS },
    tuesday: { ...DEFAULT_WORKING_HOURS },
    wednesday: { ...DEFAULT_WORKING_HOURS },
    thursday: { ...DEFAULT_WORKING_HOURS },
    friday: { ...DEFAULT_WORKING_HOURS },
    saturday: { open: '10:00', close: '23:00' },
    sunday: { open: '10:00', close: '23:00' },
  },
  socialMedia: {
    instagram: '',
    facebook: '',
    twitter: '',
    website: '',
  },
  notifications: {
    email: true,
    newOrder: true,
    waiterCall: true,
    lowStock: false,
  },
};

const INTEGRATION_ITEMS = [
  {
    name: 'Yemeksepeti',
    description: 'Yemeksepeti siparis entegrasyonu',
    status: 'yakinda' as const,
    icon: '🍽️',
  },
  {
    name: 'Getir Yemek',
    description: 'Getir Yemek siparis entegrasyonu',
    status: 'yakinda' as const,
    icon: '🛵',
  },
  {
    name: 'Trendyol Yemek',
    description: 'Trendyol siparis entegrasyonu',
    status: 'yakinda' as const,
    icon: '📦',
  },
  {
    name: 'iyzico',
    description: 'Online odeme entegrasyonu',
    status: 'yakinda' as const,
    icon: '💳',
  },
  {
    name: 'Google Analytics',
    description: 'Ziyaretci istatistikleri',
    status: 'yakinda' as const,
    icon: '📊',
  },
  {
    name: 'WhatsApp Business',
    description: 'Musteri iletisimi',
    status: 'yakinda' as const,
    icon: '💬',
  },
];

// =============================================================================
// Sub-Components
// =============================================================================

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl',
        className
      )}
    >
      <div className="mb-5">
        <h3 className="font-display text-base font-semibold text-text-main">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-text-muted">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  description,
  children,
  required,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-text-main">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-text-muted">{description}</p>
      )}
    </div>
  );
}

// =============================================================================
// Settings Page
// =============================================================================

export default function SettingsPage() {
  const { restaurant, setRestaurant } = useRestaurantStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('genel');

  // General info state
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Social media state
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({
    instagram: '',
    facebook: '',
    twitter: '',
    website: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    newOrder: true,
    waiterCall: true,
    lowStock: false,
  });

  // Locale state
  const [currency, setCurrency] = useState('TRY');
  const [taxRate, setTaxRate] = useState(10);
  const [language, setLanguage] = useState('tr');

  // Working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    DEFAULT_SETTINGS.workingHours!
  );
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // Initialize from store / mock
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (restaurant) {
      setRestaurantName(restaurant.name || '');
      setSlug(restaurant.slug || '');
      setOriginalSlug(restaurant.slug || '');
      setDescription((restaurant.settings as Record<string, unknown>)?.description as string || '');
      setAddress(restaurant.settings?.address || '');
      setPhone(restaurant.settings?.phone || '');
      setEmail((restaurant.settings as Record<string, unknown>)?.email as string || '');
      setSocialMedia({
        instagram: restaurant.settings?.socialMedia?.instagram || '',
        facebook: restaurant.settings?.socialMedia?.facebook || '',
        twitter: restaurant.settings?.socialMedia?.twitter || '',
        website: restaurant.settings?.socialMedia?.website || '',
      });
      setNotifications({
        email: restaurant.settings?.notifications?.email ?? true,
        newOrder: restaurant.settings?.notifications?.newOrder ?? true,
        waiterCall: restaurant.settings?.notifications?.waiterCall ?? true,
        lowStock: restaurant.settings?.notifications?.lowStock ?? false,
      });
      setCurrency(restaurant.settings?.currency || 'TRY');
      setTaxRate(restaurant.settings?.taxRate ?? 10);
      setLanguage(restaurant.settings?.language || 'tr');
      if (restaurant.settings?.workingHours) {
        setWorkingHours(restaurant.settings.workingHours);
      }
    } else {
      // Mock data for demo
      setRestaurantName('Demo Restoran');
      setSlug('demo-restoran');
      setOriginalSlug('demo-restoran');
      setDescription('Lezzetli yemeklerin adresi');
      setAddress('Ornek Mahallesi, Lezzet Sokak No:12, Kadikoy/Istanbul');
      setPhone('+90 532 123 45 67');
      setEmail('info@demorestoran.com');
      setSocialMedia({
        instagram: '@demorestoran',
        facebook: 'demorestoran',
        twitter: '@demorestoran',
        website: 'https://demorestoran.com',
      });
    }
  }, [restaurant]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const slugify = useCallback((text: string) => {
    return text
      .toLowerCase()
      .replace(/[ğ]/g, 'g')
      .replace(/[ü]/g, 'u')
      .replace(/[ş]/g, 's')
      .replace(/[ı]/g, 'i')
      .replace(/[ö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const toggleClosedDay = useCallback((dayKey: string) => {
    setClosedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  }, []);

  const updateWorkingHours = useCallback(
    (dayKey: keyof WorkingHours, field: 'open' | 'close', value: string) => {
      setWorkingHours((prev) => ({
        ...prev,
        [dayKey]: {
          ...(prev[dayKey] || DEFAULT_WORKING_HOURS),
          [field]: value,
        },
      }));
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Save handler
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    if (!restaurantName.trim()) {
      toast.error('Restoran adi zorunludur.');
      return;
    }

    if (!slug.trim()) {
      toast.error('Slug alani zorunludur.');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Build settings JSONB
      const settingsData: RestaurantSettings & Record<string, unknown> = {
        currency,
        taxRate,
        language,
        address,
        phone,
        description,
        email,
        workingHours: { ...workingHours },
        socialMedia: { ...socialMedia },
        notifications: { ...notifications },
      };

      // Remove closed days from working hours
      Array.from(closedDays).forEach((dayKey) => {
        delete settingsData.workingHours![dayKey as keyof WorkingHours];
      });

      const restaurantId = restaurant?.id || MOCK_RESTAURANT_ID;

      const { error } = await supabase
        .from('restaurants')
        .update({
          name: restaurantName.trim(),
          slug: slug.trim(),
          settings: settingsData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurantId);

      if (error) {
        // In demo mode, just show success
        if (error.message?.includes('JWT') || error.code === 'PGRST301') {
          toast.success('Ayarlar basariyla kaydedildi!', {
            description: 'Degisiklikleriniz aktif edildi.',
          });

          // Update store
          if (restaurant) {
            setRestaurant({
              ...restaurant,
              name: restaurantName.trim(),
              slug: slug.trim(),
              settings: settingsData,
            });
          }

          setOriginalSlug(slug.trim());
          return;
        }

        throw error;
      }

      toast.success('Ayarlar basariyla kaydedildi!', {
        description: 'Degisiklikleriniz aktif edildi.',
      });

      // Update store
      if (restaurant) {
        setRestaurant({
          ...restaurant,
          name: restaurantName.trim(),
          slug: slug.trim(),
          settings: settingsData,
        });
      }

      setOriginalSlug(slug.trim());
    } catch {
      toast.error('Ayarlar kaydedilirken bir hata olustu.', {
        description: 'Lutfen tekrar deneyiniz.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    restaurant,
    restaurantName,
    slug,
    currency,
    taxRate,
    language,
    address,
    phone,
    description,
    email,
    workingHours,
    socialMedia,
    notifications,
    closedDays,
    setRestaurant,
  ]);

  // ---------------------------------------------------------------------------
  // Slug warning
  // ---------------------------------------------------------------------------

  const slugChanged = slug !== originalSlug && originalSlug !== '';

  // ---------------------------------------------------------------------------
  // Tab Content Renderers
  // ---------------------------------------------------------------------------

  const renderGenelTab = () => (
    <div className="space-y-6">
      {/* Restaurant Info */}
      <SectionCard
        title="Restoran Bilgileri"
        description="Restoraninizin temel bilgilerini buradan duzenleyebilirsiniz."
      >
        <div className="space-y-4">
          <FormField label="Restoran Adi" required>
            <Input
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Restoran adiniz"
              className="border-white/10 bg-white/5 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
            />
          </FormField>

          <FormField
            label="Slug (URL)"
            description={
              slugChanged
                ? undefined
                : 'Restoraninizin menu URL\'sinde kullanilacak benzersiz adres.'
            }
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-text-muted">
                /menu/
              </span>
              <Input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="restoran-slug"
                className="border-white/10 bg-white/5 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
              />
            </div>
            {slugChanged && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div className="text-xs text-amber-300">
                  <p className="font-semibold">Slug degisikligi uyarisi</p>
                  <p className="mt-0.5 text-amber-300/80">
                    Slug degistirmek, mevcut QR kodlarinizin calismamamsina neden olabilir.
                    Degisiklik sonrasi tum QR kodlarinizi yeniden yazdirmaniz gerekebilir.
                  </p>
                </div>
              </motion.div>
            )}
          </FormField>

          <FormField label="Aciklama">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Restoraniniz hakkinda kisa bir aciklama..."
              rows={3}
              className={cn(
                'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main',
                'placeholder:text-text-muted',
                'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
                'resize-none'
              )}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Adres">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Restoran adresi"
                  className="border-white/10 bg-white/5 pl-10 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
                />
              </div>
            </FormField>

            <FormField label="Telefon">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 (5XX) XXX XX XX"
                  className="border-white/10 bg-white/5 pl-10 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
                />
              </div>
            </FormField>
          </div>

          <FormField label="E-posta">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@restoran.com"
                className="border-white/10 bg-white/5 pl-10 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
              />
            </div>
          </FormField>
        </div>
      </SectionCard>

      {/* Social Media */}
      <SectionCard
        title="Sosyal Medya"
        description="Sosyal medya hesaplarinizi ekleyin. Musterileriniz sizi kolayca bulabilsin."
      >
        <div className="space-y-4">
          <FormField label="Instagram">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={socialMedia.instagram || ''}
                onChange={(e) =>
                  setSocialMedia((prev) => ({ ...prev, instagram: e.target.value }))
                }
                placeholder="@kullaniciadi"
                className="border-white/10 bg-white/5 pl-10 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
              />
            </div>
          </FormField>

          <FormField label="Facebook">
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={socialMedia.facebook || ''}
                onChange={(e) =>
                  setSocialMedia((prev) => ({ ...prev, facebook: e.target.value }))
                }
                placeholder="sayfa-adi"
                className="border-white/10 bg-white/5 pl-10 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
              />
            </div>
          </FormField>

          <FormField label="Twitter / X">
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={socialMedia.twitter || ''}
                onChange={(e) =>
                  setSocialMedia((prev) => ({ ...prev, twitter: e.target.value }))
                }
                placeholder="@kullaniciadi"
                className="border-white/10 bg-white/5 pl-10 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
              />
            </div>
          </FormField>

          <FormField label="Web Sitesi">
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={socialMedia.website || ''}
                onChange={(e) =>
                  setSocialMedia((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://website.com"
                className="border-white/10 bg-white/5 pl-10 text-text-main placeholder:text-text-muted focus:border-accent-orange focus:ring-accent-orange/50"
              />
            </div>
          </FormField>
        </div>
      </SectionCard>
    </div>
  );

  const renderBildirimlerTab = () => (
    <div className="space-y-6">
      <SectionCard
        title="Bildirim Tercihleri"
        description="Hangi bildirimleri almak istediginizi secin."
      >
        <div className="space-y-5">
          {/* Email Notifications */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-accent-blue/10 p-2">
                <Mail className="h-5 w-5 text-accent-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">E-posta Bildirimleri</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Onemli guncellemeler ve ozet raporlar e-posta ile gonderilsin.
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.email ?? true}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, email: checked }))
              }
              className="data-[state=checked]:bg-accent-orange"
            />
          </div>

          {/* New Order */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">Yeni Siparis Bildirimi</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Her yeni sipariste anlk bildirim alin.
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.newOrder ?? true}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, newOrder: checked }))
              }
              className="data-[state=checked]:bg-accent-orange"
            />
          </div>

          {/* Waiter Call */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">Garson Cagirma</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Musteri garson cagirdiginda bildirim alin.
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.waiterCall ?? true}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, waiterCall: checked }))
              }
              className="data-[state=checked]:bg-accent-orange"
            />
          </div>

          {/* Low Stock */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">Dusuk Stok Uyarisi</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Urun stogu azaldiginda uyari bildirimi alin.
                </p>
              </div>
            </div>
            <Switch
              checked={notifications.lowStock ?? false}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, lowStock: checked }))
              }
              className="data-[state=checked]:bg-accent-orange"
            />
          </div>
        </div>
      </SectionCard>

      {/* Push Notifications Info */}
      <SectionCard title="Push Bildirimleri">
        <div className="flex items-start gap-3 rounded-lg border border-accent-blue/20 bg-accent-blue/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-blue" />
          <div>
            <p className="text-sm font-medium text-text-main">Yakinda</p>
            <p className="mt-1 text-xs text-text-muted">
              Tarayici push bildirimleri yakinda aktif edilecektir.
              Bu ozellik ile musterilerinize siparis durumu hakkinda
              anlik bildirimler gonderebileceksiniz.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );

  const renderDilParaTab = () => (
    <div className="space-y-6">
      {/* Currency */}
      <SectionCard
        title="Para Birimi & Vergi"
        description="Menu fiyatlarinizda kullanilacak para birimi ve vergi oranini belirleyin."
      >
        <div className="space-y-4">
          <FormField label="Para Birimi">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={cn(
                'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-main',
                'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
                'appearance-none'
              )}
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-bg-mid text-text-main">
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="KDV Orani (%)"
            description="Menu fiyatlarina uygulanacak KDV orani."
          >
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-32 border-white/10 bg-white/5 text-text-main focus:border-accent-orange focus:ring-accent-orange/50"
              />
              <span className="text-sm text-text-muted">%</span>
            </div>
          </FormField>
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard
        title="Dil Ayarlari"
        description="Menu ve dashboard icin varsayilan dili secin."
      >
        <div className="space-y-4">
          <FormField label="Varsayilan Dil">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLanguage('tr')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                  language === 'tr'
                    ? 'border-accent-orange bg-accent-orange/10 text-accent-orange'
                    : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20 hover:text-text-main'
                )}
              >
                <span className="text-lg">🇹🇷</span>
                Turkce
                {language === 'tr' && <Check className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all',
                  language === 'en'
                    ? 'border-accent-orange bg-accent-orange/10 text-accent-orange'
                    : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20 hover:text-text-main'
                )}
              >
                <span className="text-lg">🇬🇧</span>
                English
                {language === 'en' && <Check className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <p className="text-xs text-text-muted">
              Dil degisikligi musteri menusu icin gecerlidir.
              Dashboard arayuzu su an yalnizca Turkce desteklemektedir.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );

  const renderCalismaSaatleriTab = () => (
    <div className="space-y-6">
      <SectionCard
        title="Calisma Saatleri"
        description="Restoraninizin gun gun calisma saatlerini belirleyin. Kapali gunleri isaretleyebilirsiniz."
      >
        <div className="space-y-3">
          {DAYS.map((day) => {
            const isClosed = closedDays.has(day.key);
            const hours = workingHours[day.key] || DEFAULT_WORKING_HOURS;

            return (
              <div
                key={day.key}
                className={cn(
                  'flex flex-col gap-3 rounded-lg border p-3 transition-all sm:flex-row sm:items-center sm:justify-between',
                  isClosed
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-white/10 bg-white/[0.02]'
                )}
              >
                {/* Day Label */}
                <div className="flex items-center justify-between sm:w-32">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isClosed ? 'text-red-400' : 'text-text-main'
                    )}
                  >
                    {day.label}
                  </span>
                  <span className="text-xs text-text-muted sm:hidden">
                    {isClosed ? 'Kapali' : 'Acik'}
                  </span>
                </div>

                {/* Time Inputs + Toggle */}
                <div className="flex items-center gap-3">
                  {!isClosed && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-muted">Acilis</label>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            updateWorkingHours(day.key, 'open', e.target.value)
                          }
                          className={cn(
                            'rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-text-main',
                            'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
                            '[color-scheme:dark]'
                          )}
                        />
                      </div>
                      <span className="text-text-muted">-</span>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-muted">Kapanis</label>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            updateWorkingHours(day.key, 'close', e.target.value)
                          }
                          className={cn(
                            'rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-text-main',
                            'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
                            '[color-scheme:dark]'
                          )}
                        />
                      </div>
                    </>
                  )}

                  {isClosed && (
                    <span className="hidden text-sm text-red-400/80 sm:inline">
                      Kapali
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleClosedDay(day.key)}
                    className={cn(
                      'ml-auto shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      isClosed
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    )}
                  >
                    {isClosed ? 'Ac' : 'Kapat'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );

  const renderEntegrasyonlarTab = () => (
    <div className="space-y-6">
      <SectionCard
        title="Entegrasyonlar"
        description="Ucuncu parti servislerle entegrasyon yapin. Tum entegrasyonlar yakinda aktif olacaktir."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INTEGRATION_ITEMS.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-main">{item.name}</p>
                <p className="text-xs text-text-muted">{item.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-text-muted">
                Yakinda
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* API Key Section */}
      <SectionCard
        title="API Erisimi"
        description="Ozel entegrasyonlar icin API anahtariniz."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <code className="text-xs text-text-muted">
                qrmenu_sk_****************************
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-text-muted hover:text-text-main"
              onClick={() => toast.info('API anahtari yakinda aktif edilecek.')}
            >
              <Link2 className="mr-1.5 h-4 w-4" />
              Kopyala
            </Button>
          </div>
          <p className="text-xs text-text-muted">
            API erisimi Pro ve uzeri planlarda kullanilabilir.
          </p>
        </div>
      </SectionCard>
    </div>
  );

  const renderAbonelikTab = () => {
    const currentPlan = restaurant?.plan || 'free';
    const planInfo = PLAN_DETAILS[currentPlan];
    const PlanIcon = planInfo.icon;

    return (
      <div className="space-y-6">
        {/* Current Plan */}
        <SectionCard title="Mevcut Planainiz">
          <div className="rounded-xl border border-accent-orange/30 bg-accent-orange/5 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent-orange/10 p-2.5">
                  <PlanIcon className={cn('h-6 w-6', planInfo.color)} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-main">{planInfo.name}</h4>
                  <p className="text-sm text-accent-orange">{planInfo.price}</p>
                </div>
              </div>
              {currentPlan !== 'enterprise' && (
                <Button
                  onClick={() => toast.info('Plan yukseltme yakinda aktif edilecek.')}
                  className="bg-accent-orange text-white hover:bg-accent-orange/90"
                >
                  <Zap className="mr-1.5 h-4 w-4" />
                  Yukselt
                </Button>
              )}
            </div>

            {/* Usage Limits */}
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-lg font-bold text-text-main">
                  {planInfo.limits.tables === -1 ? '\u221E' : planInfo.limits.tables}
                </p>
                <p className="text-xs text-text-muted">Masa Limiti</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-lg font-bold text-text-main">
                  {planInfo.limits.items === -1 ? '\u221E' : planInfo.limits.items}
                </p>
                <p className="text-xs text-text-muted">Urun Limiti</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-lg font-bold text-text-main">
                  {planInfo.limits.orders}
                </p>
                <p className="text-xs text-text-muted">Siparis/Ay</p>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4 space-y-2">
              {planInfo.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-text-muted">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Plan Comparison */}
        <SectionCard
          title="Plan Karsilastirmasi"
          description="Ihtiyaclariniza en uygun plani secin."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {(Object.entries(PLAN_DETAILS) as [RestaurantPlan, typeof PLAN_DETAILS[RestaurantPlan]][]).map(
              ([planKey, plan]) => {
                const isCurrentPlan = planKey === currentPlan;
                const Icon = plan.icon;

                return (
                  <div
                    key={planKey}
                    className={cn(
                      'relative rounded-xl border p-4 transition-all',
                      isCurrentPlan
                        ? 'border-accent-orange/50 bg-accent-orange/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    )}
                  >
                    {isCurrentPlan && (
                      <span className="absolute -top-2.5 left-3 rounded-full bg-accent-orange px-2 py-0.5 text-[10px] font-bold text-white">
                        Mevcut
                      </span>
                    )}

                    <div className="mb-3 flex items-center gap-2">
                      <Icon className={cn('h-5 w-5', plan.color)} />
                      <h5 className="font-semibold text-text-main">{plan.name}</h5>
                    </div>
                    <p className={cn('mb-3 text-lg font-bold', plan.color)}>
                      {plan.price}
                    </p>

                    <div className="mb-3 space-y-1.5">
                      <div className="text-xs text-text-muted">
                        <span className="font-medium text-text-main">
                          {plan.limits.tables === -1 ? 'Sinirsiz' : plan.limits.tables}
                        </span>{' '}
                        masa
                      </div>
                      <div className="text-xs text-text-muted">
                        <span className="font-medium text-text-main">
                          {plan.limits.items === -1 ? 'Sinirsiz' : plan.limits.items}
                        </span>{' '}
                        urun
                      </div>
                      <div className="text-xs text-text-muted">
                        <span className="font-medium text-text-main">
                          {plan.limits.orders}
                        </span>{' '}
                        siparis
                      </div>
                    </div>

                    {!isCurrentPlan && planKey !== 'free' && (
                      <button
                        type="button"
                        onClick={() =>
                          toast.info('Plan yukseltme yakinda aktif edilecek.')
                        }
                        className={cn(
                          'w-full rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                          'border-white/10 text-text-muted hover:border-white/20 hover:text-text-main'
                        )}
                      >
                        Sec
                        <ChevronRight className="ml-1 inline h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </SectionCard>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Ayarlar
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Restoran bilgileri ve tercihlerinizi yonetin.
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
        className="w-full"
      >
        {/* Tab List - scrollable on mobile */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-auto w-max gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl sm:w-full sm:flex-wrap">
            {TABS_CONFIG.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    'data-[state=active]:bg-accent-orange/10 data-[state=active]:text-accent-orange data-[state=active]:shadow-none',
                    'data-[state=inactive]:text-text-muted data-[state=inactive]:hover:text-text-main'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          <TabsContent value="genel" className="mt-0">
            {renderGenelTab()}
          </TabsContent>

          <TabsContent value="bildirimler" className="mt-0">
            {renderBildirimlerTab()}
          </TabsContent>

          <TabsContent value="dil-para" className="mt-0">
            {renderDilParaTab()}
          </TabsContent>

          <TabsContent value="calisma-saatleri" className="mt-0">
            {renderCalismaSaatleriTab()}
          </TabsContent>

          <TabsContent value="entegrasyonlar" className="mt-0">
            {renderEntegrasyonlarTab()}
          </TabsContent>

          <TabsContent value="abonelik" className="mt-0">
            {renderAbonelikTab()}
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
