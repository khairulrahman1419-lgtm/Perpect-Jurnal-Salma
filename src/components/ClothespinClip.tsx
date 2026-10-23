import React from 'react';

interface ClothespinClipProps {
  color?: 'wood' | 'teal' | 'yellow' | 'pink' | 'white';
  rotation?: number; // degrees
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ClothespinClip: React.FC<ClothespinClipProps> = ({
  color = 'wood',
  rotation = 0,
  size = 'md',
  className = '',
}) => {
  // Dimension setups
  const dimensions = {
    sm: { w: 22, h: 38 },
    md: { w: 26, h: 44 },
    lg: { w: 32, h: 54 },
  };

  const { w, h } = dimensions[size];

  // Palette setups
  const palettes = {
    wood: {
      bodyMain: '#D4A373',
      bodyDark: '#BC8A5F',
      bodyLight: '#E6CCB2',
      metal: '#94A3B8',
      metalDark: '#64748B',
    },
    teal: {
      bodyMain: '#2DD4BF',
      bodyDark: '#0D9488',
      bodyLight: '#99F6E4',
      metal: '#94A3B8',
      metalDark: '#64748B',
    },
    yellow: {
      bodyMain: '#FBBF24',
      bodyDark: '#D97706',
      bodyLight: '#FDE68A',
      metal: '#94A3B8',
      metalDark: '#64748B',
    },
    pink: {
      bodyMain: '#F472B6',
      bodyDark: '#DB2777',
      bodyLight: '#FBCFE8',
      metal: '#94A3B8',
      metalDark: '#64748B',
    },
    white: {
      bodyMain: '#F1F5F9',
      bodyDark: '#CBD5E1',
      bodyLight: '#FFFFFF',
      metal: '#94A3B8',
      metalDark: '#64748B',
    },
  };

  const p = palettes[color];

  return (
    <div
      className={`inline-block pointer-events-none select-none drop-shadow-sm ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 28 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Drop shadow of the clip */}
        <ellipse cx="14" cy="45" rx="8" ry="2.5" fill="rgba(0,0,0,0.12)" />

        {/* Left Wooden Leg */}
        <rect x="7" y="2" width="5.5" height="42" rx="2.5" fill={p.bodyMain} />
        {/* Left Leg Highlight */}
        <rect x="7.5" y="4" width="1.8" height="38" rx="0.9" fill={p.bodyLight} opacity="0.6" />
        {/* Left Leg Shadow line */}
        <line x1="12" y1="4" x2="12" y2="42" stroke={p.bodyDark} strokeWidth="0.8" opacity="0.5" />

        {/* Right Wooden Leg */}
        <rect x="15.5" y="2" width="5.5" height="42" rx="2.5" fill={p.bodyMain} />
        {/* Right Leg Highlight */}
        <rect x="16" y="4" width="1.8" height="38" rx="0.9" fill={p.bodyLight} opacity="0.6" />
        {/* Right Leg Shadow line */}
        <line x1="20.5" y1="4" x2="20.5" y2="42" stroke={p.bodyDark} strokeWidth="0.8" opacity="0.5" />

        {/* Metallic Spring Coil in the middle */}
        <rect x="5.5" y="19" width="17" height="6.5" rx="3.25" fill={p.metal} stroke={p.metalDark} strokeWidth="1" />
        {/* Coil loops */}
        <circle cx="14" cy="22.25" r="2.2" fill={p.metalDark} />
        <circle cx="14" cy="22.25" r="1.2" fill="#FFFFFF" opacity="0.8" />
        
        {/* Metallic spring arms extending */}
        <path d="M7 21 L3 16" stroke={p.metalDark} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M21 21 L25 28" stroke={p.metalDark} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
