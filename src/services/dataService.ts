/**
 * Unified Enterprise Data Service
 * Supports Cloud Firestore when configured, and reliable local state engine
 */

import {
  Project,
  ProjectBaseline,
  ProjectUpdate,
  ProjectDocument,
  RiskItem,
  IssueItem,
  AppNotification,
  AuditLogEntry,
  ProjectCloseout,
  UserProfile,
} from '../types';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

// Initial pre-seeded enterprise projects matching Screenshot 2, 3, 4, 6, 7, 8, 9
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-rr-001',
    code: 'RR-001',
    name: 'Riverside Residences',
    description: '10-storey luxury residential condominium with podium parking and landscape amenities.',
    client: 'ABC Development Corp.',
    location: 'Santa Rosa, Laguna',
    type: 'Residential',
    assignedPm: 'Ian Tumulak',
    assignedPmAvatar: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
    startDate: '2026-03-01',
    targetCompletionDate: '2026-12-31',
    targetDurationMonths: 10,
    contractAmount: 25000000,
    currency: 'PHP',
    status: 'Active',
    currentHealth: 'Behind',
    imageUrl: '/src/assets/images/building_riverside_residence_1792219353957.jpg',
    members: [
      { userId: 'u-1', name: 'Ian Tumulak', role: 'Project Manager', email: 'icitumulak@gmail.com' },
      { userId: 'u-2', name: 'Maria Santos', role: 'Project Engineer', email: 'msantos@pmoutlook.com' },
      { userId: 'u-3', name: 'Roberto Tan', role: 'Finance Officer', email: 'rtan@pmoutlook.com' },
      { userId: 'u-4', name: 'Elena Cruz', role: 'Billing Officer', email: 'ecruz@pmoutlook.com' },
    ],
    activeBaselineId: 'base-rr-001-v1',
    latestUpdateId: 'upd-rr-001-sep2026',
    createdAt: '2026-02-15T08:00:00Z',
    createdBy: 'Ian Tumulak',
    updatedAt: '2026-09-30T17:00:00Z',
  },
  {
    id: 'proj-mre-002',
    code: 'MRE-002',
    name: 'Metro Rail Expansion Line 4',
    description: 'Elevated viaduct, station civil works, and rail track installation package.',
    client: 'Department of Transportation',
    location: 'Ortigas to Taytay, Rizal',
    type: 'Infrastructure',
    assignedPm: 'Engr. David Bautista',
    assignedPmAvatar: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
    startDate: '2025-06-01',
    targetCompletionDate: '2027-08-31',
    targetDurationMonths: 26,
    contractAmount: 850000000,
    currency: 'PHP',
    status: 'Active',
    currentHealth: 'On Track',
    imageUrl: '/src/assets/images/login_construction_hero_1792219352522.jpg',
    members: [
      { userId: 'u-5', name: 'David Bautista', role: 'Project Manager', email: 'dbautista@pmoutlook.com' },
      { userId: 'u-3', name: 'Roberto Tan', role: 'Finance Officer', email: 'rtan@pmoutlook.com' },
    ],
    activeBaselineId: 'base-mre-002-v1',
    createdAt: '2025-05-10T08:00:00Z',
    createdBy: 'David Bautista',
    updatedAt: '2026-09-28T10:00:00Z',
  },
  {
    id: 'proj-sft-003',
    code: 'SFT-003',
    name: 'Skyline Financial Tower B',
    description: 'Commercial corporate office tower with Grade A LEED Gold standards.',
    client: 'Megawide Capital Corp',
    location: 'Bonifacio Global City, Taguig',
    type: 'Commercial',
    assignedPm: 'Engr. Sarah Gomez',
    assignedPmAvatar: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
    startDate: '2025-10-01',
    targetCompletionDate: '2027-04-30',
    targetDurationMonths: 18,
    contractAmount: 120000000,
    currency: 'PHP',
    status: 'Active',
    currentHealth: 'Slight Delay',
    imageUrl: '/src/assets/images/building_riverside_residence_1792219353957.jpg',
    members: [
      { userId: 'u-6', name: 'Sarah Gomez', role: 'Project Manager', email: 'sgomez@pmoutlook.com' },
    ],
    activeBaselineId: 'base-sft-003-v1',
    createdAt: '2025-09-15T08:00:00Z',
    createdBy: 'Sarah Gomez',
    updatedAt: '2026-09-25T14:00:00Z',
  },
  {
    id: 'proj-alh-004',
    code: 'ALH-004',
    name: 'Apex Logistics Hub',
    description: 'Automated warehouse distribution center and high-bay cold storage facilities.',
    client: 'Prime Cargo International',
    location: 'Batangas Port City',
    type: 'Industrial',
    assignedPm: 'Ian Tumulak',
    assignedPmAvatar: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
    startDate: '2026-01-15',
    targetCompletionDate: '2026-11-30',
    targetDurationMonths: 10,
    contractAmount: 45000000,
    currency: 'PHP',
    status: 'Active',
    currentHealth: 'On Track',
    imageUrl: '/src/assets/images/login_construction_hero_1792219352522.jpg',
    members: [
      { userId: 'u-1', name: 'Ian Tumulak', role: 'Project Manager', email: 'icitumulak@gmail.com' },
    ],
    activeBaselineId: 'base-alh-004-v1',
    createdAt: '2026-01-05T08:00:00Z',
    createdBy: 'Ian Tumulak',
    updatedAt: '2026-09-20T11:00:00Z',
  },
  {
    id: 'proj-phw-005',
    code: 'PHW-005',
    name: 'Provincial Hospital Wing',
    description: '150-bed modern medical pavilion with ICU, OR suites, and diagnostic radiology center.',
    client: 'Provincial Government',
    location: 'Trece Martires, Cavite',
    type: 'Institutional',
    assignedPm: 'Engr. Victor Ramos',
    assignedPmAvatar: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
    startDate: '2025-08-01',
    targetCompletionDate: '2026-10-31',
    targetDurationMonths: 15,
    contractAmount: 68000000,
    currency: 'PHP',
    status: 'Active',
    currentHealth: 'Behind',
    imageUrl: '/src/assets/images/building_riverside_residence_1792219353957.jpg',
    members: [
      { userId: 'u-7', name: 'Victor Ramos', role: 'Project Manager', email: 'vramos@pmoutlook.com' },
    ],
    activeBaselineId: 'base-phw-005-v1',
    createdAt: '2025-07-20T08:00:00Z',
    createdBy: 'Victor Ramos',
    updatedAt: '2026-09-18T16:00:00Z',
  },
];

