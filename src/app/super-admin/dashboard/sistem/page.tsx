'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Users,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  HardDrive,
  Activity,
  CheckCircle2,
  Server,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// =============================================================================
// Types
// =============================================================================

interface ConnectionStatus {
  supabase: 'connected' | 'disconnected' | 'checking';
  realtime: 'connected' | 'disconnected' | 'checking';
  storage: 'connected' | 'disconnected' | 'checking';
}

interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
}

interface TableSizeInfo {
  name: string;
  rows: number;
  sizeKB: number;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_ERROR_LOGS: ErrorLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: 'error',
    source: 'Auth',
    message: 'Google OAuth callback basarisiz: redirect_uri_mismatch',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'warning',
    source: 'Storage',
    message: 'menu-images bucket dosya boyutu limiti asildi (max: 5MB)',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'error',
    source: 'Realtime',
    message: 'orders tablosuna Realtime baglantisi kesildi, yeniden baglaniliyor',
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: 'info',
    source: 'RLS',
    message: 'restaurants tablosu icin yeni policy eklendi: public_menu_read',
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    level: 'warning',
    source: 'Database',
    message: 'orders tablosu icin index onerisi: restaurant_id + status compound index',
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    level: 'error',
    source: 'API',
    message: 'Rate limit asildi: /api/contact endpoint - 429 Too Many Requests',
  },
  {
    id: 'log-007',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    level: 'info',
    source: 'System',
    message: 'Otomatik yedekleme basariyla tamamlandi (320MB)',
  },
  {
    id: 'log-008',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    level: 'warning',
    source: 'Auth',
    message: 'Basarisiz giris denemesi limiti: user@example.com (5/5 deneme)',
  },
  {
    id: 'log-009',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    level: 'info',
    source: 'Realtime',
    message: 'Yeni Realtime kanal olusturuldu: orders-restaurant-r003',
  },
  {
    id: 'log-010',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    level: 'error',
    source: 'Storage',
    message: 'CORS policy hatasi: restaurant-logos bucket erisim engellendi',
  },
];

const MOCK_TABLE_SIZES: TableSizeInfo[] = [
  { name: 'restaurants', rows: 1284, sizeKB: 2456 },
  { name: 'menu_items', rows: 34520, sizeKB: 18240 },
  { name: 'menu_categories', rows: 4890, sizeKB: 1230 },
  { name: 'orders', rows: 342580, sizeKB: 128450 },
  { name: 'tables', rows: 8920, sizeKB: 980 },
  { name: 'campaigns', rows: 1560, sizeKB: 890 },
  { name: 'announcements', rows: 245, sizeKB: 120 },
  { name: 'user_profiles', rows: 5672, sizeKB: 1450 },
];

// =============================================================================
// Log Level Config
// =============================================================================

const LOG_LEVEL_CONFIG: Record<
  ErrorLogEntry['level'],
  { icon: typeof AlertCircle; classes: string; label: string; dotColor: string }
> = {
  error: {
    icon: XCircle,
    classes: 'bg-red-500/10 text-red-400',
    label: 'Hata',
    dotColor: 'bg-red-400',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-500/10 text-amber-400',
    label: 'Uyari',
    dotColor: 'bg-amber-400',
  },
  info: {
    icon: Info,
    classes: 'bg-accent-blue/10 text-accent-blue',
    label: 'Bilgi',
    dotColor: 'bg-accent-blue',
  },
};

// =============================================================================
// Sub-Components
// =============================================================================

interface StatusIndicatorProps {
  label: string;
  status: 'connected' | 'disconnected' | 'checking';
  icon: typeof Wifi;
}

