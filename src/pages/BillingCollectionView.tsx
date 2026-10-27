import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Project, ProjectBaseline, ProjectUpdate } from '../types';
import { calculateEVMMetrics, formatCurrency } from '../services/financialService';

interface BillingCollectionViewProps {
  project: Project;
  baseline: ProjectBaseline | null;
  latestUpdate: ProjectUpdate | null;
}

export const BillingCollectionView: React.FC<BillingCollectionViewProps> = ({
  project,
  baseline,
  latestUpdate,
}) => {
  const evm = calculateEVMMetrics(project, baseline, latestUpdate);

  // Billing milestones from baseline or defaults
  const milestones = baseline?.billingMilestones || [
    { id: 'bm-1', name: 'Mobilization Advance (15%)', percentage: 15, expectedAmount: project.contractAmount * 0.15, expectedMonth: 'Mar 2026' },
    { id: 'bm-2', name: 'Substructure Progress #1 (20%)', percentage: 20, expectedAmount: project.contractAmount * 0.20, expectedMonth: 'May 2026' },
    { id: 'bm-3', name: 'Superstructure Progress #2 (25%)', percentage: 25, expectedAmount: project.contractAmount * 0.25, expectedMonth: 'Aug 2026' },
    { id: 'bm-4', name: 'Finishes & MEP Progress #3 (25%)', percentage: 25, expectedAmount: project.contractAmount * 0.25, expectedMonth: 'Oct 2026' },
    { id: 'bm-5', name: 'Final Handover & Retention (15%)', percentage: 15, expectedAmount: project.contractAmount * 0.15, expectedMonth: 'Dec 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Billing & Collections Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span>
          </p>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Billing Submitted</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(evm.billingSubmitted, project.currency)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Approved: {formatCurrency(evm.billingApproved, project.currency)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Invoices Issued</span>
          <p className="text-xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
            {formatCurrency(evm.invoicesIssued, project.currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Cumulative billing to client</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Cash Collections</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(evm.cashCollectionsReceived, project.currency)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Collection Efficiency: {evm.collectionRate}%
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Outstanding Receivables</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
            {formatCurrency(evm.outstandingReceivables, project.currency)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Current due from {project.client}
          </span>
        </div>
      </div>

      {/* AR Aging Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Accounts Receivable (AR) Aging Analysis
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">Current (0 - 30 Days)</span>
            <p className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(evm.outstandingReceivables * 0.7, project.currency)}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">Normal Terms</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">31 - 60 Days</span>
            <p className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(evm.outstandingReceivables * 0.25, project.currency)}
            </p>
            <span className="text-[10px] text-amber-600 font-bold">Follow-up Dispatched</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">61 - 90 Days</span>
            <p className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatCurrency(evm.outstandingReceivables * 0.05, project.currency)}
            </p>
            <span className="text-[10px] text-orange-600 font-bold">Overdue Notice</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">&gt; 90 Days (Delinquent)</span>
            <p className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
              ₱ 0
            </p>
            <span className="text-[10px] text-slate-400 font-bold">None</span>
          </div>
        </div>
      </div>

      {/* Contract Billing Milestones Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Contract Billing Schedule & Milestones</h3>
            <p className="text-xs text-slate-500">Scheduled progress payments against approved contractual triggers</p>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Milestone</th>
              <th className="py-3 px-4 text-center">Share %</th>
              <th className="py-3 px-4 text-right">Expected Amount</th>
              <th className="py-3 px-4">Scheduled Month</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {milestones.map((m, idx) => (
              <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900">{m.name}</td>
                <td className="py-3.5 px-4 text-center font-mono font-medium">{m.percentage}%</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                  {formatCurrency(m.expectedAmount, project.currency)}
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">{m.expectedMonth}</td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      idx < 3
                        ? 'bg-emerald-100 text-emerald-800'
                        : idx === 3
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {idx < 3 ? 'Collected' : idx === 3 ? 'Invoiced / In Progress' : 'Pending Milestone'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
