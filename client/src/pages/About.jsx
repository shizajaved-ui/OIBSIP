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
        <p className="max-w-3xl mx-auto text-base md:text-lg font-bold text-char-950/80 italic leading-relaxed mb-12">
        The Artisan Crust started as a single stone oven and a stubborn belief: the best pizza
        is the one you actually wanted, not the one that happened to be on the
        menu. So we built a place — and an app — where the crust, the sauce, the
        cheese, and every topping are entirely up to you.
        </p>
    </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
    {VALUES.map((v) => (
        <div key={v.title} className="bg-white/40 backdrop-blur-md rounded-[40px] p-10 shadow-lg border border-white/20 transition-all duration-500 hover:shadow-2xl hover:bg-white/60 hover:-translate-y-2 group">
        <h3 className="font-display text-2xl font-black text-tomato mb-3 group-hover:scale-105 transition-transform duration-300">{v.title}</h3>
        <p className="text-base font-bold text-char-950/60 leading-relaxed">{v.desc}</p>
        </div>
    ))}
    </div>

    <div className="mt-20 flex flex-col items-center gap-6 p-10 md:p-16 text-center rounded-[64px] bg-basil/80 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
        <span className="text-6xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 relative z-10">🍕</span>
        <h3 className="font-display text-4xl font-black relative z-10">Hungry yet?</h3>
        <p className="max-w-md text-xl font-medium text-white/80 italic relative z-10">
            Pick something off the menu, or start from scratch and build your own from the crust up.
        </p>
        <Link to="/menu" className="bg-white text-char-950 px-12 py-5 rounded-full font-black uppercase tracking-widest text-lg shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10">
            View Menu
        </Link>
    </div>
  </PageLayout>
);

export default About;
