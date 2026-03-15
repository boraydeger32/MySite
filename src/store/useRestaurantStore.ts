import { create } from 'zustand';
import type {
  Restaurant,
  MenuCategory,
  MenuItem,
  Table,
  Order,
  Campaign,
  OrderStatus,
} from '@/lib/supabase/types';

// =============================================================================
// Restaurant Dashboard Store (Zustand)
// =============================================================================
// Manages state for the restaurant owner dashboard at /qr-menu/dashboard/*.
// Holds the current restaurant data, menu, tables, orders, and UI state.
// =============================================================================

interface RestaurantStore {
  // -------------------------------------------------------------------------
  // Restaurant Data
  // -------------------------------------------------------------------------
  restaurant: Restaurant | null;
  setRestaurant: (restaurant: Restaurant | null) => void;

  // -------------------------------------------------------------------------
  // Menu Data
  // -------------------------------------------------------------------------
  categories: MenuCategory[];
  setCategories: (categories: MenuCategory[]) => void;
  addCategory: (category: MenuCategory) => void;
  updateCategory: (id: string, data: Partial<MenuCategory>) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (categories: MenuCategory[]) => void;

  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;

  // -------------------------------------------------------------------------
  // Tables Data
  // -------------------------------------------------------------------------
  tables: Table[];
  setTables: (tables: Table[]) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, data: Partial<Table>) => void;
  removeTable: (id: string) => void;

  // -------------------------------------------------------------------------
  // Orders Data
  // -------------------------------------------------------------------------
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  removeOrder: (id: string) => void;

  // -------------------------------------------------------------------------
  // Campaigns Data
  // -------------------------------------------------------------------------
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;

  // -------------------------------------------------------------------------
  // UI State
  // -------------------------------------------------------------------------
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Currently selected category ID in menu management */
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;

  /** Unread notification count for the dashboard header bell */
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  incrementNotificationCount: () => void;

  // -------------------------------------------------------------------------
  // Loading States
  // -------------------------------------------------------------------------
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  /** Clear all store data (on logout or restaurant switch) */
  reset: () => void;
}

const initialState = {
  restaurant: null,
  categories: [],
  menuItems: [],
  tables: [],
  orders: [],
  campaigns: [],
  sidebarCollapsed: false,
  activeCategoryId: null,
  notificationCount: 0,
  isLoading: false,
};

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  ...initialState,

  // Restaurant
  setRestaurant: (restaurant) => set({ restaurant }),

  // Categories
  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, data) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
  reorderCategories: (categories) => set({ categories }),

  // Menu Items
  setMenuItems: (items) => set({ menuItems: items }),
  addMenuItem: (item) =>
    set((state) => ({ menuItems: [...state.menuItems, item] })),
  updateMenuItem: (id, data) =>
    set((state) => ({
      menuItems: state.menuItems.map((i) =>
        i.id === id ? { ...i, ...data } : i
      ),
    })),
  removeMenuItem: (id) =>
    set((state) => ({
      menuItems: state.menuItems.filter((i) => i.id !== id),
    })),

  // Tables
  setTables: (tables) => set({ tables }),
  addTable: (table) =>
    set((state) => ({ tables: [...state.tables, table] })),
  updateTable: (id, data) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),
  removeTable: (id) =>
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== id),
    })),

  // Orders
  setOrders: (orders) => set({ orders }),
  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o
      ),
    })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),

  // Campaigns
  setCampaigns: (campaigns) => set({ campaigns }),

  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  activeCategoryId: null,
  setActiveCategoryId: (id) => set({ activeCategoryId: id }),

  notificationCount: 0,
  setNotificationCount: (count) => set({ notificationCount: count }),
  incrementNotificationCount: () =>
    set((state) => ({ notificationCount: state.notificationCount + 1 })),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Reset
  reset: () => set(initialState),
}));
