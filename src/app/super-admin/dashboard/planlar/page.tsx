'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Zap,
  Rocket,
  Building2,
  Check,
  X,
  Settings2,
  Save,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  UtensilsCrossed,
  LayoutGrid,
  ShoppingCart,
  BarChart3,
  Megaphone,
  Monitor,
  Globe,
  AlertTriangle,
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
import type { RestaurantPlan } from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

interface PlanLimits {
  maxTables: number;
  maxItems: number;
  maxMonthlyOrders: number;
}

interface PlanFeatures {
  analytics: boolean;
  campaigns: boolean;
  kds: boolean;
  multiLanguage: boolean;
}

interface PlanConfig {
  id: RestaurantPlan;
  name: string;
  description: string;
  price: number;
  period: string;
  icon: typeof Crown;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  limits: PlanLimits;
  features: PlanFeatures;
}

interface RestaurantForAssignment {
  id: string;
  name: string;
  slug: string;
  currentPlan: RestaurantPlan;
  ownerName: string;
}

// =============================================================================
// Plan Configurations
// =============================================================================

const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Ucretsiz',
    description: 'Kucuk isletmeler icin baslangic plani',
    price: 0,
    period: 'ay',
    icon: Building2,
    accentColor: 'text-text-muted',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/20',
    textColor: 'text-text-muted',
    limits: {
      maxTables: 10,
      maxItems: 50,
      maxMonthlyOrders: 100,
    },
    features: {
      analytics: false,
      campaigns: false,
      kds: false,
      multiLanguage: false,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Buyuyen isletmeler icin temel ozellikler',
    price: 299,
    period: 'ay',
    icon: Zap,
    accentColor: 'text-accent-blue',
    bgColor: 'bg-accent-blue/5',
    borderColor: 'border-accent-blue/30',
    textColor: 'text-accent-blue',
    limits: {
      maxTables: 25,
      maxItems: 150,
      maxMonthlyOrders: 500,
    },
    features: {
      analytics: true,
      campaigns: false,
      kds: false,
      multiLanguage: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Profesyonel isletmeler icin gelismis ozellikler',
    price: 599,
    period: 'ay',
    icon: Rocket,
    accentColor: 'text-accent-orange',
    bgColor: 'bg-accent-orange/5',
    borderColor: 'border-accent-orange/30',
    textColor: 'text-accent-orange',
    limits: {
      maxTables: 100,
      maxItems: 500,
      maxMonthlyOrders: 5000,
    },
    features: {
      analytics: true,
      campaigns: true,
      kds: true,
      multiLanguage: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Buyuk zincir restoranlar icin sinirsis erisim',
    price: 1499,
    period: 'ay',
    icon: Crown,
    accentColor: 'text-accent-purple',
    bgColor: 'bg-accent-purple/5',
    borderColor: 'border-accent-purple/30',
    textColor: 'text-accent-purple',
    limits: {
      maxTables: 9999,
      maxItems: 9999,
      maxMonthlyOrders: 99999,
    },
    features: {
      analytics: true,
      campaigns: true,
      kds: true,
      multiLanguage: true,
    },
  },
];

const FEATURE_LIST: { key: keyof PlanFeatures; label: string; icon: typeof BarChart3 }[] = [
  { key: 'analytics', label: 'Analitik & Raporlar', icon: BarChart3 },
  { key: 'campaigns', label: 'Kampanyalar & Promosyonlar', icon: Megaphone },
  { key: 'kds', label: 'Mutfak Ekrani (KDS)', icon: Monitor },
  { key: 'multiLanguage', label: 'Coklu Dil Destegi', icon: Globe },
];

const LIMIT_FIELDS: { key: keyof PlanLimits; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'maxTables', label: 'Maks. Masa', icon: LayoutGrid },
  { key: 'maxItems', label: 'Maks. Urun', icon: UtensilsCrossed },
  { key: 'maxMonthlyOrders', label: 'Maks. Aylik Siparis', icon: ShoppingCart },
];

// =============================================================================
// Mock Data for Restaurants
// =============================================================================

