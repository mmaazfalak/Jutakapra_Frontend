-- ==============================================================================
-- JUTA.KAPRA: 100% DYNAMIC PRODUCTS & PAYMENT GATEWAYS MASTER SCHEMA FOR SUPABASE
-- Run this script in Supabase Dashboard -> SQL Editor -> New Query
-- Target Database: https://kbdrlhiishmetsddlstq.supabase.co
-- Zero-Code Data Architecture: Every product & payment method lives in Supabase.
-- ==============================================================================

-- 1. PRODUCTS TABLE DDL
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  era TEXT NOT NULL DEFAULT '1990s',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  condition_grade TEXT NOT NULL DEFAULT 'Vintage 9/10',
  condition_tier TEXT NOT NULL DEFAULT 'Good',
  size TEXT NOT NULL DEFAULT 'One Size',
  measurements JSONB DEFAULT '{}'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  details JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  is_1of1 BOOLEAN NOT NULL DEFAULT TRUE,
  inventory_type TEXT DEFAULT 'thrift_1of1',
  stock_count INT DEFAULT 1,
  store_id TEXT DEFAULT 'store-f7-archive',
  store_name TEXT DEFAULT 'F-7 Flagship Archive',
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  is_reserved BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  is_hot_deal BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  tags JSONB DEFAULT '[]'::jsonb,
  drop_batch TEXT,
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-speed catalog querying
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_hidden ON public.products(is_hidden);
CREATE INDEX IF NOT EXISTS idx_products_date_added ON public.products(date_added DESC);

-- Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public or service manage products" ON public.products;
CREATE POLICY "Public or service manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 2. PAYMENT GATEWAYS TABLE DDL
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  environment TEXT DEFAULT 'live',
  account_title TEXT,
  account_number TEXT,
  iban TEXT,
  swift_code TEXT,
  bank_name TEXT,
  min_order_limit NUMERIC(10,2),
  max_order_limit NUMERIC(10,2),
  disclaimer_note TEXT,
  custom_instructions TEXT,
  auto_confirm_cod BOOLEAN DEFAULT FALSE,
  publishable_key TEXT,
  encrypted_secret_key TEXT,
  webhook_secret TEXT,
  webhook_endpoint TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes & RLS for Payment Gateways
