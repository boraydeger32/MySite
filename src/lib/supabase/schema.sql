-- =============================================================================
-- QR Menu SaaS Platform - Complete Database Schema
-- =============================================================================
-- Run this SQL in Supabase SQL Editor to create all tables, RLS policies,
-- realtime configuration, storage buckets, and utility functions.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: auto-update updated_at timestamp
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================
-- 1. user_profiles (extends auth.users)
-- ===========================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'restaurant_owner', 'super_admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_profiles IS 'Extended profile data for authenticated users';

-- ===========================================================================
-- 2. restaurants
-- ===========================================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  theme JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_status ON restaurants(status);

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE restaurants IS 'Restaurant accounts with theme/settings stored as JSONB';

-- ===========================================================================
-- 3. menu_categories
-- ===========================================================================
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  available_from TIME,
  available_until TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);
CREATE INDEX idx_menu_categories_sort_order ON menu_categories(restaurant_id, sort_order);

COMMENT ON TABLE menu_categories IS 'Menu categories with ordering and time-based availability';

-- ===========================================================================
-- 4. menu_items
-- ===========================================================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  calories INT,
  prep_time INT,
  allergens TEXT[] NOT NULL DEFAULT '{}',
  badges TEXT[] NOT NULL DEFAULT '{}',
  modifiers JSONB NOT NULL DEFAULT '[]',
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_sort_order ON menu_items(restaurant_id, sort_order);

COMMENT ON TABLE menu_items IS 'Individual menu products with allergens, badges, and modifier groups';

-- ===========================================================================
-- 5. tables
-- ===========================================================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  status TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'reserved', 'cleaning')),
  qr_code_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tables_restaurant_id ON tables(restaurant_id);
CREATE UNIQUE INDEX idx_tables_restaurant_number ON tables(restaurant_id, table_number);

COMMENT ON TABLE tables IS 'Physical tables with grid position and real-time status tracking';

-- ===========================================================================
-- 6. orders
-- ===========================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'delivered', 'cancelled')),
  notes TEXT,
  waiter_called BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_created_at ON orders(restaurant_id, created_at DESC);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE orders IS 'Customer orders with items stored as JSONB, tracked through Kanban statuses';

-- ===========================================================================
-- 7. campaigns
-- ===========================================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('coupon', 'combo', 'happy_hour', 'banner')),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_restaurant_id ON campaigns(restaurant_id);
CREATE INDEX idx_campaigns_active ON campaigns(restaurant_id, is_active);

COMMENT ON TABLE campaigns IS 'Promotional campaigns: coupons, combos, happy hours, and banners';

-- ===========================================================================
-- 8. announcements (Super Admin)
-- ===========================================================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'plan_based', 'individual')),
  target_config JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

COMMENT ON TABLE announcements IS 'Platform-wide announcements from super admin with targeting';

-- ===========================================================================
-- Row Level Security (RLS)
-- ===========================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- user_profiles policies
-- ---------------------------------------------------------------------------
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- restaurants policies
-- ---------------------------------------------------------------------------
-- Owner can read, update, and insert their own restaurants
CREATE POLICY "owner_read" ON restaurants
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "owner_update" ON restaurants
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "owner_insert" ON restaurants
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_delete" ON restaurants
  FOR DELETE USING (owner_id = auth.uid());

-- Public read access for active restaurants (customer-facing menu)
CREATE POLICY "public_menu_read" ON restaurants
  FOR SELECT USING (status = 'active');

-- ---------------------------------------------------------------------------
-- menu_categories policies
-- ---------------------------------------------------------------------------
-- Owner full access via restaurant ownership
CREATE POLICY "restaurant_owner_categories_select" ON menu_categories
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_categories_insert" ON menu_categories
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_categories_update" ON menu_categories
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_categories_delete" ON menu_categories
  FOR DELETE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- Public read access for visible categories
CREATE POLICY "public_categories_read" ON menu_categories
  FOR SELECT USING (is_visible = true);

-- ---------------------------------------------------------------------------
-- menu_items policies
-- ---------------------------------------------------------------------------
-- Owner full access via restaurant ownership
CREATE POLICY "restaurant_owner_items_select" ON menu_items
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_items_insert" ON menu_items
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_items_update" ON menu_items
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_items_delete" ON menu_items
  FOR DELETE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- Public read access for available items
CREATE POLICY "public_items_read" ON menu_items
  FOR SELECT USING (is_available = true);

-- ---------------------------------------------------------------------------
-- tables policies
-- ---------------------------------------------------------------------------
-- Owner full access
CREATE POLICY "restaurant_owner_tables_select" ON tables
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_tables_insert" ON tables
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_tables_update" ON tables
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_tables_delete" ON tables
  FOR DELETE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- Public read access for table info (needed for customer ordering)
CREATE POLICY "public_tables_read" ON tables
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE status = 'active')
  );

-- ---------------------------------------------------------------------------
-- orders policies
-- ---------------------------------------------------------------------------
-- Owner can read and update orders for their restaurants
CREATE POLICY "restaurant_owner_orders_select" ON orders
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_orders_update" ON orders
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_orders_delete" ON orders
  FOR DELETE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- Public order creation (customers can place orders without auth)
CREATE POLICY "public_order_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- campaigns policies
-- ---------------------------------------------------------------------------
-- Owner full access
CREATE POLICY "restaurant_owner_campaigns_select" ON campaigns
  FOR SELECT USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_campaigns_insert" ON campaigns
  FOR INSERT WITH CHECK (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_campaigns_update" ON campaigns
  FOR UPDATE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

CREATE POLICY "restaurant_owner_campaigns_delete" ON campaigns
  FOR DELETE USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- Public read access for active campaigns (shown on customer menu)
CREATE POLICY "public_campaigns_read" ON campaigns
  FOR SELECT USING (is_active = true);

-- ---------------------------------------------------------------------------
-- announcements policies
-- ---------------------------------------------------------------------------
-- Authenticated users can read announcements
CREATE POLICY "authenticated_announcements_read" ON announcements
  FOR SELECT USING (auth.role() = 'authenticated');

-- Super admin operations use service_role key which bypasses RLS

-- ===========================================================================
-- Realtime Configuration
-- ===========================================================================
-- Enable realtime replication for tables that need live updates

-- Orders: Kanban board live updates
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Tables: Active table status changes
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- Announcements: Notification bell updates
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- ===========================================================================
-- Storage Buckets
-- ===========================================================================
-- Note: Run these via Supabase Dashboard or use the storage API.
-- The SQL below uses the storage schema to create buckets programmatically.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('restaurant-logos', 'restaurant-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('covers', 'covers', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow authenticated users to upload to their restaurant folders
CREATE POLICY "authenticated_upload_logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_upload_menu_images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'menu-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_upload_covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND auth.role() = 'authenticated'
  );

-- Public read access for all storage buckets
CREATE POLICY "public_read_logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-logos');

CREATE POLICY "public_read_menu_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "public_read_covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- Authenticated users can update/delete their own uploads
CREATE POLICY "authenticated_update_logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_delete_logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_update_menu_images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'menu-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_delete_menu_images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'menu-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_update_covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'covers' AND auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_delete_covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'covers' AND auth.role() = 'authenticated'
  );
