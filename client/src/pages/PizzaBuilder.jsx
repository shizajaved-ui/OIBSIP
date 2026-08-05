import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { resolveImageUrl } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ConfettiBurst from '../components/ConfettiBurst.jsx';
import { playClickSound } from '../utils/sound.js';
import { getIngredientIcon, getCursorStyle } from '../utils/ingredientIcons.js';
import { loadRazorpayScript } from '../utils/razorpay.js';
import PageLayout from '../components/PageLayout';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Toppings', 'Review'];

const CHEF_NOTES = [
  "The foundation is everything. Pick your canvas.",
  "Bring the flavor. Choose your base layer.",
  "Smooth or bold? Pick your melt.",
  "Go wild. Add as many fresh greens as you like.",
  "Looking good! Time to fire up the oven."
];

const OptionCard = ({ item, selected, onSelect, multi }) => {
  const handleClick = (e) => {
    const originX = (e.clientX / window.innerWidth) * 100;
    onSelect(originX);
  };

  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !item.image || imgFailed;

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      className={`group relative h-64 w-full overflow-hidden rounded-[40px] border bg-char-800 text-left shadow-lg transition-all duration-200 ${
        selected ? 'border-tomato shadow-ember scale-[1.02] z-10' : 'border-char-950/5 hover:border-tomato/30'
      }`}
      style={{ cursor: getCursorStyle(item) }}
    >
      {!showFallback ? (
        <>
          <img
            src={resolveImageUrl(item.image)}
            alt={item.name}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(47,31,23,0.8) 0%, rgba(47,31,23,0.3) 40%, transparent 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-tomato/5">
            <span className="text-7xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
              {getIngredientIcon(item)}
            </span>
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(47,31,23,0.6) 0%, transparent 60%)',
            }}
          />
        </>
      )}

      {item.price > 0 && (
        <span className="absolute left-4 top-4 rounded-full bg-tomato px-3 py-1 font-display text-[12px] font-black text-white shadow-md">
          +₹{item.price}
        </span>
      )}

      <div
        className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
          selected
            ? 'scale-110 border-white bg-tomato shadow-lg'
            : 'scale-0 border-transparent bg-transparent'
        }`}
      >
        <span className="text-xs font-black text-white">✓</span>
      </div>

      <div className="absolute inset-x-6 bottom-6">
        <h3 className="font-display text-xl font-black leading-[1.1] tracking-tight text-white drop-shadow-md">{item.name}</h3>
        <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.15em] inline-block ${item.price > 0 ? 'bg-char-800/95 text-char-950 px-2 py-0.5 rounded-md shadow-sm' : 'text-stone-300/80'}`}>
          {item.price > 0 ? 'Add-on' : 'Included'}
        </p>
      </div>
    </motion.button>
  );
};

