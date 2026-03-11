import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Mobile Menu Button (Left) */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="text-xs font-bold uppercase tracking-widest">Menu</span>
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group md:flex-1">
            <span className="font-display font-bold text-2xl md:text-3xl tracking-tighter uppercase">KS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest font-bold">
            <Link to="/" className="hover:text-[var(--color-brand-accent)] transition-colors">Home</Link>
            <Link to="/catalog" className="hover:text-[var(--color-brand-accent)] transition-colors">Store</Link>
            <Link to="/order-history" className="hover:text-[var(--color-brand-accent)] transition-colors">History</Link>
            <Link to="/contact" className="hover:text-[var(--color-brand-accent)] transition-colors">Contact</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 md:flex-1 justify-end font-mono text-xs uppercase tracking-widest font-bold">
            <Link to="/catalog" className="hidden md:flex items-center gap-2 hover:text-[var(--color-brand-accent)] transition-colors">
              Store <Search size={16} />
            </Link>
            <Link to="/cart" className="flex items-center gap-2 hover:text-[var(--color-brand-accent)] transition-colors relative">
              Cart <ShoppingCart size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-brand-accent)] text-[var(--color-ink)] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--color-canvas)] border-t border-[var(--color-ink)] overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-6 font-mono text-sm uppercase tracking-widest font-bold">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/catalog" onClick={() => setIsMenuOpen(false)}>Store</Link>
              <Link to="/order-history" onClick={() => setIsMenuOpen(false)}>History</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
