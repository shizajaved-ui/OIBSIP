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
    <div className="flex items-center gap-2 mt-2">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center gap-1.5 md:gap-2">
          <div
            className={`flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full text-[10px] md:text-xs font-black transition-all duration-500 ${
              i <= activeIndex
                ? 'bg-tomato text-white shadow-[0_4px_12px_rgba(200,78,41,0.4)] scale-110'
                : 'bg-char-950/10 text-char-950/20'
            }`}
          >
            {i + 1}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`h-1 flex-1 rounded-full transition-all duration-700 ${i < activeIndex ? 'bg-tomato' : 'bg-char-950/5'}`} />
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
    <PageLayout width="5xl" isFloating fullMobile useDoodleOverlay>
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 md:p-10 rounded-[48px] shadow-xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-tomato/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 flex items-center justify-center rounded-3xl bg-white shadow-lg text-3xl md:text-4xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            🍕
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-char-950">
              Hi, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="mt-1.5 text-[10px] md:text-sm font-black text-char-950/40 uppercase tracking-[0.2em] flex items-center gap-2">
              {user?.isVerified ? (
                <span className="flex items-center gap-1.5 text-basil">
                  <span className="w-2 h-2 rounded-full bg-basil animate-pulse" />
                  Email verified
                </span>
              ) : (
                'Action required: Verify email'
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto relative z-10">
          <Link to="/menu" className="btn-primary w-full sm:w-auto text-center px-10 py-4 text-base transition-all active:scale-95 shadow-xl shadow-tomato/20">
            Explore Menu
          </Link>
          <Link to="/build" className="rounded-full border-2 border-char-950/10 bg-white w-full sm:w-auto text-center px-10 py-4 text-base font-black uppercase tracking-widest text-char-950 transition-all hover:bg-char-950 hover:text-white hover:border-char-950 active:scale-95 shadow-lg">
            Build Custom
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
              className="group bg-white/60 backdrop-blur-md rounded-[40px] p-8 md:p-10 shadow-lg border border-white/20 transition-all duration-500 hover:shadow-2xl hover:bg-white/80 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-tomato/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-tomato/10 transition-colors pointer-events-none" />

              <div className="mb-6 md:mb-8 flex flex-wrap items-start justify-between gap-6 relative z-10">
                <div className="flex gap-6 items-center flex-1 min-w-0">
                  <div className="hidden lg:block shrink-0 scale-[0.8] drop-shadow-xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                     <PizzaVisualizer selection={order} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-2xl md:text-3xl font-black text-char-950 leading-tight">
                      {order.base?.name || 'Signature Special'}
                    </p>
                    <p className="mt-2 text-xs md:text-sm font-bold text-char-950/50 uppercase tracking-widest leading-relaxed flex flex-wrap items-center gap-1.5">
                      {order.sauce?.name} · {order.cheese?.name}
                      {order.vegetables?.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-char-950/20" />
                          <span className="text-tomato/70">{order.vegetables.map(v => v.name).join(', ')}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-2xl md:text-4xl font-black text-tomato drop-shadow-sm">₹{order.totalAmount}</p>
                  <p className="mt-1 text-[10px] md:text-xs font-black text-char-950/20 uppercase tracking-widest">#{order._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <div className="relative z-10 bg-char-950/[0.03] p-6 rounded-[32px] border border-char-950/5">
                <StatusTracker status={order.status} />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-char-950/30">Order Progress</p>
                  <p className="text-[11px] md:text-sm font-black uppercase tracking-widest text-tomato flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tomato animate-pulse" />
                    {order.status}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;
