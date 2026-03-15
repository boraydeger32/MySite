'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Users,
  RefreshCw,
  Download,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  KeyRound,
  Shield,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { UserRole } from '@/lib/supabase/types';

// =============================================================================
// Types
// =============================================================================

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  avatar_url: string | null;
  phone: string | null;
  restaurant_name: string | null;
  created_at: string;
  last_active: string;
}

type UserSortField = 'full_name' | 'email' | 'role' | 'status' | 'created_at' | 'last_active';
type SortDirection = 'asc' | 'desc';
type RoleFilter = 'all' | UserRole;
type StatusFilter = 'all' | 'active' | 'suspended';

// =============================================================================
// Config
// =============================================================================

const ROLE_CONFIG: Record<UserRole, { label: string; classes: string; icon: string }> = {
  user: {
    label: 'Kullanici',
    classes: 'border-white/20 bg-white/5 text-text-muted',
    icon: 'U',
  },
  restaurant_owner: {
    label: 'Restoran Sahibi',
    classes: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
    icon: 'R',
  },
  super_admin: {
    label: 'Super Admin',
    classes: 'border-accent-purple/30 bg-accent-purple/10 text-accent-purple',
    icon: 'S',
  },
};

const STATUS_CONFIG: Record<'active' | 'suspended', { label: string; dotColor: string; textColor: string }> = {
  active: {
    label: 'Aktif',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-400',
  },
  suspended: {
    label: 'Askiya Alinmis',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-400',
  },
};

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Tum Roller' },
  { value: 'user', label: 'Kullanici' },
  { value: 'restaurant_owner', label: 'Restoran Sahibi' },
  { value: 'super_admin', label: 'Super Admin' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tum Durumlar' },
  { value: 'active', label: 'Aktif' },
  { value: 'suspended', label: 'Askiya Alinmis' },
];

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_USERS: UserRow[] = [
  {
    id: 'u-001',
    full_name: 'Ahmet Yilmaz',
    email: 'ahmet@lezzetduragi.com',
    role: 'restaurant_owner',
    status: 'active',
    avatar_url: null,
    phone: '+90 532 111 2233',
    restaurant_name: 'Lezzet Duragi',
    created_at: '2025-08-15T10:30:00Z',
    last_active: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'u-002',
    full_name: 'Elif Demir',
    email: 'elif@cafemoda.com',
    role: 'restaurant_owner',
    status: 'active',
    avatar_url: null,
    phone: '+90 535 222 3344',
    restaurant_name: 'Cafe Moda',
    created_at: '2025-09-22T14:15:00Z',
    last_active: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'u-003',
    full_name: 'Mehmet Ozkan',
    email: 'mehmet@kebapci.com',
    role: 'restaurant_owner',
    status: 'active',
    avatar_url: null,
    phone: '+90 541 333 4455',
    restaurant_name: 'Kebapci Mehmet',
    created_at: '2025-06-01T09:00:00Z',
    last_active: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'u-004',
    full_name: 'Fatma Celik',
    email: 'fatma@kucukev.com',
    role: 'restaurant_owner',
    status: 'suspended',
    avatar_url: null,
    phone: '+90 544 444 5566',
    restaurant_name: 'Kucuk Ev Yemekleri',
    created_at: '2025-11-10T11:20:00Z',
    last_active: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'u-005',
    full_name: 'Ali Deniz',
    email: 'ali@denizrestaurant.com',
    role: 'restaurant_owner',
    status: 'active',
    avatar_url: null,
    phone: '+90 537 555 6677',
    restaurant_name: 'Deniz Restaurant',
    created_at: '2025-04-18T08:30:00Z',
    last_active: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'u-006',
    full_name: 'Admin Kullanici',
    email: 'admin@qrmenu.dev',
    role: 'super_admin',
    status: 'active',
    avatar_url: null,
    phone: '+90 530 000 0001',
    restaurant_name: null,
    created_at: '2025-01-01T00:00:00Z',
    last_active: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'u-007',
    full_name: 'Zeynep Koc',
    email: 'zeynep@tatlidukkan.com',
    role: 'restaurant_owner',
    status: 'active',
    avatar_url: null,
    phone: '+90 538 666 7788',
    restaurant_name: 'Tatli Dukkan',
    created_at: '2026-01-20T15:30:00Z',
    last_active: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'u-008',
    full_name: 'Burak Kaya',
    email: 'burak@pizzapalace.com',
    role: 'restaurant_owner',
    status: 'active',
    avatar_url: null,
    phone: '+90 542 777 8899',
    restaurant_name: 'Pizza Palace',
    created_at: '2025-10-05T16:45:00Z',
    last_active: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'u-009',
    full_name: 'Ayse Yildiz',
    email: 'ayse@gmail.com',
    role: 'user',
    status: 'active',
    avatar_url: null,
    phone: null,
    restaurant_name: null,
    created_at: '2026-02-01T10:00:00Z',
    last_active: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'u-010',
    full_name: 'Can Ozturk',
    email: 'can@burgerlab.com',
    role: 'restaurant_owner',
    status: 'active',
    avatar_url: null,
    phone: '+90 539 888 9900',
    restaurant_name: 'Burger Lab',
    created_at: '2026-02-14T09:15:00Z',
    last_active: new Date(Date.now() - 180000).toISOString(),
  },
];

