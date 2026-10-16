import React, { useState } from 'react';
import { UserSession, ModuleKey, BusinessVerticalId, Category, SubProduct, FileState, ReconRecord, ReconJob, AppUser, RolePermission } from './types';
import { CheckCircle2, X } from 'lucide-react';
import { LoginPortal } from './components/LoginPortal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SingleScreenRecon } from './components/SingleScreenRecon';
import { JobArchives } from './components/JobArchives';
import { AdminSettings } from './components/AdminSettings';
import { UserManagement } from './components/UserManagement';
import { INITIAL_JOB_ARCHIVES } from './data/mockArchives';
import { INITIAL_USERS, INITIAL_ROLE_PERMISSIONS } from './data/initialUsers';

export default function App() {
  // Registered Users State (Admin can add new Finance users)
  const [usersList, setUsersList] = useState<AppUser[]>(INITIAL_USERS);
  const [permissionsList, setPermissionsList] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);

  // Authentication State
  const [userSession, setUserSession] = useState<UserSession>({
    username: '',
    name: '',
    role: 'Admin',
    title: '',
    isLoggedIn: false
  });

  // Sidebar & Module State
  const [activeModule, setActiveModule] = useState<ModuleKey>('product-recon');
  const [activeVertical, setActiveVertical] = useState<BusinessVerticalId>('acquiring');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const handleSelectVertical = (vertId: BusinessVerticalId) => {
    setActiveVertical(vertId);
    setActiveModule('product-recon');
  };

  // Active Reconciliation State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubProduct, setSelectedSubProduct] = useState<SubProduct | null>(null);
  const [targetDate, setTargetDate] = useState<string>('2026-07-28');
  const [targetCycle, setTargetCycle] = useState<string>('Cycle 1 (00:00 - 03:00 Window)');
  const [collectedFiles, setCollectedFiles] = useState<FileState[]>([]);

  // Generated Dataset State
  const [matchedRecords, setMatchedRecords] = useState<ReconRecord[]>([]);
  const [mismatchedRecords, setMismatchedRecords] = useState<ReconRecord[]>([]);
  const [currentJob, setCurrentJob] = useState<ReconJob | null>(null);

  // Job Archives State
  const [jobArchives, setJobArchives] = useState<ReconJob[]>(INITIAL_JOB_ARCHIVES);

  // Initiation Modal
  const [showInitiationModal, setShowInitiationModal] = useState<boolean>(false);

  // User & Permission Management Handlers
  const handleAddUser = (newUser: AppUser) => {
    setUsersList((prev) => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (userSession.username.toLowerCase() === updatedUser.username.toLowerCase()) {
      setUserSession((prev) => ({
        ...prev,
        name: updatedUser.name,
        role: updatedUser.role,
        title: updatedUser.title
      }));
    }
  };

  const handleUpdateUserStatus = (userId: string, newStatus: 'Active' | 'Inactive') => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  const handleUpdateUserPrivileges = (userId: string, userPrivileges: Record<string, boolean>) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, userPrivileges } : u))
    );
    // If updating current user's session privileges:
    const currentUser = usersList.find((u) => u.id === userId);
    if (currentUser && currentUser.username.toLowerCase() === userSession.username.toLowerCase()) {
      setUserSession((prev) => ({
        ...prev,
        userPrivileges
      }));
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUpdatePermissions = (updatedPerms: RolePermission[]) => {
    setPermissionsList(updatedPerms);
  };

  const handleAddPermission = (newPerm: RolePermission) => {
    setPermissionsList((prev) => [...prev, newPerm]);
  };

  const handleUpdatePermission = (updatedPerm: RolePermission) => {
    setPermissionsList((prev) =>
      prev.map((p) => (p.id === updatedPerm.id ? updatedPerm : p))
    );
  };

  const handleDeletePermission = (permId: string) => {
    setPermissionsList((prev) => prev.filter((p) => p.id !== permId));
    // Clean up user overrides referencing this deleted privilege
    setUsersList((prev) =>
      prev.map((u) => {
        if (!u.userPrivileges || !(permId in u.userPrivileges)) return u;
        const nextOverrides = { ...u.userPrivileges };
        delete nextOverrides[permId];
        return { ...u, userPrivileges: nextOverrides };
      })
    );
  };

  // Handle Login
  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setActiveModule('product-recon');
  };

  // Handle Logout
  const handleLogout = () => {
    setUserSession({
      username: '',
      name: '',
      role: 'Admin',
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
    return <LoginPortal usersList={usersList} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Header matching image 108 */}
      <Header
        activeModule={activeModule}
        userSession={userSession}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex min-w-0">
        {/* Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          activeVertical={activeVertical}
          onSelectVertical={handleSelectVertical}
          userSession={userSession}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
            {activeModule === 'product-recon' && (
              <SingleScreenRecon
                onReconciliationInitiated={handleReconciliationInitiated}
                initialVertical={activeVertical}
                initialCategoryId={activeVertical === 'acquiring' ? 'upi' : activeVertical === 'issuing' ? 'imps' : activeVertical === 'bbps' ? 'bbps' : 'aeps'}
                initialSubProductId={activeVertical === 'acquiring' ? 'nsdlpaupi' : activeVertical === 'issuing' ? 'nsdlimps' : activeVertical === 'bbps' ? 'bbpscou' : 'aadharpay'}
                initialDate="2026-07-28"
                initialCycle="Cycle 1 (00:00 - 03:00 Window)"
              />
            )}

            {activeModule === 'job-archives' && (
              <JobArchives jobs={jobArchives} onStartNewRecon={handleStartNewReconFromReport} />
            )}

            {(activeModule === 'user-management' || activeModule === 'admin-settings') && (
              <UserManagement
                usersList={usersList}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onUpdateUserStatus={handleUpdateUserStatus}
                onUpdateUserPrivileges={handleUpdateUserPrivileges}
                onDeleteUser={handleDeleteUser}
                permissionsList={permissionsList}
                onUpdatePermissions={handleUpdatePermissions}
                onAddPermission={handleAddPermission}
                onUpdatePermission={handleUpdatePermission}
                onDeletePermission={handleDeletePermission}
                userSession={userSession}
              />
            )}
          </main>
        </div>
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

            {/* Circular Check Icon with NSDL Burgundy / Emerald Accent */}
            <div className="w-20 h-20 rounded-3xl bg-[#851419]/10 text-[#851419] flex items-center justify-center mx-auto shadow-xs">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#851419] flex items-center justify-center text-[#851419]">
                <CheckCircle2 className="w-9 h-9 fill-[#851419] text-white stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider bg-[#851419]/10 text-[#851419] px-4 py-1.5 rounded-full border border-[#851419]/25">
                RECONCILIATION INITIATED
              </span>
              <h3 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                Reconciliation Initiated Successfully!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Reconciliation process for <span className="font-bold text-[#0f172a]">{selectedSubProduct.name} {selectedSubProduct.description ? `(${selectedSubProduct.description})` : ''}</span> ({targetDate} — {targetCycle}) has been initiated for NSDL Payments Bank.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowInitiationModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#851419] hover:bg-[#721115] text-white font-bold text-sm shadow-md shadow-[#851419]/25 transition cursor-pointer flex items-center justify-center"
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
