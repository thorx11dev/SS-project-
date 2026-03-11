import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';
import { CheckCircle, ArrowLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';
import { HomepageSettings } from '../types';

export const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_zip: formData.zip,
          items: cart,
          total_amount: finalTotal,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        clearCart();
        toast.success('Order placed successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto px-4 text-center bg-[var(--color-card)] p-10 border border-[var(--color-ink)]"
        >
          <div className="w-20 h-20 bg-[var(--color-brand-accent)] text-[var(--color-ink)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight mb-3">Order Confirmed</h1>
          <p className="text-[var(--color-ink)]/70 mb-8 text-sm font-mono leading-relaxed">
            Thank you for your purchase. We've sent a confirmation email to <span className="font-bold text-[var(--color-ink)]">{formData.email}</span>.
          </p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-canvas)] font-mono font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-brand-accent)] hover:text-[var(--color-ink)] transition-colors">
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12 border-b border-[var(--color-ink)] pb-8">
          <button onClick={() => navigate('/cart')} className="p-2 hover:bg-[var(--color-card)] transition-colors text-[var(--color-ink)]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase leading-[0.9]">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-[var(--color-card)] p-6 sm:p-8 border border-[var(--color-ink)] space-y-6">
                <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-ink)] pb-4">
                  <div className="w-10 h-10 bg-[var(--color-canvas)] border border-[var(--color-ink)] flex items-center justify-center text-[var(--color-ink)]">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-xl font-display font-bold uppercase tracking-tight">Shipping Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="input-field bg-[var(--color-canvas)]"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="input-field bg-[var(--color-canvas)]"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    className="input-field bg-[var(--color-canvas)]"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono">Street Address</label>
                  <input 
                    required
                    type="text" 
                    className="input-field bg-[var(--color-canvas)]"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono">City</label>
                    <input 
                      required
                      type="text" 
                      className="input-field bg-[var(--color-canvas)]"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 font-mono">ZIP Code</label>
                    <input 
                      required
                      type="text" 
                      className="input-field bg-[var(--color-canvas)]"
                      value={formData.zip}
                      onChange={e => setFormData({ ...formData, zip: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-card)] p-6 sm:p-8 border border-[var(--color-ink)] space-y-6">
                <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-ink)] pb-4">
                  <div className="w-10 h-10 bg-[var(--color-canvas)] border border-[var(--color-ink)] flex items-center justify-center text-[var(--color-ink)]">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-xl font-display font-bold uppercase tracking-tight">Payment Method</h2>
                </div>
                
                <div className="p-5 border border-[var(--color-ink)] bg-[var(--color-canvas)] flex justify-between items-center cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-white border border-[var(--color-ink)] flex items-center justify-center shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink)]"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <span className="font-mono font-bold text-sm">Cash on Delivery (COD)</span>
                  </div>
                  <CheckCircle size={20} className="text-[var(--color-brand-accent)] fill-[var(--color-ink)]" />
                </div>
                
                <div className="flex items-start gap-3 text-xs font-mono text-[var(--color-ink)]/70 bg-[var(--color-canvas)] p-4 border border-[var(--color-ink)] border-dashed">
                  <ShieldCheck size={16} className="text-[var(--color-ink)] flex-shrink-0 mt-0.5" />
                  <p>Pay with cash upon delivery. No advance payment is required.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 bg-[var(--color-brand-accent)] text-[var(--color-ink)] font-mono font-bold uppercase tracking-widest text-xs border border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-brand-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing...' : `Confirm Order - ${formatCurrency(finalTotal)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <div className="bg-[var(--color-card)] p-8 border border-[var(--color-ink)] sticky top-32">
              <h2 className="text-xl font-display font-bold uppercase tracking-tight mb-6">Your Order</h2>
              
              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.cartItemId} className="flex gap-4">
                    <div className="w-16 h-16 bg-[var(--color-canvas)] flex-shrink-0 border border-[var(--color-ink)] p-1">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-display font-bold text-lg leading-none uppercase mb-1">{item.name}</h4>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink)]/50">Qty: {item.quantity}</p>
                      {item.string_type && (
                        <p className="text-[10px] font-mono text-[var(--color-ink)]/70 mt-1">
                          {item.string_type} @ {item.lbs ? `${item.lbs} lbs` : (item.string_tension && item.string_tension > 28 ? 'MAX' : `${item.string_tension} lbs`)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <p className="font-mono font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-[var(--color-ink)] space-y-4 font-mono text-sm">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
