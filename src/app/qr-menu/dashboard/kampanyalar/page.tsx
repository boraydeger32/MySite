'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Ticket,
  PackagePlus,
  Clock,
  Megaphone,
  Calendar,
  Percent,
  DollarSign,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Copy,
  MoreVertical,
  Tag,
  Users,
  TrendingUp,
  ChevronDown,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type {
  Campaign,
  CampaignType,
  DiscountType,
  CampaignConfig,
  CampaignInsert,
} from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

type FilterType = 'all' | CampaignType;
type FilterStatus = 'all' | 'active' | 'inactive';

// =============================================================================
// Constants
// =============================================================================

const MOCK_RESTAURANT_ID = 'demo-restaurant-001';

const CAMPAIGN_TYPE_CONFIG: Record<
  CampaignType,
  { label: string; icon: typeof Ticket; color: string; bg: string; border: string; description: string }
> = {
  coupon: {
    label: 'Indirim Kuponu',
    icon: Ticket,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Yuzdelik veya sabit tutar indirimi',
  },
  combo: {
    label: 'Combo Menu',
    icon: PackagePlus,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    description: 'Birden fazla urun birlikte indirimli',
  },
  happy_hour: {
    label: 'Mutlu Saat',
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Belirli saatlerde gecerli indirim',
  },
  banner: {
    label: 'Banner Duyuru',
    icon: Megaphone,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    description: 'Menu uzerinde gorsel duyuru banneri',
  },
};

const DAYS_OF_WEEK = [
  { value: 'pazartesi', label: 'Pzt' },
  { value: 'sali', label: 'Sal' },
  { value: 'carsamba', label: 'Car' },
  { value: 'persembe', label: 'Per' },
  { value: 'cuma', label: 'Cum' },
  { value: 'cumartesi', label: 'Cmt' },
  { value: 'pazar', label: 'Paz' },
];

type BannerPosition = 'top' | 'bottom' | 'popup';

const BANNER_POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: 'top', label: 'Ust' },
  { value: 'bottom', label: 'Alt' },
  { value: 'popup', label: 'Popup' },
];

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    restaurant_id: MOCK_RESTAURANT_ID,
    type: 'coupon',
    name: 'Hosgeldin Indirimi',
    description: 'Ilk siparise ozel %15 indirim kuponu.',
    discount_type: 'percentage',
    discount_value: 15,
    start_date: '2026-03-01T00:00:00Z',
    end_date: '2026-04-30T23:59:59Z',
    usage_limit: 500,
    usage_count: 128,
    is_active: true,
    config: { minOrderAmount: 100 },
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'camp-2',
    restaurant_id: MOCK_RESTAURANT_ID,
    type: 'combo',
    name: 'Aile Combo',
    description: '2 Ana Yemek + 2 Icecek + 1 Tatli ozel fiyatla.',
    discount_type: 'fixed',
    discount_value: 50,
    start_date: '2026-03-10T00:00:00Z',
    end_date: '2026-06-10T23:59:59Z',
    usage_limit: 200,
    usage_count: 45,
    is_active: true,
    config: {
      items: ['Izgara Kofte', 'Adana Kebap', 'Kola', 'Ayran', 'Tiramisu'],
      comboPrice: 350,
    },
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'camp-3',
    restaurant_id: MOCK_RESTAURANT_ID,
    type: 'happy_hour',
    name: 'Hafta Ici Mutlu Saat',
    description: 'Hafta ici 14:00-17:00 arasi tum iceceklerde %25 indirim.',
    discount_type: 'percentage',
    discount_value: 25,
    start_date: '2026-03-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    usage_limit: null,
    usage_count: 312,
    is_active: true,
    config: {
      startTime: '14:00',
      endTime: '17:00',
      daysOfWeek: ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma'],
      applicableCategories: ['Icecekler'],
    },
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'camp-4',
    restaurant_id: MOCK_RESTAURANT_ID,
    type: 'banner',
    name: 'Yaz Menusu Duyurusu',
    description: 'Yeni yaz menumuzu kesfetmek icin tiklayin!',
    discount_type: null,
    discount_value: null,
    start_date: '2026-03-15T00:00:00Z',
    end_date: '2026-09-15T23:59:59Z',
    usage_limit: null,
    usage_count: 0,
    is_active: false,
    config: {
      imageUrl: null,
      linkUrl: null,
      position: 'top',
    },
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 'camp-5',
    restaurant_id: MOCK_RESTAURANT_ID,
    type: 'coupon',
    name: 'Dogum Gunu Indirimi',
    description: 'Dogum gununuze ozel 75 TL indirim.',
    discount_type: 'fixed',
    discount_value: 75,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-12-31T23:59:59Z',
    usage_limit: 100,
    usage_count: 22,
    is_active: true,
    config: { minOrderAmount: 200 },
    created_at: '2026-01-01T10:00:00Z',
  },
];

