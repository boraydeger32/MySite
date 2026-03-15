'use client';

import {
  Building2,
  UserPlus,
  ShoppingCart,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  AlertTriangle,
  XCircle,
  Settings,
  UserCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import KPICard from '@/components/qr-menu/KPICard';

// =============================================================================
// Types
// =============================================================================

interface PlatformKPI {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend: number;
  trendLabel: string;
  icon: typeof Building2;
  accentColor: 'orange' | 'blue' | 'purple' | 'green' | 'red';
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_KPI: PlatformKPI[] = [
  {
    label: 'Aktif Restoranlar',
    value: 1284,
    trend: 14.2,
    trendLabel: 'gecen aya gore',
    icon: Building2,
    accentColor: 'blue' as const,
  },
  {
    label: 'Bu Ayin Kayitlari',
    value: 87,
    trend: 23.5,
    trendLabel: 'gecen aya gore',
    icon: UserPlus,
    accentColor: 'green' as const,
  },
  {
    label: 'Toplam Siparisler',
    value: 342580,
    trend: 9.8,
    trendLabel: 'gecen aya gore',
    icon: ShoppingCart,
    accentColor: 'orange' as const,
  },
  {
    label: 'Platform Geliri',
    value: 2845600,
    prefix: '₺',
    trend: 18.4,
    trendLabel: 'gecen aya gore',
    icon: DollarSign,
    accentColor: 'purple' as const,
  },
  {
    label: 'Aktif Kullanicilar',
    value: 5672,
    trend: 11.3,
    trendLabel: 'gecen aya gore',
    icon: Users,
    accentColor: 'blue' as const,
  },
];

const MOCK_MONTHLY_GROWTH = [
  { ay: 'Oca', restoranlar: 980, siparisler: 245000 },
  { ay: 'Sub', restoranlar: 1020, siparisler: 258000 },
  { ay: 'Mar', restoranlar: 1055, siparisler: 271000 },
  { ay: 'Nis', restoranlar: 1090, siparisler: 284000 },
  { ay: 'May', restoranlar: 1120, siparisler: 296000 },
  { ay: 'Haz', restoranlar: 1148, siparisler: 305000 },
  { ay: 'Tem', restoranlar: 1170, siparisler: 312000 },
  { ay: 'Agu', restoranlar: 1195, siparisler: 318000 },
  { ay: 'Eyl', restoranlar: 1218, siparisler: 325000 },
  { ay: 'Eki', restoranlar: 1240, siparisler: 330000 },
  { ay: 'Kas', restoranlar: 1260, siparisler: 336000 },
  { ay: 'Ara', restoranlar: 1284, siparisler: 342580 },
];

const MOCK_PLAN_DISTRIBUTION = [
  { name: 'Ucretsiz', value: 520, color: '#8892A4' },
  { name: 'Starter', value: 410, color: '#00D4FF' },
  { name: 'Pro', value: 280, color: '#FF6B2B' },
  { name: 'Enterprise', value: 74, color: '#7C3AED' },
];

interface ActivityLogEntry {
  id: string;
  type: 'registration' | 'upgrade' | 'alert' | 'cancellation' | 'config';
  message: string;
  detail: string;
  time: string;
}

const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: 'LOG-001',
    type: 'registration',
    message: 'Yeni restoran kaydoldu',
    detail: 'Lezzet Duragi - Istanbul, Kadikoy',
    time: '3 dk once',
  },
  {
    id: 'LOG-002',
    type: 'upgrade',
    message: 'Plan yukseltme',
    detail: 'Cafe Moda: Starter → Pro',
    time: '12 dk once',
  },
  {
    id: 'LOG-003',
    type: 'alert',
    message: 'Yuksek siparis hacmi',
    detail: 'Kebapci Mehmet - 500+ siparis/gun',
    time: '25 dk once',
  },
  {
    id: 'LOG-004',
    type: 'registration',
    message: 'Yeni restoran kaydoldu',
    detail: 'Pizza Palace - Ankara, Cankaya',
    time: '42 dk once',
  },
  {
    id: 'LOG-005',
    type: 'cancellation',
    message: 'Abonelik iptali',
    detail: 'Kucuk Ev Yemekleri - Starter plan',
    time: '1 saat once',
  },
  {
    id: 'LOG-006',
    type: 'config',
    message: 'Sistem ayari guncellendi',
    detail: 'SMS bildirim limiti: 1000 → 2000',
    time: '2 saat once',
  },
  {
    id: 'LOG-007',
    type: 'upgrade',
    message: 'Plan yukseltme',
    detail: 'Deniz Restaurant: Pro → Enterprise',
    time: '3 saat once',
  },
  {
    id: 'LOG-008',
    type: 'registration',
    message: 'Yeni restoran kaydoldu',
    detail: 'Anadolu Sofrasi - Izmir, Alsancak',
    time: '4 saat once',
  },
];

