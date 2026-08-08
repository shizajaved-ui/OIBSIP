import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { loadRazorpayScript } from '../utils/razorpay.js';
import PageLayout from '../components/PageLayout';

const describeItem = (item) => {
  const veg = item.vegetables?.map((v) => v.name).join(', ');
  return [
    item.quantity > 1 ? `x${item.quantity}` : null,
    item.size?.name,
    item.thickness?.name,
    item.base?.name,
    item.sauce?.name,
    item.cheese?.name,
    veg
  ].filter(Boolean).join(' · ');
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
    <PageLayout title="Your cart" subtitle="Review your pizzas before checkout." width="3xl" isFloating useDoodleOverlay>
      {loading && !cart ? (
        <p className="mt-10 text-sm font-bold text-char-950/20 italic animate-pulse text-center">Loading your cart…</p>
      ) : items.length === 0 ? (
        <div
          className="relative overflow-hidden flex flex-col items-center gap-3 p-8 md:p-16 text-center bg-[#FFFCF7] shadow-lg rounded-[48px] border border-char-950/5"
          style={{
            backgroundImage: 'url("/assets/doodle-border.png")',
            backgroundSize: '400px auto',
            backgroundBlendMode: 'soft-light'
          }}
        >
          <span className="relative z-10 text-4xl md:text-6xl mb-4 drop-shadow-md">🛒</span>
          <p className="relative z-10 font-display text-2xl md:text-3xl font-black text-char-950">Your cart is empty.</p>
          <p className="relative z-10 text-sm font-medium text-char-950/40 italic mb-4">Start your artisanal pizza journey today.</p>
          <button onClick={() => navigate('/menu')} className="relative z-10 btn-primary px-10 py-4 text-base md:text-lg shadow-ember w-full md:w-auto">
            Browse the menu
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="relative overflow-hidden bg-[#FFFCF7] rounded-[32px] md:rounded-[40px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 p-6 md:p-10 shadow-lg border border-char-950/5 transition-all hover:shadow-2xl"
                style={{
                  backgroundImage: 'url("/assets/doodle-border.png")',
                  backgroundSize: '400px auto',
                  backgroundBlendMode: 'soft-light'
                }}
              >
                <div className="relative z-10 min-w-0 flex-1">
                  <h3 className="font-display text-xl md:text-2xl font-black text-char-950 truncate">{item.base?.name}</h3>
                  <p className="mt-1 truncate text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-char-950/40">{describeItem(item)}</p>
                  <p className="mt-2 md:mt-3 text-xl md:text-2xl font-black text-tomato drop-shadow-sm">₹{item.unitPrice}</p>
                </div>
                <div className="relative z-10 flex w-full sm:w-auto shrink-0 items-center justify-between sm:justify-end gap-4 md:gap-6">
                  <div className="flex items-center rounded-full bg-white/60 backdrop-blur-md border border-char-950/10 shadow-inner p-1">
                    <button
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                      className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-xl md:text-2xl font-black text-tomato hover:bg-white rounded-full transition-all"
                    >
                      −
                    </button>
                    <span className="w-8 md:w-10 text-center font-display font-black text-lg md:text-xl text-char-950">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-xl md:text-2xl font-black text-tomato hover:bg-white rounded-full transition-all"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-tomato/10 text-tomato hover:bg-tomato hover:text-white transition-all shadow-md active:scale-90"
                    title="Remove Item"
                  >
                    <span className="text-lg md:text-xl font-bold">✕</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-char-900 rounded-3xl mt-6 md:mt-8 flex items-center justify-between p-6 md:p-8 border-2 border-dashed border-char-950/10">
            <span className="font-display text-xl md:text-2xl font-black text-char-950">Total</span>
            <span className="font-display text-2xl md:text-3xl font-black text-tomato">₹{total}</span>
          </div>

          {error && <p className="mt-4 text-center font-bold text-tomato text-sm">{error}</p>}
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
