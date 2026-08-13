import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { resolveImageUrl } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getIngredientIcon } from '../utils/ingredientIcons.js';
import { playClickSound } from '../utils/sound.js';
import FlourBurst from '../components/FlourBurst.jsx';
import PageLayout from '../components/PageLayout';

const BASE_PRICE = 199;

const SegmentedControl = ({ label, items, selectedId, onSelect }) => (
  <div className="mb-8">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-char-950/40 mb-3 ml-2">{label}</p>
    <div className="flex flex-wrap gap-2 p-1.5 bg-char-950/5 rounded-[20px] border border-char-950/5">
      {items.map((item) => (
        <button
          key={item._id}
          onClick={() => onSelect(item)}
          className={`flex-1 min-w-[100px] px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all ${
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

const MenuCard = ({ item, defaultSauce, defaultCheese, onAddClick, onShowDetails, adding }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = (!item.menuVisual) || imgFailed;
  const total = BASE_PRICE + (item.price || 0) + (defaultSauce?.price || 0) + (defaultCheese?.price || 0);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
      onClick={() => onShowDetails(item)}
      className="group relative h-48 md:h-64 w-full overflow-hidden rounded-[24px] md:rounded-[32px] border bg-[#FDF2F0] text-left transition-all duration-300 border-tomato/5 hover:border-tomato/30 cursor-pointer shadow-lg hover:shadow-2xl"
    >
      {!showFallback ? (
        <>
          <img
            src={resolveImageUrl(item.menuVisual)}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-500 opacity-90 group-hover:scale-110"
            onError={() => setImgFailed(true)}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(47,31,23,0.9) 0%, rgba(47,31,23,0.4) 50%, transparent 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-tomato/5">
            <span className="text-4xl md:text-7xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
              {getIngredientIcon(item)}
            </span>
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(47,31,23,0.7) 0%, transparent 70%)',
            }}
          />
        </>
      )}

      {/* Action Buttons Top Right */}
      <div className="absolute right-2 md:right-4 top-2 md:top-4 flex flex-col gap-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onShowDetails(item); }}
          className="h-7 w-7 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-char-950 transition-all shadow-lg border border-white/20"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </button>
      </div>

      <span className="absolute left-2 md:left-4 top-2 md:top-4 rounded-full bg-tomato px-2 md:px-3 py-0.5 md:py-1 font-display text-[10px] md:text-[12px] font-black text-white shadow-2xl border border-white/20">
        ₹{total}
      </span>

      <div className="absolute inset-x-3 md:inset-x-5 bottom-3 md:bottom-5 flex items-end justify-between gap-2 md:gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base md:text-2xl font-black leading-tight text-white drop-shadow-md">{item.name}</h3>
          <p className="mt-0.5 md:mt-1 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-stone-300/90 truncate flex items-center gap-1 md:gap-1.5">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-basil" />
            {defaultSauce?.name} · {defaultCheese?.name}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAddClick(item, e); }}
          disabled={adding === item._id}
          className={`flex h-8 w-8 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full bg-white text-char-950 shadow-2xl transition-all hover:bg-tomato hover:text-white active:scale-90 border-2 border-char-950/10 ${adding === item._id ? 'animate-pulse' : ''}`}
        >
           <span className="text-xl md:text-2xl font-black">{adding === item._id ? '·' : '+'}</span>
        </button>
      </div>
    </motion.div>
  );
};

const Counter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let totalDuration = 1000;
    let increment = end / (totalDuration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

const Menu = () => {
  const [inventory, setInventory] = useState([]);
  const [adding, setAdding] = useState(null);
  const [toast, setToast] = useState('');
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [customizingItem, setCustomizingItem] = useState(null);
  const [customOptions, setCustomizingOptions] = useState({ thickness: null, size: null, quantity: 1 });
  const [bursts, setBursts] = useState([]);
  const { user } = useAuth();
  const { addToCart, refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/inventory').then(({ data }) => {
      setInventory(data);
      const thickness = data.filter(i => i.category === 'thickness');
      const sizes = data.filter(i => i.category === 'size');
      setCustomizingOptions({
        thickness: thickness.find(t => t.name.toLowerCase() === 'regular') || thickness[0],
        size: sizes.find(s => s.name.toLowerCase().includes('regular')) || sizes[1] || sizes[0],
        quantity: 1
      });
    });
  }, []);

  const bases = inventory.filter((i) => i.category === 'menu');
  const sauces = inventory.filter((i) => i.category === 'sauce');
  const cheeses = inventory.filter((i) => i.category === 'cheese');
  const thicknesses = inventory.filter((i) => i.category === 'thickness');
  const sizes = inventory.filter((i) => i.category === 'size');

  const defaultSauce = sauces.find((s) => !s.price) || sauces[0];
  const defaultCheese = cheeses.find((c) => !c.price) || cheeses[0];

  const handleAddClick = (base, e) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setCustomizingItem({ base, event: e });
  };

  const handleAddToCart = async () => {
    if (!customizingItem || !customOptions.thickness || !customOptions.size) {
      setToast('Please select all options');
      setTimeout(() => setToast(''), 2200);
      return;
    }

    if (!defaultSauce || !defaultCheese) {
      setToast('Menu defaults missing — try again later');
      setTimeout(() => setToast(''), 2200);
      return;
    }

    const { base, event } = customizingItem;

    playClickSound();

    if (event) {
      const id = `${Date.now()}-${Math.random()}`;
      setBursts(prev => [...prev, { id, x: event.clientX, y: event.clientY }]);
    }

    setAdding(base._id);
    setCustomizingItem(null);

    try {
      await addToCart({
        base: base._id,
        sauce: defaultSauce._id,
        cheese: defaultCheese._id,
        vegetables: [],
        thickness: customOptions.thickness._id,
        size: customOptions.size._id,
        quantity: customOptions.quantity
      });
      setToast(`${customOptions.quantity}x ${base.name} added to cart`);
      setTimeout(() => setToast(''), 2200);
    } catch {
      setToast('Could not add to cart — try again');
      setTimeout(() => setToast(''), 2200);
    } finally {
      setAdding(null);
      refreshCart();
    }
  };

  const totalCalories = selectedDetails
    ? (selectedDetails.calories || 0) + (defaultSauce?.calories || 0) + (defaultCheese?.calories || 0)
    : 0;

  return (
    <>
      <PageLayout title="Menu" subtitle="Ready to order pizzas? Or head to Build a Pizza to customize every layer yourself!" width="5xl" isFloating fullMobile useDoodleOverlay transparentMobile>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 border-b-2 border-char-950/5 pb-8 mb-10">
          <div className="hidden sm:block">
            {/* Title and subtitle are now in PageLayout */}
          </div>
          <button
            onClick={() => navigate('/build')}
            className="w-full sm:w-auto shrink-0 rounded-full bg-char-950 px-8 py-3.5 text-xs md:text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-tomato shadow-lg active:scale-95"
          >
            Build your own
          </button>
        </div>

        {bases.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-bold text-char-950/20 italic animate-pulse">Loading the menu…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-8 lg:grid-cols-3">
            {bases.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                defaultSauce={defaultSauce}
                defaultCheese={defaultCheese}
                onAddClick={handleAddClick}
                onShowDetails={setSelectedDetails}
                adding={adding}
              />
            ))}
          </div>
        )}
      </PageLayout>

      <AnimatePresence>
        {customizingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizingItem(null)}
              className="absolute inset-0 bg-char-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-none md:rounded-[40px] bg-char-850 shadow-2xl border border-white/20 border-t-8 border-tomato"
              style={{
                backgroundImage: 'url("/assets/doodle-border.png")',
                backgroundSize: '400px auto',
                backgroundBlendMode: 'soft-light'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-6 right-6 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-char-950/5 text-char-950/40 hover:bg-tomato hover:text-white transition-all shadow-inner"
              >
                ✕
              </button>

              <div className="p-8">
                <h2 className="font-display text-2xl font-black text-char-950 mb-6 border-b-2 border-char-950/5 pb-4 pr-12">
                  Customize & Add
                </h2>

                <SegmentedControl
                  label="Choose Thickness"
                  items={thicknesses}
                  selectedId={customOptions.thickness?._id}
                  onSelect={(item) => setCustomizingOptions(prev => ({ ...prev, thickness: item }))}
                />

                <SegmentedControl
                  label="Select Size"
                  items={sizes}
                  selectedId={customOptions.size?._id}
                  onSelect={(item) => setCustomizingOptions(prev => ({ ...prev, size: item }))}
                />

                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-char-950/40 mb-2.5 ml-2">Quantity</p>
                  <div className="flex items-center gap-4 bg-char-950/5 p-1.5 rounded-[20px] border border-char-950/5 w-fit">
                    <button
                      onClick={() => setCustomizingOptions(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-tomato shadow-sm hover:shadow-md transition-all font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="font-display font-black text-lg w-8 text-center text-char-950">
                      {customOptions.quantity}
                    </span>
                    <button
                      onClick={() => setCustomizingOptions(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                      className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-tomato shadow-sm hover:shadow-md transition-all font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary flex-1 py-3.5 text-[11px] uppercase tracking-widest shadow-ember"
                  >
                    Confirm & Add
                  </button>
                  <button
                    onClick={() => setCustomizingItem(null)}
                    className="px-8 py-3.5 text-[11px] font-black uppercase tracking-widest text-char-950/40 hover:text-tomato transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetails(null)}
              className="absolute inset-0 bg-char-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[40px] bg-char-850 shadow-2xl border border-white/20 border-t-8 border-basil"
              style={{
                backgroundImage: 'url("/assets/doodle-border.png")',
                backgroundSize: '400px auto',
                backgroundBlendMode: 'soft-light'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDetails(null)}
                className="absolute top-6 right-6 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-char-950/5 text-char-950/40 hover:bg-tomato hover:text-white transition-all shadow-inner"
              >
                ✕
              </button>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-6 pr-12">
                  <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-char-950/5 text-3xl">
                    {getIngredientIcon(selectedDetails)}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-black text-char-950">{selectedDetails.name}</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-tomato">Nutrition & Ingredients</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-char-950/40 mb-2.5">Core Ingredients</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Dough Base', val: selectedDetails.name },
                        { label: 'Signature Sauce', val: defaultSauce?.name },
                        { label: 'Melting Cheese', val: defaultCheese?.name }
                      ].map(ing => (
                        <div key={ing.label} className="flex justify-between items-center border-b border-char-950/5 pb-1.5">
                          <span className="text-xs font-bold text-char-950/60">{ing.label}</span>
                          <span className="font-display font-bold text-char-950 text-sm">{ing.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-char-950 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg viewBox="0 0 24 24" className="h-16 w-16 fill-current">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 mb-1">Estimated Energy</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-4xl font-black">
                        <Counter value={totalCalories} />
                      </span>
                      <span className="text-xs font-bold uppercase text-stone-400">kcal</span>
                    </div>
                    <p className="mt-2 text-[9px] italic text-stone-500">*Values are based on standard recipe proportions.</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDetails(null)}
                  className="mt-8 w-full py-3.5 rounded-full bg-white border-2 border-char-950/10 text-char-950 font-black uppercase tracking-widest text-[10px] hover:bg-tomato-dark hover:text-white hover:border-tomato-dark transition-all active:scale-95 shadow-md hover:shadow-xl"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-char-950 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-2xl animate-rise">
          {toast}
        </div>
      )}

      {bursts.map(b => (
        <FlourBurst
          key={b.id}
          x={b.x}
          y={b.y}
          onComplete={() => setBursts(prev => prev.filter(item => item.id !== b.id))}
        />
      ))}
    </>
  );
};

export default Menu;
