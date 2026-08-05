import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const VALUES = [
  { title: 'Stone-fired, always', desc: 'Every crust goes into a real wood-fired oven, not a conveyor belt.' },
  { title: 'You build it', desc: 'Pick every layer yourself — crust, sauce, cheese, toppings — or order a classic off the menu.' },
  { title: 'Fresh, not frozen', desc: 'Dough is made same-day. Toppings are prepped every morning, never a week ahead.' },
];

const About = () => (
  <div className="doodle-bg min-h-[calc(100vh-80px)] px-6 py-20 flex flex-col items-center">
    <div className="w-full max-w-6xl bg-char-800 p-10 md:p-20 shadow-2xl rounded-[64px] border border-char-950/5">
        <div className="flex justify-center mb-10">
            <span className="rounded-full bg-[#A83D1F] px-8 py-3 text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-md">
                Our story
            </span>
        </div>

        <div className="text-center">
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-char-950 mb-10 leading-[0.95]">
                A pizzeria built around the idea that everyone's "perfect pizza" is different.
            </h1>
            <p className="max-w-3xl mx-auto text-base font-medium text-char-950/40 italic leading-relaxed mb-16">
            The Artisan Crust started as a single stone oven and a stubborn belief: the best pizza
            is the one you actually wanted, not the one that happened to be on the
            menu. So we built a place — and an app — where the crust, the sauce, the
            cheese, and every topping are entirely up to you.
            </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
            <div key={v.title} className="bg-char-800 rounded-[32px] p-8 shadow-sm border border-tomato/20 transition-all hover:shadow-md hover:-translate-y-1">
            <h3 className="font-display text-lg font-bold text-tomato mb-2">{v.title}</h3>
            <p className="text-sm font-medium text-char-950/50 leading-relaxed">{v.desc}</p>
            </div>
        ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-4 p-12 text-center rounded-[48px] bg-basil/10 border border-basil/20 shadow-sm">
            <span className="text-5xl">🍕</span>
            <h2 className="font-display text-3xl font-black text-char-950">Hungry yet?</h2>
            <p className="max-w-md text-lg font-medium text-char-950/60 italic">
                Pick something off the menu, or start from scratch and build your own from the crust up.
            </p>
            <Link to="/menu" className="btn-primary mt-4 px-10 py-4 text-lg shadow-xl shadow-tomato/20">
                View Menu
            </Link>
        </div>
    </div>
  </div>
);

export default About;
