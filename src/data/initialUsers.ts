import { AppUser, RolePermission } from '../types';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-001',
    username: 'admin@iserveu.in',
    password: 'admin@2026',
    name: 'Chief Admin Operator',
    employeeId: 'EMP-1001',
    mobileNumber: '+91 98765 43210',
    role: 'Admin',
    department: 'Risk & Systems Admin',
    title: 'System Administrator',
    status: 'Active',
    createdAt: '2026-01-15'
  },
  {
    id: 'user-002',
    username: 'finance@iserveu.in',
    password: 'finance@2026',
    name: 'Priya Sharma',
    employeeId: 'EMP-1002',
    mobileNumber: '+91 98123 45678',
    role: 'Finance',
    department: 'Finance & Treasury',
    title: 'Finance Analyst',
    status: 'Active',
    createdAt: '2026-03-10'
  },
  {
    id: 'user-003',
    username: 'checker@iserveu.in',
    password: 'checker@2026',
    name: 'Siddharth Verma',
    employeeId: 'EMP-1003',
    mobileNumber: '+91 97654 32109',
    role: 'Finance',
    department: 'Reconciliation Operations',
    title: 'Finance Checker Officer',
    status: 'Active',
    createdAt: '2026-05-22'
  }
];

export const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  {
    id: 'perm-001',
    name: 'Create & Manage Finance Users',
    category: 'User Administration',
    description: 'Allows creation of new Finance accounts, password resets, and status updates.',
    adminAllowed: true,
    financeAllowed: false
  },
  {
    id: 'perm-002',
    name: 'Role Decide & Permission Config',
    category: 'User Administration',
    description: 'Grant or restrict feature access levels for Admin and Finance roles.',
    adminAllowed: true,
    financeAllowed: false
  },
  {
    id: 'perm-003',
    name: 'Single-Screen Product Recon Execution',
    category: 'Reconciliation Operations',
    description: 'Execute automated transaction matching across AEPS, UPI, IMPS, POS, and DMT.',
    adminAllowed: true,
    financeAllowed: true
  },
  {
    id: 'perm-004',
    name: 'Access Historical Reports & Job Archives',
    category: 'Reporting & Analytics',
    description: 'View, filter, and audit past reconciliation job records and match statistics.',
    adminAllowed: true,
    financeAllowed: true
  },
  {
    id: 'perm-005',
    name: 'Export Discrepancy Reports (Excel/CSV)',
    category: 'Data Export',
    description: 'Export mismatched records and discrepancy audit trails.',
    adminAllowed: true,
    financeAllowed: true
  },
  {
    id: 'perm-006',
    name: 'Segregation of Duties Enforcement (Maker/Checker)',
    category: 'Risk Control',
    description: 'Enforces 1 User : 1 Role policy to prevent conflict of interest in reconciliation.',
    adminAllowed: true,
    financeAllowed: true
  }
];
