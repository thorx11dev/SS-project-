import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { format } from 'date-fns';
import { Search, Eye, Filter, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success(`Order #${orderId} status updated to ${newStatus}`);
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update order status');
      }
    } catch (e) {
      toast.error('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#ORD-${order.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase italic">Orders</h1>
          <p className="text-neutral-500 text-sm">Track and manage customer orders.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="input-field py-2 pl-12" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <select 
              className="input-field py-2 pl-12 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-8 py-6 font-mono text-sm">#ORD-{order.id.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm">{order.customer_name}</p>
                      <p className="text-xs text-neutral-500">{order.customer_email}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-neutral-500">
                      {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-8 py-6 font-bold text-sm">{formatCurrency(order.total_amount)}</td>
                    <td className="px-8 py-6">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-0 cursor-pointer focus:ring-2 focus:ring-black/5 appearance-none ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'
                        } ${updatingId === order.id ? 'opacity-50' : ''}`}
                      >
                        <option value="pending" className="bg-white text-black">Pending</option>
                        <option value="completed" className="bg-white text-black">Completed</option>
                        <option value="cancelled" className="bg-white text-black">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-neutral-500 italic">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[70] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-neutral-50/50">
                <div>
                  <h2 className="text-xl font-display font-bold uppercase italic">Order Details</h2>
                  <p className="text-sm text-neutral-500 font-mono mt-1">#ORD-{selectedOrder.id.toString().padStart(4, '0')}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-black/5">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Customer Information</h3>
                    <p className="font-bold text-sm">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-neutral-500">{selectedOrder.customer_email}</p>
                    {selectedOrder.customer_phone && <p className="text-sm text-neutral-500">{selectedOrder.customer_phone}</p>}
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-black/5">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Order Information</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-500">Date:</span>
                      <span className="font-medium">{format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Status:</span>
                      <span className="capitalize font-medium">{selectedOrder.status}</span>
                    </div>
                  </div>
                </div>

                {(selectedOrder.shipping_address || selectedOrder.shipping_city || selectedOrder.shipping_zip) && (
                  <div className="mb-8 p-4 bg-neutral-50 rounded-2xl border border-black/5">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Shipping Address</h3>
                    <p className="text-sm font-medium">{selectedOrder.shipping_address}</p>
                    <p className="text-sm text-neutral-500">
                      {[selectedOrder.shipping_city, selectedOrder.shipping_zip].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}

                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-black/5">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.product_name}</p>
                        <p className="text-xs text-neutral-500 mt-1">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                        
                        {(item.string_type || item.string_tension) && (
                          <div className="mt-2 pt-2 border-t border-black/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Custom Stringing</p>
                            <div className="flex gap-4 text-xs">
                              {item.string_type && <p><span className="text-neutral-500">String:</span> {item.string_type}</p>}
                              {item.string_tension && <p><span className="text-neutral-500">Tension:</span> {item.lbs ? `${item.lbs} lbs` : (item.string_tension > 28 ? 'MAX' : `${item.string_tension} lbs`)}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-sm font-mono">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Total Amount</p>
                  <p className="text-2xl font-display font-bold">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
