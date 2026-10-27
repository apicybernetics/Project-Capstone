import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  Zap,
  Percent,
  Activity,
  Check,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Project, ProjectBaseline, ProjectUpdate, RiskItem } from '../types';
import {
  generateProgressForecastData,
  calculateEVMMetrics,
  formatCurrency,
  formatPercent,
} from '../services/financialService';

interface ForecastingViewProps {
  project: Project;
  baseline: ProjectBaseline | null;
  latestUpdate: ProjectUpdate | null;
  risks?: RiskItem[];
  onNavigate?: (view: string) => void;
}

export const ForecastingView: React.FC<ForecastingViewProps> = ({
  project,
  baseline,
  latestUpdate,
  risks = [],
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'Progress Forecast' | 'Cost Forecast' | 'Schedule Forecast' | 'Risk Forecast'
  >('Progress Forecast');
  const [scenario, setScenario] = useState<'current_trend' | 'optimistic' | 'pessimistic'>('current_trend');
  const [selectedRecoveryPlan, setSelectedRecoveryPlan] = useState<string>('plan_double_shift');

  const evm = calculateEVMMetrics(project, baseline, latestUpdate);
  const forecastData = generateProgressForecastData(project, baseline, latestUpdate, scenario);

  // Derived Cost Forecast Data in Millions
  const costForecastChartData = forecastData.map((d) => ({
    month: d.month,
    plannedCost: Math.round(d.plannedCost / 1000000),
    actualCost: d.actualCost !== undefined ? Math.round(d.actualCost / 1000000) : undefined,
    forecastCost: d.forecastCost !== undefined ? Math.round(d.forecastCost / 1000000) : undefined,
  }));

  // Work Breakdown Structure (WBS) Cost Forecast Packages
  const wbsPackages = [
    {
      name: 'Substructure & Foundation Works',
      code: 'WP-100',
      budget: project.contractAmount * 0.22,
      actualCost: project.contractAmount * 0.225,
      progress: 100,
      cpi: 0.98,
      status: 'Completed',
    },
    {
      name: 'Reinforced Concrete Superstructure',
      code: 'WP-200',
      budget: project.contractAmount * 0.35,
      actualCost: project.contractAmount * 0.38,
      progress: 88,
      cpi: 0.92,
      status: 'Delayed (+14d)',
    },
    {
      name: 'Exterior Curtain Wall & Glazing',
      code: 'WP-300',
      budget: project.contractAmount * 0.16,
      actualCost: project.contractAmount * 0.12,
      progress: 60,
      cpi: 0.89,
      status: 'At Risk (+12d)',
    },
    {
      name: 'MEPFS Building Utilities & Systems',
      code: 'WP-400',
      budget: project.contractAmount * 0.18,
      actualCost: project.contractAmount * 0.11,
      progress: 45,
      cpi: 0.94,
      status: 'On Track',
    },
    {
      name: 'Interior Architectural Finishes',
      code: 'WP-500',
      budget: project.contractAmount * 0.09,
      actualCost: project.contractAmount * 0.02,
      progress: 15,
      cpi: 1.02,
      status: 'Pending Superstructure',
    },
  ];

  // Key Milestones for Schedule Forecast
  const scheduleMilestones = [
    {
      name: 'Notice to Proceed & Mobilization',
      baselineDate: 'Jan 15, 2026',
      forecastDate: 'Jan 15, 2026',
      delayDays: 0,
      isCritical: false,
      status: 'Completed',
    },
    {
      name: 'Foundation & Basement Substructure',
      baselineDate: 'Apr 30, 2026',
      forecastDate: 'May 05, 2026',
      delayDays: 5,
      isCritical: true,
      status: 'Completed',
    },
    {
      name: 'Structural Frame Topping-Off',
      baselineDate: 'Aug 31, 2026',
      forecastDate: 'Sep 21, 2026',
      delayDays: 21,
      isCritical: true,
      status: 'Recovering (-7d)',
    },
    {
      name: 'Weather-Tight Building Enclosure',
      baselineDate: 'Oct 31, 2026',
      forecastDate: 'Nov 26, 2026',
      delayDays: 26,
      isCritical: true,
      status: 'Critical Slippage',
    },
    {
      name: 'MEPFS Energization & Elevator Commissioning',
      baselineDate: 'Dec 15, 2026',
      forecastDate: 'Jan 12, 2027',
      delayDays: 28,
      isCritical: true,
      status: 'At Risk',
    },
    {
      name: 'Final Inspection & Certificate of Occupancy',
      baselineDate: project.targetCompletionDate || 'Dec 31, 2026',
      forecastDate: evm.estimatedCompletionDate || 'Jan 31, 2027',
      delayDays: evm.scheduleDelayDays || 31,
      isCritical: true,
      status: 'Forecasted Delay',
    },
  ];

  // Default Realistic Project Risks for Tab 4
  const displayRisks = risks.length > 0 ? risks : [
    {
      id: 'risk-1',
      projectId: project.id,
      title: 'Import Supply Chain Delay for Vertical Elevator Traction Motors',
      category: 'Procurement' as const,
      probability: 4 as const,
      impact: 4 as const,
      riskScore: 16,
      exposureAmount: 4800000,
      status: 'Open' as const,
      mitigationPlan: 'Expedited airfreight authorization for critical guide rails and pre-order confirmation with manufacturer.',
      owner: 'Procurement Lead',
    },
    {
      id: 'risk-2',
      projectId: project.id,
      title: 'Structural Steel Rebar & Cement Price Inflation (8–12%)',
      category: 'Cost' as const,
      probability: 5 as const,
      impact: 3 as const,
      riskScore: 15,
      exposureAmount: 6200000,
      status: 'Mitigated' as const,
      mitigationPlan: 'Locked forward procurement contract covering 100% of remaining structural requirements.',
      owner: 'Finance Officer',
    },
    {
      id: 'risk-3',
      projectId: project.id,
      title: 'Skilled Rebar & Formwork Subcontractor Labor Shortage',
      category: 'Schedule' as const,
      probability: 3 as const,
      impact: 4 as const,
      riskScore: 12,
      exposureAmount: 3500000,
      status: 'Open' as const,
      mitigationPlan: 'Onboarded 2 standby labor supplier agreements with fixed output bonuses for critical slabs.',
      owner: 'Project Manager',
    },
    {
      id: 'risk-4',
      projectId: project.id,
      title: 'Monsoon Heavy Rainfall Interrupting External Curtain Wall Sealant',
      category: 'Environmental' as const,
      probability: 3 as const,
      impact: 3 as const,
      riskScore: 9,
      exposureAmount: 2100000,
      status: 'Open' as const,
      mitigationPlan: 'Installed weather-proof scaffolding mesh and dual-shift application during dry weather windows.',
      owner: 'Site Engineer',
    },
  ];

  const getRiskScore = (r: any): number => {
    if (typeof r.riskScore === 'number') return r.riskScore;
    const pVal = typeof r.probability === 'number' ? r.probability : r.probability === 'High' ? 4 : r.probability === 'Medium' ? 3 : 2;
    const iVal = typeof r.impact === 'number' ? r.impact : r.impact === 'High' ? 4 : r.impact === 'Medium' ? 3 : 2;
    return pVal * iVal;
  };

  const getRiskExposure = (r: any): number => {
    if (typeof r.exposureAmount === 'number') return r.exposureAmount;
    return Math.round(getRiskScore(r) * 350000);
  };

  const totalRiskExposure = displayRisks.reduce((acc, r) => acc + getRiskExposure(r), 0);
  const contingencyBudget = project.contractAmount * 0.05; // 5% Contingency
  const contingencyBurned = Math.max(0, evm.actualCost - evm.earnedValue);
  const contingencyRemaining = Math.max(0, contingencyBudget - contingencyBurned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Forecasting & Predictive Insights
            </h2>
            <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span> &nbsp;·&nbsp;
            Contract: <span className="font-semibold text-slate-900">{formatCurrency(project.contractAmount, project.currency)}</span>
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-2xs">
          <span className="px-2 text-slate-500 text-[11px] hidden sm:inline">Forecast Scenario:</span>
          <button
            type="button"
            onClick={() => setScenario('optimistic')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              scenario === 'optimistic'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Optimistic
          </button>
          <button
            type="button"
            onClick={() => setScenario('current_trend')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              scenario === 'current_trend'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Trend
          </button>
          <button
            type="button"
            onClick={() => setScenario('pessimistic')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              scenario === 'pessimistic'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pessimistic
          </button>
        </div>
      </div>

      {/* Tabs Row: Clean text tabs */}
      <div
        role="tablist"
        aria-label="Forecasting Analysis Views"
        className="flex border-b border-slate-200 gap-6 sm:gap-8 overflow-x-auto"
      >
        {[
          { id: 'Progress Forecast', label: 'Progress Forecast' },
          { id: 'Cost Forecast', label: 'Cost Forecast' },
          { id: 'Schedule Forecast', label: 'Schedule Forecast' },
          { id: 'Risk Forecast', label: 'Risk Forecast' },
        ].map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-btn-${idx + 1}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
              tabIndex={0}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer select-none focus-visible:outline-hidden focus-visible:text-blue-700 ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROGRESS FORECAST (S-CURVE) */}
      {activeTab === 'Progress Forecast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Projected Completion S-Curve Chart */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Projected Completion S-Curve</h3>
                  <p className="text-xs text-slate-500">
                    Baseline Planned S-Curve vs Incurred Actuals & Statistical Extrapolation
                  </p>
                </div>

                {/* Delay Flag Tag */}
                <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>
                    {evm.estimatedCompletionDate
                      ? `${evm.estimatedCompletionDate} (${evm.scheduleDelayDays} days delay)`
                      : 'Jan 31, 2027 (31 days delay)'}
                  </span>
                </div>
              </div>

              {/* S-Curve Chart */}
              <div className="h-80 w-full my-4">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                  <LineChart data={forecastData} margin={{ top: 15, right: 20, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(val) => `${val}%`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}%`, name]}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="plannedProgress"
                      name="Planned Progress"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualProgress"
                      name="Actual Progress"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastProgress"
                      name="Forecasted Progress"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Methodology: ANSI/EIA-748 Earned Value Management (EVM) Velocity Decay Modeling</span>
                <span className="font-mono font-bold text-slate-700">Reporting Cutoff: Sep 2026</span>
              </div>
            </div>

            {/* Right Sidebar: AI Insights */}
            <div className="lg:col-span-4 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Insights & Outlook</h3>
              </div>

              <div className="space-y-3.5">
                {/* Likely Delay */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                    <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Likely Delay</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Based on current progress velocity, project is forecasted to be completed{' '}
                    <strong>{evm.scheduleDelayDays || 31} days later</strong> than contractual baseline ({evm.estimatedCompletionDate || 'Jan 31, 2027'}).
                  </p>
                </div>

                {/* Cost Overrun Risk */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Cost Overrun Risk</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Material and labor costs are trending higher (~8%). Cost Performance Index (CPI) is{' '}
                    <strong className="font-mono text-slate-900">{evm.costPerformanceIndex.toFixed(2)}</strong>, projecting an Estimate at Completion (EAC) of{' '}
                    <strong>{formatCurrency(evm.estimateAtCompletion, project.currency)}</strong>.
                  </p>
                </div>

                {/* Recommendation */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Schedule Recovery Action</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Deploy second pouring shift on level 8–10 slabs. Pre-order elevator motors via airfreight to recover 18 days on the critical path.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
                Forecast automatically updates atomically upon every periodic progress submission.
              </div>
            </div>
          </div>

          {/* EVM Authoritative Metrics Matrix */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Authoritative Earned Value Analysis Matrix (EVM)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planned Value (PV)</span>
                <p className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {formatCurrency(evm.plannedValue, project.currency)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Earned Value (EV)</span>
                <p className="text-sm sm:text-base font-bold font-mono text-blue-700 mt-1 tabular-nums">
                  {formatCurrency(evm.earnedValue, project.currency)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actual Cost (AC)</span>
                <p className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {formatCurrency(evm.actualCost, project.currency)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Schedule Variance</span>
                <p className={`text-sm sm:text-base font-bold font-mono mt-1 tabular-nums ${evm.scheduleVariance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(evm.scheduleVariance, project.currency)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost Variance</span>
                <p className={`text-sm sm:text-base font-bold font-mono mt-1 tabular-nums ${evm.costVariance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(evm.costVariance, project.currency)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimate at Completion</span>
                <p className="text-sm sm:text-base font-bold font-mono text-amber-700 mt-1 tabular-nums">
                  {formatCurrency(evm.estimateAtCompletion, project.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COST FORECAST */}
      {activeTab === 'Cost Forecast' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Cost KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget at Completion (BAC)</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                {formatCurrency(project.contractAmount, project.currency)}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Approved Contract Baseline</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecasted EAC</span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 font-mono">
                {formatCurrency(evm.estimateAtCompletion, project.currency)}
              </p>
              <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
                {evm.costVariance < 0 ? `+${formatCurrency(Math.abs(evm.costVariance), project.currency)} Overrun` : 'Within Budget'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variance at Completion (VAC)</span>
              <p className={`text-xl sm:text-2xl font-extrabold mt-1 font-mono ${evm.varianceAtCompletion >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(evm.varianceAtCompletion, project.currency)}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {evm.varianceAtCompletion < 0 ? 'Cost Deficit Projected' : 'Cost Surplus Projected'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TCPI (To-Complete Index)</span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1 font-mono">
                {(evm.toCompletePerformanceIndex || 1.0).toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Required Cost Efficiency to finish on budget</span>
            </div>
          </div>

          {/* Cost Extrapolation Chart & Cost Scenarios */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cumulative Cost Extrapolation Curve (₱ Millions)</h3>
                  <p className="text-xs text-slate-500">
                    Planned Spend Rate vs Actual Incurred Cost & Projected Completion Expenditure
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 self-start sm:self-auto">
                  CPI: {evm.costPerformanceIndex.toFixed(2)}
                </span>
              </div>

              <div className="h-72 w-full my-3">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                  <LineChart data={costForecastChartData} margin={{ top: 15, right: 20, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(val) => `₱${val}M`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [`₱${value}M`, name]}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="plannedCost"
                      name="Planned Cumulative Cost (BAC Curve)"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualCost"
                      name="Actual Incurred Cost (AC)"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastCost"
                      name="Projected Final Cost (EAC)"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>EAC Formula: BAC / CPI (ANSI/EIA-748 Standard)</span>
                <span className="font-semibold text-slate-700">Estimate to Complete (ETC): {formatCurrency(evm.estimateToComplete, project.currency)}</span>
              </div>
            </div>

            {/* Cost Prediction Breakdown by Scenario */}
            <div className="lg:col-span-4 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Cost Scenario Comparison</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Statistical confidence ranges for project closeout cost</p>
              </div>

              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl border transition-all ${scenario === 'optimistic' ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">Optimistic (Performance Recovery)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">CPI 1.0</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {formatCurrency(evm.actualCost + (evm.budgetAtCompletion - evm.earnedValue), project.currency)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Assumes all remaining work packages perform exactly to original baseline unit rates.</p>
                </div>

                <div className={`p-3.5 rounded-xl border transition-all ${scenario === 'current_trend' ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800">Current Trend (Expected EAC)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">CPI {evm.costPerformanceIndex.toFixed(2)}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {formatCurrency(evm.estimateAtCompletion, project.currency)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Extrapolates current material inflation and subcontractor performance through handover.</p>
                </div>

                <div className={`p-3.5 rounded-xl border transition-all ${scenario === 'pessimistic' ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800">Pessimistic (Compound Delay Drag)</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">CPI × SPI</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {formatCurrency(evm.actualCost + (evm.budgetAtCompletion - evm.earnedValue) / Math.max(0.5, evm.costPerformanceIndex * evm.schedulePerformanceIndex), project.currency)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Accounts for prolonged site overheads, crane rentals, and dual-shift overtime premium.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('cost-finance')}
                className="w-full py-2 px-3 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open Financial Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Work Breakdown Structure (WBS) Cost Forecast Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Work Package Cost & Earned Value Breakdown</h4>
                <p className="text-xs text-slate-500">Forecasted variance and actual cost by key engineering trade</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Work Package</th>
                    <th className="py-3 px-4 text-right">Budget (BAC)</th>
                    <th className="py-3 px-4 text-right">Incurred (AC)</th>
                    <th className="py-3 px-4 text-center">Progress %</th>
                    <th className="py-3 px-4 text-center">CPI</th>
                    <th className="py-3 px-4 text-right">Forecasted EAC</th>
                    <th className="py-3 px-4 text-center">Trade Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wbsPackages.map((wp) => {
                    const forecastedEAC = Math.round(wp.budget / wp.cpi);
                    return (
                      <tr key={wp.code} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">{wp.name}</span>
                          <span className="block text-[11px] text-slate-400 font-mono">{wp.code}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                          {formatCurrency(wp.budget, project.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                          {formatCurrency(wp.actualCost, project.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-700">
                          {wp.progress}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${wp.cpi >= 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {wp.cpi.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(forecastedEAC, project.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${wp.status.includes('Completed') ? 'bg-emerald-100 text-emerald-800' : wp.status.includes('Delayed') ? 'bg-rose-100 text-rose-800' : wp.status.includes('At Risk') ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
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
        </div>
      )}

      {/* TAB 3: SCHEDULE FORECAST */}
      {activeTab === 'Schedule Forecast' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Schedule KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Baseline Handover Date</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                {project.targetCompletionDate || 'Dec 31, 2026'}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Approved Baseline Schedule</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecast Completion Date</span>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 font-mono">
                {evm.estimatedCompletionDate || 'Jan 31, 2027'}
              </p>
              <span className="text-[11px] text-rose-700 font-medium mt-0.5 block">
                +{evm.scheduleDelayDays || 31} Calendar Days Slippage
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Schedule Performance Index</span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 font-mono">
                {evm.schedulePerformanceIndex.toFixed(2)}
              </p>
              <span className="text-[11px] text-amber-700 mt-0.5 block">Velocity behind baseline pace</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recovery Potential</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
                -24 Days
              </p>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">Fast-tracking MEP & Finishing shifts</span>
            </div>
          </div>

          {/* Schedule Milestone Timeline & Variance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Critical Path Milestone Forecast</h3>
                  <p className="text-xs text-slate-500">Target baseline vs projected completion per major project phase</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">6 Key Phases</span>
              </div>

              <div className="divide-y divide-slate-100">
                {scheduleMilestones.map((m, idx) => (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        m.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.delayDays > 14
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900">{m.name}</p>
                          {m.isCritical && (
                            <span className="text-[9px] uppercase font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                              Critical Path
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Baseline: <span className="font-mono text-slate-700">{m.baselineDate}</span> &nbsp;→&nbsp;
                          Forecast: <span className="font-mono font-bold text-slate-900">{m.forecastDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`text-xs font-mono font-bold ${m.delayDays === 0 ? 'text-slate-400' : 'text-rose-600'}`}>
                        {m.delayDays === 0 ? 'On Time' : `+${m.delayDays}d delay`}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status.includes('Critical')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Recovery Strategies Interactive Card */}
            <div className="lg:col-span-4 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Interactive Schedule Recovery Simulator</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Select a mitigation action to model critical path recovery</p>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setSelectedRecoveryPlan('plan_double_shift')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedRecoveryPlan === 'plan_double_shift'
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Double Shift on Rebar & Pouring</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">-14 Days</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Introduce night curing and early morning stripping to accelerate formwork turnaround.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedRecoveryPlan('plan_parallel_mep')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedRecoveryPlan === 'plan_parallel_mep'
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Concurrent MEP Roughing-Ins</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">-10 Days</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Execute electrical conduits and sanitary stack installations in parallel before full slab deshoring.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedRecoveryPlan('plan_prefab_modules')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedRecoveryPlan === 'plan_prefab_modules'
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Pre-Fabricated Bathroom Pods</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">-7 Days</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Procure modular bathroom units to condense interior architectural critical path.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Combined implementation can recover up to <strong>24 days</strong>, bringing completion within baseline grace period.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RISK FORECAST */}
      {activeTab === 'Risk Forecast' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Risk KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Quantified Risk Exposure</span>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 font-mono">
                {formatCurrency(totalRiskExposure, project.currency)}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{displayRisks.length} Key Active Risks</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contingency Reserve</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                {formatCurrency(contingencyBudget, project.currency)}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">5% of Approved Contract Budget</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remaining Buffer</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
                {formatCurrency(contingencyRemaining, project.currency)}
              </p>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                {formatPercent((contingencyRemaining / contingencyBudget) * 100)} buffer intact
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monte Carlo P80 Target</span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1 font-mono">
                Jan 2027
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">80% Realistic Probability of Handover</span>
            </div>
          </div>

          {/* Risk Table & Quantitative Exposure */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Quantified Project Risk Matrix & Exposure</h4>
                <p className="text-xs text-slate-500">Ranked by risk score (Probability × Impact) and forecasted financial impact</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('risks-issues')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>Full Risk & Issue Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Risk Item & Threat Description</th>
                    <th className="py-3 px-4 text-center">Category</th>
                    <th className="py-3 px-4 text-center">P × I</th>
                    <th className="py-3 px-4 text-center">Risk Score</th>
                    <th className="py-3 px-4 text-right">Financial Exposure</th>
                    <th className="py-3 px-4">Mitigation Strategy</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayRisks.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                        <p className="truncate">{r.title}</p>
                        <span className="text-[10px] text-slate-400 font-mono">Owner: {r.owner}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600">
                        {String(r.probability)} × {String(r.impact)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {(() => {
                          const score = getRiskScore(r);
                          return (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                              score >= 15
                                ? 'bg-rose-100 text-rose-800'
                                : score >= 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {score}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(getRiskExposure(r), project.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate text-[11px]">
                        {r.mitigationPlan}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'Mitigated' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
