import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Plus,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
import { Project, RiskItem, IssueItem } from '../types';

interface RisksIssuesViewProps {
  project: Project;
  risks: RiskItem[];
  issues: IssueItem[];
  onAddRisk: (risk: RiskItem) => Promise<void>;
  onAddIssue: (issue: IssueItem) => Promise<void>;
}

export const RisksIssuesView: React.FC<RisksIssuesViewProps> = ({
  project,
  risks,
  issues,
  onAddRisk,
  onAddIssue,
}) => {
  const [activeTab, setActiveTab] = useState<'Risks' | 'Issues'>('Risks');
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // New Risk Form
  const [riskTitle, setRiskTitle] = useState('');
  const [riskCategory, setRiskCategory] = useState<RiskItem['category']>('Schedule');
  const [riskProb, setRiskProb] = useState<RiskItem['probability']>('High');
  const [riskImpact, setRiskImpact] = useState<RiskItem['impact']>('High');
  const [riskMitigation, setRiskMitigation] = useState('');
  const [riskOwner, setRiskOwner] = useState('Site Engineer');

  // New Issue Form
  const [issueTitle, setIssueTitle] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<IssueItem['severity']>('High');
  const [issueAssigned, setIssueAssigned] = useState('Maria Santos');
  const [issueTargetDate, setIssueTargetDate] = useState('2026-10-31');

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskTitle.trim()) return;

    await onAddRisk({
      id: `risk-${Date.now()}`,
      projectId: project.id,
      title: riskTitle,
      description: riskTitle,
      category: riskCategory,
      probability: riskProb,
      impact: riskImpact,
      mitigationPlan: riskMitigation,
      owner: riskOwner,
      status: 'Open',
    });

    setRiskTitle('');
    setRiskMitigation('');
    setShowRiskModal(false);
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) return;

    await onAddIssue({
      id: `issue-${Date.now()}`,
      projectId: project.id,
      title: issueTitle,
      severity: issueSeverity,
      status: 'Open',
      assignedTo: issueAssigned,
      identifiedDate: new Date().toISOString().split('T')[0],
      targetResolutionDate: issueTargetDate,
      actionTaken: 'Assigned to site team for active resolution.',
    });

    setIssueTitle('');
    setShowIssueModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Risks & Issues Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {project.name} &nbsp;·&nbsp; <span className="font-mono text-slate-700">{project.code}</span>
          </p>
        </div>

        <button
          onClick={() => (activeTab === 'Risks' ? setShowRiskModal(true) : setShowIssueModal(true))}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'Risks' ? 'Add Risk' : 'Log Issue'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('Risks')}
          className={`py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'Risks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Risk Register ({risks.length})
        </button>
        <button
          onClick={() => setActiveTab('Issues')}
          className={`py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'Issues'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Issue Log ({issues.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'Risks' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Risk Item & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Probability / Impact</th>
                <th className="py-3 px-4">Mitigation Plan</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {risks.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                    {r.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {r.category}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold">
                      <span className={r.probability === 'High' ? 'text-rose-600' : 'text-amber-600'}>
                        {r.probability}
                      </span>
                      <span className="text-slate-300">/</span>
                      <span className={r.impact === 'High' ? 'text-rose-600' : 'text-amber-600'}>
                        {r.impact}
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                    {r.mitigationPlan}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {r.owner}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Identified Date</th>
                <th className="py-3 px-4">Target Resolution</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">{i.title}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      {i.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{i.assignedTo}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{i.identifiedDate}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono font-medium">{i.targetResolutionDate}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Risk Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Add Project Risk</h3>
              <button onClick={() => setShowRiskModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRisk} className="space-y-3.5 pt-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Risk Description</label>
                <input
                  type="text"
                  required
                  value={riskTitle}
                  onChange={(e) => setRiskTitle(e.target.value)}
                  placeholder="e.g. Ground water table seepage during basement excavation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Probability</label>
                  <select
                    value={riskProb}
                    onChange={(e) => setRiskProb(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impact</label>
                  <select
                    value={riskImpact}
                    onChange={(e) => setRiskImpact(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mitigation Plan</label>
                <textarea
                  rows={2}
                  value={riskMitigation}
                  onChange={(e) => setRiskMitigation(e.target.value)}
                  placeholder="Preventative steps and contingency protocol..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Add Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Log Project Issue</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3.5 pt-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Description</label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Delayed utility line relocation permit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={issueSeverity}
                    onChange={(e) => setIssueSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={issueAssigned}
                    onChange={(e) => setIssueAssigned(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Resolution Date</label>
                <input
                  type="date"
                  value={issueTargetDate}
                  onChange={(e) => setIssueTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Save Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