// Initial Approved Baseline for Riverside Residences RR-001 (Screenshot 3)
const INITIAL_BASELINES: Record<string, ProjectBaseline> = {
  'base-rr-001-v1': {
    id: 'base-rr-001-v1',
    projectId: 'proj-rr-001',
    version: 1,
    scopeDescription: 'Construction of 10-storey residential condominium including site civil works, building structure, architectural finishes, and MEPFS installations.',
    originalContractAmount: 25000000,
    approvedBudget: 22500000, // 90% target cost budget
    plannedStartDate: '2026-03-01',
    plannedCompletionDate: '2026-12-31',
    targetDurationMonths: 10,
    currency: 'PHP',
    workPackages: [
      {
        id: 'wp-1',
        code: 'WP-01',
        name: 'General Requirements',
        description: 'Mobilization, permits, temporary facilities',
        selected: true,
        plannedWeight: 10,
        plannedCost: 2250000,
      },
      {
        id: 'wp-2',
        code: 'WP-02',
        name: 'Site Development',
        description: 'Earthworks, site utilities, drainage',
        selected: true,
        plannedWeight: 20,
        plannedCost: 4500000,
      },
      {
        id: 'wp-3',
        code: 'WP-03',
        name: 'Building Works',
        description: 'Structure, architectural, MEP',
        selected: true,
        plannedWeight: 45,
        plannedCost: 10125000,
      },
      {
        id: 'wp-4',
        code: 'WP-04',
        name: 'External Works',
        description: 'Roads, parking, landscaping',
        selected: true,
        plannedWeight: 15,
        plannedCost: 3375000,
      },
      {
        id: 'wp-5',
        code: 'WP-05',
        name: 'Testing & Commissioning',
        description: 'Testing, punchlist, turnover',
        selected: true,
        plannedWeight: 10,
        plannedCost: 2250000,
      },
    ],
    milestones: [
      { id: 'm-1', name: 'Notice to Proceed & Mobilization', targetDate: '2026-03-15', isKeyMilestone: true, status: 'Completed', completedDate: '2026-03-14', billingTriggerPercentage: 15 },
      { id: 'm-2', name: 'Substructure & Foundation Sign-off', targetDate: '2026-05-30', isKeyMilestone: true, status: 'Completed', completedDate: '2026-06-05', billingTriggerPercentage: 20 },
      { id: 'm-3', name: 'Top-off Structural Works', targetDate: '2026-08-31', isKeyMilestone: true, status: 'Completed', completedDate: '2026-09-10', billingTriggerPercentage: 25 },
      { id: 'm-4', name: 'Substantial Completion & Enclosure', targetDate: '2026-10-31', isKeyMilestone: true, status: 'Delayed', billingTriggerPercentage: 20 },
      { id: 'm-5', name: 'Testing, Turnover & Final Acceptance', targetDate: '2026-12-31', isKeyMilestone: true, status: 'Pending', billingTriggerPercentage: 20 },
    ],
    monthlyCostPlan: [
      { month: 'Mar 2026', plannedCost: 1500000, cumulativeCost: 1500000, plannedProgress: 10 },
      { month: 'Apr 2026', plannedCost: 2000000, cumulativeCost: 3500000, plannedProgress: 20 },
      { month: 'May 2026', plannedCost: 2500000, cumulativeCost: 6000000, plannedProgress: 35 },
      { month: 'Jun 2026', plannedCost: 3000000, cumulativeCost: 9000000, plannedProgress: 50 },
      { month: 'Jul 2026', plannedCost: 3500000, cumulativeCost: 12500000, plannedProgress: 65 },
      { month: 'Aug 2026', plannedCost: 3500000, cumulativeCost: 16000000, plannedProgress: 75 },
      { month: 'Sep 2026', plannedCost: 3000000, cumulativeCost: 19000000, plannedProgress: 85 },
      { month: 'Oct 2026', plannedCost: 2000000, cumulativeCost: 21000000, plannedProgress: 92 },
      { month: 'Nov 2026', plannedCost: 1000000, cumulativeCost: 22000000, plannedProgress: 97 },
      { month: 'Dec 2026', plannedCost: 500000, cumulativeCost: 22500000, plannedProgress: 100 },
    ],
    billingMilestones: [
      { id: 'bm-1', name: 'Mobilization Advance (15%)', percentage: 15, expectedAmount: 3750000, expectedMonth: 'Mar 2026' },
      { id: 'bm-2', name: 'Progress Billing #1 (Substructure)', percentage: 20, expectedAmount: 5000000, expectedMonth: 'May 2026' },
      { id: 'bm-3', name: 'Progress Billing #2 (Superstructure)', percentage: 25, expectedAmount: 6250000, expectedMonth: 'Aug 2026' },
      { id: 'bm-4', name: 'Progress Billing #3 (Architectural/MEP)', percentage: 25, expectedAmount: 6250000, expectedMonth: 'Oct 2026' },
      { id: 'bm-5', name: 'Final Billing & Retention (15%)', percentage: 15, expectedAmount: 3750000, expectedMonth: 'Dec 2026' },
    ],
    isApproved: true,
    approvedBy: 'Executive Committee',
    approvedAt: '2026-02-28T16:00:00Z',
    createdAt: '2026-02-20T10:00:00Z',
    createdBy: 'Ian Tumulak',
  },
};