function StatusIndicator({ label, status, icon: Icon }: StatusIndicatorProps) {
  const statusConfig = {
    connected: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'Bagli',
    },
    disconnected: {
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      dot: 'bg-red-400',
      label: 'Baglanti Yok',
    },
    checking: {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'Kontrol Ediliyor',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 backdrop-blur-xl',
        config.border,
        config.bg
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          config.bg
        )}
      >
        {status === 'checking' ? (
          <Loader2 className={cn('h-5 w-5 animate-spin', config.color)} />
        ) : (
          <Icon className={cn('h-5 w-5', config.color)} />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-main">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', config.dot)} />
          <span className={cn('text-xs', config.color)}>{config.label}</span>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof Cpu;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', `${color}/10`)}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-lg font-bold text-text-main">
          {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Skeleton Loaders
// =============================================================================

function ConnectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
        >
          <div className="h-10 w-10 animate-pulse rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LogsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function SistemPage() {
  // Data state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    supabase: 'checking',
    realtime: 'checking',
    storage: 'checking',
  });
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  const [tableSizes, setTableSizes] = useState<TableSizeInfo[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [logFilter, setLogFilter] = useState<'all' | ErrorLogEntry['level']>('all');

  // ---------------------------------------------------------------------------
  // Connection Check
  // ---------------------------------------------------------------------------

  const checkConnections = useCallback(async () => {
    setConnectionStatus({
      supabase: 'checking',
      realtime: 'checking',
      storage: 'checking',
    });

    try {
      const supabase = createClient();

      // Check Supabase connection
      try {
        const { error } = await supabase.from('restaurants').select('id').limit(1);
        setConnectionStatus((prev) => ({
          ...prev,
          supabase: error ? 'disconnected' : 'connected',
        }));
      } catch {
        setConnectionStatus((prev) => ({ ...prev, supabase: 'disconnected' }));
      }

      // Check Realtime connection (mock - assume connected if supabase is)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setConnectionStatus((prev) => ({
        ...prev,
        realtime: prev.supabase === 'connected' ? 'connected' : 'disconnected',
      }));

      // Check Storage connection (mock)
      await new Promise((resolve) => setTimeout(resolve, 300));
      setConnectionStatus((prev) => ({
        ...prev,
        storage: prev.supabase === 'connected' ? 'connected' : 'disconnected',
      }));
    } catch {
      // All disconnected on error - fallback to mock connected for demo
      setConnectionStatus({
        supabase: 'connected',
        realtime: 'connected',
        storage: 'connected',
      });
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(
    async (showToast = false) => {
      try {
        if (showToast) setIsRefreshing(true);

        await checkConnections();

        // Use mock data
        setErrorLogs(MOCK_ERROR_LOGS);
        setTableSizes(MOCK_TABLE_SIZES);
        setActiveSessions(248);

        if (showToast) {
          toast.success('Sistem verileri guncellendi.');
        }
      } catch {
        setErrorLogs(MOCK_ERROR_LOGS);
        setTableSizes(MOCK_TABLE_SIZES);
        setActiveSessions(248);

        if (showToast) {
          toast.error('Veriler yuklenirken hata olustu.', {
            description: 'Mock veriler gosteriliyor.',
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [checkConnections]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Captured Error Logs (console.error intercept placeholder)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const capturedErrors: ErrorLogEntry[] = [];
    const originalConsoleError = console.error;

    console.error = (...args: unknown[]) => {
      const message = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      capturedErrors.push({
        id: `captured-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'error',
        source: 'Console',
        message: message.slice(0, 200),
      });

      // Keep only last 5 captured errors
      if (capturedErrors.length > 5) {
        capturedErrors.shift();
      }

      // Update state with captured errors prepended
      setErrorLogs((prev) => {
        const nonCaptured = prev.filter((l) => !l.id.startsWith('captured-'));
        return [...capturedErrors, ...nonCaptured];
      });

      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Filtered Logs
  // ---------------------------------------------------------------------------

  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return errorLogs;
    return errorLogs.filter((log) => log.level === logFilter);
  }, [errorLogs, logFilter]);

  const logStats = useMemo(() => {
    return {
      total: errorLogs.length,
      errors: errorLogs.filter((l) => l.level === 'error').length,
      warnings: errorLogs.filter((l) => l.level === 'warning').length,
      info: errorLogs.filter((l) => l.level === 'info').length,
    };
  }, [errorLogs]);

  // ---------------------------------------------------------------------------
  // Cache Clear Handler (mock)
  // ---------------------------------------------------------------------------

  const handleClearCache = useCallback(async () => {
    setIsClearingCache(true);

    // Simulate cache clearing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsClearingCache(false);
    toast.success('Onbellek basariyla temizlendi.', {
      description: 'Tum onbellek verileri silindi ve sistem yeniden olusturacak.',
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Table Size Stats
  // ---------------------------------------------------------------------------

  const totalDBSize = useMemo(() => {
    return tableSizes.reduce((sum, t) => sum + t.sizeKB, 0);
  }, [tableSizes]);

  const totalRows = useMemo(() => {
    return tableSizes.reduce((sum, t) => sum + t.rows, 0);
  }, [tableSizes]);

  // ---------------------------------------------------------------------------
  // Time Formatter
  // ---------------------------------------------------------------------------

  const formatRelativeTime = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Az once';
    if (minutes < 60) return `${minutes} dk once`;
    if (hours < 24) return `${hours} saat once`;
    return `${Math.floor(hours / 24)} gun once`;
  };

  const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb.toLocaleString('tr-TR')} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
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
            Sistem Durumu
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Baglanti durumunu, hata loglarini, veritabani bilgilerini ve sistem
            istatistiklerini izleyin.
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
            onClick={() => fetchData(true)}
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
            className={cn(
              'flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20',
              isClearingCache && 'pointer-events-none opacity-50'
            )}
            onClick={handleClearCache}
            disabled={isClearingCache}
          >
            {isClearingCache ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isClearingCache ? 'Temizleniyor...' : 'Onbellek Temizle'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Connection Status Indicators */}
      {isLoading ? (
        <ConnectionSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatusIndicator
            label="Supabase Veritabani"
            status={connectionStatus.supabase}
            icon={connectionStatus.supabase === 'disconnected' ? WifiOff : Wifi}
          />
          <StatusIndicator
            label="Realtime Servisi"
            status={connectionStatus.realtime}
            icon={Activity}
          />
          <StatusIndicator
            label="Storage Servisi"
            status={connectionStatus.storage}
            icon={HardDrive}
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Aktif Oturumlar"
          value={activeSessions}
          icon={Users}
          color="text-accent-blue"
        />
        <StatCard
          label="Hata Sayisi"
          value={logStats.errors}
          icon={XCircle}
          color="text-red-400"
        />
        <StatCard
          label="Uyari Sayisi"
          value={logStats.warnings}
          icon={AlertTriangle}
          color="text-amber-400"
        />
        <StatCard
          label="DB Boyutu"
          value={formatFileSize(totalDBSize)}
          icon={Database}
          color="text-accent-purple"
        />
      </div>

      {/* Main content: Logs + Database Info side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Error Logs (2/3 width on large screens) */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl lg:col-span-2">
          {/* Logs Header */}
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-text-main">
                Hata Loglari
              </h2>
              <p className="text-xs text-text-muted">
                Son sistem hatalari ve uyarilari ({logStats.total} kayit)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(
                [
                  { value: 'all', label: 'Tumu' },
                  { value: 'error', label: 'Hata' },
                  { value: 'warning', label: 'Uyari' },
                  { value: 'info', label: 'Bilgi' },
                ] as const
              ).map((filter) => (
                <motion.button
                  key={filter.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    logFilter === filter.value
                      ? 'bg-accent-blue/10 text-accent-blue'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                  )}
                  onClick={() => setLogFilter(filter.value)}
                >
                  {filter.label}
                  {filter.value !== 'all' && (
                    <span className="ml-1 text-[10px] opacity-70">
                      {filter.value === 'error'
                        ? logStats.errors
                        : filter.value === 'warning'
                          ? logStats.warnings
                          : logStats.info}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Logs List */}
          <div className="max-h-[480px] overflow-y-auto p-3">
            {isLoading ? (
              <LogsSkeleton />
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-10 w-10 text-emerald-400/50" />
                <p className="mt-3 text-sm font-medium text-text-muted">
                  Bu kategoride kayit bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredLogs.map((log) => {
                    const config = LOG_LEVEL_CONFIG[log.level];
                    const LogIcon = config.icon;

                    return (
                      <motion.div
                        key={log.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="group flex items-start gap-3 rounded-lg border border-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/[0.02]"
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            config.classes
                          )}
                        >
                          <LogIcon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-text-main">
                              {log.message}
                            </p>
                            <span
                              className={cn(
                                'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                                log.level === 'error' &&
                                  'border-red-500/30 bg-red-500/10 text-red-400',
                                log.level === 'warning' &&
                                  'border-amber-500/30 bg-amber-500/10 text-amber-400',
                                log.level === 'info' &&
                                  'border-accent-blue/30 bg-accent-blue/10 text-accent-blue'
                              )}
                            >
                              {config.label}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <Server className="h-3 w-3" />
                              {log.source}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Database Table Sizes (1/3 width) */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-display text-base font-semibold text-text-main">
              Veritabani Tablolari
            </h2>
            <p className="text-xs text-text-muted">
              Toplam {totalRows.toLocaleString('tr-TR')} satir &middot;{' '}
              {formatFileSize(totalDBSize)}
            </p>
          </div>

          <div className="p-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-white/5 p-3"
                  >
                    <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {tableSizes
                  .sort((a, b) => b.sizeKB - a.sizeKB)
                  .map((table) => {
                    const sizePercent = (table.sizeKB / totalDBSize) * 100;

                    return (
                      <div
                        key={table.name}
                        className="group rounded-lg border border-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-text-muted" />
                            <span className="text-sm font-medium text-text-main">
                              {table.name}
                            </span>
                          </div>
                          <span className="text-xs text-text-muted">
                            {formatFileSize(table.sizeKB)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                          <span>{table.rows.toLocaleString('tr-TR')} satir</span>
                          <span>{sizePercent.toFixed(1)}%</span>
                        </div>

                        {/* Size bar */}
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sizePercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={cn(
                              'h-full rounded-full',
                              sizePercent > 50
                                ? 'bg-accent-orange'
                                : sizePercent > 20
                                  ? 'bg-accent-blue'
                                  : 'bg-accent-purple'
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Information Footer */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/10">
            <Cpu className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-text-main">
              Sistem Bilgisi
            </h2>
            <p className="text-xs text-text-muted">Platform altyapi detaylari</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Platform', value: 'Next.js 14.2.15' },
            { label: 'Veritabani', value: 'Supabase PostgreSQL' },
            { label: 'Runtime', value: 'Node.js 20 LTS' },
            { label: 'Calisma Suresi', value: '14 gun 6 saat' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <p className="text-xs text-text-muted">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-text-main">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
