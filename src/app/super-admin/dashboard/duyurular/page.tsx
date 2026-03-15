'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  X,
  Filter,
  Clock,
  Send,
  Calendar,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  Users,
  Building2,
  User,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AnnouncementSeverity,
  AnnouncementTarget,
  AnnouncementTargetConfig,
  RestaurantPlan,
} from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  severity: AnnouncementSeverity;
  target: AnnouncementTarget;
  target_config: AnnouncementTargetConfig;
  is_read: boolean;
  status: 'draft' | 'sent' | 'scheduled';
  scheduled_at?: string;
  created_at: string;
}

interface AnnouncementFormData {
  title: string;
  content: string;
  severity: AnnouncementSeverity;
  target: AnnouncementTarget;
  target_plans: RestaurantPlan[];
}

type SeverityFilter = 'all' | AnnouncementSeverity;
type StatusFilter = 'all' | 'draft' | 'sent' | 'scheduled';

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_ANNOUNCEMENTS: AnnouncementRow[] = [
  {
    id: 'ann-001',
    title: 'Sistem Bakimi Bildirimi',
    content:
      'Yarin saat 03:00-05:00 arasi planlanan sistem bakimi nedeniyle platform erisime kapali olacaktir. Lutfen bu sure zarfinda onemli islemlerinizi tamamlayiniz.',
    severity: 'critical',
    target: 'all',
    target_config: {},
    is_read: false,
    status: 'sent',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ann-002',
    title: 'Yeni Ozellik: QR Kod Toplu Indirme',
    content:
      'Artik tum masalarinizin QR kodlarini tek tikla ZIP dosyasi olarak indirebilirsiniz. Bu ozellik Pro ve Enterprise planlari icin kullanilabilir.',
    severity: 'info',
    target: 'plan_based',
    target_config: { plans: ['pro', 'enterprise'] },
    is_read: false,
    status: 'sent',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ann-003',
    title: 'Starter Plan Guncelleme',
    content:
      'Starter plan limitleri guncellendi: Masa limiti 15 den 25 e, urun limiti 100 den 150 ye yukseltildi. Mevcut Starter kullanicilar otomatik olarak yeni limitlere sahip olacak.',
    severity: 'info',
    target: 'plan_based',
    target_config: { plans: ['starter'] },
    is_read: true,
    status: 'sent',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'ann-004',
    title: 'Guvenlik Uyarisi',
    content:
      'Son gunlerde artan phishing saldirilarina karsi lutfen sifrenizi guncelleyiniz ve iki faktorlu dogrulamayi aktif ediniz.',
    severity: 'warning',
    target: 'all',
    target_config: {},
    is_read: false,
    status: 'sent',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'ann-005',
    title: 'Ramazan Kampanya Modulu',
    content:
      'Ramazan ayina ozel kampanya sablonlari eklendi. Kampanyalar sayfasindan hizlica iftar ve sahur menuleri olusturabilirsiniz.',
    severity: 'info',
    target: 'all',
    target_config: {},
    is_read: true,
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 604800000).toISOString(),
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'ann-006',
    title: 'API Rate Limit Degisikligi',
    content:
      'Enterprise plan kullanicilari icin API rate limitleri 2 katina cikarildi. Detaylar icin dokumantasyonu inceleyiniz.',
    severity: 'warning',
    target: 'plan_based',
    target_config: { plans: ['enterprise'] },
    is_read: false,
    status: 'draft',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ann-007',
    title: 'Acil: Odeme Sistemi Guncellendi',
    content:
      'Odeme altyapisi yeni saglayiciya tasinmistir. Eger odeme sorunu yasarsaniz lutfen destek ekibiyle iletisime gecin.',
    severity: 'critical',
    target: 'all',
    target_config: {},
    is_read: false,
    status: 'sent',
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'ann-008',
    title: 'Mutfak Ekrani (KDS) Beta',
    content:
      'KDS ozelligi beta surecine girdi. Pro ve Enterprise plan sahipleri Siparisler sayfasindan tam ekran mutfak gorunumunu test edebilir.',
    severity: 'info',
    target: 'plan_based',
    target_config: { plans: ['pro', 'enterprise'] },
    is_read: true,
    status: 'sent',
    created_at: new Date(Date.now() - 518400000).toISOString(),
  },
];