// Initial Periodic Update for Riverside Residences RR-001 (Matching Screenshot 4)
const INITIAL_UPDATES: Record<string, ProjectUpdate[]> = {
  'proj-rr-001': [
    {
      id: 'upd-rr-001-sep2026',
      projectId: 'proj-rr-001',
      reportingPeriod: 'Sep 2026',
      submissionDate: '2026-09-30T17:00:00Z',
      submittedBy: 'Ian Tumulak',
      status: 'Approved',
      approvedBy: 'Roberto Tan (Finance Officer)',
      approvedAt: '2026-10-02T09:00:00Z',
      actualPhysicalProgress: 58.5, // Weighted average of WP actuals
      actualCostsIncurred: 16500000,
      committedCosts: 2800000,
      billingSubmitted: 15000000,
      billingApproved: 14200000,
      invoicesIssued: 14200000,
      cashCollectionsReceived: 12500000,
      outstandingReceivables: 1700000,
      scheduleStatus: 'Behind',
      completedMilestones: ['m-1', 'm-2', 'm-3'],
      delayedMilestones: ['m-4'],
      workPackageUpdates: [
        {
          workPackageId: 'wp-1',
          plannedPercent: 100,
          actualPercent: 100,
          actualCostIncurred: 2200000,
          status: 'On Track',
          notes: 'Temporary power, perimeter fencing, and staff quarter completed.',
        },
        {
          workPackageId: 'wp-2',
          plannedPercent: 80,
          actualPercent: 70,
          actualCostIncurred: 3900000,
          status: 'Slight Delay',
          notes: 'Drainage culvert tie-in held pending city highway permit.',
        },
        {
          workPackageId: 'wp-3',
          plannedPercent: 40,
          actualPercent: 30,
          actualCostIncurred: 7100000,
          status: 'Behind',
          notes: 'Rebar delivery bottlenecks delayed 8th floor slab pouring.',
        },
        {
          workPackageId: 'wp-4',
          plannedPercent: 10,
          actualPercent: 5,
          actualCostIncurred: 300000,
          status: 'Behind',
          notes: 'Sub-base compaction commenced; curbs pending road excavation.',
        },
        {
          workPackageId: 'wp-5',
          plannedPercent: 0,
          actualPercent: 0,
          actualCostIncurred: 0,
          status: 'On Track',
          notes: 'Scheduled for Q4 after electrical energization.',
        },
      ],
      keyRisks: [
        'Curfew on concrete mixer transit along Santa Rosa highway during rush hours',
        'Cement price volatility rising ~6% from baseline quotation',
      ],
      correctiveActions: [
        'Added secondary night pouring shift for 8th and 9th floor slabs',
        'Expedited advance requisition of MEP conduit risers and distribution boxes',
      ],
      remarks: 'Target completion date projected to shift by 31 days unless 2nd shift productivity is sustained.',
      version: 1,
      createdAt: '2026-09-30T17:00:00Z',
      updatedAt: '2026-10-02T09:00:00Z',
    },
  ],
};

