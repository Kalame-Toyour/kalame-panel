import type { Message } from '@/types';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import React from 'react';

type WelcomeMessageProps = {
  message?: Message;
};

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ message }) => {
  const locale = useLocale();

  if (!message || !message.text) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="mx-4 my-2 rounded-3xl rounded-bl-none bg-gray-200 px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      dir={`${locale === 'fa' ? 'rtl' : 'ltr'}`}
    >
      {message.text}
    </motion.div>
  );
};

export default WelcomeMessage;
