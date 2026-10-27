import React, { useState } from 'react';
import {
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  AlertOctagon,
  Archive,
  Save,
  Check,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Project, ProjectCloseout } from '../types';
import { formatCurrency } from '../services/financialService';
import { useAuth } from '../context/AuthContext';

interface ProjectCloseoutViewProps {
  project: Project;
  closeout: ProjectCloseout | null;
  onSaveCloseout: (c: ProjectCloseout) => Promise<void>;
}

export const ProjectCloseoutView: React.FC<ProjectCloseoutViewProps> = ({
  project,
  closeout,
  onSaveCloseout,
}) => {
  const { currentUser, canCloseoutProject } = useAuth();

  const [checklist, setChecklist] = useState({
    physicalCompletionVerified: closeout?.checklist.physicalCompletionVerified ?? true,
    finalCostReconciled: closeout?.checklist.finalCostReconciled ?? true,
    billingsCollectionsSettled: closeout?.checklist.billingsCollectionsSettled ?? true,
    retentionMoneyClaimed: closeout?.checklist.retentionMoneyClaimed ?? true,
    punchlistCleared: closeout?.checklist.punchlistCleared ?? true,
    asBuiltDrawingsSubmitted: closeout?.checklist.asBuiltDrawingsSubmitted ?? true,
    warrantiesGuaranteesFiled: closeout?.checklist.warrantiesGuaranteesFiled ?? true,
    finalAuditedAccountsApproved: closeout?.checklist.finalAuditedAccountsApproved ?? true,
  });

  const [isCompleted, setIsCompleted] = useState<boolean>(closeout?.isCompleted ?? false);
  const [lessonsLearnedText, setLessonsLearnedText] = useState<string>(
    closeout?.lessonsLearned.join('\n') ||
      '1. Early procurement of structural steel and rebar prevents delivery bottlenecks during rapid elevation erection.\n2. Implementing a formal 2-shift schedule recovered 14 days of adverse weather slippage.\n3. Digital billing certification through Cloud Firestore reduced invoice approval turnaround by 60%.'
  );
  const [signOffRemarks, setSignOffRemarks] = useState<string>(
    closeout?.signOffRemarks || 'All statutory certificates of occupancy, fire clearances, and client turnover protocols executed.'
  );

  const finalCost = 21800000;
  const finalProfit = project.contractAmount - finalCost;
  const finalMargin = Number(((finalProfit / (project.contractAmount || 1)) * 100).toFixed(1));

  const allItemsChecked = Object.values(checklist).every(Boolean);

  const handleToggleCheck = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const handleSave = async (closeProject: boolean) => {
    const updated: ProjectCloseout = {
      id: `closeout-${project.id}`,
      projectId: project.id,
      isCompleted: closeProject,
      closedAt: closeProject ? new Date().toISOString() : undefined,
      closedBy: closeProject ? (currentUser?.displayName || 'Ian Tumulak') : undefined,
      checklist,
      finalContractAmount: project.contractAmount,
      finalActualCost: finalCost,
      finalProfitMargin: finalProfit,
      finalProfitPercent: finalMargin,
      lessonsLearned: lessonsLearnedText.split('\n').filter(Boolean),
      signOffRemarks,
    };

    setIsCompleted(closeProject);
    await onSaveCloseout(updated);
  };

  const checklistItems = [
    { key: 'physicalCompletionVerified', label: 'Physical Completion Verified', desc: '100% of work package deliverables confirmed on site.' },
    { key: 'finalCostReconciled', label: 'Final Costs Reconciled', desc: 'Subcontractor claims and vendor POs reconciled to final actual ledger.' },
    { key: 'billingsCollectionsSettled', label: 'Billings & Collections Settled', desc: 'All progress billings invoiced and settled by the client.' },
    { key: 'retentionMoneyClaimed', label: 'Retention Guarantee Filed', desc: 'Warranty retention claim bonds substituted for cash release.' },
    { key: 'punchlistCleared', label: 'Architectural Punchlist Cleared', desc: 'Joint client-contractor punchlist walkthrough signed off without defects.' },
    { key: 'asBuiltDrawingsSubmitted', label: 'As-Built Drawings Submitted', desc: 'Final certified architectural, structural, and MEP as-builts filed.' },
    { key: 'warrantiesGuaranteesFiled', label: 'Warranties & Guarantees Filed', desc: 'Equipment manuals, roofing, and waterproofing guarantees transferred.' },
    { key: 'finalAuditedAccountsApproved', label: 'Audited Financial Accounts Signed', desc: 'Finance officer and PM final financial profit statement ratified.' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Project Closeout & Handover Audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span>
          </p>
        </div>

        {isCompleted && (
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Formal Closeout Ratified & Archived</span>
          </div>
        )}
      </div>

      {/* Final Financial Reconciliation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Final Project Profitability & Reconciliation</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 font-medium">Final Contract Value</span>
            <p className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(project.contractAmount, project.currency)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 font-medium">Final Actual Costs</span>
            <p className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(finalCost, project.currency)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 font-medium">Gross Profit Realized</span>
            <p className="text-base font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              {formatCurrency(finalProfit, project.currency)}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 font-medium">Net Profit Margin</span>
            <p className="text-base font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              {finalMargin}%
            </p>
          </div>
        </div>
      </div>

      {/* 8-Point Closeout Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">
            Mandatory Closeout Verification Checklist
          </h3>
          <p className="text-xs text-slate-500">
            Every statutory requirement must be verified prior to archiving project records
          </p>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {checklistItems.map((item) => {
            const checked = (checklist as any)[item.key];
            return (
              <div
                key={item.key}
                onClick={() => handleToggleCheck(item.key as any)}
                className="p-4 flex items-start gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    checked ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lessons Learned */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Organizational Lessons Learned & Knowledge Capture
        </h3>
        <textarea
          rows={4}
          value={lessonsLearnedText}
          onChange={(e) => setLessonsLearnedText(e.target.value)}
          className="w-full p-3.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
        />
      </div>

      {/* Sign-off & Archive Actions */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-900">Closeout Authority Sign-off</span>
          <p className="text-xs text-slate-500">
            Authorized by: <strong>{currentUser?.displayName}</strong> ({currentUser?.role})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Progress</span>
          </button>

          <button
            type="button"
            disabled={!allItemsChecked || !canCloseoutProject}
            onClick={() => handleSave(true)}
            className={`px-5 py-2 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 ${
              allItemsChecked && canCloseoutProject
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Execute Final Closeout & Archive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
