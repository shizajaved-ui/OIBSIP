import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Layered SVG pizza. Toppings can be dimmed/highlighted based on which
// feature card the user is hovering, so the illustration reacts — small
// touch, but it makes the page feel alive instead of static.
const PizzaIllustration = ({ highlight }) => {
  const dim = (layer) => (highlight && highlight !== layer ? 0.25 : 1);

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full overflow-visible">
      {/* base */}
      <motion.circle
        cx="150" cy="150" r="130" fill="#FFFFFF" stroke="#EADFCF" strokeWidth="2"
        animate={{ opacity: dim('base') }}
        transition={{ duration: 0.25 }}
      />
      {/* crust ring */}
      <motion.circle
        cx="150" cy="150" r="112" fill="none" stroke="#A8763A" strokeWidth="10"
        animate={{ opacity: dim('base') }}
        transition={{ duration: 0.25 }}
      />
      {/* sauce & cheese */}
      <motion.circle
        cx="150" cy="150" r="98" fill="#E3C583"
        animate={{ opacity: dim('sauce') }}
        transition={{ duration: 0.25 }}
      />
      {[0, 60, 120].map((angle) => (
        <line
          key={angle}
          x1="150" y1="150"
          x2={150 + 98 * Math.cos((angle * Math.PI) / 180)}
          y2={150 + 98 * Math.sin((angle * Math.PI) / 180)}
          stroke="#A8763A" strokeWidth="2" opacity="0.35"
        />
      ))}
      {/* toppings */}
      <motion.g animate={{ opacity: dim('toppings') }} transition={{ duration: 0.25 }}>
        {[
          [110, 105], [190, 115], [150, 150], [100, 175], [200, 180], [150, 210], [160, 90], [120, 205],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="13" fill="#C84E29" />
        ))}
        {[[130, 130], [175, 145], [140, 190], [180, 100]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="#5C7A3A" />
        ))}
      </motion.g>
    </svg>
  );
};

const Steam = ({ delay, x }) => (
  <motion.div
    className="absolute h-16 w-1.5 rounded-full bg-char-700/40"
    style={{ left: x, bottom: '92%' }}
    animate={{ y: [-4, -28, -4], opacity: [0, 0.6, 0] }}
    transition={{ duration: 3.2, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

const FEATURES = [
  { step: 'Base', layer: 'base', desc: '5 crusts, from thin to stuffed.' },
  { step: 'Sauce & Cheese', layer: 'sauce', desc: 'Classic tomato to pesto & vegan cheese.' },
  { step: 'Toppings', layer: 'toppings', desc: 'Stack as many vegetables as you like.' },
];

const Landing = () => {
  const [highlight, setHighlight] = useState(null);

  return (
    <div className="doodle-bg min-h-[calc(100vh-80px)] px-6 py-16 flex flex-col items-center">
      <div className="w-full max-w-[1100px]">
        <div className="grid items-center gap-12 lg:grid-cols-2 bg-char-800/80 backdrop-blur-md rounded-[56px] p-10 md:p-16 shadow-2xl border border-white/20">
          <div>
            <span className="mb-4 inline-block rounded-full border border-tomato/20 bg-tomato/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-tomato">
              Stone-fired, built your way
            </span>
            <h1 className="font-display text-4xl font-black leading-tight tracking-[-0.02em] text-char-950 sm:text-[54px]">
              Every pizza starts
              <br />
              <span className="text-tomato italic">as an empty base.</span>
            </h1>
            <p className="mt-6 max-w-md text-base font-medium text-char-950/50 italic leading-relaxed">
              Pick your crust, your sauce, your cheese, your toppings. Track it
              from the stone oven to your door — in real time.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                to="/register"
                className="btn-primary px-8 py-3.5 text-base transition active:scale-95 shadow-xl shadow-tomato/20"
              >
                Start building
              </Link>
              <Link
                to="/login"
                className="rounded-full border-2 border-char-950/10 bg-white px-8 py-3.5 text-base font-black uppercase tracking-widest text-char-950 transition hover:border-char-950/30 active:scale-95"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-64 w-64 sm:h-[350px] sm:w-[350px]">
            {/* ambient color glow behind the pizza for depth */}
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-tomato/20 via-crust/15 to-basil/10 blur-3xl" />

            <Steam delay={0} x="42%" />
            <Steam delay={1} x="52%" />
            <Steam delay={2} x="60%" />

            <motion.div
              className="h-full w-full drop-shadow-[0_20px_40px_rgba(42,33,24,0.22)]"
              animate={{ rotate: [0, 6, -6, 0], y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05, rotate: 8, transition: { duration: 0.3 } }}
            >
              <PizzaIllustration highlight={highlight} />
            </motion.div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((s) => (
            <div
              key={s.step}
              onMouseEnter={() => setHighlight(s.layer)}
              onMouseLeave={() => setHighlight(null)}
              className="bg-char-800 rounded-[32px] p-8 shadow-sm border border-char-950/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default"
            >
              <h3 className="font-display text-lg font-bold text-tomato mb-2">{s.step}</h3>
              <p className="text-sm font-medium text-char-950/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
