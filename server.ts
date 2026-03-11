import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database("sports_store.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price REAL NOT NULL,
    category_id INTEGER,
    brand TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    weight TEXT,
    grip_size TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    string_type TEXT,
    string_tension INTEGER,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  CREATE TABLE IF NOT EXISTS homepage_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS strings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);

// Add new columns to existing tables if they don't exist
try { db.exec("ALTER TABLE products ADD COLUMN weight TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN grip_size TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN lbs INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN images TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN custom_strings TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE categories ADD COLUMN brands TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE order_items ADD COLUMN string_type TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE order_items ADD COLUMN string_tension INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN customer_phone TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN shipping_address TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN shipping_city TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN shipping_zip TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN specifications TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE categories ADD COLUMN image_url TEXT"); } catch (e) {}

// Seed initial data if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  // ... existing category seeding ...
  const insertCategory = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
  insertCategory.run("Rackets", "rackets");
  insertCategory.run("Shuttlecocks", "shuttlecocks");
  insertCategory.run("Shoes", "shoes");
  insertCategory.run("Apparel", "apparel");
  insertCategory.run("Accessories", "accessories");

  const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, description, price, category_id, brand, image_url, stock, is_featured, weight, grip_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Rackets
  insertProduct.run("Yonex Astrox 99 Pro", "yonex-astrox-99-pro", "Power-oriented racket for aggressive players. Features high-modulus carbon fiber for maximum smash power.", 220.00, 1, "Yonex", "https://images.unsplash.com/photo-1617083270615-38505039f97e?auto=format&fit=crop&w=800&q=80", 15, 1, "4U", "G5");
  insertProduct.run("Victor Thruster F Enhanced", "victor-thruster-f", "Excellent control and power combination. Used by top international professionals.", 195.00, 1, "Victor", "https://images.unsplash.com/photo-1626225967045-9410dd991456?auto=format&fit=crop&w=800&q=80", 10, 1, "3U", "G5");
  insertProduct.run("Li-Ning Tectonic 9", "li-ning-tectonic-9", "Flexible and powerful for quick responses. Features Tectonic technology for enhanced frame stability.", 210.00, 1, "Li-Ning", "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=800&q=80", 8, 0, "4U", "G6");

  // Shoes
  insertProduct.run("Yonex Power Cushion 65 Z3", "yonex-pc-65-z3", "The choice of professionals for comfort and grip. Features Power Cushion+ technology for superior shock absorption.", 140.00, 3, "Yonex", "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80", 20, 1, null, null);
  insertProduct.run("Victor P9200II", "victor-p9200", "Stable and durable court shoes. Designed for intense lateral movements and foot protection.", 125.00, 3, "Victor", "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80", 12, 0, null, null);

  // Shuttlecocks
  insertProduct.run("Yonex AS-50 Feather", "yonex-as50", "Tournament grade feather shuttlecocks. Exceptional flight stability and durability.", 35.00, 2, "Yonex", "https://images.unsplash.com/photo-1617332761373-049830560232?auto=format&fit=crop&w=800&q=80", 100, 1, null, null);

  // Apparel (Men's Sports)
  insertProduct.run("Pro Dry-Fit Jersey", "pro-dry-fit-jersey", "Breathable and moisture-wicking sports jersey for intense training sessions.", 45.00, 4, "Student Sports", "https://images.unsplash.com/photo-1517438476312-10d79c67750d?auto=format&fit=crop&w=800&q=80", 50, 0, null, null);
  insertProduct.run("Elite Training Shorts", "elite-training-shorts", "Lightweight and flexible shorts designed for maximum range of motion on the court.", 35.00, 4, "Student Sports", "https://images.unsplash.com/photo-1591117207239-788cd8591fb7?auto=format&fit=crop&w=800&q=80", 40, 0, null, null);
}