// Initial Project Documents matching Screenshot 9
const INITIAL_DOCUMENTS: Record<string, ProjectDocument[]> = {
  'proj-rr-001': [
    {
      id: 'doc-1',
      projectId: 'proj-rr-001',
      name: 'Contract Agreement.pdf',
      category: 'Contracts',
      size: '4.8 MB',
      mimeType: 'application/pdf',
      uploadDate: 'Mar 01, 2026',
      uploadedBy: 'Ian Tumulak',
      fileUrl: '#',
      notes: 'Executed main contract signed by ABC Dev Corp and Principal Contractor.',
    },
    {
      id: 'doc-2',
      projectId: 'proj-rr-001',
      name: 'Progress Photos Sept 2026.zip',
      category: 'Photos',
      size: '42.1 MB',
      mimeType: 'application/zip',
      uploadDate: 'Sep 30, 2026',
      uploadedBy: 'Ian Tumulak',
      fileUrl: '#',
      notes: 'Drone site overview, structural rebar inspection, and podium progress.',
    },
    {
      id: 'doc-3',
      projectId: 'proj-rr-001',
      name: 'Billing Certificate #3.pdf',
      category: 'Reports',
      size: '1.2 MB',
      mimeType: 'application/pdf',
      uploadDate: 'Sep 28, 2026',
      uploadedBy: 'Ian Tumulak',
      fileUrl: '#',
      notes: 'Quantity surveyor verified progress billing certificate.',
    },
    {
      id: 'doc-4',
      projectId: 'proj-rr-001',
      name: 'RR-012 Response.pdf',
      category: 'Correspondence',
      size: '850 KB',
      mimeType: 'application/pdf',
      uploadDate: 'Sep 25, 2026',
      uploadedBy: 'Ian Tumulak',
      fileUrl: '#',
      notes: 'Engineering response regarding electrical substation clearance.',
    },
    {
      id: 'doc-5',
      projectId: 'proj-rr-001',
      name: 'As-built Drawing.pdf',
      category: 'Drawings',
      size: '18.4 MB',
      mimeType: 'application/pdf',
      uploadDate: 'Sep 20, 2026',
      uploadedBy: 'Ian Tumulak',
      fileUrl: '#',
      notes: 'Foundation and basement retention piling as-built CAD export.',
    },
  ],
};

