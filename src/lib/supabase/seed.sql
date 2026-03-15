-- =============================================================================
-- QR Menu SaaS Platform - Seed Data
-- =============================================================================
-- Run this SQL after schema.sql to populate development/demo data.
-- Creates a demo restaurant with categories, menu items, tables, and orders.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Demo User Profile
-- ---------------------------------------------------------------------------
-- Note: The auth.users record must be created via Supabase Auth (signup flow).
-- This seed assumes a demo user already exists with a known UUID.
-- For local development, create this user via the Supabase Dashboard or Auth API.

-- We use a deterministic UUID for the demo user so seed data is reproducible.
-- In production, replace with the actual auth.users id after signup.
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
  demo_restaurant_id UUID := '11111111-1111-1111-1111-111111111111';
  cat_ana_yemek UUID := '22222222-2222-2222-2222-222222222201';
  cat_baslangic UUID := '22222222-2222-2222-2222-222222222202';
  cat_icecekler UUID := '22222222-2222-2222-2222-222222222203';
  cat_tatlilar UUID := '22222222-2222-2222-2222-222222222204';
  cat_salatalar UUID := '22222222-2222-2222-2222-222222222205';
  tbl_1 UUID := '33333333-3333-3333-3333-333333333301';
  tbl_2 UUID := '33333333-3333-3333-3333-333333333302';
  tbl_3 UUID := '33333333-3333-3333-3333-333333333303';
  tbl_4 UUID := '33333333-3333-3333-3333-333333333304';
  tbl_5 UUID := '33333333-3333-3333-3333-333333333305';
  tbl_6 UUID := '33333333-3333-3333-3333-333333333306';
  item_adana UUID;
  item_iskender UUID;
  item_pide UUID;
