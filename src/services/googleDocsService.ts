/**
 * Google Workspace (Google Docs & Google Drive) Service
 * Client-side integration using Firebase Auth & Google OAuth token
 */
import {
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/firebase';
import { Project, ProjectBaseline, ProjectUpdate, EVMMetrics } from '../types';
import { formatCurrency } from './financialService';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
];

// In-memory token cache (Do NOT store in localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;

export const setCachedAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getCachedAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const clearCachedAccessToken = () => {
  inMemoryAccessToken = null;
};

/**
 * Sign in or request Google Docs & Drive OAuth authorization
 */
export const authorizeGoogleWorkspace = async (): Promise<{
  accessToken: string;
  user: User;
}> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Auth is not configured for this application.');
  }

  const provider = new GoogleAuthProvider();
  WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
  provider.setCustomParameters({
    prompt: 'consent',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  if (!credential?.accessToken) {
    throw new Error('No access token returned from Google sign-in.');
  }

  inMemoryAccessToken = credential.accessToken;
  return {
    accessToken: credential.accessToken,
    user: result.user,
  };
};

export interface ProposalGenerationResult {
  documentId: string;
  documentUrl: string;
  title: string;
}

/**
 * Creates a complete Google Docs project proposal for the given project
 */
export const createGoogleDocsProposal = async (
  project: Project,
  baseline: ProjectBaseline | null,
  latestUpdate: ProjectUpdate | null,
  metrics: EVMMetrics | null,
  executiveNotes?: string
): Promise<ProposalGenerationResult> => {
  let token = getCachedAccessToken();
  if (!token) {
    const authRes = await authorizeGoogleWorkspace();
    token = authRes.accessToken;
  }

  const proposalTitle = `Project Proposal - ${project.name} (${project.code})`;

  // 1. Create a blank Google Document via Docs API
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: proposalTitle,
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    if (createRes.status === 401 || createRes.status === 403) {
      // Token might be expired, clear cache
      clearCachedAccessToken();
      throw new Error(
        `Google Docs authentication required: ${errData.error?.message || 'Access token invalid or expired. Please authorize again.'}`
      );
    }
    throw new Error(
      `Failed to create Google Doc: ${errData.error?.message || createRes.statusText}`
    );
  }

  const createdDoc = await createRes.json();
  const documentId = createdDoc.documentId;

  // 2. Build structured proposal content text
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currency = project.currency || 'PHP';
  const contractValStr = formatCurrency(project.contractAmount, currency);
  const budgetValStr = baseline
    ? formatCurrency(baseline.approvedBudget, currency)
    : formatCurrency(project.contractAmount * 0.9, currency);
  const durationStr = `${project.targetDurationMonths} Months (${project.startDate} to ${project.targetCompletionDate})`;

  let contentText = '';
  contentText += `PROJECT PROPOSAL & BASELINE CHARTER\n`;
  contentText += `Prepared by: Project Management Outlook (Enterprise Project Controls)\n`;
  contentText += `Date of Proposal: ${dateStr}\n\n`;

  contentText += `1. EXECUTIVE SUMMARY\n`;
  contentText += `------------------------------------------------------------\n`;
  contentText += `Project Name: ${project.name}\n`;
  contentText += `Project Code: ${project.code}\n`;
  contentText += `Client / Proponent: ${project.client}\n`;
  contentText += `Location: ${project.location}\n`;
  contentText += `Project Type: ${project.type}\n`;
  contentText += `Project Manager: ${project.assignedPm}\n`;
  contentText += `Current Performance Health: ${project.currentHealth}\n\n`;

  contentText += `2. PROJECT SCOPE & OBJECTIVES\n`;
  contentText += `------------------------------------------------------------\n`;
  contentText += `Description:\n${project.description}\n\n`;
  if (baseline?.scopeDescription) {
    contentText += `Detailed Scope Baseline:\n${baseline.scopeDescription}\n\n`;
  }
  if (executiveNotes && executiveNotes.trim()) {
    contentText += `Strategic Executive Notes:\n${executiveNotes.trim()}\n\n`;
  }

  contentText += `3. COMMERCIAL & FINANCIAL FRAMEWORK\n`;
  contentText += `------------------------------------------------------------\n`;
  contentText += `Contract Value: ${contractValStr}\n`;
  contentText += `Approved Target Cost Budget: ${budgetValStr}\n`;
  contentText += `Target Duration: ${durationStr}\n`;
  if (metrics) {
    contentText += `Cost Performance Index (CPI): ${metrics.costPerformanceIndex.toFixed(2)}\n`;
    contentText += `Schedule Performance Index (SPI): ${metrics.schedulePerformanceIndex.toFixed(2)}\n`;
    contentText += `Planned Value (PV): ${formatCurrency(metrics.plannedValue, currency)}\n`;
    contentText += `Earned Value (EV): ${formatCurrency(metrics.earnedValue, currency)}\n`;
    contentText += `Actual Cost (AC): ${formatCurrency(metrics.actualCost, currency)}\n`;
    contentText += `Estimate at Completion (EAC): ${formatCurrency(metrics.estimateAtCompletion, currency)}\n`;
  }
  contentText += `\n`;

  contentText += `4. WORK PACKAGES & EXECUTION BREAKDOWN\n`;
  contentText += `------------------------------------------------------------\n`;
  if (baseline?.workPackages && baseline.workPackages.length > 0) {
    baseline.workPackages.forEach((wp, idx) => {
      contentText += `[${idx + 1}] ${wp.code} - ${wp.name}\n`;
      contentText += `    Weight: ${wp.plannedWeight}% | Planned Cost: ${formatCurrency(wp.plannedCost, currency)}\n`;
      contentText += `    Scope: ${wp.description}\n\n`;
    });
  } else {
    contentText += `Standard Work Breakdown Structure (WBS) will be initialized upon baseline formalization.\n\n`;
  }

  contentText += `5. KEY SCHEDULE & BILLING MILESTONES\n`;
  contentText += `------------------------------------------------------------\n`;
  if (baseline?.milestones && baseline.milestones.length > 0) {
    baseline.milestones.forEach((m) => {
      contentText += `• ${m.name}\n`;
      contentText += `    Target Date: ${m.targetDate} | Status: ${m.status}\n`;
      if (m.billingTriggerPercentage) {
        contentText += `    Billing Trigger: ${m.billingTriggerPercentage}% (${formatCurrency((project.contractAmount * m.billingTriggerPercentage) / 100, currency)})\n`;
      }
    });
    contentText += `\n`;
  } else {
    contentText += `Milestone 1: Notice to Proceed & Mobilization\n`;
    contentText += `Milestone 2: Substructure & Foundation Works Sign-off\n`;
    contentText += `Milestone 3: Superstructure Top-off\n`;
    contentText += `Milestone 4: Substantial Completion & Architectural Finishes\n`;
    contentText += `Milestone 5: Commissioning, Turnover & Final Acceptance\n\n`;
  }

  contentText += `6. GOVERNANCE, RISK MANAGEMENT & APPROVALS\n`;
  contentText += `------------------------------------------------------------\n`;
  contentText += `Project Stakeholder Roles:\n`;
  if (project.members && project.members.length > 0) {
    project.members.forEach((mem) => {
      contentText += `- ${mem.name} (${mem.role}) - ${mem.email}\n`;
    });
  } else {
    contentText += `- Project Manager: ${project.assignedPm}\n`;
  }
  contentText += `\nApproval Sign-off Signatures:\n\n\n`;
  contentText += `______________________________________          ______________________________________\n`;
  contentText += `Project Manager Signature / Date               Client Representative Signature / Date\n\n`;
  contentText += `Generated via Project Management Outlook System with Google Workspace Integration.\n`;

  // 3. Insert content into Google Doc using batchUpdate
  const insertReq = {
    requests: [
      {
        insertText: {
          location: {
            index: 1,
          },
          text: contentText,
        },
      },
    ],
  };

  const updateRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insertReq),
    }
  );

  if (!updateRes.ok) {
    const updateErr = await updateRes.json().catch(() => ({}));
    console.warn('Docs batchUpdate warning:', updateErr);
  }

  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  return {
    documentId,
    documentUrl,
    title: proposalTitle,
  };
};
