import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PARTICLE_COUNT = 15;

const FlourBurst = ({ x, y, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      size: 4 + Math.random() * 8,
      opacity: 0.4 + Math.random() * 0.4,
      duration: 0.6 + Math.random() * 0.4,
    }));
    setParticles(generated);

    const timer = setTimeout(() => onComplete(), 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="pointer-events-none fixed z-[999]"
      style={{ left: x, top: y }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: p.opacity, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
          className="absolute rounded-full bg-white shadow-[0_0_10px_white]"
          style={{ width: p.size, height: p.size }}
        />
      ))}
      {/* Cloud effect */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0.5 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-white/20 blur-xl"
      />
    </div>
  );
};

export default FlourBurst;
