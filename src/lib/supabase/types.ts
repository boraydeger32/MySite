// =============================================================================
// QR Menu SaaS Platform - TypeScript Type Definitions
// =============================================================================
// These types match the Supabase database schema defined in schema.sql.
// Used throughout the application for type-safe database operations.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums (matching SQL CHECK constraints)
// ---------------------------------------------------------------------------

export type UserRole = 'user' | 'restaurant_owner' | 'super_admin';

export type RestaurantPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export type RestaurantStatus = 'active' | 'suspended' | 'deleted';

export type TableStatus = 'empty' | 'occupied' | 'reserved' | 'cleaning';

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type CampaignType = 'coupon' | 'combo' | 'happy_hour' | 'banner';

export type DiscountType = 'percentage' | 'fixed';

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';

export type AnnouncementTarget = 'all' | 'plan_based' | 'individual';

// ---------------------------------------------------------------------------
// JSONB Field Types
// ---------------------------------------------------------------------------

export interface TablePosition {
  x: number;
  y: number;
}

export interface RestaurantTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  cardBackground?: string;
  fontFamily?: string;
  layout?: 'grid' | 'list' | 'cards';
  categoryNavPosition?: 'top' | 'left' | 'floating';
  borderRadius?: string;
}

export interface WorkingHoursDay {
  open: string;
  close: string;
}

export interface WorkingHours {
  monday?: WorkingHoursDay;
  tuesday?: WorkingHoursDay;
  wednesday?: WorkingHoursDay;
  thursday?: WorkingHoursDay;
  friday?: WorkingHoursDay;
  saturday?: WorkingHoursDay;
  sunday?: WorkingHoursDay;
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface NotificationSettings {
  email?: boolean;
  newOrder?: boolean;
  waiterCall?: boolean;
  lowStock?: boolean;
}

export interface RestaurantSettings {
  currency?: string;
  taxRate?: number;
  language?: string;
  address?: string;
  phone?: string;
  workingHours?: WorkingHours;
  socialMedia?: SocialMedia;
  notifications?: NotificationSettings;
}

export interface ModifierOption {
  label: string;
  price: number;
}

export interface ModifierGroup {
  name: string;
  options: ModifierOption[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  modifiers: string[];
}

export interface CampaignConfig {
  minOrderAmount?: number;
  items?: string[];
  comboPrice?: number;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
  applicableCategories?: string[];
  imageUrl?: string | null;
  linkUrl?: string | null;
  position?: 'top' | 'bottom' | 'popup';
}

export interface AnnouncementTargetConfig {
  plans?: RestaurantPlan[];
  restaurantIds?: string[];
}

// ---------------------------------------------------------------------------
// Database Row Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  theme: RestaurantTheme;
  settings: RestaurantSettings;
  plan: RestaurantPlan;
  status: RestaurantStatus;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_visible: boolean;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  calories: number | null;
  prep_time: number | null;
  allergens: string[];
  badges: string[];
  modifiers: ModifierGroup[];
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  capacity: number;
  position: TablePosition;
  status: TableStatus;
  qr_code_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  notes: string | null;
  waiter_called: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  restaurant_id: string;
  type: CampaignType;
  name: string;
  description: string | null;
  discount_type: DiscountType | null;
  discount_value: number | null;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  config: CampaignConfig;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  severity: AnnouncementSeverity;
  target: AnnouncementTarget;
  target_config: AnnouncementTargetConfig;
  is_read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Insert Types (omit auto-generated fields)
// ---------------------------------------------------------------------------

export type UserProfileInsert = Omit<UserProfile, 'created_at'>;

export type RestaurantInsert = Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type MenuCategoryInsert = Omit<MenuCategory, 'id' | 'created_at'> & {
  id?: string;
};

export type MenuItemInsert = Omit<MenuItem, 'id' | 'created_at'> & {
  id?: string;
};

export type TableInsert = Omit<Table, 'id' | 'created_at'> & {
  id?: string;
};

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CampaignInsert = Omit<Campaign, 'id' | 'created_at'> & {
  id?: string;
};

export type AnnouncementInsert = Omit<Announcement, 'id' | 'created_at'> & {
  id?: string;
};

// ---------------------------------------------------------------------------
// Update Types (all fields optional except id)
// ---------------------------------------------------------------------------

export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at'>>;

export type RestaurantUpdate = Partial<Omit<Restaurant, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;

export type MenuCategoryUpdate = Partial<Omit<MenuCategory, 'id' | 'restaurant_id' | 'created_at'>>;

export type MenuItemUpdate = Partial<Omit<MenuItem, 'id' | 'restaurant_id' | 'created_at'>>;

export type TableUpdate = Partial<Omit<Table, 'id' | 'restaurant_id' | 'created_at'>>;

export type OrderUpdate = Partial<Omit<Order, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>;

export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'restaurant_id' | 'created_at'>>;

export type AnnouncementUpdate = Partial<Omit<Announcement, 'id' | 'created_at'>>;

// ---------------------------------------------------------------------------
// Joined / Extended Types (for queries with relations)
// ---------------------------------------------------------------------------

export interface MenuCategoryWithItems extends MenuCategory {
  menu_items: MenuItem[];
}

export interface OrderWithTable extends Order {
  table: Table | null;
}

export interface RestaurantWithOwner extends Restaurant {
  user_profiles: UserProfile | null;
}

export interface RestaurantFull extends Restaurant {
  menu_categories: MenuCategoryWithItems[];
  tables: Table[];
}

// ---------------------------------------------------------------------------
// Supabase Database Type Definition
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      restaurants: {
        Row: Restaurant;
        Insert: RestaurantInsert;
        Update: RestaurantUpdate;
      };
      menu_categories: {
        Row: MenuCategory;
        Insert: MenuCategoryInsert;
        Update: MenuCategoryUpdate;
      };
      menu_items: {
        Row: MenuItem;
        Insert: MenuItemInsert;
        Update: MenuItemUpdate;
      };
      tables: {
        Row: Table;
        Insert: TableInsert;
        Update: TableUpdate;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      campaigns: {
        Row: Campaign;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
      };
      announcements: {
        Row: Announcement;
        Insert: AnnouncementInsert;
        Update: AnnouncementUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      restaurant_plan: RestaurantPlan;
      restaurant_status: RestaurantStatus;
      table_status: TableStatus;
      order_status: OrderStatus;
      campaign_type: CampaignType;
      discount_type: DiscountType;
      announcement_severity: AnnouncementSeverity;
      announcement_target: AnnouncementTarget;
    };
  };
}