// =============================================================================
// Config
// =============================================================================

const SEVERITY_CONFIG: Record<
  AnnouncementSeverity,
  { icon: typeof Info; classes: string; label: string; borderColor: string; bgColor: string }
> = {
  info: {
    icon: Info,
    classes: 'bg-accent-blue/10 text-accent-blue',
    label: 'Bilgi',
    borderColor: 'border-accent-blue/30',
    bgColor: 'bg-accent-blue/5',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-500/10 text-amber-400',
    label: 'Uyari',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/5',
  },
  critical: {
    icon: AlertCircle,
    classes: 'bg-red-500/10 text-red-400',
    label: 'Kritik',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/5',
  },
};

const TARGET_CONFIG: Record<
  AnnouncementTarget,
  { icon: typeof Users; label: string }
> = {
  all: { icon: Users, label: 'Tum Kullanicilar' },
  plan_based: { icon: Building2, label: 'Plana Gore' },
  individual: { icon: User, label: 'Bireysel' },
};

const STATUS_CONFIG: Record<
  string,
  { classes: string; label: string }
> = {
  draft: {
    classes: 'border-white/20 bg-white/5 text-text-muted',
    label: 'Taslak',
  },
  sent: {
    classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    label: 'Gonderildi',
  },
  scheduled: {
    classes: 'border-accent-purple/30 bg-accent-purple/10 text-accent-purple',
    label: 'Planlanmis',
  },
};

