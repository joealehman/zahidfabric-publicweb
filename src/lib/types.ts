export type Role = 'OWNER' | 'MANAGER' | 'CASHIER';

export type Staff = {
  id: string;
  name: string;
  role: Role;
  username: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  last_active: string;
  current_shift: 'OPEN' | 'CLOSED';
};

export type Shift = {
  id: string;
  staff_id: string;
  staff_name: string;
  role: Role;
  opening_cash: number;
  cash_sales: number;
  card_sales: number;
  online_sales: number;
  refunds: number;
  expenses: number;
  transactions: number;
  actual_cash: number | null;
  difference: number | null;
  status: 'OPEN' | 'CLOSED';
  started_at: string;
  ended_at: string | null;
};

export type AuditLog = {
  id: string;
  user_name: string;
  action: string;
  area: string;
  reference: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  catalog_id: string | null;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  fabric_type: string;
  image_path: string;
  retail_price: number;
  wholesale_price: number | null;
  minimum_stock: number;
  current_stock: number;
  description: string;
  details: string[];
  availability: string;
  gst_pkr: number | null;
  brand: string;
  collection: string;
  pattern: string;
  product_type: string;
  shirt_fabric: string;
  shirt_quantity: string;
  dupatta_fabric: string;
  dupatta_quantity: string;
  trouser_fabric: string;
  trouser_quantity: string;
  add_on: string;
  document_path: string | null;
};

export type Sale = {
  id: string;
  invoice_number: string;
  cashier: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  total: number;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  meters: number | null;
  unit_price: number;
  line_total: number;
};

export type CartLine = { product: Product; quantity: number };

export type Order = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  subtotal: number;
  total: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type Enquiry = {
  id: string;
  business_name: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  quantity_sets: string | null;
  products_interested: string | null;
  status: string;
  created_at: string;
};

export type Screen =
  | 'home' | 'collections' | 'product' | 'wholesale' | 'about' | 'contact'
  | 'cart' | 'checkout' | 'order-confirmation'
  | 'login'
  | 'dashboard' | 'pos' | 'products' | 'inventory' | 'sales'
  | 'cash' | 'reports' | 'staff' | 'audit' | 'settings'
  | 'shift' | 'mysales' | 'search'
  | 'orders' | 'business-info' | 'enquiries';

export const DEMO_CREDENTIALS: { username: string; password: string; role: Role; name: string }[] = [
  { username: 'owner', password: 'owner', role: 'OWNER', name: 'Store Owner' },
  { username: 'sara', password: 'sara', role: 'MANAGER', name: 'Sara Ahmed' },
  { username: 'ali', password: 'ali', role: 'CASHIER', name: 'Ali Khan' },
];

export const PIECE_DETAILS: [string, string, string][] = [
  ['Shirt', 'Premium Printed Lawn Shirt (Wider Width)', '1.75 m'],
  ['Dupatta', 'Premium Printed Lawn Dupatta', '2.5 m'],
  ['Trouser', 'Premium Dyed Cambric Trouser', '1.75 m'],
];

export const CARE_INSTRUCTIONS = [
  'Dry clean recommended.',
  'Do not use any type of bleach or stain removing chemicals.',
  'Before stitching, fabric should be soaked in water.',
  'Wash and soak colored and white fabrics separately.',
];

export const money = (value: number) => `PKR ${Math.round(value).toLocaleString('en-PK')}`;

export const getScreen = (): Screen => {
  const path = window.location.pathname;
  if (path.startsWith('/admin/pos')) return 'pos';
  if (path.startsWith('/admin/products')) return 'products';
  if (path.startsWith('/admin/inventory')) return 'inventory';
  if (path.startsWith('/admin/sales')) return 'sales';
  if (path.startsWith('/admin/cash')) return 'cash';
  if (path.startsWith('/admin/reports')) return 'reports';
  if (path.startsWith('/admin/staff')) return 'staff';
  if (path.startsWith('/admin/audit')) return 'audit';
  if (path.startsWith('/admin/settings')) return 'settings';
  if (path.startsWith('/admin/shift')) return 'shift';
  if (path.startsWith('/admin/mysales')) return 'mysales';
  if (path.startsWith('/admin/search')) return 'search';
  if (path.startsWith('/admin/orders')) return 'orders';
  if (path.startsWith('/admin/enquiries')) return 'enquiries';
  if (path.startsWith('/admin/business-info')) return 'business-info';
  if (path.startsWith('/admin/login')) return 'login';
  if (path.startsWith('/admin')) return 'dashboard';
  if (path.startsWith('/collections')) return 'collections';
  if (path.startsWith('/product')) return 'product';
  if (path.startsWith('/wholesale')) return 'wholesale';
  if (path.startsWith('/cart')) return 'cart';
  if (path.startsWith('/checkout')) return 'checkout';
  if (path.startsWith('/order-confirmation')) return 'order-confirmation';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/contact')) return 'contact';
  return 'home';
};

export const ROLE_LABELS: Record<Role, string> = { OWNER: 'OWNER', MANAGER: 'MANAGER', CASHIER: 'CASHIER' };

export const OWNER_NAV = [
  { screen: 'dashboard' as Screen, label: 'Dashboard' },
  { screen: 'pos' as Screen, label: 'POS' },
  { screen: 'products' as Screen, label: 'Products' },
  { screen: 'inventory' as Screen, label: 'Inventory' },
  { screen: 'sales' as Screen, label: 'Sales' },
  { screen: 'orders' as Screen, label: 'Orders' },
  { screen: 'enquiries' as Screen, label: 'Enquiries' },
  { screen: 'cash' as Screen, label: 'Cash Management' },
  { screen: 'reports' as Screen, label: 'Reports' },
  { screen: 'staff' as Screen, label: 'Staff' },
  { screen: 'audit' as Screen, label: 'Audit Log' },
  { screen: 'business-info' as Screen, label: 'Business Info' },
  { screen: 'settings' as Screen, label: 'Settings' },
];

export const MANAGER_NAV = [
  { screen: 'dashboard' as Screen, label: 'Dashboard' },
  { screen: 'pos' as Screen, label: 'POS' },
  { screen: 'products' as Screen, label: 'Products' },
  { screen: 'inventory' as Screen, label: 'Inventory' },
  { screen: 'sales' as Screen, label: 'Sales' },
  { screen: 'orders' as Screen, label: 'Orders' },
  { screen: 'enquiries' as Screen, label: 'Enquiries' },
  { screen: 'cash' as Screen, label: 'Cash Management' },
  { screen: 'reports' as Screen, label: 'Reports' },
];

export const CASHIER_NAV = [
  { screen: 'pos' as Screen, label: 'POS' },
  { screen: 'shift' as Screen, label: 'Current Shift' },
  { screen: 'mysales' as Screen, label: 'My Sales' },
  { screen: 'search' as Screen, label: 'Product Search' },
];

export const CASHIER_RESTRICTED: Screen[] = ['dashboard', 'reports', 'staff', 'audit', 'settings', 'cash'];
export const MANAGER_RESTRICTED: Screen[] = ['staff', 'audit', 'settings'];