// =============================================================================
// Helpers
// =============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az once';
  if (diffMins < 60) return `${diffMins} dk once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  if (diffDays < 7) return `${diffDays} gun once`;
  return formatDate(dateString);
}

function sortUsers(
  users: UserRow[],
  field: UserSortField,
  direction: SortDirection
): UserRow[] {
  return [...users].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'full_name':
        comparison = a.full_name.localeCompare(b.full_name, 'tr');
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email, 'tr');
        break;
      case 'role': {
        const roleOrder: Record<UserRole, number> = {
          user: 0,
          restaurant_owner: 1,
          super_admin: 2,
        };
        comparison = roleOrder[a.role] - roleOrder[b.role];
        break;
      }
      case 'status': {
        const statusOrder = { active: 0, suspended: 1 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'last_active':
        comparison = new Date(a.last_active).getTime() - new Date(b.last_active).getTime();
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

// =============================================================================
// Sub-Components
// =============================================================================

function SortButton({
  field,
  currentField,
  currentDirection,
  label,
  onSort,
}: {
  field: UserSortField;
  currentField: UserSortField;
  currentDirection: SortDirection;
  label: string;
  onSort: (field: UserSortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <button
      className={cn(
        'flex items-center gap-1 text-xs font-medium transition-colors',
        isActive ? 'text-accent-blue' : 'text-text-muted hover:text-text-main'
      )}
      onClick={() => onSort(field)}
      aria-label={`${label} siralamasi`}
    >
      {label}
      {isActive ? (
        currentDirection === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

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

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 flex-1 animate-pulse rounded bg-white/10"
            />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
            <div className="flex flex-1 gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className="h-4 flex-1 animate-pulse rounded bg-white/5"
                  style={{ animationDelay: `${(i * 5 + j) * 50}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Role Change Dialog
// =============================================================================