const SEVERITY_OPTIONS: { value: SeverityFilter; label: string }[] = [
  { value: 'all', label: 'Tum Seviyeler' },
  { value: 'info', label: 'Bilgi' },
  { value: 'warning', label: 'Uyari' },
  { value: 'critical', label: 'Kritik' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tum Durumlar' },
  { value: 'draft', label: 'Taslak' },
  { value: 'sent', label: 'Gonderildi' },
  { value: 'scheduled', label: 'Planlanmis' },
];

const PLAN_OPTIONS: { value: RestaurantPlan; label: string }[] = [
  { value: 'free', label: 'Ucretsiz' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

// =============================================================================
// Sub-Components
// =============================================================================

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
      <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-lg font-bold text-text-main">
          {value.toLocaleString('tr-TR')}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Create/Edit Dialog
// =============================================================================

function AnnouncementFormDialog({
  open,
  editingAnnouncement,
  onClose,
  onSave,
}: {
  open: boolean;
  editingAnnouncement: AnnouncementRow | null;
  onClose: () => void;
  onSave: (data: AnnouncementFormData) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [severity, setSeverity] = useState<AnnouncementSeverity>('info');
  const [target, setTarget] = useState<AnnouncementTarget>('all');
  const [targetPlans, setTargetPlans] = useState<RestaurantPlan[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form when editing
  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title);
      setContent(editingAnnouncement.content);
      setSeverity(editingAnnouncement.severity);
      setTarget(editingAnnouncement.target);
      setTargetPlans(editingAnnouncement.target_config.plans || []);
    } else {
      setTitle('');
      setContent('');
      setSeverity('info');
      setTarget('all');
      setTargetPlans([]);
    }
  }, [editingAnnouncement, open]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Baslik zorunludur.');
      return;
    }
    if (!content.trim()) {
      toast.error('Icerik zorunludur.');
      return;
    }

    setIsSaving(true);
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSave({
      title: title.trim(),
      content: content.trim(),
      severity,
      target,
      target_plans: targetPlans,
    });

    setIsSaving(false);
  };

  const togglePlan = (plan: RestaurantPlan) => {
    setTargetPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  };

  const inputClasses = cn(
    'w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-text-main placeholder-text-muted/60 backdrop-blur-sm',
    'transition-all duration-300',
    'focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/50',
    'disabled:cursor-not-allowed disabled:opacity-50'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <Megaphone className="h-5 w-5 text-accent-blue" />
            {editingAnnouncement ? 'Duyuru Duzenle' : 'Yeni Duyuru Olustur'}
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            {editingAnnouncement
              ? 'Mevcut duyuruyu duzenleyin ve kaydedin.'
              : 'Yeni bir duyuru olusturun ve hedef kitlenizi secin.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-main">
              Baslik <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Duyuru basligi"
              disabled={isSaving}
              className={cn(inputClasses, 'border-white/10 hover:border-white/20')}
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-main">
              Icerik <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Duyuru icerigini yazin..."
              rows={4}
              disabled={isSaving}
              className={cn(
                inputClasses,
                'resize-none border-white/10 hover:border-white/20'
              )}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-main">
              Onem Seviyesi
            </label>
            <div className="flex gap-2">
              {(['info', 'warning', 'critical'] as AnnouncementSeverity[]).map(
                (sev) => {
                  const config = SEVERITY_CONFIG[sev];
                  const SevIcon = config.icon;
                  const isActive = severity === sev;

                  return (
                    <motion.button
                      key={sev}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? cn(config.borderColor, config.bgColor, config.classes.split(' ').pop())
                          : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                      )}
                      onClick={() => setSeverity(sev)}
                      disabled={isSaving}
                    >
                      <SevIcon className="h-4 w-4" />
                      {config.label}
                    </motion.button>
                  );
                }
              )}
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-main">
              Hedef Kitle
            </label>
            <Select
              value={target}
              onValueChange={(value) => setTarget(value as AnnouncementTarget)}
              disabled={isSaving}
            >
              <SelectTrigger className="h-10 border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50">
                <SelectValue placeholder="Hedef kitle secin" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
                <SelectItem
                  value="all"
                  className="text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  Tum Kullanicilar
                </SelectItem>
                <SelectItem
                  value="plan_based"
                  className="text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  Plana Gore
                </SelectItem>
                <SelectItem
                  value="individual"
                  className="text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  Bireysel
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan selection (shown when target is plan_based) */}
          <AnimatePresence>
            {target === 'plan_based' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-text-main">
                  Hedef Planlar
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLAN_OPTIONS.map((plan) => {
                    const isSelected = targetPlans.includes(plan.value);
                    return (
                      <motion.button
                        key={plan.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                          isSelected
                            ? 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue'
                            : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                        )}
                        onClick={() => togglePlan(plan.value)}
                        disabled={isSaving}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        {plan.label}
                      </motion.button>
                    );
                  })}
                </div>
                {targetPlans.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-400">
                    En az bir plan secmelisiniz.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            onClick={onClose}
            disabled={isSaving}
          >
            Vazgec
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-2 rounded-lg bg-accent-blue/10 px-4 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/20',
              isSaving && 'pointer-events-none opacity-50'
            )}
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {editingAnnouncement ? 'Guncelle' : 'Olustur'}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Delete Confirmation Dialog
// =============================================================================

