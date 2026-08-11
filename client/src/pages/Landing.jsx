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
    className="absolute h-24 w-2 rounded-full bg-white/30 blur-md"
    style={{ left: x, bottom: '85%' }}
    animate={{
      y: [0, -60],
      x: [0, 10, -10, 5],
      opacity: [0, 0.8, 0],
      scale: [0.8, 1.5]
    }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeOut' }}
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
    <div className="doodle-bg min-h-[calc(100vh-104px)] px-0 md:px-6 pt-0 pb-16 md:py-16 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-[1200px] px-0 md:px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 bg-char-800/30 md:bg-char-800/70 backdrop-blur-2xl md:backdrop-blur-xl rounded-none md:rounded-[64px] pt-16 pb-12 px-8 md:p-20 shadow-[0_30px_100px_-15px_rgba(42,33,24,0.4)] border-y md:border border-white/20 md:border-white/10 text-center lg:text-left relative overflow-hidden">
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-tomato/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-basil/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

          <div className="text-center lg:text-left px-4 md:px-0 relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-block rounded-full border border-tomato/30 bg-tomato/10 px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-tomato shadow-sm"
            >
              Stone-fired, built your way
            </motion.span>
            <h1 className="font-display text-5xl md:text-[68px] font-black leading-[1.05] tracking-tight text-char-950">
              Your perfect pizza
              <br />
              <span className="text-tomato italic text-4xl md:text-[68px] drop-shadow-sm">starts here.</span>
            </h1>
            <p className="mt-8 mx-auto lg:mx-0 max-w-md text-base md:text-lg font-medium text-char-950/60 italic leading-relaxed text-center lg:text-left">
              Craft your signature pie from scratch. Premium ingredients, real stone ovens, delivered fresh in real-time.
            </p>
            <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6">
              <Link
                to="/register"
                className="btn-primary px-10 py-4 md:py-5 text-base md:text-lg transition w-full sm:w-auto text-center"
              >
                Start building
              </Link>
              <Link
                to="/login"
                className="rounded-full border-2 border-char-950/5 bg-white/50 backdrop-blur-md px-10 py-4 md:py-5 text-base md:text-lg font-black uppercase tracking-widest text-char-950 transition hover:bg-white hover:border-char-950/20 active:scale-95 w-full sm:w-auto text-center shadow-lg"
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

        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setHighlight(s.layer)}
              onMouseLeave={() => setHighlight(null)}
              className="group bg-white/40 backdrop-blur-md rounded-[40px] p-10 shadow-xl border border-white/20 transition-all duration-500 hover:-translate-y-2 hover:bg-white/60 hover:shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-tomato/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-tomato/10 transition-colors" />
              <h3 className="font-display text-2xl font-black text-tomato mb-3 relative z-10">{s.step}</h3>
              <p className="text-base font-bold text-char-950/60 leading-relaxed relative z-10">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
