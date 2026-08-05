// Matches specific ingredient names first (so "Tomato" shows a tomato, not a
// generic veg icon), then falls back to a sensible icon per category.
const NAME_ICONS = {
  tomato: '🍅',
  onion: '🧅',
  mushroom: '🍄',
  corn: '🌽',
  olives: '🫒',
  olive: '🫒',
  jalapeno: '🌶️',
  capsicum: '🫑',
  basil: '🌿',
  garlic: '🧄',
  mozzarella: '🧀',
  cheddar: '🧀',
  vegan: '🧀',
  pesto: '🌿',
  bbq: '🍖',
  peri: '🌶️',
  alfredo: '🥛',
  tomato_sauce: '🍅',
};

const CATEGORY_ICONS = {
  base: '🍞',
  sauce: '🥫',
  cheese: '🧀',
  vegetable: '🥬',
};

export const getIngredientIcon = (item) => {
  const name = item.name.toLowerCase();
  const nameMatch = Object.keys(NAME_ICONS).find((key) => name.includes(key));
  return nameMatch ? NAME_ICONS[nameMatch] : CATEGORY_ICONS[item.category] || '🍕';
};

// Builds a tiny custom cursor from the matching emoji, encoded as an inline
// SVG data URI — no separate image asset needed. Falls back to the default
// pointer if the browser can't render an SVG cursor for some reason.
export const getCursorStyle = (item) => {
  const emoji = getIngredientIcon(item);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text x='2' y='24' font-size='24'>${emoji}</text></svg>`;
  const encoded = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encoded}") 16 16, pointer`;
};
