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
    name: 'Mug blush',
    description: 'Mug en céramique rose doux pour les matins lents et les cafés partagés.',
    price: 129,
    category: 'Table',
    stock: 24,
    image: 'assets/products/mug.jpg',
    image_url: 'assets/products/mug.jpg',
    rating: 4.9,
    active: 1
  },
  {
    id: 2,
    name: 'Bol céramique crème',
    description: 'Bol artisanal à bord rose, parfait pour un petit-déjeuner plus chaleureux.',
    price: 159,
    category: 'Table',
    stock: 18,
    image: 'assets/products/bowl.jpg',
    image_url: 'assets/products/bowl.jpg',
    rating: 4.8,
    active: 1
  },
  {
    id: 3,
    name: 'Vase solitaire',
    description: 'Petit vase en grès rose pour une fleur, ou simplement pour la beauté du geste.',
    price: 189,
    category: 'Déco',
    stock: 14,
    image: 'assets/products/vase.jpg',
    image_url: 'assets/products/vase.jpg',
    rating: 4.7,
    active: 1
  },
  {
    id: 4,
    name: 'Bougie céramique',
    description: 'Bougie soja dans un pot céramique blush, à réutiliser ensuite comme joli objet.',
    price: 149,
    category: 'Ambiance',
    stock: 30,
    image: 'assets/products/candle.jpg',
    image_url: 'assets/products/candle.jpg',
    rating: 4.9,
    active: 1
  },
  {
    id: 5,
    name: 'Assiettes duo',
    description: 'Deux assiettes crème et rose pour célébrer la table du quotidien.',
    price: 249,
    category: 'Table',
    stock: 12,
    image: 'assets/products/plates.jpg',
    image_url: 'assets/products/plates.jpg',
    rating: 4.8,
    active: 1
  },
  {
    id: 6,
    name: 'Plaid lin blush',
    description: 'Plaid en lin doux, à poser sur le canapé ou le lit pour un coin plus personnel.',
    price: 329,
    category: 'Textile',
    stock: 9,
    image: 'assets/products/throw.jpg',
    image_url: 'assets/products/throw.jpg',
    rating: 4.6,
    active: 1
  },
  {
    id: 7,
    name: 'Plateau service',
    description: 'Plateau bois clair avec tasses céramique pour les pauses thé improvisées.',
    price: 279,
    category: 'Table',
    stock: 11,
    image: 'assets/products/tray.jpg',
    image_url: 'assets/products/tray.jpg',
    rating: 4.7,
    active: 1
  },
  {
    id: 8,
    name: 'Pichet rose',
    description: 'Pichet céramique pour l’eau, le jus ou simplement comme pièce déco.',
    price: 219,
    category: 'Table',
    stock: 10,
    image: 'assets/products/pitcher.jpg',
    image_url: 'assets/products/pitcher.jpg',
    rating: 4.8,
    active: 1
  },
  {
    id: 9,
    name: 'Tasse espresso & soucoupe',
    description: 'Duo espresso blush pour les moments courts mais précieux.',
    price: 119,
    category: 'Table',
    stock: 22,
    image: 'assets/products/espresso.jpg',
    image_url: 'assets/products/espresso.jpg',
    rating: 4.9,
    active: 1
  },
  {
    id: 10,
    name: 'Bocal cuisine',
    description: 'Bocal céramique à couvercle pour le sucre, le café, ou ce que vous aimez.',
    price: 169,
    category: 'Cuisine',
    stock: 16,
    image: 'assets/products/jar.jpg',
    image_url: 'assets/products/jar.jpg',
    rating: 4.7,
    active: 1
  },
  {
    id: 11,
    name: 'Mug édition limitée',
    description: 'Petite série du mug blush — stock volontairement limité.',
    price: 139,
    category: 'Table',
    stock: 4,
    image: 'assets/products/mug.jpg',
    image_url: 'assets/products/mug.jpg',
    rating: 5,
    active: 1
  },
  {
    id: 12,
    name: 'Vase & bougie duo',
    description: 'Ambiance douce : vase solitaire et bougie céramique pour un coin plus vivant.',
    price: 299,
    category: 'Ambiance',
    stock: 7,
    image: 'assets/products/candle.jpg',
    image_url: 'assets/products/candle.jpg',
    rating: 4.8,
    active: 1
  }
];

let categories = [
  { id: 1, name: 'Table', slug: 'table' },
  { id: 2, name: 'Déco', slug: 'deco' },
  { id: 3, name: 'Ambiance', slug: 'ambiance' },
  { id: 4, name: 'Textile', slug: 'textile' },
  { id: 5, name: 'Cuisine', slug: 'cuisine' }
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
let nextProductId = 13;
let nextCategoryId = 6;
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

function mapProduct(p) {
  const image = p.image || p.image_url || '';
  const stock = Number(p.stock) || 0;
  return {
    ...p,
    image,
    image_url: p.image_url || image,
    stock,
    inStock: stock > 0,
    rating: Number(p.rating) || 0
  };
}

// Public catalog
app.get('/api/products', (req, res) => {
  let list = products.filter((p) => p.active !== 0).map(mapProduct);
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
  res.json(mapProduct(product));
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