BEGIN

  -- ---------------------------------------------------------------------------
  -- 2. User Profile (demo restaurant owner)
  -- ---------------------------------------------------------------------------
  INSERT INTO user_profiles (id, full_name, phone, role)
  VALUES (demo_user_id, 'Ahmet Yilmaz', '+90 532 123 4567', 'restaurant_owner')
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 3. Demo Restaurant
  -- ---------------------------------------------------------------------------
  INSERT INTO restaurants (id, owner_id, name, slug, theme, settings, plan, status)
  VALUES (
    demo_restaurant_id,
    demo_user_id,
    'Lezzet Duragi',
    'lezzet-duragi',
    '{
      "primaryColor": "#E63946",
      "secondaryColor": "#457B9D",
      "backgroundColor": "#1D3557",
      "textColor": "#F1FAEE",
      "cardBackground": "#264573",
      "fontFamily": "Inter",
      "layout": "grid",
      "categoryNavPosition": "top",
      "borderRadius": "12px"
    }'::jsonb,
    '{
      "currency": "TRY",
      "taxRate": 10,
      "language": "tr",
      "address": "Istiklal Cad. No:42, Beyoglu, Istanbul",
      "phone": "+90 212 555 1234",
      "workingHours": {
        "monday": {"open": "10:00", "close": "23:00"},
        "tuesday": {"open": "10:00", "close": "23:00"},
        "wednesday": {"open": "10:00", "close": "23:00"},
        "thursday": {"open": "10:00", "close": "23:00"},
        "friday": {"open": "10:00", "close": "00:00"},
        "saturday": {"open": "11:00", "close": "00:00"},
        "sunday": {"open": "11:00", "close": "22:00"}
      },
      "socialMedia": {
        "instagram": "@lezzetduragi",
        "facebook": "lezzetduragi"
      },
      "notifications": {
        "email": true,
        "newOrder": true,
        "waiterCall": true
      }
    }'::jsonb,
    'pro',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 4. Menu Categories
  -- ---------------------------------------------------------------------------
  INSERT INTO menu_categories (id, restaurant_id, name, icon, color, sort_order, is_visible) VALUES
    (cat_baslangic, demo_restaurant_id, 'Baslangiclar', 'soup', '#F4A261', 0, true),
    (cat_salatalar, demo_restaurant_id, 'Salatalar', 'salad', '#2A9D8F', 1, true),
    (cat_ana_yemek, demo_restaurant_id, 'Ana Yemekler', 'utensils', '#E63946', 2, true),
    (cat_icecekler, demo_restaurant_id, 'Icecekler', 'coffee', '#457B9D', 3, true),
    (cat_tatlilar, demo_restaurant_id, 'Tatlilar', 'cake', '#E9C46A', 4, true)
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 5. Menu Items
  -- ---------------------------------------------------------------------------
  -- Baslangiclar (Starters)
  INSERT INTO menu_items (id, category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (gen_random_uuid(), cat_baslangic, demo_restaurant_id,
     'Mercimek Corbasi', 'Geleneksel Turk mercimek corbasi, taze limon ve ekmek ile servis edilir',
     45.00, 180, 10, ARRAY['gluten'], ARRAY['populer'],
     '[]'::jsonb, true, 0),

    (gen_random_uuid(), cat_baslangic, demo_restaurant_id,
     'Humus', 'Ev yapimi nohut ezmesi, zeytinyagi ve baharat ile',
     55.00, 220, 8, ARRAY['susam'], ARRAY[]::text[],
     '[]'::jsonb, true, 1),

    (gen_random_uuid(), cat_baslangic, demo_restaurant_id,
     'Sigara Boregi', 'Beyaz peynirli el acmasi borek (4 adet)',
     65.00, 320, 12, ARRAY['gluten', 'sut'], ARRAY['chef_onerisi'],
     '[{"name": "Ekstra Borek", "options": [{"label": "2 adet ekstra", "price": 30}]}]'::jsonb, true, 2),

    (gen_random_uuid(), cat_baslangic, demo_restaurant_id,
     'Atom', 'Yogurt, sarimsak ve baharatli acili ezme',
     40.00, 150, 5, ARRAY['sut'], ARRAY[]::text[],
     '[]'::jsonb, true, 3);

  -- Salatalar (Salads)
  INSERT INTO menu_items (id, category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (gen_random_uuid(), cat_salatalar, demo_restaurant_id,
     'Coban Salatasi', 'Domates, salatalik, biber, sogan, maydanoz, zeytinyagi ve limon sos',
     50.00, 120, 5, ARRAY[]::text[], ARRAY['vegan'],
     '[]'::jsonb, true, 0),

    (gen_random_uuid(), cat_salatalar, demo_restaurant_id,
     'Sezar Salata', 'Marul, kruton, parmesan, tavuk ve sezar sos ile',
     85.00, 380, 8, ARRAY['gluten', 'sut', 'yumurta'], ARRAY[]::text[],
     '[{"name": "Protein Secimi", "options": [{"label": "Tavuk", "price": 0}, {"label": "Somon", "price": 25}]}]'::jsonb, true, 1),

    (gen_random_uuid(), cat_salatalar, demo_restaurant_id,
     'Akdeniz Salatasi', 'Roka, cherry domates, avokado, nar eksisi ve zeytinyagi',
     75.00, 280, 6, ARRAY[]::text[], ARRAY['yeni', 'vegan'],
     '[]'::jsonb, true, 2);

  -- Ana Yemekler (Main Courses)
  INSERT INTO menu_items (category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (cat_ana_yemek, demo_restaurant_id,
     'Adana Kebap', 'El kiymasi acili kebap, lavash, közlenmis domates ve biber ile',
     185.00, 650, 20, ARRAY[]::text[], ARRAY['populer', 'chef_onerisi'],
     '[{"name": "Acilik Seviyesi", "options": [{"label": "Az Acili", "price": 0}, {"label": "Orta Acili", "price": 0}, {"label": "Cok Acili", "price": 0}]}, {"name": "Ek Garnitur", "options": [{"label": "Pilav", "price": 25}, {"label": "Patates", "price": 20}]}]'::jsonb,
     true, 0)
  RETURNING id INTO item_adana;

  INSERT INTO menu_items (category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (cat_ana_yemek, demo_restaurant_id,
     'Iskender Kebap', 'Ince dilimlenmi kebap, tereyagli domates sos, yogurt ve pide uzerinde',
     210.00, 780, 18, ARRAY['gluten', 'sut'], ARRAY['populer'],
     '[{"name": "Porsiyon", "options": [{"label": "Normal", "price": 0}, {"label": "1.5 Porsiyon", "price": 70}]}]'::jsonb,
     true, 1)
  RETURNING id INTO item_iskender;

  INSERT INTO menu_items (category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (cat_ana_yemek, demo_restaurant_id,
     'Karisik Pide', 'Kusbasi et, kashar, domates ve biber ile firin pide',
     145.00, 580, 15, ARRAY['gluten', 'sut'], ARRAY[]::text[],
     '[{"name": "Ekstralar", "options": [{"label": "Ekstra Kashar", "price": 20}, {"label": "Yumurta", "price": 10}]}]'::jsonb,
     true, 2)
  RETURNING id INTO item_pide;

  INSERT INTO menu_items (id, category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (gen_random_uuid(), cat_ana_yemek, demo_restaurant_id,
     'Tavuk Sis', 'Marine edilmis tavuk sis, pilav ve közlenmis sebze ile',
     155.00, 520, 18, ARRAY[]::text[], ARRAY[]::text[],
     '[{"name": "Ek Garnitur", "options": [{"label": "Pilav", "price": 25}, {"label": "Patates", "price": 20}]}]'::jsonb,
     true, 3),

    (gen_random_uuid(), cat_ana_yemek, demo_restaurant_id,
     'Kofte Tabagi', 'Izgara kofte, pilav, közlenmis biber ve domates',
     140.00, 600, 15, ARRAY['gluten'], ARRAY[]::text[],
     '[]'::jsonb, true, 4),

    (gen_random_uuid(), cat_ana_yemek, demo_restaurant_id,
     'Balik Izgara', 'Gunun taze baligi, roka salatasi ve limon ile',
     220.00, 420, 22, ARRAY['balik'], ARRAY['yeni'],
     '[{"name": "Balik Secimi", "options": [{"label": "Levrek", "price": 0}, {"label": "Somon", "price": 30}, {"label": "Cipura", "price": 10}]}]'::jsonb,
     true, 5);

  -- Icecekler (Beverages)
  INSERT INTO menu_items (id, category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (gen_random_uuid(), cat_icecekler, demo_restaurant_id,
     'Turk Cayi', 'Geleneksel demlik cay, ince belli bardakta',
     15.00, 5, 3, ARRAY[]::text[], ARRAY[]::text[],
     '[]'::jsonb, true, 0),

    (gen_random_uuid(), cat_icecekler, demo_restaurant_id,
     'Turk Kahvesi', 'Orta sekerli geleneksel Turk kahvesi',
     35.00, 10, 5, ARRAY[]::text[], ARRAY['populer'],
     '[{"name": "Seker Tercihi", "options": [{"label": "Sade", "price": 0}, {"label": "Az Sekerli", "price": 0}, {"label": "Orta", "price": 0}, {"label": "Sekerli", "price": 0}]}]'::jsonb,
     true, 1),

    (gen_random_uuid(), cat_icecekler, demo_restaurant_id,
     'Ayran', 'Ev yapimi geleneksel ayran',
     25.00, 60, 2, ARRAY['sut'], ARRAY[]::text[],
     '[]'::jsonb, true, 2),

    (gen_random_uuid(), cat_icecekler, demo_restaurant_id,
     'Taze Limonata', 'Taze sikilmis limon ve nane ile',
     40.00, 80, 5, ARRAY[]::text[], ARRAY['populer'],
     '[{"name": "Boyut", "options": [{"label": "Normal (300ml)", "price": 0}, {"label": "Buyuk (500ml)", "price": 15}]}]'::jsonb,
     true, 3),

    (gen_random_uuid(), cat_icecekler, demo_restaurant_id,
     'Kola', 'Coca-Cola 330ml',
     30.00, 140, 1, ARRAY[]::text[], ARRAY[]::text[],
     '[]'::jsonb, true, 4),

    (gen_random_uuid(), cat_icecekler, demo_restaurant_id,
     'Su', 'Dogal kaynak suyu 500ml',
     10.00, 0, 1, ARRAY[]::text[], ARRAY[]::text[],
     '[]'::jsonb, true, 5);

  -- Tatlilar (Desserts)
  INSERT INTO menu_items (id, category_id, restaurant_id, name, description, price, calories, prep_time, allergens, badges, modifiers, is_available, sort_order) VALUES
    (gen_random_uuid(), cat_tatlilar, demo_restaurant_id,
     'Kunefe', 'Hatay usulu sicak kunefe, antep fistigi ile',
     95.00, 450, 12, ARRAY['gluten', 'sut', 'findik'], ARRAY['populer', 'chef_onerisi'],
     '[{"name": "Ekstralar", "options": [{"label": "Dondurma", "price": 15}, {"label": "Ekstra Fistik", "price": 20}]}]'::jsonb,
     true, 0),

    (gen_random_uuid(), cat_tatlilar, demo_restaurant_id,
     'Baklava', 'El acmasi 40 kat fistikli baklava (4 dilim)',
     85.00, 520, 5, ARRAY['gluten', 'findik'], ARRAY[]::text[],
     '[]'::jsonb, true, 1),

    (gen_random_uuid(), cat_tatlilar, demo_restaurant_id,
     'Sutlac', 'Firin sutlac, tarcinli',
     55.00, 280, 5, ARRAY['sut', 'gluten'], ARRAY[]::text[],
     '[]'::jsonb, true, 2),

    (gen_random_uuid(), cat_tatlilar, demo_restaurant_id,
     'Dondurma', 'Maras usulu kesme dondurma (3 top)',
     60.00, 240, 3, ARRAY['sut'], ARRAY['yeni'],
     '[{"name": "Cesit Secimi", "options": [{"label": "Vanilya", "price": 0}, {"label": "Cikolata", "price": 0}, {"label": "Antep Fistigi", "price": 5}, {"label": "Karamel", "price": 0}]}]'::jsonb,
     true, 3);

  -- ---------------------------------------------------------------------------
  -- 6. Tables
  -- ---------------------------------------------------------------------------
  INSERT INTO tables (id, restaurant_id, table_number, capacity, position, status) VALUES
    (tbl_1, demo_restaurant_id, '1', 2, '{"x": 0, "y": 0}'::jsonb, 'empty'),
    (tbl_2, demo_restaurant_id, '2', 4, '{"x": 1, "y": 0}'::jsonb, 'occupied'),
    (tbl_3, demo_restaurant_id, '3', 4, '{"x": 2, "y": 0}'::jsonb, 'empty'),
    (tbl_4, demo_restaurant_id, '4', 6, '{"x": 0, "y": 1}'::jsonb, 'reserved'),
    (tbl_5, demo_restaurant_id, '5', 2, '{"x": 1, "y": 1}'::jsonb, 'empty'),
    (tbl_6, demo_restaurant_id, '6', 8, '{"x": 2, "y": 1}'::jsonb, 'cleaning')
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 7. Test Orders
  -- ---------------------------------------------------------------------------
  -- Order 1: New order on Table 2
  INSERT INTO orders (id, restaurant_id, table_id, items, total_amount, status, notes, waiter_called) VALUES
    (gen_random_uuid(), demo_restaurant_id, tbl_2,
     '[
       {"name": "Adana Kebap", "quantity": 2, "price": 185.00, "modifiers": ["Orta Acili", "Pilav"]},
       {"name": "Mercimek Corbasi", "quantity": 2, "price": 45.00, "modifiers": []},
       {"name": "Ayran", "quantity": 2, "price": 25.00, "modifiers": []}
     ]'::jsonb,
     510.00, 'new', 'Kebaplar iyi pismis olsun lutfen', false);

  -- Order 2: Preparing on Table 4
  INSERT INTO orders (id, restaurant_id, table_id, items, total_amount, status, notes, waiter_called) VALUES
    (gen_random_uuid(), demo_restaurant_id, tbl_4,
     '[
       {"name": "Iskender Kebap", "quantity": 1, "price": 210.00, "modifiers": ["1.5 Porsiyon"]},
       {"name": "Coban Salatasi", "quantity": 1, "price": 50.00, "modifiers": []},
       {"name": "Taze Limonata", "quantity": 2, "price": 40.00, "modifiers": ["Buyuk (500ml)"]},
       {"name": "Kunefe", "quantity": 1, "price": 95.00, "modifiers": ["Dondurma"]}
     ]'::jsonb,
     435.00, 'preparing', NULL, false);

  -- Order 3: Ready for delivery
  INSERT INTO orders (id, restaurant_id, table_id, items, total_amount, status, notes, waiter_called) VALUES
    (gen_random_uuid(), demo_restaurant_id, tbl_3,
     '[
       {"name": "Karisik Pide", "quantity": 1, "price": 145.00, "modifiers": ["Ekstra Kashar"]},
       {"name": "Turk Cayi", "quantity": 2, "price": 15.00, "modifiers": []}
     ]'::jsonb,
     175.00, 'ready', NULL, false);

  -- Order 4: Delivered (historical)
  INSERT INTO orders (id, restaurant_id, table_id, items, total_amount, status, notes, waiter_called) VALUES
    (gen_random_uuid(), demo_restaurant_id, tbl_1,
     '[
       {"name": "Sezar Salata", "quantity": 1, "price": 85.00, "modifiers": ["Somon"]},
       {"name": "Balik Izgara", "quantity": 1, "price": 220.00, "modifiers": ["Levrek"]},
       {"name": "Sutlac", "quantity": 2, "price": 55.00, "modifiers": []},
       {"name": "Turk Kahvesi", "quantity": 2, "price": 35.00, "modifiers": ["Orta"]}
     ]'::jsonb,
     485.00, 'delivered', 'Harika yemekti, tesekkurler!', false);

  -- Order 5: New order with waiter call
  INSERT INTO orders (id, restaurant_id, table_id, items, total_amount, status, notes, waiter_called) VALUES
    (gen_random_uuid(), demo_restaurant_id, tbl_5,
     '[
       {"name": "Sigara Boregi", "quantity": 1, "price": 65.00, "modifiers": []},
       {"name": "Tavuk Sis", "quantity": 1, "price": 155.00, "modifiers": ["Pilav"]},
       {"name": "Kola", "quantity": 1, "price": 30.00, "modifiers": []}
     ]'::jsonb,
     250.00, 'new', NULL, true);

  -- Order 6: Cancelled order
  INSERT INTO orders (id, restaurant_id, table_id, items, total_amount, status, notes, waiter_called) VALUES
    (gen_random_uuid(), demo_restaurant_id, tbl_6,
     '[
       {"name": "Kofte Tabagi", "quantity": 3, "price": 140.00, "modifiers": []},
       {"name": "Su", "quantity": 3, "price": 10.00, "modifiers": []}
     ]'::jsonb,
     450.00, 'cancelled', 'Musteri vazgecti', false);

  -- ---------------------------------------------------------------------------
  -- 8. Demo Campaigns
  -- ---------------------------------------------------------------------------
  INSERT INTO campaigns (id, restaurant_id, type, name, description, discount_type, discount_value, start_date, end_date, usage_limit, usage_count, is_active, config) VALUES
    (gen_random_uuid(), demo_restaurant_id, 'coupon',
     'HOSGELDIN10', 'Ilk siparis icin %10 indirim',
     'percentage', 10.00,
     now() - INTERVAL '7 days', now() + INTERVAL '30 days',
     100, 12, true,
     '{"minOrderAmount": 100}'::jsonb),

    (gen_random_uuid(), demo_restaurant_id, 'combo',
     'Kebap Menu', 'Adana Kebap + Icecek + Tatli ozel fiyat',
     'fixed', 50.00,
     now() - INTERVAL '3 days', now() + INTERVAL '60 days',
     NULL, 8, true,
     '{"items": ["Adana Kebap", "Ayran", "Baklava"], "comboPrice": 250.00}'::jsonb),

    (gen_random_uuid(), demo_restaurant_id, 'happy_hour',
     'Cay Saati', 'Hafta ici 14:00-17:00 arasi tum iceceklerde %20 indirim',
     'percentage', 20.00,
     now() - INTERVAL '14 days', now() + INTERVAL '90 days',
     NULL, 45, true,
     '{"startTime": "14:00", "endTime": "17:00", "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"], "applicableCategories": ["Icecekler"]}'::jsonb),

    (gen_random_uuid(), demo_restaurant_id, 'banner',
     'Ramazan Ozel Menusu', 'Ramazan ayina ozel iftar menusu! Corba + Ana Yemek + Tatli + Icecek sadece 299 TL',
     NULL, NULL,
     now(), now() + INTERVAL '30 days',
     NULL, 0, true,
     '{"imageUrl": null, "linkUrl": null, "position": "top"}'::jsonb);

  -- ---------------------------------------------------------------------------
  -- 9. Demo Announcements (Super Admin)
  -- ---------------------------------------------------------------------------
  INSERT INTO announcements (id, title, content, severity, target, target_config, is_read) VALUES
    (gen_random_uuid(),
     'Platforma Hosgeldiniz!',
     'QR Menu platformumuza hosgeldiniz. Herhangi bir sorunuz varsa destek ekibimize ulasabilirsiniz.',
     'info', 'all', '{}'::jsonb, false),

    (gen_random_uuid(),
     'Sistem Bakimi - 20 Mart',
     '20 Mart 2026 saat 03:00-05:00 arasi planlanan bakim calismalari yapilacaktir. Bu surede sistemde kisa sureli kesintiler yasanabilir.',
     'warning', 'all', '{}'::jsonb, false),

    (gen_random_uuid(),
     'Yeni Ozellik: Kampanya Yonetimi',
     'Artik dashboard uzerinden kupon, kombo menu ve happy hour kampanyalari olusturabilirsiniz!',
     'info', 'plan_based', '{"plans": ["pro", "enterprise"]}'::jsonb, true);

  -- ---------------------------------------------------------------------------
  -- 10. Super Admin User Profile
  -- ---------------------------------------------------------------------------
  -- Note: Create this user via Supabase Auth, then insert profile.
  INSERT INTO user_profiles (id, full_name, phone, role)
  VALUES ('00000000-0000-0000-0000-000000000099', 'Super Admin', '+90 500 000 0000', 'super_admin')
  ON CONFLICT (id) DO NOTHING;

END $$;
