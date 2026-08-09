import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { getIngredientIcon } from '../utils/ingredientIcons.js';

const SearchOverlay = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [inventory, setInventory] = useState([]);
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  useEffect(() => {
    api.get('/inventory').then(({ data }) => setInventory(data));

    // Handle click outside to close
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const results = query.trim()
    ? inventory
        .filter((i) => i.category === 'base' && i.name.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  const goToItem = (item) => {
    onClose();
    setQuery('');
    navigate('/menu');
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-x-0 top-full z-40 flex justify-center px-4 md:px-6 py-4"
    >
      <div className="w-full max-w-3xl animate-rise">
        <div className="flex items-center gap-4 rounded-full border-2 border-char-950/15 bg-char-850 p-2 pl-6 shadow-2xl backdrop-blur-xl ring-8 ring-char-950/5">
          <div className="flex shrink-0 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-tomato" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pizza flavors…"
            className="flex-1 bg-transparent font-display text-base md:text-lg font-bold text-char-950 outline-none placeholder:font-normal placeholder:italic placeholder:text-char-950/30"
          />
          <button
            onClick={onClose}
            className="rounded-full bg-char-950 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-tomato shadow-md active:scale-95"
          >
            Close
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-3 divide-y divide-char-950/5 overflow-hidden rounded-[32px] border border-char-950/10 bg-char-800/95 shadow-2xl backdrop-blur-md">
            {results.map((item) => (
              <button
                key={item._id}
                onClick={() => goToItem(item)}
                className="group flex w-full items-center gap-4 px-6 py-3 text-left transition hover:bg-tomato/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-char-950/5 text-xl group-hover:bg-tomato/10">
                  {getIngredientIcon(item)}
                </div>
                <span className="flex-1">
                  <span className="block font-display text-base font-bold text-char-950">{item.name}</span>
                  <span className="block text-[9px] font-black uppercase tracking-widest text-char-950/40">{item.category}</span>
                </span>
                {item.price > 0 && (
                  <span className="rounded-full bg-tomato/10 px-2 py-0.5 text-[10px] font-black text-tomato">
                    +₹{item.price}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="mt-3 rounded-[24px] bg-char-800/90 p-4 text-center shadow-lg backdrop-blur-sm">
            <p className="font-display text-base italic text-char-950/40">No matches for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
