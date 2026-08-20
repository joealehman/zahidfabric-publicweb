import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Menu, Store, FileText, Minus, Plus, MapPin, Phone, Mail, MessageCircle, X, ShoppingCart, Trash2, Printer, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { type Role, type Staff, type Shift, type AuditLog, type Product, type Sale, type SaleItem, type Order, type OrderItem, type Enquiry, type Screen, money, CARE_INSTRUCTIONS, getScreen } from '@/lib/types';
import { LoginScreen } from '@/components/LoginScreen';
import { AdminApp } from '@/components/AdminApp';
import { CartProvider, useCart } from '@/lib/cart';
import { loadBusinessConfig, buildWhatsAppLink, type BusinessConfig } from '@/config/business';

function App() {
  const [screen, setScreen] = useState<Screen>(getScreen());
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authedRole, setAuthedRole] = useState<Role | null>(null);
  const [authedName, setAuthedName] = useState('');
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(loadBusinessConfig());

  const loadData = async () => {
    const [p, s, si, st, sh, al, ord, oitem] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('sale_items').select('*').order('id'),
      supabase.from('staff').select('*').order('name'),
      supabase.from('shifts').select('*').order('started_at', { ascending: false }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*').order('id'),
      supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
    ]);
    setProducts(p.data ?? []);
    setSales(s.data ?? []);
    setSaleItems(si.data ?? []);
    setStaff(st.data ?? []);
    setShifts(sh.data ?? []);
    setAuditLogs(al.data ?? []);
    setOrders(ord.data ?? []);
    setOrderItems(oitem.data ?? []);
    setEnquiries(enq.data ?? []);
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, []);
  useEffect(() => { const onPop = () => setScreen(getScreen()); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);

  const navigate = (path: string) => { window.history.pushState({}, '', path); setScreen(getScreen()); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const logAction = async (role: Role, name: string, action: string, area: string, reference?: string) => {
    await supabase.from('audit_logs').insert({ user_name: name, action, area, reference: reference ?? null });
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setAuditLogs(data);
  };

  const handleLogin = (role: Role, name: string) => {
    setAuthedRole(role);
    setAuthedName(name);
    void logAction(role, name, 'Staff login', 'Auth', role);
    navigate('/admin');
  };

  const handleLogout = () => {
    if (authedRole && authedName) void logAction(authedRole, authedName, 'Staff logout', 'Auth', authedName);
    setAuthedRole(null);
    setAuthedName('');
    navigate('/admin/login');
  };

  const onLogAction = (action: string, area: string, reference?: string) => {
    if (authedRole && authedName) void logAction(authedRole, authedName, action, area, reference);
  };

  const reloadOrders = async () => {
    const [ord, oitem] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*').order('id'),
    ]);
    setOrders(ord.data ?? []);
    setOrderItems(oitem.data ?? []);
  };

  const reloadEnquiries = async () => {
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    setEnquiries(data ?? []);
  };

  const adminScreens: Screen[] = ['dashboard', 'pos', 'products', 'inventory', 'sales', 'cash', 'reports', 'staff', 'audit', 'settings', 'shift', 'mysales', 'search', 'orders', 'enquiries', 'business-info'];

  if (screen === 'login' || (adminScreens.includes(screen) && !authedRole)) {
    if (!authedRole) return <LoginScreen onLogin={handleLogin} businessConfig={businessConfig} />;
  }

  if (authedRole && adminScreens.includes(screen)) {
    return (
      <AdminApp
        role={authedRole} userName={authedName} screen={screen} navigate={navigate}
        products={products} sales={sales} saleItems={saleItems} staff={staff} shifts={shifts} auditLogs={auditLogs}
        loading={loading} onLogout={handleLogout} onLogAction={onLogAction}
        orders={orders} orderItems={orderItems} reloadOrders={reloadOrders}
        enquiries={enquiries} reloadEnquiries={reloadEnquiries}
        businessConfig={businessConfig} setBusinessConfig={setBusinessConfig}
      />
    );
  }

  return (
    <CartProvider>
      <PublicApp screen={screen} products={products} navigate={navigate} businessConfig={businessConfig} reloadEnquiries={reloadEnquiries} />
    </CartProvider>
  );
}

