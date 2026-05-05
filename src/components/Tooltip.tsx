import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 0.3 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClickExited, setIsClickExited] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, xPivot: 50, yOffset: 0 });

  const updatePosition = () => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Center point of the trigger in viewport coordinates
    const triggerCenterX = containerRect.left + containerRect.width / 2;
    
    // xPivot: Pivot point based on screen position (0-100%)
    // This makes tooltips grow towards the center of the screen
    const xPivot = (triggerCenterX / viewportWidth) * 100;
    
    let left = triggerCenterX;
    let xPivotFinal = xPivot;
    let top = 0;
    let yOffset = 0;
    let finalPosition = position;

    // Estimate height/width if not yet measured
    const estimatedHeight = tooltipRef.current?.offsetHeight || 120;
    const estimatedWidth = tooltipRef.current?.offsetWidth || 200;

    // Auto-flip vertical if near vertical edges
    if (position === 'top' && containerRect.top < estimatedHeight + 20) {
      finalPosition = 'bottom';
    } else if (position === 'bottom' && containerRect.bottom > viewportHeight - estimatedHeight - 20) {
      finalPosition = 'top';
    }

    // Auto-flip horizontal if near horizontal edges
    if (position === 'left' && containerRect.left < estimatedWidth + 20) {
      finalPosition = 'right';
    } else if (position === 'right' && containerRect.right > viewportWidth - estimatedWidth - 20) {
      finalPosition = 'left';
    }

    if (finalPosition === 'top' || finalPosition === 'bottom') {
      if (finalPosition === 'top') {
        top = containerRect.top - 8;
        yOffset = -100;
        if (top - estimatedHeight < 10) top = estimatedHeight + 10;
      } else {
        top = containerRect.bottom + 8;
        yOffset = 0;
        if (top + estimatedHeight > viewportHeight - 10) top = viewportHeight - estimatedHeight - 10;
      }
    } else {
      top = containerRect.top + containerRect.height / 2;
      yOffset = -50;
      xPivotFinal = finalPosition === 'left' ? 100 : 0;
      left = finalPosition === 'left' ? containerRect.left - 8 : containerRect.right + 8;
      
      // Safety horizontal
      if (finalPosition === 'left' && left - estimatedWidth < 10) {
        left = estimatedWidth + 10;
      } else if (finalPosition === 'right' && left + estimatedWidth > viewportWidth - 10) {
        left = viewportWidth - estimatedWidth - 10;
      }
    }

    setCoords({
      top,
      left,
      xPivot: xPivotFinal,
      yOffset
    });
  };

  useEffect(() => {
    if (isVisible) {
      // First pass
      updatePosition();
      
      // Second pass after a frame to ensure content is measured if changed
      const frame = requestAnimationFrame(updatePosition);
      
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, content]);

  const handleMouseEnter = () => {
    if (isClickExited) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setIsClickExited(false);
  };

  const handleClick = () => {
    setIsVisible(false);
    setIsClickExited(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: `translate(-${coords.xPivot}%, ${coords.yOffset}%)`,
              width: 'max-content',
              maxWidth: 'min(calc(100vw - 32px), 280px)',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
            className="px-3 py-2 text-[11px] font-bold text-white bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 text-center leading-tight"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
