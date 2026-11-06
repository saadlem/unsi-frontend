/**
 * Lightweight local API for UNSI frontend development.
 * Default admin: admin / admin123
 */
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'unsi-dev-secret';

const ADMIN = {
  id: '1',
  username: 'admin',
  password: 'admin123',
  name: 'Admin Dev'
};

let siteStatus = { mode: 'live', title: '', message: '', icon: '', color: '' };
let banner = { enabled: false, text: 'Welcome to UNSI', link: '/products' };

let products = [
  {
    id: 1,
    name: 'Bol céramique',
    description: 'Bol artisanal pour un quotidien plus chaleureux',
    price: 189,
    category: 'Home',
    stock: 12,
    image_url: '',
    rating: 4.8,
    active: 1
  },
  {
    id: 2,
    name: 'Tasse saucer',
    description: 'Tasse et soucoupe, détails pensés',
    price: 149,
    category: 'Home',
    stock: 8,
    image_url: '',
    rating: 4.9,
    active: 1
  }
];

let categories = [
  { id: 1, name: 'Home', slug: 'home' },
  { id: 2, name: 'Table', slug: 'table' }
];

let orders = [];
let customers = [
  {
    id: 1,
    name: 'Client Demo',
    email: 'demo@unsi.ma',
    password: 'demo123',
    phone: '',
    created_at: new Date().toISOString()
  }
];
let discounts = [];
let instagramPosts = [];
let nextProductId = 3;
let nextCategoryId = 3;
let nextCustomerId = 2;
let nextDiscountId = 1;
let nextIgId = 1;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function signAdmin(admin) {
  return jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function signCustomer(customer) {
  return jwt.sign(
    { id: customer.id, email: customer.email, role: 'customer' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authOptional(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore invalid token in optional mode
    }
  }
  next();
}

app.use(authOptional);

// SSE notifications
app.get('/api/notifications', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`event: ping\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  const keepAlive = setInterval(() => {
    res.write(`: keepalive\n\n`);
  }, 25000);
  req.on('close', () => clearInterval(keepAlive));
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN.username && password === ADMIN.password) {
    const admin = { id: ADMIN.id, username: ADMIN.username, name: ADMIN.name };
    return res.json({ token: signAdmin(admin), admin });
  }
  return res.status(401).json({ error: 'Identifiants invalides' });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  return res.json({
    admin: { id: ADMIN.id, username: ADMIN.username, name: ADMIN.name }
  });
});

// Customers
app.post('/api/customers/login', (req, res) => {
  const { email, password } = req.body || {};
  const customer = customers.find((c) => c.email === email && c.password === password);
  if (!customer) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  const { password: _, ...safe } = customer;
  return res.json({ token: signCustomer(customer), customer: safe });
});

app.post('/api/customers/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Champs requis manquants' });
  if (customers.some((c) => c.email === email)) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }
  const customer = {
    id: nextCustomerId++,
    name: name || 'Client',
    email,
    password,
    phone: '',
    created_at: new Date().toISOString()
  };
  customers.push(customer);
  const { password: _, ...safe } = customer;
  return res.json({ token: signCustomer(customer), customer: safe });
});

app.get('/api/customers/me', (req, res) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  const customer = customers.find((c) => c.id === req.user.id);
  if (!customer) return res.status(404).json({ error: 'Introuvable' });
  const { password: _, ...safe } = customer;
  return res.json(safe);
});

app.put('/api/customers/me', (req, res) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  const customer = customers.find((c) => c.id === req.user.id);
  if (!customer) return res.status(404).json({ error: 'Introuvable' });
  Object.assign(customer, {
    name: req.body.name ?? customer.name,
    email: req.body.email ?? customer.email,
    phone: req.body.phone ?? customer.phone
  });
  const { password: _, ...safe } = customer;
  return res.json(safe);
});

app.get('/api/customers/orders', (req, res) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  const customer = customers.find((c) => c.id === req.user.id);
  const list = orders.filter((o) => o.email === customer?.email);
  return res.json(list);
});

// Public catalog
app.get('/api/products', (req, res) => {
  let list = products.filter((p) => p.active !== 0);
  if (req.query.category && req.query.category !== 'All') {
    list = list.filter((p) => p.category === req.query.category);
  }
  if (req.query.search) {
    const q = String(req.query.search).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }
  res.json(list);
});

app.get('/api/products/categories', (_req, res) => {
  res.json([...new Set(products.map((p) => p.category))]);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => String(p.id) === String(req.params.id));
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(product);
});

app.get('/api/categories', (_req, res) => res.json(categories));

app.get('/api/site-status', (_req, res) => res.json(siteStatus));
app.get('/api/banner', (_req, res) => res.json(banner));
app.get('/api/instagram-posts', (_req, res) =>
  res.json(instagramPosts.filter((p) => p.active !== 0))
);

app.post('/api/orders', (req, res) => {
  const order = {
    id: randomUUID(),
    order_number: `UNSI-${Date.now().toString().slice(-6)}`,
    ...req.body,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  orders.unshift(order);
  res.status(201).json(order);
});

app.get('/api/orders/track/:num', (req, res) => {
  const order = orders.find(
    (o) => o.order_number === req.params.num || o.id === req.params.num
  );
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  res.json(order);
});

app.post('/api/discounts/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body || {};
  const discount = discounts.find(
    (d) => d.code?.toLowerCase() === String(code || '').toLowerCase() && d.active !== 0
  );
  if (!discount) return res.status(404).json({ error: 'Code invalide' });
  const amount =
    discount.type === 'percent'
      ? (Number(subtotal) * Number(discount.value)) / 100
      : Number(discount.value);
  res.json({
    discount: {
      code: discount.code,
      type: discount.type,
      value: discount.value,
      amount
    }
  });
});

// Admin
app.get('/api/admin/site-status', (_req, res) => res.json(siteStatus));
app.put('/api/admin/site-status', (req, res) => {
  siteStatus = { ...siteStatus, ...req.body };
  res.json(siteStatus);
});

app.get('/api/admin/banner', (_req, res) => res.json(banner));
app.put('/api/admin/banner', (req, res) => {
  banner = { ...banner, ...req.body };
  res.json(banner);
});

app.get('/api/admin/products', (_req, res) => res.json(products));
app.post('/api/admin/products', (req, res) => {
  const product = { id: nextProductId++, active: 1, stock: 0, ...req.body };
  products.push(product);
  res.status(201).json(product);
});
app.put('/api/admin/products/:id', (req, res) => {
  const idx = products.findIndex((p) => String(p.id) === String(req.params.id));
  if (idx < 0) return res.status(404).json({ error: 'Introuvable' });
  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  res.json(products[idx]);
});
app.put('/api/admin/products/:id/stock', (req, res) => {
  const product = products.find((p) => String(p.id) === String(req.params.id));
  if (!product) return res.status(404).json({ error: 'Introuvable' });
  product.stock = Number(req.body.stock);
  res.json(product);
});
app.delete('/api/admin/products/:id', (req, res) => {
  products = products.filter((p) => String(p.id) !== String(req.params.id));
  res.json({ success: true });
});

app.post('/api/admin/upload', (_req, res) => {
  res.json({
    url: 'https://via.placeholder.com/600x600.png?text=UNSI'
  });
});

app.get('/api/admin/categories', (_req, res) => res.json(categories));
app.post('/api/admin/categories', (req, res) => {
  const cat = { id: nextCategoryId++, ...req.body };
  categories.push(cat);
  res.status(201).json(cat);
});
app.put('/api/admin/categories/:id', (req, res) => {
  const idx = categories.findIndex((c) => String(c.id) === String(req.params.id));
  if (idx < 0) return res.status(404).json({ error: 'Introuvable' });
  categories[idx] = { ...categories[idx], ...req.body, id: categories[idx].id };
  res.json(categories[idx]);
});
app.delete('/api/admin/categories/:id', (req, res) => {
  categories = categories.filter((c) => String(c.id) !== String(req.params.id));
  res.json({ success: true });
});

app.get('/api/admin/orders', (req, res) => {
  let list = orders;
  if (req.query.status && req.query.status !== 'all') {
    list = list.filter((o) => o.status === req.query.status);
  }
  res.json(list);
});

app.get('/api/admin/orders/stats', (_req, res) => {
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString(),
      revenue: 0,
      orders: 0
    });
  }
  res.json({
    totalOrders,
    totalRevenue: revenue,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
    totalProducts: products.length,
    lowStock: products.filter((p) => Number(p.stock) <= 5).length,
    recentOrders: orders.slice(0, 5),
    revenueByDay: days,
    topProducts: products.slice(0, 3).map((p) => ({
      product_name: p.name,
      total_sold: 1,
      revenue: Number(p.price) || 0
    })),
    statusCounts: {
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length
    }
  });
});

app.get('/api/admin/orders/:id', (req, res) => {
  const order = orders.find((o) => String(o.id) === String(req.params.id));
  if (!order) return res.status(404).json({ error: 'Introuvable' });
  res.json(order);
});
app.put('/api/admin/orders/:id', (req, res) => {
  const idx = orders.findIndex((o) => String(o.id) === String(req.params.id));
  if (idx < 0) return res.status(404).json({ error: 'Introuvable' });
  orders[idx] = { ...orders[idx], ...req.body, id: orders[idx].id };
  res.json(orders[idx]);
});
app.delete('/api/admin/orders/:id', (req, res) => {
  orders = orders.filter((o) => String(o.id) !== String(req.params.id));
  res.json({ success: true });
});

app.get('/api/admin/discounts', (_req, res) => res.json(discounts));
app.post('/api/admin/discounts', (req, res) => {
  const discount = { id: nextDiscountId++, active: 1, ...req.body };
  discounts.push(discount);
  res.status(201).json(discount);
});
app.put('/api/admin/discounts/:id', (req, res) => {
  const idx = discounts.findIndex((d) => String(d.id) === String(req.params.id));
  if (idx < 0) return res.status(404).json({ error: 'Introuvable' });
  discounts[idx] = { ...discounts[idx], ...req.body, id: discounts[idx].id };
  res.json(discounts[idx]);
});
app.delete('/api/admin/discounts/:id', (req, res) => {
  discounts = discounts.filter((d) => String(d.id) !== String(req.params.id));
  res.json({ success: true });
});
app.post('/api/admin/discounts/:id/send', (_req, res) =>
  res.json({ sent: 0, total: 0 })
);

app.get('/api/admin/instagram/config', (_req, res) =>
  res.json({ configured: false })
);
app.post('/api/admin/instagram/sync', (_req, res) =>
  res.json({ synced: 0, posts: [] })
);
app.get('/api/admin/instagram-posts', (_req, res) => res.json(instagramPosts));
app.post('/api/admin/instagram-posts', (req, res) => {
  const post = { id: nextIgId++, active: 1, ...req.body };
  instagramPosts.push(post);
  res.status(201).json(post);
});
app.put('/api/admin/instagram-posts/:id', (req, res) => {
  const idx = instagramPosts.findIndex((p) => String(p.id) === String(req.params.id));
  if (idx < 0) return res.status(404).json({ error: 'Introuvable' });
  instagramPosts[idx] = { ...instagramPosts[idx], ...req.body, id: instagramPosts[idx].id };
  res.json(instagramPosts[idx]);
});
app.delete('/api/admin/instagram-posts/:id', (req, res) => {
  instagramPosts = instagramPosts.filter((p) => String(p.id) !== String(req.params.id));
  res.json({ success: true });
});

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, admin: 'admin / admin123' })
);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UNSI local API on http://127.0.0.1:${PORT}`);
  console.log('Admin login: admin / admin123');
});
