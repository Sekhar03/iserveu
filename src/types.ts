export type UserRole = 'Admin' | 'Finance';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department: string;
  title: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  password?: string;
}

export interface RolePermission {
  id: string;
  name: string;
  category: string;
  description: string;
  adminAllowed: boolean;
  financeAllowed: boolean;
}

export interface UserSession {
  username: string;
  name: string;
  role: UserRole;
  title: string;
  isLoggedIn: boolean;
}

export type ModuleKey = 'product-recon' | 'job-archives' | 'admin-settings';

export type BusinessVerticalId = 'agency-banking' | 'acquiring' | 'issuing' | 'bbps';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  verticalId: BusinessVerticalId;
  verticalName: string;
}

export interface RequiredSourceFile {
  id: string;
  name: string;
  type: 'internal' | 'counterparty';
  channel: string; // e.g. "GCP Bucket" or "SFTP Bank Portal"
  defaultRecordCount: number;
}

export interface MatchingCriteriaRule {
  system: string;
  matchingKey: string;
  amountField: string;
  statusField: string;
  rrnField?: string;
  payerVpaField?: string;
}

export interface SampleReportLink {
  name: string;
  url: string;
}

export interface SubProduct {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  highlights?: string[];
  autoClearanceEnabled?: boolean;
  sampleReports?: SampleReportLink[];
  matchingCriteriaRules?: MatchingCriteriaRule[];
  requiredFiles: RequiredSourceFile[];
}

export interface FileState {
  fileId: string;
  name: string;
  type: 'internal' | 'counterparty';
  channel: string;
  status: 'pending' | 'fetching' | 'success';
  recordCount: number;
  previewData: Record<string, any>[];
}

export interface ReconRecord {
  id: string;
  txnId: string;
  rrn: string;
  agentId: string;
  amount: number;
  status: 'matched' | 'mismatched';
  npciStatus?: string;
  switchStatus?: string;
  middlewareStatus?: string;
  walletStatus?: string;
  discrepancyReason?: string;
  actionToBeTaken?: string;
  timestamp: string;
  channel: string;
}

export interface ReconJob {
  id: string;
  subProductId: string;
  subProductName: string;
  categoryName: string;
  date: string;
  cycle: string;
  totalRecords: number;
  matchedRecords: number;
  mismatchedRecords: number;
  matchRate: number;
  status: 'Completed';
  createdAt: string;
  matchedData: ReconRecord[];
  mismatchedData: ReconRecord[];
}
