import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Home, ArrowLeft, LogOut, Menu, X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Home, label: 'Settings', path: '/admin/settings' },
    { icon: Key, label: 'Keys', path: '/admin/keys' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-8">
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-display font-bold text-lg">
            KS
          </div>
          <span className="font-display font-bold text-lg tracking-tighter uppercase">Admin</span>
        </Link>

        <nav className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-brand-accent text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
              >
                <Icon size={20} />
                <span className="text-sm uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-4">
        <Link to="/" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors text-sm uppercase tracking-widest">
          <ArrowLeft size={18} /> Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-neutral-400 hover:text-red-500 transition-colors text-sm uppercase tracking-widest"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-display font-bold text-lg">
            KS
          </div>
          <span className="font-display font-bold text-lg tracking-tighter uppercase">Admin</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
          <Menu size={24} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-black text-white flex-col fixed inset-y-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-black text-white flex flex-col z-[70] lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-neutral-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
};
