import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

import PageLayout from '../components/PageLayout';

const Receipt = ({ order }) => (
  <div id={`receipt-${order._id}`} className="mt-6 border-2 border-char-950/10 border-dashed rounded-[32px] p-8 text-sm bg-white shadow-inner">
    <div className="flex items-center justify-between border-b border-char-950/5 pb-4">
      <div>
        <p className="font-display text-xl font-bold text-char-950">The Artisan Crust</p>
        <p className="text-xs font-bold text-char-950/30 uppercase tracking-widest">Order receipt</p>
      </div>
      <div className="text-right text-xs font-bold text-char-950/40">
        <p>#{order._id.slice(-6).toUpperCase()}</p>
        <p>{new Date(order.createdAt).toLocaleString()}</p>
      </div>
    </div>

    <div className="mt-6 space-y-3">
      {[
        { label: 'Quantity', val: order.quantity || 1 },
        { label: 'Size', val: order.size?.name },
        { label: 'Thickness', val: order.thickness?.name },
        { label: 'Base', val: order.base?.name },
        { label: 'Sauce', val: order.sauce?.name },
        { label: 'Cheese', val: order.cheese?.name },
        { label: 'Veggies', val: order.vegetables?.map((v) => v.name).join(', ') || 'None' }
      ].map(row => (
        <div key={row.label} className="grid grid-cols-[1fr_2fr] gap-4 border-b border-char-950/5 pb-2 last:border-0">
          <span className="font-bold text-char-950/30 uppercase tracking-widest text-[9px] md:text-[10px] self-start mt-1">{row.label}</span>
          <span className="font-display font-bold text-char-950 text-right break-words">{row.val}</span>
        </div>
      ))}
    </div>

    <div className="mt-6 flex justify-between border-t border-char-950/5 pt-4">
      <span className="font-display text-lg font-bold text-char-950">Total paid</span>
      <span className="font-display text-xl font-black text-tomato">₹{order.totalAmount}</span>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-char-950/30">Payment: {order.paymentStatus}</span>
      <span className="rounded-full bg-tomato/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-tomato">{order.status}</span>
    </div>
  </div>
);

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api
      .get('/orders/my')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = (id) => {
    const content = document.getElementById(`receipt-${id}`)?.outerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Fraunces', serif; padding: 48px; color: #2F1F17; background: #F5E6D3; }
            .receipt { background: white; padding: 40px; border-radius: 32px; border: 2px dashed rgba(47, 31, 23, 0.1); }
          </style>
        </head>
        <body><div class="receipt">${content}</div></body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <PageLayout title="Order history" subtitle="Every pizza you've ordered, with a printable receipt." width="5xl" isFloating>
      {loading ? (
        <p className="text-center py-10 font-display text-xl text-char-950/20 italic">Loading history…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="font-display text-2xl font-bold text-char-950/20 italic">No past orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <div className="group bg-[#FDF2F0] rounded-[40px] p-6 shadow-sm border border-tomato/5 transition-all hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-bold text-char-950 truncate">
                      {order.base?.name || 'Artisan Custom Pizza'} {order.sauce?.name ? `· ${order.sauce.name}` : ''}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-char-950/30">
                      {order.cheese?.name || 'Mozzarella'} {order.vegetables?.length > 0 ? ` · ${order.vegetables.map(v => v.name).join(', ')}` : ' · No extra veg'}
                    </p>
                    <p className="mt-2 text-[10px] font-bold text-char-950/20 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-xl font-black text-tomato">₹{order.totalAmount}</span>
                    <button
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                      className="rounded-full border-2 border-char-950/10 bg-white px-6 py-2 text-[10px] font-black uppercase tracking-widest text-char-950 transition-all hover:border-char-950/30"
                    >
                      {expanded === order._id ? 'Hide' : 'Receipt'}
                    </button>
                  </div>
                </div>

                {expanded === order._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <Receipt order={order} />
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => handlePrint(order._id)}
                        className="btn-primary px-8 py-3 text-xs shadow-lg shadow-tomato/20"
                      >
                        Print / Save PDF
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default OrderHistory;
