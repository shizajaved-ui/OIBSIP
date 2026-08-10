import React from 'react';
import { motion } from 'framer-motion';

const PageLayout = ({ children, title, subtitle, width = '3xl', showDoodle = true, isFloating = false, useDoodleOverlay = false, fullMobile = false }) => {
  // Width mapping for consistency
  const widthClasses = {
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    'full': 'max-w-full'
  };

  return (
    <div className={`min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-104px)] ${showDoodle ? 'doodle-bg' : 'bg-char-900'} flex justify-center ${isFloating ? (fullMobile ? 'items-start py-0 md:py-20 px-0 md:px-6' : 'items-start py-10 md:py-20 px-4 md:px-6') : 'items-stretch'}`}>
      {/*
          This centered container acts as the "split" in the background.
          It stretches vertically to ensure there's no white space below it.
      */}
      <div
        className={`w-full ${widthClasses[width] || 'max-w-3xl'} shadow-2xl flex flex-col items-center py-10 md:py-16 px-4 md:px-12 transition-all duration-500 ${isFloating ? (fullMobile ? 'rounded-none md:rounded-[64px] border-none md:border border-char-950/5 min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-104px)]' : 'rounded-[40px] md:rounded-[64px] border border-char-950/5') : ''} ${useDoodleOverlay ? 'doodle-bg relative' : 'bg-char-800'}`}
      >
        {useDoodleOverlay && (
          <div className={`absolute inset-0 bg-[#FFFCF7]/30 ${isFloating ? (fullMobile ? 'rounded-none md:rounded-[64px]' : 'rounded-[40px] md:rounded-[64px]') : ''}`} />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="relative z-10 w-full flex flex-col items-center"
        >
          {(title || subtitle) && (
            <div className="w-full bg-basil/[0.08] rounded-[32px] md:rounded-[48px] border-2 border-basil/10 p-8 md:p-12 text-center mb-10 md:mb-14 shadow-sm relative overflow-hidden group">
              {/* Subtle noise texture for that premium card look */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

              {title && (
                <h1 className="relative z-10 font-display text-3xl md:text-5xl font-black tracking-tight text-char-950 mb-3 md:mb-4 transition-transform group-hover:scale-[1.01]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="relative z-10 text-sm md:text-lg font-bold text-basil/70 italic tracking-wide">
                  {subtitle}
                </p>
              )}

              {/* Decorative corner accent */}
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-basil/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-basil/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          )}
          <div className="w-full">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PageLayout;
