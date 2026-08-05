import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { resolveImageUrl } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getIngredientIcon } from '../utils/ingredientIcons.js';
import { playClickSound } from '../utils/sound.js';

const BASE_PRICE = 199;

const MenuCard = ({ item, defaultSauce, defaultCheese, onQuickAdd, adding }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !item.image || imgFailed;
  const total = BASE_PRICE + (item.price || 0) + (defaultSauce?.price || 0) + (defaultCheese?.price || 0);

  return (
    <motion.button
      onClick={() => onQuickAdd(item)}
      whileTap={{ scale: 0.97 }}
      disabled={adding === item._id}
      className="group relative h-56 w-full overflow-hidden rounded-[32px] border bg-char-800 text-left shadow-lg transition-all duration-200 border-char-950/5 hover:border-tomato/30"
    >
      {!showFallback ? (
        <>
          <img
            src={resolveImageUrl(item.image)}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgFailed(true)}
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

      <span className="absolute left-4 top-4 rounded-full bg-tomato px-3 py-1 font-display text-[12px] font-black text-white shadow-md">
        ₹{total}
      </span>

      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-black leading-[1.1] tracking-tight text-white drop-shadow-md">{item.name}</h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-stone-300/80 truncate">
            {defaultSauce?.name} · {defaultCheese?.name}
          </p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-char-950 text-white shadow-lg transition-all group-hover:bg-tomato ${adding === item._id ? 'animate-pulse' : ''}`}>
           <span className="text-xl font-bold">{adding === item._id ? '·' : '+'}</span>
        </div>
      </div>
    </motion.button>
  );
};

const Menu = () => {
  const [inventory, setInventory] = useState([]);
  const [adding, setAdding] = useState(null);
  const [toast, setToast] = useState('');
  const { user } = useAuth();
  const { addToCart, refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/inventory').then(({ data }) => setInventory(data));
  }, []);

  const bases = inventory.filter((i) => i.category === 'base');
  const sauces = inventory.filter((i) => i.category === 'sauce');
  const cheeses = inventory.filter((i) => i.category === 'cheese');

  // "Included" defaults — whichever sauce/cheese cost nothing extra, since
  // that's what a plain quick-order pizza should use.
  const defaultSauce = sauces.find((s) => !s.price) || sauces[0];
  const defaultCheese = cheeses.find((c) => !c.price) || cheeses[0];

  const handleQuickAdd = async (base) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!defaultSauce || !defaultCheese) return;
    playClickSound();
    setAdding(base._id);
    try {
      await addToCart({ base: base._id, sauce: defaultSauce._id, cheese: defaultCheese._id, vegetables: [] });
      setToast(`${base.name} added to cart`);
      setTimeout(() => setToast(''), 2200);
    } catch {
      setToast('Could not add to cart — try again');
      setTimeout(() => setToast(''), 2200);
    } finally {
      setAdding(null);
      refreshCart();
    }
  };

  return (
    <div className="doodle-bg min-h-[calc(100vh-80px)] px-6 py-20 flex flex-col items-center">
      <div className="w-full max-w-[1440px] bg-char-800 p-8 md:p-16 shadow-2xl rounded-[64px] border border-char-950/5">
        <div className="flex items-end justify-between gap-4 border-b-2 border-char-950/5 pb-8 mb-10">
          <div>
            <h1 className="font-display text-5xl font-black tracking-tight text-char-950">Menu</h1>
            <p className="mt-2 text-lg font-medium text-char-950/40 italic">
              Ready to order pizzas? Or head to Build a Pizza to customize every layer yourself!
            </p>
          </div>
          <button
            onClick={() => navigate('/build')}
            className="hidden shrink-0 rounded-full border-2 border-char-950/10 bg-white px-8 py-3 text-sm font-black uppercase tracking-widest text-char-950 transition-all hover:border-char-950/30 sm:block"
          >
            Build your own
          </button>
        </div>

        {bases.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-bold text-char-950/20 italic animate-pulse">Loading the menu…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {bases.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                defaultSauce={defaultSauce}
                defaultCheese={defaultCheese}
                onQuickAdd={handleQuickAdd}
                adding={adding}
              />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-char-950 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-2xl animate-rise">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Menu;
