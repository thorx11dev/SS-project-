# Sports Store - Full-Stack E-commerce App

A full-stack e-commerce application for a sports store (badminton gear: rackets, shuttlecocks, shoes, apparel). Features a customer-facing storefront and an admin dashboard.

## Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, React Router v7, Recharts, Lucide React, Motion
- **Backend**: Express (Node.js), Better-SQLite3, Multer (file uploads)
- **Build Tool**: Vite 6
- **Runtime**: `tsx server.ts` — Express serves Vite middleware in dev mode; serves `dist/` in production
- **Database**: SQLite via `better-sqlite3` (file: `sports_store.db`)
- **AI**: Google Gemini SDK (`@google/genai`)

## Project Structure

```
/
├── server.ts          # Express backend + Vite dev middleware
├── vite.config.ts     # Vite configuration
├── src/
│   ├── App.tsx        # Main app with React Router routes
│   ├── main.tsx       # React entry point
│   ├── types.ts       # TypeScript interfaces
│   ├── index.css      # Global styles
│   ├── components/    # Reusable UI components
│   ├── context/       # React Context (CartContext)
│   ├── pages/         # Route pages (Home, Catalog, Cart, Checkout, etc.)
│   │   └── admin/     # Admin dashboard pages
│   └── utils/         # Helper functions (format.ts)
├── uploads/           # Uploaded product images (auto-created)
└── sports_store.db    # SQLite database (auto-created)
```

## Running the App

- **Dev**: `npm run dev` — runs `tsx server.ts`, serves on port 5000
- **Build**: `npm run build` — Vite build to `dist/`
- **Production**: `node --import tsx/esm server.ts` with `NODE_ENV=production`

## Key Features

- Customer storefront: Home, Catalog, Product Detail, Cart, Checkout, Order History, Contact
- Admin dashboard: Products, Categories, Orders, Settings (homepage content)
- File upload for product images
- Google Gemini AI integration
- SQLite database with: categories, products, orders, order_items, homepage_settings, strings, reviews

## Environment Variables

- `GEMINI_API_KEY` — Required for Gemini AI features
- `APP_URL` — App URL (used for self-referential links)
- `PORT` — Server port (defaults to 5000)