const settingsCount = db.prepare("SELECT COUNT(*) as count FROM homepage_settings").get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare("INSERT INTO homepage_settings (key, value) VALUES (?, ?)");
  insertSetting.run("hero_image", "https://images.unsplash.com/photo-1626225967045-9410dd991456?auto=format&fit=crop&w=1920&q=80");
  insertSetting.run("category_rackets_image", "https://images.unsplash.com/photo-1617083270615-38505039f97e?auto=format&fit=crop&w=800&q=80");
  insertSetting.run("category_shoes_image", "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80");
  insertSetting.run("category_apparel_image", "https://images.unsplash.com/photo-1517438476312-10d79c67750d?auto=format&fit=crop&w=400&q=80");
  insertSetting.run("performance_image", "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=800&q=80");
  insertSetting.run("delivery_cost", "0");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Configure Multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });

  // Serve static files from public
  app.use("/uploads", express.static(uploadsDir));

  // API Routes
  
  // Upload Endpoint
  app.post("/api/admin/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  // Settings
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM homepage_settings").all();
    const settingsMap = (settings as any[]).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  });

  app.post("/api/admin/settings", (req, res) => {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: "Invalid settings data" });
    }
    console.log("Updating settings:", settings);
    
    try {
      const updateSetting = db.prepare("INSERT OR REPLACE INTO homepage_settings (key, value) VALUES (?, ?)");
      
      const transaction = db.transaction((settingsObj) => {
        for (const [key, value] of Object.entries(settingsObj)) {
          if (value !== undefined && value !== null) {
            updateSetting.run(key, String(value));
          }
        }
      });

      transaction(settings);
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error updating settings:", e);
      res.status(400).json({ error: e.message });
    }
  });
  
  // Strings
  app.get("/api/strings", (req, res) => {
    const strings = db.prepare("SELECT * FROM strings").all();
    res.json(strings);
  });

  app.post("/api/admin/strings", (req, res) => {
    const { name, price } = req.body;
    try {
      const info = db.prepare("INSERT INTO strings (name, price) VALUES (?, ?)").run(name, price);
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/strings/:id", (req, res) => {
    const { name, price } = req.body;
    try {
      db.prepare("UPDATE strings SET name = ?, price = ? WHERE id = ?").run(name, price, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/admin/strings/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM strings WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Categories
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/admin/categories", (req, res) => {
    const { name, slug, brands, image_url } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name, slug, brands, image_url) VALUES (?, ?, ?, ?)").run(name, slug, brands || null, image_url || null);
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/categories/:id", (req, res) => {
    const { name, slug, brands, image_url } = req.body;
    try {
      db.prepare("UPDATE categories SET name = ?, slug = ?, brands = ?, image_url = ? WHERE id = ?").run(name, slug, brands || null, image_url || null, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/admin/categories/:id", (req, res) => {
    try {
      const transaction = db.transaction(() => {
        // Find all products in this category
        const products = db.prepare("SELECT id FROM products WHERE category_id = ?").all(req.params.id) as { id: number }[];
        
        for (const product of products) {
          db.prepare("DELETE FROM order_items WHERE product_id = ?").run(product.id);
          db.prepare("DELETE FROM reviews WHERE product_id = ?").run(product.id);
        }

        // Delete all products in this category
        db.prepare("DELETE FROM products WHERE category_id = ?").run(req.params.id);
        // Then delete the category itself
        db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
      });
      transaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Products
  app.get("/api/products", (req, res) => {
    const { category, brand, search, featured, page, limit, sort, weight, grip_size } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += " AND c.slug = ?";
      params.push(category);
    }
    if (brand) {
      query += " AND p.brand = ?";
      params.push(brand);
    }
    if (weight) {
      query += " AND p.weight = ?";
      params.push(weight);
    }
    if (grip_size) {
      query += " AND p.grip_size = ?";
      params.push(grip_size);
    }
    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      query += " AND p.is_featured = 1";
    }

    if (sort === 'price_asc') {
      query += " ORDER BY p.price ASC";
    } else if (sort === 'price_desc') {
      query += " ORDER BY p.price DESC";
    } else if (sort === 'newest') {
      query += " ORDER BY p.id DESC";
    } else {
      query += " ORDER BY p.id DESC"; // Default sort
    }

    if (page && limit) {
      // Count total for pagination
      const countQuery = `SELECT COUNT(*) as total FROM (${query.split(' ORDER BY')[0]})`;
      const totalResult = db.prepare(countQuery).get(...params) as { total: number };
      const total = totalResult.total;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 12;
      const offset = (pageNum - 1) * limitNum;

      query += " LIMIT ? OFFSET ?";
      params.push(limitNum, offset);

      const products = db.prepare(query).all(...params);
      
      res.json({
        products,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } else {
      const products = db.prepare(query).all(...params);
      res.json(products);
    }
  });

  app.get("/api/products/:slug", (req, res) => {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = ?
    `).get(req.params.slug);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Reviews
  app.get("/api/products/:id/reviews", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(reviews);
  });

  app.post("/api/products/:id/reviews", (req, res) => {
    const { customer_name, rating, comment } = req.body;
    const product_id = req.params.id;

    if (!customer_name || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid review data" });
    }

    try {
      const info = db.prepare(`
        INSERT INTO reviews (product_id, customer_name, rating, comment)
        VALUES (?, ?, ?, ?)
      `).run(product_id, customer_name, rating, comment);
      
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Admin: Product Management
  app.post("/api/admin/products", (req, res) => {
    const { name, slug, description, price, category_id, brand, image_url, images, custom_strings, stock, is_featured, weight, grip_size, lbs, specifications } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO products (name, slug, description, price, category_id, brand, image_url, images, custom_strings, stock, is_featured, weight, grip_size, lbs, specifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, slug, description, price, category_id, brand, image_url, images || null, custom_strings || null, stock, is_featured ? 1 : 0, weight || null, grip_size || null, lbs || null, specifications || null);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      console.error("Error creating product:", e);
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/products/:id", (req, res) => {
    const { name, slug, description, price, category_id, brand, image_url, images, custom_strings, stock, is_featured, weight, grip_size, lbs, specifications } = req.body;
    try {
      db.prepare(`
        UPDATE products 
        SET name = ?, slug = ?, description = ?, price = ?, category_id = ?, brand = ?, image_url = ?, images = ?, custom_strings = ?, stock = ?, is_featured = ?, weight = ?, grip_size = ?, lbs = ?, specifications = ?
        WHERE id = ?
      `).run(name, slug, description, price, category_id, brand, image_url, images || null, custom_strings || null, stock, is_featured ? 1 : 0, weight || null, grip_size || null, lbs || null, specifications || null, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error updating product:", e);
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    try {
      const transaction = db.transaction(() => {
        db.prepare("DELETE FROM order_items WHERE product_id = ?").run(req.params.id);
        db.prepare("DELETE FROM reviews WHERE product_id = ?").run(req.params.id);
        db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      });
      transaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Orders
  app.get("/api/orders", (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const orders = db.prepare("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC").all(email) as any[];
    
    // Fetch items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name as product_name, p.lbs 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    
    res.json(ordersWithItems);
  });

  app.post("/api/orders", (req, res) => {
    const { customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, items, total_amount } = req.body;
    
    const transaction = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO orders (customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, total_amount);
      
      const orderId = info.lastInsertRowid;
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price, string_type, string_tension)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const item of items) {
        insertItem.run(orderId, item.id, item.quantity, item.price, item.string_type || null, item.string_tension || null);
      }
      
      return orderId;
    });

    try {
      const orderId = transaction();
      res.json({ id: orderId });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/admin/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as any[];
    
    // Fetch items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name as product_name, p.lbs 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    
    res.json(ordersWithItems);
  });

  app.put("/api/admin/orders/:id/status", (req, res) => {
    const { status } = req.body;
    try {
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id) as any;
      if (!order) return res.status(404).json({ error: "Order not found" });

      const oldStatus = order.status;
      
      const transaction = db.transaction(() => {
        db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
        
        if (oldStatus !== 'completed' && status === 'completed') {
          const items = db.prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?").all(req.params.id) as any[];
          const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
          for (const item of items) {
            updateStock.run(item.quantity, item.product_id);
          }
        }
      });
      transaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    const totalSales = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'").get() as any;
    const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
    const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
    const lowStock = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock < 5").get() as any;

    res.json({
      totalSales: totalSales?.total || 0,
      orderCount: orderCount.count,
      productCount: productCount.count,
      lowStock: lowStock.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