// Initial Risks & Issues
const INITIAL_RISKS: Record<string, RiskItem[]> = {
  'proj-rr-001': [
    {
      id: 'risk-1',
      projectId: 'proj-rr-001',
      title: 'Monsoon season heavy rain delays on external civil works',
      description: 'Heavy precipitation during Oct-Nov could hinder exterior roadway and stormwater detention tank installation.',
      category: 'Schedule',
      probability: 'High',
      impact: 'High',
      mitigationPlan: 'Deploy heavy-duty dewatering pumps and precast trench covers.',
      owner: 'Maria Santos (Site Engr)',
      status: 'Open',
    },
    {
      id: 'risk-2',
      projectId: 'proj-rr-001',
      title: 'Import lead times on specialized elevator motors',
      description: 'Traction hoist shipment scheduled through Manila South Harbor subject to customs clearance.',
      category: 'Procurement',
      probability: 'Medium',
      impact: 'High',
      mitigationPlan: 'Track bill of lading and engage express customs brokerage agent.',
      owner: 'Procurement Lead',
      status: 'Open',
    },
  ],
};

const INITIAL_ISSUES: Record<string, IssueItem[]> = {
  'proj-rr-001': [
    {
      id: 'issue-1',
      projectId: 'proj-rr-001',
      title: 'Delayed utility relocation permit on boundary wall',
      severity: 'High',
      status: 'In Progress',
      assignedTo: 'Maria Santos',
      identifiedDate: '2026-09-10',
      targetResolutionDate: '2026-10-15',
      actionTaken: 'Met with city engineer; permit inspection scheduled for Thursday.',
    },
  ],
};

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    projectId: 'proj-rr-001',
    projectCode: 'RR-001',
    action: 'Approved Periodic Update (Sep 2026)',
    entityType: 'Update',
    entityId: 'upd-rr-001-sep2026',
    userId: 'u-3',
    userName: 'Roberto Tan',
    userRole: 'Finance Officer',
    timestamp: '2026-10-02T09:00:00Z',
    details: 'Verified cost incurred ₱16.5M and progress certification of 58.5%.',
  },
  {
    id: 'log-2',
    projectId: 'proj-rr-001',
    projectCode: 'RR-001',
    action: 'Approved Project Baseline v1',
    entityType: 'Baseline',
    entityId: 'base-rr-001-v1',
    userId: 'u-admin',
    userName: 'Executive Board',
    userRole: 'System Administrator',
    timestamp: '2026-02-28T16:00:00Z',
    details: 'Contract amount ₱25,000,000 with approved budget ₱22,500,000 ratified.',
  },
];

// Initial In-App Notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Schedule Alert: Riverside Residences',
    message: 'Project RR-001 is forecasted to slip by 31 days due to structural works pacing.',
    type: 'alert',
    projectId: 'proj-rr-001',
    projectCode: 'RR-001',
    timestamp: '2026-10-02T09:15:00Z',
    read: false,
    link: '/forecasting',
  },
  {
    id: 'notif-2',
    title: 'Pending Progress Update',
    message: 'Skyline Financial Tower B update for Sep 2026 is due for submission.',
    type: 'warning',
    projectId: 'proj-sft-003',
    projectCode: 'SFT-003',
    timestamp: '2026-10-01T08:00:00Z',
    read: false,
    link: '/updates',
  },
  {
    id: 'notif-3',
    title: 'Billing Milestone Approved',
    message: '₱6.25M progress billing for RR-001 was certified by client representative.',
    type: 'success',
    projectId: 'proj-rr-001',
    projectCode: 'RR-001',
    timestamp: '2026-09-29T14:30:00Z',
    read: true,
    link: '/billing',
  },
];

