import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type LinearLoaderProps = {
  onComplete?: () => void;
};

const LinearLoader: React.FC<LinearLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const isCompleting = useRef(false);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const completeLoading = useCallback(() => {
    if (!isMounted.current || isCompleting.current) {
      return;
    }

    isCompleting.current = true;

    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear any existing completion timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    // Force progress to 100%
    progressRef.current = 100;
    setProgress(100);

    // Call onComplete after animation
    completionTimeoutRef.current = setTimeout(() => {
      if (isMounted.current && onComplete) {
        onComplete();
      }
    }, 300);
  }, [onComplete]);

  const updateProgress = useCallback(() => {
    if (!isMounted.current || isCompleting.current) {
      return;
    }

    if (progressRef.current < 90) {
      progressRef.current = Math.min(progressRef.current + Math.random() * 10, 90);
      setProgress(progressRef.current);
    } else if (!isCompleting.current) {
      completeLoading();
    }
  }, [completeLoading]);

  useEffect(() => {
    isMounted.current = true;
    isCompleting.current = false;

    // Reset progress when component mounts
    progressRef.current = 0;
    setProgress(0);

    // Quickly jump to 80% then slowly complete
    const quickProgress = setTimeout(() => {
      if (isMounted.current && !isCompleting.current) {
        progressRef.current = 80;
        setProgress(80);
      }
    }, 200);

    // Set up a progress interval to simulate loading
    intervalRef.current = setInterval(updateProgress, 500);

    // Auto-complete after 5 seconds if not already completed
    const autoCompleteTimeout = setTimeout(() => {
      if (!isCompleting.current) {
        completeLoading();
      }
    }, 5000);

    return () => {
      isMounted.current = false;
      clearTimeout(quickProgress);
      clearTimeout(autoCompleteTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
    };
  }, [updateProgress, completeLoading]);

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 top-0 z-[9999] h-1.5 bg-gray-200">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{
            width: `${progress}%`,
            transition: { duration: 0.5, ease: 'easeInOut' },
          }}
          exit={{ width: '100%', transition: { duration: 0.2 } }}
        />
      </div>
    </AnimatePresence>
  );
};

export default LinearLoader;
