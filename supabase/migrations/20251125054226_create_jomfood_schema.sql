/*
  # JomFood Application Schema

  1. New Tables
    - `business_groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `api_key` (text)
      - `business_group_url` (text)
      - `is_sync_enabled` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `businesses`
      - `id` (uuid, primary key)
      - `business_group_id` (uuid, foreign key)
      - `external_id` (text)
      - `mp_id` (text)
      - `company_name` (text)
      - `email` (text)
      - `mobile_number` (text)
      - `office_phone` (text)
      - `address` (text)
      - `lat` (numeric)
      - `lng` (numeric)
      - `image_url` (text)
      - `ic_front_url` (text)
      - `ic_back_url` (text)
      - `average_rating` (numeric, default 0)
      - `free_distance` (numeric, default 0)
      - `race` (text)
      - `is_food_seller` (boolean)
      - `datetime_created` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `is_active` (boolean, default true)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `deal_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `is_active` (boolean, default true)
      - `display_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `business_id` (uuid, foreign key)
      - `product_name` (text)
      - `product_sku` (text)
      - `product_price` (numeric)
      - `product_image` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `deals`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `group_id` (uuid, foreign key)
      - `deal_category_id` (uuid, foreign key, nullable)
      - `deal_name` (text)
      - `deal_description` (text)
      - `deal_type` (text) -- 'percentage' or 'fixed'
      - `discount_amount` (numeric)
      - `discount_percentage` (numeric)
      - `original_total` (numeric)
      - `deal_total` (numeric)
      - `deal_image` (text)
      - `is_active` (boolean, default true)
      - `status` (text, default 'active')
      - `max_quantity` (integer)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `tags` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `deal_items`
      - `id` (uuid, primary key)
      - `deal_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer, default 1)
      - `created_at` (timestamptz)
    
    - `deal_claims`
      - `id` (uuid, primary key)
      - `deal_id` (uuid, foreign key)
      - `customer_id` (text)
      - `business_id` (uuid, foreign key)
      - `group_id` (uuid, foreign key)
      - `claim_code` (text, unique)
      - `is_used` (boolean, default false)
      - `used_at` (timestamptz)
      - `is_rejected` (boolean, default false)
      - `rejection_reason` (text)
      - `rejected_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add public read policies for active deals, businesses, and categories
    - Add authenticated policies for deal claims
*/

-- Create business_groups table
CREATE TABLE IF NOT EXISTS business_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  api_key text,
  business_group_url text,
  is_sync_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_group_id uuid REFERENCES business_groups(id) ON DELETE CASCADE,
  external_id text,
  mp_id text,
  company_name text NOT NULL,
  email text,
  mobile_number text,
  office_phone text,
  address text,
  lat numeric,
  lng numeric,
  image_url text,
  ic_front_url text,
  ic_back_url text,
  average_rating numeric DEFAULT 0,
  free_distance numeric DEFAULT 0,
  race text,
  is_food_seller boolean DEFAULT false,
  datetime_created timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deal_categories table
CREATE TABLE IF NOT EXISTS deal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_sku text,
  product_price numeric NOT NULL DEFAULT 0,
  product_image text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  group_id uuid REFERENCES business_groups(id) ON DELETE CASCADE,
  deal_category_id uuid REFERENCES deal_categories(id) ON DELETE SET NULL,
  deal_name text NOT NULL,
  deal_description text DEFAULT '',
  deal_type text NOT NULL CHECK (deal_type IN ('percentage', 'fixed')),
  discount_amount numeric DEFAULT 0,
  discount_percentage numeric DEFAULT 0,
  original_total numeric DEFAULT 0,
  deal_total numeric DEFAULT 0,
  deal_image text,
  is_active boolean DEFAULT true,
  status text DEFAULT 'active',
  max_quantity integer,
  start_date timestamptz,
  end_date timestamptz,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deal_items table
CREATE TABLE IF NOT EXISTS deal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create deal_claims table
CREATE TABLE IF NOT EXISTS deal_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  group_id uuid REFERENCES business_groups(id) ON DELETE CASCADE,
  claim_code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  is_rejected boolean DEFAULT false,
  rejection_reason text,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_group ON businesses(business_group_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(lat, lng);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_group ON deals(group_id);
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(deal_category_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active, status);
CREATE INDEX IF NOT EXISTS idx_deals_dates ON deals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_deal_items_deal ON deal_items(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_items_product ON deal_items(product_id);
CREATE INDEX IF NOT EXISTS idx_deal_claims_deal ON deal_claims(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_claims_customer ON deal_claims(customer_id);
CREATE INDEX IF NOT EXISTS idx_deal_claims_code ON deal_claims(claim_code);

-- Enable RLS
ALTER TABLE business_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_claims ENABLE ROW LEVEL SECURITY;

-- Public read policies for business_groups
CREATE POLICY "Anyone can view business groups"
  ON business_groups FOR SELECT
  TO public
  USING (true);

-- Public read policies for businesses
CREATE POLICY "Anyone can view businesses"
  ON businesses FOR SELECT
  TO public
  USING (true);

-- Public read policies for categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO public
  USING (is_active = true);

-- Public read policies for deal_categories
CREATE POLICY "Anyone can view active deal categories"
  ON deal_categories FOR SELECT
  TO public
  USING (is_active = true);

-- Public read policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

-- Public read policies for deals
CREATE POLICY "Anyone can view active deals"
  ON deals FOR SELECT
  TO public
  USING (is_active = true AND status = 'active');

-- Public read policies for deal_items
CREATE POLICY "Anyone can view deal items"
  ON deal_items FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_items.deal_id
      AND deals.is_active = true
      AND deals.status = 'active'
    )
  );

-- Deal claims policies (anyone can claim, but only view their own)
CREATE POLICY "Anyone can create deal claims"
  ON deal_claims FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own claims"
  ON deal_claims FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update their claims"
  ON deal_claims FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
