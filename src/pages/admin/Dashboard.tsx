import React, { useEffect, useState } from 'react';
import { DashboardStats, Order } from '../../types';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const fetchData = async (selectedFilter: string) => {
    const [statsRes, ordersRes] = await Promise.all([
      fetch(`/api/admin/stats?filter=${selectedFilter}`),
      fetch(`/api/admin/orders?filter=${selectedFilter}`)
    ]);
    const statsData = await statsRes.json();
    const ordersData = await ordersRes.json();
    setStats(statsData);
    setRecentOrders(ordersData.slice(0, 5));
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  if (!stats) return <div className="p-8 text-center">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: stats.orderCount, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Products', value: stats.productCount, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // Mock chart data - replace with real data from backend if available
  const chartData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase italic">Dashboard</h1>
          <p className="text-neutral-500 text-sm">Overview of your business performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-black/5">
          {(['daily', 'weekly', 'monthly'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <div className={`${card.bg} ${card.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} />
              </div>
              <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-1">{card.label}</p>
              <p className="text-2xl font-display font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
        <h2 className="text-lg font-display font-bold uppercase mb-6">Revenue Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
              <YAxis stroke="#a3a3a3" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#000" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <h2 className="text-lg font-display font-bold uppercase">Recent Orders</h2>
          <button className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">#ORD-{order.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-xs">{order.customer_name}</p>
                    <p className="text-[10px] text-neutral-500">{order.customer_email}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-500">
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 font-bold text-xs">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
