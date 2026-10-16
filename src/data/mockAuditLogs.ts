import { AuditLogEntry } from '../types';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-2026-0091',
    timestamp: '2026-07-28 14:48:32 IST',
    actor: {
      userId: 'user-001',
      name: 'Chief Admin Operator',
      email: 'admin@iserveu.in',
      role: 'Admin',
      ipAddress: '192.168.1.104'
    },
    module: 'Privilege & Security',
    action: 'CUSTOM_PRIVILEGE_GRANTED',
    severity: 'SUCCESS',
    status: 'SUCCESS',
    targetResource: 'User: Priya Sharma (EMP-1002)',
    details: 'Explicitly granted (+ Added) custom privilege "Single-Screen Product Recon Execution" and "Access Historical Reports" to user.',
    metadata: {
      grantedPrivileges: ['perm-003', 'perm-004'],
      authorizedBy: 'Chief Admin Operator',
      prevOverrideCount: 0,
      newOverrideCount: 2
    }
  },
  {
    id: 'AUD-2026-0090',
    timestamp: '2026-07-28 14:15:10 IST',
    actor: {
      userId: 'user-001',
      name: 'Chief Admin Operator',
      email: 'admin@iserveu.in',
      role: 'Admin',
      ipAddress: '192.168.1.104'
    },
    module: 'User & IAM',
    action: 'USER_CREATED',
    severity: 'SUCCESS',
    status: 'SUCCESS',
    targetResource: 'User: Rajesh Kumar (EMP-1004)',
    details: 'Created new user account with Finance profile role in Finance Operations department.',
    metadata: {
      employeeId: 'EMP-1004',
      email: 'rajesh.kumar@iserveu.in',
      role: 'Finance',
      department: 'Finance Operations',
      initialPasswordPolicy: 'Compliant (Encrypted)'
    }
  },
  {
    id: 'AUD-2026-0089',
    timestamp: '2026-07-28 13:30:45 IST',
    actor: {
      userId: 'user-002',
      name: 'Priya Sharma',
      email: 'finance@iserveu.in',
      role: 'Finance',
      ipAddress: '192.168.1.118'
    },
    module: 'Reconciliation Engine',
    action: 'RECON_JOB_INITIATED',
    severity: 'INFO',
    status: 'SUCCESS',
    targetResource: 'Product: NSDL PA UPI (nsdlpaupi)',
    details: 'Initiated 4-way transaction matching cycle for date 2026-07-28, Cycle 1 (00:00 - 03:00 Window).',
    metadata: {
      jobId: 'RECON-20260728-001',
      vertical: 'Acquiring',
      category: 'UPI',
      filesIngested: ['NPCI Settlement Raw', 'iServeU Switch Log', 'Bank CBS GL Dump'],
      totalRecordsIngested: 15800
    }
  },
  {
    id: 'AUD-2026-0088',
    timestamp: '2026-07-28 13:31:02 IST',
    actor: {
      name: 'Automated Matching Daemon',
      email: 'engine@iserveu.in',
      role: 'System',
      ipAddress: '10.0.4.12'
    },
    module: 'Reconciliation Engine',
    action: 'MATCHING_BATCH_COMPLETED',
    severity: 'SUCCESS',
    status: 'SUCCESS',
    targetResource: 'Job ID: RECON-20260728-001',
    details: 'Automated reconciliation completed: 15,515 records matched (98.2% match rate), 285 discrepancies flagged.',
    metadata: {
      jobId: 'RECON-20260728-001',
      totalRecords: 15800,
      matchedCount: 15515,
      mismatchedCount: 285,
      matchRatePct: '98.2%'
    }
  },
  {
    id: 'AUD-2026-0087',
    timestamp: '2026-07-28 12:45:20 IST',
    actor: {
      userId: 'user-003',
      name: 'Siddharth Verma',
      email: 'checker@iserveu.in',
      role: 'Finance',
      ipAddress: '192.168.1.122'
    },
    module: 'Data Export & Reports',
    action: 'REPORT_EXPORTED_EXCEL',
    severity: 'INFO',
    status: 'SUCCESS',
    targetResource: 'Report: NSDL AEPS (2026-07-28)',
    details: 'Exported reconciled transactions and discrepancy report to Microsoft Excel format (.xlsx).',
    metadata: {
      exportFormat: 'XLSX',
      recordCount: 285,
      fileHash: 'sha256:d8a9f24c7e6b0148f32e9942a0b1',
      complianceSignature: 'RBI-CS-2026-07-28-V4'
    }
  },
  {
    id: 'AUD-2026-0086',
    timestamp: '2026-07-28 11:20:15 IST',
    actor: {
      userId: 'user-001',
      name: 'Chief Admin Operator',
      email: 'admin@iserveu.in',
      role: 'Admin',
      ipAddress: '192.168.1.104'
    },
    module: 'Privilege & Security',
    action: 'SYSTEM_PRIVILEGE_ADDED',
    severity: 'SUCCESS',
    status: 'SUCCESS',
    targetResource: 'Privilege: Force Clear Mismatches',
    details: 'Created new system capability "Force Clear Mismatches" in Reconciliation Operations category.',
    metadata: {
      privilegeId: 'perm-007',
      adminDefaultAllowed: true,
      financeDefaultAllowed: false,
      category: 'Reconciliation Operations'
    }
  },
  {
    id: 'AUD-2026-0085',
    timestamp: '2026-07-28 10:45:00 IST',
    actor: {
      userId: 'user-001',
      name: 'Chief Admin Operator',
      email: 'admin@iserveu.in',
      role: 'Admin',
      ipAddress: '192.168.1.104'
    },
    module: 'Privilege & Security',
    action: 'ROLE_BASELINE_UPDATED',
    severity: 'WARNING',
    status: 'FLAGGED',
    targetResource: 'Role: Finance Role Baseline',
    details: 'Updated Role Decide matrix: Allowed Finance users to export discrepancy reports.',
    metadata: {
      role: 'Finance',
      permissionId: 'perm-005',
      previousState: 'Restricted',
      newState: 'Allowed'
    }
  },
  {
    id: 'AUD-2026-0084',
    timestamp: '2026-07-28 10:02:18 IST',
    actor: {
      userId: 'user-003',
      name: 'Siddharth Verma',
      email: 'checker@iserveu.in',
      role: 'Finance',
      ipAddress: '192.168.1.122'
    },
    module: 'Discrepancy Handling',
    action: 'MANUAL_DISCREPANCY_CLEARANCE',
    severity: 'WARNING',
    status: 'FLAGGED',
    targetResource: 'Txn: TXN982341209 / RRN: 620914881023',
    details: 'Authorized manual adjustment for ₹1,450.00 timeout discrepancy under NPCI Deemed Settlement rule.',
    metadata: {
      txnId: 'TXN982341209',
      rrn: '620914881023',
      amount: 1450.00,
      reasonCode: 'NPCI_DEEMED_SUCCESS',
      makerUser: 'priya.sharma@iserveu.in',
      checkerUser: 'checker@iserveu.in'
    }
  },
  {
    id: 'AUD-2026-0083',
    timestamp: '2026-07-28 09:30:11 IST',
    actor: {
      name: 'NSDL CBS Accounting Bridge',
      email: 'cbs-sync@nsdlbank.com',
      role: 'System',
      ipAddress: '10.20.14.88'
    },
    module: 'Accounting & TTUM',
    action: 'TTUM_FILE_POSTED',
    severity: 'SUCCESS',
    status: 'SUCCESS',
    targetResource: 'File: TTUM_UPI_20260728_C1.txt',
    details: 'Generated and transmitted Two-Way Transaction Update Memorandum (TTUM) file to NSDL Payments Bank CBS.',
    metadata: {
      ttumBatchId: 'TTUM-UPI-20260728-101',
      totalCreditsINR: 15420000.00,
      totalDebitsINR: 15420000.00,
      varianceINR: 0.00,
      glAccountHead: '10042-PAYMENT-SETTLEMENT-POOL'
    }
  },
  {
    id: 'AUD-2026-0082',
    timestamp: '2026-07-28 09:00:04 IST',
    actor: {
      userId: 'user-001',
      name: 'Chief Admin Operator',
      email: 'admin@iserveu.in',
      role: 'Admin',
      ipAddress: '192.168.1.104'
    },
    module: 'Authentication',
    action: 'USER_LOGIN_SUCCESS',
    severity: 'INFO',
    status: 'SUCCESS',
    targetResource: 'Session: Admin Portal',
    details: 'User authenticated successfully via credentials and biometric 2FA token.',
    metadata: {
      authMethod: 'Password + TOTP 2FA',
      clientPlatform: 'Windows 11 / Chrome 124.0',
      sessionId: 'sess_991823a0ff42'
    }
  },
  {
    id: 'AUD-2026-0081',
    timestamp: '2026-07-28 08:45:19 IST',
    actor: {
      userId: 'user-002',
      name: 'Priya Sharma',
      email: 'finance@iserveu.in',
      role: 'Finance',
      ipAddress: '192.168.1.118'
    },
    module: 'Authentication',
    action: 'USER_LOGIN_SUCCESS',
    severity: 'INFO',
    status: 'SUCCESS',
    targetResource: 'Session: Finance Operator Portal',
    details: 'User authenticated successfully into Finance reconciliation workspace.',
    metadata: {
      authMethod: 'Password',
      clientPlatform: 'Windows 11 / Chrome 124.0',
      sessionId: 'sess_441209bc1198'
    }
  },
  {
    id: 'AUD-2026-0080',
    timestamp: '2026-07-27 18:00:22 IST',
    actor: {
      userId: 'user-001',
      name: 'Chief Admin Operator',
      email: 'admin@iserveu.in',
      role: 'Admin',
      ipAddress: '192.168.1.104'
    },
    module: 'User & IAM',
    action: 'USER_STATUS_TOGGLED',
    severity: 'WARNING',
    status: 'SUCCESS',
    targetResource: 'User: Siddharth Verma (EMP-1003)',
    details: 'Temporarily deactivated account for compliance quarterly audit review.',
    metadata: {
      targetUserId: 'user-003',
      previousStatus: 'Active',
      newStatus: 'Inactive',
      reason: 'Periodic IAM access review'
    }
  }
];
