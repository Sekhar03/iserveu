import React, { useState, useMemo } from 'react';
import {
  UserPlus, ShieldCheck, Users, Lock, CheckCircle2, AlertCircle,
  Search, Filter, Trash2, Key, Sliders, Check, X, Building, Mail,
  User, Phone, Contact, Plus, Shield, ToggleLeft, ToggleRight,
  Sparkles, Edit3, ShieldAlert, RotateCcw, CheckSquare, XSquare,
  HelpCircle, Eye, EyeOff, FileText, CheckCircle
} from 'lucide-react';
import { AppUser, UserRole, RolePermission, UserSession, hasUserPrivilege } from '../types';

interface UserManagementProps {
  usersList: AppUser[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onUpdateUserStatus: (userId: string, status: 'Active' | 'Inactive') => void;
  onUpdateUserPrivileges: (userId: string, userPrivileges: Record<string, boolean>) => void;
  onDeleteUser: (userId: string) => void;
  permissionsList: RolePermission[];
  onUpdatePermissions: (permissions: RolePermission[]) => void;
  onAddPermission: (newPerm: RolePermission) => void;
  onUpdatePermission: (updatedPerm: RolePermission) => void;
  onDeletePermission: (permId: string) => void;
  userSession: UserSession;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  usersList,
  onAddUser,
  onUpdateUser,
  onUpdateUserStatus,
  onUpdateUserPrivileges,
  onDeleteUser,
  permissionsList,
  onUpdatePermissions,
  onAddPermission,
  onUpdatePermission,
  onDeletePermission,
  userSession
}) => {
  // Navigation Tabs: 'users' | 'user-privileges' | 'system-privileges' | 'role-matrix'
  const [activeTab, setActiveTab] = useState<'users' | 'user-privileges' | 'system-privileges' | 'role-matrix'>('users');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Finance'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [overrideFilter, setOverrideFilter] = useState<'All' | 'Custom' | 'Default'>('All');

  // Modal States
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isAddPrivilegeModalOpen, setIsAddPrivilegeModalOpen] = useState(false);
  const [isEditPrivilegeModalOpen, setIsEditPrivilegeModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [privilegeToDelete, setPrivilegeToDelete] = useState<RolePermission | null>(null);

  // Active User for Managing Privileges
  const [selectedUserForPrivileges, setSelectedUserForPrivileges] = useState<AppUser | null>(null);
  const [tempPrivileges, setTempPrivileges] = useState<Record<string, boolean>>({});
  const [privilegeSearchQuery, setPrivilegeSearchQuery] = useState('');
  const [privilegeCategoryFilter, setPrivilegeCategoryFilter] = useState<string>('All');

  // Selected User for Editing
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Selected System Privilege for Editing
  const [editingPrivilege, setEditingPrivilege] = useState<RolePermission | null>(null);

  // Form State: Create User
  const [createFullName, setCreateFullName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createEmployeeId, setCreateEmployeeId] = useState('');
  const [createMobile, setCreateMobile] = useState('');
  const [createPassword, setCreatePassword] = useState('finance@2026');
  const [createRole, setCreateRole] = useState<UserRole>('Finance');
  const [createDepartment, setCreateDepartment] = useState('Finance Operations');
  const [createTitle, setCreateTitle] = useState('Finance Analyst');
  const [createCustomPrivilegesMode, setCreateCustomPrivilegesMode] = useState(false);
  const [createInitialPrivileges, setCreateInitialPrivileges] = useState<Record<string, boolean>>({});

  // Form State: Add System Privilege
  const [newPrivName, setNewPrivName] = useState('');
  const [newPrivCategory, setNewPrivCategory] = useState('Reconciliation Operations');
  const [newPrivDescription, setNewPrivDescription] = useState('');
  const [newPrivAdminAllowed, setNewPrivAdminAllowed] = useState(true);
  const [newPrivFinanceAllowed, setNewPrivFinanceAllowed] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const isAdmin = userSession.role === 'Admin';

  // Distinct Categories in permissionsList
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    permissionsList.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [permissionsList]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
        u.department.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

      const hasCustom = u.userPrivileges && Object.keys(u.userPrivileges).length > 0;
      const matchesOverride =
        overrideFilter === 'All' ||
        (overrideFilter === 'Custom' && hasCustom) ||
        (overrideFilter === 'Default' && !hasCustom);

      return matchesSearch && matchesRole && matchesStatus && matchesOverride;
    });
  }, [usersList, searchQuery, roleFilter, statusFilter, overrideFilter]);

  // Statistics
  const totalUsersCount = usersList.length;
  const activeUsersCount = usersList.filter((u) => u.status === 'Active').length;
  const adminCount = usersList.filter((u) => u.role === 'Admin').length;
  const financeCount = usersList.filter((u) => u.role === 'Finance').length;
  const customOverridesCount = usersList.filter(
    (u) => u.userPrivileges && Object.keys(u.userPrivileges).length > 0
  ).length;

  // Open Privilege Manager Modal for a specific user
  const handleOpenPrivilegeManager = (user: AppUser) => {
    setSelectedUserForPrivileges(user);
    setTempPrivileges(user.userPrivileges ? { ...user.userPrivileges } : {});
    setPrivilegeSearchQuery('');
    setPrivilegeCategoryFilter('All');
  };

  // Save User Privileges
  const handleSavePrivileges = () => {
    if (!selectedUserForPrivileges) return;
    onUpdateUserPrivileges(selectedUserForPrivileges.id, tempPrivileges);
    showToast(`Successfully updated privileges for ${selectedUserForPrivileges.name}`);
    setSelectedUserForPrivileges(null);
  };

  // Privilege toggles for specific user
  const handleAddUserPrivilege = (permId: string) => {
    setTempPrivileges((prev) => ({ ...prev, [permId]: true }));
  };

  const handleRemoveUserPrivilege = (permId: string) => {
    setTempPrivileges((prev) => ({ ...prev, [permId]: false }));
  };

  const handleResetUserPrivilege = (permId: string) => {
    setTempPrivileges((prev) => {
      const next = { ...prev };
      delete next[permId];
      return next;
    });
  };

  // Bulk Privilege Presets
  const handleApplyPreset = (preset: 'all-grant' | 'all-revoke' | 'reset-defaults' | 'recon-only' | 'auditor-only') => {
    if (!selectedUserForPrivileges) return;

    if (preset === 'reset-defaults') {
      setTempPrivileges({});
      showToast('Reset all privileges to role defaults');
      return;
    }

    if (preset === 'all-grant') {
      const full: Record<string, boolean> = {};
      permissionsList.forEach((p) => {
        full[p.id] = true;
      });
      setTempPrivileges(full);
      showToast('All privileges granted (+ Added) to user');
      return;
    }

    if (preset === 'all-revoke') {
      const restricted: Record<string, boolean> = {};
      permissionsList.forEach((p) => {
        restricted[p.id] = false;
      });
      setTempPrivileges(restricted);
      showToast('All privileges revoked (- Removed) from user');
      return;
    }

    if (preset === 'recon-only') {
      const custom: Record<string, boolean> = {};
      permissionsList.forEach((p) => {
        if (p.category === 'Reconciliation Operations' || p.category === 'Data Export') {
          custom[p.id] = true;
        } else {
          custom[p.id] = false;
        }
      });
      setTempPrivileges(custom);
      showToast('Applied "Reconciliation Operations Only" preset');
      return;
    }

    if (preset === 'auditor-only') {
      const custom: Record<string, boolean> = {};
      permissionsList.forEach((p) => {
        if (p.category === 'Reporting & Analytics' || p.category === 'Risk Control') {
          custom[p.id] = true;
        } else {
          custom[p.id] = false;
        }
      });
      setTempPrivileges(custom);
      showToast('Applied "Auditor & Analytics" preset');
      return;
    }
  };

  // Create User Handler
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFullName.trim() || !createEmail.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (usersList.some((u) => u.username.toLowerCase() === createEmail.trim().toLowerCase())) {
      alert('A user with this email address / username already exists.');
      return;
    }

    const newUser: AppUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: createFullName.trim(),
      username: createEmail.trim().toLowerCase(),
      employeeId: createEmployeeId.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      mobileNumber: createMobile.trim() || '+91 98765 43210',
      password: createPassword || (createRole === 'Admin' ? 'admin@2026' : 'finance@2026'),
      role: createRole,
      department: createDepartment.trim() || (createRole === 'Admin' ? 'Risk & Systems Admin' : 'Finance Operations'),
      title: createTitle.trim() || (createRole === 'Admin' ? 'System Administrator' : 'Finance Analyst'),
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      userPrivileges: createCustomPrivilegesMode ? { ...createInitialPrivileges } : {}
    };

    onAddUser(newUser);
    setIsCreateUserModalOpen(false);
    showToast(`Created user "${newUser.name}" (${newUser.role}) successfully!`);

    // Reset Form
    setCreateFullName('');
    setCreateEmail('');
    setCreateEmployeeId('');
    setCreateMobile('');
    setCreatePassword('finance@2026');
    setCreateRole('Finance');
    setCreateDepartment('Finance Operations');
    setCreateTitle('Finance Analyst');
    setCreateCustomPrivilegesMode(false);
    setCreateInitialPrivileges({});
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: AppUser) => {
    setEditingUser({ ...user });
    setIsEditUserModalOpen(true);
  };

  // Save Edited User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser);
    setIsEditUserModalOpen(false);
    showToast(`User details for "${editingUser.name}" updated successfully.`);
    setEditingUser(null);
  };

  // Delete User Confirmed
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.username === userSession.username) {
      alert('You cannot delete your own logged-in account.');
      setUserToDelete(null);
      return;
    }
    onDeleteUser(userToDelete.id);
    showToast(`User account "${userToDelete.name}" deleted.`);
    setUserToDelete(null);
  };

  // Add System Privilege Feature Submit
  const handleAddPrivilegeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrivName.trim() || !newPrivDescription.trim()) {
      alert('Please fill out privilege name and description.');
      return;
    }

    const newPerm: RolePermission = {
      id: `perm-${Date.now().toString().slice(-4)}`,
      name: newPrivName.trim(),
      category: newPrivCategory,
      description: newPrivDescription.trim(),
      adminAllowed: newPrivAdminAllowed,
      financeAllowed: newPrivFinanceAllowed
    };

    onAddPermission(newPerm);
    setIsAddPrivilegeModalOpen(false);
    showToast(`Added system privilege "${newPerm.name}" to platform.`);

    // Reset
    setNewPrivName('');
    setNewPrivCategory('Reconciliation Operations');
    setNewPrivDescription('');
    setNewPrivAdminAllowed(true);
    setNewPrivFinanceAllowed(false);
  };

  // Save Edited System Privilege
  const handleSaveEditPrivilege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrivilege) return;

    onUpdatePermission(editingPrivilege);
    setIsEditPrivilegeModalOpen(false);
    showToast(`Updated system privilege "${editingPrivilege.name}".`);
    setEditingPrivilege(null);
  };

  // Delete System Privilege Confirmed
  const handleConfirmDeletePrivilege = () => {
    if (!privilegeToDelete) return;
    onDeletePermission(privilegeToDelete.id);
    showToast(`Privilege "${privilegeToDelete.name}" removed from platform.`);
    setPrivilegeToDelete(null);
  };

  // Toggle Role Default Permission
  const handleToggleRolePermission = (permId: string, role: 'Admin' | 'Finance') => {
    if (!isAdmin) {
      alert('Only Admin users can modify role baselines.');
      return;
    }

    const updated = permissionsList.map((p) => {
      if (p.id === permId) {
        return {
          ...p,
          adminAllowed: role === 'Admin' ? !p.adminAllowed : p.adminAllowed,
          financeAllowed: role === 'Finance' ? !p.financeAllowed : p.financeAllowed
        };
      }
      return p;
    });

    onUpdatePermissions(updated);
    showToast(`Updated default ${role} baseline for privilege.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1b2a3e] via-[#152233] to-[#00838F] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 translate-x-12" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#00D2D3] text-xs font-bold border border-white/15">
              <ShieldCheck className="w-4 h-4 text-[#00D2D3]" />
              <span>Identity & Access Management (IAM)</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">
              User Management & Privilege Control
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Create and manage user accounts, assign specific privileges, add/remove system capabilities, and configure role access rules.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddPrivilegeModalOpen(true)}
              disabled={!isAdmin}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Add a new privilege feature to the system"
            >
              <Plus className="w-4 h-4 text-[#00D2D3]" />
              <span>Add System Privilege</span>
            </button>

            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              disabled={!isAdmin}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer ${
                isAdmin
                  ? 'bg-gradient-to-r from-[#00D2D3] to-[#00A8B5] hover:opacity-95 text-white shadow-[#00A8B5]/30'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Non-Admin Warning Banner */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs font-medium">
            <span className="font-bold">Privilege Notice:</span> You are viewing the User Management & Privilege System in read-only mode. Creating users, managing individual privileges, and role decide settings require an <strong className="font-bold">Admin</strong> account.
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#1b2a3e] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#00A8B5]/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#00D2D3]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-slate-900">{totalUsersCount}</h4>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-slate-500 mt-1">{activeUsersCount} active accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Operators</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-[#1b2a3e]">{adminCount}</h4>
            <div className="w-9 h-9 rounded-xl bg-[#1b2a3e]/10 text-[#1b2a3e] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#00A8B5]" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-[#00A8B5] mt-1">Full system privilege</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Finance Users</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-emerald-600">{financeCount}</h4>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-emerald-600 mt-1">Recon & reporting scope</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Overrides</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-purple-600">{customOverridesCount}</h4>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-purple-500 mt-1">Tailored user privileges</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform Privileges</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-[#00838F]">{permissionsList.length}</h4>
            <div className="w-9 h-9 rounded-xl bg-[#00838F]/10 text-[#00838F] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-[#00838F] mt-1">System capability rules</p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#1b2a3e] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('user-privileges');
            if (!selectedUserForPrivileges && usersList.length > 0) {
              handleOpenPrivilegeManager(usersList[0]);
            }
          }}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'user-privileges'
              ? 'bg-[#1b2a3e] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>User Privilege Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('system-privileges')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'system-privileges'
              ? 'bg-[#1b2a3e] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>System Privilege Catalog ({permissionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('role-matrix')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'role-matrix'
              ? 'bg-[#1b2a3e] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Role Decide (Role Matrix)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: USER DIRECTORY & MANAGEMENT                        */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Controls Bar: Search & Filters */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-3 border-b border-slate-100">
            {/* Search */}
            <div className="relative w-full lg:w-84">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, EMP ID, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Role:</span>
                {(['All', 'Admin', 'Finance'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      roleFilter === r
                        ? 'bg-[#00A8B5] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Status:</span>
                {(['All', 'Active', 'Inactive'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      statusFilter === s
                        ? 'bg-[#1b2a3e] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Privilege Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Privilege:</span>
                {(['All', 'Custom', 'Default'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setOverrideFilter(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      overrideFilter === p
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Info & Contact</th>
                  <th className="py-3.5 px-4">Profile Role</th>
                  <th className="py-3.5 px-4">Department & Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Active Privileges</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    // Calculate allowed count
                    const allowedCount = permissionsList.filter((p) =>
                      hasUserPrivilege(u, p.id, permissionsList)
                    ).length;

                    // Calculate custom overrides count
                    const customOverrides = u.userPrivileges || {};
                    let addedCount = 0;
                    let removedCount = 0;
                    permissionsList.forEach((p) => {
                      const roleDefault = u.role === 'Admin' ? p.adminAllowed : p.financeAllowed;
                      if (p.id in customOverrides) {
                        if (customOverrides[p.id] && !roleDefault) addedCount++;
                        if (!customOverrides[p.id] && roleDefault) removedCount++;
                      }
                    });

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        {/* User Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-2xl font-black text-xs flex items-center justify-center text-white shrink-0 shadow-xs ${
                                u.role === 'Admin' ? 'bg-[#1b2a3e]' : 'bg-[#00A8B5]'
                              }`}
                            >
                              {u.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                                {u.employeeId && (
                                  <span className="bg-slate-100 text-slate-600 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                                    {u.employeeId}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium">{u.username}</p>
                              {u.mobileNumber && (
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{u.mobileNumber}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          {u.role === 'Admin' ? (
                            <span className="inline-flex items-center gap-1.5 bg-[#1b2a3e]/10 text-[#1b2a3e] border border-[#1b2a3e]/30 px-3 py-1 rounded-full font-bold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#00A8B5]" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold text-[11px]">
                              <User className="w-3.5 h-3.5 text-emerald-600" />
                              Finance
                            </span>
                          )}
                        </td>

                        {/* Department & Title */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{u.title}</p>
                          <p className="text-[11px] text-slate-400">{u.department}</p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() =>
                              onUpdateUserStatus(u.id, u.status === 'Active' ? 'Inactive' : 'Active')
                            }
                            disabled={!isAdmin || u.username === userSession.username}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                              u.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                            title={u.status === 'Active' ? 'Click to Deactivate' : 'Click to Activate'}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-500'
                              }`}
                            />
                            <span>{u.status}</span>
                          </button>
                        </td>

                        {/* Privileges Badge & Manager Button */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => {
                                handleOpenPrivilegeManager(u);
                                setActiveTab('user-privileges');
                              }}
                              disabled={!isAdmin}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00A8B5]/10 text-[#00838F] border border-[#00A8B5]/30 hover:bg-[#00A8B5]/20 font-bold text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Set, Add or Remove Privileges for this user"
                            >
                              <Key className="w-3.5 h-3.5 text-[#00A8B5]" />
                              <span>Set Privileges</span>
                              <span className="ml-1 px-1.5 py-0.2 bg-[#00A8B5] text-white rounded-full text-[9px] font-black">
                                {allowedCount}/{permissionsList.length}
                              </span>
                            </button>

                            {/* Overrides Chips */}
                            {(addedCount > 0 || removedCount > 0) && (
                              <div className="flex items-center gap-1 text-[9px] font-bold">
                                {addedCount > 0 && (
                                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                    +{addedCount} Added
                                  </span>
                                )}
                                {removedCount > 0 && (
                                  <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                                    -{removedCount} Revoked
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit User Button */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              disabled={!isAdmin}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Edit user details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete User Button */}
                            <button
                              onClick={() => setUserToDelete(u)}
                              disabled={!isAdmin || u.username === userSession.username || usersList.length <= 1}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title={
                                u.username === userSession.username
                                  ? 'Cannot delete your own active session'
                                  : 'Delete User'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: USER PRIVILEGE MANAGER (PER-USER PRIVILEGES)       */}
      {/* ========================================================= */}
      {activeTab === 'user-privileges' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* User Selector Dropdown Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#1b2a3e] text-white flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-[#00D2D3]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Configuring User Privileges</h3>
                <p className="text-xs text-slate-500">
                  Select a user to grant (+ Add) or revoke (- Remove) specific capabilities.
                </p>
              </div>
            </div>

            {/* Select User Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Target User:</span>
              <select
                value={selectedUserForPrivileges?.id || ''}
                onChange={(e) => {
                  const target = usersList.find((u) => u.id === e.target.value);
                  if (target) handleOpenPrivilegeManager(target);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
              >
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) — {u.employeeId || u.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedUserForPrivileges ? (
            <div className="space-y-6">
              {/* Selected User Header Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#1b2a3e] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#00A8B5] text-white font-black text-sm flex items-center justify-center shadow-md">
                    {selectedUserForPrivileges.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black">{selectedUserForPrivileges.name}</h4>
                      <span className="bg-white/20 text-[#00D2D3] font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {selectedUserForPrivileges.role}
                      </span>
                      {selectedUserForPrivileges.employeeId && (
                        <span className="bg-white/10 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded">
                          {selectedUserForPrivileges.employeeId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      {selectedUserForPrivileges.username} • {selectedUserForPrivileges.title} (
                      {selectedUserForPrivileges.department})
                    </p>
                  </div>
                </div>

                {/* Overrides Count in Selected User */}
                <div className="flex items-center gap-2 text-right">
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                    <p className="text-[10px] text-slate-300 font-bold uppercase">Effective Privileges</p>
                    <p className="text-base font-black text-[#00D2D3]">
                      {
                        permissionsList.filter((p) => {
                          if (p.id in tempPrivileges) return tempPrivileges[p.id];
                          return selectedUserForPrivileges.role === 'Admin'
                            ? p.adminAllowed
                            : p.financeAllowed;
                        }).length
                      }{' '}
                      / {permissionsList.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Presets & Bulk Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00A8B5]" />
                    <span>Quick Privilege Presets & Bulk Tools</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Quickly apply common operational profiles
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApplyPreset('all-grant')}
                    disabled={!isAdmin}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>+ Add All Privileges</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('all-revoke')}
                    disabled={!isAdmin}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <XSquare className="w-3.5 h-3.5" />
                    <span>- Remove All Privileges</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('recon-only')}
                    disabled={!isAdmin}
                    className="px-3 py-1.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Recon Operations Only</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('auditor-only')}
                    disabled={!isAdmin}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Auditor & Analytics</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('reset-defaults')}
                    disabled={!isAdmin}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200/70 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Role Defaults</span>
                  </button>
                </div>
              </div>

              {/* Filters for Privileges List */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search privilege feature..."
                    value={privilegeSearchQuery}
                    onChange={(e) => setPrivilegeSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPrivilegeCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        privilegeCategoryFilter === cat
                          ? 'bg-[#1b2a3e] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privilege Features List */}
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {permissionsList
                  .filter((p) => {
                    const matchesQ =
                      !privilegeSearchQuery ||
                      p.name.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                      p.description.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(privilegeSearchQuery.toLowerCase());
                    const matchesC =
                      privilegeCategoryFilter === 'All' || p.category === privilegeCategoryFilter;
                    return matchesQ && matchesC;
                  })
                  .map((perm) => {
                    const roleDefault =
                      selectedUserForPrivileges.role === 'Admin'
                        ? perm.adminAllowed
                        : perm.financeAllowed;
                    const isExplicitlyOverridden = perm.id in tempPrivileges;
                    const effectiveState = isExplicitlyOverridden
                      ? tempPrivileges[perm.id]
                      : roleDefault;

                    return (
                      <div
                        key={perm.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs text-slate-900">{perm.name}</h5>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {perm.category}
                            </span>

                            {/* State Badge */}
                            {effectiveState ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Granted</span>
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <X className="w-3 h-3" />
                                <span>Denied</span>
                              </span>
                            )}

                            {/* Override Badge */}
                            {isExplicitlyOverridden && (
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  effectiveState
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {effectiveState ? 'Custom Added' : 'Custom Removed'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{perm.description}</p>
                          <p className="text-[10px] text-slate-400">
                            Base Role Default:{' '}
                            <strong className="text-slate-600">
                              {roleDefault ? 'Allowed' : 'Restricted'}
                            </strong>
                          </p>
                        </div>

                        {/* Direct Add / Remove Buttons for This Specific User */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* + Add Privilege */}
                          <button
                            type="button"
                            onClick={() => handleAddUserPrivilege(perm.id)}
                            disabled={!isAdmin}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              effectiveState && isExplicitlyOverridden
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : effectiveState
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Explicitly add/grant this privilege to this user"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Privilege</span>
                          </button>

                          {/* - Remove Privilege */}
                          <button
                            type="button"
                            onClick={() => handleRemoveUserPrivilege(perm.id)}
                            disabled={!isAdmin}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              !effectiveState && isExplicitlyOverridden
                                ? 'bg-red-600 text-white shadow-xs'
                                : !effectiveState
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Explicitly remove/revoke this privilege from this user"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove Privilege</span>
                          </button>

                          {/* Reset */}
                          {isExplicitlyOverridden && (
                            <button
                              type="button"
                              onClick={() => handleResetUserPrivilege(perm.id)}
                              disabled={!isAdmin}
                              className="px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              title="Reset to role default"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Save Bar */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Back to Users
                </button>
                <button
                  type="button"
                  onClick={handleSavePrivileges}
                  disabled={!isAdmin}
                  className="px-6 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white text-xs font-bold shadow-md shadow-[#00A8B5]/25 transition cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Privileges for {selectedUserForPrivileges.name}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Key className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              Please select a user from the dropdown above to manage privileges.
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SYSTEM PRIVILEGE CATALOG (ADD & REMOVE PRIVILEGES) */}
      {/* ========================================================= */}
      {activeTab === 'system-privileges' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-[#00A8B5]">
                <Shield className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900">System Privilege Capabilities</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage all registered privilege rules. Add new privilege features to the platform or remove capabilities.
              </p>
            </div>

            <button
              onClick={() => setIsAddPrivilegeModalOpen(true)}
              disabled={!isAdmin}
              className="px-4 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Privilege Feature</span>
            </button>
          </div>

          {/* Privilege Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissionsList.map((perm) => {
              // Count users having this privilege
              const activeCount = usersList.filter((u) =>
                hasUserPrivilege(u, perm.id, permissionsList)
              ).length;

              return (
                <div
                  key={perm.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-[#00A8B5]/50 bg-white hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#00A8B5] bg-[#00A8B5]/10 px-2 py-0.5 rounded">
                        {perm.category}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-1">{perm.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Edit Privilege */}
                      <button
                        onClick={() => {
                          setEditingPrivilege({ ...perm });
                          setIsEditPrivilegeModalOpen(true);
                        }}
                        disabled={!isAdmin}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer disabled:opacity-40"
                        title="Edit privilege details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Remove Privilege */}
                      <button
                        onClick={() => setPrivilegeToDelete(perm)}
                        disabled={!isAdmin || permissionsList.length <= 1}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer disabled:opacity-40"
                        title="Remove privilege feature from platform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{perm.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">Defaults:</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          perm.adminAllowed
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        Admin: {perm.adminAllowed ? 'Yes' : 'No'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          perm.financeAllowed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        Finance: {perm.financeAllowed ? 'Yes' : 'No'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-slate-500">
                      {activeCount} users have access
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ROLE DECIDE (ROLE MATRIX)                          */}
      {/* ========================================================= */}
      {activeTab === 'role-matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-[#00A8B5]">
                <Sliders className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900">Role Decide Baseline Matrix</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Decide default access privileges for Admin and Finance roles. Individual user overrides take precedence over these rules.
              </p>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-2/5">Privilege Feature</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center bg-slate-100/70 border-x border-slate-200">
                    <div className="flex items-center justify-center gap-1.5 text-[#1b2a3e] font-black">
                      <ShieldCheck className="w-4 h-4 text-[#00A8B5]" />
                      <span>Admin Baseline</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-black">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Finance Baseline</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {permissionsList.map((perm) => (
                  <tr key={perm.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{perm.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{perm.description}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block bg-slate-100 text-slate-600 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-slate-200">
                        {perm.category}
                      </span>
                    </td>

                    {/* Admin Toggle */}
                    <td className="py-4 px-4 text-center bg-slate-50/40 border-x border-slate-200">
                      <button
                        onClick={() => handleToggleRolePermission(perm.id, 'Admin')}
                        disabled={!isAdmin}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          perm.adminAllowed
                            ? 'bg-[#1b2a3e] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {perm.adminAllowed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#00D2D3]" />
                            <span>Allowed</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-red-400" />
                            <span>Restricted</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Finance Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleRolePermission(perm.id, 'Finance')}
                        disabled={!isAdmin}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          perm.financeAllowed
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {perm.financeAllowed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Allowed</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-red-400" />
                            <span>Restricted</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CREATE USER (WITH OPTIONAL PRIVILEGE ASSIGNMENT) */}
      {/* ========================================================= */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl border border-slate-200 relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateUserModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b2a3e] to-[#00A8B5] text-white flex items-center justify-center shadow-md">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Create New User Account</h3>
                <p className="text-xs text-slate-500">
                  Provision an Admin or Finance operator and set their initial privileges
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 pt-1">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Email / Username */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Email ID / Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.kumar@iserveu.in"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Employee ID & Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Contact className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-1005"
                      value={createEmployeeId}
                      onChange={(e) => setCreateEmployeeId(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={createMobile}
                      onChange={(e) => setCreateMobile(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Initial Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Role Selection & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={createRole}
                    onChange={(e) => {
                      const selected = e.target.value as UserRole;
                      setCreateRole(selected);
                      if (selected === 'Admin') {
                        setCreateTitle('System Administrator');
                        setCreateDepartment('Risk & Systems Admin');
                        setCreatePassword('admin@2026');
                      } else {
                        setCreateTitle('Finance Analyst');
                        setCreateDepartment('Finance Operations');
                        setCreatePassword('finance@2026');
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  >
                    <option value="Finance">Finance Role</option>
                    <option value="Admin">Admin Role</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Title</label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  value={createDepartment}
                  onChange={(e) => setCreateDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              {/* Privilege Assignment Section in Creation Form */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      Set Initial Privileges
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Configure custom privileges now or use standard {createRole} role defaults
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateCustomPrivilegesMode(!createCustomPrivilegesMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      createCustomPrivilegesMode
                        ? 'bg-[#00A8B5] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {createCustomPrivilegesMode ? 'Customizing Privileges' : 'Use Role Defaults'}
                  </button>
                </div>

                {createCustomPrivilegesMode && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 max-h-56 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Select privileges to grant (+) or deny (-):
                    </p>
                    {permissionsList.map((perm) => {
                      const isAssigned =
                        perm.id in createInitialPrivileges
                          ? createInitialPrivileges[perm.id]
                          : createRole === 'Admin'
                          ? perm.adminAllowed
                          : perm.financeAllowed;

                      return (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{perm.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                              ({perm.category})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setCreateInitialPrivileges((prev) => ({ ...prev, [perm.id]: true }))
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                isAssigned
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              + Add
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCreateInitialPrivileges((prev) => ({ ...prev, [perm.id]: false }))
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                !isAssigned
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              - Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white text-xs font-bold shadow-md shadow-[#00A8B5]/25 transition cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT USER DETAILS                                */}
      {/* ========================================================= */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-200 relative space-y-5">
            <button
              onClick={() => setIsEditUserModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00A8B5] text-white flex items-center justify-center shadow-md">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit User Profile</h3>
                <p className="text-xs text-slate-500">Update account info for {editingUser.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 pt-1">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              {/* Email / Username */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Email ID / Username</label>
                <input
                  type="email"
                  required
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              {/* Employee ID & Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Employee ID</label>
                  <input
                    type="text"
                    value={editingUser.employeeId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, employeeId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Mobile Number</label>
                  <input
                    type="tel"
                    value={editingUser.mobileNumber || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Role & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  >
                    <option value="Finance">Finance Role</option>
                    <option value="Admin">Admin Role</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Title</label>
                  <input
                    type="text"
                    value={editingUser.title}
                    onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD NEW SYSTEM PRIVILEGE FEATURE                 */}
      {/* ========================================================= */}
      {isAddPrivilegeModalOpen && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 relative space-y-5">
            <button
              onClick={() => setIsAddPrivilegeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b2a3e] to-[#00A8B5] text-white flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Add System Privilege</h3>
                <p className="text-xs text-slate-500">Register a new capability rule in the platform</p>
              </div>
            </div>

            <form onSubmit={handleAddPrivilegeSubmit} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Feature / Capability Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Force Mismatch Clearance"
                  value={newPrivName}
                  onChange={(e) => setNewPrivName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Category</label>
                <select
                  value={newPrivCategory}
                  onChange={(e) => setNewPrivCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                >
                  <option value="Reconciliation Operations">Reconciliation Operations</option>
                  <option value="User Administration">User Administration</option>
                  <option value="Reporting & Analytics">Reporting & Analytics</option>
                  <option value="Data Export">Data Export</option>
                  <option value="Risk Control">Risk Control</option>
                  <option value="Audit & Compliance">Audit & Compliance</option>
                  <option value="System Integrations">System Integrations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe what access this privilege feature grants..."
                  value={newPrivDescription}
                  onChange={(e) => setNewPrivDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              {/* Default Role Access */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Admin Default</span>
                  <input
                    type="checkbox"
                    checked={newPrivAdminAllowed}
                    onChange={(e) => setNewPrivAdminAllowed(e.target.checked)}
                    className="w-4 h-4 text-[#00A8B5] rounded cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Finance Default</span>
                  <input
                    type="checkbox"
                    checked={newPrivFinanceAllowed}
                    onChange={(e) => setNewPrivFinanceAllowed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddPrivilegeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Add Privilege
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: EDIT SYSTEM PRIVILEGE FEATURE                    */}
      {/* ========================================================= */}
      {isEditPrivilegeModalOpen && editingPrivilege && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 relative space-y-5">
            <button
              onClick={() => setIsEditPrivilegeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00A8B5] text-white flex items-center justify-center shadow-md">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit System Privilege</h3>
                <p className="text-xs text-slate-500">Update capability definition and defaults</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditPrivilege} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Feature Name</label>
                <input
                  type="text"
                  required
                  value={editingPrivilege.name}
                  onChange={(e) =>
                    setEditingPrivilege({ ...editingPrivilege, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Category</label>
                <select
                  value={editingPrivilege.category}
                  onChange={(e) =>
                    setEditingPrivilege({ ...editingPrivilege, category: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                >
                  <option value="Reconciliation Operations">Reconciliation Operations</option>
                  <option value="User Administration">User Administration</option>
                  <option value="Reporting & Analytics">Reporting & Analytics</option>
                  <option value="Data Export">Data Export</option>
                  <option value="Risk Control">Risk Control</option>
                  <option value="Audit & Compliance">Audit & Compliance</option>
                  <option value="System Integrations">System Integrations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Description</label>
                <textarea
                  required
                  rows={2}
                  value={editingPrivilege.description}
                  onChange={(e) =>
                    setEditingPrivilege({ ...editingPrivilege, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Admin Default</span>
                  <input
                    type="checkbox"
                    checked={editingPrivilege.adminAllowed}
                    onChange={(e) =>
                      setEditingPrivilege({ ...editingPrivilege, adminAllowed: e.target.checked })
                    }
                    className="w-4 h-4 text-[#00A8B5] rounded cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Finance Default</span>
                  <input
                    type="checkbox"
                    checked={editingPrivilege.financeAllowed}
                    onChange={(e) =>
                      setEditingPrivilege({ ...editingPrivilege, financeAllowed: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditPrivilegeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: DELETE USER CONFIRMATION                         */}
      {/* ========================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete User Account</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete <strong className="text-slate-800">{userToDelete.name}</strong> ({userToDelete.username})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: DELETE SYSTEM PRIVILEGE CONFIRMATION             */}
      {/* ========================================================= */}
      {privilegeToDelete && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Remove Privilege Feature</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong className="text-slate-800">{privilegeToDelete.name}</strong> from the platform? This will revoke this capability across all roles and user accounts.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPrivilegeToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePrivilege}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Yes, Remove Privilege
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
