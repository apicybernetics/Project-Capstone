/**
 * Earned Value Management (EVM), Financial Metrics, and Forecasting Engine
 * Rigorous zero-division protection, safe precision, and scenario forecasting
 */

import { Project, ProjectBaseline, ProjectUpdate, EVMMetrics, HealthStatus } from '../types';

export const formatCurrency = (amount: number, currency: string = 'PHP'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '—';
  const symbol = currency === 'PHP' || currency === 'P' ? '₱ ' : '$ ';
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatPercent = (val: number, decimals: number = 1): string => {
  if (isNaN(val) || val === null || val === undefined) return '0%';
  return `${val.toFixed(decimals)}%`;
};

/**
 * Authoritative EVM & Health Calculator
 */
export const calculateEVMMetrics = (
  project: Project,
  baseline?: ProjectBaseline | null,
  latestUpdate?: ProjectUpdate | null
): EVMMetrics => {
  const BAC = baseline?.approvedBudget || project.contractAmount || 0;
  
  // Actual physical progress (0 to 100)
  const actualPercent = latestUpdate?.actualPhysicalProgress ?? 0;
  
  // Planned progress from baseline schedule up to latest update reporting period
  let plannedPercent = 0;
  if (baseline && latestUpdate) {
    const periodEntry = baseline.monthlyCostPlan.find(
      (p) => p.month === latestUpdate.reportingPeriod
    );
    if (periodEntry) {
      plannedPercent = periodEntry.plannedProgress;
    } else {
      // Linear interpolation based on project duration if not in period table
      const start = new Date(project.startDate).getTime();
      const end = new Date(project.targetCompletionDate).getTime();
      const current = new Date(latestUpdate.submissionDate || Date.now()).getTime();
      const totalSpan = Math.max(1, end - start);
      const elapsedSpan = Math.max(0, current - start);
      plannedPercent = Math.min(100, Math.max(0, (elapsedSpan / totalSpan) * 100));
    }
  } else if (baseline) {
    plannedPercent = 50; // default initial midpoint if baseline exists without update
  }

  // Earned Value (EV) & Planned Value (PV)
  const EV = (actualPercent / 100) * BAC;
  const PV = (plannedPercent / 100) * BAC;
  const AC = latestUpdate?.actualCostsIncurred ?? 0;

  // Variances
  const SV = EV - PV;
  const CV = EV - AC;
  const costVariancePercent = EV > 0 ? (CV / EV) * 100 : (AC === 0 ? 0 : -100);

  // Performance Indices with zero-division protection
  const SPI = PV > 0 ? Number((EV / PV).toFixed(3)) : (EV > 0 ? 1.0 : 1.0);
  const CPI = AC > 0 ? Number((EV / AC).toFixed(3)) : (EV > 0 ? 1.0 : 1.0);

  // Estimates at Completion (EAC, ETC, VAC)
  let EAC = BAC;
  if (CPI > 0.1) {
    EAC = Math.round(BAC / CPI);
  } else if (AC > 0) {
    EAC = AC + (BAC - EV);
  }
  const ETC = Math.max(0, EAC - AC);
  const VAC = BAC - EAC;

  // Physical Progress Variance
  const physicalProgressVariance = Number((actualPercent - plannedPercent).toFixed(1));

  // Schedule delay estimation in days
  let scheduleDelayDays = 0;
  if (SPI < 1.0 && plannedPercent > 0) {
    const plannedDurationDays = Math.max(
      30,
      Math.round(
        (new Date(project.targetCompletionDate).getTime() - new Date(project.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    // Slippage formula: Planned Duration / SPI - Planned Duration
    scheduleDelayDays = Math.max(0, Math.round((plannedDurationDays / Math.max(0.2, SPI)) - plannedDurationDays));
  }

  // Estimated completion date
  const targetDateObj = new Date(project.targetCompletionDate);
  targetDateObj.setDate(targetDateObj.getDate() + scheduleDelayDays);
  const estimatedCompletionDate = targetDateObj.toISOString().split('T')[0];

  // Billing & Collections
  const billingSubmitted = latestUpdate?.billingSubmitted ?? 0;
  const billingApproved = latestUpdate?.billingApproved ?? 0;
  const invoicesIssued = latestUpdate?.invoicesIssued ?? 0;
  const cashCollectionsReceived = latestUpdate?.cashCollectionsReceived ?? 0;
  const outstandingReceivables = Math.max(0, invoicesIssued - cashCollectionsReceived);
  const collectionRate = invoicesIssued > 0 ? (cashCollectionsReceived / invoicesIssued) * 100 : 0;
  const unbilledEarnedWork = Math.max(0, EV - billingSubmitted);

  // Health assessment & Diagnostic Rationale
  const rationale: string[] = [];
  let health: HealthStatus = 'On Track';

  if (physicalProgressVariance < -15 || CPI < 0.85 || SPI < 0.85) {
    health = 'Critical';
    if (physicalProgressVariance < -15) {
      rationale.push(`Physical progress lags behind schedule by ${Math.abs(physicalProgressVariance)}%`);
    }
    if (CPI < 0.85) {
      rationale.push(`Severe cost overrun: Cost Performance Index (CPI) is critical at ${CPI.toFixed(2)}`);
    }
    if (SPI < 0.85) {
      rationale.push(`Severe schedule slippage: SPI is ${SPI.toFixed(2)} (${scheduleDelayDays} days projected delay)`);
    }
  } else if (physicalProgressVariance < -5 || CPI < 0.95 || SPI < 0.95) {
    health = 'Behind';
    if (physicalProgressVariance < -5) {
      rationale.push(`Physical progress is behind schedule by ${Math.abs(physicalProgressVariance)}%`);
    }
    if (CPI < 0.95) {
      rationale.push(`Costs are trending over budget: CPI is ${CPI.toFixed(2)}`);
    }
    if (SPI < 0.95) {
      rationale.push(`Schedule is slipping: SPI is ${SPI.toFixed(2)}`);
    }
  } else if (physicalProgressVariance < 0 || outstandingReceivables > BAC * 0.2) {
    health = 'Slight Delay';
    if (physicalProgressVariance < 0) {
      rationale.push(`Minor progress lag of ${Math.abs(physicalProgressVariance)}%`);
    }
    if (outstandingReceivables > BAC * 0.2) {
      rationale.push(`High outstanding receivables of ${formatCurrency(outstandingReceivables, project.currency)}`);
    }
  } else {
    health = 'On Track';
    rationale.push('Milestones and progress are within approved baseline thresholds');
    rationale.push(`Cost efficiency is favorable with CPI of ${CPI.toFixed(2)}`);
  }

  return {
    plannedValue: Math.round(PV),
    earnedValue: Math.round(EV),
    actualCost: Math.round(AC),
    budgetAtCompletion: Math.round(BAC),
    scheduleVariance: Math.round(SV),
    costVariance: Math.round(CV),
    costVariancePercent: Number(costVariancePercent.toFixed(1)),
    schedulePerformanceIndex: SPI,
    costPerformanceIndex: CPI,
    toCompletePerformanceIndex: (BAC - AC > 0) ? Number(((BAC - EV) / (BAC - AC)).toFixed(2)) : 1.0,
    estimateAtCompletion: Math.round(EAC),
    estimateToComplete: Math.round(ETC),
    varianceAtCompletion: Math.round(VAC),
    physicalProgressVariance,
    estimatedCompletionDate,
    scheduleDelayDays,
    billingSubmitted,
    billingApproved,
    invoicesIssued,
    cashCollectionsReceived,
    outstandingReceivables,
    collectionRate: Number(collectionRate.toFixed(1)),
    unbilledEarnedWork: Math.round(unbilledEarnedWork),
    health,
    healthRationale: rationale,
  };
};

/**
 * Generate monthly S-Curve Forecasting points for charts
 */
export interface ForecastDataPoint {
  month: string;
  plannedProgress: number;
  actualProgress?: number;
  forecastProgress?: number;
  plannedCost: number;
  actualCost?: number;
  forecastCost?: number;
}

export const generateProgressForecastData = (
  project: Project,
  baseline?: ProjectBaseline | null,
  update?: ProjectUpdate | null,
  scenario: 'current_trend' | 'optimistic' | 'pessimistic' = 'current_trend'
): ForecastDataPoint[] => {
  const months = [
    'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026',
    'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026',
    'Jan 2027', 'Feb 2027'
  ];

  const actualUntilMonth = update?.reportingPeriod || 'Sep 2026';
  const actualIndex = months.indexOf(actualUntilMonth);
  const cutoffIndex = actualIndex >= 0 ? actualIndex : 8; // Default Sep 2026

  const plannedCurve = [0, 5, 12, 22, 35, 48, 62, 75, 85, 92, 98, 100, 100, 100];
  const actualProgressHistory = [0, 4, 10, 18, 30, 42, 54, 65, update?.actualPhysicalProgress ?? 72];

  // Scenario multipliers on remaining velocity
  let velocityFactor = 0.85; // current trend
  if (scenario === 'optimistic') velocityFactor = 1.05;
  if (scenario === 'pessimistic') velocityFactor = 0.70;

  const points: ForecastDataPoint[] = [];

  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    const planned = plannedCurve[i] ?? 100;
    const isPastOrCurrent = i <= cutoffIndex;

    const pt: ForecastDataPoint = {
      month: m,
      plannedProgress: planned,
      plannedCost: (planned / 100) * project.contractAmount,
    };

    if (isPastOrCurrent) {
      const act = actualProgressHistory[i] ?? (i * 8);
      pt.actualProgress = act;
      pt.actualCost = (act / 100) * project.contractAmount * 1.08;
    }

    if (i >= cutoffIndex) {
      // Forecast continuation
      const baseProgress = actualProgressHistory[cutoffIndex] ?? 72;
      const monthsFromCutoff = i - cutoffIndex;
      const progressDelta = monthsFromCutoff * (7.5 * velocityFactor);
      pt.forecastProgress = Math.min(100, Number((baseProgress + progressDelta).toFixed(1)));
      pt.forecastCost = (pt.forecastProgress / 100) * project.contractAmount * (1 + (1 - velocityFactor) * 0.2);
    }

    points.push(pt);
  }

  return points;
};
