import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Cpu, TrendingUp, DollarSign, CheckCircle2, Zap, BarChart3 } from 'lucide-react';
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

  const tickerItems = [
    { label: 'UPI Settlement Batch C10', val: '₹8,420 Cr', status: '100% Matched', color: 'text-emerald-400' },
    { label: 'BBPS BOU Cycle 9', val: '₹1,250 Cr', status: 'Cleared', color: 'text-cyan-400' },
    { label: 'AePS Settlement C8', val: '₹3,140 Cr', status: '99.98% Precision', color: 'text-emerald-400' },
    { label: 'IMPS Batch C4', val: '₹4,890 Cr', status: 'Processed', color: 'text-cyan-400' },
    { label: 'RuPay PPI Daily', val: '₹940 Cr', status: 'Settled', color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B1E36] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#10B981]/20 via-[#0B1E36] to-[#040D1A] relative overflow-hidden font-sans select-none">
      {/* 1. Dynamic Financial Background Orbs */}
      <div className="absolute top-1/6 left-1/12 w-[600px] h-[600px] bg-[#10B981]/15 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/6 right-1/12 w-[550px] h-[550px] bg-[#00A8B5]/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] bg-[#059669]/10 rounded-full blur-[120px] pointer-events-none animate-float-slow" />

      {/* 2. Background Animated SVG Financial Trend Wave */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M -100 400 Q 300 200, 700 450 T 1600 300 T 2400 500"
          fill="none"
          stroke="#10B981"
          strokeWidth="3"
          className="animate-dash-flow"
        />
        <path
          d="M -100 500 Q 400 300, 900 550 T 1800 350 T 2600 600"
          fill="none"
          stroke="#00D2D3"
          strokeWidth="2"
          className="animate-dash-flow"
          style={{ animationDuration: '4.5s' }}
        />
      </svg>

      {/* 3. Floating Financial Currency & Math Symbols */}
      <div className="hidden lg:block absolute top-16 left-1/4 text-3xl font-extrabold text-[#10B981]/25 animate-float-slow pointer-events-none">₹</div>
      <div className="hidden lg:block absolute bottom-36 left-1/5 text-4xl font-black text-[#00D2D3]/20 animate-float-delayed pointer-events-none">%</div>
      <div className="hidden lg:block absolute top-28 right-1/4 text-3xl font-bold text-[#10B981]/20 animate-float-slow pointer-events-none">📈</div>
      <div className="hidden lg:block absolute bottom-44 right-1/6 text-4xl font-extrabold text-[#00D2D3]/25 animate-float-delayed pointer-events-none">₹</div>

      {/* 4. Floating Live Financial Metric Cards */}
      <div className="hidden lg:flex absolute top-24 left-16 p-4 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white items-center gap-3.5 animate-float-slow pointer-events-none max-w-xs z-0">
        <div className="w-11 h-11 rounded-xl bg-[#10B981]/25 text-[#34D399] flex items-center justify-center border border-[#10B981]/40 shrink-0 shadow-lg shadow-[#10B981]/20">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Daily Recon Volume</div>
          <div className="text-base font-black text-[#34D399] flex items-center gap-1.5 leading-tight">
            <span>₹18,450 Cr / Day</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30">+14.2%</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute bottom-28 right-16 p-4 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white items-center gap-3.5 animate-float-delayed pointer-events-none max-w-xs z-0">
        <div className="w-11 h-11 rounded-xl bg-[#00A8B5]/25 text-[#00D2D3] flex items-center justify-center border border-[#00A8B5]/40 shrink-0 shadow-lg shadow-[#00A8B5]/20">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Auto Matching Rate</div>
          <div className="text-base font-black text-[#00D2D3] flex items-center gap-2">
            <span>99.98% Precision</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute top-28 right-24 p-3.5 px-4.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white items-center gap-2.5 animate-float-slow pointer-events-none z-0">
        <ShieldCheck className="w-5 h-5 text-[#34D399]" />
        <span className="text-xs font-extrabold text-slate-200">256-bit Bank Grade Encrypted</span>
      </div>

      {/* Main Content Area: Centered Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-auto">
        <div className="w-full max-w-[425px] bg-white/95 backdrop-blur-3xl border border-white/60 rounded-3xl p-8 shadow-2xl shadow-[#040D1A]/60 relative z-10 space-y-6 transform transition-all duration-300 hover:shadow-[#10B981]/20">
          
          {/* Brand Header with Official iServeU Logo */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center pt-1 pb-2">
              <img
                src="/iserveu_official_logo.svg"
                alt="iServeU Registered Logo"
                className="h-16 w-auto max-w-[250px] object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-[#0B1E36] tracking-tight flex items-center justify-center gap-1.5">
                <span>Reconciliation Platform</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#059669] border border-[#10B981]/30 uppercase">
                  FINTECH
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                NPCI Automated Settlement & Financial Clearing
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                Corporate ID / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#059669]" />
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-[#0B1E36] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:bg-white transition-all shadow-xs"
                  placeholder="name@iserveu.in"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-[#059669] hover:text-[#047857] transition">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#059669]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-[#0B1E36] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:bg-white transition-all shadow-xs"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#059669] transition cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00A8B5] via-[#059669] to-[#10B981] hover:opacity-95 text-white font-extrabold text-sm transition-all duration-300 shadow-lg shadow-[#10B981]/30 hover:shadow-[#10B981]/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="pt-2 text-center space-y-1 border-t border-slate-100">
            <p className="text-[11px] font-bold text-[#059669] tracking-wide">
              Powered by iServeU Financial Technologies
            </p>
          </div>
        </div>
      </div>

      {/* 5. Live Moving Financial Ticker Banner Across Bottom */}
      <div className="w-full bg-[#040D1A]/90 backdrop-blur-xl border-t border-[#10B981]/30 py-2.5 overflow-hidden z-20">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs font-extrabold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-[#34D399]" />
              <span>{item.label}:</span>
              <span className="text-white font-black">{item.val}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-bold ${item.color} border border-white/10`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


