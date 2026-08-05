const Inventory = require('../models/Inventory');

// Every pizza starts at this flat price before add-ons — defined once, here,
// so the "Build a Pizza" flow and the Menu -> Cart flow can't drift apart.
// Previously the cart route summed ingredient add-ons only; this flat fee
// was applied nowhere on that path, so an identical pizza was ₹199 cheaper
// through the cart than through the builder.
const BASE_PRICE = 199;

// Recomputes a pizza's price entirely server-side, from the current
// Inventory prices — never from a number the client sent. Trusting a
// client-supplied total lets anyone submit any price for any pizza.
const calculatePizzaPrice = async ({ base, sauce, cheese, vegetables = [] }) => {
  const ids = [base, sauce, cheese, ...vegetables];
  const docs = await Inventory.find({ _id: { $in: ids } });
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));

  if (!byId.has(String(base)) || !byId.has(String(sauce)) || !byId.has(String(cheese))) {
    throw new Error('One or more selected ingredients no longer exist');
  }

  let price = BASE_PRICE;
  for (const id of ids) {
    const doc = byId.get(String(id));
    if (doc) price += doc.price || 0;
  }
  return price;
};

module.exports = { BASE_PRICE, calculatePizzaPrice };