// ============ PUBLIC SITE ============
function PublicApp({ screen, products, navigate, businessConfig, reloadEnquiries }: { screen: Screen; products: Product[]; navigate: (p: string) => void; businessConfig: BusinessConfig; reloadEnquiries: () => void }) {
  const selectedId = new URLSearchParams(window.location.search).get('id');
  const selectedProduct = products.find((product) => product.id === selectedId) ?? products[0];
  const { cartCount } = useCart();

  return (
    <div className="public-shell">
      <header className="public-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center bg-[#172420] text-white"><Store size={16} /></span> {businessConfig.businessName}
          </button>
          <nav className="hidden items-center gap-7 text-sm md:flex">
            <button onClick={() => navigate('/')} className={`nav-link ${screen === 'home' ? 'active' : ''}`}>Home</button>
            <button onClick={() => navigate('/collections')} className={`nav-link ${screen === 'collections' || screen === 'product' ? 'active' : ''}`}>Collection</button>
            <button onClick={() => navigate('/wholesale')} className={`nav-link ${screen === 'wholesale' ? 'active' : ''}`}>Wholesale</button>
            <button onClick={() => navigate('/about')} className={`nav-link ${screen === 'about' ? 'active' : ''}`}>About</button>
            <button onClick={() => navigate('/contact')} className={`nav-link ${screen === 'contact' ? 'active' : ''}`}>Contact</button>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/cart')} className="relative flex items-center gap-1.5 text-sm font-semibold">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-[#172420] text-[10px] text-white">{cartCount}</span>}
            </button>
            <button className="md:hidden"><Menu size={20} /></button>
          </div>
        </div>
      </header>
      {screen === 'home' && <HomePage products={products} navigate={navigate} businessConfig={businessConfig} />}
      {screen === 'collections' && <CollectionPage products={products} navigate={navigate} />}
      {screen === 'product' && <ProductPage product={selectedProduct} navigate={navigate} />}
      {screen === 'cart' && <CartPage navigate={navigate} />}
      {screen === 'checkout' && <CheckoutPage navigate={navigate} businessConfig={businessConfig} />}
      {screen === 'order-confirmation' && <OrderConfirmationPage navigate={navigate} businessConfig={businessConfig} />}
      {screen === 'wholesale' && <WholesalePage products={products} navigate={navigate} reloadEnquiries={reloadEnquiries} />}
      {screen === 'about' && <AboutPage navigate={navigate} businessConfig={businessConfig} />}
      {screen === 'contact' && <ContactPage businessConfig={businessConfig} />}
      <footer className="mt-24 border-t border-[#dfe1da] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#68726e] md:flex-row">
          <span>{businessConfig.businessName} · Retail + Wholesale</span>
          <span>{businessConfig.phone} · {businessConfig.email}</span>
        </div>
      </footer>
    </div>
  );
}

