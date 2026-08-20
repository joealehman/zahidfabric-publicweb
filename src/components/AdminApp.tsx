import { useEffect, useState } from 'react';
import {
  AlertCircle, ArrowLeft, BarChart3, Barcode, Check, ChevronDown, CircleDollarSign, Clock3, CreditCard,
  FileText, LayoutDashboard, LogOut, MapPin, Package, Plus, Receipt, Search, Settings, Shield,
  ShoppingCart, ShoppingBag, Store, Tag, Trash2, User, Users, Wallet, X, Activity, TrendingUp, AlertTriangle, Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  type Role, type Staff, type Shift, type AuditLog, type Product, type Sale, type SaleItem,
  type Order, type OrderItem, type Enquiry, type CartLine, type Screen, money, PIECE_DETAILS, CARE_INSTRUCTIONS,
  OWNER_NAV, MANAGER_NAV, CASHIER_NAV, CASHIER_RESTRICTED, MANAGER_RESTRICTED, ROLE_LABELS,
} from '@/lib/types';
import { loadBusinessConfig, saveBusinessConfig, type BusinessConfig } from '@/config/business';

type AdminState = {
  role: Role; userName: string; screen: Screen; navigate: (p: string) => void;
  products: Product[]; sales: Sale[]; saleItems: SaleItem[]; staff: Staff[]; shifts: Shift[]; auditLogs: AuditLog[];
  loading: boolean; onLogout: () => void; onLogAction: (action: string, area: string, reference?: string) => void;
  orders: Order[]; orderItems: OrderItem[]; reloadOrders: () => void;
  enquiries: Enquiry[]; reloadEnquiries: () => void;
  businessConfig: BusinessConfig; setBusinessConfig: (c: BusinessConfig) => void;
};

