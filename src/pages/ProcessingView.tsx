import React, { useState, useEffect } from 'react';
import {
  Database,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface ProcessingViewProps {
  onComplete: () => void;
  projectName?: string;
  projectCode?: string;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  onComplete,
  projectName = 'Riverside Residences',
  projectCode = 'RR-001',
}) => {
  const [progress, setProgress] = useState(25);
  const [currentStage, setCurrentStage] = useState('Consolidating project information...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(50);
      setCurrentStage('Cross-validating physical progress with contract baselines...');
    }, 700);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setCurrentStage('Computing EVM variances (SV, CV, SPI, CPI) and S-Curve forecast...');
    }, 1500);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setCurrentStage('Processing complete! Outlook ready.');
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const nodes = [
    { title: 'Schedule Data', icon: Calendar, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Cost Data', icon: DollarSign, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Billing Data', icon: Receipt, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { title: 'Document Records', icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'Risk & Issue Data', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { title: 'Progress Data', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center min-h-[520px]">
      {/* Title matching Screenshot 5 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Processing Project Data
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Consolidating, Analyzing, Preparing your outlook for {projectName} ({projectCode})
        </p>
      </div>

      {/* Radial Infographic matching Screenshot 5 */}
      <div className="relative w-72 sm:w-88 h-72 sm:h-88 flex items-center justify-center my-4">
        {/* Decorative connection dashed circle */}
        <div className="absolute inset-8 rounded-full border-2 border-dashed border-blue-200 pointer-events-none" />

        {/* Center Database Cylinder Node */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-blue-600 text-white shadow-xl flex flex-col items-center justify-center border-4 border-white animate-pulse">
          <Database className="w-9 h-9" />
          <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">PM Core</span>
        </div>

        {/* Radial Satellite Nodes matching Screenshot 5 */}
        {/* Top Node: Schedule Data */}
        <div className="absolute top-0 flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Schedule Data</span>
          </div>
        </div>

        {/* Top Right: Cost Data */}
        <div className="absolute top-8 right-0 flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-xl border border-amber-200 bg-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>Cost Data</span>
          </div>
        </div>

        {/* Bottom Right: Billing Data */}
        <div className="absolute bottom-10 right-0 flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-xl border border-orange-200 bg-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Receipt className="w-4 h-4 text-orange-600" />
            <span>Billing Data</span>
          </div>
        </div>

        {/* Bottom: Document Records */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Document Records</span>
          </div>
        </div>

        {/* Bottom Left: Risk & Issue Data */}
        <div className="absolute bottom-10 left-0 flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Risk & Issue Data</span>
          </div>
        </div>

        {/* Top Left: Progress Data */}
        <div className="absolute top-8 left-0 flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-white shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Progress Data</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status Text matching Screenshot 5 */}
      <div className="w-full max-w-md mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>{currentStage}</span>
          <span className="font-mono text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Continue button once ready */}
      {progress === 100 && (
        <button
          onClick={onComplete}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 animate-bounce"
        >
          <span>View Forecasting & Decision Support</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
