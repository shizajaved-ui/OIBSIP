import React from 'react';
import { motion } from 'framer-motion';

const PageLayout = ({ children, title, subtitle, width = '3xl', showDoodle = true, isFloating = false }) => {
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
    <div className={`min-h-[calc(100vh-80px)] ${showDoodle ? 'doodle-bg' : 'bg-char-900'} flex justify-center ${isFloating ? 'items-start py-20 px-6' : 'items-stretch'}`}>
      {/*
          This centered container acts as the "split" in the background.
          It stretches vertically to ensure there's no white space below it.
      */}
      <div className={`w-full ${widthClasses[width] || 'max-w-3xl'} bg-char-800 shadow-2xl flex flex-col items-center transition-all duration-500 overflow-hidden ${isFloating ? 'rounded-[64px] border border-char-950/5' : ''}`}>
        {/* Header Section with Doodle Background */}
        {(title || subtitle) && (
          <div className="w-full doodle-bg relative py-12 px-6 md:px-12 border-b border-char-950/10 flex flex-col items-center text-center">
            {/* Warm Beige Overlay */}
            <div className="absolute inset-0 bg-[#FDF5E6]/85" />

            <div className="relative z-10 w-full flex flex-col items-center">
              {title && (
                <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-char-950 mb-4 drop-shadow-sm">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg font-medium text-char-950/40 italic max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="w-full flex flex-col items-center py-12 px-6 md:px-12"
        >
          <div className="w-full">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PageLayout;
