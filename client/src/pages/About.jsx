import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const VALUES = [
  { title: 'Stone-fired, always', desc: 'Every crust goes into a real wood-fired oven, not a conveyor belt.' },
  { title: 'You build it', desc: 'Pick every layer yourself — crust, sauce, cheese, toppings — or order a classic off the menu.' },
  { title: 'Fresh, not frozen', desc: 'Dough is made same-day. Toppings are prepped every morning, never a week ahead.' },
];

const About = () => (
  <PageLayout title="About Us" subtitle="Our story, our values, and our passion for pizza." width="6xl" isFloating fullMobile useDoodleOverlay>
    <div className="text-center">
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tighter text-char-950 mb-8 leading-[1.1]">
            A pizzeria built around the idea that everyone's "perfect pizza" is different.
        </h2>
        <p className="max-w-3xl mx-auto text-base md:text-lg font-medium text-char-950/40 italic leading-relaxed mb-12">
        The Artisan Crust started as a single stone oven and a stubborn belief: the best pizza
        is the one you actually wanted, not the one that happened to be on the
        menu. So we built a place — and an app — where the crust, the sauce, the
        cheese, and every topping are entirely up to you.
        </p>
    </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
    {VALUES.map((v) => (
        <div key={v.title} className="bg-char-850 rounded-[32px] p-8 shadow-sm border border-tomato/10 transition-all hover:shadow-md hover:-translate-y-1">
        <h3 className="font-display text-lg font-bold text-tomato mb-2">{v.title}</h3>
        <p className="text-sm font-medium text-char-950/50 leading-relaxed">{v.desc}</p>
        </div>
    ))}
    </div>

    <div className="mt-16 flex flex-col items-center gap-4 p-8 md:p-12 text-center rounded-[48px] bg-basil/10 border border-basil/20 shadow-sm">
        <span className="text-5xl">🍕</span>
        <h3 className="font-display text-3xl font-black text-char-950">Hungry yet?</h3>
        <p className="max-w-md text-lg font-medium text-char-950/60 italic">
            Pick something off the menu, or start from scratch and build your own from the crust up.
        </p>
        <Link to="/menu" className="btn-primary mt-4 px-10 py-4 text-lg shadow-xl shadow-tomato/20">
            View Menu
        </Link>
    </div>
  </PageLayout>
);

export default About;

export default About;
