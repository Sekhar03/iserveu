import React from 'react';

export const NsdlLoginIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 540 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Soft Drop Shadows */}
        <filter id="phone-shadow" x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.12" />
        </filter>
        <filter id="shield-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#8B151B" floodOpacity="0.3" />
        </filter>
        <filter id="chair-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.14" />
        </filter>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A82830" />
          <stop offset="100%" stopColor="#781116" />
        </linearGradient>
        <linearGradient id="beanbag-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9E2F37" />
          <stop offset="100%" stopColor="#6E1015" />
        </linearGradient>
      </defs>

      {/* Ceiling Hanging Lamps */}
      <line x1="180" y1="0" x2="180" y2="70" stroke="#E2E8F0" strokeWidth="1.5" />
      <polygon points="172,70 188,70 193,88 167,88" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <ellipse cx="180" cy="88" rx="13" ry="3" fill="#E2E8F0" />

      <line x1="330" y1="0" x2="330" y2="55" stroke="#E2E8F0" strokeWidth="1.5" />
      <polygon points="322,55 338,55 343,73 317,73" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <ellipse cx="330" cy="73" rx="13" ry="3" fill="#E2E8F0" />

      <line x1="375" y1="0" x2="375" y2="85" stroke="#E2E8F0" strokeWidth="1.5" />
      <polygon points="367,85 383,85 388,103 362,103" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <ellipse cx="375" cy="103" rx="13" ry="3" fill="#E2E8F0" />

      {/* Background Decorative Faint Coin Rings */}
      <g opacity="0.35">
        <circle cx="115" cy="220" r="32" stroke="#CBD5E1" strokeWidth="2.5" fill="#F8FAFC" />
        <circle cx="115" cy="220" r="24" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
        <text x="110" y="228" font-family="'Times New Roman', serif" font-weight="bold" font-size="24" fill="#94A3B8">$</text>
      </g>

      <g opacity="0.25">
        <circle cx="430" cy="285" r="36" stroke="#CBD5E1" strokeWidth="2.5" fill="#F8FAFC" />
        <circle cx="430" cy="285" r="28" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
        <text x="424" y="295" font-family="'Times New Roman', serif" font-weight="bold" font-size="28" fill="#94A3B8">$</text>
      </g>

      {/* Smartphone Device Frame */}
      <g filter="url(#phone-shadow)">
        <rect x="200" y="105" width="165" height="300" rx="28" fill="#FFFFFF" stroke="#475569" strokeWidth="5" />
        {/* Notch / Speaker */}
        <rect x="255" y="115" width="55" height="4.5" rx="2" fill="#94A3B8" />
        {/* Screen Bezel Accent */}
        <rect x="207" y="128" width="151" height="265" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

        {/* Bank Facade Illustration on Smartphone Screen */}
        <g transform="translate(237, 150)">
          {/* Triangular Pediment / Roof */}
          <polygon points="45,8 90,32 0,32" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="5" y="32" width="80" height="5" fill="#CBD5E1" />
          {/* 4 Bank Columns */}
          <rect x="12" y="37" width="9" height="38" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <rect x="30" y="37" width="9" height="38" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <rect x="51" y="37" width="9" height="38" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <rect x="69" y="37" width="9" height="38" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          {/* Bank Base Steps */}
          <rect x="2" y="75" width="86" height="5" fill="#CBD5E1" />
          <rect x="0" y="80" width="90" height="4" fill="#94A3B8" />
        </g>

        {/* Login Inputs on Smartphone Screen */}
        <g transform="translate(225, 252)">
          {/* Username Input Graphic */}
          <rect x="0" y="0" width="115" height="15" rx="3" fill="#EEF4FC" stroke="#CBD5E1" strokeWidth="0.8" />
          <circle cx="8" cy="7.5" r="3" fill="#8B151B" opacity="0.7" />
          <rect x="15" y="5.5" width="38" height="4" rx="1" fill="#CBD5E1" />

          {/* Password Input Graphic */}
          <rect x="0" y="21" width="115" height="15" rx="3" fill="#EEF4FC" stroke="#CBD5E1" strokeWidth="0.8" />
          <rect x="6" y="27" width="5" height="4" rx="1" fill="#8B151B" opacity="0.7" />
          <circle cx="18" cy="28.5" r="1.5" fill="#94A3B8" />
          <circle cx="24" cy="28.5" r="1.5" fill="#94A3B8" />
          <circle cx="30" cy="28.5" r="1.5" fill="#94A3B8" />
          <circle cx="36" cy="28.5" r="1.5" fill="#94A3B8" />

          {/* Phone Screen "LOGIN" Button */}
          <rect x="20" y="44" width="75" height="16" rx="4" fill="#851419" />
          <text x="40" y="55" font-family="sans-serif" font-weight="bold" font-size="8.5" fill="#FFFFFF" letter-spacing="1">LOGIN</text>
        </g>
      </g>

      {/* Security Shield Floating Over Phone */}
      <g transform="translate(180, 100)" filter="url(#shield-shadow)">
        <path
          d="M 32 0 L 64 12 C 64 36 50 56 32 64 C 14 56 0 36 0 12 Z"
          fill="url(#shield-grad)"
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
        {/* Padlock Icon in Shield */}
        <g transform="translate(24, 22)">
          <path d="M 5 8 L 5 4 C 5 1.8 6.8 0 9 0 C 11.2 0 13 1.8 13 4 L 13 8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <rect x="2" y="8" width="14" height="11" rx="2" fill="#FFFFFF" />
          <circle cx="9" cy="13" r="1.5" fill="#851419" />
          <line x1="9" y1="14.5" x2="9" y2="16.5" stroke="#851419" strokeWidth="1.2" />
        </g>
      </g>

      {/* Person Sitting in Cozy Beanbag Chair */}
      <g filter="url(#chair-shadow)">
        {/* Beanbag Chair Body */}
        <path
          d="M 125 365 C 100 375 75 350 72 320 C 69 285 85 240 120 230 C 145 223 162 250 170 280 C 176 305 180 340 160 360 C 150 370 135 372 125 365 Z"
          fill="url(#beanbag-grad)"
        />
        <path
          d="M 75 300 C 72 260 95 235 125 232 C 140 230 152 245 155 265 C 140 262 105 272 90 310 Z"
          fill="#B03A43"
          opacity="0.3"
        />

        {/* Person Sitting - Legs, Torso, Arms */}
        {/* Legs / Jeans */}
        <path
          d="M 130 330 C 140 330 165 355 185 365 C 195 370 198 385 185 390 C 172 395 150 365 130 355 Z"
          fill="#2C3E50"
        />
        <ellipse cx="192" cy="382" rx="10" ry="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

        {/* Torso / Sweater */}
        <path
          d="M 115 285 C 115 270 135 265 145 275 C 152 282 155 315 145 325 C 135 330 120 325 115 285 Z"
          fill="#E2E8F0"
          stroke="#CBD5E1"
          strokeWidth="1"
        />

        {/* Arms holding smartphone */}
        <path
          d="M 130 285 C 145 290 155 295 162 305 C 158 312 145 315 135 305 Z"
          fill="#E2E8F0"
        />
        {/* Hands & Mini Phone */}
        <ellipse cx="165" cy="305" rx="5" ry="4" fill="#FBC5B5" />
        <rect x="162" y="296" width="6" height="12" rx="1.5" fill="#1E293B" transform="rotate(15 162 296)" />

        {/* Head & Hair */}
        <ellipse cx="138" cy="254" rx="10" ry="12" fill="#FBC5B5" />
        {/* Glasses */}
        <circle cx="143" cy="254" r="3" stroke="#1E293B" strokeWidth="1" fill="none" />
        <line x1="140" y1="254" x2="137" y2="254" stroke="#1E293B" strokeWidth="1" />
        {/* Dark Hair / Bob */}
        <path
          d="M 126 254 C 126 242 135 238 146 240 C 153 242 154 250 151 258 C 149 262 145 258 143 256 C 140 254 135 254 133 258 C 130 263 126 262 126 254 Z"
          fill="#1E293B"
        />
      </g>

      {/* Coins Stack & Potted Plant - Right Foreground */}
      <g transform="translate(345, 305)">
        {/* Coins Stack 1 */}
        <g>
          <ellipse cx="30" cy="95" rx="18" ry="6" fill="#851419" />
          <ellipse cx="30" cy="90" rx="18" ry="6" fill="#A82830" />
          <ellipse cx="30" cy="85" rx="18" ry="6" fill="#851419" />
          <ellipse cx="30" cy="80" rx="18" ry="6" fill="#A82830" />
          <ellipse cx="30" cy="75" rx="18" ry="6" fill="#851419" />
          <ellipse cx="30" cy="70" rx="18" ry="6" fill="#D48B22" />
          <ellipse cx="30" cy="65" rx="18" ry="6" fill="#F5B84C" />
          <text x="26" y="68" font-family="'Times New Roman', serif" font-weight="bold" font-size="9" fill="#851419">$</text>
        </g>

        {/* Coins Stack 2 (Smaller) */}
        <g transform="translate(-14, 10)">
          <ellipse cx="25" cy="88" rx="14" ry="5" fill="#851419" />
          <ellipse cx="25" cy="83" rx="14" ry="5" fill="#A82830" />
          <ellipse cx="25" cy="78" rx="14" ry="5" fill="#D48B22" />
          <ellipse cx="25" cy="73" rx="14" ry="5" fill="#F5B84C" />
        </g>

        {/* Plant Pot */}
        <g transform="translate(48, 48)">
          <polygon points="12,25 28,25 25,48 15,48" fill="#475569" />
          <ellipse cx="20" cy="25" rx="8" ry="2.5" fill="#64748B" />

          {/* Plant Stems & Red Blossoms */}
          <path d="M 20 25 Q 15 10 5 8" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          <circle cx="5" cy="8" r="4" fill="#851419" />
          <circle cx="7" cy="5" r="3" fill="#A82830" />

          <path d="M 20 25 Q 24 12 32 5" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          <circle cx="32" cy="5" r="4.5" fill="#851419" />
          <circle cx="34" cy="9" r="3" fill="#A82830" />

          <path d="M 20 25 Q 21 8 20 -4" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          <circle cx="20" cy="-4" r="5" fill="#851419" />
          <circle cx="18" cy="-8" r="3.5" fill="#A82830" />
        </g>
      </g>
    </svg>
  );
};
