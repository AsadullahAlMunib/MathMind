import React from 'react';
import { Brain } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 24 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981] to-[#6366f1] p-2 shadow-xl ring-2 ring-white/20 overflow-hidden ${className}`}>
      {/* Decorative math symbols background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none text-[8px] font-black text-white p-1 flex flex-wrap gap-1 justify-around">
        <span>+</span>
        <span>-</span>
        <span>×</span>
        <span>÷</span>
        <span>∑</span>
        <span>∞</span>
        <span>π</span>
        <span>∫</span>
        <span>%</span>
      </div>
      <Brain className="text-white relative z-10" size={size} strokeWidth={2.5} />
    </div>
  );
}
