import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileCheck,
  Building,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Project, ProjectBaseline, ProjectUpdate, EVMMetrics } from '../../types';
import {
  createGoogleDocsProposal,
  authorizeGoogleWorkspace,
  getCachedAccessToken,
  ProposalGenerationResult,
} from '../../services/googleDocsService';
import { formatCurrency } from '../../services/financialService';

interface GoogleDocsProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  baseline: ProjectBaseline | null;
  latestUpdate: ProjectUpdate | null;
  metrics: EVMMetrics | null;
}

export const GoogleDocsProposalModal: React.FC<GoogleDocsProposalModalProps> = ({
  isOpen,
  onClose,
  project,
  baseline,
  latestUpdate,
  metrics,
}) => {
  const [executiveNotes, setExecutiveNotes] = useState(
    'This capital project proposal reflects the baseline commercial terms, work breakdown packages, and milestone payment schedules agreed with the client.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProposalGenerationResult | null>(null);

  if (!isOpen) return null;

  const hasToken = Boolean(getCachedAccessToken());

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    setError(null);
    try {
      await authorizeGoogleWorkspace();
    } catch (err: any) {
      console.error('Google Workspace Auth Error:', err);
      setError(err?.message || 'Google authorization could not be completed.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    try {
      const proposal = await createGoogleDocsProposal(
        project,
        baseline,
        latestUpdate,
        metrics,
        executiveNotes
      );
      setResult(proposal);
    } catch (err: any) {
      console.error('Error generating Google Doc proposal:', err);
      setError(
        err?.message ||
          'Failed to create the proposal in Google Docs. Please ensure permissions are granted.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Export Project Proposal to Google Docs
              </h3>
              <p className="text-xs text-slate-300">
                Official Baseline Charter & Commercial Proposal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Project Snapshot Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {project.code} • {project.type}
                </span>
                <h4 className="font-bold text-slate-900 text-base">{project.name}</h4>
                <p className="text-xs text-slate-500">{project.client} — {project.location}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {project.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Contract Value</span>
                <span className="font-bold font-mono text-slate-900">
                  {formatCurrency(project.contractAmount, project.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Approved Budget</span>
                <span className="font-bold font-mono text-slate-900">
                  {baseline ? formatCurrency(baseline.approvedBudget, project.currency) : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Target Timeline</span>
                <span className="font-medium text-slate-900 truncate block">
                  {project.targetDurationMonths} mos ({project.targetCompletionDate})
                </span>
              </div>
            </div>
          </div>

          {/* Proposal Contents Preview */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sections to be formatted in Google Docs
            </label>
            <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1. Executive Summary & PM Details</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>2. Scope & Technical Objectives</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>3. Financial & EVM Commercials</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>4. Work Packages & WBS Weights</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>5. Key Milestone Schedule & Billings</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>6. Governance & Sign-off Block</span>
              </li>
            </ul>
          </div>

          {/* Executive Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Proposal Executive Addendum / Strategic Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={executiveNotes}
              onChange={(e) => setExecutiveNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
              placeholder="Add specific commercial qualifications, warranty details, or remarks..."
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {result && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Google Doc Proposal Created Successfully!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Document: <span className="font-semibold">{result.title}</span>
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href={result.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <span>Open in Google Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-xs text-emerald-600">Saved to your Google Drive</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
            <span>Powered by Google Docs API</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating || isAuthorizing}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleGenerateProposal}
              disabled={isGenerating || isAuthorizing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Proposal in Google Docs...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{result ? 'Create Another Copy' : 'Generate Proposal in Google Docs'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