// =============================================================================
// Activity Type Helpers
// =============================================================================

const ACTIVITY_TYPE_MAP: Record<
  ActivityLogEntry['type'],
  { icon: typeof Building2; classes: string; dotColor: string }
> = {
  registration: {
    icon: UserCheck,
    classes: 'bg-emerald-500/10 text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  upgrade: {
    icon: ArrowRight,
    classes: 'bg-accent-blue/10 text-accent-blue',
    dotColor: 'bg-accent-blue',
  },
  alert: {
    icon: AlertTriangle,
    classes: 'bg-amber-500/10 text-amber-400',
    dotColor: 'bg-amber-400',
  },
  cancellation: {
    icon: XCircle,
    classes: 'bg-red-500/10 text-red-400',
    dotColor: 'bg-red-400',
  },
  config: {
    icon: Settings,
    classes: 'bg-accent-purple/10 text-accent-purple',
    dotColor: 'bg-accent-purple',
  },
};

// =============================================================================
// Custom Recharts Tooltip
// =============================================================================

interface CustomTooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-bg-dark/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name === 'siparisler'
            ? `${entry.name}: ${entry.value.toLocaleString('tr-TR')}`
            : `${entry.name}: ${entry.value.toLocaleString('tr-TR')}`}
        </p>
      ))}
    </div>
  );
}

// =============================================================================
// Custom Pie Label
// =============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function renderPieLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#F0F4FF"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// =============================================================================
// Dashboard Page
// =============================================================================

export default function SuperAdminDashboardPage() {
  const totalPlans = MOCK_PLAN_DISTRIBUTION.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-main">
          Platform Yonetimi
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Platformun genel durumunu ve buyume metriklerini buradan takip edebilirsiniz.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards Row                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {MOCK_KPI.map((kpi, index) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            prefix={kpi.prefix}
            suffix={kpi.suffix}
            decimals={kpi.decimals}
            trend={kpi.trend}
            trendLabel={kpi.trendLabel}
            icon={kpi.icon}
            accentColor={kpi.accentColor}
            className={cn(
              index === 0 && 'sm:col-span-2 lg:col-span-1'
            )}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts Row: Monthly Growth + Plan Distribution                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Monthly Growth Line Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">
                Aylik Buyume
              </h2>
              <p className="text-xs text-text-muted">Restoran sayisi ve siparis trendi</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
                Restoranlar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-orange" />
                Siparisler
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MONTHLY_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="ay"
                  tick={{ fill: '#8892A4', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#8892A4', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#8892A4', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="restoranlar"
                  name="restoranlar"
                  stroke="#00D4FF"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#00D4FF', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#00D4FF', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="siparisler"
                  name="siparisler"
                  stroke="#FF6B2B"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 3, fill: '#FF6B2B', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#FF6B2B', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution Pie Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-text-main">
              Plan Dagilimi
            </h2>
            <p className="text-xs text-text-muted">
              Toplam {totalPlans.toLocaleString('tr-TR')} restoran
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_PLAN_DISTRIBUTION}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={false}
                >
                  {MOCK_PLAN_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0];
                    return (
                      <div className="rounded-lg border border-white/10 bg-bg-dark/95 px-3 py-2 shadow-xl backdrop-blur-xl">
                        <p className="text-sm font-semibold text-text-main">
                          {data.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {(data.value as number).toLocaleString('tr-TR')} restoran
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {MOCK_PLAN_DISTRIBUTION.map((plan) => (
              <span key={plan.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
                {plan.name} ({plan.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Recent Activity Feed                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-text-main">
              Son Aktiviteler
            </h2>
            <p className="text-xs text-text-muted">Platform uzerindeki son islemler</p>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-accent-blue transition-colors hover:text-accent-blue/80">
            Tum Loglar
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-white/10" />

          <div className="flex flex-col gap-0">
            {MOCK_ACTIVITY_LOG.map((entry) => {
              const typeInfo = ACTIVITY_TYPE_MAP[entry.type];
              const Icon = typeInfo.icon;

              return (
                <div
                  key={entry.id}
                  className="group relative flex items-start gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-white/5"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      typeInfo.classes
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-main">
                        {entry.message}
                      </p>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-text-muted">
                        <Clock className="h-3 w-3" />
                        {entry.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {entry.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
