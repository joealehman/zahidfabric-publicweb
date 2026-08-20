/*
# Add staff, shifts, and audit log tables for role-based admin

1. New Tables
- `staff` stores staff members with role (OWNER/MANAGER/CASHIER), name, username, status, last active, and current shift status. Used for login and role-based access.
- `shifts` records cashier/manager shift sessions: opening cash, cash/card/online sales, transactions, start/end times, actual cash, difference, and status.
- `audit_logs` records staff actions: time, user, action, area, reference. Owner-only visibility.

2. Seed Data
- Seeds 3 staff accounts: Store Owner (OWNER), Sara Ahmed (MANAGER), Ali Khan (CASHIER).
- Seeds 1 open shift for Ali Khan with opening cash PKR 25,000.
- Seeds sample audit log entries for sale, stock adjustment, staff creation, and login.

3. Security
- Enables RLS on all three new tables with shared anon/authenticated CRUD access (single-tenant prototype).
- Existing products/sales/sale_items/inventory_movements/thaans policies remain unchanged.

4. Important Notes
- Staff passwords are NOT stored in the database for this prototype — login is simulated client-side using the demo credentials shown on the login screen.
- Staff records carry role and display name only.
- Shifts link to staff by id for current-shift lookup.
- Audit logs are append-only from the UI flow.
*/

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'CASHIER')),
  username text NOT NULL UNIQUE,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  last_active text NOT NULL DEFAULT '',
  current_shift text NOT NULL DEFAULT 'CLOSED' CHECK (current_shift IN ('OPEN', 'CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  staff_name text NOT NULL,
  role text NOT NULL DEFAULT 'CASHIER',
  opening_cash numeric NOT NULL DEFAULT 0,
  cash_sales numeric NOT NULL DEFAULT 0,
  card_sales numeric NOT NULL DEFAULT 0,
  online_sales numeric NOT NULL DEFAULT 0,
  refunds numeric NOT NULL DEFAULT 0,
  expenses numeric NOT NULL DEFAULT 0,
  transactions integer NOT NULL DEFAULT 0,
  actual_cash numeric,
  difference numeric,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  action text NOT NULL,
  area text NOT NULL,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_staff_select" ON staff;
DROP POLICY IF EXISTS "shared_staff_insert" ON staff;
DROP POLICY IF EXISTS "shared_staff_update" ON staff;
DROP POLICY IF EXISTS "shared_staff_delete" ON staff;
CREATE POLICY "shared_staff_select" ON staff FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_staff_insert" ON staff FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_staff_update" ON staff FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_staff_delete" ON staff FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_shifts_select" ON shifts;
DROP POLICY IF EXISTS "shared_shifts_insert" ON shifts;
DROP POLICY IF EXISTS "shared_shifts_update" ON shifts;
DROP POLICY IF EXISTS "shared_shifts_delete" ON shifts;
CREATE POLICY "shared_shifts_select" ON shifts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_shifts_insert" ON shifts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_shifts_update" ON shifts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_shifts_delete" ON shifts FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_audit_select" ON audit_logs;
DROP POLICY IF EXISTS "shared_audit_insert" ON audit_logs;
DROP POLICY IF EXISTS "shared_audit_update" ON audit_logs;
DROP POLICY IF EXISTS "shared_audit_delete" ON audit_logs;
CREATE POLICY "shared_audit_select" ON audit_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "shared_audit_insert" ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shared_audit_update" ON audit_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared_audit_delete" ON audit_logs FOR DELETE TO anon, authenticated USING (true);

INSERT INTO staff (name, role, username, phone, email, status, last_active, current_shift)
VALUES
  ('Store Owner', 'OWNER', 'owner', '0300-7887292', 'sale@saya.pk', 'Active', '09:30 AM', 'CLOSED'),
  ('Sara Ahmed', 'MANAGER', 'sara', '0301-1234567', 'sara@saya.pk', 'Active', '08:51 AM', 'OPEN'),
  ('Ali Khan', 'CASHIER', 'ali', '0302-9876543', 'ali@saya.pk', 'Active', '09:58 AM', 'OPEN')
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name, role = EXCLUDED.role, phone = EXCLUDED.phone, email = EXCLUDED.email,
  status = EXCLUDED.status, last_active = EXCLUDED.last_active, current_shift = EXCLUDED.current_shift;

INSERT INTO shifts (staff_id, staff_name, role, opening_cash, cash_sales, card_sales, online_sales, refunds, expenses, transactions, status, started_at)
SELECT id, 'Ali Khan', 'CASHIER', 25000, 42500, 18000, 14000, 0, 0, 18, 'OPEN', '2026-08-17T09:58:00+05:00'
FROM staff WHERE username = 'ali' AND NOT EXISTS (SELECT 1 FROM shifts s WHERE s.staff_id = staff.id AND s.status = 'OPEN');

INSERT INTO shifts (staff_id, staff_name, role, opening_cash, cash_sales, card_sales, online_sales, refunds, expenses, transactions, status, started_at)
SELECT id, 'Sara Ahmed', 'MANAGER', 50000, 82000, 35000, 28000, 1500, 3000, 46, 'OPEN', '2026-08-17T08:51:00+05:00'
FROM staff WHERE username = 'sara' AND NOT EXISTS (SELECT 1 FROM shifts s WHERE s.staff_id = staff.id AND s.status = 'OPEN');

INSERT INTO audit_logs (user_name, action, area, reference)
VALUES
  ('Store Owner', 'Staff login', 'Auth', 'OWNER'),
  ('Sara Ahmed', 'Staff login', 'Auth', 'MANAGER'),
  ('Ali Khan', 'Staff login', 'Auth', 'CASHIER'),
  ('Ali Khan', 'Sale completed', 'POS', 'INV-1042'),
  ('Sara Ahmed', 'Stock adjusted', 'Inventory', 'WUNS-6990-R'),
  ('Store Owner', 'Staff account created', 'Staff', 'STAFF-008'),
  ('Sara Ahmed', 'Shift started', 'Cash Management', 'PKR 50,000'),
  ('Ali Khan', 'Shift started', 'Cash Management', 'PKR 25,000')
ON CONFLICT DO NOTHING;