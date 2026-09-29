import React, { useState } from 'react';
import {
  UserPlus, ShieldCheck, Users, Lock, CheckCircle2, AlertCircle,
  Search, Filter, Trash2, Key, Sliders, Check, X, Building, Mail, User, Sparkles, Shield, ToggleLeft, ToggleRight
} from 'lucide-react';
import { AppUser, UserRole, RolePermission, UserSession } from '../types';

interface AdminSettingsProps {
  usersList: AppUser[];
  onAddUser: (user: AppUser) => void;
  onUpdateUserStatus: (userId: string, status: 'Active' | 'Inactive') => void;
  onDeleteUser: (userId: string) => void;
  permissionsList: RolePermission[];
  onUpdatePermissions: (permissions: RolePermission[]) => void;
  userSession: UserSession;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  usersList,
  onAddUser,
  onUpdateUserStatus,
  onDeleteUser,
  permissionsList,
  onUpdatePermissions,
  userSession
}) => {
  const [activeTab, setActiveTab] = useState<'user-management' | 'role-decide'>('user-management');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Finance'>('All');

  // Modal State for Create User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('finance@2026');
  const [newRole, setNewRole] = useState<UserRole>('Finance');
  const [newDepartment, setNewDepartment] = useState('Finance Operations');
  const [newTitle, setNewTitle] = useState('Finance Analyst');

  // Success Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showSuccessToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle User Creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPassword) return;

    // Check duplicate email
    if (usersList.some((u) => u.username.toLowerCase() === newEmail.trim().toLowerCase())) {
      alert('A user with this email address already exists.');
      return;
    }

    const createdUser: AppUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      username: newEmail.trim(),
      password: newPassword,
      name: newFullName.trim(),
      role: newRole,
      department: newDepartment,
      title: newTitle,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddUser(createdUser);
    setIsCreateModalOpen(false);
    showSuccessToast(`New ${newRole} user "${newFullName}" created successfully! They can now log in using ${newEmail}.`);

    // Reset Form
    setNewFullName('');
    setNewEmail('');
    setNewPassword('finance@2026');
    setNewRole('Finance');
    setNewDepartment('Finance Operations');
    setNewTitle('Finance Analyst');
  };

  // Toggle Role Permission (Role Decide feature)
  const handleTogglePermission = (permissionId: string, role: 'Admin' | 'Finance') => {
    if (userSession.role !== 'Admin') {
      alert('Only Admin users are authorized to modify role permissions.');
      return;
    }

    const updated = permissionsList.map((perm) => {
      if (perm.id === permissionId) {
        return {
          ...perm,
          adminAllowed: role === 'Admin' ? !perm.adminAllowed : perm.adminAllowed,
          financeAllowed: role === 'Finance' ? !perm.financeAllowed : perm.financeAllowed
        };
      }
      return perm;
    });

    onUpdatePermissions(updated);
    showSuccessToast('Role permissions updated successfully!');
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.role === 'Admin').length;
  const financeCount = usersList.filter((u) => u.role === 'Finance').length;

  const isAdmin = userSession.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1b2a3e] via-[#152233] to-[#00838F] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background wave decorative */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 translate-x-12" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-[#00D2D3]/20 text-[#00D2D3] border border-[#00D2D3]/40 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full">
                ADMIN CONTROL CENTER
              </span>
              <span className="text-slate-300 text-xs font-semibold">
                Segregation of Duties (1 User : 1 Role)
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              User Management & Role Configurator
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Create Finance users, manage account access, and decide fine-grained role permissions for Admin and Finance operators across the Reconciliation Platform.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!isAdmin}
              className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer ${
                isAdmin
                  ? 'bg-gradient-to-r from-[#00D2D3] to-[#00A8B5] hover:opacity-90 text-white shadow-[#00A8B5]/30'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Finance User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Non-Admin Warning Banner if logged in as Finance */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs font-medium">
            <span className="font-bold">Finance Role Notice:</span> You are currently viewing Admin Settings in read-only mode. User creation and permission matrix changes ("Role Decide") require an <strong className="font-bold">Admin</strong> account.
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#1b2a3e] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#00A8B5]/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#00D2D3]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Registered Users</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</h4>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Active platform accounts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admin Operators</p>
            <h4 className="text-2xl font-black text-[#1b2a3e] mt-1">{adminCount}</h4>
            <p className="text-[10px] font-semibold text-[#00A8B5] mt-0.5">Full administrative privilege</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#1b2a3e]/10 text-[#1b2a3e] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Finance Users</p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">{financeCount}</h4>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Reconciliation & reporting scope</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('user-management')}
          className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer ${
            activeTab === 'user-management'
              ? 'bg-[#1b2a3e] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & Finance User Creation</span>
        </button>

        <button
          onClick={() => setActiveTab('role-decide')}
          className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer ${
            activeTab === 'role-decide'
              ? 'bg-[#1b2a3e] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Role Decide (Permission Configurator)</span>
        </button>
      </div>

      {/* TAB 1: User Management Directory */}
      {activeTab === 'user-management' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Controls Bar: Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase">Role:</span>
              {(['All', 'Admin', 'Finance'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    roleFilter === r
                      ? 'bg-[#00A8B5] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Info</th>
                  <th className="py-3.5 px-4">Profile Role</th>
                  <th className="py-3.5 px-4">Department & Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                      No users found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center text-white shrink-0 ${
                            u.role === 'Admin' ? 'bg-[#1b2a3e]' : 'bg-[#00A8B5]'
                          }`}>
                            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-500">{u.username}</p>
                          </div>
                        </div>
                      </td>

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

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{u.title}</p>
                        <p className="text-[11px] text-slate-400">{u.department}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.status === 'Active' ? (
                          <span className="inline-block bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-200 text-slate-600 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {u.createdAt}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onUpdateUserStatus(u.id, u.status === 'Active' ? 'Inactive' : 'Active')}
                            disabled={!isAdmin || u.username === userSession.username}
                            className={`p-1.5 rounded-lg border transition text-[11px] font-bold cursor-pointer ${
                              u.status === 'Active'
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={() => onDeleteUser(u.id)}
                            disabled={!isAdmin || u.username === userSession.username || usersList.length <= 1}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Role Decide & Permission Matrix Configurator */}
      {activeTab === 'role-decide' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-[#00A8B5]">
                <Sliders className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900">Role Decide Feature Configurator</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Decide feature access rules for Admin vs Finance roles. Changes take effect immediately across all sessions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Rule Policy: 1 User : 1 Role
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-1/3">Permission Feature</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center bg-slate-100/70 border-x border-slate-200">
                    <div className="flex items-center justify-center gap-1.5 text-[#1b2a3e] font-black">
                      <ShieldCheck className="w-4 h-4 text-[#00A8B5]" />
                      <span>Admin Role</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-black">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Finance Role</span>
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

                    {/* Admin Permission Toggle */}
                    <td className="py-4 px-4 text-center bg-slate-50/40 border-x border-slate-200">
                      <button
                        onClick={() => handleTogglePermission(perm.id, 'Admin')}
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

                    {/* Finance Permission Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(perm.id, 'Finance')}
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

      {/* CREATE FINANCE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-200 relative space-y-5">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b2a3e] to-[#00A8B5] text-white flex items-center justify-center shadow-md">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Create Finance User</h3>
                <p className="text-xs text-slate-500">Add a new Finance operator to the platform</p>
              </div>
            </div>

            {/* Creation Form */}
            <form onSubmit={handleCreateUser} className="space-y-4 pt-1">
              
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
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Email / Username */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Email / Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.finance@iserveu.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Role Selection & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
    </div>
  );
};
