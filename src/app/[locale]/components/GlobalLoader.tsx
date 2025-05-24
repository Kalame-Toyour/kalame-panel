// src/app/components/GlobalLoader.tsx
'use client';

import { motion } from 'framer-motion';
import React from 'react';

const GlobalLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <motion.div
        className="size-16 rounded-full border-4 border-primary border-t-transparent"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default GlobalLoader;
