import React from 'react';
import { X, ArrowRight, CheckCircle2, ShieldCheck, Database, BarChart3, AlertOctagon, TrendingUp, RefreshCw } from 'lucide-react';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep?: (stepId: string) => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose, onJumpToStep }) => {
  if (!isOpen) return null;

  const steps = [
    {
      id: 'step-1',
      title: '1. User Login / Authentication',
      desc: 'Secure email/pass & OAuth login with multi-role authorization (Admin, PM, Engineer, Finance, Billing, Viewer).',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionView: 'dashboard',
    },
    {
      id: 'step-2',
      title: '2. Setup the Project',
      desc: 'Encode project master record: Code, Name, Client, Location, Contract Value, Duration, and Team assignments.',
      icon: Database,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionView: 'projects',
    },
    {
      id: 'step-3',
      title: '3. Input Project Baseline',
      desc: 'Scope work packages, contract budget, schedule milestones, and billing schedule. Mandatory completeness validation before approval.',
      icon: CheckCircle2,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      actionView: 'projects',
    },
    {
      id: 'step-4',
      title: '4. Input Periodic Project Updates',
      desc: 'Periodic monthly reports: actual physical progress per work package, actual costs, billing submitted/approved, cash collections, milestones.',
      icon: RefreshCw,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionView: 'projects',
    },
    {
      id: 'step-5',
      title: '5. Data Validation & Processing',
      desc: 'Field verification, percentage bounds (0-100%), non-destructive audit trail, and atomic data consolidation.',
      icon: AlertOctagon,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      actionView: 'processing',
    },
    {
      id: 'step-6',
      title: '6. Data Processing & Performance Analysis',
      desc: 'EVM calculations: EV, PV, AC, BAC, SV, CV, SPI, CPI, and RAG health status diagnostics.',
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionView: 'cost-finance',
    },
    {
      id: 'step-7',
      title: '7. Forecasting & AI Insights',
      desc: 'Progress S-Curve forecasts, completion date prediction, cost overrun risk analysis, and actionable mitigation guidance.',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionView: 'forecasting',
    },
    {
      id: 'step-8',
      title: '8. Dashboard, Reports & Decision Support',
      desc: 'Multi-project executive overview, project-level dashboards, PDF/Excel reports, and receivables aging.',
      icon: BarChart3,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      actionView: 'reports',
    },
    {
      id: 'step-9',
      title: '9. Project Closeout & Archive',
      desc: 'Rigorous 10-point closeout checklist: physical completion, final cost reconciliation, billing settlement, warranties, and audit sign-off.',
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      actionView: 'closeout',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Enterprise Project Management System Workflow
            </h3>
            <p className="text-xs text-slate-500">
              End-to-end lifecycle based on the approved engineering specification diagram
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border ${step.color} flex flex-col justify-between hover:shadow-md transition-shadow relative`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Phase {idx + 1}</span>
                      <Icon className="w-4 h-4 opacity-80" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>

                  {onJumpToStep && (
                    <button
                      onClick={() => {
                        onJumpToStep(step.actionView);
                        onClose();
                      }}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                    >
                      <span>Open Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Lifecycle Decision Logic:</p>
              <p className="mt-0.5 text-blue-800">
                At the conclusion of review and reporting, authorized users choose between initiating the next periodic update cycle or executing the audited Project Closeout procedure.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Close Workflow
          </button>
        </div>
      </div>
    </div>
  );
};
