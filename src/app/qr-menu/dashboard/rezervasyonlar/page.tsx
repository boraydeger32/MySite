'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, CalendarDays, Clock, Users, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Reservation, ReservationStatus, ReservationInsert } from '@/lib/supabase/types';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Beklemede', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  confirmed: { label: 'Onaylandi', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  seated: { label: 'Oturdu', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  completed: { label: 'Tamamlandi', color: 'text-text-muted', bg: 'bg-white/5' },
  cancelled: { label: 'Iptal', color: 'text-red-400', bg: 'bg-red-500/10' },
  no_show: { label: 'Gelmedi', color: 'text-red-400', bg: 'bg-red-500/10' },
};

const STATUS_FLOW: Record<string, ReservationStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['seated', 'cancelled', 'no_show'],
  seated: ['completed'],
};

function formatDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function RezervasyonlarPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | 'all'>('all');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);

  // Form
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fSize, setFSize] = useState('2');
  const [fDate, setFDate] = useState('');
  const [fTime, setFTime] = useState('19:00');
  const [fDuration, setFDuration] = useState('90');
  const [fNotes, setFNotes] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user.id).single();
        if (!restaurant) return;
        setRestaurantId(restaurant.id);
        const { data } = await supabase.from('reservations').select('*').eq('restaurant_id', restaurant.id).order('reservation_date', { ascending: true }).order('reservation_time', { ascending: true });
        if (data) setReservations(data as Reservation[]);
      } catch { toast.error('Rezervasyonlar yuklenemedi.'); }
      finally { setIsLoading(false); }
    }
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let result = reservations;
    if (filterDate) result = result.filter(r => r.reservation_date === filterDate);
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.customer_name.toLowerCase().includes(q) || (r.customer_phone ?? '').includes(q));
    }
    return result;
  }, [reservations, filterDate, filterStatus, searchQuery]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(r => r.reservation_date === today && !['cancelled', 'no_show', 'completed'].includes(r.status)).length;
  }, [reservations]);

  const openForm = useCallback((r?: Reservation) => {
    if (r) {
      setEditing(r); setFName(r.customer_name); setFPhone(r.customer_phone ?? ''); setFEmail(r.customer_email ?? '');
      setFSize(String(r.party_size)); setFDate(r.reservation_date); setFTime(r.reservation_time.slice(0, 5));
      setFDuration(String(r.duration_minutes)); setFNotes(r.notes ?? '');
    } else {
      setEditing(null); setFName(''); setFPhone(''); setFEmail(''); setFSize('2');
      setFDate(filterDate || new Date().toISOString().split('T')[0]); setFTime('19:00'); setFDuration('90'); setFNotes('');
    }
    setFormOpen(true);
  }, [filterDate]);

  const handleSubmit = useCallback(async () => {
    if (!fName.trim() || !fDate || !fTime) { toast.error('Ad, tarih ve saat zorunludur.'); return; }
    if (!restaurantId) return;
    const supabase = createClient();
    const payload = {
      restaurant_id: restaurantId, customer_name: fName.trim(), customer_phone: fPhone.trim() || null,
      customer_email: fEmail.trim() || null, party_size: parseInt(fSize) || 2,
      reservation_date: fDate, reservation_time: fTime, duration_minutes: parseInt(fDuration) || 90,
      notes: fNotes.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from('reservations').update(payload).eq('id', editing.id);
      if (error) { toast.error('Guncellenemedi.'); return; }
      setReservations(prev => prev.map(r => r.id === editing.id ? { ...r, ...payload } : r));
      toast.success('Rezervasyon guncellendi.');
    } else {
      const { data, error } = await supabase.from('reservations').insert({ ...payload, status: 'pending' } as ReservationInsert).select().single();
      if (error || !data) { toast.error('Rezervasyon olusturulamadi.'); return; }
      setReservations(prev => [...prev, data as Reservation]);
      toast.success('Rezervasyon eklendi.');
    }
    setFormOpen(false);
  }, [fName, fPhone, fEmail, fSize, fDate, fTime, fDuration, fNotes, editing, restaurantId]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    await supabase.from('reservations').delete().eq('id', deleteTarget.id);
    setReservations(prev => prev.filter(r => r.id !== deleteTarget.id));
    toast.success('Rezervasyon silindi.');
    setDeleteTarget(null);
  }, [deleteTarget]);

  const changeStatus = useCallback(async (r: Reservation, newStatus: ReservationStatus) => {
    const supabase = createClient();
    await supabase.from('reservations').update({ status: newStatus }).eq('id', r.id);
    setReservations(prev => prev.map(x => x.id === r.id ? { ...x, status: newStatus } : x));
    toast.success(`Durum: ${STATUS_CONFIG[newStatus].label}`);
  }, []);

  const shiftDate = useCallback((days: number) => {
    const d = new Date(filterDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setFilterDate(d.toISOString().split('T')[0]);
  }, [filterDate]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">Rezervasyonlar</h1>
          <p className="mt-1 text-sm text-text-muted">Bugun {todayCount} aktif rezervasyon</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openForm()}
          className="flex items-center gap-1.5 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange hover:bg-accent-orange/20">
          <Plus className="h-4 w-4" /> Yeni Rezervasyon
        </motion.button>
      </div>

      {/* Date nav + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          <button onClick={() => shiftDate(-1)} className="rounded-md p-1.5 text-text-muted hover:bg-white/10 hover:text-text-main"><ChevronLeft className="h-4 w-4" /></button>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="bg-transparent px-2 text-sm text-text-main focus:outline-none" />
          <button onClick={() => shiftDate(1)} className="rounded-md p-1.5 text-text-muted hover:bg-white/10 hover:text-text-main"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <button onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-main">Bugun</button>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Musteri ara..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ReservationStatus | 'all')}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main focus:border-accent-orange/50 focus:outline-none">
          <option value="all" className="bg-bg-dark">Tum Durumlar</option>
          {(Object.keys(STATUS_CONFIG) as ReservationStatus[]).map(s => (
            <option key={s} value={s} className="bg-bg-dark">{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {/* Reservation List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <CalendarDays className="h-10 w-10 text-text-muted/30" />
          <p className="mt-4 font-display text-base font-semibold text-text-main">{filterDate ? `${formatDate(filterDate)} icin rezervasyon yok` : 'Henuz rezervasyon yok'}</p>
          <p className="mt-1 text-sm text-text-muted">Yeni rezervasyon ekleyerek baslayabilirsiniz.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(r => {
              const status = STATUS_CONFIG[r.status];
              const nextStatuses = STATUS_FLOW[r.status] || [];
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/[0.07] sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-orange/10">
                      <Clock className="h-5 w-5 text-accent-orange" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-main">{r.customer_name}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', status.bg, status.color)}>{status.label}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.reservation_time.slice(0, 5)}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.party_size} kisi</span>
                        {r.customer_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.customer_phone}</span>}
                        {r.customer_email && <span className="hidden items-center gap-1 sm:flex"><Mail className="h-3 w-3" />{r.customer_email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {nextStatuses.map(ns => (
                      <button key={ns} onClick={() => changeStatus(r, ns)}
                        className={cn('rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors', STATUS_CONFIG[ns].bg, STATUS_CONFIG[ns].color, 'hover:opacity-80')}>
                        {STATUS_CONFIG[ns].label}
                      </button>
                    ))}
                    <button onClick={() => openForm(r)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-text-muted hover:text-text-main"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteTarget(r)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-text-muted hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
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
            <DialogTitle className="font-display text-lg text-text-main">{editing ? 'Rezervasyon Duzenle' : 'Yeni Rezervasyon'}</DialogTitle>
            <DialogDescription className="text-sm text-text-muted">Rezervasyon bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div><label className="mb-1 block text-sm font-medium text-text-muted">Musteri Adi *</label>
              <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Ad Soyad" className="border-white/10 bg-white/5 text-text-main" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Telefon</label>
                <Input value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="+90 5XX" className="border-white/10 bg-white/5 text-text-main" /></div>
              <div><label className="mb-1 block text-sm font-medium text-text-muted">E-posta</label>
                <Input value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="email" className="border-white/10 bg-white/5 text-text-main" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Kisi *</label>
                <Input type="number" value={fSize} onChange={e => setFSize(e.target.value)} min={1} max={50} className="border-white/10 bg-white/5 text-text-main" /></div>
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Tarih *</label>
                <Input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="border-white/10 bg-white/5 text-text-main" /></div>
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Saat *</label>
                <Input type="time" value={fTime} onChange={e => setFTime(e.target.value)} className="border-white/10 bg-white/5 text-text-main" /></div>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-text-muted">Sure (dk)</label>
              <Input type="number" value={fDuration} onChange={e => setFDuration(e.target.value)} min={15} className="border-white/10 bg-white/5 text-text-main" /></div>
            <div><label className="mb-1 block text-sm font-medium text-text-muted">Notlar</label>
              <textarea value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Ozel istekler..." rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50 focus:outline-none" /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setFormOpen(false)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/10">Iptal</button>
            <button onClick={handleSubmit} className="rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange hover:bg-accent-orange/20">
              {editing ? 'Guncelle' : 'Olustur'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-text-main">Rezervasyonu Sil</DialogTitle>
            <DialogDescription className="text-text-muted">&quot;{deleteTarget?.customer_name}&quot; rezervasyonu silinecek.</DialogDescription>
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
