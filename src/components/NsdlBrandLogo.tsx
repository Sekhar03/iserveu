import React from 'react';

interface NsdlBrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  hidePartner?: boolean;
}

export const NsdlBrandLogo: React.FC<NsdlBrandLogoProps> = ({
  className = 'h-9',
  variant = 'light',
  hidePartner = false,
}) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#7A171D';
  const dividerColor = isDark ? 'rgba(255,255,255,0.25)' : '#CBD5E1';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* NSDL Payments Bank logo combo */}
      <div className="flex items-center gap-2">
        {/* NSDL Golden Spiral Emblem */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#df9328] to-[#b87012] flex items-center justify-center shrink-0 shadow-xs border border-[#f5b84c]/40">
          <svg viewBox="0 0 40 40" className="w-5.5 h-5.5" fill="none">
            <path
              d="M 20 6 C 12 6 7 12 7 20 C 7 25 11 30 16 32 C 14 29 13 25 14 22 C 15 17 19 14 24 13 C 28 12 32 15 33 19 C 34 22 32 27 28 29 C 25 31 21 31 19 30 C 22 34 27 35 31 33 C 35 30 36 26 35 21 C 34 15 28 11 22 11 C 16 11 13 16 14 22"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.95"
            />
            <circle cx="20" cy="20" r="3" fill="#FFFFFF" opacity="0.9" />
          </svg>
        </div>

        {/* NSDL Payments Bank Typography */}
        <div className="flex items-baseline tracking-tight font-serif whitespace-nowrap">
          <span
            className="font-extrabold text-lg tracking-tight font-serif"
            style={{ color: textColor }}
          >
            NSDL
          </span>
          <span
            className="font-bold text-base font-sans ml-1 tracking-tight"
            style={{ color: textColor }}
          >
            Payments Bank
          </span>
        </div>
      </div>

      {/* Partner Divider and iServeU logo */}
      {!hidePartner && (
        <div className="flex items-center">
          <div
            className="h-6 w-[1.5px] mx-3 rounded-full"
            style={{ backgroundColor: dividerColor }}
          />
          <div className="flex items-baseline">
            <span className="font-black text-lg tracking-tight font-sans text-[#00bcd4]">
              iServeU
            </span>
            <span
              className="text-[9px] font-bold ml-0.5 align-super"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              ®
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
