import React, { useState } from 'react';
import { formatCurrency } from '../utils/format';
import { format } from 'date-fns';
import { Order } from '../types';
import toast from 'react-hot-toast';
import { Package, Search } from 'lucide-react';

export const OrderHistory = () => {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold uppercase italic mb-8">Order History</h1>
        
        <form onSubmit={fetchOrders} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 mb-8 flex gap-4">
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="input-field flex-1"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Search size={18} /> View Orders
          </button>
        </form>

        {loading ? (
          <div className="text-center py-20 text-neutral-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
            <Package size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">No orders found for this email.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                <div className="p-6 bg-neutral-50 border-b border-black/5 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                    <p className="text-sm text-neutral-500">{format(new Date(order.created_at), 'PPPp')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">{formatCurrency(order.total_amount)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Items</h4>
                  <div className="space-y-3">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-neutral-400">× {item.quantity}</span>
                        </div>
                        <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
