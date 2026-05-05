import React from 'react';
import iconUrl from '../../icon.png';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 24 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <img 
        src={iconUrl} 
        alt="Math Mind Logo" 
        style={{ width: size, height: size }}
        className="object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}