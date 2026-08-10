import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { resolveImageUrl } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ConfettiBurst from '../components/ConfettiBurst.jsx';
import { playClickSound } from '../utils/sound.js';
import { getIngredientIcon, getCursorStyle } from '../utils/ingredientIcons.js';
import { loadRazorpayScript } from '../utils/razorpay.js';
import PageLayout from '../components/PageLayout';
import PizzaVisualizer from '../components/PizzaVisualizer';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Toppings', 'Review'];

const CHEF_NOTES = [
  "The foundation is everything. Pick your canvas.",
  "Bring the flavor. Choose your base layer.",
  "Smooth or bold? Pick your melt.",
  "Go wild. Add as many fresh greens as you like.",
  "Looking good! Time to fire up the oven."
];

const SegmentedControl = ({ label, items, selectedId, onSelect }) => (
  <div className="mb-8">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-char-950/40 mb-3 ml-2">{label}</p>
    <div className="flex gap-1.5 p-1.5 bg-char-950/5 rounded-[20px] border border-char-950/5 overflow-x-auto no-scrollbar">
      {items.map((item) => (
        <button
          key={item._id}
          onClick={() => onSelect(item)}
          className={`flex-1 min-w-0 whitespace-nowrap px-3 md:px-6 py-2 md:py-2.5 rounded-[16px] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
            selectedId === item._id
              ? 'bg-white text-tomato shadow-md'
              : 'text-char-950/40 hover:text-char-950 hover:bg-white/50'
          }`}
        >
          {item.name} {item.price > 0 && `(+₹${item.price})`}
        </button>
      ))}
    </div>
  </div>
);

const OptionCard = ({ item, selected, onSelect }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const handleClick = (e) => {
    const originX = (e.clientX / window.innerWidth) * 100;
    onSelect(originX);
  };

  const showFallback = (!item.inventoryCard) || imgFailed;

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`group relative h-60 w-full overflow-hidden rounded-[32px] border bg-char-850 text-left transition-all duration-500 ${
        selected
          ? 'border-tomato shadow-[0_20px_50px_-12px_rgba(200,78,41,0.3)] ring-4 ring-tomato/10 scale-[1.02] z-10'
          : 'border-char-950/5 hover:border-tomato/30 shadow-md'
      }`}
      style={{ cursor: getCursorStyle(item) }}
    >
      {/* Background Animated Glow for Selected State */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-tr from-tomato/20 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {!showFallback ? (
        <>
          <img
            src={resolveImageUrl(item.inventoryCard)}
            alt={item.name}
            onError={() => setImgFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${selected ? 'scale-110 opacity-100' : 'opacity-80 group-hover:scale-105 group-hover:opacity-90'}`}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(47,31,23,0.9) 0%, rgba(47,31,23,0.4) 40%, transparent 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-tomato/5">
            <span className={`text-7xl drop-shadow-2xl transition-all duration-500 ${selected ? 'scale-125 rotate-12' : 'group-hover:scale-110'}`}>
              {getIngredientIcon(item)}
            </span>
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(47,31,23,0.7) 0%, transparent 60%)',
            }}
          />
        </>
      )}

      {item.price > 0 && (
        <span className="absolute left-5 top-5 rounded-full bg-tomato px-3 py-1 font-display text-[12px] font-black text-white shadow-xl border border-white/20">
          +₹{item.price}
        </span>
      )}

      <div
        className={`absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out ${
          selected
            ? 'scale-110 border-white bg-tomato shadow-lg'
            : 'scale-0 border-transparent bg-transparent'
        }`}
      >
        <span className="text-sm font-black text-white">✓</span>
      </div>

      <div className="absolute inset-x-6 bottom-6">
        <h3 className="font-display text-2xl font-black leading-tight text-white drop-shadow-md">{item.name}</h3>
        <p className={`mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] inline-block px-2.5 py-1 rounded-full border shadow-sm transition-colors duration-300 ${item.price > 0 ? (selected ? 'bg-white text-tomato border-white' : 'bg-char-850/90 text-char-950 border-char-950/10') : 'text-stone-300/80 border-white/10'}`}>
          {item.price > 0 ? 'Premium Add-on' : 'Included'}
        </p>
      </div>
    </motion.button>
  );
};

const MobileCompactControl = ({ items, selectedId, onSelect }) => (
  <div className="flex gap-0.5 bg-char-950/10 p-0.5 rounded-lg border border-char-950/5 w-full">
    {items.map((item) => (
      <button
        key={item._id}
        onClick={() => onSelect(item)}
        className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter transition-all ${
          selectedId === item._id
            ? 'bg-white text-tomato shadow-sm scale-95'
            : 'text-char-950/60'
        }`}
      >
        {item.name.split(' ')[0]}
      </button>
    ))}
  </div>
);

const PizzaBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  // State
  const [step, setStep] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [selection, setSelection] = useState({
    base: null,
    sauce: null,
    cheese: null,
    vegetables: [],
    thickness: null,
    size: null,
    quantity: 1
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [bursts, setBursts] = useState([]);

  const scrollToContent = () => {
    if (scrollRef.current) {
      const offset = 140;
      const elementPosition = scrollRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Load Inventory & Set Defaults
  useEffect(() => {
    api.get('/inventory').then(({ data }) => {
      setInventory(data);

      // Auto-select "Regular" options as defaults
      const thickness = data.filter(i => i.category === 'thickness');
      const sizes = data.filter(i => i.category === 'size');
      setSelection(prev => ({
        ...prev,
        thickness: prev.thickness || thickness.find(t => t.name.toLowerCase() === 'regular') || thickness[0],
        size: prev.size || sizes.find(s => s.name.toLowerCase().includes('regular')) || sizes[1] || sizes[0],
        quantity: 1
      }));

      // Preload assets
      data.forEach(item => {
        if (item.previewLayer) {
          const img = new Image();
          img.src = resolveImageUrl(item.previewLayer);
        }
      });
    });
  }, []);

  // Helpers
  const byCategory = (cat) => inventory.filter((i) => i.category === cat);

  const fireConfetti = (category, originX) => {
    playClickSound();
    setBursts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, category, originX }]);
  };

  const removeBurst = (id) => setBursts((prev) => prev.filter((b) => b.id !== id));

  // Selection Handlers
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

  const selectThickness = (item, originX) => {
    setSelection((prev) => ({ ...prev, thickness: item }));
    fireConfetti('thickness', originX);
  };

  const selectSize = (item, originX) => {
    setSelection((prev) => ({ ...prev, size: item }));
    fireConfetti('size', originX);
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

  // Pricing Logic
  const basePrice = 199;
  const unitPrice =
    basePrice +
    (selection.thickness?.price || 0) +
    (selection.size?.price || 0) +
    (selection.base?.price || 0) +
    (selection.sauce?.price || 0) +
    (selection.cheese?.price || 0) +
    selection.vegetables.reduce((sum, v) => sum + (v.price || 0), 0);

  const total = unitPrice * (selection.quantity || 1);

  const canProceed = () => {
    if (step === 0) return !!selection.base && !!selection.thickness;
    if (step === 1) return !!selection.sauce;
    if (step === 2) return !!selection.cheese;
    return true;
  };

  // Order Submission
  const confirmOrder = async (paymentDetails) => {
    try {
      await api.post('/orders', {
        thickness: selection.thickness._id,
        size: selection.size._id,
        base: selection.base._id,
        sauce: selection.sauce._id,
        cheese: selection.cheese._id,
        vegetables: selection.vegetables.map((v) => v._id),
        quantity: selection.quantity,
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
    if (!selection.base || !selection.sauce || !selection.cheese || !selection.thickness || !selection.size) {
      setError('Please complete all selection steps.');
      return;
    }

    setError('');
    setPlacing(true);
    try {
      const { data: rzpOrder } = await api.post('/orders/create-razorpay-order', {
        thickness: selection.thickness._id,
        size: selection.size._id,
        base: selection.base._id,
        sauce: selection.sauce._id,
        cheese: selection.cheese._id,
        vegetables: selection.vegetables.map((v) => v._id),
        quantity: selection.quantity,
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
    <PageLayout title="Build your pizza" subtitle={CHEF_NOTES[step]} width="6xl" isFloating fullMobile useDoodleOverlay>
      {/* Stepper Navigation - Sticky only on Desktop */}
      <div ref={scrollRef} className="md:sticky md:top-[104px] z-30 md:z-50 -mx-4 md:-mx-12 mb-0 md:mb-10 px-4 md:px-12 py-6 bg-transparent md:bg-white/40 md:backdrop-blur-md border-none md:border-b border-char-950/5 relative overflow-hidden flex items-center justify-center shadow-none md:shadow-sm">
        <div className="relative z-10 flex items-center justify-center gap-2 md:gap-4 w-full flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-char-950/40 mr-4 hidden xs:block">Progress</span>
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => {
                if (i <= step) {
                  playClickSound();
                  setStep(i);
                  setTimeout(scrollToContent, 100);
                }
              }}
              className={`px-4 md:px-8 py-2 md:py-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-500 active:scale-90 ${
                i === step
                  ? 'bg-tomato text-white shadow-[0_10px_20px_-5px_rgba(200,78,41,0.4)] scale-110'
                  : i < step
                  ? 'bg-char-950 text-white hover:bg-tomato'
                  : 'bg-char-950/5 text-char-950/20 cursor-not-allowed'
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Preview & Thickness Header - Sticky below Navbar */}
      {step < 4 && (
        <div className="sticky top-[72px] z-40 md:hidden -mx-4 mb-0 px-4 py-4 doodle-bg border-b border-char-950/10 relative overflow-hidden flex items-center gap-5 shadow-2xl">
          {/* Enhanced Warm Beige Overlay with Glass Effect */}
          <div className="absolute inset-0 bg-[#FDF5E6]/90 backdrop-blur-md" />

          <div className="relative z-10 w-32 h-32 shrink-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
              className="relative w-full h-full flex items-center justify-center rounded-full shadow-[0_15px_35px_rgba(47,31,23,0.3)]"
            >
              <div
                className="absolute inset-0 rounded-full border-4 border-white/20 overflow-hidden"
                style={{
                  backgroundImage: 'url("/assets/wood-grain.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative z-10 scale-[1.2] flex items-center justify-center w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                 <PizzaVisualizer selection={selection} step={step} size="responsive" shouldRotate={false} />
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {step === 0 ? (
              <div className="animate-rise">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-tomato mb-2 ml-1 drop-shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tomato animate-pulse" />
                  Select Thickness
                </p>
                <MobileCompactControl
                  items={byCategory('thickness')}
                  selectedId={selection.thickness?._id}
                  onSelect={(item) => selectThickness(item, 50)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1 pr-2 animate-rise">
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-char-950/30">Step {step + 1} of 5</p>
                    <p className="font-display text-lg font-black text-char-950 uppercase tracking-tighter leading-none">{STEPS[step]}</p>
                 </div>
                 <div className="mt-1 pt-2 border-t border-char-950/5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-tomato/60">Total Bill</span>
                    <span className="font-display text-xl font-black text-tomato">₹{total}</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-0 md:mt-8">
        <div className="flex-1 w-full order-2 lg:order-1 px-4 md:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full"
            >
              {step === 0 && (
                <div className="space-y-6 md:space-y-10">
                  <div className="hidden md:block">
                    <SegmentedControl
                      label="Crust Thickness"
                      items={byCategory('thickness')}
                      selectedId={selection.thickness?._id}
                      onSelect={(item) => selectThickness(item, 50)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {byCategory('base').map((item) => (
                      <OptionCard
                        key={item._id}
                        item={item}
                        selected={selection.base?._id === item._id}
                        onSelect={(originX) => selectBase(item, originX)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(step === 1 || step === 2 || step === 3) && (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {byCategory(step === 1 ? 'sauce' : step === 2 ? 'cheese' : 'vegetable').map((item) => (
                    <OptionCard
                      key={item._id}
                      item={item}
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
                <div className="mx-auto max-w-xl overflow-hidden rounded-[40px] border border-char-950/10 bg-char-850 p-6 md:p-10 shadow-2xl animate-rise">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-char-950 mb-8 border-b border-char-950/5 pb-6">Review your order</h2>

                  <SegmentedControl
                    label="Select Pizza Size"
                    items={byCategory('size')}
                    selectedId={selection.size?._id}
                    onSelect={(item) => selectSize(item, 50)}
                  />

                  <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-char-950/40 mb-3 ml-2">Quantity</p>
                    <div className="flex items-center gap-4 bg-char-950/5 p-2 rounded-[20px] border border-char-950/5 w-fit">
                      <button
                        onClick={() => { playClickSound(); setSelection(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) })); }}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-char-850 text-tomato shadow-sm hover:shadow-md transition-all font-bold text-xl"
                      >
                        −
                      </button>
                      <span className="font-display font-black text-xl w-8 text-center text-char-950">
                        {selection.quantity}
                      </span>
                      <button
                        onClick={() => { playClickSound(); setSelection(prev => ({ ...prev, quantity: prev.quantity + 1 })); }}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-char-850 text-tomato shadow-sm hover:shadow-md transition-all font-bold text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mt-10">
                    {[
                      { label: 'Thickness', val: selection.thickness?.name },
                      { label: 'Size', val: selection.size?.name },
                      { label: 'Base', val: selection.base?.name },
                      { label: 'Sauce', val: selection.sauce?.name },
                      { label: 'Cheese', val: selection.cheese?.name },
                      { label: 'Veggies', val: selection.vegetables.map(v => v.name).join(', ') || 'None' }
                    ].map(row => (
                      <div key={row.label} className="grid grid-cols-[1fr_2.5fr] gap-4 border-b border-char-950/5 pb-2">
                        <span className="text-[9px] md:text-sm font-bold uppercase tracking-wider text-char-950/40 self-center">{row.label}</span>
                        <span className="font-display text-sm md:text-lg font-bold text-char-950 text-right">{row.val}</span>
                      </div>
                    ))}
                  </div>

                  {error && <p className="mt-4 text-xs font-black text-tomato uppercase tracking-widest text-center">{error}</p>}

                  <div className="mt-10 flex items-center justify-between border-t-2 border-char-950 border-dashed pt-6">
                    <span className="font-display text-xl md:text-2xl font-black text-char-950">Total</span>
                    <span className="font-display text-2xl md:text-3xl font-black text-tomato">₹{total}</span>
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
        </div>

        {step < 4 && (
          <div className="hidden md:block sticky top-[160px] lg:sticky lg:top-[160px] z-40 w-full lg:w-[400px] shrink-0 order-1 lg:order-2 self-start px-2 md:px-0">
            {/* Desktop View: Large Interactive Board (Mobile Mini Player Removed) */}
            <div className="transition-all duration-500 relative w-full h-auto bg-[#F3E9DC] rounded-[56px] p-8 border border-[#DCC9A8] shadow-2xl flex flex-col items-center overflow-hidden z-10">

              <div className="absolute inset-0 opacity-[0.05] pointer-events-none md:block hidden" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                className="relative rounded-full flex items-center justify-center z-10 w-full aspect-square shadow-lg md:shadow-[0_20px_40px_rgba(47,31,23,0.3)]"
              >
                <div
                  className="absolute inset-0 rounded-full border border-[#8B5A2B]/10 md:border-4 shadow-[0_5px_15px_rgba(0,0,0,0.1)] md:shadow-[0_10px_20px_rgba(0,0,0,0.1)] overflow-hidden"
                  style={{
                    backgroundImage: 'url("/assets/wood-grain.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="absolute inset-0 rounded-full shadow-[inset_0_-2px_6px_rgba(0,0,0,0.3),_inset_0_1px_3px_rgba(255,255,255,0.1)] md:shadow-[inset_0_-4px_10px_rgba(0,0,0,0.3),_inset_0_2px_6px_rgba(255,255,255,0.1)] pointer-events-none" />

                <div className="relative z-10 w-full h-full flex items-center justify-center">
                   <div className="scale-[0.88] md:scale-[0.96] drop-shadow-[0_10px_20px_rgba(47,31,23,0.3)]">
                      <PizzaVisualizer selection={selection} step={step} size="responsive" shouldRotate={false} />
                   </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-char-950/5 to-transparent pointer-events-none rounded-full" />
              </motion.div>

              <div className="mt-8 w-full bg-char-800 rounded-[32px] p-6 border border-[#EADFCF] shadow-lg z-10 hidden md:block">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-char-950/40">
                  <span>Standard Preparation</span>
                  <span className="text-char-950/60">₹199</span>
                </div>
                <div className="flex justify-between items-center text-[13px] font-black text-char-950 mt-4 pt-4 border-t-2 border-dashed border-char-950/10">
                  <span className="uppercase tracking-[0.15em] text-tomato">Running Total</span>
                  <span className="text-2xl font-display text-tomato">₹{total}</span>
                </div>
              </div>

              <div className="md:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-tomato bg-white/95 px-4 py-1.5 rounded-full shadow-md inline-block border border-tomato/10">₹{total}</p>
              </div>
            </div>
          </div>
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

      <AnimatePresence>
        {step < 4 && canProceed() && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: [1, 1.1, 1], x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            transition={{ scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }, opacity: { duration: 0.3 } }}
            onClick={() => {
              playClickSound();
              setStep(s => s + 1);
              setTimeout(scrollToContent, 100);
            }}
            className="fixed right-6 bottom-24 md:right-10 md:top-[72%] md:-translate-y-1/2 z-[100] flex flex-col items-center gap-1 md:gap-2 group"
          >
            <div className="bg-char-950 text-white h-10 w-10 md:h-20 md:w-20 rounded-full flex items-center justify-center shadow-2xl shadow-char-950/40 border-2 md:border-4 border-white group-hover:bg-char-950/90 transition-all">
              <svg className="w-5 h-5 md:w-10 md:h-10 fill-current" viewBox="0 0 24 24">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </div>
            <span className="bg-char-950 text-char-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/10">
              Next Step
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: -50 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1], x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -50 }}
            transition={{ scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }, opacity: { duration: 0.3 } }}
            onClick={() => {
              playClickSound();
              setStep(s => Math.max(0, s - 1));
              setTimeout(scrollToContent, 100);
            }}
            className="fixed left-6 bottom-24 md:left-10 md:top-[72%] md:-translate-y-1/2 z-[100] flex flex-col items-center gap-1 md:gap-2 group"
          >
            <div className="bg-white text-char-950 h-10 w-10 md:h-20 md:w-20 rounded-full flex items-center justify-center shadow-2xl shadow-char-950/20 border-2 md:border-4 border-char-950 group-hover:bg-char-900 transition-all">
              <svg className="w-5 h-5 md:w-10 md:h-10 fill-current rotate-180" viewBox="0 0 24 24">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </div>
            <span className="bg-white text-char-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/10">
              Go Back
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default PizzaBuilder;
