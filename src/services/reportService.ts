/**
 * Report Generation & Data Export Service
 * Produces CSV, Excel-compatible sheets, and print-ready formats
 */

import { Project, ProjectBaseline, ProjectUpdate, EVMMetrics } from '../types';
import { calculateEVMMetrics, formatCurrency } from './financialService';

export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel compatibility
    [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
      '\r\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPortfolioSummaryReport = (
  projects: Project[],
  metricsMap: Record<string, EVMMetrics>
) => {
  const headers = [
    'Project Code',
    'Project Name',
    'Client',
    'Type',
    'Contract Value',
    'Approved Budget',
    'Actual Cost Incurred',
    'Cost Variance (CV)',
    'CPI',
    'SPI',
    'Planned %',
    'Actual %',
    'Health Status',
    'Invoiced Amount',
    'Collections',
    'Outstanding AR',
  ];

  const rows = projects.map((p) => {
    const m = metricsMap[p.id];
    return [
      p.code,
      p.name,
      p.client,
      p.type,
      p.contractAmount,
      m ? m.budgetAtCompletion : 0,
      m ? m.actualCost : 0,
      m ? m.costVariance : 0,
      m ? m.costPerformanceIndex : 1,
      m ? m.schedulePerformanceIndex : 1,
      m ? m.physicalProgressVariance + (m.earnedValue / (m.budgetAtCompletion || 1)) * 100 : 0,
      m ? Number(((m.earnedValue / (m.budgetAtCompletion || 1)) * 100).toFixed(1)) : 0,
      p.currentHealth,
      m ? m.invoicesIssued : 0,
      m ? m.cashCollectionsReceived : 0,
      m ? m.outstandingReceivables : 0,
    ];
  });

  exportToCSV(`Portfolio_Summary_${new Date().toISOString().split('T')[0]}`, headers, rows);
};

export const exportProjectDetailReport = (
  project: Project,
  baseline?: ProjectBaseline | null,
  update?: ProjectUpdate | null
) => {
  const m = calculateEVMMetrics(project, baseline, update);

  const headers = ['Metric', 'Baseline / Planned', 'Actual / Performance', 'Variance / Index'];
  const rows = [
    ['Contract Amount', formatCurrency(project.contractAmount, project.currency), '—', '—'],
    ['Budget at Completion (BAC)', formatCurrency(m.budgetAtCompletion, project.currency), '—', '—'],
    ['Planned Value (PV) vs EV', formatCurrency(m.plannedValue, project.currency), formatCurrency(m.earnedValue, project.currency), `SV: ${formatCurrency(m.scheduleVariance, project.currency)}`],
    ['Actual Cost (AC)', '—', formatCurrency(m.actualCost, project.currency), `CV: ${formatCurrency(m.costVariance, project.currency)} (${m.costVariancePercent}%)`],
    ['Cost Performance Index (CPI)', '1.000', m.costPerformanceIndex.toFixed(3), m.costPerformanceIndex >= 1 ? 'Under Budget' : 'Cost Overrun'],
    ['Schedule Performance Index (SPI)', '1.000', m.schedulePerformanceIndex.toFixed(3), m.schedulePerformanceIndex >= 1 ? 'Ahead/On Time' : `${m.scheduleDelayDays} days delay`],
    ['Estimate at Completion (EAC)', formatCurrency(m.budgetAtCompletion, project.currency), formatCurrency(m.estimateAtCompletion, project.currency), `VAC: ${formatCurrency(m.varianceAtCompletion, project.currency)}`],
    ['Billings Submitted', '—', formatCurrency(m.billingSubmitted, project.currency), '—'],
    ['Invoices Issued vs Collections', formatCurrency(m.invoicesIssued, project.currency), formatCurrency(m.cashCollectionsReceived, project.currency), `AR Balance: ${formatCurrency(m.outstandingReceivables, project.currency)}`],
    ['Collection Efficiency Rate', '100%', `${m.collectionRate}%`, m.collectionRate >= 90 ? 'Healthy' : 'Collection Risk'],
  ];

  exportToCSV(`${project.code}_Performance_Audit_${new Date().toISOString().split('T')[0]}`, headers, rows);
};

export const printReportView = () => {
  window.print();
};
