import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Cpu, Activity, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071322] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0e8696]/25 via-[#0b1c30] to-[#040914] p-4 relative overflow-hidden font-sans">
      {/* 1. Dynamic Glowing Background Mesh Orbs */}
      <div className="absolute top-1/6 left-1/10 w-[550px] h-[550px] bg-[#119db0]/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/8 right-1/10 w-[500px] h-[500px] bg-[#10b981]/15 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-[#3b82f6]/15 rounded-full blur-[110px] pointer-events-none animate-float-slow" />

      {/* Subtle Animated Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* 2. Floating Live Metric Cards (Background Decorators) */}
      <div className="hidden lg:flex absolute top-24 left-16 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white items-center gap-3 animate-float-slow pointer-events-none max-w-xs z-0">
        <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center border border-[#10b981]/30 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-200">Recon Engine Status</div>
          <div className="text-sm font-extrabold text-[#10b981] flex items-center gap-1.5">
            <span>99.98% Precision</span>
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute bottom-28 right-16 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white items-center gap-3 animate-float-delayed pointer-events-none max-w-xs z-0">
        <div className="w-10 h-10 rounded-xl bg-[#119db0]/20 text-[#23c5da] flex items-center justify-center border border-[#119db0]/30 shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-200">NPCI Clearing Batches</div>
          <div className="text-sm font-extrabold text-[#23c5da]">10 Settlement Cycles</div>
        </div>
      </div>

      <div className="hidden lg:flex absolute top-32 right-24 p-3.5 px-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white items-center gap-2.5 animate-float-slow pointer-events-none z-0">
        <ShieldCheck className="w-4 h-4 text-[#10b981]" />
        <span className="text-xs font-bold text-slate-200">256-bit Bank Grade Security</span>
      </div>

      {/* 3. Main Login Glass Card */}
      <div className="w-full max-w-[425px] bg-white/95 backdrop-blur-3xl border border-white/60 rounded-3xl p-8 shadow-2xl shadow-slate-950/50 relative z-10 space-y-6 transform transition-all duration-300 hover:shadow-[#119db0]/20">
        
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
            <h1 className="text-xl font-extrabold text-[#1b2a3e] tracking-tight">
              Reconciliation Platform
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Automated Transaction Settlement & Analytics
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Corporate ID / Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#119db0]" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-[#1b2a3e] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#119db0] focus:border-[#119db0] focus:bg-white transition-all shadow-xs"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-[#119db0] hover:text-[#0e8696] transition">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#119db0]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-[#1b2a3e] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#119db0] focus:border-[#119db0] focus:bg-white transition-all shadow-xs"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#119db0] transition cursor-pointer p-1"
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
                className="w-4 h-4 rounded border-slate-300 text-[#119db0] focus:ring-[#119db0] cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition">Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#119db0] via-[#0e8696] to-[#10b981] hover:opacity-95 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-[#119db0]/30 hover:shadow-[#119db0]/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 transform hover:-translate-y-0.5 active:translate-y-0"
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
          <p className="text-[11px] font-bold text-[#119db0] tracking-wide">
            Powered by iServeU Financial Technologies
          </p>
        </div>
      </div>
    </div>
  );
};


