import React, { useState } from 'react';
import {
  Lock, Mail, Loader2, Eye, EyeOff, Globe,
  Fingerprint, FileText, Banknote, RefreshCw, Send,
  Smartphone, CreditCard, QrCode, Volume2, PieChart, ShieldAlert, TrendingUp
} from 'lucide-react';
import { UserSession } from '../types';

interface LoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin@iserveu.in');
  const [password, setPassword] = useState('admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        username: username || 'admin@iserveu.in',
        role: '',
        title: 'Finance Admin',
        isLoggedIn: true
      });
    }, 800);
  };

  // 13 Product Nodes mapped with Polar Angle Coordinates for Perfect Alignment
  const cx = 300;
  const cy = 300;
  const radius = 205;

  const nodeConfigs = [
    { label: 'BBPS', icon: FileText, angle: -65, color: '#00A8B5' },
    { label: 'CASHOUT PAYOUT', icon: Banknote, angle: -35, color: '#00A8B5' },
    { label: 'LENDING', icon: TrendingUp, angle: -5, color: '#00A8B5' },
    { label: 'LOS', icon: FileText, angle: 25, color: '#00A8B5' },
    { label: 'RECON', icon: RefreshCw, angle: 55, color: '#00A8B5', isRecon: true },
    { label: 'FRM', icon: ShieldAlert, angle: 85, color: '#00A8B5' },
    { label: 'COMMISSION', icon: PieChart, angle: 115, color: '#00A8B5' },
    { label: 'UPI', icon: QrCode, angle: 145, color: '#00A8B5' },
    { label: 'CARDS', icon: CreditCard, angle: 170, color: '#00A8B5' },
    { label: 'POS', icon: Smartphone, angle: 195, color: '#00A8B5' },
    { label: 'DMT', icon: Send, angle: 220, color: '#00A8B5' },
    { label: 'SOUNDBOX', icon: Volume2, angle: 245, color: '#00A8B5' },
    { label: 'AEPS', icon: Fingerprint, angle: 275, color: '#00A8B5' },
  ];

  const computedNodes = nodeConfigs.map((cfg) => {
    const rad = (cfg.angle * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);
    // Midpoint along connecting line
    const midX = cx + (radius * 0.55) * Math.cos(rad);
    const midY = cy + (radius * 0.55) * Math.sin(rad);
    return { ...cfg, x, y, midX, midY };
  });

  return (
    <div className="min-h-screen w-full bg-[#FCFDFE] relative flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* Decorative Wave Lines - Bottom Left (Teal) */}
      <svg className="absolute bottom-0 left-0 w-[440px] h-[440px] opacity-25 pointer-events-none z-0" viewBox="0 0 500 500" fill="none">
        <path d="M-100 500 C 100 300, 200 400, 300 100" stroke="#00A8B5" strokeWidth="1.5" />
        <path d="M-100 480 C 120 320, 220 380, 320 120" stroke="#00D2D3" strokeWidth="1" />
        <path d="M-100 460 C 140 340, 240 360, 340 140" stroke="#00A8B5" strokeWidth="1.5" />
        <path d="M-100 440 C 160 360, 260 340, 360 160" stroke="#00838F" strokeWidth="1" />
      </svg>

      {/* Decorative Wave Lines - Top Right (Teal Cyan) */}
      <svg className="absolute top-0 right-0 w-[450px] h-[450px] opacity-25 pointer-events-none z-0" viewBox="0 0 500 500" fill="none">
        <path d="M 600 -100 C 350 100, 450 250, 200 400" stroke="#00A8B5" strokeWidth="1.5" />
        <path d="M 580 -100 C 370 120, 430 270, 220 420" stroke="#00D2D3" strokeWidth="1" />
        <path d="M 560 -100 C 390 140, 410 290, 240 440" stroke="#00A8B5" strokeWidth="1.5" />
        <path d="M 540 -100 C 410 160, 390 310, 260 460" stroke="#00838F" strokeWidth="1" />
      </svg>

      {/* Top Header Bar */}
      <header className="p-6 px-10 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold hover:text-[#00A8B5] transition cursor-pointer">
          <Globe className="w-4 h-4 text-slate-500" />
          <span>English</span>
        </div>
      </header>

      {/* Main Workspace: Grid with Left Network Constellation & Right Login Card */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10 py-2">
        
        {/* LEFT SIDE: iServeU Reconciliation Hub Network Visual (7 Cols) */}
        <div className="lg:col-span-7 relative h-[580px] w-full hidden sm:flex items-center justify-center">
          
          <div className="w-[580px] h-[580px] relative flex items-center justify-center">
            {/* Unified SVG Container rendering Orbits, Lines, Hub & ForeignObjects for 100% Pixel Alignment */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 600">
              <defs>
                <filter id="glow-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00A8B5" floodOpacity="0.15" />
                </filter>
                <filter id="hub-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* Concentric Grey/Teal Orbit Bands */}
              <circle cx={cx} cy={cy} r="205" fill="#f1f5f9" opacity="0.6" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx={cx} cy={cy} r="150" fill="#e2e8f0" opacity="0.6" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx={cx} cy={cy} r="95" fill="#94a3b8" opacity="0.4" stroke="#64748b" strokeWidth="1" />

              {/* Connecting Radial Lines & Data Dots */}
              {computedNodes.map((node, i) => (
                <g key={i}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={node.x}
                    y2={node.y}
                    stroke={node.color}
                    strokeWidth={node.isRecon ? "2.5" : "1.5"}
                    strokeDasharray={node.isRecon ? "none" : "3 3"}
                    opacity={node.isRecon ? "0.9" : "0.55"}
                  />
                  {/* Data dot on orbit line */}
                  <circle
                    cx={node.midX}
                    cy={node.midY}
                    r={node.isRecon ? "4.5" : "3.5"}
                    fill={node.color}
                  />
                </g>
              ))}

              {/* CENTRAL HUB NODE */}
              <g transform={`translate(${cx - 70}, ${cy - 70})`} filter="url(#hub-shadow)">
                <circle cx="70" cy="70" r="68" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                <foreignObject x="15" y="25" width="110" height="90">
                  <div className="w-full h-full flex flex-col items-center justify-center text-center">
                    <img src="/iserveu_official_logo.svg" alt="iServeU Logo" className="h-8 w-auto object-contain" />
                    <span className="text-[10px] font-extrabold text-[#00A8B5] mt-1 tracking-wider uppercase">RECON HUB</span>
                  </div>
                </foreignObject>
              </g>

              {/* PERIPHERAL PRODUCT NODES */}
              {computedNodes.map((node, idx) => {
                const IconComp = node.icon;
                return (
                  <g key={idx} transform={`translate(${node.x - 26}, ${node.y - 26})`}>
                    <foreignObject x="-30" y="-30" width="112" height="110" className="overflow-visible">
                      <div className="w-full h-full flex flex-col items-center justify-center group cursor-pointer">
                        <div className={`w-13 h-13 rounded-full bg-white shadow-md border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                          node.isRecon
                            ? 'border-2 border-[#00A8B5] text-[#00A8B5] shadow-[#00A8B5]/25 ring-4 ring-[#00A8B5]/15'
                            : 'border-slate-200 text-[#00A8B5] hover:border-[#00A8B5]'
                        }`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className={`text-[9px] font-extrabold mt-1 uppercase tracking-wider text-center leading-tight max-w-[85px] ${
                          node.isRecon ? 'text-[#00A8B5] font-black' : 'text-slate-700'
                        }`}>
                          {node.label}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>

        </div>

        {/* RIGHT SIDE: Login Card Form (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[410px] bg-white rounded-3xl p-8 border border-[#00A8B5]/30 shadow-2xl shadow-slate-200/80 space-y-6 relative z-10">
            
            {/* Header Brand */}
            <div className="space-y-4">
              <div className="flex items-center justify-start">
                <img
                  src="/iserveu_official_logo.svg"
                  alt="iServeU Logo"
                  className="h-11 w-auto object-contain"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">
                  Welcome to Reconciliation Portal
                </p>
                <h2 className="text-base font-bold text-slate-800">
                  Login to continue to Reconciliation Engine.
                </h2>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              
              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#00838F]">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20 transition"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#00838F]">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20 transition"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00A8B5] focus:ring-[#00A8B5] cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Remember me on this device
                </label>
              </div>

              {/* Primary iServeU Cyan Logo Gradient Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 px-6 rounded-xl bg-gradient-to-r from-[#00D2D3] via-[#00A8B5] to-[#00838F] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#00A8B5]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>

            {/* Forgot Credentials Link */}
            <div className="pt-2 text-center">
              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-bold text-[#00A8B5] hover:underline"
              >
                Forgot username or password?
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] font-semibold text-slate-400 border-t border-slate-100 relative z-10">
        Powered by iServeU Financial Technologies
      </footer>
    </div>
  );
};
