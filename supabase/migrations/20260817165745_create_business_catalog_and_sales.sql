/*
# Create single-tenant retail and wholesale catalog

1. New Tables
- `products` stores the supplied catalog product identity, image path, pricing, barcode, stock, and minimum stock.
- `sales` stores completed POS transactions, payment method, cashier label, invoice number, totals, and timestamps.
- `sale_items` stores the product lines belonging to each completed sale.
- `inventory_movements` records opening stock, sales, purchases, returns, and adjustments.

2. Seed Data
- Adds the supplied Saya product `U01-25710-04AR` with its catalog barcode, PKR 2,999 retail price, and local product image path.

3. Security
- Enables row level security on all four tables.
- This is a single-tenant owner-demo application without a sign-in screen, so anon and authenticated roles receive shared CRUD access for the prototype.

4. Important Notes
- Product image files remain in the app's public product folder; the database stores only the stable local path.
- Sales and inventory movement rows are appendable from the POS flow and remain available across page reloads.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text NOT NULL UNIQUE,
  barcode text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT '3-piece',
  image_path text NOT NULL,
  retail_price numeric(12,2) NOT NULL DEFAULT 0,
  wholesale_price numeric(12,2),
  minimum_stock integer NOT NULL DEFAULT 5,
  current_stock integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  details text[] NOT NULL DEFAULT '{}',
  availability text NOT NULL DEFAULT 'In stock',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  cashier text NOT NULL DEFAULT 'Owner demo',
  payment_method text NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'ONLINE')),
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  sku text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL,
  line_total numeric(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('Opening Stock', 'Sale', 'Purchase', 'Return', 'Adjustment')),
  quantity integer NOT NULL,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_products_select" ON products;
DROP POLICY IF EXISTS "shared_products_insert" ON products;
DROP POLICY IF EXISTS "shared_products_update" ON products;
DROP POLICY IF EXISTS "shared_products_delete" ON products;
CREATE POLICY "shared_products_select" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_products_insert" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_products_update" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_products_delete" ON products FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_sales_select" ON sales;
DROP POLICY IF EXISTS "shared_sales_insert" ON sales;
DROP POLICY IF EXISTS "shared_sales_update" ON sales;
DROP POLICY IF EXISTS "shared_sales_delete" ON sales;
CREATE POLICY "shared_sales_select" ON sales FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_sales_insert" ON sales FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_sales_update" ON sales FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_sales_delete" ON sales FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_sale_items_select" ON sale_items;
DROP POLICY IF EXISTS "shared_sale_items_insert" ON sale_items;
DROP POLICY IF EXISTS "shared_sale_items_update" ON sale_items;
DROP POLICY IF EXISTS "shared_sale_items_delete" ON sale_items;
CREATE POLICY "shared_sale_items_select" ON sale_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_sale_items_insert" ON sale_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_sale_items_update" ON sale_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_sale_items_delete" ON sale_items FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_inventory_select" ON inventory_movements;
DROP POLICY IF EXISTS "shared_inventory_insert" ON inventory_movements;
DROP POLICY IF EXISTS "shared_inventory_update" ON inventory_movements;
DROP POLICY IF EXISTS "shared_inventory_delete" ON inventory_movements;
CREATE POLICY "shared_inventory_select" ON inventory_movements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_inventory_insert" ON inventory_movements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_inventory_update" ON inventory_movements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_inventory_delete" ON inventory_movements FOR DELETE TO anon, authenticated USING (true);

INSERT INTO products (name, sku, barcode, category, image_path, retail_price, wholesale_price, minimum_stock, current_stock, description, details, availability)
VALUES (
  'Royal Blue Printed Lawn 3-Piece',
  'U01-25710-04AR',
  '0167553',
  '3-piece',
  '/products/image.png',
  2999,
  NULL,
  5,
  24,
  'Premium printed lawn shirt with a printed lawn dupatta and dyed cambric trouser in Royal Blue.',
  ARRAY['Printed lawn shirt · 1.75 m', 'Printed lawn dupatta · 2.5 m', 'Dyed cambric trouser · 1.75 m'],
  'In stock'
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  barcode = EXCLUDED.barcode,
  image_path = EXCLUDED.image_path,
  retail_price = EXCLUDED.retail_price,
  description = EXCLUDED.description,
  details = EXCLUDED.details,
  availability = EXCLUDED.availability;

INSERT INTO inventory_movements (product_id, movement_type, quantity, reference)
SELECT id, 'Opening Stock', 24, 'Initial catalog stock'
FROM products
WHERE sku = 'U01-25710-04AR'
  AND NOT EXISTS (
    SELECT 1 FROM inventory_movements m WHERE m.product_id = products.id AND m.movement_type = 'Opening Stock'
  );