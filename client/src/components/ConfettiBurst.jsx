import { useEffect, useState } from 'react';

// Shape + color per pizza category, so the confetti visually matches what was just picked
// (e.g. picking a veg drops little green/red flecks like
const CATEGORY_STYLES = {
  base: { colors: ['#D9A441', '#8F8550'], shape: 'square' },
  sauce: { colors: ['#C84E29', '#A83D1F'], shape: 'circle' },
  cheese: { colors: ['#D9A441', '#E8C06B'], shape: 'circle' },
  vegetable: { colors: ['#5C7A3A', '#C84E29', '#20180899'], shape: 'circle' },
};

const PIECE_COUNT = 26;

const ConfettiBurst = ({ category = 'vegetable', originX = 50, onComplete }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.vegetable;
    const generated = Array.from({ length: PIECE_COUNT }).map((_, i) => ({
      id: i,
      left: Math.min(98, Math.max(2, originX + (Math.random() * 40 - 20))),
      size: 6 + Math.random() * 8,
      color: style.colors[Math.floor(Math.random() * style.colors.length)],
      shape: style.shape,
      duration: 1.6 + Math.random() * 1.2,
      delay: Math.random() * 0.15,
      drift: (Math.random() - 0.5) * 120,
      spin: (Math.random() - 0.5) * 720,
    }));
    setPieces(generated);

    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [category, originX, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiBurst;
