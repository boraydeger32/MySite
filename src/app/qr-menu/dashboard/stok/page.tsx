'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, Package, AlertTriangle, TrendingDown, Minus as MinusIcon, Plus as PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { InventoryItem, InventoryUnit, InventoryItemInsert } from '@/lib/supabase/types';

const UNIT_CONFIG: Record<InventoryUnit, string> = {
  kg: 'Kilogram', lt: 'Litre', adet: 'Adet', porsiyon: 'Porsiyon', paket: 'Paket',
};
const UNITS: InventoryUnit[] = ['kg', 'lt', 'adet', 'porsiyon', 'paket'];

export default function StokPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock'>('name');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  // Form
  const [fName, setFName] = useState('');
  const [fUnit, setFUnit] = useState<InventoryUnit>('adet');
  const [fStock, setFStock] = useState('0');
  const [fMinStock, setFMinStock] = useState('5');
  const [fCost, setFCost] = useState('');
  const [fCategory, setFCategory] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user.id).single();
        if (!restaurant) return;
        setRestaurantId(restaurant.id);
        const { data } = await supabase.from('inventory').select('*').eq('restaurant_id', restaurant.id).eq('is_active', true).order('name');
        if (data) setItems(data as InventoryItem[]);
      } catch { toast.error('Stok verileri yuklenemedi.'); }
      finally { setIsLoading(false); }
    }
    fetch();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (filterCategory !== 'all') result = result.filter(i => i.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name, 'tr') : a.current_stock - b.current_stock);
    return result;
  }, [items, filterCategory, searchQuery, sortBy]);

  const stats = useMemo(() => ({
    total: items.length,
    lowStock: items.filter(i => i.current_stock <= i.min_stock).length,
    totalValue: items.reduce((s, i) => s + (i.cost_per_unit ?? 0) * i.current_stock, 0),
  }), [items]);

  const openForm = useCallback((item?: InventoryItem) => {
    if (item) {
      setEditing(item); setFName(item.name); setFUnit(item.unit); setFStock(String(item.current_stock));
      setFMinStock(String(item.min_stock)); setFCost(item.cost_per_unit ? String(item.cost_per_unit) : ''); setFCategory(item.category ?? '');
    } else {
      setEditing(null); setFName(''); setFUnit('adet'); setFStock('0'); setFMinStock('5'); setFCost(''); setFCategory('');
    }
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!fName.trim()) { toast.error('Urun adi zorunludur.'); return; }
    if (!restaurantId) return;
    const supabase = createClient();
    const payload = {
      restaurant_id: restaurantId, name: fName.trim(), unit: fUnit,
      current_stock: parseFloat(fStock) || 0, min_stock: parseFloat(fMinStock) || 0,
      cost_per_unit: fCost ? parseFloat(fCost) : null, category: fCategory.trim() || null, is_active: true,
    };
    if (editing) {
      const { error } = await supabase.from('inventory').update(payload).eq('id', editing.id);
      if (error) { toast.error('Guncellenemedi.'); return; }
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i));
      toast.success('Urun guncellendi.');
    } else {
      const { data, error } = await supabase.from('inventory').insert(payload as InventoryItemInsert).select().single();
      if (error || !data) { toast.error('Urun eklenemedi.'); return; }
      setItems(prev => [...prev, data as InventoryItem]);
      toast.success('Urun eklendi.');
    }
    setFormOpen(false);
  }, [fName, fUnit, fStock, fMinStock, fCost, fCategory, editing, restaurantId]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    await supabase.from('inventory').update({ is_active: false }).eq('id', deleteTarget.id);
    setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
    toast.success('Urun kaldirildi.');
    setDeleteTarget(null);
  }, [deleteTarget]);

  const adjustStock = useCallback(async (item: InventoryItem, delta: number) => {
    const newStock = Math.max(0, item.current_stock + delta);
    const supabase = createClient();
    await supabase.from('inventory').update({ current_stock: newStock }).eq('id', item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, current_stock: newStock } : i));
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">Stok Yonetimi</h1>
          <p className="mt-1 text-sm text-text-muted">{stats.total} urun takip ediliyor</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openForm()}
          className="flex items-center gap-1.5 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange hover:bg-accent-orange/20">
          <Plus className="h-4 w-4" /> Urun Ekle
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-text-muted">Toplam Urun</p>
          <p className="mt-0.5 font-display text-xl font-bold text-text-main">{stats.total}</p>
        </div>
        <div className={cn('rounded-lg border px-4 py-3', stats.lowStock > 0 ? 'border-red-500/20 bg-red-500/5' : 'border-white/10 bg-white/5')}>
          <div className="flex items-center gap-1.5">
            {stats.lowStock > 0 && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
            <p className="text-xs text-text-muted">Dusuk Stok</p>
          </div>
          <p className={cn('mt-0.5 font-display text-xl font-bold', stats.lowStock > 0 ? 'text-red-400' : 'text-text-main')}>{stats.lowStock}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-text-muted">Toplam Deger</p>
          <p className="mt-0.5 font-display text-xl font-bold text-emerald-400">₺{stats.totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Urun ara..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent-orange/50 focus:outline-none" />
        </div>
        {categories.length > 0 && (
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main focus:outline-none">
            <option value="all" className="bg-bg-dark">Tum Kategoriler</option>
            {categories.map(c => <option key={c} value={c} className="bg-bg-dark">{c}</option>)}
          </select>
        )}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'stock')}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main focus:outline-none">
          <option value="name" className="bg-bg-dark">Ada Gore</option>
          <option value="stock" className="bg-bg-dark">Stoga Gore</option>
        </select>
      </div>

      {/* Inventory List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <Package className="h-10 w-10 text-text-muted/30" />
          <p className="mt-4 font-display text-base font-semibold text-text-main">Henuz stok urunu yok</p>
          <p className="mt-1 text-sm text-text-muted">Ilk urunlerinizi ekleyerek stok takibine baslayabilirsiniz.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(item => {
              const isLow = item.current_stock <= item.min_stock;
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className={cn('flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-white/[0.07]', isLow ? 'border-red-500/20 bg-red-500/5' : 'border-white/10 bg-white/5')}>
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', isLow ? 'bg-red-500/10' : 'bg-white/5')}>
                    {isLow ? <TrendingDown className="h-5 w-5 text-red-400" /> : <Package className="h-5 w-5 text-text-muted" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-main">{item.name}</span>
                      {item.category && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-text-muted">{item.category}</span>}
                      {isLow && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">Dusuk Stok</span>}
                    </div>
                    <span className="text-xs text-text-muted">Min: {item.min_stock} {item.unit} {item.cost_per_unit ? `· ₺${item.cost_per_unit}/${item.unit}` : ''}</span>
                  </div>

                  {/* Quick stock adjust */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => adjustStock(item, -1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-text-muted hover:text-red-400">
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className={cn('min-w-[60px] text-center text-sm font-bold', isLow ? 'text-red-400' : 'text-text-main')}>
                      {item.current_stock} {item.unit}
                    </span>
                    <button onClick={() => adjustStock(item, 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-text-muted hover:text-emerald-400">
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => openForm(item)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted hover:text-accent-blue" title="Duzenle">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-muted hover:text-red-400" title="Sil">
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
            <DialogTitle className="font-display text-lg text-text-main">{editing ? 'Urun Duzenle' : 'Yeni Urun'}</DialogTitle>
            <DialogDescription className="text-sm text-text-muted">Stok bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div><label className="mb-1 block text-sm font-medium text-text-muted">Urun Adi *</label>
              <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="orn. Dana Kiyma" className="border-white/10 bg-white/5 text-text-main" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Birim</label>
                <select value={fUnit} onChange={e => setFUnit(e.target.value as InventoryUnit)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-main focus:outline-none">
                  {UNITS.map(u => <option key={u} value={u} className="bg-bg-dark">{UNIT_CONFIG[u]}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Kategori</label>
                <Input value={fCategory} onChange={e => setFCategory(e.target.value)} placeholder="orn. Et" className="border-white/10 bg-white/5 text-text-main" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Mevcut Stok</label>
                <Input type="number" value={fStock} onChange={e => setFStock(e.target.value)} min={0} step="0.1" className="border-white/10 bg-white/5 text-text-main" /></div>
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Min. Stok</label>
                <Input type="number" value={fMinStock} onChange={e => setFMinStock(e.target.value)} min={0} step="0.1" className="border-white/10 bg-white/5 text-text-main" /></div>
              <div><label className="mb-1 block text-sm font-medium text-text-muted">Birim Fiyat</label>
                <Input type="number" value={fCost} onChange={e => setFCost(e.target.value)} min={0} step="0.01" placeholder="₺" className="border-white/10 bg-white/5 text-text-main" /></div>
            </div>
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
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="border-white/10 bg-bg-dark/95 backdrop-blur-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-text-main">Urunu Kaldir</DialogTitle>
            <DialogDescription className="text-text-muted">&quot;{deleteTarget?.name}&quot; stok takibinden kaldirilacak.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/10">Iptal</button>
            <button onClick={handleDelete} className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20">Kaldir</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
