import React from 'react';
import {
  FolderKanban,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Receipt,
  DollarSign,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Project, EVMMetrics } from '../types';
import { formatCurrency } from '../services/financialService';

interface DashboardViewProps {
  projects: Project[];
  metricsMap: Record<string, EVMMetrics>;
  onSelectProject: (p: Project) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  metricsMap,
  onSelectProject,
  onNavigate,
}) => {
  // Aggregate Counts matching Screenshot 6: Total 5, On Track 2, At Risk 2, Delayed 1
  const totalProjects = projects.length;
  const onTrackCount = projects.filter((p) => p.currentHealth === 'On Track').length;
  const atRiskCount = projects.filter((p) => p.currentHealth === 'Slight Delay').length;
  const delayedCount = projects.filter(
    (p) => p.currentHealth === 'Behind' || p.currentHealth === 'Critical'
  ).length;

  // Donut chart data matching Screenshot 6
  const statusPieData = [
    { name: 'On Track', value: onTrackCount, color: '#16a34a' },
    { name: 'Slight Delay', value: atRiskCount, color: '#f59e0b' },
    { name: 'Behind', value: delayedCount, color: '#ef4444' },
  ];

  // Bar chart data matching Screenshot 6: Planned Cost vs Actual Cost Proj 1 to Proj 5
  const costBarData = projects.slice(0, 5).map((p, idx) => {
    const m = metricsMap[p.id];
    const planned = m?.plannedValue || p.contractAmount * 0.7;
    const actual = m?.actualCost || p.contractAmount * 0.75;
    return {
      name: `Proj ${idx + 1} (${p.code})`,
      plannedCost: Math.round(planned / 1000000), // in Millions
      actualCost: Math.round(actual / 1000000),
    };
  });

  // Portfolio aggregates
  const totalContract = projects.reduce((acc, p) => acc + p.contractAmount, 0);
  const totalActualCost = Object.values(metricsMap).reduce((acc, m) => acc + m.actualCost, 0);
  const totalInvoiced = Object.values(metricsMap).reduce((acc, m) => acc + m.invoicesIssued, 0);
  const totalCollections = Object.values(metricsMap).reduce((acc, m) => acc + m.cashCollectionsReceived, 0);
  const totalAR = Object.values(metricsMap).reduce((acc, m) => acc + m.outstandingReceivables, 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Project Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Consolidated view of all active capital projects and financial health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('projects-new')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Stat Cards matching Screenshot 6 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Projects */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Total Projects
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 font-mono tabular-nums">
              {totalProjects}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* On Track */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              On Track
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 mt-0.5 sm:mt-1 font-mono tabular-nums">
              {onTrackCount}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              At Risk
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-500 mt-0.5 sm:mt-1 font-mono tabular-nums">
              {atRiskCount}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Delayed */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Delayed
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-rose-600 mt-0.5 sm:mt-1 font-mono tabular-nums">
              {delayedCount}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Row matching Screenshot 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Status Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Project Status</h3>
            <p className="text-xs text-slate-500">Distribution across operational health ratings</p>
          </div>

          <div className="h-64 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Projects`, name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {totalProjects}
              </span>
              <span className="text-xs text-slate-500 font-medium">Projects</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center justify-around gap-2 text-[11px] sm:text-xs font-medium text-slate-700 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>On Track {Math.round((onTrackCount / (totalProjects || 1)) * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Slight Delay {Math.round((atRiskCount / (totalProjects || 1)) * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Behind {Math.round((delayedCount / (totalProjects || 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Cost Performance Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cost Performance</h3>
              <p className="text-xs text-slate-500">Planned Budget vs Actual Cost incurred (₱ Millions)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-3 h-3 bg-slate-300 rounded-xs inline-block" /> Planned Cost
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-3 h-3 bg-blue-600 rounded-xs inline-block" /> Actual Cost
              </span>
            </div>
          </div>

          <div className="h-60 sm:h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBarData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis
                  tickFormatter={(val) => `₱${val}M`}
                  tick={{ fontSize: 10 }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`₱${val}M`, name === 'plannedCost' ? 'Planned Cost' : 'Actual Cost']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="plannedCost" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Planned Cost" />
                <Bar dataKey="actualCost" fill="#2563eb" radius={[4, 4, 0, 0]} name="Actual Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>Authoritative ANSI/EIA-748 EVM standard comparison</span>
            <button
              onClick={() => onNavigate('cost-finance')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Cost Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Financial Summary Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 sm:mb-4">Portfolio Financial Governance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Contract Value
            </span>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mt-1 font-mono tabular-nums break-words">
              {formatCurrency(totalContract, 'PHP')}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Actual Cost Incurred
            </span>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mt-1 font-mono tabular-nums break-words">
              {formatCurrency(totalActualCost, 'PHP')}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Invoices Issued
            </span>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-600 mt-1 font-mono tabular-nums break-words">
              {formatCurrency(totalInvoiced, 'PHP')}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Cash Collected
            </span>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-emerald-600 mt-1 font-mono tabular-nums break-words">
              {formatCurrency(totalCollections, 'PHP')}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl col-span-1 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-amber-600 mt-1 font-mono tabular-nums break-words">
              {formatCurrency(totalAR, 'PHP')}
            </p>
          </div>
        </div>
      </div>

      {/* Projects Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Capital Projects</h3>
            <p className="text-xs text-slate-500">Click a project to manage baseline, encode updates, or view forecast</p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Client & Location</th>
                <th className="py-3 px-4 text-right">Contract Value</th>
                <th className="py-3 px-4 text-center">CPI / SPI</th>
                <th className="py-3 px-4">Progress Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p, idx) => {
                const m = metricsMap[p.id];
                return (
                  <tr key={`${p.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || '/src/assets/images/building_riverside_residence_1792219353957.jpg'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{p.code} · {p.type}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 font-medium">{p.client}</p>
                      <p className="text-[11px] text-slate-500">{p.location}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(p.contractAmount, p.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                      <div className="inline-flex items-center gap-2">
                        <span title="Cost Performance Index" className={m?.costPerformanceIndex >= 1 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          CPI: {m ? m.costPerformanceIndex.toFixed(2) : '1.00'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span title="Schedule Performance Index" className={m?.schedulePerformanceIndex >= 1 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          SPI: {m ? m.schedulePerformanceIndex.toFixed(2) : '1.00'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.currentHealth === 'On Track'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.currentHealth === 'Slight Delay'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.currentHealth}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            onSelectProject(p);
                            onNavigate('projects');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            onSelectProject(p);
                            onNavigate('forecasting');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          Forecast
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
