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
    ? inventory.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  const goToItem = (item) => {
    onClose();
    setQuery('');
    if (item.category === 'base') navigate('/menu');
    else navigate('/build');
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-x-0 top-full z-40 border-b border-char-950/10 bg-[#F5E6D3]/95 px-6 py-8 shadow-2xl backdrop-blur-xl sm:px-12"
    >
      <div className="mx-auto flex max-w-4xl items-center gap-6">
        <div className="flex flex-1 items-center gap-4 rounded-full border-2 border-char-950/10 bg-char-800 px-8 py-4 shadow-sm focus-within:ring-4 ring-tomato/20 transition-all">
          <div className="flex shrink-0 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-tomato" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crusts, sauces, cheeses, toppings…"
            className="flex-1 bg-transparent font-display text-xl font-bold text-char-950 outline-none placeholder:font-normal placeholder:italic placeholder:text-char-950/20"
          />
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-char-950 px-10 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-tomato shadow-lg active:scale-95"
        >
          Close
        </button>
      </div>

      {results.length > 0 && (
        <div className="mx-auto mt-6 max-w-4xl divide-y divide-char-950/10 overflow-hidden rounded-[40px] border border-char-950/10 bg-char-800 shadow-xl">
          {results.map((item) => (
            <button
              key={item._id}
              onClick={() => goToItem(item)}
              className="group flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-tomato/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-char-950/5 text-2xl group-hover:bg-tomato/10">
                {getIngredientIcon(item)}
              </div>
              <span className="flex-1">
                <span className="block font-display text-lg font-bold text-char-950">{item.name}</span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-char-950/40">{item.category}</span>
              </span>
              {item.price > 0 && (
                <span className="rounded-full bg-tomato/10 px-3 py-1 text-xs font-black text-tomato">
                  +₹{item.price}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <div className="mx-auto mt-6 max-w-4xl text-center">
          <p className="font-display text-lg italic text-char-950/40">No matches for "{query}" — try another ingredient?</p>
        </div>
      )}
    </div>
  );
};

export default SearchOverlay;
