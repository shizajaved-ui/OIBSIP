import React from 'react';
import { motion } from 'framer-motion';

const PageLayout = ({
  children,
  title,
  subtitle,
  width = '5xl',
  showDoodle = true,
  isFloating = false,
  useDoodleOverlay = false,
  fullMobile = false,
  transparentMobile = false,
  customMobileBg = ''
}) => {
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

  const mobileBgClass = transparentMobile
    ? 'bg-transparent shadow-none border-none'
    : customMobileBg
      ? customMobileBg
      : useDoodleOverlay
        ? 'doodle-bg md:bg-[#FDF2F0]'
        : 'bg-char-800';

  return (
    <div className={`min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-104px)] ${showDoodle ? 'doodle-bg' : 'bg-char-900'} flex justify-center ${isFloating ? (fullMobile ? 'items-start py-0 md:py-20 px-0 md:px-6' : 'items-start py-10 md:py-20 px-4 md:px-6') : 'items-stretch'}`}>
      {/*
          This centered container acts as the "split" in the background.
          It stretches vertically to ensure there's no white space below it.
      */}
      <div
        className={`w-full ${widthClasses[width] || 'max-w-3xl'} flex flex-col items-center ${fullMobile ? 'py-6 md:py-10 px-0 md:px-10' : 'py-6 md:py-10 px-4 md:px-10'} transition-all duration-500 ${isFloating ? (fullMobile ? 'rounded-none md:rounded-[48px] border-none md:border border-char-950/5 min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-96px)]' : 'rounded-[32px] md:rounded-[48px] border border-char-950/5 shadow-2xl') : 'shadow-2xl'} ${mobileBgClass}`}
      >
        {useDoodleOverlay && !transparentMobile && !customMobileBg && (
          <div className={`absolute inset-0 bg-[#FDF2F0]/10 md:bg-[#FDF2F0]/90 backdrop-blur-[1px] md:backdrop-blur-none ${isFloating ? (fullMobile ? 'rounded-none md:rounded-[64px]' : 'rounded-[40px] md:rounded-[64px]') : ''}`} />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="relative z-10 w-full flex flex-col items-center"
        >
          {(title || subtitle) && (
            <div className={`w-[calc(100%-32px)] md:w-full bg-basil/80 md:bg-basil/[0.12] md:backdrop-blur-md rounded-[20px] md:rounded-[32px] border-2 border-basil/15 p-5 md:p-8 text-center mb-6 md:mb-10 shadow-lg relative overflow-hidden group`}>
              {/* Subtle noise texture for that premium card look */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

              {title && (
                <h1 className="relative z-10 font-display text-2xl md:text-4xl font-black tracking-tight text-white md:text-char-950 mb-1 md:mb-3 transition-transform group-hover:scale-[1.01] drop-shadow-md">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="relative z-10 text-xs md:text-base font-bold text-white/90 md:text-basil/70 italic tracking-wide max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}

              {/* Decorative organic shape */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
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