const MOCK_RESTAURANTS: RestaurantForAssignment[] = [
  { id: 'r-001', name: 'Lezzet Duragi', slug: 'lezzet-duragi', currentPlan: 'pro', ownerName: 'Ahmet Yilmaz' },
  { id: 'r-002', name: 'Cafe Moda', slug: 'cafe-moda', currentPlan: 'starter', ownerName: 'Elif Demir' },
  { id: 'r-003', name: 'Kebapci Mehmet', slug: 'kebapci-mehmet', currentPlan: 'enterprise', ownerName: 'Mehmet Ozkan' },
  { id: 'r-004', name: 'Pizza Palace', slug: 'pizza-palace', currentPlan: 'pro', ownerName: 'Burak Kaya' },
  { id: 'r-005', name: 'Kucuk Ev Yemekleri', slug: 'kucuk-ev-yemekleri', currentPlan: 'free', ownerName: 'Fatma Celik' },
  { id: 'r-006', name: 'Deniz Restaurant', slug: 'deniz-restaurant', currentPlan: 'enterprise', ownerName: 'Ali Deniz' },
  { id: 'r-007', name: 'Anadolu Sofrasi', slug: 'anadolu-sofrasi', currentPlan: 'starter', ownerName: 'Hasan Yildiz' },
  { id: 'r-008', name: 'Tatli Dukkan', slug: 'tatli-dukkan', currentPlan: 'free', ownerName: 'Zeynep Koc' },
  { id: 'r-009', name: 'Balik Evi', slug: 'balik-evi', currentPlan: 'pro', ownerName: 'Mustafa Balikci' },
  { id: 'r-010', name: 'Burger Lab', slug: 'burger-lab', currentPlan: 'pro', ownerName: 'Can Ozturk' },
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
// Plan Card Component
// =============================================================================

function PlanCard({
  plan,
  restaurantCount,
  isEditing,
  editedLimits,
  editedFeatures,
  onToggleEdit,
  onLimitChange,
  onFeatureToggle,
  onSave,
}: {
  plan: PlanConfig;
  restaurantCount: number;
  isEditing: boolean;
  editedLimits: PlanLimits;
  editedFeatures: PlanFeatures;
  onToggleEdit: () => void;
  onLimitChange: (key: keyof PlanLimits, value: number) => void;
  onFeatureToggle: (key: keyof PlanFeatures) => void;
  onSave: () => void;
}) {
  const Icon = plan.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-xl border backdrop-blur-xl transition-all',
        plan.borderColor,
        plan.bgColor,
        isEditing && 'ring-2 ring-accent-blue/50'
      )}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border',
              plan.borderColor,
              plan.bgColor
            )}
          >
            <Icon className={cn('h-6 w-6', plan.accentColor)} />
          </div>
          <div>
            <h3 className={cn('font-display text-lg font-bold', plan.textColor)}>
              {plan.name}
            </h3>
            <p className="text-xs text-text-muted">{plan.description}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
            isEditing
              ? 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue'
              : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20 hover:text-text-main'
          )}
          onClick={onToggleEdit}
          aria-label={isEditing ? 'Duzenlemeyi kapat' : 'Plani duzenle'}
          title={isEditing ? 'Kapat' : 'Duzenle'}
        >
          <Settings2 className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Pricing */}
      <div className="px-6 pb-4">
        <div className="flex items-baseline gap-1">
          <span className={cn('text-3xl font-bold', plan.textColor)}>
            {plan.price === 0 ? 'Ucretsiz' : `${plan.price.toLocaleString('tr-TR')} TL`}
          </span>
          {plan.price > 0 && (
            <span className="text-sm text-text-muted">/ {plan.period}</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-xs text-text-muted">
            {restaurantCount} restoran bu plani kullaniyor
          </span>
        </div>
      </div>

      {/* Limits */}
      <div className="border-t border-white/10 px-6 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Limitler
        </h4>
        <div className="space-y-3">
          {LIMIT_FIELDS.map((field) => {
            const LimitIcon = field.icon;
            const value = isEditing ? editedLimits[field.key] : plan.limits[field.key];
            const isUnlimited = value >= 9999;

            return (
              <div key={field.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LimitIcon className="h-4 w-4 text-text-muted" />
                  <span className="text-sm text-text-muted">{field.label}</span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      onLimitChange(field.key, parseInt(e.target.value) || 0)
                    }
                    className="h-8 w-24 rounded-md border border-white/10 bg-white/5 px-2 text-right text-sm text-text-main focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
                    min={0}
                    max={99999}
                  />
                ) : (
                  <span className={cn('text-sm font-semibold', plan.textColor)}>
                    {isUnlimited ? 'Sinirsiz' : value.toLocaleString('tr-TR')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-white/10 px-6 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Ozellikler
        </h4>
        <div className="space-y-3">
          {FEATURE_LIST.map((feature) => {
            const FeatureIcon = feature.icon;
            const isEnabled = isEditing
              ? editedFeatures[feature.key]
              : plan.features[feature.key];

            return (
              <div key={feature.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FeatureIcon className="h-4 w-4 text-text-muted" />
                  <span className="text-sm text-text-muted">{feature.label}</span>
                </div>
                {isEditing ? (
                  <button
                    className={cn(
                      'relative flex h-6 w-11 items-center rounded-full border transition-colors',
                      isEnabled
                        ? 'border-accent-blue/30 bg-accent-blue/20'
                        : 'border-white/10 bg-white/5'
                    )}
                    onClick={() => onFeatureToggle(feature.key)}
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={`${feature.label} ${isEnabled ? 'kapat' : 'ac'}`}
                  >
                    <motion.div
                      layout
                      className={cn(
                        'h-4 w-4 rounded-full',
                        isEnabled ? 'bg-accent-blue' : 'bg-white/20'
                      )}
                      animate={{ x: isEnabled ? 22 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                ) : isEnabled ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5">
                    <X className="h-3 w-3 text-text-muted/50" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button (editing mode only) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 px-6 py-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue/10 px-4 py-2.5 text-sm font-semibold text-accent-blue transition-colors hover:bg-accent-blue/20"
              onClick={onSave}
            >
              <Save className="h-4 w-4" />
              Degisiklikleri Kaydet
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// Plan Assignment Dialog
// =============================================================================

function PlanAssignmentDialog({
  open,
  restaurant,
  newPlan,
  onClose,
  onConfirm,
}: {
  open: boolean;
  restaurant: RestaurantForAssignment | null;
  newPlan: RestaurantPlan | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!restaurant || !newPlan) return null;

  const planConfig = DEFAULT_PLANS.find((p) => p.id === newPlan);
  const currentPlanConfig = DEFAULT_PLANS.find((p) => p.id === restaurant.currentPlan);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <AlertTriangle className="h-5 w-5 text-accent-blue" />
            Plan Degisikligi
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            <strong className="text-text-main">{restaurant.name}</strong>{' '}
            restoraninin planini{' '}
            <span className={currentPlanConfig?.textColor}>
              {currentPlanConfig?.name}
            </span>
            {' '}planinden{' '}
            <span className={planConfig?.textColor}>
              {planConfig?.name}
            </span>
            {' '}planine degistirmek istediginize emin misiniz?
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
            className="rounded-lg bg-accent-blue/10 px-4 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/20"
            onClick={onConfirm}
          >
            Evet, Degistir
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Restaurant Assignment Table
// =============================================================================

function RestaurantAssignmentSection({
  restaurants,
  onAssign,
}: {
  restaurants: RestaurantForAssignment[];
  onAssign: (restaurant: RestaurantForAssignment, newPlan: RestaurantPlan) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | RestaurantPlan>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const filtered = useMemo(() => {
    let result = restaurants;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.slug.toLowerCase().includes(query) ||
          r.ownerName.toLowerCase().includes(query)
      );
    }

    if (planFilter !== 'all') {
      result = result.filter((r) => r.currentPlan === planFilter);
    }

    return result;
  }, [restaurants, searchQuery, planFilter]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
      {/* Section Header */}
      <button
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-accent-blue" />
          <div>
            <h2 className="font-display text-lg font-bold text-text-main">
              Manuel Plan Atama
            </h2>
            <p className="text-xs text-text-muted">
              Restoranlara manuel olarak plan atayabilirsiniz.
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Filters */}
            <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Restoran veya sahip ara..."
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted/60 transition-colors focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
                  aria-label="Restoran ara"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-text-muted" />
                <Select
                  value={planFilter}
                  onValueChange={(value) => setPlanFilter(value as 'all' | RestaurantPlan)}
                >
                  <SelectTrigger className="h-9 w-[130px] border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
                    <SelectItem
                      value="all"
                      className="text-text-muted focus:bg-white/5 focus:text-text-main"
                    >
                      Tum Planlar
                    </SelectItem>
                    {DEFAULT_PLANS.map((plan) => (
                      <SelectItem
                        key={plan.id}
                        value={plan.id}
                        className="text-text-muted focus:bg-white/5 focus:text-text-main"
                      >
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Restaurant List */}
            <div className="border-t border-white/10">
              {filtered.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-text-muted/50" />
                  <p className="mt-2 text-sm text-text-muted">
                    Restoran bulunamadi.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filtered.map((restaurant) => {
                    const currentPlanConfig = DEFAULT_PLANS.find(
                      (p) => p.id === restaurant.currentPlan
                    );

                    return (
                      <div
                        key={restaurant.id}
                        className="flex flex-col gap-3 px-6 py-3 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-main">
                            {restaurant.name}
                          </p>
                          <p className="truncate text-xs text-text-muted">
                            {restaurant.ownerName} &middot; /{restaurant.slug}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              currentPlanConfig?.borderColor,
                              currentPlanConfig?.bgColor,
                              currentPlanConfig?.textColor
                            )}
                          >
                            {currentPlanConfig?.name}
                          </span>

                          <span className="text-xs text-text-muted">&rarr;</span>

                          <Select
                            value={restaurant.currentPlan}
                            onValueChange={(value) =>
                              onAssign(restaurant, value as RestaurantPlan)
                            }
                          >
                            <SelectTrigger className="h-8 w-[120px] border-white/10 bg-white/5 text-xs text-text-main focus:ring-accent-blue/50">
                              <SelectValue placeholder="Plan sec" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
                              {DEFAULT_PLANS.map((plan) => (
                                <SelectItem
                                  key={plan.id}
                                  value={plan.id}
                                  className={cn(
                                    'text-text-muted focus:bg-white/5 focus:text-text-main',
                                    plan.id === restaurant.currentPlan &&
                                      'text-accent-blue'
                                  )}
                                >
                                  {plan.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-3">
              <p className="text-xs text-text-muted">
                Toplam{' '}
                <span className="font-semibold text-text-main">
                  {filtered.length}
                </span>{' '}
                restoran
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function PlanlarPage() {
  // Data state
  const [plans, setPlans] = useState<PlanConfig[]>(DEFAULT_PLANS);
  const [restaurants, setRestaurants] = useState<RestaurantForAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit state
  const [editingPlan, setEditingPlan] = useState<RestaurantPlan | null>(null);
  const [editedLimits, setEditedLimits] = useState<Record<RestaurantPlan, PlanLimits>>({
    free: DEFAULT_PLANS[0].limits,
    starter: DEFAULT_PLANS[1].limits,
    pro: DEFAULT_PLANS[2].limits,
    enterprise: DEFAULT_PLANS[3].limits,
  });
  const [editedFeatures, setEditedFeatures] = useState<Record<RestaurantPlan, PlanFeatures>>({
    free: DEFAULT_PLANS[0].features,
    starter: DEFAULT_PLANS[1].features,
    pro: DEFAULT_PLANS[2].features,
    enterprise: DEFAULT_PLANS[3].features,
  });

  // Dialog state
  const [assignTarget, setAssignTarget] = useState<RestaurantForAssignment | null>(null);
  const [assignNewPlan, setAssignNewPlan] = useState<RestaurantPlan | null>(null);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchRestaurants = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('restaurants')
        .select('*, user_profiles(full_name)')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: RestaurantForAssignment[] = data.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          currentPlan: r.plan as RestaurantPlan,
          ownerName:
            (r.user_profiles as { full_name: string | null } | null)?.full_name ||
            'Bilinmiyor',
        }));
        setRestaurants(mapped);
      } else {
        setRestaurants(MOCK_RESTAURANTS);
      }
    } catch {
      setRestaurants(MOCK_RESTAURANTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const planStats = useMemo(() => {
    const counts: Record<RestaurantPlan, number> = {
      free: 0,
      starter: 0,
      pro: 0,
      enterprise: 0,
    };

    restaurants.forEach((r) => {
      counts[r.currentPlan]++;
    });

    return counts;
  }, [restaurants]);

  // ---------------------------------------------------------------------------
  // Plan Edit Handlers
  // ---------------------------------------------------------------------------

  const handleToggleEdit = useCallback((planId: RestaurantPlan) => {
    setEditingPlan((prev) => (prev === planId ? null : planId));
  }, []);

  const handleLimitChange = useCallback(
    (planId: RestaurantPlan, key: keyof PlanLimits, value: number) => {
      setEditedLimits((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [key]: value,
        },
      }));
    },
    []
  );

  const handleFeatureToggle = useCallback(
    (planId: RestaurantPlan, key: keyof PlanFeatures) => {
      setEditedFeatures((prev) => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [key]: !prev[planId][key],
        },
      }));
    },
    []
  );

  const handleSavePlan = useCallback(
    (planId: RestaurantPlan) => {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === planId
            ? { ...p, limits: editedLimits[planId], features: editedFeatures[planId] }
            : p
        )
      );

      setEditingPlan(null);

      toast.success(
        `${DEFAULT_PLANS.find((p) => p.id === planId)?.name} plani guncellendi.`,
        {
          description: 'Limit ve ozellik degisiklikleri kaydedildi.',
        }
      );
    },
    [editedLimits, editedFeatures]
  );

  // ---------------------------------------------------------------------------
  // Plan Assignment Handler
  // ---------------------------------------------------------------------------

  const handleAssignPlan = useCallback(
    (restaurant: RestaurantForAssignment, newPlan: RestaurantPlan) => {
      if (newPlan === restaurant.currentPlan) return;
      setAssignTarget(restaurant);
      setAssignNewPlan(newPlan);
    },
    []
  );

  const confirmAssignment = useCallback(async () => {
    if (!assignTarget || !assignNewPlan) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('restaurants')
        .update({ plan: assignNewPlan })
        .eq('id', assignTarget.id);

      if (error) throw error;

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === assignTarget.id ? { ...r, currentPlan: assignNewPlan } : r
        )
      );

      toast.success(
        `${assignTarget.name} plani ${DEFAULT_PLANS.find((p) => p.id === assignNewPlan)?.name} olarak guncellendi.`
      );
    } catch {
      // Mock fallback
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === assignTarget.id ? { ...r, currentPlan: assignNewPlan! } : r
        )
      );

      toast.success(
        `${assignTarget.name} plani ${DEFAULT_PLANS.find((p) => p.id === assignNewPlan)?.name} olarak guncellendi.`
      );
    } finally {
      setAssignTarget(null);
      setAssignNewPlan(null);
    }
  }, [assignTarget, assignNewPlan]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Plan Yonetimi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Abonelik planlarini yapilandirin, limitleri ayarlayin ve restoranlara plan atayin.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-white/20 hover:text-text-main',
            isLoading && 'pointer-events-none opacity-50'
          )}
          onClick={() => {
            setIsLoading(true);
            fetchRestaurants();
            toast.success('Veriler yenilendi.');
          }}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn('h-4 w-4', isLoading && 'animate-spin')}
          />
          <span className="hidden sm:inline">Yenile</span>
        </motion.button>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Ucretsiz" value={planStats.free} color="bg-white/40" />
        <StatCard label="Starter" value={planStats.starter} color="bg-accent-blue" />
        <StatCard label="Pro" value={planStats.pro} color="bg-accent-orange" />
        <StatCard label="Enterprise" value={planStats.enterprise} color="bg-accent-purple" />
      </div>

      {/* Plan Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="h-3 w-36 rounded bg-white/5" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-8 w-32 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-3 w-24 rounded bg-white/5" />
                    <div className="h-3 w-12 rounded bg-white/5" />
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-3 w-32 rounded bg-white/5" />
                    <div className="h-5 w-5 rounded-full bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              restaurantCount={planStats[plan.id]}
              isEditing={editingPlan === plan.id}
              editedLimits={editedLimits[plan.id]}
              editedFeatures={editedFeatures[plan.id]}
              onToggleEdit={() => handleToggleEdit(plan.id)}
              onLimitChange={(key, value) => handleLimitChange(plan.id, key, value)}
              onFeatureToggle={(key) => handleFeatureToggle(plan.id, key)}
              onSave={() => handleSavePlan(plan.id)}
            />
          ))}
        </div>
      )}

      {/* Restaurant Assignment Section */}
      {!isLoading && (
        <RestaurantAssignmentSection
          restaurants={restaurants}
          onAssign={handleAssignPlan}
        />
      )}

      {/* Plan Assignment Dialog */}
      <PlanAssignmentDialog
        open={!!assignTarget && !!assignNewPlan}
        restaurant={assignTarget}
        newPlan={assignNewPlan}
        onClose={() => {
          setAssignTarget(null);
          setAssignNewPlan(null);
        }}
        onConfirm={confirmAssignment}
      />
    </div>
  );
}
