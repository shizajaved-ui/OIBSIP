import { useState } from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import SearchOverlay from './SearchOverlay.jsx';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

const PizzaOvenIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Oven Dome with brick detail */}
    <path d="M3 20c0-9 7-12 9-12s9 3 9 12" />
    <path d="M7 11c1.5-1 3.5-1.5 5-1.5s3.5.5 5 1.5" opacity="0.4" />
    <path d="M5 15c2-1 5-2 7-2s5 1 7 2" opacity="0.4" />
    {/* Oven Base */}
    <path d="M2 20h20" strokeWidth="2" />
    {/* Oven Opening */}
    <path d="M7 20a5 5 0 0 1 10 0" fill="rgba(0,0,0,0.1)" />
    {/* Fire/Flame inside */}
    <path d="M12 18c1.5 0 2.5-1.5 2.5-2.5s-1-2-2.5-2-2.5 1-2.5 2 1 2.5 2.5 2.5z" fill="#C84E29" stroke="none" className="animate-pulse" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21.5 7H6" />
  </svg>
);

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Menu', path: '/menu' },
  { label: 'Build a pizza', path: '/build' },
  { label: 'About', path: '/about' },
];

const Navbar = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // 13px, bold, wide-tracked, uppercase — per spec. Active tab gets the
  // terracotta underline; inactive tabs stay roasted-brown so they still
  // read clearly against the darker header background.
  const linkClass = (path) => {
    const isActive = !!matchPath({ path, end: path === '/' }, location.pathname);

    return `pb-1 text-[9px] md:text-[13px] font-black uppercase tracking-wider md:tracking-[0.15em] transition-all duration-300 ${
      isActive
        ? 'border-b-2 border-tomato text-tomato'
        : 'border-b-2 border-transparent text-char-950/40 hover:text-tomato'
    }`;
  };

  const pillClass =
    'flex items-center gap-2 rounded-full bg-[#A83D1F] px-2 md:px-5 py-2 md:py-2.5 text-[9px] md:text-[12px] font-black uppercase tracking-[0.1em] text-white shadow-md transition-all duration-300 hover:bg-char-950 hover:shadow-lg active:scale-95';

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-char-950/10 bg-[#F5E6D3]"
    >
      <div className="mx-auto flex w-full items-center justify-between px-1.5 md:px-12 py-3 md:py-4 relative">
        {/* Left Side: Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-1 md:gap-3 group z-10">
          <div className="h-7 w-7 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-white/20 drop-shadow-md transition-transform group-hover:scale-105">
            <img
              src="/assets/logo-artisan.png"
              alt="The Artisan Crust"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-display text-[10px] md:text-2xl font-black tracking-tight text-char-950 hidden sm:block">
            The Artisan Crust
          </span>
        </Link>

        {/* Middle: Main Nav - Centered and compact on mobile */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 xs:gap-3 sm:gap-10">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} className={linkClass(item.path)}>
              <span className={item.label === 'Build a pizza' ? 'hidden sm:inline' : ''}>
                {item.label === 'Build a pizza' ? 'Build' : item.label}
              </span>
              {item.label === 'Build a pizza' && <span className="sm:hidden">Build</span>}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className={linkClass('/admin')}>Admin</Link>
          )}
        </nav>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-1 md:gap-3 z-10">
          <div className="flex items-center gap-1 md:gap-3 border-l-2 border-char-950/5 pl-1 md:pl-6">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className={`${pillClass} ${searchOpen ? 'border-tomato text-tomato ring-2 ring-tomato/10' : ''}`}
            >
              <SearchIcon />
              <span className="hidden xl:inline">Search</span>
            </button>

            <Link to={user ? '/account' : '/login'} className={pillClass}>
              <UserIcon />
              <span className="hidden xl:inline">Account</span>
            </Link>

            <Link to="/cart" className={`relative ${pillClass}`}>
              <CartIcon />
              <span className="hidden xl:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 md:-right-2 -top-1 md:-top-2 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-tomato text-[8px] md:text-[10px] font-black text-white shadow-md">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </div>
    </header>
  );
};

export default Navbar;