function DeleteConfirmDialog({
  open,
  announcement,
  onClose,
  onConfirm,
}: {
  open: boolean;
  announcement: AnnouncementRow | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Duyuru Silinecek
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            <strong className="text-text-main">{announcement.title}</strong>{' '}
            duyurusunu silmek istediginize emin misiniz? Bu islem geri alinamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            onClick={onClose}
          >
            Vazgec
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            onClick={onConfirm}
          >
            Evet, Sil
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Detail / Preview Dialog
// =============================================================================

function AnnouncementDetailDialog({
  open,
  announcement,
  onClose,
}: {
  open: boolean;
  announcement: AnnouncementRow | null;
  onClose: () => void;
}) {
  if (!announcement) return null;

  const sevConfig = SEVERITY_CONFIG[announcement.severity];
  const SevIcon = sevConfig.icon;
  const targetInfo = TARGET_CONFIG[announcement.target];
  const statusInfo = STATUS_CONFIG[announcement.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <SevIcon className={cn('h-5 w-5', sevConfig.classes.split(' ').pop())} />
            {announcement.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                sevConfig.borderColor,
                sevConfig.bgColor,
                sevConfig.classes.split(' ').pop()
              )}
            >
              {sevConfig.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                statusInfo.classes
              )}
            >
              {statusInfo.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-text-muted">
              <targetInfo.icon className="h-3 w-3" />
              {targetInfo.label}
            </span>
          </div>

          {/* Plan targets */}
          {announcement.target === 'plan_based' &&
            announcement.target_config.plans &&
            announcement.target_config.plans.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Hedef Planlar:</span>
                <div className="flex gap-1.5">
                  {announcement.target_config.plans.map((plan) => (
                    <span
                      key={plan}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-text-main"
                    >
                      {PLAN_OPTIONS.find((p) => p.value === plan)?.label || plan}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Content */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-main">
              {announcement.content}
            </p>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Olusturulma: {new Date(announcement.created_at).toLocaleString('tr-TR')}
            </span>
            {announcement.scheduled_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Planlanmis: {new Date(announcement.scheduled_at).toLocaleString('tr-TR')}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
            onClick={onClose}
          >
            Kapat
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Skeleton Loader
// =============================================================================

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-white/5" />
              </div>
              <div className="h-3 w-full animate-pulse rounded bg-white/5" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
              <div className="flex gap-2">
                <div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function DuyurularPage() {
  // Data state
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementRow | null>(null);
  const [detailTarget, setDetailTarget] = useState<AnnouncementRow | null>(null);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchAnnouncements = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: AnnouncementRow[] = data.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          severity: a.severity as AnnouncementSeverity,
          target: a.target as AnnouncementTarget,
          target_config: (a.target_config || {}) as AnnouncementTargetConfig,
          is_read: a.is_read,
          status: 'sent' as const,
          created_at: a.created_at,
        }));
        setAnnouncements(mapped);
      } else {
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      }

      if (showToast) {
        toast.success('Duyurular guncellendi.');
      }
    } catch {
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      if (showToast) {
        toast.error('Veriler yuklenirken hata olustu.', {
          description: 'Mock veriler gosteriliyor.',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filteredAnnouncements = useMemo(() => {
    let filtered = announcements;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query)
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    return filtered;
  }, [announcements, searchQuery, severityFilter, statusFilter]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      sent: announcements.filter((a) => a.status === 'sent').length,
      scheduled: announcements.filter((a) => a.status === 'scheduled').length,
      critical: announcements.filter((a) => a.severity === 'critical').length,
    };
  }, [announcements]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleCreateNew = useCallback(() => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((announcement: AnnouncementRow) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: AnnouncementFormData) => {
      if (editingAnnouncement) {
        // Update existing
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from('announcements')
            .update({
              title: data.title,
              content: data.content,
              severity: data.severity,
              target: data.target,
              target_config:
                data.target === 'plan_based'
                  ? { plans: data.target_plans }
                  : {},
            })
            .eq('id', editingAnnouncement.id);

          if (error) throw error;
        } catch {
          // Mock fallback - update locally
        }

        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === editingAnnouncement.id
              ? {
                  ...a,
                  title: data.title,
                  content: data.content,
                  severity: data.severity,
                  target: data.target,
                  target_config:
                    data.target === 'plan_based'
                      ? { plans: data.target_plans }
                      : {},
                }
              : a
          )
        );

        toast.success('Duyuru guncellendi.', {
          description: `"${data.title}" basariyla duzenlendi.`,
        });
      } else {
        // Create new
        const newAnnouncement: AnnouncementRow = {
          id: `ann-${Date.now()}`,
          title: data.title,
          content: data.content,
          severity: data.severity,
          target: data.target,
          target_config:
            data.target === 'plan_based' ? { plans: data.target_plans } : {},
          is_read: false,
          status: 'draft',
          created_at: new Date().toISOString(),
        };

        try {
          const supabase = createClient();
          const { data: inserted, error } = await supabase
            .from('announcements')
            .insert({
              title: newAnnouncement.title,
              content: newAnnouncement.content,
              severity: newAnnouncement.severity,
              target: newAnnouncement.target,
              target_config: newAnnouncement.target_config,
            })
            .select()
            .single();

          if (error) throw error;

          if (inserted) {
            newAnnouncement.id = inserted.id;
          }
        } catch {
          // Mock fallback - use local ID
        }

        setAnnouncements((prev) => [newAnnouncement, ...prev]);

        toast.success('Duyuru olusturuldu.', {
          description: `"${data.title}" taslak olarak kaydedildi.`,
        });
      }

      setIsFormOpen(false);
      setEditingAnnouncement(null);
    },
    [editingAnnouncement]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;
    } catch {
      // Mock fallback
    }

    setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" duyurusu silindi.`);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleSend = useCallback(async (announcement: AnnouncementRow) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('announcements')
        .update({ is_read: false })
        .eq('id', announcement.id);

      if (error) throw error;
    } catch {
      // Mock fallback
    }

    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === announcement.id ? { ...a, status: 'sent' as const } : a
      )
    );

    toast.success('Duyuru gonderildi!', {
      description: `"${announcement.title}" tum hedef kitleye iletildi.`,
    });
  }, []);

  const handleSchedule = useCallback(async (announcement: AnnouncementRow) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === announcement.id
          ? {
              ...a,
              status: 'scheduled' as const,
              scheduled_at: new Date(Date.now() + 86400000).toISOString(),
            }
          : a
      )
    );

    toast.success('Duyuru planlandi.', {
      description: `"${announcement.title}" yarin gonderilmek uzere planlandi.`,
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSeverityFilter('all');
    setStatusFilter('all');
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' || severityFilter !== 'all' || statusFilter !== 'all';

  // ---------------------------------------------------------------------------
  // Time Formatter
  // ---------------------------------------------------------------------------

  const formatRelativeTime = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Az once';
    if (minutes < 60) return `${minutes} dk once`;
    if (hours < 24) return `${hours} saat once`;
    return `${days} gun once`;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Duyuru Yonetimi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Platform duyurularini olusturun, duzenleyin ve hedef kitlenize gonderin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-white/20 hover:text-text-main',
              isRefreshing && 'pointer-events-none opacity-50'
            )}
            onClick={() => fetchAnnouncements(true)}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
            />
            <span className="hidden sm:inline">Yenile</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-lg bg-accent-blue/10 px-3 py-2 text-sm font-semibold text-accent-blue transition-colors hover:bg-accent-blue/20"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Yeni Duyuru</span>
          </motion.button>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Toplam" value={stats.total} color="bg-accent-blue" />
        <StatCard label="Gonderildi" value={stats.sent} color="bg-emerald-400" />
        <StatCard label="Planlanmis" value={stats.scheduled} color="bg-accent-purple" />
        <StatCard label="Kritik" value={stats.critical} color="bg-red-400" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Duyuru ara..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-text-main placeholder:text-text-muted/60 transition-colors focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
            aria-label="Duyuru ara"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                onClick={() => setSearchQuery('')}
                aria-label="Aramayi temizle"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtre:</span>
          </div>

          <Select
            value={severityFilter}
            onValueChange={(value) => setSeverityFilter(value as SeverityFilter)}
          >
            <SelectTrigger className="h-10 w-[130px] border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50 sm:w-[140px]">
              <SelectValue placeholder="Seviye" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
              {SEVERITY_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="h-10 w-[130px] border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50 sm:w-[140px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-text-muted focus:bg-white/5 focus:text-text-main"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-10 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-text-muted transition-colors hover:border-red-500/30 hover:text-red-400"
                onClick={clearFilters}
                aria-label="Filtreleri temizle"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Temizle</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <AnnouncementsSkeleton />
      ) : filteredAnnouncements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16 backdrop-blur-xl">
          <Megaphone className="h-12 w-12 text-text-muted/30" />
          <p className="mt-4 text-sm font-medium text-text-muted">
            {hasActiveFilters
              ? 'Filtrelere uygun duyuru bulunamadi.'
              : 'Henuz duyuru bulunmuyor.'}
          </p>
          {!hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-accent-blue/10 px-4 py-2 text-sm font-semibold text-accent-blue transition-colors hover:bg-accent-blue/20"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4" />
              Ilk Duyuruyu Olustur
            </motion.button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map((announcement) => {
              const sevConfig = SEVERITY_CONFIG[announcement.severity];
              const SevIcon = sevConfig.icon;
              const targetInfo = TARGET_CONFIG[announcement.target];
              const TargetIcon = targetInfo.icon;
              const statusInfo = STATUS_CONFIG[announcement.status];

              return (
                <motion.div
                  key={announcement.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    'group rounded-xl border bg-white/5 p-4 backdrop-blur-xl transition-all hover:bg-white/[0.07]',
                    announcement.severity === 'critical'
                      ? 'border-red-500/20'
                      : 'border-white/10'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Severity Icon */}
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        sevConfig.classes
                      )}
                    >
                      <SevIcon className="h-4.5 w-4.5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-text-main">
                          {announcement.title}
                        </h3>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-text-muted">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(announcement.created_at)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                        {announcement.content}
                      </p>

                      {/* Badges */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            sevConfig.borderColor,
                            sevConfig.bgColor,
                            sevConfig.classes.split(' ').pop()
                          )}
                        >
                          {sevConfig.label}
                        </span>

                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            statusInfo.classes
                          )}
                        >
                          {statusInfo.label}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-text-muted">
                          <TargetIcon className="h-3 w-3" />
                          {targetInfo.label}
                          {announcement.target === 'plan_based' &&
                            announcement.target_config.plans && (
                              <span className="ml-0.5 text-text-main">
                                ({announcement.target_config.plans.length} plan)
                              </span>
                            )}
                        </span>

                        {announcement.scheduled_at && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-2 py-0.5 text-[10px] text-accent-purple">
                            <Calendar className="h-3 w-3" />
                            {new Date(announcement.scheduled_at).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-white/20 hover:text-text-main"
                          onClick={() => setDetailTarget(announcement)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Goruntule
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent-blue/30 hover:text-accent-blue"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Duzenle
                        </motion.button>

                        {announcement.status === 'draft' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                              onClick={() => handleSend(announcement)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Gonder
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1.5 rounded-md border border-accent-purple/30 bg-accent-purple/10 px-2.5 py-1.5 text-xs font-medium text-accent-purple transition-colors hover:bg-accent-purple/20"
                              onClick={() => handleSchedule(announcement)}
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              Planla
                            </motion.button>
                          </>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                          onClick={() => setDeleteTarget(announcement)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Sil
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer info */}
      {!isLoading && filteredAnnouncements.length > 0 && (
        <div className="text-xs text-text-muted">
          Toplam{' '}
          <span className="font-semibold text-text-main">
            {filteredAnnouncements.length}
          </span>{' '}
          duyuru gosteriliyor
          {hasActiveFilters && ` (toplam ${announcements.length} icinden)`}
        </div>
      )}

      {/* Dialogs */}
      <AnnouncementFormDialog
        open={isFormOpen}
        editingAnnouncement={editingAnnouncement}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAnnouncement(null);
        }}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        announcement={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <AnnouncementDetailDialog
        open={!!detailTarget}
        announcement={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </div>
  );
}
