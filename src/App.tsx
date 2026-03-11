import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderHistory } from './pages/OrderHistory';
import { Contact } from './pages/Contact';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminOrders } from './pages/admin/Orders';
import { Settings } from './pages/admin/Settings';
import { AdminKeys } from './pages/admin/Keys';
import { AdminLogin } from './pages/admin/AdminLogin';
import { motion, AnimatePresence } from 'motion/react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {isHomePage && <Footer />}
    </div>
  );
};

// Guard that protects all /admin/* routes (except /admin/login)
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-neutral-500 font-mono text-xs uppercase tracking-widest animate-pulse">
          Checking access...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#000',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          }} />
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<UserLayout><Home /></UserLayout>} />
            <Route path="/catalog" element={<UserLayout><Catalog /></UserLayout>} />
            <Route path="/product/:slug" element={<UserLayout><ProductDetail /></UserLayout>} />
            <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
            <Route path="/checkout" element={<UserLayout><Checkout /></UserLayout>} />
            <Route path="/order-history" element={<UserLayout><OrderHistory /></UserLayout>} />
            <Route path="/contact" element={<UserLayout><Contact /></UserLayout>} />

            {/* Admin Login (public) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes (protected) */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="settings" element={<Settings />} />
              <Route path="keys" element={<AdminKeys />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AdminAuthProvider>
  );
}
