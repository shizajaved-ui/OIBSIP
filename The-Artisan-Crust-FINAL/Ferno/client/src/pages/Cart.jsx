import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { loadRazorpayScript } from '../utils/razorpay.js';
import PageLayout from '../components/PageLayout';

const describeItem = (item) => {
  const veg = item.vegetables?.map((v) => v.name).join(', ');
  return [item.base?.name, item.sauce?.name, item.cheese?.name, veg].filter(Boolean).join(' · ');
};

const Cart = () => {
  const { user } = useAuth();
  const { cart, refreshCart, updateQuantity, removeItem, loading } = useCart();
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
  }, []);

  const items = cart?.items || [];
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const finishCheckout = async (paymentDetails) => {
    try {
      await api.post('/cart/checkout/confirm', paymentDetails);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPlacing(false);
      refreshCart();
    }
  };

  const handleCheckout = async () => {
    setError('');
    setPlacing(true);
    try {
      const { data: rzpOrder } = await api.post('/cart/checkout/create-razorpay-order');

      if (rzpOrder.demo) {
        setDemoMode(true);
        setTimeout(() => {
          finishCheckout({
            razorpayOrderId: rzpOrder.id,
            razorpayPaymentId: `demo_payment_${Date.now()}`,
            razorpaySignature: 'demo',
          });
        }, 900);
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        setError('Failed to load payment gateway. Check your connection.');
        setPlacing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'The Artisan Crust',
        description: `${items.length} item${items.length === 1 ? '' : 's'}`,
        order_id: rzpOrder.id,
        handler: (response) =>
          finishCheckout({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        modal: { ondismiss: () => setPlacing(false) },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#C84E29' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout initiation failed');
      setPlacing(false);
    }
  };

  return (
    <PageLayout title="Your cart" subtitle="Review your pizzas before checkout." width="3xl" isFloating>
      {loading && !cart ? (
        <p className="mt-10 text-sm font-bold text-char-950/20 italic animate-pulse text-center">Loading your cart…</p>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center bg-white shadow-sm border-none">
          <span className="text-5xl mb-2">🛒</span>
          <p className="font-display text-2xl font-bold text-char-950">Your cart is empty.</p>
          <button onClick={() => navigate('/menu')} className="btn-primary mt-6 px-10 py-4 text-lg">
            Browse the menu
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-char-900 rounded-3xl flex items-center justify-between gap-4 p-6 shadow-sm border border-char-950/5">
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-bold text-char-950">{item.base?.name}</h3>
                  <p className="mt-1 truncate text-xs font-bold uppercase tracking-widest text-char-950/30">{describeItem(item)}</p>
                  <p className="mt-2 text-lg font-black text-tomato">₹{item.unitPrice}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="flex items-center rounded-full border-2 border-char-950/10 bg-white">
                    <button
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                      className="px-4 py-2 text-xl font-black text-tomato hover:bg-tomato/5 rounded-l-full"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-display font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-4 py-2 text-xl font-black text-tomato hover:bg-tomato/5 rounded-r-full"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-xs font-black uppercase tracking-widest text-char-950/30 transition hover:text-tomato"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-char-900 rounded-3xl mt-8 flex items-center justify-between p-8 border-2 border-dashed border-char-950/10">
            <span className="font-display text-2xl font-black text-char-950">Total Amount</span>
            <span className="font-display text-3xl font-black text-tomato">₹{total}</span>
          </div>

          {error && <p className="mt-4 text-center font-bold text-tomato">{error}</p>}
          {demoMode && (
            <p className="mt-4 text-center text-xs font-bold text-char-950/30 uppercase tracking-widest italic">
              Demo mode — simulating checkout...
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={placing}
            className="btn-primary mt-10 w-full py-5 text-xl shadow-xl shadow-tomato/20"
          >
            {placing ? 'Processing kitchen ticket…' : `Checkout · ₹${total}`}
          </button>
        </>
      )}
    </PageLayout>
  );
};

export default Cart;
