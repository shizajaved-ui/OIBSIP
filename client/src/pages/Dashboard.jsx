import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PizzaVisualizer from '../components/PizzaVisualizer';

import PageLayout from '../components/PageLayout';

const STATUS_STEPS = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

const StatusTracker = ({ status }) => {
  const activeIndex = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-2">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
              i <= activeIndex ? 'bg-tomato text-white shadow-glow' : 'bg-char-700 text-muted'
            }`}
          >
            {i + 1}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 rounded ${i < activeIndex ? 'bg-tomato' : 'bg-char-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 5s so status updates from the admin panel show up live
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout width="5xl" isFloating>
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-tomato/5 p-6 md:p-8 rounded-[32px]">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl md:text-3xl">
            🍕
          </span>
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-black tracking-tight text-char-950">
              Hey, {user?.name?.split(' ')[0]}
            </h1>
            <p className="mt-0.5 md:mt-1 text-[10px] md:text-sm font-bold text-char-950/40 uppercase tracking-widest">
              {user?.isVerified ? (
                <span className="text-basil">✓ Email verified</span>
              ) : (
                'Verify your email link'
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link to="/menu" className="btn-primary w-full sm:w-auto text-center px-8 py-4 text-base md:text-lg shadow-xl shadow-tomato/20">
            View Menu
          </Link>
          <Link to="/build" className="rounded-full border-2 border-char-950/10 bg-white w-full sm:w-auto text-center px-8 py-4 text-base md:text-lg font-black uppercase tracking-widest text-char-950 transition hover:border-char-950/30 active:scale-95 shadow-lg">
            + Custom
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10 font-display text-xl text-char-950/20 italic">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 md:p-16 text-center bg-white shadow-sm border-none">
          <p className="font-display text-xl md:text-2xl font-bold text-char-950">No orders yet</p>
          <p className="text-base md:text-lg text-muted">Your first custom pizza is a few taps away.</p>
          <Link to="/build" className="btn-primary mt-6 px-10 py-4 w-full md:w-auto">
            Build a pizza
          </Link>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="card p-6 md:p-8 bg-char-900 shadow-sm border-none border-l-8 border-l-tomato"
            >
              <div className="mb-4 md:mb-6 flex flex-wrap items-start justify-between gap-4 md:gap-6">
                <div className="flex gap-4 md:gap-6 flex-1 min-w-0">
                  <div className="hidden sm:block shrink-0 scale-75 -ml-8 -mt-8">
                     <PizzaVisualizer selection={order} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg md:text-2xl font-bold text-char-950 truncate">
                      {order.base?.name || 'Artisan Custom Pizza'}
                    </p>
                    <p className="mt-1 text-[10px] md:text-sm font-bold text-char-950/40 uppercase tracking-widest leading-relaxed">
                      {order.sauce?.name ? `${order.sauce.name}` : ''}
                      {order.cheese?.name ? ` · ${order.cheese.name}` : ''}
                      {order.vegetables?.length > 0 ? ` · ${order.vegetables.map(v => v.name).join(', ')}` : ' · No extra toppings'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-lg md:text-2xl font-black text-tomato">₹{order.totalAmount}</p>
                  <p className="text-[10px] md:text-xs font-bold text-char-950/30">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <StatusTracker status={order.status} />
              <p className="mt-4 text-right text-[10px] md:text-xs font-black uppercase tracking-widest text-tomato">{order.status}</p>
            </motion.div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;