CREATE INDEX IF NOT EXISTS idx_payment_gateways_type ON public.payment_gateways(type);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_enabled ON public.payment_gateways(is_enabled);

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read payment gateways" ON public.payment_gateways;
CREATE POLICY "Public read payment gateways" ON public.payment_gateways FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public or service manage payment gateways" ON public.payment_gateways;
CREATE POLICY "Public or service manage payment gateways" ON public.payment_gateways FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. SEED PAYMENT GATEWAYS (COD, Easypaisa, JazzCash, Meezan Bank, Stripe, TomPay)
-- ------------------------------------------------------------------------------
INSERT INTO public.payment_gateways (
  id, type, title, provider_name, is_enabled, environment, account_title, account_number,
  iban, swift_code, bank_name, min_order_limit, max_order_limit, disclaimer_note, custom_instructions,
  publishable_key, updated_at
) VALUES (
  'gw-cod', 'cod', 'Cash on Delivery (COD)', 'Cash on Delivery', TRUE, 'live', NULL, NULL, NULL, NULL, NULL, 500, 100000, 'Cash payment collected by courier rider upon physical delivery.', NULL, NULL, NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  provider_name = EXCLUDED.provider_name,
  is_enabled = EXCLUDED.is_enabled,
  min_order_limit = EXCLUDED.min_order_limit,
  max_order_limit = EXCLUDED.max_order_limit,
  disclaimer_note = EXCLUDED.disclaimer_note,
  updated_at = NOW();

INSERT INTO public.payment_gateways (
  id, type, title, provider_name, is_enabled, environment, account_title, account_number,
  iban, swift_code, bank_name, min_order_limit, max_order_limit, disclaimer_note, custom_instructions,
  publishable_key, updated_at
) VALUES (
  'gw-easypaisa', 'easypaisa', 'Easypaisa Mobile Wallet', 'Telenor Bank Easypaisa', TRUE, 'live', 'Forge Supply Operations', '0300 5550192', NULL, NULL, NULL, NULL, NULL, NULL, 'Transfer total amount to Easypaisa number 03005550192. Attach Order ID as message reference.', NULL, NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  provider_name = EXCLUDED.provider_name,
  is_enabled = EXCLUDED.is_enabled,
  account_title = EXCLUDED.account_title,
  account_number = EXCLUDED.account_number,
  custom_instructions = EXCLUDED.custom_instructions,
  updated_at = NOW();

INSERT INTO public.payment_gateways (
  id, type, title, provider_name, is_enabled, environment, account_title, account_number,
  iban, swift_code, bank_name, min_order_limit, max_order_limit, disclaimer_note, custom_instructions,
  publishable_key, updated_at
) VALUES (
  'gw-jazzcash', 'jazzcash', 'JazzCash Mobile Wallet', 'Mobilink Microfinance JazzCash', TRUE, 'live', 'Forge Supply Operations', '0300 5550192', NULL, NULL, NULL, NULL, NULL, NULL, 'Transfer payment to JazzCash wallet 03005550192. Send confirmation screenshot.', NULL, NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  provider_name = EXCLUDED.provider_name,
  is_enabled = EXCLUDED.is_enabled,
  account_title = EXCLUDED.account_title,
  account_number = EXCLUDED.account_number,
  custom_instructions = EXCLUDED.custom_instructions,
  updated_at = NOW();

INSERT INTO public.payment_gateways (
  id, type, title, provider_name, is_enabled, environment, account_title, account_number,
  iban, swift_code, bank_name, min_order_limit, max_order_limit, disclaimer_note, custom_instructions,
  publishable_key, updated_at
) VALUES (
  'gw-meezan', 'bank', 'Meezan Bank Limited Transfer', 'Meezan Bank Ltd', TRUE, 'live', 'Forge Supply Pvt Ltd', '01010102940192', 'PK36MEZN0001010102940192', 'MEZNPKKA', 'Meezan Bank', NULL, NULL, NULL, 'Direct bank transfer to Meezan Bank. Immediate verification upon receipt.', NULL, NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  provider_name = EXCLUDED.provider_name,
  is_enabled = EXCLUDED.is_enabled,
  account_title = EXCLUDED.account_title,
  account_number = EXCLUDED.account_number,
  iban = EXCLUDED.iban,
  swift_code = EXCLUDED.swift_code,
  bank_name = EXCLUDED.bank_name,
  custom_instructions = EXCLUDED.custom_instructions,
  updated_at = NOW();

INSERT INTO public.payment_gateways (
  id, type, title, provider_name, is_enabled, environment, account_title, account_number,
  iban, swift_code, bank_name, min_order_limit, max_order_limit, disclaimer_note, custom_instructions,
  publishable_key, updated_at
) VALUES (
  'gw-stripe', 'stripe', 'Credit / Debit Cards (Stripe)', 'Stripe Payments Inc.', TRUE, 'live', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pk_test_placeholder_key', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  provider_name = EXCLUDED.provider_name,
  is_enabled = EXCLUDED.is_enabled,
  publishable_key = EXCLUDED.publishable_key,
  updated_at = NOW();

INSERT INTO public.payment_gateways (
  id, type, title, provider_name, is_enabled, environment, account_title, account_number,
  iban, swift_code, bank_name, min_order_limit, max_order_limit, disclaimer_note, custom_instructions,
  publishable_key, updated_at
) VALUES (
  'gw-tompay', 'tompay', 'TomPay - Card & Digital Wallet (UK / Global)', 'TomPay Financial Services Ltd', TRUE, 'live', NULL, NULL, NULL, NULL, NULL, 500, 500000, 'Pay securely via TomPay with global credit/debit cards and local wallets.', 'Instant redirect to TomPay PCI-DSS Level 1 secure payment checkout session.', 'tp_live_0Rwf4QnZIY8nOEHunJoenOnqu9olG28D', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  provider_name = EXCLUDED.provider_name,
  is_enabled = EXCLUDED.is_enabled,
  publishable_key = EXCLUDED.publishable_key,
  min_order_limit = EXCLUDED.min_order_limit,
  max_order_limit = EXCLUDED.max_order_limit,
  disclaimer_note = EXCLUDED.disclaimer_note,
  custom_instructions = EXCLUDED.custom_instructions,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 4. SEED 10 REAL ARCHIVAL PRODUCTS (BAGS, LUGGAGE & TECHWEAR)
-- ------------------------------------------------------------------------------

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-001',
  'nike-classic-swoosh-navy-black-canvas-backpack',
  'Nike Classic Swoosh Navy & Black Canvas Backpack',
  'Accessories',
  'Backpacks & Bags',
  '2000s Vintage',
  6500.00,
  8500.00,
  'Vintage 9/10 - Excellent Condition',
  'Mint',
  'One Size (24L)',
  '{"height":"18.5 in","width":"13.0 in","depth":"6.0 in","volume":"24 Liters"}'::jsonb,
  'Authentic archival Nike sports backpack featuring high-density navy blue woven canvas with a black coated weather-resistant top panel. Bold white oversized Nike Swoosh graphic, dual two-way heavy zipper pulls, padded ergonomic shoulder straps, and spacious main vault compartment.',
  '["High-density 600D woven canvas with water-resistant coated top","Screen-printed archival oversized Nike Swoosh","Adjustable padded air-mesh shoulder harness","Dual zipper pulls with reinforced storm guard","Spacious 24L volume fitting 15-inch laptops"]'::jsonb,
  '["/images/products/nike-swoosh-navy-backpack.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, TRUE, TRUE,
  '["Nike","Backpack","Swoosh","Streetwear","Vintage Nike","1-of-1","Archive Bag"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-002',
  'aibag-tactical-techwear-all-black-waterproof-backpack',
  'AIBAG Tactical Techwear All-Black Waterproof Backpack',
  'Accessories',
  'Tactical & Techwear',
  'Archival Techwear',
  9500.00,
  12500.00,
  'Deadstock 10/10 - Brand New with Tags',
  'Deadstock',
  'One Size (30L)',
  '{"height":"19.5 in","width":"13.5 in","depth":"7.0 in","volume":"30 Liters"}'::jsonb,
  'Futuristic techwear tactical backpack by AIBAG in matte black coated water-repellent shell. Features top flap closure with dual quick-release ABS buckles, subtle iridescent holographic accent tab, 3D chevron logo, padded breathable air-mesh back panel, and chest stabilizer buckle. Includes original factory hangtags.',
  '["Waterproof polyurethane-coated high-density textile","Dual front quick-release heavy duty compression buckles","Ergonomic 3D mesh breathable spine padding with sternum strap","Original AIBAG brand hangtags attached","Internal padded shockproof laptop sleeve up to 16 inches"]'::jsonb,
  '["/images/products/aibag-tactical-techwear-backpack-front.jpg","/images/products/aibag-tactical-techwear-backpack-back.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, FALSE, TRUE,
  '["AIBAG","Techwear","Tactical","Waterproof","Matte Black","1-of-1","Laptop Backpack"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-003',
  'kemitu-harajuku-pastel-bunny-ears-canvas-tote-backpack',
  'KeMiTu Harajuku Pastel Bunny Ears Canvas Tote Backpack',
  'Accessories',
  'Totes & Harajuku',
  'Japanese Kawaii Y2K',
  5800.00,
  7500.00,
  'Mint 9.5/10 - Like New Condition',
  'Mint',
  'One Size (Convertible)',
  '{"height":"15.0 in","width":"13.0 in","depth":"4.5 in"}'::jsonb,
  'Japanese aesthetic pastel Harajuku canvas convertible bag featuring soft lilac purple and ivory cream color-blocking with stitched plush bunny ears. Includes detachable round zip coin purse featuring "Happy Time" wizard puppy character, reinforced webbing tote handles, and convertible shoulder backpack straps.',
  '["Heavyweight pastel canvas with durable nylon webbing","Embroidered plush bunny ear front flap detail","Detachable clip-on \"Happy Time\" circular coin pouch","Dual side elastic bottle pockets & smooth nylon top zip","Convertible 2-way carry: hand tote or shoulder backpack"]'::jsonb,
  '["/images/products/kemitu-pastel-bunny-tote-backpack.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, TRUE, TRUE,
  '["KeMiTu","Harajuku","Pastel","Kawaii","Bunny Ears","Canvas Tote","1-of-1"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-004',
  'capybara-harajuku-aesthetic-multi-pocket-cream-canvas-tote',
  'Capybara Harajuku Aesthetic Multi-Pocket Cream Canvas Tote',
  'Accessories',
  'Totes & Harajuku',
  'Harajuku Streetwear',
  5500.00,
  7000.00,
  'Mint 9.5/10 - Pristine Condition',
  'Mint',
  'One Size (Large Tote)',
  '{"height":"15.5 in","width":"14.0 in","depth":"4.5 in"}'::jsonb,
  'Aesthetic Japanese college streetwear cream canvas tote bag with embroidered Capybara logo motif. Front features a spacious transparent mesh utility pocket displaying collectible anime art cards, top zip compartment with pull tabs, and circular enamel character pin badge on upper collar.',
  '["Natural ecru cream heavyweight washed cotton canvas","Front breathable mesh pocket with anime collectible cards","Embroidered Capybara Japanese typography graphic","Includes collectible round capybara badge pin","Reinforced shoulder webbing straps with box-stitching"]'::jsonb,
  '["/images/products/capybara-harajuku-cream-canvas-tote.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, FALSE, TRUE,
  '["Capybara","Harajuku","Aesthetic","Cream Tote","Mesh Pocket","Streetwear","1-of-1"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-005',
  'tbj-kids-urban-utility-multi-pocket-ok-canvas-tote',
  'TBJ-KIDS Urban Utility Multi-Pocket "OK!" Canvas Tote',
  'Accessories',
  'Totes & Harajuku',
  'Y2K Utility Streetwear',
  5200.00,
  6800.00,
  'Mint 9.5/10 - Flawless Condition',
  'Mint',
  'One Size (Multi-Pocket)',
  '{"height":"14.5 in","width":"13.5 in","depth":"5.0 in"}'::jsonb,
  'Tactical urban utility canvas shoulder bag in crisp off-white with contrast black cross-webbing and D-rings. Equipped with an exterior flap cargo pouch with rubberized TBJ-KIDS badge, detachable circular "OK!" zip pouch, upper zip organizer pocket, and dual side hydration sleeves.',
  '["Durable water-resistant woven cream canvas shell","Contrast black tactical daisy-chain webbing with matte black D-rings","Detachable clip-on \"OK!\" circular coin/airpods purse","Front cargo flap pocket with rubber TBJ-KIDS emblem","Dual side cinch pockets for bottles or umbrella"]'::jsonb,
  '["/images/products/tbj-kids-urban-utility-ok-tote.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, TRUE, FALSE,
  '["TBJ-KIDS","Utility Tote","Tactical Canvas","Urban Streetwear","OK Pouch","1-of-1"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-006',
  'harajuku-streetwear-canvas-trio-archival-collector-set',
  'Harajuku Streetwear Canvas Trio Archival Collector Set',
  'Accessories',
  'Curated Bundles',
  'Japanese Harajuku Archive',
  14500.00,
  19000.00,
  'Collector Vault 9.5/10 - Three Piece Set',
  'Mint',
  'Set of 3 Matching Bags',
  '{"setIncludes":"3 Complete Archival Canvas Totes with all pouches & pins"}'::jsonb,
  'Rare opportunity to acquire the complete three-piece archival Harajuku canvas bag collector set: 1) The KeMiTu Pastel Lilac Bunny Ears Convertible Backpack, 2) The Capybara Mesh Utility Tote with Collector Art, and 3) The TBJ-KIDS Urban Utility OK! Cargo Tote. Complete with all detachable coin purses, pins, and accessories.',
  '["Curated full 3-piece Harajuku aesthetic canvas vault bundle","All original detachable coin purses and character pins included","Premium durable washed cotton canvas and heavy webbing straps","Verified authentic 1-of-1 Japanese thrift vault selection","Special bundled archive collector pricing"]'::jsonb,
  '["/images/products/harajuku-canvas-tote-trio-collection.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, TRUE, TRUE,
  '["Harajuku Trio","Collector Set","Canvas Bags","Kawaii","Bundle Deal","1-of-1 Grail"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-007',
  'tbjinag-im-ok-warm-caramel-bear-utility-canvas-tote',
  'TBJINAG "I''m OK!" Warm Caramel Bear Utility Canvas Tote',
  'Accessories',
  'Totes & Harajuku',
  'Vintage Retro Streetwear',
  5400.00,
  7000.00,
  'Vintage 9/10 - Great Condition',
  'Good',
  'One Size (Carryall Tote)',
  '{"height":"15.0 in","width":"13.5 in","depth":"5.0 in"}'::jsonb,
  'Warm caramel-brown and cream multi-tone utility tote bag featuring stitched character ears and front clear window pouch with cartoon bear comic prints. Golden "I''m OK! TBJINAG" embroidered branding, copper-toned heavy woven webbing handles, side bottle compartments, and deep zippered interior.',
  '["Rich caramel brown & warm ivory high-density canvas","Embroidered \"I''m OK! TBJINAG\" signature graphic","Front window pocket with pop-art character art cards","Contrast copper-tan webbing straps with boxed stress reinforcement","Generous carryall capacity for books, tablets, and daily essentials"]'::jsonb,
  '["/images/products/tbjinag-im-ok-caramel-bear-tote.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, FALSE, FALSE,
  '["TBJINAG","Caramel Tote","Bear Graphic","Retro Canvas","Harajuku","1-of-1"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-008',
  'cambridge-by-travelway-archival-crimson-luggage-duffel',
  'Cambridge by Travelway Archival Crimson Luggage Duffel',
  'Accessories',
  'Travel & Luggage',
  '1990s Vintage Luggage',
  11500.00,
  15500.00,
  'Vintage 9/10 - Original Thrift Tag Preserved',
  'Good',
  'Medium Carry-On (25L)',
  '{"height":"17.0 in","width":"12.5 in","depth":"6.5 in","capacity":"25 Liters"}'::jsonb,
  'Rare 90s archival Cambridge by Travelway structured travel carry-on suitcase duffel in deep crimson woven ballistic nylon. Features signature die-cast Cambridge metal badge, reinforced black piping, double heavy-gauge top zippers, front zip boarding document pouch, and rear luggage trolley pass-through strap. Preserves authentic Value Village thrift provenance tag.',
  '["Heavyweight textured ballistic nylon in deep crimson red","Die-cast metal \"Cambridge by Travelway\" heritage emblem","Heavy-gauge dual metal zippers with reinforced piping","Rear trolley pass-through strap for rolling luggage attachment","Original Value Village archival thrift tag intact"]'::jsonb,
  '["/images/products/cambridge-travelway-crimson-duffel-front.jpg","/images/products/cambridge-travelway-crimson-duffel-badge.jpg","/images/products/cambridge-travelway-crimson-duffel-back.jpg","/images/products/cambridge-travelway-crimson-duffel-side.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, TRUE, TRUE,
  '["Cambridge","Travelway","Crimson Duffel","Vintage Luggage","Ballistic Nylon","1-of-1","Value Village Tag"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-009',
  'travel-select-vintage-burgundy-two-tone-travel-carryall',
  'Travel Select Vintage Burgundy Two-Tone Travel Carryall',
  'Accessories',
  'Travel & Luggage',
  '1990s Archival Travelwear',
  10500.00,
  14000.00,
  'Vintage 9/10 - Original $15.99 Thrift Tag',
  'Good',
  'Medium Carryall (22L)',
  '{"height":"16.0 in","width":"12.0 in","depth":"6.0 in","capacity":"22 Liters"}'::jsonb,
  'Archival 90s Travel Select structured travel shoulder duffel in two-tone burgundy twill and matte black ballistic canvas. Features molded oval Travel Select logo patch, dual-pull zip main cavity, front zippered quick-access slip pocket, and rear trolley sleeve. Includes preserved $15.99 Value Village collector thrift tag.',
  '["Rugged two-tone burgundy and black woven nylon canvas","Signature oval Travel Select brand badge on front panel","Dual oversized metal zipper sliders with luggage lock loops","Rear strap allows secure mounting atop rolling suitcases","Original Value Village $15.99 thrift provenance tag attached"]'::jsonb,
  '["/images/products/travel-select-burgundy-luggage-front.jpg","/images/products/travel-select-burgundy-luggage-side.jpg","/images/products/travel-select-burgundy-luggage-tag.jpg","/images/products/travel-select-burgundy-luggage-back.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, FALSE, TRUE,
  '["Travel Select","Burgundy Duffel","Vintage Travel","Thrift Tag","1-of-1","Carryall"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

INSERT INTO public.products (
  id, slug, title, category, subcategory, era, price, original_price, condition_grade, condition_tier,
  size, measurements, description, details, images, in_stock, is_1of1, inventory_type, stock_count,
  store_id, store_name, is_hidden, is_reserved, is_archived, is_hot_deal, is_trending, tags, drop_batch, date_added
) VALUES (
  'jk-archive-010',
  'lucas-gear-90s-canary-yellow-high-visibility-travel-duffel',
  'Lucas Gear 90s Canary Yellow High-Visibility Travel Duffel',
  'Accessories',
  'Travel & Luggage',
  '1990s Y2K Vintage',
  12000.00,
  16000.00,
  'Vintage 9.5/10 - Rare Colorway with $13.99 Thrift Tag',
  'Mint',
  'Compact Travel Duffel (20L)',
  '{"height":"16.0 in","width":"12.0 in","depth":"6.0 in","capacity":"20 Liters"}'::jsonb,
  'Showstopper 90s vintage travel bag by Lucas Gear in electrifying canary yellow with black piping and heavy webbed shoulder strap. Features 3D rubberized "Lucas Gear" badge on front waffle-mesh pocket, heavy-duty wraparound zippers, and padded top grip handle bearing the original $13.99 Value Village thrift tag.',
  '["High-visibility canary yellow heavy-duty nylon canvas","Molded 3D rubber Lucas Gear heritage logo","Front breathable rubberized waffle-mesh zipper pocket","Padded handle grip with original Value Village $13.99 price tag","Removable adjustable cross-body shoulder strap with swivel clips"]'::jsonb,
  '["/images/products/lucas-gear-canary-yellow-duffel-front.jpg","/images/products/lucas-gear-canary-yellow-duffel-handle.jpg"]'::jsonb,
  TRUE, TRUE, 'thrift_1of1', 1,
  'store-f7-archive', 'F-7 Flagship Archive',
  FALSE, FALSE, FALSE, TRUE, TRUE,
  '["Lucas Gear","Canary Yellow","High-Vis","Vintage Duffel","90s Travel","Value Village Tag","1-of-1 Grail"]'::jsonb,
  'Batch #49: Archival Luggage & Bags', NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, price = EXCLUDED.price, images = EXCLUDED.images, details = EXCLUDED.details, measurements = EXCLUDED.measurements, updated_at = NOW();