function HomePage({ products, navigate, businessConfig }: { products: Product[]; navigate: (p: string) => void; businessConfig: BusinessConfig }) {
  const featured = products.slice(0, 4);
  if (!products.length) return <main className="mx-auto max-w-7xl px-6 py-24 text-center text-sm text-[#8a948e]">Loading collection…</main>;
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-14 md:grid-cols-[1fr_.86fr] md:items-center md:pt-20">
        <div>
          <p className="eyebrow mb-6 text-[#557064]">Retail + Wholesale</p>
          <h1 className="font-display max-w-2xl text-5xl leading-[1.08] tracking-[-.03em] md:text-7xl">Clothing, selected with purpose.</h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#68726e]">{businessConfig.businessName} — retail and wholesale clothing, brought together with a modern approach to product, stock and service.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button className="public-button" onClick={() => navigate('/collections')}>Explore Collection <ArrowRight className="ml-2 inline" size={16} /></button>
            <button className="outline-button" onClick={() => navigate('/wholesale')}>Wholesale Enquiry</button>
          </div>
          <div className="mt-16 grid max-w-md grid-cols-2 gap-8 border-t border-[#dfe1da] pt-5">
            <div><p className="eyebrow text-[#8a948e]">Collection</p><p className="mt-2 text-sm">Embroidery Lawn</p></div>
            <div><p className="eyebrow text-[#8a948e]">Format</p><p className="mt-2 text-sm">Three Piece</p></div>
          </div>
        </div>
        <div className="photo-frame h-[420px] md:h-[560px]">
          <CatalogImage product={featured[0]} className="h-full w-full" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between bg-white/95 p-4">
            <div>
              <p className="eyebrow text-[#557064]">Featured</p>
              <p className="mt-1 text-sm font-semibold">{featured[0]?.name}</p>
            </div>
            <button onClick={() => navigate(`/product?id=${featured[0]?.id}`)} className="flex h-9 w-9 items-center justify-center border border-[#dfe1da]"><ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dfe1da] bg-[#eef0ea] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div><p className="eyebrow text-[#557064]">Selected Collection</p><h2 className="font-display mt-2 text-3xl">Gul Ahmed Embroidery Lawn.</h2></div>
            <button onClick={() => navigate('/collections')} className="text-sm font-semibold text-[#172420]">View all →</button>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1fr_1fr] md:items-center">
        <div className="photo-frame h-[400px]"><CatalogImage product={featured[1]} className="h-full w-full" /></div>
        <div>
          <p className="eyebrow text-[#557064]">For wholesale buyers</p>
          <h2 className="font-display mt-3 text-4xl leading-tight">Wholesale, made straightforward.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#68726e]">We work with buyers looking for dependable product, clear quantities and straightforward wholesale purchasing.</p>
          <button className="public-button mt-8" onClick={() => navigate('/wholesale')}>Explore Wholesale <ArrowRight className="ml-2 inline" size={16} /></button>
        </div>
      </section>

      <section className="border-y border-[#dfe1da] bg-[#eef0ea] px-6 py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow text-[#557064]">Retail</p>
            <h2 className="font-display mt-3 text-4xl leading-tight">Visit the outlet.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#68726e]">The retail experience is being developed. We are building a more organised store with barcode billing, better stock management, and faster checkout.</p>
            <button className="outline-button mt-8" onClick={() => navigate('/about')}>Retail — Coming Soon</button>
          </div>
          <div className="photo-frame h-[320px]"><CatalogImage product={featured[2]} className="h-full w-full" /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10"><p className="eyebrow text-[#557064]">Fabric & finish</p><h2 className="font-display mt-2 text-4xl">Print, embroidery, and detail.</h2></div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="photo-frame h-[360px]"><CatalogImage product={featured[3]} className="h-full w-full" /></div>
          <div className="flex flex-col justify-center">
            <h3 className="font-display text-2xl">Digital printed lawn</h3>
            <p className="mt-4 text-sm leading-6 text-[#68726e]">Each shirt is digitally printed on premium lawn with a wider width of 1.85 metres, paired with a printed lawn voil dupatta and dyed plain cotton trouser.</p>
          </div>
          <div className="flex flex-col justify-center border-l border-[#dfe1da] pl-6">
            <h3 className="font-display text-2xl">Embroidered neck</h3>
            <p className="mt-4 text-sm leading-6 text-[#68726e]">An embroidered neck on organza is included with every three-piece set, adding a considered finish to each design.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1fr_1fr] md:items-center">
        <div className="photo-frame h-[380px]"><CatalogImage product={featured[0]} className="h-full w-full" /></div>
        <div>
          <p className="eyebrow text-[#557064]">About {businessConfig.businessName}</p>
          <h2 className="font-display mt-3 text-4xl leading-tight">A clothing business built around product, fabric and dependable service.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#68726e]">Now moving toward a more organised retail and wholesale experience.</p>
          <button className="outline-button mt-8" onClick={() => navigate('/about')}>About {businessConfig.businessName} <ArrowRight className="ml-2 inline" size={16} /></button>
        </div>
      </section>

      <section className="border-t border-[#dfe1da] bg-[#172420] px-6 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div><p className="eyebrow text-[#9cad9f]">Visit</p><p className="mt-2 text-sm">{businessConfig.address}</p></div>
          <div><p className="eyebrow text-[#9cad9f]">Call</p><p className="mt-2 text-sm">{businessConfig.phone}</p></div>
          <div><p className="eyebrow text-[#9cad9f]">WhatsApp</p><p className="mt-2 text-sm">+{businessConfig.whatsappNumber}</p></div>
          <div><p className="eyebrow text-[#9cad9f]">Email</p><p className="mt-2 text-sm">{businessConfig.email}</p></div>
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product, navigate }: { product: Product; navigate: (p: string) => void }) {
  const { addToCart } = useCart();
  return (
    <div className="group text-left">
      <button className="block w-full" onClick={() => navigate(`/product?id=${product.id}`)}>
        <div className="photo-frame h-80"><CatalogImage product={product} className="h-full w-full transition-transform duration-300 group-hover:scale-105" /><span className="absolute left-4 top-4 bg-white px-3 py-2 text-xs font-semibold">THREE PIECE</span></div>
      </button>
      <div className="card-line flex items-start justify-between py-5">
        <div>
          <p className="text-xs text-[#8a948e]">{product.brand}</p>
          <button onClick={() => navigate(`/product?id=${product.id}`)} className="mt-1 text-sm font-semibold hover:underline">{product.name}</button>
          <p className="mt-1 text-xs uppercase tracking-widest text-[#8a948e]">{product.pattern}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{money(product.retail_price)}</p>
          <button onClick={() => { addToCart(product); navigate('/cart'); }} className="mt-1 text-xs font-semibold text-[#557064] hover:text-[#172420]">Add to Cart →</button>
        </div>
      </div>
    </div>
  );
}

