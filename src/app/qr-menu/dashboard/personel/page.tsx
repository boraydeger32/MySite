'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, UserCheck, UserX, Shield, ChefHat, HandPlatter, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Staff, StaffRole, StaffInsert } from '@/lib/supabase/types';

const ROLE_CONFIG: Record<StaffRole, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  manager: { label: 'Yonetici', color: 'text-violet-400', bg: 'bg-violet-500/10', icon: Shield },
  chef: { label: 'Asci', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ChefHat },
  waiter: { label: 'Garson', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: HandPlatter },
  cashier: { label: 'Kasiyer', color: 'text-sky-400', bg: 'bg-sky-500/10', icon: Wallet },
};

const ROLES: StaffRole[] = ['manager', 'chef', 'waiter', 'cashier'];

export default function PersonelPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<StaffRole | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('waiter');
  const [formPin, setFormPin] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user.id).single();
        if (!restaurant) return;
        setRestaurantId(restaurant.id);
        const { data } = await supabase.from('staff').select('*').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false });
        if (data) setStaff(data as Staff[]);
      } catch { toast.error('Personel verileri yuklenemedi.'); }
      finally { setIsLoading(false); }
    }
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let result = staff;
    if (filterRole !== 'all') result = result.filter(s => s.role === filterRole);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q) || (s.phone ?? '').includes(q));
    }
    return result;
  }, [staff, filterRole, searchQuery]);

  const openForm = useCallback((s?: Staff) => {
    if (s) {
      setEditing(s);
      setFormName(s.name);
      setFormEmail(s.email ?? '');
      setFormPhone(s.phone ?? '');
      setFormRole(s.role);
      setFormPin(s.pin ?? '');
    } else {
      setEditing(null);
      setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole('waiter'); setFormPin('');
    }
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formName.trim()) { toast.error('Ad zorunludur.'); return; }
    if (!restaurantId) return;

    const supabase = createClient();
    if (editing) {
      const { error } = await supabase.from('staff').update({
        name: formName.trim(), email: formEmail.trim() || null, phone: formPhone.trim() || null,
        role: formRole, pin: formPin.trim() || null,
      }).eq('id', editing.id);
      if (error) { toast.error('Guncellenemedi.'); return; }
      setStaff(prev => prev.map(s => s.id === editing.id ? { ...s, name: formName.trim(), email: formEmail.trim() || null, phone: formPhone.trim() || null, role: formRole, pin: formPin.trim() || null } : s));
      toast.success('Personel guncellendi.');
    } else {
      const { data, error } = await supabase.from('staff').insert({
        restaurant_id: restaurantId, user_id: null, name: formName.trim(), email: formEmail.trim() || null,
        phone: formPhone.trim() || null, role: formRole, pin: formPin.trim() || null,
        is_active: true, permissions: [],
      } satisfies StaffInsert).select().single();
      if (error || !data) { toast.error('Personel eklenemedi.'); return; }
      setStaff(prev => [data as Staff, ...prev]);
      toast.success('Personel eklendi.');
    }
    setFormOpen(false);
  }, [formName, formEmail, formPhone, formRole, formPin, editing, restaurantId]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    await supabase.from('staff').delete().eq('id', deleteTarget.id);
    setStaff(prev => prev.filter(s => s.id !== deleteTarget.id));
    toast.success('Personel silindi.');
    setDeleteTarget(null);
  }, [deleteTarget]);

  const toggleActive = useCallback(async (s: Staff) => {
    const supabase = createClient();
    const newActive = !s.is_active;
    await supabase.from('staff').update({ is_active: newActive }).eq('id', s.id);
    setStaff(prev => prev.map(x => x.id === s.id ? { ...x, is_active: newActive } : x));
    toast.success(newActive ? 'Personel aktif edildi.' : 'Personel pasif edildi.');
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">Personel Yonetimi</h1>
          <p className="mt-1 text-sm text-text-muted">{staff.length} personel kayitli</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openForm()}
          className="flex items-center gap-1.5 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange hover:bg-accent-orange/20">
          <Plus className="h-4 w-4" /> Personel Ekle
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Personel ara..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50 focus:outline-none" />
        </div>
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(['all', ...ROLES] as const).map(role => (
            <button key={role} onClick={() => setFilterRole(role)}
              className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors', filterRole === role ? 'bg-accent-orange/10 text-accent-orange' : 'text-text-muted hover:text-text-main')}>
              {role === 'all' ? 'Tumu' : ROLE_CONFIG[role].label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROLES.map(role => {
          const config = ROLE_CONFIG[role];
          const count = staff.filter(s => s.role === role && s.is_active).length;
          return (
            <div key={role} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-text-muted">{config.label}</p>
              <p className={cn('mt-0.5 font-display text-xl font-bold', config.color)}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Staff List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <p className="font-display text-base font-semibold text-text-main">Henuz personel yok</p>
          <p className="mt-1 text-sm text-text-muted">Ilk personelinizi ekleyerek baslayabilirsiniz.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(s => {
              const roleConf = ROLE_CONFIG[s.role];
              const RoleIcon = roleConf.icon;
              return (
                <motion.div key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className={cn('flex items-center gap-4 rounded-lg border bg-white/5 px-4 py-3 transition-colors hover:bg-white/[0.07]', s.is_active ? 'border-white/10' : 'border-white/5 opacity-60')}>
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', roleConf.bg)}>
                    <RoleIcon className={cn('h-5 w-5', roleConf.color)} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-text-main">{s.name}</span>
                    <span className="text-xs text-text-muted">{s.email || s.phone || 'Iletisim bilgisi yok'}</span>
                  </div>
                  <span className={cn('hidden rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:inline-flex', roleConf.bg, roleConf.color)}>{roleConf.label}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted hover:text-text-main" title={s.is_active ? 'Pasif yap' : 'Aktif yap'}>
                      {s.is_active ? <UserCheck className="h-4 w-4 text-emerald-400" /> : <UserX className="h-4 w-4 text-red-400" />}
                    </button>
                    <button onClick={() => openForm(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted hover:text-accent-blue" title="Duzenle">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted hover:text-red-400" title="Sil">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-text-main">{editing ? 'Personel Duzenle' : 'Yeni Personel'}</DialogTitle>
            <DialogDescription className="text-sm text-text-muted">Personel bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div><label className="mb-1 block text-sm font-medium text-text-muted">Ad Soyad *</label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ad Soyad" className="border-white/10 bg-white/5 text-text-main" /></div>
            <div><label className="mb-1 block text-sm font-medium text-text-muted">E-posta</label>
              <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="ornek@email.com" className="border-white/10 bg-white/5 text-text-main" /></div>
            <div><label className="mb-1 block text-sm font-medium text-text-muted">Telefon</label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+90 5XX XXX XX XX" className="border-white/10 bg-white/5 text-text-main" /></div>
            <div><label className="mb-1 block text-sm font-medium text-text-muted">Rol</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button key={r} onClick={() => setFormRole(r)}
                    className={cn('rounded-lg border px-3 py-2 text-sm font-medium transition-colors', formRole === r ? `${ROLE_CONFIG[r].bg} ${ROLE_CONFIG[r].color} border-current/30` : 'border-white/10 bg-white/5 text-text-muted hover:text-text-main')}>
                    {ROLE_CONFIG[r].label}
                  </button>
                ))}
              </div>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-text-muted">PIN (opsiyonel)</label>
              <Input value={formPin} onChange={e => setFormPin(e.target.value)} placeholder="4 haneli PIN" maxLength={6} className="border-white/10 bg-white/5 text-text-main" /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setFormOpen(false)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/10">Iptal</button>
            <button onClick={handleSubmit} className="rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange hover:bg-accent-orange/20">
              {editing ? 'Guncelle' : 'Ekle'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-text-main">Personeli Sil</DialogTitle>
            <DialogDescription className="text-text-muted">&quot;{deleteTarget?.name}&quot; silinecek. Bu islem geri alinamaz.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/10">Iptal</button>
            <button onClick={handleDelete} className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20">Sil</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
