import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { Project, ProjectBaseline, ProjectUpdate } from '../types';
import { exportPortfolioSummaryReport, exportProjectDetailReport, printReportView } from '../services/reportService';
import { calculateEVMMetrics, formatCurrency } from '../services/financialService';

interface ReportsViewProps {
  projects: Project[];
  selectedProject: Project | null;
  baseline: ProjectBaseline | null;
  latestUpdate: ProjectUpdate | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  selectedProject,
  baseline,
  latestUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'Standard Reports' | 'Custom Reports'>('Standard Reports');
  const [activeReportModal, setActiveReportModal] = useState<string | null>(null);

  const targetProject = selectedProject || projects[0];
  const evm = targetProject ? calculateEVMMetrics(targetProject, baseline, latestUpdate) : null;

  // Report cards matching Screenshot 8
  const standardReports = [
    {
      id: 'summary',
      title: 'Project Summary Report',
      description: 'Overall project status, executive milestones, and key indicators.',
      icon: FileText,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'progress',
      title: 'Progress Report',
      description: 'Planned vs actual physical progress across work packages.',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'cost',
      title: 'Cost Report',
      description: 'Budget vs actual cost, committed obligations, and variance audit.',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'billing',
      title: 'Billing & Collection Report',
      description: 'Billing submission status, approved invoices, and collections received.',
      icon: Receipt,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'risk',
      title: 'Risk & Issue Report',
      description: 'Open risks, severity matrix, issues, and corrective action items.',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'closeout',
      title: 'Project Closeout Report',
      description: 'Final project documentation, audited accounts, and turnover archive.',
      icon: CheckCircle2,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const handleExportCSV = () => {
    if (targetProject) {
      exportProjectDetailReport(targetProject, baseline, latestUpdate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching Screenshot 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate, preview, and download formal project reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const metricsMap: any = {};
              projects.forEach((p) => {
                metricsMap[p.id] = calculateEVMMetrics(p);
              });
              exportPortfolioSummaryReport(projects, metricsMap);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Portfolio CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs Row matching Screenshot 8: Standard Reports, Custom Reports */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('Standard Reports')}
          className={`py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'Standard Reports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Standard Reports
        </button>
        <button
          onClick={() => setActiveTab('Custom Reports')}
          className={`py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'Custom Reports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Custom Reports
        </button>
      </div>

      {/* Grid of 6 Report Cards matching Screenshot 8 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {standardReports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{report.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {report.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {targetProject.code}
                </span>
                <button
                  onClick={() => setActiveReportModal(report.id)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                  Generate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Preview & Export Modal */}
      {activeReportModal && targetProject && evm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {standardReports.find((r) => r.id === activeReportModal)?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {targetProject.name} ({targetProject.code}) · Client: {targetProject.client}
                </p>
              </div>
              <button
                onClick={() => setActiveReportModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500">Reporting Month</span>
                  <p className="font-bold text-slate-900">{latestUpdate?.reportingPeriod || 'Sep 2026'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Contract Value</span>
                  <p className="font-bold font-mono text-slate-900">{formatCurrency(targetProject.contractAmount, targetProject.currency)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Actual Progress</span>
                  <p className="font-bold font-mono text-blue-700">{latestUpdate?.actualPhysicalProgress || 58.5}%</p>
                </div>
                <div>
                  <span className="text-slate-500">Cost Incurred</span>
                  <p className="font-bold font-mono text-slate-900">{formatCurrency(evm.actualCost, targetProject.currency)}</p>
                </div>
              </div>

              {/* Table preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">EVM Metric</th>
                      <th className="py-2.5 px-3 text-right">Value (₱)</th>
                      <th className="py-2.5 px-3 text-center">Status / Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Budget at Completion (BAC)</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatCurrency(evm.budgetAtCompletion, targetProject.currency)}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">Approved Baseline</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Earned Value (EV)</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-blue-700">{formatCurrency(evm.earnedValue, targetProject.currency)}</td>
                      <td className="py-2.5 px-3 text-center font-semibold">SV: {formatCurrency(evm.scheduleVariance, targetProject.currency)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Actual Cost (AC)</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatCurrency(evm.actualCost, targetProject.currency)}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-rose-600">CV: {formatCurrency(evm.costVariance, targetProject.currency)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Invoiced vs Collections</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatCurrency(evm.cashCollectionsReceived, targetProject.currency)}</td>
                      <td className="py-2.5 px-3 text-center text-amber-600 font-bold">AR: {formatCurrency(evm.outstandingReceivables, targetProject.currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer with Export & Print */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                Authoritative certified record for Board and Client presentation
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={printReportView}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
