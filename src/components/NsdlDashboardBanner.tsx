import React from 'react';

export const NsdlDashboardBanner: React.FC<{ onDismiss?: () => void }> = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs mb-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Headings */}
      <div className="max-w-xl mx-auto space-y-1 z-10">
        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
          Welcome to NSDL
        </h2>
        <p className="text-base font-semibold text-slate-700">
          Banking made easy - Just in a jiffy •
        </p>
      </div>

      {/* Analytics Dashboard Illustration */}
      <div className="w-full max-w-2xl mt-6 relative h-64 sm:h-72 flex items-center justify-center">
        <svg viewBox="0 0 680 340" fill="none" className="w-full h-full object-contain">
          <defs>
            <filter id="dash-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.06" />
            </filter>
          </defs>

          {/* Browser / Dashboard Window */}
          <g filter="url(#dash-shadow)" transform="translate(100, 30)">
            <rect x="0" y="0" width="460" height="240" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            {/* Window Title Bar */}
            <rect x="0" y="0" width="460" height="26" rx="8" fill="#851419" />
            {/* Window Dots */}
            <circle cx="15" cy="13" r="3.5" fill="#EF4444" />
            <circle cx="28" cy="13" r="3.5" fill="#F59E0B" />
            <circle cx="41" cy="13" r="3.5" fill="#10B981" />

            {/* Left Nav Bar of Dashboard */}
            <rect x="0" y="26" width="45" height="214" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
            <rect x="8" y="38" width="28" height="4" rx="2" fill="#851419" />
            <rect x="8" y="52" width="22" height="3" rx="1.5" fill="#CBD5E1" />
            <rect x="8" y="64" width="25" height="3" rx="1.5" fill="#CBD5E1" />
            <rect x="8" y="76" width="18" height="3" rx="1.5" fill="#CBD5E1" />

            {/* Main Window Dashboard Widgets */}
            {/* Widget 1: Line Chart Area */}
            <g transform="translate(60, 40)">
              <rect x="0" y="0" width="180" height="85" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
              <text x="10" y="16" font-family="sans-serif" font-size="7" font-weight="bold" fill="#64748B">Regional Reconciliation Volume</text>
              {/* Grid lines */}
              <line x1="10" y1="30" x2="170" y2="30" stroke="#E2E8F0" strokeDasharray="2 2" />
              <line x1="10" y1="50" x2="170" y2="50" stroke="#E2E8F0" strokeDasharray="2 2" />
              <line x1="10" y1="70" x2="170" y2="70" stroke="#CBD5E1" />
              {/* Trend Lines */}
              <path d="M 15 65 Q 45 35 75 52 T 135 32 T 165 42" stroke="#851419" strokeWidth="2" fill="none" />
              <path d="M 15 68 Q 45 55 75 62 T 135 48 T 165 58" stroke="#D48B22" strokeWidth="1.5" fill="none" />
            </g>

            {/* Widget 2: Bar Chart */}
            <g transform="translate(255, 40)">
              <rect x="0" y="0" width="185" height="85" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
              {/* Bars */}
              <rect x="25" y="45" width="10" height="30" rx="2" fill="#851419" />
              <rect x="42" y="30" width="10" height="45" rx="2" fill="#94A3B8" />
              <rect x="60" y="22" width="10" height="53" rx="2" fill="#851419" />
              <rect x="78" y="38" width="10" height="37" rx="2" fill="#94A3B8" />
              <rect x="96" y="18" width="10" height="57" rx="2" fill="#851419" />
              <rect x="114" y="28" width="10" height="47" rx="2" fill="#851419" />
              <rect x="132" y="42" width="10" height="33" rx="2" fill="#94A3B8" />
              <rect x="150" y="15" width="10" height="60" rx="2" fill="#851419" />
              <line x1="15" y1="75" x2="175" y2="75" stroke="#CBD5E1" />
            </g>

            {/* Widget 3: KPI Metrics Cards */}
            <g transform="translate(60, 138)">
              <rect x="0" y="0" width="85" height="85" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
              <text x="10" y="18" font-family="sans-serif" font-size="7" font-weight="600" fill="#64748B">Settlement Rate</text>
              <text x="10" y="42" font-family="sans-serif" font-size="20" font-weight="bold" fill="#851419">99.8%</text>
              {/* Mini ring */}
              <circle cx="55" cy="62" r="14" stroke="#E2E8F0" strokeWidth="4" fill="none" />
              <circle cx="55" cy="62" r="14" stroke="#851419" strokeWidth="4" strokeDasharray="70 20" fill="none" transform="rotate(-90 55 62)" />
            </g>

            <g transform="translate(155, 138)">
              <rect x="0" y="0" width="85" height="85" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
              <text x="10" y="18" font-family="sans-serif" font-size="7" font-weight="600" fill="#64748B">Active Channels</text>
              <text x="10" y="42" font-family="sans-serif" font-size="20" font-weight="bold" fill="#1E293B">42</text>
              <text x="10" y="58" font-family="sans-serif" font-size="7" font-weight="600" fill="#10B981">● All Cycles Up</text>
            </g>

            {/* Widget 4: Donut Chart Area */}
            <g transform="translate(255, 138)">
              <rect x="0" y="0" width="185" height="85" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
              <text x="12" y="18" font-family="sans-serif" font-size="7" font-weight="bold" fill="#64748B">Product Distribution</text>
              {/* Semi-circle Gauge / Donut */}
              <circle cx="60" cy="55" r="24" stroke="#E2E8F0" strokeWidth="7" fill="none" />
              <circle cx="60" cy="55" r="24" stroke="#851419" strokeWidth="7" strokeDasharray="60 100" fill="none" transform="rotate(-90 60 55)" />
              <circle cx="60" cy="55" r="24" stroke="#D48B22" strokeWidth="7" strokeDasharray="30 100" fill="none" transform="rotate(40 60 55)" />
              <circle cx="60" cy="55" r="24" stroke="#00BCD4" strokeWidth="7" strokeDasharray="25 100" fill="none" transform="rotate(110 60 55)" />
              
              <text x="100" y="38" font-family="sans-serif" font-size="8" font-weight="600" fill="#851419">■ UPI / IMPS</text>
              <text x="100" y="52" font-family="sans-serif" font-size="8" font-weight="600" fill="#D48B22">■ BBPS</text>
              <text x="100" y="66" font-family="sans-serif" font-size="8" font-weight="600" fill="#00BCD4">■ AEPS / DMT</text>
            </g>
          </g>

          {/* Illustrated Person Working with Laptop on Left */}
          <g transform="translate(40, 140)">
            {/* Chair */}
            <rect x="50" y="80" width="25" height="60" rx="3" fill="#64748B" />
            <line x1="62" y1="140" x2="62" y2="160" stroke="#334155" strokeWidth="4" />
            <line x1="45" y1="160" x2="80" y2="160" stroke="#334155" strokeWidth="4" />

            {/* Person Torso */}
            <path d="M 60 70 C 60 55 75 52 85 58 C 92 64 94 90 85 100 C 76 105 62 100 60 70 Z" fill="#851419" />
            {/* Arm & Laptop */}
            <path d="M 72 70 Q 88 78 98 84" stroke="#FBC5B5" strokeWidth="6" strokeLinecap="round" />
            {/* Laptop Base and Screen */}
            <polygon points="90,85 125,85 120,88 85,88" fill="#64748B" />
            <polygon points="98,60 120,60 120,85 98,85" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />

            {/* Head & Hair */}
            <circle cx="76" cy="42" r="10" fill="#FBC5B5" />
            <path d="M 68 40 C 68 30 75 28 84 30 C 88 32 88 38 86 42 Z" fill="#334155" />
          </g>

          {/* Plant on Far Right */}
          <g transform="translate(580, 195)">
            <polygon points="15,40 35,40 31,70 19,70" fill="#475569" />
            <ellipse cx="25" cy="40" rx="10" ry="3" fill="#64748B" />
            <path d="M 25 40 Q 20 20 8 15 Q 18 28 25 40" fill="#851419" />
            <path d="M 25 40 Q 30 15 42 10 Q 32 25 25 40" fill="#A82830" />
            <path d="M 25 40 Q 25 10 26 -2 Q 22 15 25 40" fill="#851419" />
          </g>
        </svg>
      </div>
    </div>
  );
};
