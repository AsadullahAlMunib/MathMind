import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({ content, children, position = 'top', delay = 0.3 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0, x: position === 'left' ? 4 : position === 'right' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className={`absolute z-[100] px-3 py-1.5 text-[10px] font-bold text-white bg-slate-900 border border-white/10 dark:bg-slate-800 rounded-lg shadow-xl shadow-black/20 whitespace-nowrap pointer-events-none ${getPositionClasses()}`}
          >
            {content}
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-[6px] border-transparent ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-800' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-800' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-800' :
              'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-800'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