export function AdminApp(props: AdminState) {
  const { role, userName, screen, navigate, loading, onLogout, onLogAction } = props;
  const [query, setQuery] = useState('');
  const [showAccount, setShowAccount] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const nav = role === 'OWNER' ? OWNER_NAV : role === 'MANAGER' ? MANAGER_NAV : CASHIER_NAV;
  const restricted = role === 'CASHIER' ? CASHIER_RESTRICTED : role === 'MANAGER' ? MANAGER_RESTRICTED : [];
  const isRestricted = restricted.includes(screen);
  const filtered = props.products.filter((p) => `${p.name} ${p.sku} ${p.barcode}`.toLowerCase().includes(query.toLowerCase()));

  const sectionTitle: Record<string, string> = {
    dashboard: 'Dashboard', pos: 'Point of Sale', products: 'Products', inventory: 'Inventory',
    sales: 'Sales History', cash: 'Cash Management', reports: 'Reports', staff: 'Staff Management',
    audit: 'Audit Log', settings: 'Settings', shift: 'Current Shift', mysales: 'My Sales', search: 'Product Search',
    orders: 'Customer Orders', enquiries: 'Wholesale Enquiries', 'business-info': 'Business Information',
  };

  const handleNav = (target: Screen) => {
    const pathMap: Record<Screen, string> = {
      dashboard: '/admin', pos: '/admin/pos', products: '/admin/products', inventory: '/admin/inventory',
      sales: '/admin/sales', cash: '/admin/cash', reports: '/admin/reports', staff: '/admin/staff',
      audit: '/admin/audit', settings: '/admin/settings', shift: '/admin/shift', mysales: '/admin/mysales',
      search: '/admin/search', orders: '/admin/orders', enquiries: '/admin/enquiries', 'business-info': '/admin/business-info',
      home: '/', collections: '/collections', product: '/product', wholesale: '/wholesale',
      about: '/about', contact: '/contact', login: '/admin/login',
    };
    navigate(pathMap[target]);
  };

  return (
    <div className="admin-shell flex min-h-screen">
      {/* Sidebar */}
      <aside className="admin-sidebar flex w-60 shrink-0 flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <button onClick={() => handleNav('dashboard')} className="flex items-center gap-3 text-left">
            <span className="flex h-9 w-9 items-center justify-center bg-[#d8e2d9] text-[#1a2238]"><Store size={17} /></span>
            <span className="sidebar-copy">
              <strong className="block text-sm text-white">{props.businessConfig.businessName}</strong>
              <span className="text-xs text-[#9cad9f]">Staff Portal</span>
            </span>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4">
          <p className="sidebar-copy mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#73847a]">
            {role === 'CASHIER' ? 'Cash Register' : role === 'MANAGER' ? 'Operations' : 'Full Access'}
          </p>
          {nav.map((item) => (
            <button
              key={item.screen}
              onClick={() => handleNav(item.screen)}
              className={`admin-nav mb-0.5 flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm ${screen === item.screen ? 'active' : ''}`}
            >
              <NavIcon screen={item.screen} />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-copy border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-1.5 text-xs text-[#73847a]">
            <MapPin size={12} /> {props.businessConfig.address}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-[#2a3550] text-xs font-semibold text-white">
              {userName.charAt(0)}
            </span>
            <div>
              <p className="text-xs font-semibold text-white">{userName}</p>
              <p className="text-[10px] text-[#9cad9f]">{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className="mt-3 flex items-center gap-1.5 text-xs text-[#9cad9f] hover:text-white">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#e0e5df] bg-white px-6 py-3 md:px-8">
          <div>
            <h1 className="text-lg font-semibold text-[#1a2238]">{sectionTitle[screen] ?? 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden items-center gap-1.5 text-xs text-[#8a948e] md:flex">
              <MapPin size={13} /> {props.businessConfig.address}
            </div>
            <span className="hidden text-xs text-[#8a948e] md:inline">17 Aug 2026</span>
            <span className={`border px-2 py-0.5 text-[10px] font-bold ${role === 'OWNER' ? 'border-[#1a2238] bg-[#1a2238] text-white' : role === 'MANAGER' ? 'border-[#557064] bg-[#557064] text-white' : 'border-[#8b6717] bg-[#8b6717] text-white'}`}>
              {ROLE_LABELS[role]}
            </span>
            <div className="relative">
              <button onClick={() => setShowAccount(!showAccount)} className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center bg-[#1a2238] text-xs font-semibold text-white">{userName.charAt(0)}</span>
                <ChevronDown size={14} className="text-[#8a948e]" />
              </button>
              {showAccount && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAccount(false)} />
                  <div className="absolute right-0 top-10 z-20 w-56 border border-[#e0e5df] bg-white py-2 shadow-lg">
                    <div className="border-b border-[#eef1ed] px-4 py-2.5">
                      <p className="text-sm font-semibold">{userName}</p>
                      <p className="text-xs text-[#8a948e]">{ROLE_LABELS[role]}</p>
                    </div>
                    <div className="px-4 py-2.5 text-xs text-[#68726e]">
                      <p>Last login: 09:30 AM</p>
                      <p className="mt-1">Session: Active</p>
                    </div>
                    <button onClick={() => { setShowAccount(false); setShowLogoutConfirm(true); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#9c473d] hover:bg-[#fdf6f5]">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8">
          {loading ? (
            <div className="py-20 text-center text-sm text-[#8a948e]">Loading workspace…</div>
          ) : isRestricted ? (
            <AccessRestricted role={role} />
          ) : (
            <>
              {screen === 'dashboard' && (role === 'CASHIER' ? <CashierDashboard {...props} /> : <OwnerDashboard {...props} />)}
              {screen === 'pos' && <PosPage {...props} query={query} setQuery={setQuery} filtered={filtered} />}
              {screen === 'products' && <ProductsPage products={props.products} query={query} setQuery={setQuery} filtered={filtered} />}
              {screen === 'inventory' && <InventoryPage products={props.products} query={query} setQuery={setQuery} filtered={filtered} onLogAction={onLogAction} />}
              {screen === 'sales' && <SalesPage sales={props.sales} saleItems={props.saleItems} />}
              {screen === 'cash' && <CashManagement shifts={props.shifts} role={role} userName={userName} onLogAction={onLogAction} />}
              {screen === 'reports' && <ReportsPage sales={props.sales} saleItems={props.saleItems} products={props.products} />}
              {screen === 'staff' && <StaffPage staff={props.staff} onLogAction={onLogAction} />}
              {screen === 'audit' && <AuditLogPage logs={props.auditLogs} />}
              {screen === 'settings' && <SettingsPage role={role} />}
              {screen === 'shift' && <CashierShift shifts={props.shifts} userName={userName} onLogAction={onLogAction} />}
              {screen === 'mysales' && <MySalesPage sales={props.sales} saleItems={props.saleItems} userName={userName} />}
              {screen === 'search' && <ProductSearchPage products={props.products} query={query} setQuery={setQuery} filtered={filtered} />}
              {screen === 'orders' && <OrdersPage orders={props.orders} orderItems={props.orderItems} reloadOrders={props.reloadOrders} onLogAction={onLogAction} />}
              {screen === 'enquiries' && <EnquiriesPage enquiries={props.enquiries} reloadEnquiries={props.reloadEnquiries} onLogAction={onLogAction} />}
              {screen === 'business-info' && <BusinessInfoPage businessConfig={props.businessConfig} setBusinessConfig={props.setBusinessConfig} onLogAction={onLogAction} />}
            </>
          )}
        </div>
      </main>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Sign out of Staff Portal?"
          message="You will need to sign in again to access the system."
          confirmLabel="Sign Out"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => { setShowLogoutConfirm(false); onLogout(); }}
        />
      )}
    </div>
  );
}

function NavIcon({ screen }: { screen: Screen }) {
  const icons: Partial<Record<Screen, React.ReactNode>> = {
    dashboard: <LayoutDashboard size={16} />, pos: <ShoppingCart size={16} />, products: <Tag size={16} />,
    inventory: <Package size={16} />, sales: <BarChart3 size={16} />, cash: <Wallet size={16} />,
    reports: <TrendingUp size={16} />, staff: <Users size={16} />, audit: <Activity size={16} />,
    settings: <Settings size={16} />, shift: <Clock3 size={16} />, mysales: <Receipt size={16} />,
    search: <Search size={16} />, orders: <ShoppingBag size={16} />, enquiries: <FileText size={16} />, 'business-info': <Store size={16} />,
  };
  return <>{icons[screen] ?? <LayoutDashboard size={16} />}</>;
}

// ============ OWNER DASHBOARD ============
function OwnerDashboard(props: AdminState) {
  const { sales, saleItems, products, navigate } = props;
  const [period, setPeriod] = useState('today');
  const totalSales = sales.reduce((s, sale) => s + Number(sale.total), 0);
  const itemsSold = saleItems.reduce((s, item) => s + item.quantity, 0);
  const stockValue = products.reduce((s, p) => s + p.retail_price * p.current_stock, 0);
  const lowStock = products.filter((p) => p.current_stock <= p.minimum_stock).length;
  const cashSales = sales.filter((s) => s.payment_method === 'CASH').reduce((s, sale) => s + Number(sale.total), 0);
  const cardSales = sales.filter((s) => s.payment_method === 'CARD').reduce((s, sale) => s + Number(sale.total), 0);
  const onlineSales = sales.filter((s) => s.payment_method === 'ONLINE').reduce((s, sale) => s + Number(sale.total), 0);
  const demoMultiplier = period === 'today' ? 1 : period === 'week' ? 6.2 : 24.5;

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-[#8a948e]">Good evening, {props.userName}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1a2238]">Business overview</h2>
          <p className="mt-1 text-xs text-[#8a948e]">Demo data — not real business figures</p>
        </div>
        <div className="flex gap-1">
          {['today', 'week', 'month'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`border px-3 py-1.5 text-xs font-semibold capitalize ${period === p ? 'border-[#1a2238] bg-[#1a2238] text-white' : 'border-[#d4dbd5] text-[#68726e]'}`}>
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <Metric label="Today's Sales" value={money(totalSales * demoMultiplier)} note="Gross" />
        <Metric label="Transactions" value={String(Math.round(sales.length * demoMultiplier))} note="Completed" />
        <Metric label="Items Sold" value={String(Math.round(itemsSold * demoMultiplier))} note="3-piece sets" />
        <Metric label="Stock Value" value={money(stockValue)} note="Retail value" />
        <Metric label="Low Stock" value={String(lowStock)} note="Needs attention" warning={lowStock > 0} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="admin-panel">
          <div className="flex items-center justify-between border-b border-[#e5e9e4] px-5 py-3">
            <h3 className="text-sm font-semibold">Recent Transactions</h3>
            <button onClick={() => navigate('/admin/sales')} className="text-xs text-[#557064]">View all →</button>
          </div>
          {sales.length ? sales.slice(0, 6).map((sale) => (
            <div key={sale.id} className="flex items-center justify-between border-b border-[#eef1ed] px-5 py-3 text-sm last:border-0">
              <div>
                <p className="font-semibold">{sale.invoice_number}</p>
                <p className="mt-0.5 text-xs text-[#829087]">{new Date(sale.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{money(Number(sale.total))}</p>
                <p className="mt-0.5 text-xs text-[#829087]">{sale.payment_method}</p>
              </div>
            </div>
          )) : <EmptyState copy="No transactions yet." />}
        </div>
        <div className="space-y-4">
          <div className="admin-panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Cash Position</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a948e]">Owner only</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#68726e]">Cash sales</span><span className="font-semibold">{money(cashSales * demoMultiplier)}</span></div>
              <div className="flex justify-between"><span className="text-[#68726e]">Card sales</span><span className="font-semibold">{money(cardSales * demoMultiplier)}</span></div>
              <div className="flex justify-between"><span className="text-[#68726e]">Online sales</span><span className="font-semibold">{money(onlineSales * demoMultiplier)}</span></div>
              <div className="flex justify-between border-t border-[#eef1ed] pt-2"><span className="font-semibold">Total</span><span className="font-semibold">{money(totalSales * demoMultiplier)}</span></div>
            </div>
          </div>
          <div className="admin-panel p-5">
            <h3 className="mb-3 text-sm font-semibold">Low Stock</h3>
            <div className="space-y-2">
              {products.filter((p) => p.current_stock <= p.minimum_stock).slice(0, 4).map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="ml-2 font-semibold text-[#8b6717]">{p.current_stock} sets</span>
                </div>
              ))}
              {lowStock === 0 && <p className="text-xs text-[#829087]">All products well stocked.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 admin-panel p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Financial Overview</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a948e]">Owner only</span>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FinCard label="Revenue" value={money(totalSales * demoMultiplier)} />
          <FinCard label="Gross Sales" value={money(totalSales * demoMultiplier)} />
          <FinCard label="Discounts" value="PKR 0" />
          <FinCard label="Refunds" value="PKR 0" />
          <FinCard label="Cash" value={money(cashSales * demoMultiplier)} />
          <FinCard label="Card" value={money(cardSales * demoMultiplier)} />
          <FinCard label="Online" value={money(onlineSales * demoMultiplier)} />
          <FinCard label="Est. Margin" value={money(totalSales * demoMultiplier * 0.28)} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, note, warning }: { label: string; value: string; note: string; warning?: boolean }) {
  return (
    <div className="admin-panel p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a948e]">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${warning ? 'text-[#8b6717]' : 'text-[#1a2238]'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-[#829087]">{note}</p>
    </div>
  );
}

function FinCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#eef1ed] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a948e]">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-[#1a2238]">{value}</p>
    </div>
  );
}

// ============ CASHIER DASHBOARD ============
function CashierDashboard(props: AdminState) {
  const { shifts, userName } = props;
  const myShift = shifts.find((s) => s.staff_name === userName && s.status === 'OPEN');
  if (!myShift) return <NoShiftOpen onStartShift={() => {}} />;
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[#8a948e]">Welcome, {userName}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1a2238]">Current Shift</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Shift Started" value={new Date(myShift.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} note={new Date(myShift.started_at).toLocaleDateString()} />
        <Metric label="Opening Cash" value={money(Number(myShift.opening_cash))} note="Drawer start" />
        <Metric label="Transactions" value={String(myShift.transactions)} note="This shift" />
        <Metric label="My Sales" value={money(Number(myShift.cash_sales) + Number(myShift.card_sales) + Number(myShift.online_sales))} note="Shift total" />
      </div>
      <div className="mt-4 admin-panel p-5">
        <h3 className="mb-4 text-sm font-semibold">Shift Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#68726e]">Cash sales</span><span className="font-semibold">{money(Number(myShift.cash_sales))}</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Card sales</span><span className="font-semibold">{money(Number(myShift.card_sales))}</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Online sales</span><span className="font-semibold">{money(Number(myShift.online_sales))}</span></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#68726e]">Refunds</span><span className="font-semibold">{money(Number(myShift.refunds))}</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Expenses</span><span className="font-semibold">{money(Number(myShift.expenses))}</span></div>
          </div>
          <div className="border-l border-[#eef1ed] pl-4">
            <p className="text-xs text-[#8a948e]">Expected drawer</p>
            <p className="mt-1 text-lg font-semibold text-[#1a2238]">{money(Number(myShift.opening_cash) + Number(myShift.cash_sales))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoShiftOpen({ onStartShift }: { onStartShift: () => void }) {
  const [opening, setOpening] = useState('25000');
  const [confirm, setConfirm] = useState(false);
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Current Shift</h2>
      <p className="mt-2 text-sm text-[#68726e]">No shift is currently open for your account.</p>
      <div className="mt-6 admin-panel max-w-md p-6">
        <h3 className="text-sm font-semibold">Start Shift</h3>
        <p className="mt-1 text-xs text-[#8a948e]">Enter the opening cash amount in the drawer.</p>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Opening Cash</label>
        <input value={opening} onChange={(e) => setOpening(e.target.value)} className="admin-input mt-2 w-full" placeholder="PKR 0" />
        <button onClick={() => setConfirm(true)} className="mt-4 w-full bg-[#1a2238] py-2.5 text-sm font-semibold text-white">Start Shift</button>
      </div>
      {confirm && (
        <ConfirmModal title="Start shift?" message={`Opening cash: ${money(Number(opening))}`} confirmLabel="Start Shift" onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); onStartShift(); }} />
      )}
    </div>
  );
}

// ============ POS ============
function PosPage(props: AdminState & { query: string; setQuery: (v: string) => void; filtered: Product[] }) {
  const { products, role, userName, navigate, onLogAction } = props;
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState('CASH');
  const [barcode, setBarcode] = useState('');
  const [scannerConnected] = useState(true);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [receiptItems, setReceiptItems] = useState<CartLine[]>([]);
  const [toast, setToast] = useState('');

  const addToCart = (product: Product) => setCart((c) => { const found = c.find((l) => l.product.id === product.id); if (found) return c.map((l) => l.product.id === product.id ? { ...l, quantity: Math.min(l.quantity + 1, product.current_stock) } : l); return [...c, { product, quantity: 1 }]; });
  const updateQty = (id: string, qty: number) => setCart((c) => c.map((l) => l.product.id === id ? { ...l, quantity: Math.max(1, Math.min(qty, l.product.current_stock)) } : l));
  const removeFromCart = (id: string) => setCart((c) => c.filter((l) => l.product.id !== id));
  const cartTotal = cart.reduce((s, l) => s + l.product.retail_price * l.quantity, 0);

  const scan = () => {
    const found = products.find((p) => p.barcode === barcode.trim());
    if (found) { addToCart(found); setBarcode(''); setToast(`${found.name} added`); window.setTimeout(() => setToast(''), 1500); }
    else { setToast('Barcode not found'); window.setTimeout(() => setToast(''), 2000); }
  };

  const completeSale = async () => {
    if (!cart.length) return;
    const invoice = `INV-${new Date().getFullYear()}-${String(1042 + props.sales.length + 1).padStart(4, '0')}`;
    const { data: created } = await supabase.from('sales').insert({ invoice_number: invoice, cashier: userName, payment_method: payment, subtotal: cartTotal, discount: 0, total: cartTotal }).select().maybeSingle();
    if (created) {
      await supabase.from('sale_items').insert(cart.map((l) => ({ sale_id: created.id, product_id: l.product.id, product_name: l.product.name, sku: l.product.sku, quantity: l.quantity, meters: null, unit_price: l.product.retail_price, line_total: l.product.retail_price * l.quantity })));
      await Promise.all(cart.map((l) => { const stock = l.product.current_stock - l.quantity; return supabase.from('products').update({ current_stock: stock, availability: stock <= 0 ? 'Out of Stock' : stock <= l.product.minimum_stock ? 'Low Stock' : 'In Stock' }).eq('id', l.product.id); }));
      await Promise.all(cart.map((l) => supabase.from('inventory_movements').insert({ product_id: l.product.id, movement_type: 'Sale', quantity: -l.quantity, meters: null, reference: invoice })));
      onLogAction('Sale completed', 'POS', invoice);
    }
    setReceipt(created ?? { id: 'demo', invoice_number: invoice, cashier: userName, payment_method: payment, subtotal: cartTotal, discount: 0, total: cartTotal, created_at: new Date().toISOString() });
    setReceiptItems(cart);
    setCart([]);
    setToast('Sale completed — stock updated');
    window.setTimeout(() => setToast(''), 2500);
  };

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Point of Sale</h2>
          <p className="mt-1 text-sm text-[#68726e]">Scan barcode to sell a SAYA 3-piece set.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${scannerConnected ? 'bg-[#3a6d4e]' : 'bg-[#9c473d]'}`} />
            <span className="text-[#8a948e]">Scanner {scannerConnected ? 'Connected' : 'Not Connected'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-[#3a6d4e]" />
            <span className="text-[#8a948e]">System Online</span>
          </div>
        </div>
      </div>

      {!scannerConnected && (
        <div className="mb-4 border border-[#faf0ce] bg-[#fffbf0] px-4 py-2.5 text-sm text-[#8b6717]">
          Barcode scanner not connected. Use product search instead.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <section className="admin-panel p-5">
          <div className="flex items-center gap-2 border-b border-[#e5e9e4] pb-4">
            <Barcode className="text-[#1a2238]" size={22} />
            <input autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') scan(); }} className="admin-input flex-1 text-base" placeholder="SCAN BARCODE" />
            <button onClick={scan} className="bg-[#1a2238] px-5 py-2.5 text-sm font-semibold text-white">Add</button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 text-[#829087]" size={16} />
            <input value={props.query} onChange={(e) => props.setQuery(e.target.value)} className="admin-input w-full pl-9" placeholder="Search product by name or SKU" />
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {props.filtered.map((item) => (
              <button key={item.id} onClick={() => addToCart(item)} className="flex gap-3 border border-[#e5e9e4] p-2.5 text-left transition hover:border-[#1a2238]">
                <CatalogImage product={item} className="h-16 w-12 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-[#829087]">{item.sku}</p>
                  <p className="mt-1.5 text-sm font-semibold">{money(item.retail_price)}</p>
                  <p className="text-xs text-[#557064]">{item.current_stock} in stock</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-panel flex flex-col">
          <div className="border-b border-[#e5e9e4] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Current Sale</h3>
              <span className="text-xs text-[#829087]">{cart.reduce((s, l) => s + l.quantity, 0)} sets</span>
            </div>
          </div>
          <div className="min-h-[200px] flex-1 divide-y divide-[#eef1ed]">
            {cart.length ? cart.map((line) => (
              <div key={line.product.id} className="flex gap-3 p-3.5">
                <CatalogImage product={line.product} className="h-12 w-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{line.product.name}</p>
                    <button onClick={() => removeFromCart(line.product.id)} className="text-[#9c473d]"><X size={14} /></button>
                  </div>
                  <p className="mt-0.5 text-xs text-[#829087]">{money(line.product.retail_price)} per set</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button onClick={() => updateQty(line.product.id, line.quantity - 1)} className="flex h-6 w-6 items-center justify-center border text-sm">−</button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <button onClick={() => updateQty(line.product.id, line.quantity + 1)} className="flex h-6 w-6 items-center justify-center border text-sm">+</button>
                  </div>
                </div>
                <p className="text-sm font-semibold">{money(line.product.retail_price * line.quantity)}</p>
              </div>
            )) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-[#829087]">
                <div><ShoppingCart className="mx-auto mb-2 text-[#c4d0c7]" size={28} /><p>Scan a barcode to start a sale.</p></div>
              </div>
            )}
          </div>
          <div className="border-t border-[#e5e9e4] p-4">
            <div className="flex justify-between text-sm text-[#68726e]"><span>Subtotal</span><span>{money(cartTotal)}</span></div>
            <div className="mt-2 flex justify-between text-base font-semibold"><span>Total</span><span>{money(cartTotal)}</span></div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['CASH', 'CARD', 'ONLINE'].map((m) => (
                <button key={m} onClick={() => setPayment(m)} className={`border py-2 text-xs font-semibold ${payment === m ? 'border-[#1a2238] bg-[#eef0ea] text-[#1a2238]' : 'border-[#d4dbd5] text-[#68726e]'}`}>
                  {m === 'CASH' ? <CircleDollarSign className="mx-auto mb-0.5" size={14} /> : m === 'CARD' ? <CreditCard className="mx-auto mb-0.5" size={14} /> : <FileText className="mx-auto mb-0.5" size={14} />}
                  {m}
                </button>
              ))}
            </div>
            <button disabled={!cart.length} onClick={completeSale} className="mt-3 w-full bg-[#1a2238] py-3 text-sm font-semibold text-white disabled:bg-[#c4d0c7]">Complete Sale</button>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-30 border border-[#e0e5df] bg-white px-4 py-3 text-sm shadow-lg">
          {toast.includes('not found') ? <span className="text-[#9c473d]">{toast}</span> : <span className="text-[#1a2238]">{toast}</span>}
        </div>
      )}
      {receipt && <ReceiptModal sale={receipt} cart={receiptItems} onClose={() => setReceipt(null)} onNewSale={() => { setReceipt(null); navigate('/admin/pos'); }} />}
    </div>
  );
}

function ReceiptModal({ sale, cart, onClose, onNewSale }: { sale: Sale; cart: CartLine[]; onClose: () => void; onNewSale: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#1a2238]/45 p-5">
      <div className="w-full max-w-sm bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-dashed border-[#cbd4cd] pb-4">
          <div><p className="font-semibold text-[#1a2238]">SAYA</p><p className="mt-0.5 text-xs text-[#829087]">3 Piece Lawn · Karachi</p></div>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="py-4 text-center">
          <Check size={28} className="mx-auto text-[#3a6d4e]" />
          <p className="mt-2 text-xs text-[#557064]">Sale complete</p>
          <h3 className="mt-1 text-lg font-semibold">{sale.invoice_number}</h3>
          <p className="mt-0.5 text-xs text-[#829087]">{new Date(sale.created_at).toLocaleString()}</p>
        </div>
        <div className="border-y border-dashed border-[#cbd4cd] py-3 text-sm">
          {cart.map((line) => <div key={line.product.id} className="flex justify-between py-0.5"><span>{line.quantity} × {line.product.name}</span><span>{money(line.product.retail_price * line.quantity)}</span></div>)}
        </div>
        <div className="flex justify-between py-3 font-semibold"><span>Total</span><span>{money(Number(sale.total))}</span></div>
        <div className="flex justify-between text-xs text-[#829087]"><span>Payment</span><span>{sale.payment_method}</span></div>
        <div className="flex justify-between text-xs text-[#829087]"><span>Cashier</span><span>{sale.cashier}</span></div>
        <button onClick={onNewSale} className="mt-5 w-full bg-[#1a2238] py-2.5 text-sm font-semibold text-white">New Sale</button>
        <button onClick={onClose} className="mt-2 w-full border border-[#1a2238] py-2.5 text-sm font-semibold">Close</button>
      </div>
    </div>
  );
}

// ============ PRODUCTS ============
function ProductsPage({ products, query, setQuery, filtered }: { products: Product[]; query: string; setQuery: (v: string) => void; filtered: Product[] }) {
  return (
    <div>
      <PageIntro title="Products" copy="SAYA catalog with demo stock quantities." action="Add product" />
      <div className="admin-panel mt-5 overflow-x-auto">
        <div className="flex min-w-[760px] items-center justify-between border-b border-[#e5e9e4] p-4">
          <div className="relative w-80"><Search className="absolute left-3 top-3 text-[#829087]" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="admin-input w-full pl-9" placeholder="Search colorway, SKU or barcode" /></div>
          <span className="text-xs text-[#8a948e]">Demo stock data</span>
        </div>
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr><th className="px-4 py-3">Image</th><th className="px-4 py-3">Colorway</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Barcode</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Retail</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Wholesale</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3"><CatalogImage product={item} className="h-12 w-10" /></td>
                <td className="px-4 py-3 font-semibold">{item.name}</td>
                <td className="px-4 py-3 text-xs">{item.sku}</td>
                <td className="px-4 py-3 font-mono text-xs">{item.barcode}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3 font-semibold">{money(item.retail_price)}</td>
                <td className="px-4 py-3">{item.current_stock}</td>
                <td className="px-4 py-3">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ INVENTORY ============
function InventoryPage({ products, query, setQuery, filtered, onLogAction }: { products: Product[]; query: string; setQuery: (v: string) => void; filtered: Product[]; onLogAction: (a: string, area: string, ref?: string) => void }) {
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  return (
    <div>
      <PageIntro title="Inventory" copy="SAYA 3-piece suits and demo stock levels." action="Stock adjustment" />
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <SummaryCard label="Total Products" value={String(products.length)} />
        <SummaryCard label="Total Sets" value={String(products.reduce((s, p) => s + p.current_stock, 0))} />
        <SummaryCard label="Stock Value" value={money(products.reduce((s, p) => s + p.retail_price * p.current_stock, 0))} />
        <SummaryCard label="Low Stock" value={String(products.filter((p) => p.current_stock <= p.minimum_stock).length)} />
      </div>
      <div className="admin-panel mt-5 overflow-x-auto">
        <div className="flex min-w-[760px] items-center justify-between border-b border-[#e5e9e4] p-4">
          <div className="relative w-80"><Search className="absolute left-3 top-3 text-[#829087]" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="admin-input w-full pl-9" placeholder="Search inventory" /></div>
          <span className="text-xs text-[#8a948e]">Demo stock data</span>
        </div>
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr><th className="px-4 py-3">Image</th><th className="px-4 py-3">Colorway</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Barcode</th><th className="px-4 py-3">Retail</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[#f7f9f6]">
                <td className="px-4 py-3"><CatalogImage product={item} className="h-12 w-10" /></td>
                <td className="px-4 py-3 font-semibold">{item.name}</td>
                <td className="px-4 py-3 text-xs">{item.sku}</td>
                <td className="px-4 py-3 font-mono text-xs">{item.barcode}</td>
                <td className="px-4 py-3 font-semibold">{money(item.retail_price)}</td>
                <td className="px-4 py-3">{item.current_stock}</td>
                <td className="px-4 py-3"><StatusBadge product={item} /></td>
                <td className="px-4 py-3"><button onClick={() => setAdjustProduct(item)} className="text-xs font-semibold text-[#557064] hover:text-[#1a2238]">Adjust</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adjustProduct && <AdjustStockModal product={adjustProduct} onClose={() => setAdjustProduct(null)} onLogAction={onLogAction} />}
    </div>
  );
}

function AdjustStockModal({ product, onClose, onLogAction }: { product: Product; onClose: () => void; onLogAction: (a: string, area: string, ref?: string) => void }) {
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('Damaged');
  const [confirm, setConfirm] = useState(false);
  const adjNum = parseInt(adjustment) || 0;
  const newStock = product.current_stock + adjNum;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#1a2238]/45 p-5">
      <div className="w-full max-w-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e5e9e4] pb-4">
          <h3 className="font-semibold">Stock Adjustment — {product.name}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex justify-between text-sm"><span className="text-[#68726e]">Current stock</span><span className="font-semibold">{product.current_stock} sets</span></div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Adjustment (+/−)</label>
            <input value={adjustment} onChange={(e) => setAdjustment(e.target.value)} className="admin-input mt-2 w-full" placeholder="e.g. -10" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="admin-input mt-2 w-full">
              <option>Damaged</option><option>Correction</option><option>Return</option><option>Transfer</option><option>Other</option>
            </select>
          </div>
          <div className="flex justify-between border-t border-[#eef1ed] pt-3 text-sm"><span className="text-[#68726e]">New stock level</span><span className="font-semibold">{Math.max(0, newStock)} sets</span></div>
          <p className="flex items-center gap-1.5 text-xs text-[#8a948e]"><AlertTriangle size={12} /> Inventory adjustment will be recorded in the audit log.</p>
          <button onClick={() => setConfirm(true)} className="w-full bg-[#1a2238] py-2.5 text-sm font-semibold text-white">Confirm Adjustment</button>
        </div>
        {confirm && (
          <ConfirmModal
            title="Confirm stock adjustment"
            message={`${Math.abs(adjNum)} ${adjNum < 0 ? 'sets will be removed from' : 'sets will be added to'} available inventory.`}
            confirmLabel="Confirm Adjustment"
            onCancel={() => setConfirm(false)}
            onConfirm={async () => {
              await supabase.from('products').update({ current_stock: Math.max(0, newStock), availability: newStock <= 0 ? 'Out of Stock' : newStock <= product.minimum_stock ? 'Low Stock' : 'In Stock' }).eq('id', product.id);
              await supabase.from('inventory_movements').insert({ product_id: product.id, movement_type: 'Adjustment', quantity: adjNum, meters: null, reference: reason });
              onLogAction('Stock adjusted', 'Inventory', product.sku);
              setConfirm(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============ SALES ============
function SalesPage({ sales, saleItems }: { sales: Sale[]; saleItems: SaleItem[] }) {
  return (
    <div>
      <PageIntro title="Sales History" copy="All completed SAYA transactions." action="Export report" />
      <div className="admin-panel mt-5 overflow-x-auto">
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Cashier</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-4 py-3 font-semibold">{sale.invoice_number}</td>
                <td className="px-4 py-3 text-[#68726e]">{new Date(sale.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">{sale.cashier}</td>
                <td className="px-4 py-3">{saleItems.filter((i) => i.sale_id === sale.id).reduce((s, i) => s + i.quantity, 0)} sets</td>
                <td className="px-4 py-3">{sale.payment_method}</td>
                <td className="px-4 py-3 font-semibold">{money(Number(sale.total))}</td>
                <td className="px-4 py-3"><span className="status-good px-2 py-0.5 text-xs font-semibold">COMPLETED</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!sales.length && <EmptyState copy="No sales yet. Complete a POS transaction to start." />}
      </div>
    </div>
  );
}

// ============ CASH MANAGEMENT ============
function CashManagement({ shifts, role, userName, onLogAction }: { shifts: Shift[]; role: Role; userName: string; onLogAction: (a: string, area: string, ref?: string) => void }) {
  const openShifts = shifts.filter((s) => s.status === 'OPEN');
  const [closeShift, setCloseShift] = useState<Shift | null>(null);
  return (
    <div>
      <PageIntro title="Cash Management" copy="Shift cash positions and reconciliation." action="New shift" />
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <SummaryCard label="Open Shifts" value={String(openShifts.length)} />
        <SummaryCard label="Total Cash Sales" value={money(openShifts.reduce((s, sh) => s + Number(sh.cash_sales), 0))} />
        <SummaryCard label="Total Card Sales" value={money(openShifts.reduce((s, sh) => s + Number(sh.card_sales), 0))} />
        <SummaryCard label="Total Online" value={money(openShifts.reduce((s, sh) => s + Number(sh.online_sales), 0))} />
      </div>
      <div className="mt-5 admin-panel">
        <div className="border-b border-[#e5e9e4] px-5 py-3"><h3 className="text-sm font-semibold">Open Shifts</h3></div>
        <div className="divide-y divide-[#eef1ed]">
          {openShifts.map((shift) => (
            <div key={shift.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p className="font-semibold">{shift.staff_name} · {shift.role}</p>
                <p className="mt-0.5 text-xs text-[#829087]">Started {new Date(shift.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div><p className="text-xs text-[#829087]">Opening</p><p className="font-semibold">{money(Number(shift.opening_cash))}</p></div>
                <div><p className="text-xs text-[#829087]">Cash sales</p><p className="font-semibold">{money(Number(shift.cash_sales))}</p></div>
                <div><p className="text-xs text-[#829087]">Expected</p><p className="font-semibold">{money(Number(shift.opening_cash) + Number(shift.cash_sales))}</p></div>
                <button onClick={() => setCloseShift(shift)} className="border border-[#9c473d] px-3 py-1.5 text-xs font-semibold text-[#9c473d] hover:bg-[#fdf6f5]">Close Shift</button>
              </div>
            </div>
          ))}
          {!openShifts.length && <EmptyState copy="No open shifts." />}
        </div>
      </div>
      {closeShift && <CloseShiftModal shift={closeShift} onClose={() => setCloseShift(null)} onLogAction={onLogAction} />}
    </div>
  );
}

function CloseShiftModal({ shift, onClose, onLogAction }: { shift: Shift; onClose: () => void; onLogAction: (a: string, area: string, ref?: string) => void }) {
  const [actualCash, setActualCash] = useState('');
  const [confirm, setConfirm] = useState(false);
  const expected = Number(shift.opening_cash) + Number(shift.cash_sales);
  const actual = parseFloat(actualCash) || 0;
  const diff = actual - expected;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#1a2238]/45 p-5">
      <div className="w-full max-w-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e5e9e4] pb-4">
          <h3 className="font-semibold">Close Shift — {shift.staff_name}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-[#68726e]">Opening cash</span><span className="font-semibold">{money(Number(shift.opening_cash))}</span></div>
          <div className="flex justify-between"><span className="text-[#68726e]">Cash sales</span><span className="font-semibold">{money(Number(shift.cash_sales))}</span></div>
          <div className="flex justify-between"><span className="text-[#68726e]">Refunds</span><span className="font-semibold">{money(Number(shift.refunds))}</span></div>
          <div className="flex justify-between border-t border-[#eef1ed] pt-2"><span className="font-semibold">Expected cash</span><span className="font-semibold">{money(expected)}</span></div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Actual Cash</label>
            <input value={actualCash} onChange={(e) => setActualCash(e.target.value)} className="admin-input mt-2 w-full" placeholder="Count drawer" />
          </div>
          {actualCash && (
            <div className="flex justify-between"><span className="text-[#68726e]">Difference</span><span className={`font-semibold ${Math.abs(diff) < 1 ? 'text-[#3a6d4e]' : 'text-[#9c473d]'}`}>{money(diff)}</span></div>
          )}
          <button onClick={() => setConfirm(true)} className="w-full bg-[#1a2238] py-2.5 text-sm font-semibold text-white">Close Shift</button>
        </div>
        {confirm && (
          <ConfirmModal title="Are you sure you want to close this shift?" message="This will end the current shift session." confirmLabel="Close Shift" onCancel={() => setConfirm(false)} onConfirm={async () => {
            await supabase.from('shifts').update({ status: 'CLOSED', actual_cash: actual, difference: diff, ended_at: new Date().toISOString() }).eq('id', shift.id);
            await supabase.from('staff').update({ current_shift: 'CLOSED' }).eq('id', shift.staff_id);
            onLogAction('Shift closed', 'Cash Management', shift.staff_name);
            setConfirm(false); onClose();
          }} />
        )}
      </div>
    </div>
  );
}

// ============ REPORTS ============
function ReportsPage({ sales, saleItems, products }: { sales: Sale[]; saleItems: SaleItem[]; products: Product[] }) {
  const totalRevenue = sales.reduce((s, sale) => s + Number(sale.total), 0);
  const totalSets = saleItems.reduce((s, item) => s + item.quantity, 0);
  const avgOrder = sales.length ? totalRevenue / sales.length : 0;
  const topProducts = [...products].sort((a, b) => b.current_stock - a.current_stock).slice(0, 5);
  return (
    <div>
      <PageIntro title="Reports" copy="Business performance overview — demo data." action="Export PDF" />
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <SummaryCard label="Total Revenue" value={money(totalRevenue)} />
        <SummaryCard label="Total Sets Sold" value={String(totalSets)} />
        <SummaryCard label="Avg Order Value" value={money(avgOrder)} />
        <SummaryCard label="Transactions" value={String(sales.length)} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="admin-panel p-5">
          <h3 className="mb-4 text-sm font-semibold">Sales by Payment Method</h3>
          <div className="space-y-3 text-sm">
            {['CASH', 'CARD', 'ONLINE'].map((method) => {
              const methodSales = sales.filter((s) => s.payment_method === method);
              const methodTotal = methodSales.reduce((s, sale) => s + Number(sale.total), 0);
              const pct = totalRevenue ? (methodTotal / totalRevenue) * 100 : 0;
              return (
                <div key={method}>
                  <div className="flex justify-between"><span>{method}</span><span className="font-semibold">{money(methodTotal)}</span></div>
                  <div className="mt-1 h-2 bg-[#edf0eb]"><div className="h-2 bg-[#1a2238]" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="admin-panel p-5">
          <h3 className="mb-4 text-sm font-semibold">Top Products by Stock</h3>
          <div className="space-y-2 text-sm">
            {topProducts.map((p) => <div key={p.id} className="flex justify-between"><span>{p.name}</span><span className="font-semibold">{p.current_stock} sets</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ STAFF ============
function StaffPage({ staff, onLogAction }: { staff: Staff[]; onLogAction: (a: string, area: string, ref?: string) => void }) {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div>
      <PageIntro title="Staff Management" copy="Manage staff accounts and roles." action="Create Staff" />
      <div className="admin-panel mt-5 overflow-x-auto">
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr><th className="px-4 py-3">Staff Member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last Active</th><th className="px-4 py-3">Current Shift</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {staff.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3"><div><p className="font-semibold">{member.name}</p><p className="mt-0.5 text-xs text-[#829087]">{member.email}</p></div></td>
                <td className="px-4 py-3"><span className={`border px-2 py-0.5 text-[10px] font-bold ${member.role === 'OWNER' ? 'border-[#1a2238] bg-[#1a2238] text-white' : member.role === 'MANAGER' ? 'border-[#557064] bg-[#557064] text-white' : 'border-[#8b6717] bg-[#8b6717] text-white'}`}>{member.role}</span></td>
                <td className="px-4 py-3"><span className={member.status === 'Active' ? 'status-good' : 'status-out'}>{member.status}</span></td>
                <td className="px-4 py-3 text-[#68726e]">{member.last_active}</td>
                <td className="px-4 py-3"><span className={member.current_shift === 'OPEN' ? 'status-good' : 'text-[#829087]'}>{member.current_shift}</span></td>
                <td className="px-4 py-3"><div className="flex gap-2 text-xs"><button className="text-[#557064] hover:text-[#1a2238]">View</button><button className="text-[#557064] hover:text-[#1a2238]">Edit</button><button className="text-[#9c473d] hover:text-[#7a3530]">Deactivate</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate && <CreateStaffModal onClose={() => setShowCreate(false)} onLogAction={onLogAction} />}
    </div>
  );
}

function CreateStaffModal({ onClose, onLogAction }: { onClose: () => void; onLogAction: (a: string, area: string, ref?: string) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('CASHIER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#1a2238]/45 p-5">
      <div className="w-full max-w-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e5e9e4] pb-4">
          <h3 className="font-semibold">Create Staff Account</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        {success ? (
          <div className="mt-6 text-center">
            <Check size={32} className="mx-auto text-[#3a6d4e]" />
            <p className="mt-3 text-sm font-semibold">Staff account created</p>
            <p className="mt-1 text-xs text-[#829087]">{name} can now sign in with their credentials.</p>
            <button onClick={onClose} className="mt-5 w-full border border-[#1a2238] py-2.5 text-sm font-semibold">Done</button>
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            await supabase.from('staff').insert({ name, role, username: username.toLowerCase(), phone: '', email: '', status: 'Active', last_active: 'Just now', current_shift: 'CLOSED' });
            onLogAction('Staff account created', 'Staff', `STAFF-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`);
            setSuccess(true);
          }}>
            <FormField label="Full Name" value={name} onChange={setName} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone" />
              <FormField label="Email" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="admin-input mt-2 w-full">
                <option value="OWNER">Owner</option><option value="MANAGER">Manager</option><option value="CASHIER">Cashier</option>
              </select>
            </div>
            <FormField label="Username" value={username} onChange={setUsername} />
            <FormField label="Temporary Password" value={password} onChange={setPassword} type="password" />
            <div className="flex items-center gap-1.5 text-xs text-[#8a948e]"><Shield size={12} /> Staff access is controlled by role.</div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 border border-[#d4dbd5] py-2.5 text-sm font-semibold">Cancel</button>
              <button type="submit" className="flex-1 bg-[#1a2238] py-2.5 text-sm font-semibold text-white">Create Staff</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============ AUDIT LOG ============
function AuditLogPage({ logs }: { logs: AuditLog[] }) {
  const [userFilter, setUserFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const users = [...new Set(logs.map((l) => l.user_name))];
  const actions = [...new Set(logs.map((l) => l.action))];
  const filtered = logs.filter((l) => (userFilter === 'All' || l.user_name === userFilter) && (actionFilter === 'All' || l.action === actionFilter));
  return (
    <div>
      <PageIntro title="Audit Log" copy="Staff activity record — owner only." action="Export log" />
      <div className="mt-5 flex gap-3">
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="admin-input text-sm"><option>All</option>{users.map((u) => <option key={u}>{u}</option>)}</select>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="admin-input text-sm"><option>All</option>{actions.map((a) => <option key={a}>{a}</option>)}</select>
      </div>
      <div className="admin-panel mt-4 overflow-x-auto">
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Reference</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {filtered.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-[#68726e]">{new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3 font-semibold">{log.user_name}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3 text-[#68726e]">{log.area}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.reference ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <EmptyState copy="No audit entries match your filters." />}
      </div>
    </div>
  );
}

// ============ SETTINGS ============
function SettingsPage({ role }: { role: Role }) {
  return (
    <div>
      <PageIntro title="Settings" copy="System configuration — owner only." action="Save changes" />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="admin-panel p-5">
          <h3 className="text-sm font-semibold">Business Information</h3>
          <div className="mt-4 space-y-3">
            <FormField label="Business Name" defaultValue="SAYA" />
            <FormField label="WhatsApp" defaultValue="0300-7887292" />
            <FormField label="Email" defaultValue="sale@saya.pk" />
            <FormField label="Instagram" defaultValue="saya.pakistan" />
          </div>
        </div>
        <div className="admin-panel p-5">
          <h3 className="text-sm font-semibold">System</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#68726e]">Currency</span><span className="font-semibold">PKR</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Tax (GST)</span><span className="font-semibold">15%</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Store Location</span><span className="font-semibold">Karachi · Main Outlet</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Scanner Status</span><span className="font-semibold text-[#3a6d4e]">Connected</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Session Timeout</span><span className="font-semibold">30 minutes</span></div>
          </div>
          {role !== 'OWNER' && <p className="mt-4 flex items-center gap-1.5 text-xs text-[#8a948e]"><Lock size={12} /> Some settings are owner-restricted.</p>}
        </div>
      </div>
    </div>
  );
}

// ============ CASHIER SHIFT ============
function CashierShift({ shifts, userName, onLogAction }: { shifts: Shift[]; userName: string; onLogAction: (a: string, area: string, ref?: string) => void }) {
  const myShift = shifts.find((s) => s.staff_name === userName && s.status === 'OPEN');
  if (!myShift) return <NoShiftOpen onStartShift={() => {}} />;
  const expected = Number(myShift.opening_cash) + Number(myShift.cash_sales);
  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div><h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Current Shift</h2><p className="mt-1 text-sm text-[#68726e]">Your shift session — visible to you only.</p></div>
        <span className="status-good px-3 py-1 text-xs font-bold">SHIFT OPEN</span>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Cashier" value={userName} />
        <SummaryCard label="Started" value={new Date(myShift.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
        <SummaryCard label="Opening Cash" value={money(Number(myShift.opening_cash))} />
        <SummaryCard label="Transactions" value={String(myShift.transactions)} />
      </div>
      <div className="mt-5 admin-panel p-5">
        <h3 className="mb-4 text-sm font-semibold">My Shift Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#68726e]">Cash sales</span><span className="font-semibold">{money(Number(myShift.cash_sales))}</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Card sales</span><span className="font-semibold">{money(Number(myShift.card_sales))}</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Online sales</span><span className="font-semibold">{money(Number(myShift.online_sales))}</span></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#68726e]">Refunds</span><span className="font-semibold">{money(Number(myShift.refunds))}</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Expenses</span><span className="font-semibold">{money(Number(myShift.expenses))}</span></div>
          </div>
          <div className="border-l border-[#eef1ed] pl-4">
            <p className="text-xs text-[#8a948e]">Expected drawer</p>
            <p className="mt-1 text-lg font-semibold text-[#1a2238]">{money(expected)}</p>
            <p className="mt-2 text-xs text-[#8a948e]">Cash received</p>
            <p className="mt-0.5 text-sm font-semibold">{money(Number(myShift.cash_sales))}</p>
          </div>
        </div>
        <button className="mt-5 border border-[#9c473d] px-4 py-2 text-sm font-semibold text-[#9c473d] hover:bg-[#fdf6f5]">Close Shift</button>
      </div>
    </div>
  );
}

// ============ MY SALES ============
function MySalesPage({ sales, saleItems, userName }: { sales: Sale[]; saleItems: SaleItem[]; userName: string }) {
  const mySales = sales.filter((s) => s.cashier === userName);
  return (
    <div>
      <PageIntro title="My Sales" copy="Your completed transactions this shift." action="Open POS" />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <SummaryCard label="My Transactions" value={String(mySales.length)} />
        <SummaryCard label="My Total Sales" value={money(mySales.reduce((s, sale) => s + Number(sale.total), 0))} />
        <SummaryCard label="Sets Sold" value={String(saleItems.filter((i) => mySales.some((s) => s.id === i.sale_id)).reduce((s, i) => s + i.quantity, 0))} />
      </div>
      <div className="admin-panel mt-5 overflow-x-auto">
        <table className="min-w-[600px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {mySales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-4 py-3 font-semibold">{sale.invoice_number}</td>
                <td className="px-4 py-3 text-[#68726e]">{new Date(sale.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3">{saleItems.filter((i) => i.sale_id === sale.id).reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="px-4 py-3">{sale.payment_method}</td>
                <td className="px-4 py-3 font-semibold">{money(Number(sale.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!mySales.length && <EmptyState copy="You have not completed any sales yet." />}
      </div>
    </div>
  );
}

// ============ PRODUCT SEARCH ============
function ProductSearchPage({ products, query, setQuery, filtered }: { products: Product[]; query: string; setQuery: (v: string) => void; filtered: Product[] }) {
  return (
    <div>
      <PageIntro title="Product Search" copy="Look up products for customers." action="" />
      <div className="mt-5 admin-panel p-5">
        <div className="relative"><Search className="absolute left-3 top-3 text-[#829087]" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="admin-input w-full pl-9" placeholder="Search by name, SKU or barcode" autoFocus /></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex gap-3 border border-[#e5e9e4] p-3">
              <CatalogImage product={item} className="h-16 w-12 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="mt-0.5 text-xs text-[#829087]">{item.sku}</p>
                <p className="mt-1.5 text-sm font-semibold">{money(item.retail_price)}</p>
                <p className="text-xs text-[#557064]">{item.current_stock} in stock</p>
              </div>
            </div>
          ))}
        </div>
        {!filtered.length && <EmptyState copy="No products found." />}
      </div>
    </div>
  );
}

// ============ ACCESS RESTRICTED ============
function AccessRestricted({ role }: { role: Role }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-[#e0e5df] bg-[#f7f9f6]">
          <Lock size={24} className="text-[#8a948e]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1a2238]">Access restricted</h2>
        <p className="mt-2 text-sm text-[#68726e]">This section is available to {role === 'CASHIER' ? 'managers and owners' : 'owners'} only. Your current role does not include permission to view this area.</p>
        <p className="mt-4 text-xs text-[#8a948e]">If you believe this is an error, contact the store owner.</p>
      </div>
    </div>
  );
}

// ============ SHARED ============
function PageIntro({ title, copy, action }: { title: string; copy: string; action: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">{title}</h2>
        <p className="mt-1 text-sm text-[#68726e]">{copy}</p>
      </div>
      {action && <button className="admin-input flex items-center gap-2 self-start text-sm"><Plus size={16} /> {action}</button>}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="admin-panel p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#8a948e]">{label}</p><p className="mt-2 text-lg font-semibold text-[#1a2238]">{value}</p></div>;
}

function StatusBadge({ product }: { product: Product }) {
  const cls = product.availability === 'Out of Stock' ? 'status-out' : product.availability === 'Low Stock' ? 'status-low' : 'status-good';
  return <span className={`${cls} px-2 py-0.5 text-xs font-semibold`}>{product.availability.toUpperCase()}</span>;
}

function EmptyState({ copy }: { copy: string }) {
  return <div className="px-5 py-12 text-center text-sm text-[#829087]">{copy}</div>;
}

function ConfirmModal({ title, message, confirmLabel, onCancel, onConfirm }: { title: string; message: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1a2238]/45 p-5">
      <div className="w-full max-w-sm bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#8b6717]" />
          <div>
            <h3 className="font-semibold text-[#1a2238]">{title}</h3>
            <p className="mt-1.5 text-sm text-[#68726e]">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onCancel} className="flex-1 border border-[#d4dbd5] py-2.5 text-sm font-semibold">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-[#1a2238] py-2.5 text-sm font-semibold text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, defaultValue, type = 'text' }: { label: string; value?: string; onChange?: (v: string) => void; defaultValue?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">{label}</span>
      <input type={type} value={value} defaultValue={defaultValue} onChange={onChange ? (e) => onChange(e.target.value) : undefined} className="admin-input mt-1.5 w-full" />
    </label>
  );
}

function CatalogImage({ product, className = '' }: { product?: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!product || failed || !product.image_path) return <div className={`flex items-center justify-center bg-[#ecebe6] text-center text-[10px] font-semibold uppercase tracking-[.16em] text-[#7b817d] ${className}`}>Product Image</div>;
  return <img src={product.image_path} alt={product.name} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

// ============ ORDERS PAGE ============
function OrdersPage({ orders, orderItems, reloadOrders, onLogAction }: { orders: Order[]; orderItems: OrderItem[]; reloadOrders: () => void; onLogAction: (action: string, area: string, reference?: string) => void }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string | null>(null);

  const itemsForOrder = (orderId: string) => orderItems.filter((item) => item.order_id === orderId);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    onLogAction('Order status updated', 'Orders', `${orderId} → ${status}`);
    reloadOrders();
    setStatusUpdate(null);
    setSelectedOrder(null);
  };

  const deleteOrder = async (orderId: string) => {
    await supabase.from('orders').delete().eq('id', orderId);
    onLogAction('Order deleted', 'Orders', orderId);
    reloadOrders();
    setSelectedOrder(null);
  };

  if (!orders.length) {
    return (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Customer Orders</h2>
        <div className="mt-8 admin-panel p-12 text-center">
          <ShoppingBag size={40} className="mx-auto text-[#c4d0c7]" />
          <p className="mt-4 text-sm text-[#829087]">No orders yet.</p>
          <p className="mt-1 text-xs text-[#a8b3ad]">Customer orders from the online store will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Customer Orders</h2>
      <p className="mt-1 text-sm text-[#68726e]">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      <div className="mt-6 admin-panel overflow-x-auto">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr>
              <th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Items</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {orders.map((order) => {
              const items = itemsForOrder(order.id);
              return (
                <tr key={order.id} className="hover:bg-[#f7f9f6]">
                  <td className="px-4 py-3 font-mono text-xs">{order.invoice_number}</td>
                  <td className="px-4 py-3 font-semibold">{order.customer_name}</td>
                  <td className="px-4 py-3 text-xs">{order.customer_phone}</td>
                  <td className="px-4 py-3 text-xs">{items.length} item{items.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 font-semibold">{money(Number(order.total))}</td>
                  <td className="px-4 py-3">
                    <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${order.status === 'pending' ? 'border-[#8b6717] bg-[#fff8e8] text-[#8b6717]' : order.status === 'confirmed' ? 'border-[#557064] bg-[#e8f2ec] text-[#3a6d4e]' : order.status === 'completed' ? 'border-[#3a6d4e] bg-[#d4e9da] text-[#2a5238]' : 'border-[#9c473d] bg-[#fdf6f5] text-[#9c473d]'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#829087]">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order)} className="text-xs font-semibold text-[#557064] hover:text-[#1a2238]">View →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1a2238]">Order Details</h3>
                <p className="mt-1 font-mono text-xs text-[#829087]">{selectedOrder.invoice_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#829087] hover:text-[#1a2238]"><X size={18} /></button>
            </div>

            <div className="mt-5 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-[#68726e]">Customer</span><span className="font-semibold">{selectedOrder.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-[#68726e]">Phone</span><span className="font-semibold">{selectedOrder.customer_phone}</span></div>
              <div className="flex justify-between"><span className="text-[#68726e]">Address</span><span className="text-right font-semibold">{selectedOrder.customer_address}</span></div>
              <div className="flex justify-between"><span className="text-[#68726e]">Date</span><span className="font-semibold">{new Date(selectedOrder.created_at).toLocaleString()}</span></div>
            </div>

            <div className="mt-5 border-t border-[#eef1ed] pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Items</h4>
              <div className="mt-3 space-y-2">
                {itemsForOrder(selectedOrder.id).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}× {item.product_name} <span className="text-xs text-[#829087]">({item.sku})</span></span>
                    <span className="font-semibold">{money(Number(item.line_total))}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-[#eef1ed] pt-2 text-base font-semibold">
                <span>Total</span><span>{money(Number(selectedOrder.total))}</span>
              </div>
            </div>

            <div className="mt-5 border-t border-[#eef1ed] pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Update Status</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                  <button key={s} onClick={() => setStatusUpdate(s)} className={`border px-3 py-1.5 text-xs font-semibold capitalize ${selectedOrder.status === s ? 'border-[#1a2238] bg-[#1a2238] text-white' : 'border-[#d4dbd5] text-[#68726e]'}`}>{s}</button>
                ))}
              </div>
              {statusUpdate && statusUpdate !== selectedOrder.status && (
                <button onClick={() => updateStatus(selectedOrder.id, statusUpdate)} className="mt-3 w-full bg-[#1a2238] py-2.5 text-sm font-semibold text-white">Confirm: {statusUpdate}</button>
              )}
            </div>

            <button onClick={() => deleteOrder(selectedOrder.id)} className="mt-4 flex w-full items-center justify-center gap-2 border border-[#f8e4e1] py-2.5 text-sm font-semibold text-[#9c473d] hover:bg-[#fdf6f5]">
              <Trash2 size={14} /> Delete Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ENQUIRIES PAGE ============
function EnquiriesPage({ enquiries, reloadEnquiries, onLogAction }: { enquiries: Enquiry[]; reloadEnquiries: () => void; onLogAction: (action: string, area: string, reference?: string) => void }) {
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('enquiries').update({ status }).eq('id', id);
    onLogAction('Enquiry status updated', 'Enquiries', `${id} → ${status}`);
    reloadEnquiries();
  };

  const deleteEnquiry = async (id: string) => {
    await supabase.from('enquiries').delete().eq('id', id);
    onLogAction('Enquiry deleted', 'Enquiries', id);
    reloadEnquiries();
  };

  if (!enquiries.length) {
    return (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Wholesale Enquiries</h2>
        <div className="mt-8 admin-panel p-12 text-center">
          <FileText size={40} className="mx-auto text-[#c4d0c7]" />
          <p className="mt-4 text-sm text-[#829087]">No enquiries yet.</p>
          <p className="mt-1 text-xs text-[#a8b3ad]">Wholesale enquiry submissions from the website will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Wholesale Enquiries</h2>
      <p className="mt-1 text-sm text-[#68726e]">{enquiries.length} enquiry{enquiries.length !== 1 ? 's' : ''} received</p>

      <div className="mt-6 admin-panel overflow-x-auto">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr>
              <th className="px-4 py-3">Business</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">City</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {enquiries.map((enq) => (
              <tr key={enq.id} className="hover:bg-[#f7f9f6]">
                <td className="px-4 py-3 font-semibold">{enq.business_name ?? '—'}</td>
                <td className="px-4 py-3">{enq.contact_person ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{enq.phone ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{enq.city ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{enq.quantity_sets ?? '—'}</td>
                <td className="px-4 py-3 max-w-[200px] truncate text-xs text-[#68726e]">{enq.products_interested ?? '—'}</td>
                <td className="px-4 py-3">
                  <select value={enq.status} onChange={(e) => updateStatus(enq.id, e.target.value)} className="border border-[#d4dbd5] px-2 py-1 text-xs">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-[#829087]">{new Date(enq.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteEnquiry(enq.id)} className="text-[#9c473d] hover:text-[#7a3530]"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ BUSINESS INFO PAGE ============
function BusinessInfoPage({ businessConfig, setBusinessConfig, onLogAction }: { businessConfig: BusinessConfig; setBusinessConfig: (c: BusinessConfig) => void; onLogAction: (action: string, area: string, reference?: string) => void }) {
  const [form, setForm] = useState<BusinessConfig>(businessConfig);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof BusinessConfig, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBusinessConfig(form);
    setBusinessConfig(form);
    onLogAction('Business info updated', 'Business Info', form.businessName);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-[#1a2238]">Business Information</h2>
      <p className="mt-1 text-sm text-[#68726e]">Update these details to change the business name, contact info, and social links across the entire site.</p>

      <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-5">
        <div className="admin-panel p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7b877f]">Business Details</h3>
          <div className="mt-4 space-y-4">
            <FormField label="Business Name" value={form.businessName} onChange={(v) => update('businessName', v)} />
            <FormField label="WhatsApp Number (with country code, no + or spaces)" value={form.whatsappNumber} onChange={(v) => update('whatsappNumber', v)} />
            <FormField label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
            <FormField label="Email" value={form.email} onChange={(v) => update('email', v)} />
            <FormField label="Address" value={form.address} onChange={(v) => update('address', v)} />
          </div>
        </div>

        <div className="admin-panel p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7b877f]">Social Links</h3>
          <div className="mt-4 space-y-4">
            <FormField label="Facebook URL" value={form.facebook} onChange={(v) => update('facebook', v)} />
            <FormField label="Instagram URL" value={form.instagram} onChange={(v) => update('instagram', v)} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" className="bg-[#1a2238] px-6 py-2.5 text-sm font-semibold text-white">Save Changes</button>
          {saved && <span className="text-sm text-[#3a6d4e]">Saved — changes are now live across the site.</span>}
        </div>
      </form>
    </div>
  );
}