const PizzaBuilder = () => {
  const [step, setStep] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, vegetables: [] });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [bursts, setBursts] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/inventory').then(({ data }) => setInventory(data));
  }, []);

  const byCategory = (cat) => inventory.filter((i) => i.category === cat);

  const fireConfetti = (category, originX) => {
    playClickSound();
    setBursts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, category, originX }]);
  };

  const removeBurst = (id) => setBursts((prev) => prev.filter((b) => b.id !== id));

  const selectBase = (item, originX) => {
    setSelection((prev) => ({ ...prev, base: item }));
    fireConfetti('base', originX);
  };

  const selectSauce = (item, originX) => {
    setSelection((prev) => ({ ...prev, sauce: item }));
    fireConfetti('sauce', originX);
  };

  const selectCheese = (item, originX) => {
    setSelection((prev) => ({ ...prev, cheese: item }));
    fireConfetti('cheese', originX);
  };

  const toggleVeg = (item, originX) => {
    setSelection((prev) => {
      const exists = prev.vegetables.find((v) => v._id === item._id);
      return {
        ...prev,
        vegetables: exists
          ? prev.vegetables.filter((v) => v._id !== item._id)
          : [...prev.vegetables, item],
      };
    });
    fireConfetti('vegetable', originX);
  };

  const basePrice = 199; // flat base pizza price before add-ons
  const total =
    basePrice +
    (selection.base?.price || 0) +
    (selection.sauce?.price || 0) +
    (selection.cheese?.price || 0) +
    selection.vegetables.reduce((sum, v) => sum + (v.price || 0), 0);

  const canProceed = () => {
    if (step === 0) return !!selection.base;
    if (step === 1) return !!selection.sauce;
    if (step === 2) return !!selection.cheese;
    return true;
  };

  const confirmOrder = async (paymentDetails) => {
    try {
      await api.post('/orders', {
        base: selection.base._id,
        sauce: selection.sauce._id,
        cheese: selection.cheese._id,
        vegetables: selection.vegetables.map((v) => v._id),
        ...paymentDetails,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Order confirmation failed');
    } finally {
      setPlacing(false);
    }
  };

  const handlePayment = async () => {
    setError('');
    setPlacing(true);
    try {
      // The server recomputes the price from the actual selected ingredient
      // IDs — it never trusts a number we send, so we send the selection,
      // not a total.
      const { data: rzpOrder } = await api.post('/orders/create-razorpay-order', {
        base: selection.base._id,
        sauce: selection.sauce._id,
        cheese: selection.cheese._id,
        vegetables: selection.vegetables.map((v) => v._id),
      });

      if (rzpOrder.demo) {
        setDemoMode(true);
        setTimeout(() => {
          confirmOrder({
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
        description: 'Custom pizza order',
        order_id: rzpOrder.id,
        handler: (response) =>
          confirmOrder({
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
      setError(err.response?.data?.message || 'Payment initiation failed');
      setPlacing(false);
    }
  };

  return (
    <PageLayout width="6xl" isFloating>
      <div className="flex flex-col items-center text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧑‍🍳</span>
            <h1 className="font-display text-5xl font-black tracking-tight text-char-950">
              Build your pizza
            </h1>
          </div>
          <p className="mt-2 text-lg font-medium text-char-950/40 italic">
            {CHEF_NOTES[step]}
          </p>
        </div>
      </div>

      {/* Stepper — Optimized with Terracotta Red */}
      <div className="relative mx-auto mt-16 max-w-3xl w-full">
        <div className="absolute left-[20px] right-[20px] top-[22px] h-0.5 bg-char-950/10" />
        <div
          className="absolute left-[20px] top-[22px] h-0.5 bg-tomato-dark transition-all duration-500"
          style={{ width: `calc((100% - 40px) * ${step / (STEPS.length - 1)})` }}
        />
        <div className="relative flex justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition-all duration-300 ${
                  i <= step
                    ? 'bg-tomato-dark text-white shadow-ember'
                    : 'border-2 border-char-950/10 bg-white text-char-950/30'
                } ${i === step ? 'ring-4 ring-tomato/20 scale-110' : ''}`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={`font-display text-[10px] font-black uppercase tracking-[0.1em] ${
                  i <= step ? 'text-tomato-dark' : 'text-char-950/30'
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-tomato/20 bg-tomato/5 p-4 text-center text-sm font-bold text-tomato">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mt-16 w-full"
        >
          {step === 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {byCategory('base').map((item) => (
                <OptionCard
                  key={item._id}
                  item={item}
                  selected={selection.base?._id === item._id}
                  onSelect={(originX) => selectBase(item, originX)}
                />
              ))}
            </div>
          )}

          {(step === 1 || step === 2 || step === 3) && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {byCategory(step === 1 ? 'sauce' : step === 2 ? 'cheese' : 'vegetable').map((item) => (
                <OptionCard
                  key={item._id}
                  item={item}
                  multi={step === 3}
                  selected={
                    step === 3
                      ? !!selection.vegetables.find((v) => v._id === item._id)
                      : selection[step === 1 ? 'sauce' : 'cheese']?._id === item._id
                  }
                  onSelect={(originX) =>
                    step === 3 ? toggleVeg(item, originX) :
                    step === 1 ? selectSauce(item, originX) : selectCheese(item, originX)
                  }
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="mx-auto max-w-xl overflow-hidden rounded-[40px] border border-char-950/10 bg-white p-10 shadow-2xl">
              <h2 className="font-display text-3xl font-bold text-char-950">Review your order</h2>
              <div className="mt-8 space-y-4">
                {[
                  { label: 'Base', val: selection.base?.name },
                  { label: 'Sauce', val: selection.sauce?.name },
                  { label: 'Cheese', val: selection.cheese?.name },
                  { label: 'Veggies', val: selection.vegetables.map(v => v.name).join(', ') || 'None' }
                ].map(row => (
                  <div key={row.label} className="flex justify-between border-b border-char-950/5 pb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-char-950/40">{row.label}</span>
                    <span className="font-display text-lg font-bold text-char-950">{row.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex items-center justify-between border-t-2 border-char-950 border-dashed pt-6">
                <span className="font-display text-2xl font-black text-char-950">Total Amount</span>
                <span className="font-display text-3xl font-black text-tomato">₹{total}</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={placing}
                className="btn-primary mt-10 w-full py-5 text-lg shadow-xl shadow-tomato/20"
              >
                {placing ? 'Preparing your kitchen…' : `Pay ₹${total} Now`}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 flex justify-between border-t border-char-950/10 pt-10 w-full">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="group flex items-center gap-2 rounded-full border-2 border-char-950/10 bg-white px-10 py-3 font-display text-sm font-black uppercase tracking-widest text-char-950 transition-all hover:border-char-950/30 hover:bg-char-950/5 active:scale-95 disabled:opacity-20"
        >
          ← Back
        </button>
        {step < 4 && (
          <button
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            disabled={!canProceed()}
            className="group flex items-center gap-2 rounded-full bg-[#2F1F17] px-12 py-4 font-display text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-[#A83D1F] hover:text-white active:scale-95 disabled:opacity-30"
          >
            Next Step →
          </button>
        )}
      </div>

      {bursts.map((b) => (
        <ConfettiBurst
          key={b.id}
          category={b.category}
          originX={b.originX}
          onComplete={() => removeBurst(b.id)}
        />
      ))}

      {/* Floating Blinking Next Step Button */}
      <AnimatePresence>
        {step < 4 && canProceed() && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{
              opacity: 1,
              scale: [1, 1.1, 1],
              x: 0
            }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            transition={{
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              opacity: { duration: 0.3 }
            }}
            onClick={() => {
              playClickSound();
              setStep(s => s + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="fixed right-6 bottom-24 md:right-10 md:bottom-1/2 md:translate-y-1/2 z-[100] flex flex-col items-center gap-2 group"
          >
            <div className="bg-char-950 text-white h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center shadow-2xl shadow-char-950/40 border-4 border-white group-hover:bg-char-950/90 transition-all">
              <svg className="w-8 h-8 md:w-10 md:h-10 fill-current" viewBox="0 0 24 24">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </div>
            <span className="bg-char-950 text-char-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/10">
              Next Step
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default PizzaBuilder;
