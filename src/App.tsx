import React, { useState } from 'react';
import { UserSession, ModuleKey, Category, SubProduct, FileState, ReconRecord, ReconJob } from './types';
import { CheckCircle2, X, FileSpreadsheet, ExternalLink, ArrowRight } from 'lucide-react';
import { LoginPortal } from './components/LoginPortal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SingleScreenRecon } from './components/SingleScreenRecon';
import { JobArchives } from './components/JobArchives';
import { INITIAL_JOB_ARCHIVES } from './data/mockArchives';

export default function App() {
  // Authentication State
  const [userSession, setUserSession] = useState<UserSession>({
    username: '',
    role: '',
    title: '',
    isLoggedIn: false
  });

  // Sidebar & Module State
  const [activeModule, setActiveModule] = useState<ModuleKey>('product-recon');

  // Active Reconciliation State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubProduct, setSelectedSubProduct] = useState<SubProduct | null>(null);
  const [targetDate, setTargetDate] = useState<string>('2026-07-28');
  const [targetCycle, setTargetCycle] = useState<string>('Cycle 1 (00:00 - 08:00 Window)');
  const [collectedFiles, setCollectedFiles] = useState<FileState[]>([]);

  // Generated Dataset State
  const [matchedRecords, setMatchedRecords] = useState<ReconRecord[]>([]);
  const [mismatchedRecords, setMismatchedRecords] = useState<ReconRecord[]>([]);
  const [currentJob, setCurrentJob] = useState<ReconJob | null>(null);

  // Job Archives State
  const [jobArchives, setJobArchives] = useState<ReconJob[]>(INITIAL_JOB_ARCHIVES);

  // Initiation Modal
  const [showInitiationModal, setShowInitiationModal] = useState<boolean>(false);

  // Handle Login
  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setActiveModule('product-recon');
  };

  // Handle Logout
  const handleLogout = () => {
    setUserSession({
      username: '',
      role: '',
      title: '',
      isLoggedIn: false
    });
  };

  // Single-Screen Reconciliation Handler
  const handleReconciliationInitiated = (
    subProduct: SubProduct,
    category: Category,
    date: string,
    cycle: string,
    files: FileState[],
    matched: ReconRecord[],
    mismatched: ReconRecord[],
    job: ReconJob
  ) => {
    setSelectedSubProduct(subProduct);
    setSelectedCategory(category);
    setTargetDate(date);
    setTargetCycle(cycle);
    setCollectedFiles(files);
    setMatchedRecords(matched);
    setMismatchedRecords(mismatched);
    setCurrentJob(job);

    // Save job into archives
    setJobArchives((prev) => {
      if (prev.some((j) => j.id === job.id)) return prev;
      return [job, ...prev];
    });

    setShowInitiationModal(true);
  };

  // Reset to Product Recon view
  const handleStartNewReconFromReport = () => {
    setActiveModule('product-recon');
  };

  // Render Login Portal if not logged in
  if (!userSession.isLoggedIn) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header activeModule={activeModule} userSession={userSession} onLogout={handleLogout} />

        <main className="p-8 max-w-7xl mx-auto w-full">
          {activeModule === 'product-recon' && (
            <SingleScreenRecon
              onReconciliationInitiated={handleReconciliationInitiated}
              initialVertical="acquiring"
              initialCategoryId="upi"
              initialSubProductId="nsdlpaupi"
              initialDate="2026-07-28"
              initialCycle="Cycle 1 (00:00 - 08:00 Window)"
            />
          )}

          {activeModule === 'job-archives' && (
            <JobArchives jobs={jobArchives} onStartNewRecon={handleStartNewReconFromReport} />
          )}
        </main>
      </div>

      {/* Reconciliation Initiated Modal */}
      {showInitiationModal && selectedSubProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 relative text-center space-y-6">
            <button
              onClick={() => setShowInitiationModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Circular Check Icon with Mint Rounded Square */}
            <div className="w-20 h-20 rounded-3xl bg-[#e6fbf3] text-[#00b074] flex items-center justify-center mx-auto shadow-xs">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#00b074] flex items-center justify-center text-[#00b074]">
                <CheckCircle2 className="w-9 h-9 fill-[#00b074] text-white stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider bg-[#e6fbf3] text-[#00a389] px-4 py-1.5 rounded-full border border-[#a7f3d0]">
                RECONCILIATION INITIATED
              </span>
              <h3 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                Reconciliation Initiated Successfully!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Reconciliation process for <span className="font-bold text-[#0f172a]">{selectedSubProduct.name} {selectedSubProduct.description ? `(${selectedSubProduct.description})` : ''}</span> ({targetDate} — {targetCycle}) has been initiated. Completed results are available in the <span className="font-bold text-[#00a389]">Report</span> section.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowInitiationModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#00b074] hover:bg-[#009663] text-white font-bold text-sm shadow-md shadow-[#00b074]/25 transition cursor-pointer flex items-center justify-center"
              >
                <span>Start New Reconciliation</span>
              </button>
              <button
                onClick={() => {
                  setShowInitiationModal(false);
                  setActiveModule('job-archives');
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold text-sm shadow-sm transition cursor-pointer flex items-center justify-center"
              >
                <span>View in Report Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

