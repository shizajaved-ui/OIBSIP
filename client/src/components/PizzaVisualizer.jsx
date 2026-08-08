import { motion, AnimatePresence } from 'framer-motion';
import { resolveImageUrl } from '../utils/api.js';
import { getIngredientIcon } from '../utils/ingredientIcons.js';

const PizzaVisualizer = ({ selection, step, size = "md", shouldRotate = true }) => {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  const containerSize =
    isLarge ? "h-80 w-80 md:h-[500px] md:w-[500px]" :
    isSmall ? "h-32 w-32" :
    "h-64 w-64 md:h-80 md:w-80";

  // Animation variants for each layer dropping in - Removed blur to keep crust sharp
  const layerVariants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  };

  return (
    <div className={`relative ${containerSize} mx-auto flex items-center justify-center`}>
      {/* Background Glow */}
      <div className="absolute inset-[-10%] rounded-full bg-tomato/5 blur-3xl animate-pulse pointer-events-none" />

      {/* The Stack - Rotation is handled by the parent Wood Board in PizzaBuilder */}
      <div className="relative h-full w-full flex items-center justify-center transform-style-3d">
        <AnimatePresence>
          {/* Layer 1: The Crust (Dough) - 100% Size for maximum visibility */}
          {selection.base && (
            <motion.div
              key="base"
              variants={layerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="absolute inset-0 z-10 flex items-center justify-center"
            >
              <div className="relative w-full h-full rounded-full drop-shadow-[0_8px_16px_rgba(47,31,23,0.4)]">
                <img
                  src={resolveImageUrl(selection.base.previewLayer || selection.base.builderImage || selection.base.image)}
                  alt="Base"
                  className="h-full w-full object-cover rounded-full select-none"
                  style={{ backfaceVisibility: 'hidden' }}
                />
              </div>
            </motion.div>
          )}

          {/* Layer 2: The Sauce - 86% Size (Reveals more crust) */}
          {selection.sauce && (
            <motion.div
              key="sauce"
              variants={layerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-[86%] h-[86%] rounded-full overflow-hidden shadow-inner">
                {selection.sauce.previewLayer ? (
                  <img
                    src={resolveImageUrl(selection.sauce.previewLayer)}
                    alt="Sauce"
                    className="h-full w-full object-cover rounded-full mix-blend-multiply opacity-90"
                    style={{ clipPath: 'circle(50% at 50% 50%)' }}
                  />
                ) : (
                  <div
                    className="h-full w-full rounded-full blur-[2px] shadow-inner mix-blend-multiply"
                    style={{
                      background: selection.sauce.name.toLowerCase().includes('white')
                        ? 'radial-gradient(circle, #FFF9EB 60%, #F5E6D3 85%, transparent 100%)'
                        : 'radial-gradient(circle, #C84E29 65%, #A83D1F 85%, transparent 100%)'
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Layer 3: The Cheese - 82% Size */}
          {selection.cheese && (
            <motion.div
              key="cheese"
              variants={layerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-[82%] h-[82%] rounded-full overflow-hidden">
                {selection.cheese.previewLayer ? (
                  <img
                    src={resolveImageUrl(selection.cheese.previewLayer)}
                    alt="Cheese"
                    className="h-full w-full object-cover rounded-full opacity-95"
                    style={{
                      clipPath: 'circle(50% at 50% 50%)',
                      filter: 'drop-shadow(0 2px 4px rgba(47,31,23,0.2))'
                    }}
                  />
                ) : (
                  <div
                      className={`h-full w-full rounded-full blur-[${isSmall ? '1px' : '4px'}]`}
                      style={{
                          backgroundImage: 'radial-gradient(circle, #FDE68A 10%, #FBBF24 40%, transparent 70%)',
                          backgroundSize: isLarge ? '60px 60px' : '30px 30px',
                          opacity: 0.7
                      }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Layer 4: Toppings - Spaced out and Varied Rotation */}
          {selection.vegetables?.length > 0 && selection.vegetables.map((v, idx) => {
            // Subtle rotation offset for each layer
            const layerRotation = (idx * 45) % 360;

            return (
              <motion.div
                key={v._id}
                variants={layerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
              >
                {/* Topping Container: Shrink to 74% to keep them strictly inside the cheese area */}
                <div className="relative w-[74%] h-[74%] rounded-full overflow-hidden">
                  {v.previewLayer ? (
                    <img
                      src={resolveImageUrl(v.previewLayer)}
                      alt={v.name}
                      className="h-full w-full object-cover filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
                      style={{
                        // Scale down (0.85) to make them look small and realistic
                        transform: `scale(0.85) rotate(${layerRotation}deg)`,
                        transformOrigin: 'center center'
                      }}
                    />
                  ) : (
                    <ToppingEmojiFallback v={v} idx={idx} isLarge={isLarge} isSmall={isSmall} count={selection.vegetables.length} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State Note */}
      {!selection.base && (
        <div className="absolute z-50 text-center pointer-events-none">
          <p className="font-display text-lg md:text-xl font-black text-char-950/20 italic tracking-[0.2em] uppercase leading-relaxed">
            Select<br/>Your Crust
          </p>
          <div className="mt-4 h-1 w-12 bg-char-950/10 mx-auto rounded-full" />
        </div>
      )}
    </div>
  );
};

const ToppingEmojiFallback = ({ v, idx, isLarge, isSmall, count }) => {
  // Use a smaller spread to ensure emojis stay inside the sauce area
  const spread = isLarge ? 120 : isSmall ? 35 : 75;
  const angle = (idx * (2 * Math.PI / count)) + (idx * 0.5);
  return (
    <div
      className={`absolute filter drop-shadow-[0_5px_8px_rgba(47,31,23,0.4)] ${isLarge ? 'text-7xl' : isSmall ? 'text-2xl' : 'text-5xl'}`}
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${Math.sin(angle) * spread}px), calc(-50% + ${Math.cos(angle) * spread}px)) rotate(${idx * 45}deg)`
      }}
    >
      {getIngredientIcon(v)}
    </div>
  );
};

export default PizzaVisualizer;
