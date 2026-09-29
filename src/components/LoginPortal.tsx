import React, { useState } from 'react';
import {
  Lock, Mail, Loader2, Eye, EyeOff, Globe,
  Fingerprint, FileText, Banknote, RefreshCw, Send,
  Smartphone, CreditCard, QrCode, Zap, ShieldCheck, Wallet, UserCheck, Shield
} from 'lucide-react';
import { UserSession, UserRole, AppUser } from '../types';

interface LoginPortalProps {
  usersList?: AppUser[];
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ usersList = [], onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [username, setUsername] = useState('admin@iserveu.in');
  const [password, setPassword] = useState('admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'Admin') {
      setUsername('admin@iserveu.in');
      setPassword('admin@2026');
    } else {
      // Find first Finance user if available in registered list, else default
      const financeUser = usersList.find((u) => u.role === 'Finance');
      setUsername(financeUser ? financeUser.username : 'finance@iserveu.in');
      setPassword(financeUser?.password || 'finance@2026');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);

      // Check against user list if present
      const matchedUser = usersList.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (matchedUser) {
        if (matchedUser.status === 'Inactive') {
          setErrorMessage('This user account has been deactivated by the Admin.');
          return;
        }
        onLoginSuccess({
          username: matchedUser.username,
          name: matchedUser.name,
          role: matchedUser.role,
          title: matchedUser.title,
          isLoggedIn: true
        });
      } else {
        // Fallback for default demo login
        const roleTitle = selectedRole === 'Admin' ? 'System Administrator' : 'Finance Analyst';
        onLoginSuccess({
          username: username.trim() || (selectedRole === 'Admin' ? 'admin@iserveu.in' : 'finance@iserveu.in'),
          name: selectedRole === 'Admin' ? 'Admin User' : 'Finance User',
          role: selectedRole,
          title: roleTitle,
          isLoggedIn: true
        });
      }
    }, 800);
  };

  // 10 Reconciliation Product Categories mapped around the central hub
  const cx = 300;
  const cy = 300;
  const radius = 205;

  const nodeConfigs = [
    { label: 'AEPS', icon: Fingerprint, angle: -90, color: '#00A8B5' },
    { label: 'BHARAT CONNECT', icon: FileText, angle: -54, color: '#00A8B5' },
    { label: 'UPI', icon: QrCode, angle: -18, color: '#00A8B5' },
    { label: 'IMPS', icon: RefreshCw, angle: 18, color: '#00A8B5' },
    { label: 'PREPAID CARD', icon: CreditCard, angle: 54, color: '#00A8B5' },
    { label: 'MATM', icon: CreditCard, angle: 90, color: '#00A8B5' },
    { label: 'PAYOUT', icon: Banknote, angle: 126, color: '#00A8B5' },
    { label: 'DMT', icon: Send, angle: 162, color: '#00A8B5' },
    { label: 'POS', icon: Smartphone, angle: 198, color: '#00A8B5' },
    { label: 'RECHARGE', icon: Zap, angle: 234, color: '#00A8B5' },
  ];

  const computedNodes = nodeConfigs.map((cfg) => {
    const rad = (cfg.angle * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);
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
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 600">
              <defs>
                <filter id="hub-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* Concentric Orbit Bands */}
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
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                  <circle cx={node.midX} cy={node.midY} r="3.5" fill={node.color} />
                </g>
              ))}

              {/* CENTRAL HUB NODE */}
              <g transform={`translate(${cx - 70}, ${cy - 70})`} filter="url(#hub-shadow)">
                <circle cx="70" cy="70" r="68" fill="#ffffff" stroke="#f1f5f9" strokeWidth="4" />
                <foreignObject x="10" y="20" width="120" height="100">
                  <div className="w-full h-full flex flex-col items-center justify-center text-center px-1">
                    <img src="/iserveu_official_logo.svg" alt="iServeU Logo" className="h-8 w-auto object-contain" />
                    <span className="text-[9px] font-black text-[#00A8B5] mt-1.5 tracking-wider uppercase leading-snug">
                      RECONCILIATION<br/>PORTAL
                    </span>
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
                        <div className="w-13 h-13 rounded-full bg-white shadow-md border border-slate-200 text-[#00A8B5] hover:border-[#00A8B5] hover:shadow-[#00A8B5]/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-extrabold mt-1 text-slate-700 uppercase tracking-wider text-center leading-tight max-w-[85px] group-hover:text-[#00A8B5] transition-colors">
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
          <div className="w-full max-w-[420px] bg-white rounded-3xl p-7 border border-[#00A8B5]/30 shadow-2xl shadow-slate-200/80 space-y-5 relative z-10">
            
            {/* Header Brand & Risk Portal Badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <img
                  src="/iserveu_official_logo.svg"
                  alt="iServeU Logo"
                  className="h-10 w-auto object-contain"
                />
                <span className="bg-[#e6fbf3] text-[#00838F] font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full border border-[#00A8B5]/30 shadow-2xs">
                  RISK PORTAL
                </span>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">
                  Welcome Back!
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Please enter your details.
                </p>
              </div>
            </div>

            {/* Error Notification if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Role Switcher Pill Container (Admin vs Finance) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  SELECT PROFILE ROLE
                </span>
                <span className="bg-[#e6fbf3] text-[#00838F] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#00A8B5]/20">
                  1 User : 1 Role
                </span>
              </div>

              {/* Segmented Pill Selector */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-inner">
                {/* ADMIN ROLE TOGGLE */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('Admin')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedRole === 'Admin'
                      ? 'bg-[#1b2a3e] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${selectedRole === 'Admin' ? 'text-[#00D2D3]' : 'text-slate-500'}`} />
                  <span>Admin</span>
                </button>

                {/* FINANCE ROLE TOGGLE */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('Finance')}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedRole === 'Finance'
                      ? 'bg-[#1b2a3e] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Wallet className={`w-4 h-4 ${selectedRole === 'Finance' ? 'text-[#00D2D3]' : 'text-slate-500'}`} />
                  <span>Finance</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-normal pt-0.5">
                Enforces segregation of duties: Each operator is mapped to exactly one role.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              
              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20 transition"
                    placeholder={selectedRole === 'Admin' ? 'admin@iserveu.in' : 'finance@iserveu.in'}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#00A8B5] focus:ring-[#00A8B5] cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="font-bold text-[#00838F] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Solid Primary Blue / Cyan Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-6 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold text-sm shadow-md shadow-[#0066ff]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in as {selectedRole}...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>

            {/* Admin Notice Hint */}
            <div className="text-center text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100">
              {selectedRole === 'Admin' ? (
                <span>Admin users can create Finance users & configure role permissions.</span>
              ) : (
                <span>Finance role enables reconciliation matching & report viewing.</span>
              )}
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
