import React from 'react';
import { Layers, History } from 'lucide-react';
import { ModuleKey, UserSession } from '../types';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
  userSession: UserSession;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  userSession,
  onLogout,
}) => {
  const menuItems: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
    {
      key: 'product-recon',
      label: 'Product Recon',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      key: 'job-archives',
      label: 'Report',
      icon: <History className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-[260px] min-w-[260px] bg-[#1b2a3e] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-[#253650] shadow-xl z-20">
      {/* Top Brand Header */}
      <div>
        <div className="p-6 border-b border-[#253650]">
          <div className="flex items-center gap-3">
            <img src="/iserveu_official_logo.svg" alt="iServeU Logo" className="h-10 w-auto object-contain brightness-125" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Reconciliation Modules
          </div>

          {menuItems.map((item) => {
            const isActive = activeModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectModule(item.key)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#119db0] text-white shadow-lg shadow-[#119db0]/25'
                    : 'text-slate-300 hover:bg-[#253650] hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#23c5da]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="p-4 border-t border-[#253650] bg-[#152233]/60"></div>
    </aside>
  );
};