function CollectionPage({ products, navigate }: { products: Product[]; navigate: (p: string) => void }) {
  const [filter, setFilter] = useState('All');
  const brands = ['All', ...new Set(products.map((p) => p.brand))];
  const shown = filter === 'All' ? products : products.filter((p) => p.brand === filter);
  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
      <div className="border-b border-[#dfe1da] pb-8">
        <p className="eyebrow text-[#557064]">The collection</p>
        <h1 className="font-display mt-3 text-5xl">Embroidery Lawn — Three Piece.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[#68726e]">Each design is presented as a complete three-piece set: digitally printed lawn shirt, printed lawn voil dupatta, and dyed plain cotton trouser.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {brands.map((brand) => <button key={brand} onClick={() => setFilter(brand)} className={`border px-4 py-2 text-xs font-semibold ${filter === brand ? 'border-[#172420] bg-[#172420] text-white' : 'border-[#c9d1c7] text-[#68726e]'}`}>{brand}</button>)}
      </div>
      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}
      </div>
      {!shown.length && <p className="mt-16 text-center text-sm text-[#8a948e]">No products found.</p>}
    </main>
  );
}

function ProductPage({ product, navigate }: { product?: Product; navigate: (p: string) => void }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  if (!product) return <div className="mx-auto max-w-7xl px-6 py-24 text-center">No product selected.</div>;
  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-12">
      <button onClick={() => navigate('/collections')} className="mb-8 text-sm text-[#68726e] hover:text-[#172420]"><ArrowLeft size={14} className="mr-1 inline" /> Back to collection</button>
      <div className="grid gap-12 md:grid-cols-[.95fr_1fr] md:items-start">
        <div className="photo-frame h-[620px]"><CatalogImage product={product} className="h-full w-full" /></div>
        <div className="pt-4">
          <p className="eyebrow text-[#557064]">{product.brand} · {product.collection}</p>
          <h1 className="font-display mt-3 text-4xl leading-tight">{product.name}</h1>
          <p className="mt-2 text-sm text-[#8a948e]">{product.pattern}</p>
          <p className="mt-5 text-2xl font-semibold">{money(product.retail_price)}</p>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#68726e]">{product.description}</p>

          <div className="mt-8 border-y border-[#dfe1da] py-6">
            <ProductRow label="Product Code" value={product.sku} />
            <ProductRow label="Barcode" value={product.barcode} mono />
            <ProductRow label="Product Type" value={product.product_type} />
            <ProductRow label="Add-on" value={product.add_on} />
            <ProductRow label="Stock" value={`${product.current_stock} available`} highlight />
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest">Fabric breakdown</h2>
          <div className="mt-4 space-y-3">
            <PieceRow piece="Shirt" fabric={product.shirt_fabric} qty={product.shirt_quantity} />
            <PieceRow piece="Dupatta" fabric={product.dupatta_fabric} qty={product.dupatta_quantity} />
            <PieceRow piece="Trouser" fabric={product.trouser_fabric} qty={product.trouser_quantity} />
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest">Care instructions</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#68726e]">
            {CARE_INSTRUCTIONS.map((instruction) => <li key={instruction} className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[#557064]" />{instruction}</li>)}
          </ul>

          <div className="mt-8 border border-[#dfe1da] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Quantity</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center border border-[#d4dbd5]">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center"><Minus size={16} /></button>
                <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border-x border-[#d4dbd5] py-2 text-center text-sm outline-none" />
                <button onClick={() => setQty((q) => q + 1)} className="flex h-10 w-10 items-center justify-center"><Plus size={16} /></button>
              </div>
              <div className="text-sm text-[#68726e]">Total: <span className="font-semibold text-[#172420]">{money(product.retail_price * qty)}</span></div>
            </div>
            <button className="public-button mt-5 w-full" onClick={() => { addToCart(product, qty); navigate('/cart'); }}>Add to Cart</button>
          </div>

          {product.document_path && (
            <a href={product.document_path} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-2 border border-[#dfe1da] py-3 text-sm font-semibold text-[#172420] hover:bg-[#eef0ea]">
              <FileText size={16} /> View Product Details PDF
            </a>
          )}

          <p className="mt-4 text-xs text-[#8a948e]">Product may vary from picture.</p>
        </div>
      </div>
    </main>
  );
}

function CartPage({ navigate }: { navigate: (p: string) => void }) {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useCart();

  if (!cart.length) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 text-center">
        <h1 className="font-display text-4xl">Your Cart</h1>
        <div className="mt-12 flex flex-col items-center gap-4">
          <ShoppingCart size={48} className="text-[#c4d0c7]" />
          <p className="text-sm text-[#8a948e]">Your cart is empty.</p>
          <button className="public-button" onClick={() => navigate('/collections')}>Browse Collection</button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-16">
      <div className="flex items-center justify-between border-b border-[#dfe1da] pb-6">
        <h1 className="font-display text-4xl">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-[#9c473d] hover:underline">Clear cart</button>
      </div>
      <div className="mt-8 space-y-4">
        {cart.map((line) => (
          <div key={line.product.id} className="flex items-center gap-4 border border-[#dfe1da] p-4">
            <CatalogImage product={line.product} className="h-20 w-16 shrink-0" />
            <div className="flex-1">
              <button onClick={() => navigate(`/product?id=${line.product.id}`)} className="text-sm font-semibold hover:underline">{line.product.name}</button>
              <p className="mt-0.5 text-xs text-[#8a948e]">{line.product.sku} · {line.product.pattern}</p>
              <p className="mt-1 text-sm font-semibold">{money(line.product.retail_price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#d4dbd5]">
                <button onClick={() => updateQty(line.product.id, line.quantity - 1)} className="flex h-8 w-8 items-center justify-center"><Minus size={14} /></button>
                <span className="w-10 text-center text-sm">{line.quantity}</span>
                <button onClick={() => updateQty(line.product.id, line.quantity + 1)} className="flex h-8 w-8 items-center justify-center"><Plus size={14} /></button>
              </div>
              <p className="w-20 text-right text-sm font-semibold">{money(line.product.retail_price * line.quantity)}</p>
              <button onClick={() => removeFromCart(line.product.id)} className="text-[#9c473d] hover:text-[#7a3530]"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-[#dfe1da] pt-6">
        <div>
          <p className="text-sm text-[#68726e]">Subtotal</p>
          <p className="mt-1 text-2xl font-semibold">{money(cartTotal)}</p>
        </div>
        <button className="public-button" onClick={() => navigate('/checkout')}>Proceed to Checkout <ArrowRight className="ml-2 inline" size={16} /></button>
      </div>
    </main>
  );
}

function CheckoutPage({ navigate, businessConfig }: { navigate: (p: string) => void; businessConfig: BusinessConfig }) {
  const { cart, cartTotal, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!cart.length) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 text-center">
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-8 text-sm text-[#8a948e]">Your cart is empty.</p>
        <button className="public-button mt-6" onClick={() => navigate('/collections')}>Browse Collection</button>
      </main>
    );
  }

  const invoiceNumber = `INV-${Date.now()}`;
  const tax = Math.round(cartTotal * 0);
  const grandTotal = cartTotal + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) { setError('Please fill in all fields.'); return; }
    setSubmitting(true);
    setError('');

    const { data: order } = await supabase.from('orders').insert({
      invoice_number: invoiceNumber,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_address: address.trim(),
      subtotal: cartTotal,
      total: grandTotal,
      status: 'pending',
    }).select().maybeSingle();

    if (order) {
      await supabase.from('order_items').insert(cart.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        product_name: l.product.name,
        sku: l.product.sku,
        quantity: l.quantity,
        unit_price: l.product.retail_price,
        line_total: l.product.retail_price * l.quantity,
      })));
    }

    const orderSummary = cart.map((l) => `• ${l.quantity}x ${l.product.name} (${l.product.sku}) — ${money(l.product.retail_price * l.quantity)}`).join('\n');
    const message = `*New Order — ${businessConfig.businessName}*\n\nInvoice: ${invoiceNumber}\n\n*Items:*\n${orderSummary}\n\n*Total: ${money(grandTotal)}*\n\n*Customer Details:*\nName: ${name}\nPhone: ${phone}\nAddress: ${address}`;
    const waLink = buildWhatsAppLink(businessConfig.whatsappNumber, message);

    sessionStorage.setItem('lastOrder', JSON.stringify({ invoiceNumber, name, phone, address, cart: cart.map((l) => ({ product_name: l.product.name, sku: l.product.sku, quantity: l.quantity, unit_price: l.product.retail_price, line_total: l.product.retail_price * l.quantity })), total: grandTotal, waLink }));
    clearCart();
    setSubmitting(false);
    navigate('/order-confirmation');
  };

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-16">
      <h1 className="font-display text-4xl">Checkout</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
        <form onSubmit={handlePlaceOrder} className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#68726e]">Customer Details</h2>
            <div className="mt-4 space-y-4">
              <FormField label="Full Name" value={name} onChange={setName} />
              <FormField label="Phone Number" value={phone} onChange={setPhone} type="tel" />
              <FormField label="Delivery Address" value={address} onChange={setAddress} textarea />
            </div>
          </div>
          {error && <p className="text-sm text-[#9c473d]">{error}</p>}
          <button type="submit" disabled={submitting} className="public-button w-full md:w-auto">
            {submitting ? 'Placing Order…' : 'Place Order on WhatsApp'}
          </button>
        </form>

        <div className="border border-[#dfe1da] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#68726e]">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart.map((l) => (
              <div key={l.product.id} className="flex justify-between text-sm">
                <span className="text-[#68726e]">{l.quantity}× {l.product.name}</span>
                <span className="font-semibold">{money(l.product.retail_price * l.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-[#dfe1da] pt-4 text-sm">
            <div className="flex justify-between"><span className="text-[#68726e]">Subtotal</span><span className="font-semibold">{money(cartTotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#68726e]">Tax</span><span className="font-semibold">{money(tax)}</span></div>
            <div className="flex justify-between border-t border-[#dfe1da] pt-2 text-base"><span className="font-semibold">Grand Total</span><span className="font-semibold">{money(grandTotal)}</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#8a948e]">
            <MessageCircle size={14} /> Payment is completed via WhatsApp with {businessConfig.businessName}.
          </div>
        </div>
      </div>
    </main>
  );
}

function OrderConfirmationPage({ navigate, businessConfig }: { navigate: (p: string) => void; businessConfig: BusinessConfig }) {
  const [order, setOrder] = useState<{ invoiceNumber: string; name: string; phone: string; address: string; cart: { product_name: string; sku: string; quantity: number; unit_price: number; line_total: number }[]; total: number; waLink: string } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('lastOrder');
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 text-center">
        <h1 className="font-display text-4xl">Order</h1>
        <p className="mt-8 text-sm text-[#8a948e]">No recent order found.</p>
        <button className="public-button mt-6" onClick={() => navigate('/collections')}>Browse Collection</button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#e7f2e9]"><Check size={32} className="text-[#3a6d4e]" /></div>
        <h1 className="font-display mt-4 text-4xl">Order Sent!</h1>
        <p className="mt-3 text-sm text-[#68726e]">Complete payment details via WhatsApp with {businessConfig.businessName}.</p>
      </div>

      <div className="mt-8 border border-[#dfe1da] p-6 print-area">
        <div className="flex items-start justify-between border-b border-dashed border-[#cbd4cd] pb-4">
          <div>
            <p className="font-semibold text-[#172420]">{businessConfig.businessName}</p>
            <p className="mt-0.5 text-xs text-[#8a948e]">{businessConfig.address}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8a948e]">Invoice</p>
            <p className="text-sm font-semibold">{order.invoiceNumber}</p>
          </div>
        </div>
        <div className="py-4 text-sm">
          <p><span className="text-[#8a948e]">Customer:</span> {order.name}</p>
          <p><span className="text-[#8a948e]">Phone:</span> {order.phone}</p>
          <p><span className="text-[#8a948e]">Address:</span> {order.address}</p>
        </div>
        <div className="border-y border-dashed border-[#cbd4cd] py-3 text-sm">
          {order.cart.map((item, i) => (
            <div key={i} className="flex justify-between py-0.5">
              <span>{item.quantity}× {item.product_name} ({item.sku})</span>
              <span>{money(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between py-3 font-semibold"><span>Grand Total</span><span>{money(order.total)}</span></div>
        <div className="mt-2 text-xs text-[#8a948e]">Date: {new Date().toLocaleString()}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 no-print">
        <a href={order.waLink} target="_blank" rel="noopener noreferrer" className="public-button flex items-center gap-2">
          <MessageCircle size={16} /> Open WhatsApp
        </a>
        <button onClick={() => window.print()} className="outline-button flex items-center gap-2">
          <Printer size={16} /> Print Invoice
        </button>
        <button onClick={() => navigate('/collections')} className="outline-button">Continue Shopping</button>
      </div>
    </main>
  );
}

function WholesalePage({ products, navigate, reloadEnquiries }: { products: Product[]; navigate: (p: string) => void; reloadEnquiries: () => void }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ business_name: '', contact_person: '', phone: '', email: '', city: '', quantity_sets: '', products_interested: '' });
  const getQty = (id: string) => quantities[id] ?? 0;
  const setQty = (id: string, qty: number) => setQuantities((q) => ({ ...q, [id]: Math.max(0, qty) }));
  const grandTotal = products.reduce((sum, p) => sum + p.retail_price * getQty(p.id), 0);

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('enquiries').insert(form);
    reloadEnquiries();
    setForm({ business_name: '', contact_person: '', phone: '', email: '', city: '', quantity_sets: '', products_interested: '' });
    setSubmitting(false);
    setToast('Enquiry submitted — our team will be in touch.');
    window.setTimeout(() => setToast(''), 3000);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
      <div className="border-b border-[#dfe1da] pb-8">
        <p className="eyebrow text-[#557064]">Wholesale</p>
        <h1 className="font-display mt-3 text-5xl">Wholesale, made straightforward.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[#68726e]">We work with buyers looking for dependable product, clear quantities and straightforward wholesale purchasing. Set quantities below to calculate order totals.</p>
      </div>
      <div className="admin-panel mt-8 overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-[#f7f9f6] text-xs uppercase tracking-wider text-[#829087]">
            <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Unit Price</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">Order Qty</th><th className="px-4 py-3">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-[#eef1ed]">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><CatalogImage product={p} className="h-12 w-10" /><div><p className="font-semibold">{p.name}</p><p className="mt-0.5 text-xs text-[#829087]">{p.pattern}</p></div></div></td>
                <td className="px-4 py-3 text-xs font-mono">{p.sku}</td>
                <td className="px-4 py-3 font-semibold">{money(p.retail_price)}</td>
                <td className="px-4 py-3">{p.current_stock} suits</td>
                <td className="px-4 py-3">
                  <div className="flex items-center border border-[#d4dbd5]">
                    <button onClick={() => setQty(p.id, getQty(p.id) - 1)} className="flex h-7 w-7 items-center justify-center"><Minus size={12} /></button>
                    <input type="number" value={getQty(p.id)} onChange={(e) => setQty(p.id, parseInt(e.target.value) || 0)} className="w-12 border-x border-[#d4dbd5] py-1 text-center text-sm outline-none" />
                    <button onClick={() => setQty(p.id, getQty(p.id) + 1)} className="flex h-7 w-7 items-center justify-center"><Plus size={12} /></button>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{money(p.retail_price * getQty(p.id))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-[#dfe1da] pt-5">
        <span className="text-sm text-[#68726e]">Wholesale order total</span>
        <span className="text-2xl font-semibold text-[#172420]">{money(grandTotal)}</span>
      </div>
      <div className="mt-12 grid gap-12 md:grid-cols-[.8fr_1fr]">
        <div>
          <p className="eyebrow text-[#557064]">Enquiry</p>
          <h2 className="font-display mt-3 text-3xl leading-tight">Submit your wholesale enquiry.</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#68726e]">Share your business details. The final wholesale terms are kept editable for the business owner.</p>
        </div>
        <form className="border-t border-[#dfe1da] pt-2" onSubmit={submitEnquiry}>
          <label className="mt-5 block text-sm">Business name<input required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} className="mt-2 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>
          <label className="mt-5 block text-sm">Contact person<input required value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="mt-2 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="mt-5 block text-sm">Phone<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>
            <label className="mt-5 block text-sm">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="mt-5 block text-sm">City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-2 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>
            <label className="mt-5 block text-sm">Quantity of sets<input value={form.quantity_sets} onChange={(e) => setForm({ ...form, quantity_sets: e.target.value })} className="mt-2 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>
          </div>
          <label className="mt-5 block text-sm">Products interested in<textarea value={form.products_interested} onChange={(e) => setForm({ ...form, products_interested: e.target.value })} className="mt-2 min-h-28 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" placeholder="Product code or pattern"></textarea></label>
          <button disabled={submitting} className="public-button mt-8">{submitting ? 'Submitting…' : 'Submit Enquiry'}</button>
          {toast && <p className="mt-4 text-sm text-[#3a6d4e]">{toast}</p>}
        </form>
      </div>
    </main>
  );
}

function AboutPage({ navigate, businessConfig }: { navigate: (p: string) => void; businessConfig: BusinessConfig }) {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-24">
      <p className="eyebrow text-[#557064]">About {businessConfig.businessName}</p>
      <h1 className="font-display mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">A clothing business built around product, fabric and dependable service.</h1>
      <p className="mt-7 max-w-lg text-base leading-7 text-[#68726e]">Now moving toward a more organised retail and wholesale experience — with barcode billing, better stock management, and faster checkout.</p>
      <div className="mt-14 grid gap-12 md:grid-cols-[1fr_1fr] md:items-center">
        <div className="photo-frame h-[420px]"><div className="flex h-full w-full items-center justify-center bg-[#ecebe6] text-[10px] font-semibold uppercase tracking-[.16em] text-[#7b817d]">Product Image</div></div>
        <div>
          <h2 className="font-display text-3xl">Retail — Coming Soon</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#68726e]">The retail experience is being developed. We are building a more organised store with barcode billing, better stock management, and faster checkout. The wholesale catalogue is available now.</p>
          <button className="outline-button mt-8" onClick={() => navigate('/wholesale')}>Explore Wholesale <ArrowRight className="ml-2 inline" size={16} /></button>
        </div>
      </div>
    </main>
  );
}

function ContactPage({ businessConfig }: { businessConfig: BusinessConfig }) {
  const [toast, setToast] = useState('');
  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-24">
      <p className="eyebrow text-[#557064]">Contact</p>
      <h1 className="font-display mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">Get in touch.</h1>
      <div className="mt-14 grid max-w-2xl gap-8 border-t border-[#dfe1da] pt-7 text-sm md:grid-cols-4">
        <div><div className="flex items-center gap-1.5 text-[#8a948e]"><MapPin size={13} /><p className="eyebrow">Visit</p></div><p className="mt-2">{businessConfig.address}</p></div>
        <div><div className="flex items-center gap-1.5 text-[#8a948e]"><Phone size={13} /><p className="eyebrow">Call</p></div><p className="mt-2">{businessConfig.phone}</p></div>
        <div><div className="flex items-center gap-1.5 text-[#8a948e]"><MessageCircle size={13} /><p className="eyebrow">WhatsApp</p></div><p className="mt-2">+{businessConfig.whatsappNumber}</p></div>
        <div><div className="flex items-center gap-1.5 text-[#8a948e]"><Mail size={13} /><p className="eyebrow">Email</p></div><p className="mt-2">{businessConfig.email}</p></div>
      </div>
      <form className="mt-14 max-w-lg" onSubmit={(event) => { event.preventDefault(); setToast('Enquiry sent. We will be in touch.'); (event.target as HTMLFormElement).reset(); window.setTimeout(() => setToast(''), 2800); }}>
        <FormField label="Name" /><FormField label="Phone" /><FormField label="Email" />
        <label className="mt-5 block text-sm">Message<textarea required className="mt-2 min-h-28 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" placeholder="Your message"></textarea></label>
        <button className="public-button mt-8">Send Enquiry</button>
        {toast && <p className="mt-4 text-sm text-[#3a6d4e]">{toast}</p>}
      </form>
    </main>
  );
}

function FormField({ label, value, onChange, defaultValue, type = 'text', textarea }: { label: string; value?: string; onChange?: (v: string) => void; defaultValue?: string; type?: string; textarea?: boolean }) {
  if (textarea) return <label className="mt-5 block text-sm">{label}<textarea value={value} defaultValue={defaultValue} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required className="mt-2 min-h-24 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>;
  return <label className="mt-5 block text-sm">{label}<input type={type} value={value} defaultValue={defaultValue} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required className="mt-2 w-full border-b border-[#9aa49d] bg-transparent px-0 py-3 outline-none focus:border-[#172420]" /></label>;
}

function PieceRow({ piece, fabric, qty }: { piece: string; fabric: string; qty: string }) {
  return <div className="grid grid-cols-[70px_1fr_70px] gap-3 border-b border-[#eef0ea] pb-3 text-sm"><span className="font-semibold">{piece}</span><span className="text-[#68726e]">{fabric}</span><span className="text-right text-[#68726e]">{qty}</span></div>;
}

function ProductRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return <div className="mt-4 flex justify-between text-sm first:mt-0"><span className="text-[#68726e]">{label}</span><span className={`${mono ? 'font-mono' : ''} font-semibold ${highlight ? 'text-[#3a6d4e]' : ''}`}>{value}</span></div>;
}

function CatalogImage({ product, className = '' }: { product?: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!product || failed || !product.image_path) return <div className={`flex items-center justify-center bg-[#ecebe6] text-center text-[10px] font-semibold uppercase tracking-[.16em] text-[#7b817d] ${className}`}>Product Image</div>;
  return <img src={product.image_path} alt={product.name} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

export default App;
