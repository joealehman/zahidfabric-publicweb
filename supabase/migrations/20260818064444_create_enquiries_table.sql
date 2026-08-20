/*
# Create enquiries table for wholesale lead capture

1. New Tables
- `enquiries`
  - `id` (uuid, primary key)
  - `business_name` (text)
  - `contact_person` (text)
  - `phone` (text)
  - `email` (text)
  - `city` (text)
  - `quantity_sets` (text)
  - `products_interested` (text)
  - `status` (text, default 'new')
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `enquiries`.
- Single-tenant store with password-gated admin. Allow anon + authenticated CRUD.
*/

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text,
  contact_person text,
  phone text,
  email text,
  city text,
  quantity_sets text,
  products_interested text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_enquiries" ON enquiries;
CREATE POLICY "anon_select_enquiries" ON enquiries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_enquiries" ON enquiries;
CREATE POLICY "anon_insert_enquiries" ON enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_enquiries" ON enquiries;
CREATE POLICY "anon_update_enquiries" ON enquiries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_enquiries" ON enquiries;
CREATE POLICY "anon_delete_enquiries" ON enquiries FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
