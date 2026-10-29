import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Project, ProjectBaseline, WorkPackage, Milestone, ProjectType } from '../types';
import { formatCurrency } from '../services/financialService';
import { useAuth } from '../context/AuthContext';

interface ProjectSetupWizardProps {
  initialProject?: Project | null;
  onSaveProject: (project: Project, baseline: ProjectBaseline) => Promise<void>;
  onCancel: () => void;
}

export const ProjectSetupWizard: React.FC<ProjectSetupWizardProps> = ({
  initialProject,
  onSaveProject,
  onCancel,
}) => {
  const { currentUser, canApproveBaseline } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State: Step 1 (Project Details matching Screenshot 2)
  const [projectName, setProjectName] = useState(initialProject?.name || 'Riverside Residences');
  const [projectCode, setProjectCode] = useState(initialProject?.code || 'RR-001');
  const [client, setClient] = useState(initialProject?.client || 'ABC Development Corp.');
  const [projectType, setProjectType] = useState<ProjectType>(initialProject?.type || 'Residential');
  const [contractValue, setContractValue] = useState<number>(initialProject?.contractAmount || 25000000);
  const [location, setLocation] = useState(initialProject?.location || 'Santa Rosa, Laguna');
  const [startDate, setStartDate] = useState(initialProject?.startDate || '2026-03-01');
  const [completionDate, setCompletionDate] = useState(initialProject?.targetCompletionDate || '2026-12-31');
  const [targetDuration, setTargetDuration] = useState<number>(initialProject?.targetDurationMonths || 10);

  // Form State: Step 2 (Work Packages matching Screenshot 3)
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([
    {
      id: 'wp-1',
      code: 'WP-01',
      name: 'General Requirements',
      description: 'Mobilization, permits, temporary facilities',
      selected: true,
      plannedWeight: 10,
      plannedCost: 2250000,
    },
    {
      id: 'wp-2',
      code: 'WP-02',
      name: 'Site Development',
      description: 'Earthworks, site utilities, drainage',
      selected: true,
      plannedWeight: 20,
      plannedCost: 4500000,
    },
    {
      id: 'wp-3',
      code: 'WP-03',
      name: 'Building Works',
      description: 'Structure, architectural, MEP',
      selected: true,
      plannedWeight: 45,
      plannedCost: 10125000,
    },
    {
      id: 'wp-4',
      code: 'WP-04',
      name: 'External Works',
      description: 'Roads, parking, landscaping',
      selected: true,
      plannedWeight: 15,
      plannedCost: 3375000,
    },
    {
      id: 'wp-5',
      code: 'WP-05',
      name: 'Testing & Commissioning',
      description: 'Testing, punchlist, turnover',
      selected: true,
      plannedWeight: 10,
      plannedCost: 2250000,
    },
  ]);

  // Form State: Step 3 (Milestones)
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm-1', name: 'Notice to Proceed & Mobilization', targetDate: '2026-03-15', isKeyMilestone: true, status: 'Completed', billingTriggerPercentage: 15 },
    { id: 'm-2', name: 'Substructure & Foundation Sign-off', targetDate: '2026-05-30', isKeyMilestone: true, status: 'Completed', billingTriggerPercentage: 20 },
    { id: 'm-3', name: 'Top-off Structural Works', targetDate: '2026-08-31', isKeyMilestone: true, status: 'Completed', billingTriggerPercentage: 25 },
    { id: 'm-4', name: 'Substantial Completion & Enclosure', targetDate: '2026-10-31', isKeyMilestone: true, status: 'Delayed', billingTriggerPercentage: 20 },
    { id: 'm-5', name: 'Testing, Turnover & Final Acceptance', targetDate: '2026-12-31', isKeyMilestone: true, status: 'Pending', billingTriggerPercentage: 20 },
  ]);

  // Form State: Step 4 (Budget & Baseline Cost)
  const [approvedBudget, setApprovedBudget] = useState<number>(22500000);
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [approvalNotes, setApprovalNotes] = useState<string>('Baseline reviewed and ratified by Capital Projects Committee.');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Add work package handler
  const handleAddWorkPackage = () => {
    const newIdx = workPackages.length + 1;
    const newWP: WorkPackage = {
      id: `wp-${Date.now()}`,
      code: `WP-0${newIdx}`,
      name: `New Package ${newIdx}`,
      description: 'Description of scope and deliverables',
      selected: true,
      plannedWeight: 0,
      plannedCost: 0,
    };
    setWorkPackages([...workPackages, newWP]);
  };

  // Toggle work package selection
  const handleTogglePackage = (id: string) => {
    setWorkPackages(
      workPackages.map((wp) => (wp.id === id ? { ...wp, selected: !wp.selected } : wp))
    );
  };

  // Completeness validation before final approval
  const validateBaseline = (): boolean => {
    const errors: string[] = [];
    if (!projectName.trim()) errors.push('Project Name is required');
    if (!projectCode.trim()) errors.push('Project Code is required');
    if (!client.trim()) errors.push('Client information is required');
    if (!contractValue || contractValue <= 0) errors.push('Valid contract value is required');
    if (contractValue > 50000000) errors.push('Contract value cannot exceed ₱50,000,000 (Maximum limit is 50 Million)');
    if (!approvedBudget || approvedBudget <= 0) errors.push('Approved budget must be greater than zero');
    if (approvedBudget > contractValue * 1.5) errors.push('Approved budget exceeds reasonable ratio of contract value');
    if (!startDate || !completionDate) errors.push('Valid project date bounds are required');
    if (new Date(completionDate) <= new Date(startDate)) errors.push('Target Completion Date must be after Start Date');

    const selectedPackages = workPackages.filter((w) => w.selected);
    if (selectedPackages.length === 0) errors.push('At least one baseline work package must be selected');

    const totalWeight = selectedPackages.reduce((acc, wp) => acc + (Number(wp.plannedWeight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 1) {
      errors.push(`Total work package weight must sum to 100% (currently ${totalWeight}%)`);
    }

    if (milestones.length === 0) errors.push('Baseline schedule must contain at least one milestone');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFinalSubmit = async () => {
    if (!validateBaseline()) {
      return;
    }

    const projectId = initialProject?.id || `proj-${projectCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const baselineId = `base-${projectId}-v1`;

    const project: Project = {
      id: projectId,
      code: projectCode,
      name: projectName,
      description: `${projectType} capital project for ${client} situated in ${location}.`,
      client,
      location,
      type: projectType,
      assignedPm: currentUser?.displayName || 'Ian Tumulak',
      assignedPmAvatar: currentUser?.avatarUrl || '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
      startDate,
      targetCompletionDate: completionDate,
      targetDurationMonths: targetDuration,
      contractAmount: Number(contractValue),
      currency: 'PHP',
      status: 'Active',
      currentHealth: 'On Track',
      imageUrl: '/src/assets/images/building_riverside_residence_1792219353957.jpg',
      members: [
        {
          userId: currentUser?.id || 'u-1',
          name: currentUser?.displayName || 'Ian Tumulak',
          role: currentUser?.role || 'Project Manager',
          email: currentUser?.email || 'pm@pmoutlook.com',
        },
      ],
      activeBaselineId: baselineId,
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      createdBy: currentUser?.displayName || 'Ian Tumulak',
      updatedAt: new Date().toISOString(),
    };

    const baseline: ProjectBaseline = {
      id: baselineId,
      projectId,
      version: 1,
      scopeDescription: `Full capital construction scope consisting of ${workPackages.filter((w) => w.selected).length} ratified work packages.`,
      originalContractAmount: Number(contractValue),
      approvedBudget: Number(approvedBudget),
      plannedStartDate: startDate,
      plannedCompletionDate: completionDate,
      targetDurationMonths: targetDuration,
      currency: 'PHP',
      workPackages: workPackages.filter((w) => w.selected),
      milestones,
      monthlyCostPlan: [
        { month: 'Mar 2026', plannedCost: approvedBudget * 0.08, cumulativeCost: approvedBudget * 0.08, plannedProgress: 10 },
        { month: 'Apr 2026', plannedCost: approvedBudget * 0.10, cumulativeCost: approvedBudget * 0.18, plannedProgress: 20 },
        { month: 'May 2026', plannedCost: approvedBudget * 0.12, cumulativeCost: approvedBudget * 0.30, plannedProgress: 35 },
        { month: 'Jun 2026', plannedCost: approvedBudget * 0.15, cumulativeCost: approvedBudget * 0.45, plannedProgress: 50 },
        { month: 'Jul 2026', plannedCost: approvedBudget * 0.15, cumulativeCost: approvedBudget * 0.60, plannedProgress: 65 },
        { month: 'Aug 2026', plannedCost: approvedBudget * 0.15, cumulativeCost: approvedBudget * 0.75, plannedProgress: 75 },
        { month: 'Sep 2026', plannedCost: approvedBudget * 0.12, cumulativeCost: approvedBudget * 0.87, plannedProgress: 85 },
        { month: 'Oct 2026', plannedCost: approvedBudget * 0.08, cumulativeCost: approvedBudget * 0.95, plannedProgress: 92 },
        { month: 'Nov 2026', plannedCost: approvedBudget * 0.03, cumulativeCost: approvedBudget * 0.98, plannedProgress: 97 },
        { month: 'Dec 2026', plannedCost: approvedBudget * 0.02, cumulativeCost: approvedBudget * 1.00, plannedProgress: 100 },
      ],
      billingMilestones: [
        { id: 'bm-1', name: 'Mobilization Advance (15%)', percentage: 15, expectedAmount: contractValue * 0.15, expectedMonth: 'Mar 2026' },
        { id: 'bm-2', name: 'Substructure Progress (20%)', percentage: 20, expectedAmount: contractValue * 0.20, expectedMonth: 'May 2026' },
        { id: 'bm-3', name: 'Superstructure Progress (25%)', percentage: 25, expectedAmount: contractValue * 0.25, expectedMonth: 'Aug 2026' },
        { id: 'bm-4', name: 'Finishes & MEP Progress (25%)', percentage: 25, expectedAmount: contractValue * 0.25, expectedMonth: 'Oct 2026' },
        { id: 'bm-5', name: 'Final Handover & Retention (15%)', percentage: 15, expectedAmount: contractValue * 0.15, expectedMonth: 'Dec 2026' },
      ],
      isApproved,
      approvedBy: isApproved ? (currentUser?.displayName || 'Executive Board') : undefined,
      approvedAt: isApproved ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.displayName || 'Ian Tumulak',
    };

    await onSaveProject(project, baseline);
  };

  const stepsList = [
    { num: 1, label: 'Project Details' },
    { num: 2, label: 'Baseline Scope' },
    { num: 3, label: 'Baseline Schedule' },
    { num: 4, label: 'Baseline Cost' },
    { num: 5, label: 'Review & Approval' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Step Header matching Screenshot 2 */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step project setup and baseline encoding with completeness audit
        </p>

        {/* Step Indicator Bar matching Screenshot 2 */}
        <div className="mt-6 flex items-center justify-between max-w-2xl mx-auto">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className="flex flex-col items-center gap-1.5 focus:outline-hidden group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold whitespace-nowrap ${
                    currentStep === s.num ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </button>

              {idx < stepsList.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    currentStep > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Step Form Body */}
      <div className="p-6 sm:p-8">
        {/* Step 1: Project Details (Screenshot 2) */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-base font-bold text-slate-900">Project Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Riverside Residences"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Code
                </label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RR-001"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Client
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="e.g. ABC Development Corp."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Institutional">Institutional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contract Value (₱) <span className="text-slate-400 font-normal">(Max: ₱50M)</span>
                </label>
                <input
                  type="number"
                  max={50000000}
                  value={contractValue}
                  onChange={(e) => setContractValue(Number(e.target.value))}
                  placeholder="25000000"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatCurrency(contractValue, 'PHP')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Santa Rosa, Laguna"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Baseline Scope (Work Packages matching Screenshot 3) */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Work Packages Table (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Work Packages</h3>
                  <p className="text-xs text-slate-500">
                    Define baseline work packages, deliverables, and weight distribution
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddWorkPackage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Work Package</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3">Work Package</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3 text-center w-20">Weight %</th>
                      <th className="py-3 px-3 text-right">Budget (₱)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workPackages.map((wp, idx) => (
                      <tr key={wp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={wp.selected}
                            onChange={() => handleTogglePackage(wp.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={wp.name}
                            onChange={(e) => {
                              const updated = [...workPackages];
                              updated[idx].name = e.target.value;
                              setWorkPackages(updated);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded font-semibold text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={wp.description}
                            onChange={(e) => {
                              const updated = [...workPackages];
                              updated[idx].description = e.target.value;
                              setWorkPackages(updated);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-slate-600 text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            value={wp.plannedWeight}
                            onChange={(e) => {
                              const updated = [...workPackages];
                              updated[idx].plannedWeight = Number(e.target.value);
                              updated[idx].plannedCost = (Number(e.target.value) / 100) * approvedBudget;
                              setWorkPackages(updated);
                            }}
                            className="w-16 px-1.5 py-1 text-center font-mono border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                          {formatCurrency(wp.plannedCost || (wp.plannedWeight / 100) * approvedBudget, 'PHP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs font-semibold">
                <span>Total Work Package Weight:</span>
                <span
                  className={`font-mono text-sm ${
                    workPackages.filter((w) => w.selected).reduce((acc, w) => acc + (Number(w.plannedWeight) || 0), 0) === 100
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {workPackages.filter((w) => w.selected).reduce((acc, w) => acc + (Number(w.plannedWeight) || 0), 0)}% / 100%
                </span>
              </div>
            </div>

            {/* Right Side Project Info Card matching Screenshot 3 */}
            <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Project Information</h4>
              <p className="text-xs font-semibold text-blue-700">{client}</p>

              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                <img
                  src="/src/assets/images/building_riverside_residence_1792219353957.jpg"
                  alt="Project Thumbnail"
                  className="w-full h-36 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Contract Value</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(contractValue, 'PHP')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Target Duration</span>
                  <span className="font-semibold text-slate-900">{targetDuration} months</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-semibold text-slate-900">{startDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Completion Date</span>
                  <span className="font-semibold text-slate-900">{completionDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Baseline Schedule (Milestones) */}
        {currentStep === 3 && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Baseline Schedule & Milestones</h3>
                <p className="text-xs text-slate-500">
                  Define key project milestones, planned dates, and billing progress triggers
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMilestones([
                    ...milestones,
                    {
                      id: `m-${Date.now()}`,
                      name: 'New Milestone',
                      targetDate: completionDate,
                      isKeyMilestone: false,
                      status: 'Pending',
                      billingTriggerPercentage: 10,
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Milestone Name</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4 text-center">Billing Trigger %</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Key Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {milestones.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...milestones];
                            updated[idx].name = e.target.value;
                            setMilestones(updated);
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-semibold text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          value={m.targetDate}
                          onChange={(e) => {
                            const updated = [...milestones];
                            updated[idx].targetDate = e.target.value;
                            setMilestones(updated);
                          }}
                          className="px-2 py-1 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          value={m.billingTriggerPercentage || 0}
                          onChange={(e) => {
                            const updated = [...milestones];
                            updated[idx].billingTriggerPercentage = Number(e.target.value);
                            setMilestones(updated);
                          }}
                          className="w-16 px-1.5 py-1 text-center font-mono border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={m.isKeyMilestone}
                          onChange={(e) => {
                            const updated = [...milestones];
                            updated[idx].isKeyMilestone = e.target.checked;
                            setMilestones(updated);
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Baseline Cost */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">Baseline Budget & Cost Allocation</h3>
              <p className="text-xs text-slate-500">
                Establish the authoritative Budget at Completion (BAC) for EVM variance calculations
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Approved Project Budget / BAC (₱)
                </label>
                <input
                  type="number"
                  value={approvedBudget}
                  onChange={(e) => setApprovedBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-base font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <p className="text-xs text-slate-500 font-mono">
                  Target Profit Margin: {formatCurrency(contractValue - approvedBudget, 'PHP')} (
                  {(((contractValue - approvedBudget) / (contractValue || 1)) * 100).toFixed(1)}%)
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950">
                <p className="font-bold">ANSI/EIA-748 EVM Standard Rule:</p>
                <p className="leading-relaxed text-blue-900">
                  The approved baseline budget forms the immutable denominator for CPI and EAC projections. Once ratified by the Committee, baseline v1 will be locked to prevent unauthorized tampering.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Approval */}
        {currentStep === 5 && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">Baseline Completeness & Approval</h3>
              <p className="text-xs text-slate-500">
                Mandatory verification of baseline integrity before entering active project tracking
              </p>
            </div>

            {/* Validation errors box if any */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Baseline Incomplete - Resolve {validationErrors.length} Requirement(s):</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-rose-700">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary Review Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Executive Baseline Charter Summary</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Project</span>
                  <p className="font-bold text-slate-900 mt-0.5">{projectName} ({projectCode})</p>
                </div>
                <div>
                  <span className="text-slate-500">Contract Value</span>
                  <p className="font-bold font-mono text-slate-900 mt-0.5">{formatCurrency(contractValue, 'PHP')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Approved Budget (BAC)</span>
                  <p className="font-bold font-mono text-emerald-700 mt-0.5">{formatCurrency(approvedBudget, 'PHP')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Duration</span>
                  <p className="font-bold text-slate-900 mt-0.5">{startDate} to {completionDate}</p>
                </div>
              </div>
            </div>

            {/* Committee Approval Sign-off */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">Authorize Baseline Approval</span>
                  <p className="text-[11px] text-slate-500">
                    Ratify as immutable Baseline Version 1 for ongoing performance comparison
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    disabled={!canApproveBaseline}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Mark Approved</span>
                </label>
              </div>

              {!canApproveBaseline && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded">
                  Note: Your current role ({currentUser?.role}) cannot approve baselines. System Administrator or Finance Officer role required for formal sign-off.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation Footer */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save & Ratify Project Baseline</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
