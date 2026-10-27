import React from 'react';
import {
  CalendarRange,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Project, ProjectBaseline, ProjectUpdate } from '../types';
import { calculateEVMMetrics } from '../services/financialService';

interface ScheduleViewProps {
  project: Project;
  baseline: ProjectBaseline | null;
  latestUpdate: ProjectUpdate | null;
  onNavigate: (view: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  project,
  baseline,
  latestUpdate,
  onNavigate,
}) => {
  const evm = calculateEVMMetrics(project, baseline, latestUpdate);

  const milestones = baseline?.milestones || [
    { id: 'm-1', name: 'Notice to Proceed & Mobilization', targetDate: '2026-03-15', isKeyMilestone: true, status: 'Completed', completedDate: '2026-03-14', billingTriggerPercentage: 15 },
    { id: 'm-2', name: 'Substructure & Foundation Sign-off', targetDate: '2026-05-30', isKeyMilestone: true, status: 'Completed', completedDate: '2026-06-05', billingTriggerPercentage: 20 },
    { id: 'm-3', name: 'Top-off Structural Works', targetDate: '2026-08-31', isKeyMilestone: true, status: 'Completed', completedDate: '2026-09-10', billingTriggerPercentage: 25 },
    { id: 'm-4', name: 'Substantial Completion & Enclosure', targetDate: '2026-10-31', isKeyMilestone: true, status: 'Delayed', billingTriggerPercentage: 20 },
    { id: 'm-5', name: 'Testing, Turnover & Final Acceptance', targetDate: '2026-12-31', isKeyMilestone: true, status: 'Pending', billingTriggerPercentage: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Schedule & Milestones Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span>
          </p>
        </div>

        <button
          onClick={() => onNavigate('forecasting')}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <TrendingUp className="w-4 h-4" />
          <span>View Schedule Forecast</span>
        </button>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Target Start Date</span>
          <p className="text-base font-bold text-slate-900 mt-1">{project.startDate}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Target Completion</span>
          <p className="text-base font-bold text-slate-900 mt-1">{project.targetCompletionDate}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Schedule Index (SPI)</span>
          <p className={`text-base font-bold font-mono mt-1 ${evm.schedulePerformanceIndex >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {evm.schedulePerformanceIndex.toFixed(3)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Projected Slippage</span>
          <p className={`text-base font-bold font-mono mt-1 ${evm.scheduleDelayDays > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {evm.scheduleDelayDays > 0 ? `+${evm.scheduleDelayDays} Days Delay` : 'On Schedule'}
          </p>
        </div>
      </div>

      {/* Milestones Timeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Contractual Milestones & Progress Status</h3>
          <span className="text-xs text-slate-500">Baseline v1 Schedule</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Milestone Event</th>
              <th className="py-3 px-4">Baseline Target Date</th>
              <th className="py-3 px-4">Actual Completion Date</th>
              <th className="py-3 px-4 text-center">Billing Trigger %</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {milestones.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    {m.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : m.status === 'Delayed' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>{m.name}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-slate-700">
                  {m.targetDate}
                </td>

                <td className="py-3.5 px-4 font-mono text-slate-700">
                  {m.completedDate || '—'}
                </td>

                <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-700">
                  {m.billingTriggerPercentage || 0}%
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'Delayed'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.status}
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