class EnterpriseDataStore {
  private projects: Project[] = [];
  private baselines: Record<string, ProjectBaseline> = {};
  private updates: Record<string, ProjectUpdate[]> = {};
  private documents: Record<string, ProjectDocument[]> = {};
  private risks: Record<string, RiskItem[]> = {};
  private issues: Record<string, IssueItem[]> = {};
  private closeouts: Record<string, ProjectCloseout> = {};
  private auditLogs: AuditLogEntry[] = [];
  private notifications: AppNotification[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const p = localStorage.getItem('pmo_projects');
      const rawProjects: Project[] = p ? JSON.parse(p) : INITIAL_PROJECTS;
      const seen = new Set<string>();
      this.projects = rawProjects.filter((prj) => {
        if (!prj.id || seen.has(prj.id)) return false;
        seen.add(prj.id);
        return true;
      });

      const b = localStorage.getItem('pmo_baselines');
      this.baselines = b ? JSON.parse(b) : INITIAL_BASELINES;

      const u = localStorage.getItem('pmo_updates');
      this.updates = u ? JSON.parse(u) : INITIAL_UPDATES;

      const d = localStorage.getItem('pmo_documents');
      this.documents = d ? JSON.parse(d) : INITIAL_DOCUMENTS;

      const r = localStorage.getItem('pmo_risks');
      this.risks = r ? JSON.parse(r) : INITIAL_RISKS;

      const iss = localStorage.getItem('pmo_issues');
      this.issues = iss ? JSON.parse(iss) : INITIAL_ISSUES;

      const c = localStorage.getItem('pmo_closeouts');
      this.closeouts = c ? JSON.parse(c) : {};

      const l = localStorage.getItem('pmo_audit_logs');
      this.auditLogs = l ? JSON.parse(l) : INITIAL_AUDIT_LOGS;

      const n = localStorage.getItem('pmo_notifications');
      this.notifications = n ? JSON.parse(n) : INITIAL_NOTIFICATIONS;
    } catch {
      this.projects = INITIAL_PROJECTS;
      this.baselines = INITIAL_BASELINES;
      this.updates = INITIAL_UPDATES;
      this.documents = INITIAL_DOCUMENTS;
      this.risks = INITIAL_RISKS;
      this.issues = INITIAL_ISSUES;
      this.closeouts = {};
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.notifications = INITIAL_NOTIFICATIONS;
    }
  }

  private persistState() {
    // Ensure uniqueness before persisting
    const seen = new Set<string>();
    this.projects = this.projects.filter((prj) => {
      if (!prj.id || seen.has(prj.id)) return false;
      seen.add(prj.id);
      return true;
    });

    localStorage.setItem('pmo_projects', JSON.stringify(this.projects));
    localStorage.setItem('pmo_baselines', JSON.stringify(this.baselines));
    localStorage.setItem('pmo_updates', JSON.stringify(this.updates));
    localStorage.setItem('pmo_documents', JSON.stringify(this.documents));
    localStorage.setItem('pmo_risks', JSON.stringify(this.risks));
    localStorage.setItem('pmo_issues', JSON.stringify(this.issues));
    localStorage.setItem('pmo_closeouts', JSON.stringify(this.closeouts));
    localStorage.setItem('pmo_audit_logs', JSON.stringify(this.auditLogs));
    localStorage.setItem('pmo_notifications', JSON.stringify(this.notifications));
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    let list: Project[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'projects'));
        if (!snap.empty) {
          snap.forEach((d) => list.push(d.data() as Project));
        }
      } catch (e) {
        console.warn('Firestore fetch failed, using local store:', e);
      }
    }
    if (list.length === 0) {
      list = [...this.projects];
    }
    const seen = new Set<string>();
    return list.filter((prj) => {
      if (!prj.id || seen.has(prj.id)) return false;
      seen.add(prj.id);
      return true;
    });
  }

  async getProjectById(id: string): Promise<Project | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'projects', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) return snap.data() as Project;
      } catch (e) {
        console.warn('Firestore fetch failed:', e);
      }
    }
    return this.projects.find((p) => p.id === id) || null;
  }

  async createProject(project: Project, user: UserProfile): Promise<Project> {
    const existingIdx = this.projects.findIndex((p) => p.id === project.id);
    if (existingIdx !== -1) {
      this.projects[existingIdx] = project;
    } else {
      this.projects.unshift(project);
    }
    this.persistState();

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'projects', project.id), project);
      } catch (err) {
        console.warn('Firestore write failed:', err);
      }
    }

    this.recordAuditLog({
      projectId: project.id,
      projectCode: project.code,
      action: 'Project Created',
      entityType: 'Project',
      entityId: project.id,
      userId: user.id,
      userName: user.displayName,
      userRole: user.role,
      details: `Project registered: "${project.name}" with contract amount ₱${project.contractAmount.toLocaleString()}`,
    });

    return project;
  }

  async updateProject(project: Project, user: UserProfile): Promise<Project> {
    const idx = this.projects.findIndex((p) => p.id === project.id);
    if (idx !== -1) {
      this.projects[idx] = { ...project, updatedAt: new Date().toISOString() };
      this.persistState();
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'projects', project.id), { ...project, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore update failed:', err);
      }
    }

    this.recordAuditLog({
      projectId: project.id,
      projectCode: project.code,
      action: 'Project Information Updated',
      entityType: 'Project',
      entityId: project.id,
      userId: user.id,
      userName: user.displayName,
      userRole: user.role,
      details: `Updated metadata for ${project.code}`,
    });

    return project;
  }

  // Baselines
  async getBaseline(baselineId: string): Promise<ProjectBaseline | null> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'baselines', baselineId));
        if (snap.exists()) return snap.data() as ProjectBaseline;
      } catch (e) {
        console.warn(e);
      }
    }
    return this.baselines[baselineId] || null;
  }

  async saveBaseline(baseline: ProjectBaseline, user: UserProfile): Promise<ProjectBaseline> {
    this.baselines[baseline.id] = baseline;
    // update project baseline reference
    const p = this.projects.find((prj) => prj.id === baseline.projectId);
    if (p) {
      p.activeBaselineId = baseline.id;
    }
    this.persistState();

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'baselines', baseline.id), baseline);
      } catch (err) {
        console.warn(err);
      }
    }

    this.recordAuditLog({
      projectId: baseline.projectId,
      projectCode: p?.code || 'PRJ',
      action: baseline.isApproved ? 'Baseline Approved' : 'Baseline Saved / Updated',
      entityType: 'Baseline',
      entityId: baseline.id,
      userId: user.id,
      userName: user.displayName,
      userRole: user.role,
      details: `Baseline v${baseline.version} ${baseline.isApproved ? 'approved' : 'drafted'} by ${user.displayName}`,
    });

    return baseline;
  }

  // Periodic Updates
  async getUpdatesByProjectId(projectId: string): Promise<ProjectUpdate[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, `projects/${projectId}/updates`));
        if (!snap.empty) {
          const list: ProjectUpdate[] = [];
          snap.forEach((d) => list.push(d.data() as ProjectUpdate));
          return list.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return (this.updates[projectId] || []).sort(
      (a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
  }

  async submitUpdate(update: ProjectUpdate, user: UserProfile): Promise<ProjectUpdate> {
    if (!this.updates[update.projectId]) {
      this.updates[update.projectId] = [];
    }

    // Check if period already exists
    const existingIdx = this.updates[update.projectId].findIndex(
      (u) => u.reportingPeriod.toLowerCase() === update.reportingPeriod.toLowerCase()
    );

    if (existingIdx !== -1) {
      // Overwrite/update existing period revision
      this.updates[update.projectId][existingIdx] = update;
    } else {
      this.updates[update.projectId].unshift(update);
    }

    // Update project health status & latest update
    const p = this.projects.find((prj) => prj.id === update.projectId);
    if (p) {
      p.latestUpdateId = update.id;
      p.currentHealth = update.scheduleStatus;
      p.updatedAt = new Date().toISOString();
    }

    this.persistState();

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, `projects/${update.projectId}/updates`, update.id), update);
      } catch (err) {
        console.warn(err);
      }
    }

    this.recordAuditLog({
      projectId: update.projectId,
      projectCode: p?.code || 'PRJ',
      action: 'Project Progress Update Submitted',
      entityType: 'Update',
      entityId: update.id,
      userId: user.id,
      userName: user.displayName,
      userRole: user.role,
      details: `Reporting month ${update.reportingPeriod}: Actual physical progress ${update.actualPhysicalProgress}%, Costs ₱${update.actualCostsIncurred.toLocaleString()}`,
    });

    return update;
  }

  // Documents
  async getDocuments(projectId: string): Promise<ProjectDocument[]> {
    return this.documents[projectId] || [];
  }

  async addDocument(docItem: ProjectDocument, user: UserProfile): Promise<ProjectDocument> {
    if (!this.documents[docItem.projectId]) {
      this.documents[docItem.projectId] = [];
    }
    this.documents[docItem.projectId].unshift(docItem);
    this.persistState();

    const p = this.projects.find((prj) => prj.id === docItem.projectId);
    this.recordAuditLog({
      projectId: docItem.projectId,
      projectCode: p?.code || 'PRJ',
      action: 'Document Uploaded',
      entityType: 'Document',
      entityId: docItem.id,
      userId: user.id,
      userName: user.displayName,
      userRole: user.role,
      details: `Uploaded ${docItem.name} (${docItem.category})`,
    });

    return docItem;
  }

  async deleteDocument(projectId: string, docId: string): Promise<void> {
    if (this.documents[projectId]) {
      this.documents[projectId] = this.documents[projectId].filter((d) => d.id !== docId);
      this.persistState();
    }
  }

  // Risks & Issues
  async getRisks(projectId: string): Promise<RiskItem[]> {
    return this.risks[projectId] || [];
  }

  async addRisk(risk: RiskItem): Promise<RiskItem> {
    if (!this.risks[risk.projectId]) this.risks[risk.projectId] = [];
    this.risks[risk.projectId].unshift(risk);
    this.persistState();
    return risk;
  }

  async getIssues(projectId: string): Promise<IssueItem[]> {
    return this.issues[projectId] || [];
  }

  async addIssue(issue: IssueItem): Promise<IssueItem> {
    if (!this.issues[issue.projectId]) this.issues[issue.projectId] = [];
    this.issues[issue.projectId].unshift(issue);
    this.persistState();
    return issue;
  }

  // Closeouts
  async getCloseout(projectId: string): Promise<ProjectCloseout | null> {
    return this.closeouts[projectId] || null;
  }

  async saveCloseout(closeout: ProjectCloseout, user: UserProfile): Promise<ProjectCloseout> {
    this.closeouts[closeout.projectId] = closeout;
    if (closeout.isCompleted) {
      const p = this.projects.find((prj) => prj.id === closeout.projectId);
      if (p) {
        p.status = 'Completed';
        p.currentHealth = 'On Track';
      }
    }
    this.persistState();

    const p = this.projects.find((prj) => prj.id === closeout.projectId);
    this.recordAuditLog({
      projectId: closeout.projectId,
      projectCode: p?.code || 'PRJ',
      action: closeout.isCompleted ? 'Project Formal Closeout & Archive' : 'Closeout Checklist Saved',
      entityType: 'Closeout',
      entityId: closeout.id,
      userId: user.id,
      userName: user.displayName,
      userRole: user.role,
      details: `Closeout status: ${closeout.isCompleted ? 'Completed & Reconciled' : 'In Progress'}`,
    });

    return closeout;
  }

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return [...this.notifications];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.persistState();
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    this.notifications.forEach((n) => (n.read = true));
    this.persistState();
  }

  // Audit Logs
  async getAuditLogs(projectId?: string): Promise<AuditLogEntry[]> {
    if (projectId) {
      return this.auditLogs.filter((l) => l.projectId === projectId);
    }
    return [...this.auditLogs];
  }

  private recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newEntry);
    this.persistState();
  }

  // Reset to seed data
  resetDemoData() {
    localStorage.removeItem('pmo_projects');
    localStorage.removeItem('pmo_baselines');
    localStorage.removeItem('pmo_updates');
    localStorage.removeItem('pmo_documents');
    localStorage.removeItem('pmo_risks');
    localStorage.removeItem('pmo_issues');
    localStorage.removeItem('pmo_closeouts');
    localStorage.removeItem('pmo_audit_logs');
    localStorage.removeItem('pmo_notifications');
    this.loadState();
    window.location.reload();
  }
}

export const dataStore = new EnterpriseDataStore();
