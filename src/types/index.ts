/**
 * Enterprise Project Management & Cost Control System
 * Comprehensive Domain Types
 */

export type UserRole = 
  | 'System Administrator'
  | 'Project Manager'
  | 'Project Engineer'
  | 'Finance Officer'
  | 'Billing and Collection Officer'
  | 'Executive / Read-Only Viewer';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  phoneNumber?: string;
}

export type ProjectStatus = 'Planning' | 'Active' | 'Under Review' | 'Completed' | 'Archived' | 'On Hold';
export type HealthStatus = 'On Track' | 'Slight Delay' | 'Behind' | 'Critical';
export type ProjectType = 'Residential' | 'Commercial' | 'Infrastructure' | 'Industrial' | 'Institutional';

export interface WorkPackage {
  id: string;
  code: string;
  name: string;
  description: string;
  selected: boolean;
  plannedWeight: number; // percentage weight of total project
  plannedCost: number; // in currency units
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  workPackageId?: string;
  isKeyMilestone: boolean;
  status: 'Pending' | 'Completed' | 'Delayed';
  completedDate?: string;
  billingTriggerPercentage?: number;
}

export interface ProjectBaseline {
  id: string;
  projectId: string;
  version: number;
  scopeDescription: string;
  originalContractAmount: number;
  approvedBudget: number;
  plannedStartDate: string;
  plannedCompletionDate: string;
  targetDurationMonths: number;
  currency: string;
  workPackages: WorkPackage[];
  milestones: Milestone[];
  monthlyCostPlan: { month: string; plannedCost: number; cumulativeCost: number; plannedProgress: number }[];
  billingMilestones: { id: string; name: string; percentage: number; expectedAmount: number; expectedMonth: string }[];
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
}

export interface WorkPackageUpdate {
  workPackageId: string;
  plannedPercent: number;
  actualPercent: number;
  actualCostIncurred: number;
  status: HealthStatus;
  notes?: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  reportingPeriod: string; // e.g. "2026-09" or "Sep 2026"
  submissionDate: string;
  submittedBy: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
  
  // Progress & Cost
  workPackageUpdates: WorkPackageUpdate[];
  actualPhysicalProgress: number; // 0 to 100
  actualCostsIncurred: number;
  committedCosts: number;
  
  // Billing & Collections
  billingSubmitted: number;
  billingApproved: number;
  invoicesIssued: number;
  cashCollectionsReceived: number;
  outstandingReceivables: number;
  
  // Schedule & Milestones
  scheduleStatus: HealthStatus;
  completedMilestones: string[];
  delayedMilestones: string[];
  
  // Risks & Action Items
  keyRisks: string[];
  correctiveActions: string[];
  remarks: string;
  
  // Audit metadata
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  category: 'Drawings' | 'Contracts' | 'Correspondence' | 'Photos' | 'Closeout' | 'Reports';
  size: string;
  mimeType: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
  notes?: string;
}

export interface RiskItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  category: 'Schedule' | 'Cost' | 'Technical' | 'Safety' | 'Procurement' | 'Environmental';
  probability: 'Low' | 'Medium' | 'High' | number;
  impact: 'Low' | 'Medium' | 'High' | number;
  mitigationPlan: string;
  owner: string;
  status: 'Open' | 'Mitigated' | 'Closed';
  riskScore?: number;
  exposureAmount?: number;
}

export interface IssueItem {
  id: string;
  projectId: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  assignedTo: string;
  identifiedDate: string;
  targetResolutionDate: string;
  actualResolutionDate?: string;
  actionTaken?: string;
}

export interface ProjectCloseout {
  id: string;
  projectId: string;
  isCompleted: boolean;
  closedAt?: string;
  closedBy?: string;
  checklist: {
    physicalCompletionVerified: boolean;
    finalCostReconciled: boolean;
    billingsCollectionsSettled: boolean;
    retentionMoneyClaimed: boolean;
    punchlistCleared: boolean;
    asBuiltDrawingsSubmitted: boolean;
    warrantiesGuaranteesFiled: boolean;
    finalAuditedAccountsApproved: boolean;
  };
  finalContractAmount: number;
  finalActualCost: number;
  finalProfitMargin: number;
  finalProfitPercent: number;
  lessonsLearned: string[];
  signOffRemarks?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  client: string;
  location: string;
  type: ProjectType;
  assignedPm: string;
  assignedPmAvatar?: string;
  startDate: string;
  targetCompletionDate: string;
  targetDurationMonths: number;
  contractAmount: number;
  currency: string;
  status: ProjectStatus;
  currentHealth: HealthStatus;
  imageUrl?: string;
  members: { userId: string; name: string; role: string; email: string }[];
  activeBaselineId?: string;
  latestUpdateId?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface EVMMetrics {
  plannedValue: number; // PV
  earnedValue: number; // EV
  actualCost: number; // AC
  budgetAtCompletion: number; // BAC
  scheduleVariance: number; // SV = EV - PV
  costVariance: number; // CV = EV - AC
  costVariancePercent: number; // (CV / EV) * 100
  schedulePerformanceIndex: number; // SPI = EV / PV
  costPerformanceIndex: number; // CPI = EV / AC
  toCompletePerformanceIndex?: number; // TCPI = (BAC - EV) / (BAC - AC)
  estimateAtCompletion: number; // EAC = BAC / CPI
  estimateToComplete: number; // ETC = EAC - AC
  varianceAtCompletion: number; // VAC = BAC - EAC
  physicalProgressVariance: number; // Actual% - Planned%
  estimatedCompletionDate: string;
  scheduleDelayDays: number;
  billingSubmitted: number;
  billingApproved: number;
  invoicesIssued: number;
  cashCollectionsReceived: number;
  outstandingReceivables: number;
  collectionRate: number; // Collections / Invoices
  unbilledEarnedWork: number;
  health: HealthStatus;
  healthRationale: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'info' | 'success';
  projectId?: string;
  projectCode?: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AuditLogEntry {
  id: string;
  projectId: string;
  projectCode: string;
  action: string;
  entityType: 'Project' | 'Baseline' | 'Update' | 'Finance' | 'Document' | 'Closeout';
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
}