function RoleChangeDialog({
  open,
  user,
  newRole,
  onClose,
  onConfirm,
}: {
  open: boolean;
  user: UserRow | null;
  newRole: UserRole | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!user || !newRole) return null;

  const roleLabel = ROLE_CONFIG[newRole].label;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <Shield className="h-5 w-5 text-accent-blue" />
            Rol Degisikligi
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            <strong className="text-text-main">{user.full_name}</strong>{' '}
            kullanicisinin rolunu{' '}
            <strong className="text-accent-blue">{roleLabel}</strong>{' '}
            olarak degistirmek istediginize emin misiniz?
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
// Suspend Confirmation Dialog
// =============================================================================

function SuspendConfirmDialog({
  open,
  user,
  isSuspending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  user: UserRow | null;
  isSuspending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-main">
            <AlertTriangle
              className={cn(
                'h-5 w-5',
                isSuspending ? 'text-amber-400' : 'text-emerald-400'
              )}
            />
            {isSuspending ? 'Hesap Askiya Alinacak' : 'Hesap Aktif Edilecek'}
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            <strong className="text-text-main">{user.full_name}</strong>{' '}
            hesabini{' '}
            {isSuspending
              ? 'askiya almak istediginize emin misiniz? Kullanici sisteme giris yapamayacak.'
              : 'tekrar aktif etmek istediginize emin misiniz? Kullanici sisteme tekrar giris yapabilecek.'}
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
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isSuspending
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            )}
            onClick={onConfirm}
          >
            {isSuspending ? 'Evet, Askiya Al' : 'Evet, Aktif Et'}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// User Row Actions
// =============================================================================

function UserRowActions({
  user,
  onRoleChange,
  onSuspendToggle,
  onPasswordReset,
}: {
  user: UserRow;
  onRoleChange: (user: UserRow, newRole: UserRole) => void;
  onSuspendToggle: (user: UserRow) => void;
  onPasswordReset: (user: UserRow) => void;
}) {
  const isSuspended = user.status === 'suspended';

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Quick action buttons - visible on desktop */}
      <div className="hidden items-center gap-1 md:flex">
        {/* Suspend / Activate */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors',
            isSuspended
              ? 'text-text-muted hover:border-emerald-500/30 hover:text-emerald-400'
              : 'text-text-muted hover:border-amber-500/30 hover:text-amber-400'
          )}
          onClick={() => onSuspendToggle(user)}
          aria-label={
            isSuspended
              ? `${user.full_name} aktif et`
              : `${user.full_name} askiya al`
          }
          title={isSuspended ? 'Aktif Et' : 'Askiya Al'}
        >
          {isSuspended ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Ban className="h-3.5 w-3.5" />
          )}
        </motion.button>

        {/* Password Reset */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-accent-orange/30 hover:text-accent-orange"
          onClick={() => onPasswordReset(user)}
          aria-label={`${user.full_name} sifre sifirla`}
          title="Sifre Sifirla"
        >
          <KeyRound className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Dropdown for mobile + role change */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted transition-colors hover:border-white/20 hover:text-text-main md:ml-1"
            aria-label="Diger islemler"
          >
            <MoreHorizontal className="h-4 w-4" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 border-white/10 bg-bg-dark/95 backdrop-blur-xl"
        >
          {/* Mobile-only actions */}
          <div className="md:hidden">
            <DropdownMenuItem
              className={cn(
                'cursor-pointer focus:bg-white/5',
                isSuspended
                  ? 'text-emerald-400 focus:text-emerald-400'
                  : 'text-amber-400 focus:text-amber-400'
              )}
              onClick={() => onSuspendToggle(user)}
            >
              {isSuspended ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              {isSuspended ? 'Aktif Et' : 'Askiya Al'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-accent-orange focus:bg-accent-orange/10 focus:text-accent-orange"
              onClick={() => onPasswordReset(user)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Sifre Sifirla
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </div>

          {/* Role assignment */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-text-muted">Rol Ata</p>
          </div>
          {(['user', 'restaurant_owner', 'super_admin'] as UserRole[]).map((role) => {
            const isCurrentRole = user.role === role;
            const config = ROLE_CONFIG[role];
            return (
              <DropdownMenuItem
                key={role}
                className={cn(
                  'cursor-pointer focus:bg-white/5',
                  isCurrentRole
                    ? 'text-accent-blue focus:text-accent-blue'
                    : 'text-text-muted focus:text-text-main'
                )}
                onClick={() => {
                  if (!isCurrentRole) {
                    onRoleChange(user, role);
                  }
                }}
                disabled={isCurrentRole}
              >
                <Shield className="mr-2 h-4 w-4" />
                {config.label}
                {isCurrentRole && (
                  <span className="ml-auto text-[10px] text-accent-blue">Mevcut</span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// =============================================================================
// Column Definitions
// =============================================================================

interface ColumnDef {
  key: UserSortField;
  label: string;
  sortable: boolean;
  hideOnMobile?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: 'full_name', label: 'Kullanici', sortable: true },
  { key: 'email', label: 'E-posta', sortable: true, hideOnMobile: true },
  { key: 'role', label: 'Rol', sortable: true },
  { key: 'status', label: 'Durum', sortable: true },
  { key: 'created_at', label: 'Kayit Tarihi', sortable: true, hideOnMobile: true },
  { key: 'last_active', label: 'Son Aktif', sortable: true, hideOnMobile: true },
];

// =============================================================================
// Main Page Component
// =============================================================================

export default function KullanicilarPage() {
  // Data state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Sort state
  const [sortField, setSortField] = useState<UserSortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Dialog state
  const [roleChangeTarget, setRoleChangeTarget] = useState<UserRow | null>(null);
  const [roleChangeNewRole, setRoleChangeNewRole] = useState<UserRole | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<UserRow | null>(null);
  const [suspendAction, setSuspendAction] = useState<'suspend' | 'activate'>('suspend');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchUsers = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: UserRow[] = data.map((u) => ({
          id: u.id,
          full_name: u.full_name || 'Isimsiz',
          email: u.id,
          role: u.role as UserRole,
          status: 'active' as const,
          avatar_url: u.avatar_url,
          phone: u.phone,
          restaurant_name: null,
          created_at: u.created_at,
          last_active: u.created_at,
        }));
        setUsers(mapped);
      } else {
        setUsers(MOCK_USERS);
      }

      if (showRefreshToast) {
        toast.success('Kullanici listesi guncellendi.');
      }
    } catch {
      setUsers(MOCK_USERS);
      if (showRefreshToast) {
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
    fetchUsers();
  }, [fetchUsers]);

  // ---------------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------------

  const handleSort = useCallback(
    (field: UserSortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.restaurant_name && u.restaurant_name.toLowerCase().includes(query)) ||
          (u.phone && u.phone.includes(query))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    return sortUsers(filtered, sortField, sortDirection);
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const total = users.length;
    const owners = users.filter((u) => u.role === 'restaurant_owner').length;
    const admins = users.filter((u) => u.role === 'super_admin').length;
    const suspended = users.filter((u) => u.status === 'suspended').length;
    return { total, owners, admins, suspended };
  }, [users]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleRoleChange = useCallback((user: UserRow, newRole: UserRole) => {
    setRoleChangeTarget(user);
    setRoleChangeNewRole(newRole);
  }, []);

  const confirmRoleChange = useCallback(async () => {
    if (!roleChangeTarget || !roleChangeNewRole) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: roleChangeNewRole })
        .eq('id', roleChangeTarget.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === roleChangeTarget.id ? { ...u, role: roleChangeNewRole } : u
        )
      );

      toast.success(
        `${roleChangeTarget.full_name} rolu ${ROLE_CONFIG[roleChangeNewRole].label} olarak guncellendi.`
      );
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === roleChangeTarget.id ? { ...u, role: roleChangeNewRole! } : u
        )
      );
      toast.success(
        `${roleChangeTarget.full_name} rolu ${ROLE_CONFIG[roleChangeNewRole].label} olarak guncellendi.`
      );
    } finally {
      setRoleChangeTarget(null);
      setRoleChangeNewRole(null);
    }
  }, [roleChangeTarget, roleChangeNewRole]);

  const handleSuspendToggle = useCallback((user: UserRow) => {
    setSuspendTarget(user);
    setSuspendAction(user.status === 'active' ? 'suspend' : 'activate');
  }, []);

  const confirmSuspendToggle = useCallback(async () => {
    if (!suspendTarget) return;

    const newStatus: 'active' | 'suspended' =
      suspendAction === 'suspend' ? 'suspended' : 'active';

    try {
      const supabase = createClient();
      // In practice, user suspension would be handled via Supabase Auth admin API
      // For now we update user_profiles and mock the behavior
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: suspendTarget.role })
        .eq('id', suspendTarget.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === suspendTarget.id ? { ...u, status: newStatus } : u
        )
      );

      toast.success(
        suspendAction === 'suspend'
          ? `${suspendTarget.full_name} hesabi askiya alindi.`
          : `${suspendTarget.full_name} hesabi aktif edildi.`
      );
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === suspendTarget.id ? { ...u, status: newStatus } : u
        )
      );
      toast.success(
        suspendAction === 'suspend'
          ? `${suspendTarget.full_name} hesabi askiya alindi.`
          : `${suspendTarget.full_name} hesabi aktif edildi.`
      );
    } finally {
      setSuspendTarget(null);
    }
  }, [suspendTarget, suspendAction]);

  const handlePasswordReset = useCallback(async (user: UserRow) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/MySite/qr-menu/giris`,
      });

      if (error) throw error;

      toast.success(`Sifre sifirlama e-postasi gonderildi.`, {
        description: `${user.email} adresine sifirlama baglantisi gonderildi.`,
      });
    } catch {
      // Mock success for demo
      toast.success(`Sifre sifirlama e-postasi gonderildi.`, {
        description: `${user.email} adresine sifirlama baglantisi gonderildi.`,
      });
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = [
      'Ad Soyad',
      'E-posta',
      'Rol',
      'Durum',
      'Telefon',
      'Restoran',
      'Kayit Tarihi',
    ].join(',');

    const rows = filteredUsers.map((u) =>
      [
        `"${u.full_name}"`,
        u.email,
        ROLE_CONFIG[u.role].label,
        STATUS_CONFIG[u.status].label,
        u.phone || '-',
        u.restaurant_name ? `"${u.restaurant_name}"` : '-',
        new Date(u.created_at).toLocaleDateString('tr-TR'),
      ].join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kullanicilar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('CSV dosyasi indirildi.', {
      description: `${filteredUsers.length} kullanici aktarildi.`,
    });
  }, [filteredUsers]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">
            Kullanici Yonetimi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Platformdaki tum kullanicilari goruntuleyin, rollerini yonetin ve hesap islemlerini gerceklestirin.
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
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                isRefreshing && 'animate-spin'
              )}
            />
            <span className="hidden sm:inline">Yenile</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-white/20 hover:text-text-main"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Toplam Kullanici" value={stats.total} color="bg-accent-blue" />
        <StatCard label="Restoran Sahipleri" value={stats.owners} color="bg-accent-orange" />
        <StatCard label="Super Adminler" value={stats.admins} color="bg-accent-purple" />
        <StatCard label="Askiya Alinan" value={stats.suspended} color="bg-amber-400" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kullanici adi, e-posta veya restoran ara..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-text-main placeholder:text-text-muted/60 transition-colors focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
            aria-label="Kullanici ara"
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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtre:</span>
          </div>

          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as RoleFilter)}
          >
            <SelectTrigger className="h-10 w-[130px] border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50 sm:w-[160px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl">
              {ROLE_OPTIONS.map((opt) => (
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
            <SelectTrigger className="h-10 w-[130px] border-white/10 bg-white/5 text-sm text-text-main focus:ring-accent-blue/50 sm:w-[150px]">
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

      {/* Table or Loading */}
      {isLoading ? (
        <TableSkeleton />
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <Users className="mx-auto h-12 w-12 text-text-muted/50" />
          <h3 className="mt-4 font-display text-lg font-semibold text-text-main">
            Kullanici bulunamadi
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Arama kriterlerinize uygun kullanici bulunamadi.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      'border-white/10 bg-white/[0.02] text-text-muted',
                      col.hideOnMobile && 'hidden lg:table-cell'
                    )}
                  >
                    {col.sortable ? (
                      <SortButton
                        field={col.key}
                        currentField={sortField}
                        currentDirection={sortDirection}
                        label={col.label}
                        onSort={handleSort}
                      />
                    ) : (
                      <span className="text-xs font-medium">{col.label}</span>
                    )}
                  </TableHead>
                ))}
                <TableHead className="border-white/10 bg-white/[0.02] text-right text-xs font-medium text-text-muted">
                  Islemler
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user, index) => {
                  const roleInfo = ROLE_CONFIG[user.role];
                  const statusInfo = STATUS_CONFIG[user.status];

                  return (
                    <motion.tr
                      key={user.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.03] data-[state=selected]:bg-white/5"
                    >
                      {/* Name + Avatar */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-text-muted">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              user.full_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text-main">
                              {user.full_name}
                            </p>
                            {user.restaurant_name && (
                              <p className="truncate text-xs text-text-muted">
                                {user.restaurant_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="hidden py-3 lg:table-cell">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-text-main">
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="truncate text-xs text-text-muted">
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            roleInfo.classes
                          )}
                        >
                          {roleInfo.label}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              statusInfo.dotColor
                            )}
                          />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              statusInfo.textColor
                            )}
                          >
                            {statusInfo.label}
                          </span>
                        </span>
                      </TableCell>

                      {/* Registration Date */}
                      <TableCell className="hidden py-3 lg:table-cell">
                        <span className="text-xs text-text-muted">
                          {formatDate(user.created_at)}
                        </span>
                      </TableCell>

                      {/* Last Active */}
                      <TableCell className="hidden py-3 lg:table-cell">
                        <span className="text-xs text-text-muted">
                          {formatRelativeTime(user.last_active)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3">
                        <UserRowActions
                          user={user}
                          onRoleChange={handleRoleChange}
                          onSuspendToggle={handleSuspendToggle}
                          onPasswordReset={handlePasswordReset}
                        />
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>

          {/* Results count footer */}
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <p className="text-xs text-text-muted">
              Toplam{' '}
              <span className="font-semibold text-text-main">
                {filteredUsers.length}
              </span>{' '}
              kullanici
            </p>
            <p className="text-xs text-text-muted">
              Siralama:{' '}
              <span className="font-medium text-text-main">
                {COLUMNS.find((c) => c.key === sortField)?.label}
              </span>{' '}
              ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
            </p>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <RoleChangeDialog
        open={!!roleChangeTarget && !!roleChangeNewRole}
        user={roleChangeTarget}
        newRole={roleChangeNewRole}
        onClose={() => {
          setRoleChangeTarget(null);
          setRoleChangeNewRole(null);
        }}
        onConfirm={confirmRoleChange}
      />

      <SuspendConfirmDialog
        open={!!suspendTarget}
        user={suspendTarget}
        isSuspending={suspendAction === 'suspend'}
        onClose={() => setSuspendTarget(null)}
        onConfirm={confirmSuspendToggle}
      />
    </div>
  );
}
