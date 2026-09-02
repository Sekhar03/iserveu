import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, Building2 } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-[#06101e] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00bcd4]/30 via-[#0b1c30] to-[#030812] p-4 relative overflow-hidden font-sans">
      {/* Dynamic Glowing Mesh Orbs */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#00bcd4]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#10b981]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 right-1/3 w-[350px] h-[350px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Geometric Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl shadow-slate-950/40 relative z-10 space-y-6">
        
        {/* Brand Header with Official iServeU Logo */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center pt-1 pb-2">
            <img
              src="/iserveu_official_logo.svg"
              alt="iServeU Registered Logo"
              className="h-16 w-auto max-w-[250px] object-contain drop-shadow-xs"
            />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              Reconciliation Platform
            </h1>
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
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0f172a] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0e8696] focus:bg-white transition"
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
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-[#0e8696] hover:text-[#0b6c7a] transition">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0f172a] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0e8696] focus:bg-white transition"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0e8696] focus:ring-[#0e8696] cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600">Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0e8696] via-[#00a3b8] to-[#10b981] hover:opacity-95 text-white font-bold text-sm transition-all duration-200 shadow-md shadow-[#0e8696]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
          <p className="text-[11px] font-semibold text-slate-400">
            Powered by iServeU Financial Technologies
          </p>
        </div>
      </div>
    </div>
  );
};


