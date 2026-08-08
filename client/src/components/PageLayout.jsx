import React from 'react';
import { motion } from 'framer-motion';

const PageLayout = ({ children, title, subtitle, width = '3xl', showDoodle = true, isFloating = false, useDoodleOverlay = false }) => {
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
      <div
        className={`w-full ${widthClasses[width] || 'max-w-3xl'} ${useDoodleOverlay ? 'relative overflow-hidden' : 'bg-char-800'} shadow-2xl flex flex-col items-center py-16 px-6 md:px-12 transition-all duration-500 ${isFloating ? 'rounded-[64px] border border-char-950/5' : ''}`}
        style={useDoodleOverlay ? {
          backgroundImage: 'url("/assets/doodle-border.png")',
          backgroundSize: '300px auto',
          backgroundColor: '#FDF5E6',
          backgroundBlendMode: 'soft-light'
        } : {}}
      >
        {useDoodleOverlay && (
          <div className="absolute inset-0 bg-[#FDF5E6]/80 backdrop-blur-[2px]" />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="relative z-10 w-full flex flex-col items-center"
        >
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-char-950 mb-4">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg font-medium text-char-950/40 italic">
                  {subtitle}
                </p>
              )}
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
