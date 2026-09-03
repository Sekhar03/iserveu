import React, { useState } from 'react';
import {
  Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, Globe,
  Fingerprint, FileText, Banknote, RefreshCw, Send,
  Smartphone, CreditCard, QrCode, Volume2, PieChart, ShieldAlert
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

  // Node Positions around the Central iServeU Hub
  const nodes = [
    { label: 'AEPS', icon: Fingerprint, x: 230, y: 120, color: '#00A8B5' },
    { label: 'BBPS', icon: FileText, x: 440, y: 80, color: '#00A8B5' },
    { label: 'CASHOUT PAYOUT', icon: Banknote, x: 490, y: 175, color: '#00A8B5' },
    { label: 'LENDING', icon: Banknote, x: 505, y: 280, color: '#F26522' },
    { label: 'LOS', icon: FileText, x: 505, y: 390, color: '#F26522' },
    { label: 'RECON', icon: RefreshCw, x: 490, y: 500, color: '#00A8B5', isRecon: true },
    { label: 'FRM', icon: ShieldAlert, x: 440, y: 590, color: '#F26522' },
    { label: 'COMMISSION', icon: PieChart, x: 400, y: 650, color: '#F26522' },
    { label: 'UPI', icon: QrCode, x: 240, y: 670, color: '#00A8B5' },
    { label: 'CARDS', icon: CreditCard, x: 165, y: 600, color: '#00A8B5' },
    { label: 'POS', icon: Smartphone, x: 120, y: 500, color: '#00A8B5' },
    { label: 'DMT', icon: Send, x: 110, y: 380, color: '#00A8B5' },
    { label: 'SOUNDBOX', icon: Volume2, x: 135, y: 250, color: '#00A8B5' },
  ];

  const hubCenterX = 320;
  const hubCenterY = 380;

  return (
    <div className="min-h-screen w-full bg-[#FCFDFE] relative flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* Decorative Wave Lines - Bottom Left (Teal) */}
      <svg className="absolute bottom-0 left-0 w-[420px] h-[420px] opacity-25 pointer-events-none z-0" viewBox="0 0 500 500" fill="none">
        <path d="M-100 500 C 100 300, 200 400, 300 100" stroke="#00A8B5" strokeWidth="1.5" />
        <path d="M-100 480 C 120 320, 220 380, 320 120" stroke="#00D2D3" strokeWidth="1" />
        <path d="M-100 460 C 140 340, 240 360, 340 140" stroke="#00A8B5" strokeWidth="1.5" />
        <path d="M-100 440 C 160 360, 260 340, 360 160" stroke="#00838F" strokeWidth="1" />
      </svg>

      {/* Decorative Wave Lines - Top Right (Coral Orange) */}
      <svg className="absolute top-0 right-0 w-[450px] h-[450px] opacity-30 pointer-events-none z-0" viewBox="0 0 500 500" fill="none">
        <path d="M 600 -100 C 350 100, 450 250, 200 400" stroke="#F26522" strokeWidth="1.5" />
        <path d="M 580 -100 C 370 120, 430 270, 220 420" stroke="#E05318" strokeWidth="1" />
        <path d="M 560 -100 C 390 140, 410 290, 240 440" stroke="#F26522" strokeWidth="1.5" />
        <path d="M 540 -100 C 410 160, 390 310, 260 460" stroke="#FF7A38" strokeWidth="1" />
      </svg>

      {/* Top Header Bar */}
      <header className="p-6 px-10 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold hover:text-[#00A8B5] transition cursor-pointer">
          <Globe className="w-4 h-4 text-slate-500" />
          <span>English</span>
        </div>
      </header>

      {/* Main Workspace: Grid with Left Network Constellation & Right Login Card */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 py-4">
        
        {/* LEFT SIDE: iServeU Reconciliation Hub Network Visual (7 Cols) */}
        <div className="lg:col-span-7 relative h-[620px] hidden sm:flex items-center justify-center">
          
          {/* SVG Connecting Paths & Orbital Rings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 640 760">
            {/* Concentric Orbits */}
            <circle cx={hubCenterX} cy={hubCenterY} r="70" stroke="#00A8B5" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={hubCenterX} cy={hubCenterY} r="130" stroke="#00A8B5" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <circle cx={hubCenterX} cy={hubCenterY} r="190" stroke="#00A8B5" strokeWidth="1" strokeDasharray="5 5" opacity="0.25" />
            <circle cx={hubCenterX} cy={hubCenterY} r="250" stroke="#00A8B5" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />

            {/* Connecting Dotted Lines to Nodes */}
            {nodes.map((node, i) => (
              <g key={i}>
                <line
                  x1={hubCenterX}
                  y1={hubCenterY}
                  x2={node.x}
                  y2={node.y}
                  stroke={node.color}
                  strokeWidth={node.isRecon ? "2.5" : "1.5"}
                  strokeDasharray={node.isRecon ? "none" : "4 4"}
                  opacity={node.isRecon ? "0.85" : "0.5"}
                />
                {/* Glowing Data Point Dot along line */}
                <circle
                  cx={hubCenterX + (node.x - hubCenterX) * 0.5}
                  cy={hubCenterY + (node.y - hubCenterY) * 0.5}
                  r={node.isRecon ? "5" : "3.5"}
                  fill={node.color}
                />
              </g>
            ))}
          </svg>

          {/* CENTRAL HUB NODE */}
          <div className="absolute z-20 flex flex-col items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-white shadow-2xl border-4 border-slate-100 flex flex-col items-center justify-center p-4 text-center group cursor-pointer transition-transform duration-300 hover:scale-105">
              <img src="/iserveu_official_logo.svg" alt="iServeU Logo" className="h-10 w-auto object-contain" />
              <span className="text-[10px] font-extrabold text-[#00A8B5] mt-1 tracking-wider uppercase">Recon Hub</span>
            </div>
          </div>

          {/* PERIPHERAL PRODUCT NODES */}
          {nodes.map((node, idx) => {
            const IconComp = node.icon;
            return (
              <div
                key={idx}
                className="absolute flex flex-col items-center justify-center group cursor-pointer transition-all duration-300 hover:scale-110"
                style={{
                  left: `${node.x - 30}px`,
                  top: `${node.y - 30}px`,
                }}
              >
                <div className={`w-14 h-14 rounded-full bg-white shadow-lg border flex items-center justify-center transition-colors ${
                  node.isRecon
                    ? 'border-[#00A8B5] text-[#00A8B5] shadow-[#00A8B5]/20 ring-4 ring-[#00A8B5]/10'
                    : node.color === '#F26522'
                    ? 'border-orange-200 text-[#F26522] hover:border-[#F26522]'
                    : 'border-slate-200 text-[#00A8B5] hover:border-[#00A8B5]'
                }`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-extrabold mt-1.5 uppercase tracking-wider text-center ${
                  node.isRecon ? 'text-[#00A8B5] font-black' : 'text-slate-600'
                }`}>
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE: Login Card Form (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 border border-[#00A8B5]/30 shadow-2xl shadow-slate-200/80 space-y-6 relative z-10">
            
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
                  Welcome to Internal Portals
                </p>
                <h2 className="text-base font-bold text-slate-800">
                  Login to continue to Internal Application.
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

              {/* Primary Coral Orange Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 px-6 rounded-xl bg-[#F26522] hover:bg-[#D95318] text-white font-bold text-sm shadow-md shadow-[#F26522]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
