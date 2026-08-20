/*
# Transform to wholesale fabric inventory (thaan/meter model)

1. Schema Changes
- products: add fabric_type, unit, meters_per_thaan, thaan_count, total_meters, cost_per_meter, location columns
- thaans: new table for individual thaan/roll tracking (original/sold/remaining meters, status FULL/PARTIAL/SOLD OUT)
- sale_items: add meters numeric column for decimal meter quantities
- inventory_movements: add meters numeric column for decimal meter quantities

2. Seed Data
- Replaces the single clothing product with 15 fabric products across Lawn, Cotton, Cambric, Khaddar, Silk, and Dupatta categories
- Seeds individual thaans for the first 5 products with FULL/PARTIAL/SOLD OUT statuses
- Seeds opening stock inventory movements for all products
- Seeds sample stock movements (sale, purchase, transfer) for Printed Lawn

3. Security
- Enables RLS on thaans with shared anon/authenticated CRUD access (single-tenant prototype)

4. Important Notes
- This migration transforms the catalog from a clothing product model to a fabric thaan/meter model
- All product images use neutral placeholders; the database stores empty image paths
- Demo data is for prototype purposes only
- The quantity column on sale_items remains integer (set to 1) while the meters column stores the actual decimal meters sold
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_type text DEFAULT 'Lawn';
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit text DEFAULT 'Meter';
ALTER TABLE products ADD COLUMN IF NOT EXISTS meters_per_thaan numeric DEFAULT 25;
ALTER TABLE products ADD COLUMN IF NOT EXISTS thaan_count integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_meters numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_per_meter numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS location text DEFAULT '';

CREATE TABLE IF NOT EXISTS thaans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  thaan_number text NOT NULL,
  original_meters numeric NOT NULL,
  sold_meters numeric NOT NULL DEFAULT 0,
  remaining_meters numeric NOT NULL,
  status text NOT NULL DEFAULT 'FULL' CHECK (status IN ('FULL', 'PARTIAL', 'SOLD OUT')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS thaans_product_thaan_unique ON thaans(product_id, thaan_number);

ALTER TABLE thaans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_thaans_select" ON thaans;
DROP POLICY IF EXISTS "shared_thaans_insert" ON thaans;
DROP POLICY IF EXISTS "shared_thaans_update" ON thaans;
DROP POLICY IF EXISTS "shared_thaans_delete" ON thaans;
CREATE POLICY "shared_thaans_select" ON thaans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_thaans_insert" ON thaans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_thaans_update" ON thaans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_thaans_delete" ON thaans FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS meters numeric;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS meters numeric;

DO $$ BEGIN
  DELETE FROM sale_items WHERE product_id = (SELECT id FROM products WHERE sku = 'U01-25710-04AR');
  DELETE FROM inventory_movements WHERE product_id = (SELECT id FROM products WHERE sku = 'U01-25710-04AR');
  DELETE FROM products WHERE sku = 'U01-25710-04AR';
END $$;

INSERT INTO products (name, sku, barcode, fabric_type, unit, meters_per_thaan, thaan_count, total_meters, cost_per_meter, wholesale_price, retail_price, minimum_stock, location, image_path, description, availability, details)
VALUES
  ('Printed Lawn', 'LWN-001', '890123456001', 'Lawn', 'Meter', 25, 18, 450, 1850, 2150, 2350, 100, 'A-03', '', 'Printed lawn fabric by the meter, sold in thaans of 25m.', 'In Stock', ARRAY['Lawn','Printed']),
  ('Plain White Lawn', 'LWN-002', '890123456002', 'Lawn', 'Meter', 25, 22, 550, 1600, 1850, 2050, 100, 'A-01', '', 'Plain white lawn fabric, versatile for retail and wholesale.', 'In Stock', ARRAY['Lawn','Plain']),
  ('Cotton Fabric', 'COT-014', '890123456003', 'Cotton', 'Meter', 25, 12, 300, 1450, 1750, 1950, 80, 'B-02', '', 'Cotton fabric suitable for everyday wear.', 'In Stock', ARRAY['Cotton','Plain']),
  ('Cambric Plain', 'CAM-021', '890123456004', 'Cambric', 'Meter', 25, 6, 150, 1300, 1550, 1750, 80, 'C-01', '', 'Cambric fabric, lightweight and durable.', 'Low Stock', ARRAY['Cambric','Plain']),
  ('Khaddar', 'KHD-008', '890123456005', 'Khaddar', 'Meter', 25, 15, 375, 1700, 1950, 2200, 80, 'D-01', '', 'Khaddar fabric for winter collections.', 'In Stock', ARRAY['Khaddar','Plain']),
  ('Pure Silk', 'SLK-003', '890123456006', 'Silk', 'Meter', 25, 8, 200, 3200, 3800, 4500, 50, 'E-01', '', 'Pure silk fabric for premium collections.', 'In Stock', ARRAY['Silk','Plain']),
  ('Dupatta Lawn', 'DUP-012', '890123456007', 'Dupatta', 'Meter', 25, 10, 250, 850, 1050, 1250, 60, 'F-01', '', 'Lawn dupatta fabric by the meter.', 'In Stock', ARRAY['Dupatta','Lawn']),
  ('Printed Cambric', 'CAM-022', '890123456008', 'Cambric', 'Meter', 25, 14, 350, 1400, 1650, 1850, 80, 'C-02', '', 'Printed cambric fabric with seasonal designs.', 'In Stock', ARRAY['Cambric','Printed']),
  ('Dyed Cotton', 'COT-015', '890123456009', 'Cotton', 'Meter', 25, 4, 100, 1500, 1800, 2000, 80, 'B-03', '', 'Dyed cotton fabric in seasonal colors.', 'Low Stock', ARRAY['Cotton','Dyed']),
  ('Premium Lawn', 'LWN-003', '890123456010', 'Lawn', 'Meter', 25, 20, 500, 2000, 2350, 2650, 100, 'A-04', '', 'Premium lawn fabric with fine weave.', 'In Stock', ARRAY['Lawn','Premium']),
  ('Khaddar Plain', 'KHD-009', '890123456011', 'Khaddar', 'Meter', 25, 0, 0, 1750, 2000, 2250, 80, 'D-02', '', 'Khaddar plain fabric, currently out of stock.', 'Out of Stock', ARRAY['Khaddar','Plain']),
  ('Silk Print', 'SLK-004', '890123456012', 'Silk', 'Meter', 25, 9, 225, 3400, 4000, 4700, 50, 'E-02', '', 'Printed silk fabric for premium outfits.', 'In Stock', ARRAY['Silk','Printed']),
  ('Cambric Dyed', 'CAM-023', '890123456013', 'Cambric', 'Meter', 25, 16, 400, 1450, 1700, 1900, 80, 'C-03', '', 'Dyed cambric fabric in multiple shades.', 'In Stock', ARRAY['Cambric','Dyed']),
  ('Cotton Print', 'COT-016', '890123456014', 'Cotton', 'Meter', 25, 11, 275, 1550, 1850, 2050, 80, 'B-04', '', 'Printed cotton fabric with floral designs.', 'In Stock', ARRAY['Cotton','Printed']),
  ('Chiffon Dupatta', 'DUP-013', '890123456015', 'Dupatta', 'Meter', 25, 7, 175, 950, 1150, 1350, 60, 'F-02', '', 'Chiffon dupatta fabric, lightweight and sheer.', 'In Stock', ARRAY['Dupatta','Chiffon'])
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, barcode = EXCLUDED.barcode, fabric_type = EXCLUDED.fabric_type,
  unit = EXCLUDED.unit, meters_per_thaan = EXCLUDED.meters_per_thaan, thaan_count = EXCLUDED.thaan_count,
  total_meters = EXCLUDED.total_meters, cost_per_meter = EXCLUDED.cost_per_meter,
  wholesale_price = EXCLUDED.wholesale_price, retail_price = EXCLUDED.retail_price,
  minimum_stock = EXCLUDED.minimum_stock, location = EXCLUDED.location,
  description = EXCLUDED.description, availability = EXCLUDED.availability, details = EXCLUDED.details;

INSERT INTO thaans (product_id, thaan_number, original_meters, sold_meters, remaining_meters, status)
SELECT p.id, v.thaan_number, v.original_meters, v.sold_meters, v.remaining_meters, v.status
FROM products p CROSS JOIN (VALUES
  ('TH-001', 25.0, 0.0, 25.0, 'FULL'), ('TH-002', 25.0, 0.0, 25.0, 'FULL'),
  ('TH-003', 25.0, 3.5, 21.5, 'PARTIAL'), ('TH-004', 25.0, 0.0, 25.0, 'FULL'),
  ('TH-005', 25.0, 7.0, 18.0, 'PARTIAL'), ('TH-006', 25.0, 25.0, 0.0, 'SOLD OUT')
) AS v(thaan_number, original_meters, sold_meters, remaining_meters, status)
WHERE p.sku = 'LWN-001'
ON CONFLICT (product_id, thaan_number) DO NOTHING;

INSERT INTO thaans (product_id, thaan_number, original_meters, sold_meters, remaining_meters, status)
SELECT p.id, v.thaan_number, v.original_meters, v.sold_meters, v.remaining_meters, v.status
FROM products p CROSS JOIN (VALUES
  ('TH-001', 25.0, 0.0, 25.0, 'FULL'), ('TH-002', 25.0, 5.0, 20.0, 'PARTIAL'),
  ('TH-003', 25.0, 0.0, 25.0, 'FULL')
) AS v(thaan_number, original_meters, sold_meters, remaining_meters, status)
WHERE p.sku = 'COT-014'
ON CONFLICT (product_id, thaan_number) DO NOTHING;

INSERT INTO thaans (product_id, thaan_number, original_meters, sold_meters, remaining_meters, status)
SELECT p.id, v.thaan_number, v.original_meters, v.sold_meters, v.remaining_meters, v.status
FROM products p CROSS JOIN (VALUES
  ('TH-001', 25.0, 12.0, 13.0, 'PARTIAL'), ('TH-002', 25.0, 25.0, 0.0, 'SOLD OUT'),
  ('TH-003', 25.0, 0.0, 25.0, 'FULL')
) AS v(thaan_number, original_meters, sold_meters, remaining_meters, status)
WHERE p.sku = 'CAM-021'
ON CONFLICT (product_id, thaan_number) DO NOTHING;

INSERT INTO thaans (product_id, thaan_number, original_meters, sold_meters, remaining_meters, status)
SELECT p.id, v.thaan_number, v.original_meters, v.sold_meters, v.remaining_meters, v.status
FROM products p CROSS JOIN (VALUES
  ('TH-001', 25.0, 0.0, 25.0, 'FULL'), ('TH-002', 25.0, 2.0, 23.0, 'PARTIAL'),
  ('TH-003', 25.0, 0.0, 25.0, 'FULL')
) AS v(thaan_number, original_meters, sold_meters, remaining_meters, status)
WHERE p.sku = 'KHD-008'
ON CONFLICT (product_id, thaan_number) DO NOTHING;

INSERT INTO thaans (product_id, thaan_number, original_meters, sold_meters, remaining_meters, status)
SELECT p.id, v.thaan_number, v.original_meters, v.sold_meters, v.remaining_meters, v.status
FROM products p CROSS JOIN (VALUES
  ('TH-001', 25.0, 0.0, 25.0, 'FULL'), ('TH-002', 25.0, 8.5, 16.5, 'PARTIAL')
) AS v(thaan_number, original_meters, sold_meters, remaining_meters, status)
WHERE p.sku = 'SLK-003'
ON CONFLICT (product_id, thaan_number) DO NOTHING;

INSERT INTO inventory_movements (product_id, movement_type, quantity, meters, reference)
SELECT id, 'Opening Stock', 0, total_meters, 'Initial stock'
FROM products
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_movements m WHERE m.product_id = products.id AND m.movement_type = 'Opening Stock'
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM inventory_movements m
    JOIN products p ON p.id = m.product_id
    WHERE p.sku = 'LWN-001' AND m.movement_type != 'Opening Stock'
  ) THEN
    INSERT INTO inventory_movements (product_id, movement_type, quantity, meters, reference)
    SELECT p.id, v.movement_type, v.quantity, v.meters, v.reference
    FROM products p CROSS JOIN (VALUES
      ('Sale', 1, -3.5, 'INV-1042'),
      ('Purchase', 1, 25.0, 'PO-018'),
      ('Adjustment', 0, -25.0, 'Rack B to Rack C')
    ) AS v(movement_type, quantity, meters, reference)
    WHERE p.sku = 'LWN-001';
  END IF;
END $$;