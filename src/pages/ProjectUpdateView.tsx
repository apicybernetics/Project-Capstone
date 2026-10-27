import React, { useState } from 'react';
import {
  Calendar,
  Save,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Project, ProjectBaseline, ProjectUpdate, HealthStatus, WorkPackageUpdate } from '../types';
import { formatCurrency } from '../services/financialService';
import { useAuth } from '../context/AuthContext';

interface ProjectUpdateViewProps {
  project: Project;
  baseline: ProjectBaseline | null;
  existingUpdates: ProjectUpdate[];
  onSaveUpdate: (update: ProjectUpdate) => Promise<void>;
  onTriggerProcessing: () => void;
}

export const ProjectUpdateView: React.FC<ProjectUpdateViewProps> = ({
  project,
  baseline,
  existingUpdates,
  onSaveUpdate,
  onTriggerProcessing,
}) => {
  const { currentUser, canSubmitUpdate } = useAuth();
  const [activeTab, setActiveTab] = useState<'Progress' | 'Cost' | 'Billing' | 'Issues / Risks' | 'Remarks'>('Progress');
  const [reportingMonth, setReportingMonth] = useState<string>('Sep 2026');

  // Work package progress state initialized matching Screenshot 4
  const [wpUpdates, setWpUpdates] = useState<WorkPackageUpdate[]>([
    {
      workPackageId: 'wp-1',
      plannedPercent: 100,
      actualPercent: 100,
      actualCostIncurred: 2200000,
      status: 'On Track',
      notes: 'Mobilization & temporary facilities 100% delivered.',
    },
    {
      workPackageId: 'wp-2',
      plannedPercent: 80,
      actualPercent: 70,
      actualCostIncurred: 3900000,
      status: 'Slight Delay',
      notes: 'Site earthworks 70% complete; drainage permits pending.',
    },
    {
      workPackageId: 'wp-3',
      plannedPercent: 40,
      actualPercent: 30,
      actualCostIncurred: 7100000,
      status: 'Behind',
      notes: 'Structure behind due to concrete pour scheduling.',
    },
    {
      workPackageId: 'wp-4',
      plannedPercent: 10,
      actualPercent: 5,
      actualCostIncurred: 300000,
      status: 'Behind',
      notes: 'External access road grading initiated.',
    },
    {
      workPackageId: 'wp-5',
      plannedPercent: 0,
      actualPercent: 0,
      actualCostIncurred: 0,
      status: 'On Track',
      notes: 'Commissioning scheduled for Q4.',
    },
  ]);

  // Financial fields
  const [actualCost, setActualCost] = useState<number>(16500000);
  const [committedCost, setCommittedCost] = useState<number>(2800000);
  const [billingSubmitted, setBillingSubmitted] = useState<number>(15000000);
  const [billingApproved, setBillingApproved] = useState<number>(14200000);
  const [invoicesIssued, setInvoicesIssued] = useState<number>(14200000);
  const [cashCollected, setCashCollected] = useState<number>(12500000);

  // Remarks & risks
  const [keyRisks, setKeyRisks] = useState<string>(
    'Curfew on heavy concrete truck transit along Santa Rosa highway during rush hours; Cement price volatility.'
  );
  const [correctiveActions, setCorrectiveActions] = useState<string>(
    'Added second night shift for structural slab pouring; expedited rebar delivery from local rolling mill.'
  );
  const [remarks, setRemarks] = useState<string>(
    'Project completion date estimated to extend by 31 days unless second shift structural cycle is sustained.'
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Compute status automatically based on progress delta
  const computeStatus = (planned: number, actual: number): HealthStatus => {
    const delta = actual - planned;
    if (delta >= -2) return 'On Track';
    if (delta >= -10) return 'Slight Delay';
    return 'Behind';
  };

  const handleUpdateWPActual = (index: number, newActual: number) => {
    const updated = [...wpUpdates];
    const planned = updated[index].plannedPercent;
    const clamped = Math.min(100, Math.max(0, newActual));
    updated[index].actualPercent = clamped;
    updated[index].status = computeStatus(planned, clamped);
    setWpUpdates(updated);
  };

  // Weighted actual physical progress calculation
  const totalPhysicalProgress = Number(
    (
      wpUpdates.reduce((acc, wp, idx) => {
        const weight = baseline?.workPackages[idx]?.plannedWeight || 20;
        return acc + (wp.actualPercent * (weight / 100));
      }, 0)
    ).toFixed(1)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Step 5 Validation Checks
    if (!reportingMonth.trim()) {
      setValidationError('Reporting month is required.');
      return;
    }
    if (wpUpdates.some((wp) => wp.actualPercent < 0 || wp.actualPercent > 100)) {
      setValidationError('All physical progress percentages must be between 0% and 100%.');
      return;
    }
    if (cashCollected > invoicesIssued) {
      setValidationError('Cash collections cannot exceed invoices issued unless advance payment is documented.');
      return;
    }

    setIsSubmitting(true);

    const updateRecord: ProjectUpdate = {
      id: `upd-${project.id}-${reportingMonth.toLowerCase().replace(/\s+/g, '')}`,
      projectId: project.id,
      reportingPeriod: reportingMonth,
      submissionDate: new Date().toISOString(),
      submittedBy: currentUser?.displayName || 'Ian Tumulak',
      status: 'Approved',
      approvedBy: currentUser?.displayName || 'Ian Tumulak',
      approvedAt: new Date().toISOString(),
      workPackageUpdates: wpUpdates,
      actualPhysicalProgress: totalPhysicalProgress,
      actualCostsIncurred: actualCost,
      committedCosts: committedCost,
      billingSubmitted,
      billingApproved,
      invoicesIssued,
      cashCollectionsReceived: cashCollected,
      outstandingReceivables: Math.max(0, invoicesIssued - cashCollected),
      scheduleStatus: totalPhysicalProgress < 60 ? 'Behind' : 'On Track',
      completedMilestones: ['m-1', 'm-2', 'm-3'],
      delayedMilestones: ['m-4'],
      keyRisks: keyRisks.split(';').map((s) => s.trim()).filter(Boolean),
      correctiveActions: correctiveActions.split(';').map((s) => s.trim()).filter(Boolean),
      remarks,
      version: (existingUpdates.length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSaveUpdate(updateRecord);
    setIsSubmitting(false);
    onTriggerProcessing(); // Trigger Screenshot 5 Processing Screen!
  };

  const workPackageNames = [
    'General Requirements',
    'Site Development',
    'Building Works',
    'External Works',
    'Testing & Commissioning',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header matching Screenshot 4 */}
      <div className="p-6 sm:p-7 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Update Project Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span>
          </p>
        </div>

        {/* Reporting Month Picker matching Screenshot 4 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Reporting Month
          </label>
          <div className="relative">
            <input
              type="text"
              value={reportingMonth}
              onChange={(e) => setReportingMonth(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs Row matching Screenshot 4: Progress, Cost, Billing, Issues / Risks, Remarks */}
      <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50/30 overflow-x-auto">
        {(['Progress', 'Cost', 'Billing', 'Issues / Risks', 'Remarks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="p-6 sm:p-8">
        {validationError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Tab 1: Progress (Matching Screenshot 4 exactly) */}
        {activeTab === 'Progress' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Work Package Progress</h3>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span>Weighted Progress: <strong className="text-blue-700 font-mono text-sm">{totalPhysicalProgress}%</strong></span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-1/4">Work Package</th>
                    <th className="py-3 px-4 w-1/3">Progress Bar</th>
                    <th className="py-3 px-4 text-center">Planned %</th>
                    <th className="py-3 px-4 text-center">Actual %</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wpUpdates.map((wp, idx) => {
                    const wpName = baseline?.workPackages[idx]?.name || workPackageNames[idx];
                    return (
                      <tr key={wp.workPackageId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {wpName}
                        </td>

                        {/* Dual Progress Visualizer Bar */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex relative">
                              {/* Planned marker / background */}
                              <div
                                style={{ width: `${wp.plannedPercent}%` }}
                                className="h-full bg-slate-300 opacity-60 absolute top-0 left-0"
                                title={`Planned: ${wp.plannedPercent}%`}
                              />
                              {/* Actual progress */}
                              <div
                                style={{ width: `${wp.actualPercent}%` }}
                                className={`h-full relative z-10 transition-all ${
                                  wp.status === 'On Track'
                                    ? 'bg-blue-600'
                                    : wp.status === 'Slight Delay'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                title={`Actual: ${wp.actualPercent}%`}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>Act: {wp.actualPercent}%</span>
                              <span>Plan: {wp.plannedPercent}%</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600 tabular-nums">
                          {wp.plannedPercent}%
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={wp.actualPercent}
                            onChange={(e) => handleUpdateWPActual(idx, Number(e.target.value))}
                            className="w-16 px-2 py-1 text-center font-mono font-bold border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              wp.status === 'On Track'
                                ? 'bg-emerald-100 text-emerald-800'
                                : wp.status === 'Slight Delay'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {wp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Cost */}
        {activeTab === 'Cost' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Actual Costs Incurred to Date (AC)
              </label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <p className="text-xs text-slate-500 font-mono">
                {formatCurrency(actualCost, 'PHP')}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Committed POs / Subcontracts
              </label>
              <input
                type="number"
                value={committedCost}
                onChange={(e) => setCommittedCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <p className="text-xs text-slate-500 font-mono">
                {formatCurrency(committedCost, 'PHP')}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Billing & Collections */}
        {activeTab === 'Billing' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Billing Submitted</label>
              <input
                type="number"
                value={billingSubmitted}
                onChange={(e) => setBillingSubmitted(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 font-mono">{formatCurrency(billingSubmitted, 'PHP')}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Billing Approved by Client</label>
              <input
                type="number"
                value={billingApproved}
                onChange={(e) => setBillingApproved(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 font-mono">{formatCurrency(billingApproved, 'PHP')}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Invoices Issued</label>
              <input
                type="number"
                value={invoicesIssued}
                onChange={(e) => setInvoicesIssued(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 font-mono">{formatCurrency(invoicesIssued, 'PHP')}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Cash Collections Received</label>
              <input
                type="number"
                value={cashCollected}
                onChange={(e) => setCashCollected(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 font-mono">{formatCurrency(cashCollected, 'PHP')}</p>
            </div>

            <div className="col-span-1 sm:col-span-2 p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Outstanding Accounts Receivable:</span>
              <span className="font-mono text-sm text-blue-700 font-bold">
                {formatCurrency(Math.max(0, invoicesIssued - cashCollected), 'PHP')}
              </span>
            </div>
          </div>
        )}

        {/* Tab 4: Issues / Risks */}
        {activeTab === 'Issues / Risks' && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Key Site Risks (Separate items with semicolons)
              </label>
              <textarea
                rows={3}
                value={keyRisks}
                onChange={(e) => setKeyRisks(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Corrective Actions & Mitigation Controls
              </label>
              <textarea
                rows={3}
                value={correctiveActions}
                onChange={(e) => setCorrectiveActions(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Remarks */}
        {activeTab === 'Remarks' && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Monthly Executive Summary & Site Remarks
              </label>
              <textarea
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Action Button Footer */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Submission author: <strong>{currentUser?.displayName || 'Ian Tumulak'}</strong> ({currentUser?.role})
          </span>

          <button
            type="button"
            disabled={isSubmitting || !canSubmitUpdate}
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Submit Update & Process Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
