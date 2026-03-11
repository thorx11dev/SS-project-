import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils/format';
import { HomepageSettings } from '../types';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();
  const [deliveryCost, setDeliveryCost] = useState(0);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then((data: HomepageSettings) => {
        if (data.delivery_cost) {
          setDeliveryCost(Number(data.delivery_cost));
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const finalTotal = totalPrice + deliveryCost;

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto px-4 text-center"
        >
          <div className="w-24 h-24 bg-[var(--color-card)] flex items-center justify-center mx-auto mb-8 text-[var(--color-ink)]/50">
            <ShoppingCart size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight mb-4">Your cart is empty</h1>
          <p className="text-[var(--color-ink)]/50 mb-10 text-sm font-mono">Looks like you haven't added any gear to your cart yet.</p>
          <Link to="/catalog" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-ink)] text-[var(--color-canvas)] font-mono font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-brand-accent)] hover:text-[var(--color-ink)] transition-colors">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12 border-b border-[var(--color-ink)] pb-8">
          <Link to="/catalog" className="p-2 hover:bg-[var(--color-card)] transition-colors text-[var(--color-ink)]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase leading-[0.9]">Cart</h1>
          <span className="bg-[var(--color-ink)] text-[var(--color-canvas)] text-xs font-mono font-bold px-3 py-1 uppercase tracking-widest ml-4">
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {cart.map(item => (
                <motion.div 
                layout
                key={item.cartItemId} 
                className="bg-[var(--color-canvas)] p-4 sm:p-6 border border-[var(--color-ink)] flex flex-col sm:flex-row gap-6"
              >
                <div className="w-full sm:w-32 h-40 sm:h-32 bg-[var(--color-card)] flex-shrink-0 p-2">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink)]/50 mb-1.5">{item.brand}</p>
                      <h3 className="font-display font-bold text-2xl leading-none uppercase">{item.name}</h3>
                      {item.string_type && (
                        <div className="mt-4 text-xs font-mono text-[var(--color-ink)]/70 space-y-1">
                          <p><span className="font-bold text-[var(--color-ink)]">String:</span> {item.string_type}</p>
                          <p><span className="font-bold text-[var(--color-ink)]">Tension:</span> {item.lbs ? `${item.lbs} lbs` : (item.string_tension && item.string_tension > 28 ? 'MAX' : `${item.string_tension} lbs`)}</p>
                        </div>
                      )}
                    </div>
                    <p className="font-mono font-bold text-lg whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</p>
                  </div>

                  <div className="flex justify-between items-center mt-6 sm:mt-0">
                    <div className="flex items-center gap-1 border border-[var(--color-ink)] p-1">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-canvas)] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-mono font-bold text-sm w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-canvas)] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-[var(--color-ink)]/50 hover:text-[var(--color-ink)] p-2 transition-colors flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[var(--color-card)] p-8 border border-[var(--color-ink)] sticky top-32">
              <h2 className="text-2xl font-display font-bold uppercase mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink)]/70">Product Price</span>
                  <span className="font-bold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink)]/70">Delivery</span>
                  <span className="font-bold">{formatCurrency(deliveryCost)}</span>
                </div>
                
                <div className="pt-6 mt-6 border-t border-[var(--color-ink)] flex justify-between items-end">
                  <div>
                    <span className="block text-[var(--color-ink)]/70 mb-1">Total</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[var(--color-brand-accent)] text-[var(--color-ink)] font-mono font-bold uppercase tracking-widest text-xs border border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-brand-accent)] transition-colors flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout 
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink)]/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