// =============================================================================
// Helpers
// =============================================================================

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateForInput(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().slice(0, 16);
}

function getCampaignStatus(campaign: Campaign): { label: string; color: string; bg: string } {
  if (!campaign.is_active) {
    return { label: 'Pasif', color: 'text-text-muted', bg: 'bg-white/5' };
  }
  const now = new Date();
  if (campaign.end_date && new Date(campaign.end_date) < now) {
    return { label: 'Suresi Doldu', color: 'text-red-400', bg: 'bg-red-500/10' };
  }
  if (campaign.start_date && new Date(campaign.start_date) > now) {
    return { label: 'Planli', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
  }
  return { label: 'Aktif', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
}

function getUsagePercentage(campaign: Campaign): number | null {
  if (!campaign.usage_limit) return null;
  return Math.min(100, Math.round((campaign.usage_count / campaign.usage_limit) * 100));
}

// =============================================================================
// Sub-Component: KPI Summary Cards
// =============================================================================

function CampaignKPIs({ campaigns }: { campaigns: Campaign[] }) {
  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.is_active).length;
    const totalUsage = campaigns.reduce((acc, c) => acc + c.usage_count, 0);
    const couponCount = campaigns.filter((c) => c.type === 'coupon').length;
    const avgDiscount =
      campaigns
        .filter((c) => c.discount_value && c.discount_type === 'percentage')
        .reduce((acc, c) => acc + (c.discount_value ?? 0), 0) /
        (campaigns.filter((c) => c.discount_value && c.discount_type === 'percentage').length || 1);

    return [
      {
        label: 'Toplam Kampanya',
        value: campaigns.length,
        icon: Tag,
        color: 'text-accent-orange',
        bg: 'bg-accent-orange/10',
      },
      {
        label: 'Aktif Kampanya',
        value: active,
        icon: TrendingUp,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
      {
        label: 'Toplam Kullanim',
        value: totalUsage,
        icon: Users,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
      },
      {
        label: 'Kupon Sayisi',
        value: couponCount,
        icon: Ticket,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10',
      },
    ];
  }, [campaigns]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
                <Icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted">{stat.label}</p>
                <p className="font-display text-xl font-bold text-text-main">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Sub-Component: Campaign Card
// =============================================================================

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onToggleActive: (campaign: Campaign) => void;
  onDuplicate: (campaign: Campaign) => void;
}

function CampaignCard({ campaign, onEdit, onDelete, onToggleActive, onDuplicate }: CampaignCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const typeConfig = CAMPAIGN_TYPE_CONFIG[campaign.type];
  const status = getCampaignStatus(campaign);
  const usagePercent = getUsagePercentage(campaign);
  const Icon = typeConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl border bg-white/5 p-5 backdrop-blur-xl transition-all duration-300',
        campaign.is_active
          ? 'border-white/10 hover:border-white/20'
          : 'border-white/5 opacity-70 hover:opacity-100'
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              typeConfig.bg
            )}
          >
            <Icon className={cn('h-5 w-5', typeConfig.color)} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-text-main">
              {campaign.name}
            </h3>
            <p className="text-xs text-text-muted">{typeConfig.label}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex shrink-0 items-center gap-1">
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', status.bg, status.color)}>
            {status.label}
          </span>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            aria-label="Kampanya secenekleri"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-white/10 bg-bg-dark/95 p-1 shadow-xl backdrop-blur-xl"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(campaign);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-main transition-colors hover:bg-white/10"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Duzenle
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicate(campaign);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-main transition-colors hover:bg-white/10"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Kopyala
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleActive(campaign);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-main transition-colors hover:bg-white/10"
                  >
                    {campaign.is_active ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Pasife Al
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Aktif Et
                      </>
                    )}
                  </button>
                  <div className="my-1 border-t border-white/5" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(campaign);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Sil
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="mt-3 line-clamp-2 text-sm text-text-muted">{campaign.description}</p>
      )}

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Discount Info */}
        {campaign.discount_value != null && campaign.discount_type && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            {campaign.discount_type === 'percentage' ? (
              <Percent className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>
              {campaign.discount_type === 'percentage'
                ? `%${campaign.discount_value} indirim`
                : `${campaign.discount_value} TL indirim`}
            </span>
          </div>
        )}

        {/* Combo Price */}
        {campaign.type === 'combo' && campaign.config.comboPrice && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Tag className="h-3.5 w-3.5 text-violet-400" />
            <span>{campaign.config.comboPrice} TL combo fiyat</span>
          </div>
        )}

        {/* Happy Hour Times */}
        {campaign.type === 'happy_hour' && campaign.config.startTime && campaign.config.endTime && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {campaign.config.startTime} - {campaign.config.endTime}
            </span>
          </div>
        )}

        {/* Date Range */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Calendar className="h-3.5 w-3.5 text-sky-400" />
          <span>
            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
          </span>
        </div>

        {/* Usage */}
        {campaign.usage_limit != null && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Users className="h-3.5 w-3.5 text-accent-orange" />
            <span>
              {campaign.usage_count}/{campaign.usage_limit} kullanim
            </span>
          </div>
        )}
      </div>

      {/* Usage Progress Bar */}
      {usagePercent != null && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                usagePercent >= 90 ? 'bg-red-400' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
              )}
            />
          </div>
          <p className="mt-1 text-right text-[10px] text-text-muted">%{usagePercent} kullanildi</p>
        </div>
      )}

      {/* Happy Hour Days */}
      {campaign.type === 'happy_hour' && campaign.config.daysOfWeek && campaign.config.daysOfWeek.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {DAYS_OF_WEEK.map((day) => (
            <span
              key={day.value}
              className={cn(
                'rounded-md px-2 py-0.5 text-[10px] font-medium',
                campaign.config.daysOfWeek?.includes(day.value)
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-white/5 text-text-muted/50'
              )}
            >
              {day.label}
            </span>
          ))}
        </div>
      )}

      {/* Combo Items */}
      {campaign.type === 'combo' && campaign.config.items && campaign.config.items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {campaign.config.items.map((item, idx) => (
            <span
              key={idx}
              className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Banner Position */}
      {campaign.type === 'banner' && campaign.config.position && (
        <div className="mt-3">
          <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
            Konum: {BANNER_POSITIONS.find((p) => p.value === campaign.config.position)?.label ?? campaign.config.position}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// Sub-Component: Campaign Form Modal
// =============================================================================

interface CampaignFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CampaignInsert) => void;
  editingCampaign?: Campaign | null;
}

function CampaignFormModal({ open, onOpenChange, onSubmit, editingCampaign }: CampaignFormModalProps) {
  const [campaignType, setCampaignType] = useState<CampaignType>(editingCampaign?.type ?? 'coupon');
  const [name, setName] = useState(editingCampaign?.name ?? '');
  const [description, setDescription] = useState(editingCampaign?.description ?? '');
  const [discountType, setDiscountType] = useState<DiscountType>(editingCampaign?.discount_type ?? 'percentage');
  const [discountValue, setDiscountValue] = useState(editingCampaign?.discount_value?.toString() ?? '');
  const [startDate, setStartDate] = useState(formatDateForInput(editingCampaign?.start_date ?? null));
  const [endDate, setEndDate] = useState(formatDateForInput(editingCampaign?.end_date ?? null));
  const [usageLimit, setUsageLimit] = useState(editingCampaign?.usage_limit?.toString() ?? '');
  const [isActive, setIsActive] = useState(editingCampaign?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Config state
  const [minOrderAmount, setMinOrderAmount] = useState(editingCampaign?.config.minOrderAmount?.toString() ?? '');
  const [comboItems, setComboItems] = useState(editingCampaign?.config.items?.join(', ') ?? '');
  const [comboPrice, setComboPrice] = useState(editingCampaign?.config.comboPrice?.toString() ?? '');
  const [happyHourStart, setHappyHourStart] = useState(editingCampaign?.config.startTime ?? '14:00');
  const [happyHourEnd, setHappyHourEnd] = useState(editingCampaign?.config.endTime ?? '17:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(editingCampaign?.config.daysOfWeek ?? []);
  const [applicableCategories, setApplicableCategories] = useState(
    editingCampaign?.config.applicableCategories?.join(', ') ?? ''
  );
  const [bannerPosition, setBannerPosition] = useState<BannerPosition>(editingCampaign?.config.position ?? 'top');
  const [bannerImageUrl, setBannerImageUrl] = useState(editingCampaign?.config.imageUrl ?? '');
  const [bannerLinkUrl, setBannerLinkUrl] = useState(editingCampaign?.config.linkUrl ?? '');

  // Reset form when opening
  useEffect(() => {
    if (open) {
      if (editingCampaign) {
        setCampaignType(editingCampaign.type);
        setName(editingCampaign.name);
        setDescription(editingCampaign.description ?? '');
        setDiscountType(editingCampaign.discount_type ?? 'percentage');
        setDiscountValue(editingCampaign.discount_value?.toString() ?? '');
        setStartDate(formatDateForInput(editingCampaign.start_date));
        setEndDate(formatDateForInput(editingCampaign.end_date));
        setUsageLimit(editingCampaign.usage_limit?.toString() ?? '');
        setIsActive(editingCampaign.is_active);
        setMinOrderAmount(editingCampaign.config.minOrderAmount?.toString() ?? '');
        setComboItems(editingCampaign.config.items?.join(', ') ?? '');
        setComboPrice(editingCampaign.config.comboPrice?.toString() ?? '');
        setHappyHourStart(editingCampaign.config.startTime ?? '14:00');
        setHappyHourEnd(editingCampaign.config.endTime ?? '17:00');
        setSelectedDays(editingCampaign.config.daysOfWeek ?? []);
        setApplicableCategories(editingCampaign.config.applicableCategories?.join(', ') ?? '');
        setBannerPosition(editingCampaign.config.position ?? 'top');
        setBannerImageUrl(editingCampaign.config.imageUrl ?? '');
        setBannerLinkUrl(editingCampaign.config.linkUrl ?? '');
      } else {
        setCampaignType('coupon');
        setName('');
        setDescription('');
        setDiscountType('percentage');
        setDiscountValue('');
        setStartDate('');
        setEndDate('');
        setUsageLimit('');
        setIsActive(true);
        setMinOrderAmount('');
        setComboItems('');
        setComboPrice('');
        setHappyHourStart('14:00');
        setHappyHourEnd('17:00');
        setSelectedDays([]);
        setApplicableCategories('');
        setBannerPosition('top');
        setBannerImageUrl('');
        setBannerLinkUrl('');
      }
      setErrors({});
    }
  }, [open, editingCampaign]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Kampanya adi zorunludur.';
    }

    if (campaignType !== 'banner') {
      if (!discountValue.trim()) {
        newErrors.discountValue = 'Indirim degeri zorunludur.';
      } else {
        const val = parseFloat(discountValue);
        if (isNaN(val) || val <= 0) {
          newErrors.discountValue = 'Gecerli bir indirim degeri giriniz.';
        }
        if (discountType === 'percentage' && val > 100) {
          newErrors.discountValue = 'Yuzde degeri 100\'den buyuk olamaz.';
        }
      }
    }

    if (campaignType === 'combo') {
      if (!comboItems.trim()) {
        newErrors.comboItems = 'Combo urunleri girilmelidir.';
      }
      if (comboPrice.trim() && (isNaN(parseFloat(comboPrice)) || parseFloat(comboPrice) <= 0)) {
        newErrors.comboPrice = 'Gecerli bir combo fiyati giriniz.';
      }
    }

    if (campaignType === 'happy_hour') {
      if (!happyHourStart || !happyHourEnd) {
        newErrors.happyHourTime = 'Baslangic ve bitis saati zorunludur.';
      }
      if (selectedDays.length === 0) {
        newErrors.selectedDays = 'En az bir gun secilmelidir.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, campaignType, discountValue, discountType, comboItems, comboPrice, happyHourStart, happyHourEnd, selectedDays]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const config: CampaignConfig = {};

      if (campaignType === 'coupon') {
        if (minOrderAmount.trim()) {
          config.minOrderAmount = parseFloat(minOrderAmount);
        }
      } else if (campaignType === 'combo') {
        config.items = comboItems
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (comboPrice.trim()) {
          config.comboPrice = parseFloat(comboPrice);
        }
      } else if (campaignType === 'happy_hour') {
        config.startTime = happyHourStart;
        config.endTime = happyHourEnd;
        config.daysOfWeek = selectedDays;
        if (applicableCategories.trim()) {
          config.applicableCategories = applicableCategories
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (campaignType === 'banner') {
        config.position = bannerPosition;
        config.imageUrl = bannerImageUrl.trim() || null;
        config.linkUrl = bannerLinkUrl.trim() || null;
      }

      const campaignData: CampaignInsert = {
        restaurant_id: MOCK_RESTAURANT_ID,
        type: campaignType,
        name: name.trim(),
        description: description.trim() || null,
        discount_type: campaignType !== 'banner' ? discountType : null,
        discount_value: campaignType !== 'banner' && discountValue.trim() ? parseFloat(discountValue) : null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        usage_limit: usageLimit.trim() ? parseInt(usageLimit, 10) : null,
        usage_count: editingCampaign?.usage_count ?? 0,
        is_active: isActive,
        config,
      };

      onSubmit(campaignData);
      onOpenChange(false);
    },
    [
      validate,
      campaignType,
      name,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      usageLimit,
      isActive,
      minOrderAmount,
      comboItems,
      comboPrice,
      happyHourStart,
      happyHourEnd,
      selectedDays,
      applicableCategories,
      bannerPosition,
      bannerImageUrl,
      bannerLinkUrl,
      editingCampaign,
      onSubmit,
      onOpenChange,
    ]
  );

  const toggleDay = useCallback((day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }, []);

  const inputClass =
    'border-white/10 bg-white/5 text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-text-main">
            {editingCampaign ? 'Kampanyayi Duzenle' : 'Yeni Kampanya Olustur'}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            {editingCampaign
              ? 'Kampanya bilgilerini guncelleyin.'
              : 'Kampanya tipini secin ve detaylari doldurun.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campaign Type Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Kampanya Tipi</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CAMPAIGN_TYPE_CONFIG) as [CampaignType, typeof CAMPAIGN_TYPE_CONFIG[CampaignType]][]).map(
                ([type, config]) => {
                  const TypeIcon = config.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCampaignType(type)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all duration-200',
                        campaignType === type
                          ? cn(config.border, config.bg, config.color)
                          : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20 hover:bg-white/5'
                      )}
                    >
                      <TypeIcon className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium">{config.label}</p>
                        <p className="mt-0.5 text-[10px] opacity-70">{config.description}</p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">
              Kampanya Adi <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="orn. Hosgeldin Indirimi"
              className={cn(inputClass, errors.name && 'border-red-500/50')}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Aciklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kampanya aciklamasi..."
              rows={2}
              className={cn(
                'w-full resize-none rounded-lg border px-3 py-2 text-sm backdrop-blur-sm transition-all duration-300',
                'focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
                inputClass
              )}
            />
          </div>

          {/* Discount Config (not for banner) */}
          {campaignType !== 'banner' && (
            <div className="flex flex-col gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Indirim Ayarlari</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all',
                    discountType === 'percentage'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20'
                  )}
                >
                  <Percent className="h-3.5 w-3.5" />
                  Yuzde
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all',
                    discountType === 'fixed'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20'
                  )}
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  Sabit Tutar
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">
                  Indirim Degeri <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={discountType === 'percentage' ? 100 : undefined}
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => {
                      setDiscountValue(e.target.value);
                      if (errors.discountValue) setErrors((prev) => ({ ...prev, discountValue: '' }));
                    }}
                    placeholder={discountType === 'percentage' ? '15' : '50'}
                    className={cn(inputClass, 'pr-10', errors.discountValue && 'border-red-500/50')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                    {discountType === 'percentage' ? '%' : 'TL'}
                  </span>
                </div>
                {errors.discountValue && <p className="text-xs text-red-400">{errors.discountValue}</p>}
              </div>
            </div>
          )}

          {/* Coupon-specific: Min Order Amount */}
          {campaignType === 'coupon' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Minimum Siparis Tutari (TL)</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="orn. 100"
                className={inputClass}
              />
              <p className="text-[10px] text-text-muted/70">Bos birakilirsa minimum tutar sartii aranmaz.</p>
            </div>
          )}

          {/* Combo-specific fields */}
          {campaignType === 'combo' && (
            <div className="flex flex-col gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Combo Detaylari</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">
                  Combo Urunleri <span className="text-red-400">*</span>
                </label>
                <Input
                  value={comboItems}
                  onChange={(e) => {
                    setComboItems(e.target.value);
                    if (errors.comboItems) setErrors((prev) => ({ ...prev, comboItems: '' }));
                  }}
                  placeholder="Urunleri virgul ile ayirin"
                  className={cn(inputClass, errors.comboItems && 'border-red-500/50')}
                />
                {errors.comboItems && <p className="text-xs text-red-400">{errors.comboItems}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">Combo Fiyati (TL)</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={comboPrice}
                  onChange={(e) => {
                    setComboPrice(e.target.value);
                    if (errors.comboPrice) setErrors((prev) => ({ ...prev, comboPrice: '' }));
                  }}
                  placeholder="orn. 350"
                  className={cn(inputClass, errors.comboPrice && 'border-red-500/50')}
                />
                {errors.comboPrice && <p className="text-xs text-red-400">{errors.comboPrice}</p>}
              </div>
            </div>
          )}

          {/* Happy Hour-specific fields */}
          {campaignType === 'happy_hour' && (
            <div className="flex flex-col gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Mutlu Saat Ayarlari</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Baslangic Saati <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="time"
                    value={happyHourStart}
                    onChange={(e) => setHappyHourStart(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Bitis Saati <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="time"
                    value={happyHourEnd}
                    onChange={(e) => setHappyHourEnd(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              {errors.happyHourTime && <p className="text-xs text-red-400">{errors.happyHourTime}</p>}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">
                  Gecerli Gunler <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                        selectedDays.includes(day.value)
                          ? 'border-amber-500/30 bg-amber-500/15 text-amber-400'
                          : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20'
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {errors.selectedDays && <p className="text-xs text-red-400">{errors.selectedDays}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">Gecerli Kategoriler</label>
                <Input
                  value={applicableCategories}
                  onChange={(e) => setApplicableCategories(e.target.value)}
                  placeholder="orn. Icecekler, Tatlilar"
                  className={inputClass}
                />
                <p className="text-[10px] text-text-muted/70">Virgul ile ayirin. Bos birakilirsa tum menude gecerlidir.</p>
              </div>
            </div>
          )}

          {/* Banner-specific fields */}
          {campaignType === 'banner' && (
            <div className="flex flex-col gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Banner Ayarlari</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">Konum</label>
                <div className="flex gap-2">
                  {BANNER_POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setBannerPosition(pos.value)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                        bannerPosition === pos.value
                          ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                          : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20'
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">
                  <ImageIcon className="mr-1 inline h-3 w-3" />
                  Gorsel URL
                </label>
                <Input
                  type="url"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">
                  <LinkIcon className="mr-1 inline h-3 w-3" />
                  Yonlendirme URL
                </label>
                <Input
                  type="url"
                  value={bannerLinkUrl}
                  onChange={(e) => setBannerLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Baslangic Tarihi</label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Bitis Tarihi</label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Usage Limit */}
          {campaignType !== 'banner' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Kullanim Limiti</label>
              <Input
                type="number"
                min={0}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Sinirsiz icin bos birakin"
                className={inputClass}
              />
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div>
              <p className="text-sm font-medium text-text-main">Kampanya Durumu</p>
              <p className="text-xs text-text-muted">
                {isActive ? 'Kampanya aktif ve musteri menusunde gorunur.' : 'Kampanya pasif ve gorunmez.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                isActive ? 'bg-emerald-500' : 'bg-white/10'
              )}
              role="switch"
              aria-checked={isActive}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  isActive && 'translate-x-5'
                )}
              />
            </button>
          </div>

          {/* Footer Buttons */}
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
              {editingCampaign ? 'Guncelle' : 'Olustur'}
            </motion.button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Sub-Component: Delete Confirmation Dialog
// =============================================================================

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  campaignName: string;
}

function DeleteConfirmDialog({ open, onOpenChange, onConfirm, campaignName }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-text-main">Kampanyayi Sil</DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            Bu islemi geri alamazsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-text-main">
            <strong>&quot;{campaignName}&quot;</strong> kampanyasi kalici olarak silinecektir.
          </p>
        </div>

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
            type="button"
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

// =============================================================================
// Main Page Component
// =============================================================================

export default function KampanyalarPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Supabase Fetch (with fallback to mock data)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function fetchCampaigns() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('restaurant_id', MOCK_RESTAURANT_ID)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setCampaigns(data as Campaign[]);
        }
      } catch {
        // Supabase not configured or no data — keep mock data
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  // ---------------------------------------------------------------------------
  // Filtered & Searched Campaigns
  // ---------------------------------------------------------------------------

  const filteredCampaigns = useMemo(() => {
    let result = campaigns;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((c) => c.type === filterType);
    }

    // Status filter
    if (filterStatus === 'active') {
      result = result.filter((c) => c.is_active);
    } else if (filterStatus === 'inactive') {
      result = result.filter((c) => !c.is_active);
    }

    return result;
  }, [campaigns, searchQuery, filterType, filterStatus]);

  // ---------------------------------------------------------------------------
  // CRUD Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(
    async (data: CampaignInsert) => {
      const newCampaign: Campaign = {
        ...data,
        id: `camp-${Date.now()}`,
        created_at: new Date().toISOString(),
        discount_type: data.discount_type ?? null,
        discount_value: data.discount_value ?? null,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
        usage_limit: data.usage_limit ?? null,
        usage_count: data.usage_count ?? 0,
        is_active: data.is_active ?? true,
        config: data.config ?? {},
        description: data.description ?? null,
      };

      // Try Supabase insert
      try {
        const supabase = createClient();
        const { data: inserted, error } = await supabase
          .from('campaigns')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        if (inserted) {
          setCampaigns((prev) => [inserted as Campaign, ...prev]);
          toast.success('Kampanya olusturuldu!', {
            description: `"${data.name}" basariyla eklendi.`,
          });
          return;
        }
      } catch {
        // Supabase not available — use local state
      }

      setCampaigns((prev) => [newCampaign, ...prev]);
      toast.success('Kampanya olusturuldu!', {
        description: `"${data.name}" basariyla eklendi.`,
      });
    },
    []
  );

  const handleUpdate = useCallback(
    async (data: CampaignInsert) => {
      if (!editingCampaign) return;

      const updated: Campaign = {
        ...editingCampaign,
        ...data,
        discount_type: data.discount_type ?? null,
        discount_value: data.discount_value ?? null,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
        usage_limit: data.usage_limit ?? null,
        description: data.description ?? null,
      };

      // Try Supabase update
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('campaigns')
          .update({
            type: data.type,
            name: data.name,
            description: data.description,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            start_date: data.start_date,
            end_date: data.end_date,
            usage_limit: data.usage_limit,
            is_active: data.is_active,
            config: data.config,
          })
          .eq('id', editingCampaign.id);

        if (error) throw error;
      } catch {
        // Supabase not available — use local state
      }

      setCampaigns((prev) => prev.map((c) => (c.id === editingCampaign.id ? updated : c)));
      setEditingCampaign(null);
      toast.success('Kampanya guncellendi!', {
        description: `"${data.name}" basariyla guncellendi.`,
      });
    },
    [editingCampaign]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingCampaign) return;

    // Try Supabase delete
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', deletingCampaign.id);

      if (error) throw error;
    } catch {
      // Supabase not available — use local state
    }

    setCampaigns((prev) => prev.filter((c) => c.id !== deletingCampaign.id));
    toast.success('Kampanya silindi!', {
      description: `"${deletingCampaign.name}" basariyla silindi.`,
    });
    setDeletingCampaign(null);
  }, [deletingCampaign]);

  const handleToggleActive = useCallback(async (campaign: Campaign) => {
    const newActive = !campaign.is_active;

    // Try Supabase update
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('campaigns')
        .update({ is_active: newActive })
        .eq('id', campaign.id);

      if (error) throw error;
    } catch {
      // Supabase not available — use local state
    }

    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, is_active: newActive } : c))
    );
    toast.success(newActive ? 'Kampanya aktiflestirildi.' : 'Kampanya pasife alindi.', {
      description: `"${campaign.name}"`,
    });
  }, []);

  const handleDuplicate = useCallback(
    (campaign: Campaign) => {
      const duplicated: CampaignInsert = {
        restaurant_id: campaign.restaurant_id,
        type: campaign.type,
        name: `${campaign.name} (Kopya)`,
        description: campaign.description,
        discount_type: campaign.discount_type,
        discount_value: campaign.discount_value,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        usage_limit: campaign.usage_limit,
        usage_count: 0,
        is_active: false,
        config: { ...campaign.config },
      };
      handleCreate(duplicated);
    },
    [handleCreate]
  );

  const handleFormSubmit = useCallback(
    (data: CampaignInsert) => {
      if (editingCampaign) {
        handleUpdate(data);
      } else {
        handleCreate(data);
      }
    },
    [editingCampaign, handleUpdate, handleCreate]
  );

  const openEditModal = useCallback((campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">Kampanyalar</h1>
          <p className="mt-1 text-sm text-text-muted">
            Indirim kuponlari, combo menuleri, mutlu saat kampanyalari ve banner duyurulari yonetin.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2.5 text-sm font-medium text-accent-orange transition-colors hover:bg-accent-orange/20"
        >
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </motion.button>
      </div>

      {/* KPI Cards */}
      <CampaignKPIs campaigns={campaigns} />

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kampanya ara..."
            className="border-white/10 bg-white/5 pl-9 text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
              filterType === 'all'
                ? 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange'
                : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
            )}
          >
            Tumu
          </button>
          {(Object.entries(CAMPAIGN_TYPE_CONFIG) as [CampaignType, typeof CAMPAIGN_TYPE_CONFIG[CampaignType]][]).map(
            ([type, config]) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  filterType === type
                    ? cn(config.border, config.bg, config.color)
                    : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                )}
              >
                {config.label}
              </button>
            )
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5">
          {([
            { value: 'all', label: 'Tumu' },
            { value: 'active', label: 'Aktif' },
            { value: 'inactive', label: 'Pasif' },
          ] as { value: FilterStatus; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                filterStatus === opt.value
                  ? 'border-white/20 bg-white/10 text-text-main'
                  : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl border border-white/5 bg-white/[0.02]"
            />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-16"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-orange/10">
            <Megaphone className="h-8 w-8 text-accent-orange" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-text-main">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Sonuc bulunamadi'
              : 'Henuz kampanya yok'}
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Farkli filtre veya arama terimleri deneyin.'
              : 'Ilk kampanyanizi olusturarak baslayin.'}
          </p>
          {!searchQuery && filterType === 'all' && filterStatus === 'all' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="mt-4 flex items-center gap-2 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange transition-colors hover:bg-accent-orange/20"
            >
              <Plus className="h-4 w-4" />
              Kampanya Olustur
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={openEditModal}
                onDelete={setDeletingCampaign}
                onToggleActive={handleToggleActive}
                onDuplicate={handleDuplicate}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <CampaignFormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCampaign(null);
        }}
        onSubmit={handleFormSubmit}
        editingCampaign={editingCampaign}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingCampaign}
        onOpenChange={(open) => {
          if (!open) setDeletingCampaign(null);
        }}
        onConfirm={handleDelete}
        campaignName={deletingCampaign?.name ?? ''}
      />
    </div>
  );
}
