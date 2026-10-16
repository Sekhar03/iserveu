import React, { useState } from 'react';
import { UserSession, ModuleKey, BusinessVerticalId, Category, SubProduct, FileState, ReconRecord, ReconJob, AppUser, RolePermission, AuditLogEntry, AuditCategory, AuditSeverity } from './types';
import { CheckCircle2, X } from 'lucide-react';
import { LoginPortal } from './components/LoginPortal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SingleScreenRecon } from './components/SingleScreenRecon';
import { JobArchives } from './components/JobArchives';
import { AdminSettings } from './components/AdminSettings';
import { UserManagement } from './components/UserManagement';
import { AuditTrail } from './components/AuditTrail';
import { INITIAL_JOB_ARCHIVES } from './data/mockArchives';
import { INITIAL_USERS, INITIAL_ROLE_PERMISSIONS } from './data/initialUsers';
import { INITIAL_AUDIT_LOGS } from './data/mockAuditLogs';

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

  // Audit Trail Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const logAuditEvent = (
    action: string,
    module: AuditCategory,
    details: string,
    targetResource: string,
    severity: AuditSeverity = 'INFO',
    metadata?: Record<string, any>
  ) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: {
        userId: userSession.id || 'user-curr',
        name: userSession.name || 'Admin Operator',
        email: userSession.username || 'admin@iserveu.in',
        role: userSession.role,
        ipAddress: '192.168.1.104'
      },
      module,
      action,
      severity,
      status: severity === 'CRITICAL' ? 'FLAGGED' : 'SUCCESS',
      targetResource,
      details,
      metadata
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const handleAddAuditLog = (entry: AuditLogEntry) => {
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // User & Permission Management Handlers
  const handleAddUser = (newUser: AppUser) => {
    setUsersList((prev) => [newUser, ...prev]);
    logAuditEvent(
      'USER_CREATED',
      'User & IAM',
      `Created new user account "${newUser.name}" (${newUser.role}) in department ${newUser.department}.`,
      `User: ${newUser.name} (${newUser.employeeId || newUser.username})`,
      'SUCCESS',
      {
        email: newUser.username,
        role: newUser.role,
        department: newUser.department,
        employeeId: newUser.employeeId
      }
    );
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
    logAuditEvent(
      'USER_UPDATED',
      'User & IAM',
      `Updated user profile details for "${updatedUser.name}".`,
      `User: ${updatedUser.name} (${updatedUser.employeeId || updatedUser.username})`,
      'INFO',
      {
        role: updatedUser.role,
        title: updatedUser.title,
        department: updatedUser.department
      }
    );
  };

  const handleUpdateUserStatus = (userId: string, newStatus: 'Active' | 'Inactive') => {
    const targetUser = usersList.find((u) => u.id === userId);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    logAuditEvent(
      'USER_STATUS_TOGGLED',
      'User & IAM',
      `Changed user account status to "${newStatus}" for ${targetUser?.name || userId}.`,
      `User: ${targetUser?.name || userId}`,
      newStatus === 'Inactive' ? 'WARNING' : 'SUCCESS',
      {
        targetUserId: userId,
        newStatus,
        previousStatus: targetUser?.status
      }
    );
  };

  const handleUpdateUserPrivileges = (userId: string, userPrivileges: Record<string, boolean>) => {
    const targetUser = usersList.find((u) => u.id === userId);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, userPrivileges } : u))
    );
    // If updating current user's session privileges:
    if (targetUser && targetUser.username.toLowerCase() === userSession.username.toLowerCase()) {
      setUserSession((prev) => ({
        ...prev,
        userPrivileges
      }));
    }
    const overrideCount = Object.keys(userPrivileges).length;
    logAuditEvent(
      'USER_PRIVILEGES_MODIFIED',
      'Privilege & Security',
      `Updated custom privilege overrides (${overrideCount} active) for ${targetUser?.name || userId}.`,
      `User: ${targetUser?.name || userId}`,
      'SUCCESS',
      {
        targetUserId: userId,
        overridesCount: overrideCount,
        overrides: userPrivileges
      }
    );
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = usersList.find((u) => u.id === userId);
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    logAuditEvent(
      'USER_DELETED',
      'User & IAM',
      `Permanently deleted user account "${targetUser?.name || userId}" from the platform.`,
      `User: ${targetUser?.name || userId}`,
      'WARNING',
      {
        deletedUserId: userId,
        email: targetUser?.username,
        role: targetUser?.role
      }
    );
  };

  const handleUpdatePermissions = (updatedPerms: RolePermission[]) => {
    setPermissionsList(updatedPerms);
    logAuditEvent(
      'ROLE_BASELINE_UPDATED',
      'Privilege & Security',
      'Modified Role Decide permission baseline matrix across Admin and Finance roles.',
      'Role Matrix Configuration',
      'WARNING',
      { totalPermissions: updatedPerms.length }
    );
  };

  const handleAddPermission = (newPerm: RolePermission) => {
    setPermissionsList((prev) => [...prev, newPerm]);
    logAuditEvent(
      'SYSTEM_PRIVILEGE_ADDED',
      'Privilege & Security',
      `Added new system privilege capability "${newPerm.name}" in category ${newPerm.category}.`,
      `Privilege: ${newPerm.name}`,
      'SUCCESS',
      {
        privilegeId: newPerm.id,
        category: newPerm.category,
        adminAllowed: newPerm.adminAllowed,
        financeAllowed: newPerm.financeAllowed
      }
    );
  };

  const handleUpdatePermission = (updatedPerm: RolePermission) => {
    setPermissionsList((prev) =>
      prev.map((p) => (p.id === updatedPerm.id ? updatedPerm : p))
    );
    logAuditEvent(
      'SYSTEM_PRIVILEGE_MODIFIED',
      'Privilege & Security',
      `Modified system privilege configuration for "${updatedPerm.name}".`,
      `Privilege: ${updatedPerm.name}`,
      'INFO',
      {
        privilegeId: updatedPerm.id,
        adminAllowed: updatedPerm.adminAllowed,
        financeAllowed: updatedPerm.financeAllowed
      }
    );
  };

  const handleDeletePermission = (permId: string) => {
    const targetPerm = permissionsList.find((p) => p.id === permId);
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
    logAuditEvent(
      'SYSTEM_PRIVILEGE_REMOVED',
      'Privilege & Security',
      `Removed privilege capability "${targetPerm?.name || permId}" from platform and cleaned user overrides.`,
      `Privilege: ${targetPerm?.name || permId}`,
      'WARNING',
      { deletedPermId: permId }
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

    logAuditEvent(
      'RECON_JOB_INITIATED',
      'Reconciliation Engine',
      `Initiated transaction matching for ${subProduct.name} (${date} — ${cycle}): ${matched.length} matched, ${mismatched.length} discrepancies.`,
      `Job: ${job.id} (${subProduct.name})`,
      'SUCCESS',
      {
        jobId: job.id,
        category: category.name,
        date,
        cycle,
        totalRecords: job.totalRecords,
        matchedCount: matched.length,
        mismatchedCount: mismatched.length,
        matchRatePct: `${job.matchRate}%`
      }
    );

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

            {activeModule === 'audit-trail' && (
              <AuditTrail
                logs={auditLogs}
                onAddAuditLog={handleAddAuditLog}
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
