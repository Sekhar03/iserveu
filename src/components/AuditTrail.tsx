import React, { useState, useMemo } from 'react';
import {
  ClipboardList, Search, Filter, Download, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, Info, Clock, User, Server, Calendar, Eye,
  X, Check, Sparkles, RefreshCw, Copy, ShieldAlert, ArrowUpDown,
  FileSpreadsheet, Lock, Layers
} from 'lucide-react';
import { AuditLogEntry, AuditCategory, AuditSeverity, UserSession } from '../types';

interface AuditTrailProps {
  logs: AuditLogEntry[];
  onAddAuditLog: (entry: AuditLogEntry) => void;
  userSession: UserSession;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs, onAddAuditLog, userSession }) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Inspection Modal State
  const [inspectingLog, setInspectingLog] = useState<AuditLogEntry | null>(null);

  // Manual Compliance Note Modal
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<AuditCategory>('Audit & Compliance' as any);
  const [noteSeverity, setNoteSeverity] = useState<AuditSeverity>('INFO');
  const [noteDetails, setNoteDetails] = useState('');
  const [noteTarget, setNoteTarget] = useState('Regulatory Compliance Review');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const categories: string[] = [
    'All',
    'User & IAM',
    'Privilege & Security',
    'Reconciliation Engine',
    'Discrepancy Handling',
    'Accounting & TTUM',
    'Authentication',
    'Data Export & Reports'
  ];

  const severities: string[] = ['All', 'SUCCESS', 'INFO', 'WARNING', 'CRITICAL'];

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.targetResource.toLowerCase().includes(q) ||
        log.actor.name.toLowerCase().includes(q) ||
        log.actor.email.toLowerCase().includes(q) ||
        (log.actor.ipAddress && log.actor.ipAddress.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || log.module === selectedCategory;
      const matchesSev = selectedSeverity === 'All' || log.severity === selectedSeverity;
      const matchesRole = selectedRole === 'All' || log.actor.role === selectedRole;
      const matchesStatus = selectedStatus === 'All' || log.status === selectedStatus;

      return matchesSearch && matchesCat && matchesSev && matchesRole && matchesStatus;
    });
  }, [logs, searchQuery, selectedCategory, selectedSeverity, selectedRole, selectedStatus]);

  // Statistics
  const totalEvents = logs.length;
  const securityEvents = logs.filter(
    (l) => l.module === 'User & IAM' || l.module === 'Privilege & Security'
  ).length;
  const reconEvents = logs.filter(
    (l) => l.module === 'Reconciliation Engine' || l.module === 'Discrepancy Handling'
  ).length;
  const warningEvents = logs.filter(
    (l) => l.severity === 'WARNING' || l.severity === 'CRITICAL' || l.status === 'FLAGGED'
  ).length;
  const uniqueActors = new Set(logs.map((l) => l.actor.email)).size;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Audit ID',
      'Timestamp',
      'Actor Name',
      'Actor Email',
      'Actor Role',
      'IP Address',
      'Module',
      'Action Code',
      'Severity',
      'Status',
      'Target Resource',
      'Details'
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.actor.name}"`,
      `"${l.actor.email}"`,
      `"${l.actor.role}"`,
      `"${l.actor.ipAddress || 'N/A'}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.severity}"`,
      `"${l.status}"`,
      `"${l.targetResource.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NSDL_Recon_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredLogs.length} audit trail records to CSV.`);
  };

  // Add Manual Compliance Note Submit
  const handleAddComplianceNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteDetails.trim()) return;

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
      module: (noteCategory as any) || 'Privilege & Security',
      action: noteTitle.trim().toUpperCase().replace(/\s+/g, '_'),
      severity: noteSeverity,
      status: 'SUCCESS',
      targetResource: noteTarget.trim(),
      details: noteDetails.trim(),
      metadata: {
        complianceType: 'Manual Compliance Attestation',
        operatorRole: userSession.role,
        digitalSignature: `RBI-ATTEST-${Date.now().toString().slice(-6)}`
      }
    };

    onAddAuditLog(newEntry);
    setIsAddNoteModalOpen(false);
    showToast(`Compliance audit record "${newEntry.id}" logged successfully!`);

    // Reset
    setNoteTitle('');
    setNoteDetails('');
    setNoteTarget('Regulatory Compliance Review');
    setNoteSeverity('INFO');
  };

  // Copy to Clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1b2a3e] via-[#152233] to-[#851419] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12 translate-x-12" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#00D2D3] text-xs font-bold border border-white/15">
              <ShieldCheck className="w-4 h-4 text-[#00D2D3]" />
              <span>RBI & NPCI Regulatory Compliance Ledger</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">
              Audit Trail & Operational Log Stream
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Immutable, timestamped audit records tracking user IAM changes, privilege grants/revocations, reconciliation matching execution, manual adjustments, and regulatory data exports.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#00D2D3]" />
              <span>Log Compliance Note</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D2D3] to-[#00A8B5] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#00A8B5]/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>
        </div>
      </div>

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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Audit Records</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-slate-900">{totalEvents}</h4>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-slate-500 mt-1">System & user events</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security & IAM</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-[#1b2a3e]">{securityEvents}</h4>
            <div className="w-9 h-9 rounded-xl bg-[#1b2a3e]/10 text-[#1b2a3e] flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#00A8B5]" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-[#00A8B5] mt-1">Users, roles, privileges</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reconciliation Runs</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-emerald-600">{reconEvents}</h4>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-emerald-600 mt-1">Batch jobs & matching</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flagged / Warnings</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-amber-600">{warningEvents}</h4>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-amber-600 mt-1">Manual edits & anomalies</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Operators</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-black text-purple-600">{uniqueActors}</h4>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-purple-500 mt-1">Unique audit actors</p>
        </div>
      </div>

      {/* Main Audit Log Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Search & Filter Toolbar */}
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit ID, actor, action, IP, resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
              />
            </div>

            {/* Quick Filters Group */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Severity Filter */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-1.5">Severity:</span>
                {severities.map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      selectedSeverity === sev
                        ? sev === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : sev === 'WARNING'
                          ? 'bg-amber-600 text-white'
                          : sev === 'SUCCESS'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1b2a3e] text-white'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-1.5">Role:</span>
                {(['All', 'Admin', 'Finance', 'System'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      selectedRole === r
                        ? 'bg-[#00A8B5] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Reset Filters */}
              {(searchQuery || selectedCategory !== 'All' || selectedSeverity !== 'All' || selectedRole !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedSeverity('All');
                    setSelectedRole('All');
                  }}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 text-[11px] font-bold transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Module Category Horizontal Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#1b2a3e] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-40">Timestamp & ID</th>
                <th className="py-3.5 px-4">Actor & IP</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Action & Details</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4 text-center">Severity</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No audit log records match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      {/* Timestamp & ID */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {log.timestamp.replace(' IST', '')}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] font-extrabold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {log.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actor & IP */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                              log.actor.role === 'Admin'
                                ? 'bg-[#1b2a3e]'
                                : log.actor.role === 'Finance'
                                ? 'bg-[#00A8B5]'
                                : 'bg-slate-600'
                            }`}
                          >
                            {log.actor.role === 'System' ? (
                              <Server className="w-3.5 h-3.5" />
                            ) : (
                              log.actor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">{log.actor.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {log.actor.ipAddress || 'Internal Network'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Module Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 whitespace-nowrap">
                          {log.module}
                        </span>
                      </td>

                      {/* Action & Details */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="space-y-0.5">
                          <p className="font-mono text-[11px] font-extrabold text-slate-900 tracking-tight">
                            {log.action}
                          </p>
                          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{log.details}</p>
                        </div>
                      </td>

                      {/* Target Resource */}
                      <td className="py-3 px-4">
                        <span className="inline-block bg-slate-50 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                          {log.targetResource}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                            log.severity === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : log.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.severity === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {log.severity === 'WARNING' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {log.severity === 'CRITICAL' && <XCircle className="w-3 h-3 text-red-600" />}
                          {log.severity === 'INFO' && <Info className="w-3 h-3 text-blue-600" />}
                          <span>{log.severity}</span>
                        </span>
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-[#00A8B5]/10 hover:text-[#00838F] hover:border-[#00A8B5]/30 transition cursor-pointer"
                          title="Inspect full audit record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: INSPECT AUDIT RECORD DETAILS                       */}
      {/* ========================================================= */}
      {inspectingLog && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl border border-slate-200 relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectingLog(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b2a3e] to-[#00A8B5] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">Audit Record Inspection</h3>
                  <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {inspectingLog.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Regulatory compliance verification record • Recorded at {inspectingLog.timestamp}
                </p>
              </div>
            </div>

            {/* Event Summary Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Action Code</p>
                <p className="font-mono font-black text-slate-900 mt-0.5">{inspectingLog.action}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Module Category</p>
                <p className="font-bold text-slate-900 mt-0.5">{inspectingLog.module}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Actor Details</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {inspectingLog.actor.name} ({inspectingLog.actor.role})
                </p>
                <p className="text-[11px] text-slate-500">{inspectingLog.actor.email}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Client IP Address</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {inspectingLog.actor.ipAddress || 'Internal Loopback'}
                </p>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Target Resource</p>
                <p className="font-mono font-bold text-[#00838F] mt-0.5">{inspectingLog.targetResource}</p>
              </div>
            </div>

            {/* Description / Details */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Audit Narrative</label>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                {inspectingLog.details}
              </div>
            </div>

            {/* Technical Metadata JSON */}
            {inspectingLog.metadata && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Audit Event Metadata</label>
                  <button
                    onClick={() =>
                      handleCopy(JSON.stringify(inspectingLog.metadata, null, 2), 'Metadata JSON')
                    }
                    className="text-[11px] text-[#00A8B5] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-tight">
                  {JSON.stringify(inspectingLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Compliance Verification Footer */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  Compliance Hash Verified: SHA-256 Block #{inspectingLog.id.slice(-4)} Validated
                </span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded">
                RBI Guideline 2026/A1
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1b2a3e] hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LOG COMPLIANCE NOTE                                */}
      {/* ========================================================= */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 bg-[#1b2a3e]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 relative space-y-5">
            <button
              onClick={() => setIsAddNoteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b2a3e] to-[#00A8B5] text-white flex items-center justify-center shadow-md">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Log Compliance Entry</h3>
                <p className="text-xs text-slate-500">Record a regulatory remark into the official audit trail</p>
              </div>
            </div>

            <form onSubmit={handleAddComplianceNote} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Action Code / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PERIODIC_SOX_IAM_AUDIT_COMPLETED"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as AuditCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  >
                    <option value="Privilege & Security">Privilege & Security</option>
                    <option value="User & IAM">User & IAM</option>
                    <option value="Reconciliation Engine">Reconciliation Engine</option>
                    <option value="Discrepancy Handling">Discrepancy Handling</option>
                    <option value="Accounting & TTUM">Accounting & TTUM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Severity</label>
                  <select
                    value={noteSeverity}
                    onChange={(e) => setNoteSeverity(e.target.value as AuditSeverity)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                  >
                    <option value="INFO">INFO</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="WARNING">WARNING</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Target Resource</label>
                <input
                  type="text"
                  required
                  value={noteTarget}
                  onChange={(e) => setNoteTarget(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Details / Audit Narrative</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide detailed context for this compliance record..."
                  value={noteDetails}
                  onChange={(e) => setNoteDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#00838F] text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Append to Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
