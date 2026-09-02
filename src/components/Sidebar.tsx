import React, { useState } from 'react';
import { Layers, History, ChevronDown, ChevronRight } from 'lucide-react';
import { ModuleKey, UserSession, BusinessVerticalId } from '../types';
import { BUSINESS_VERTICALS } from '../data/categoriesAndSubProducts';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
  activeVertical: BusinessVerticalId;
  onSelectVertical: (verticalId: BusinessVerticalId) => void;
  userSession: UserSession;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  activeVertical,
  onSelectVertical,
  userSession,
  onLogout,
}) => {
  const [isProductReconExpanded, setIsProductReconExpanded] = useState<boolean>(true);

  const handleProductReconClick = () => {
    onSelectModule('product-recon');
    setIsProductReconExpanded(!isProductReconExpanded);
  };

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

          {/* 1. Product Recon Main Accordion Item */}
          <div>
            <button
              type="button"
              onClick={handleProductReconClick}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'product-recon'
                  ? 'bg-[#119db0] text-white shadow-lg shadow-[#119db0]/25 font-bold'
                  : 'text-slate-300 hover:bg-[#253650] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className={activeModule === 'product-recon' ? 'text-white' : 'text-[#23c5da]'}>
                  <Layers className="w-5 h-5" />
                </span>
                <span>Product Recon</span>
              </div>
              {isProductReconExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-300" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Nested Vertical Sub-Items (Acquiring, Issuing, Agency Banking, BBPS) */}
            {isProductReconExpanded && (
              <div className="mt-1.5 ml-4 pl-3 border-l-2 border-[#253650] space-y-1 py-1 animate-in fade-in duration-150">
                {BUSINESS_VERTICALS.map((vert) => {
                  const isSubActive = activeModule === 'product-recon' && activeVertical === vert.id;
                  return (
                    <button
                      key={vert.id}
                      type="button"
                      onClick={() => onSelectVertical(vert.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSubActive
                          ? 'bg-[#23c5da]/20 text-[#23c5da] border border-[#23c5da]/40 font-bold'
                          : 'text-slate-300 hover:bg-[#253650]/80 hover:text-white'
                      }`}
                    >
                      <span>{vert.name}</span>
                      {isSubActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#23c5da] shadow-sm shadow-[#23c5da]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Report / Archives Item */}
          <button
            type="button"
            onClick={() => onSelectModule('job-archives')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
              activeModule === 'job-archives'
                ? 'bg-[#119db0] text-white shadow-lg shadow-[#119db0]/25 font-bold'
                : 'text-slate-300 hover:bg-[#253650] hover:text-white'
            }`}
          >
            <span className={activeModule === 'job-archives' ? 'text-white' : 'text-[#23c5da]'}>
              <History className="w-5 h-5" />
            </span>
            <span>Report</span>
            {activeModule === 'job-archives' && (
              <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-sm" />
            )}
          </button>
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="p-4 border-t border-[#253650] bg-[#152233]/60" />
    </aside>
  );
};

