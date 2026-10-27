import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Project, ProjectBaseline, ProjectUpdate } from '../types';
import { calculateEVMMetrics, formatCurrency } from '../services/financialService';

interface CostFinanceViewProps {
  project: Project;
  baseline: ProjectBaseline | null;
  latestUpdate: ProjectUpdate | null;
}

export const CostFinanceView: React.FC<CostFinanceViewProps> = ({
  project,
  baseline,
  latestUpdate,
}) => {
  const evm = calculateEVMMetrics(project, baseline, latestUpdate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cost & Financial Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span>
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Budget at Completion (BAC)</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(evm.budgetAtCompletion, project.currency)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Approved baseline budget</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Actual Cost Incurred (AC)</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(evm.actualCost, project.currency)}
          </p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
            {((evm.actualCost / (evm.budgetAtCompletion || 1)) * 100).toFixed(1)}% of total budget
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Cost Performance Index (CPI)</span>
          <p className={`text-xl font-bold font-mono mt-1 tabular-nums ${evm.costPerformanceIndex >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {evm.costPerformanceIndex.toFixed(3)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {evm.costPerformanceIndex >= 1 ? 'Under approved budget' : 'Cost overrun condition'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Forecast Final Cost (EAC)</span>
          <p className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {formatCurrency(evm.estimateAtCompletion, project.currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Variance: {formatCurrency(evm.varianceAtCompletion, project.currency)}
          </span>
        </div>
      </div>

      {/* Detailed EVM Cost Performance Ledger */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Authoritative Cost Variance & EAC Formula Ledger
        </h3>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cost Indicator</th>
                <th className="py-3 px-4">Formula / Methodology</th>
                <th className="py-3 px-4 text-right">Calculated Value</th>
                <th className="py-3 px-4">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Planned Value (PV)</td>
                <td className="py-3 px-4 font-mono text-slate-500">Planned% × BAC</td>
                <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(evm.plannedValue, project.currency)}</td>
                <td className="py-3 px-4 text-slate-600">Budgeted cost of work scheduled</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Earned Value (EV)</td>
                <td className="py-3 px-4 font-mono text-slate-500">Actual Physical% × BAC</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">{formatCurrency(evm.earnedValue, project.currency)}</td>
                <td className="py-3 px-4 text-slate-600">Budgeted cost of work actually performed</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Cost Variance (CV)</td>
                <td className="py-3 px-4 font-mono text-slate-500">EV - AC</td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${evm.costVariance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(evm.costVariance, project.currency)}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {evm.costVariance >= 0 ? 'Savings below budget' : `Overrun of ${Math.abs(evm.costVariancePercent)}%`}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Estimate to Complete (ETC)</td>
                <td className="py-3 px-4 font-mono text-slate-500">EAC - AC</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{formatCurrency(evm.estimateToComplete, project.currency)}</td>
                <td className="py-3 px-4 text-slate-600">Additional funding required to reach turnover</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Variance at Completion (VAC)</td>
                <td className="py-3 px-4 font-mono text-slate-500">BAC - EAC</td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${evm.varianceAtCompletion >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(evm.varianceAtCompletion, project.currency)}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {evm.varianceAtCompletion >= 0 ? 'Projected overall underrun' : 'Projected final budget deficit'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
