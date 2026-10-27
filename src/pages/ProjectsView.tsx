import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { Project, EVMMetrics, ProjectType, HealthStatus } from '../types';
import { formatCurrency } from '../services/financialService';

interface ProjectsViewProps {
  projects: Project[];
  metricsMap: Record<string, EVMMetrics>;
  onSelectProject: (p: Project) => void;
  onNavigate: (view: string) => void;
  onOpenCreateProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  metricsMap,
  onSelectProject,
  onNavigate,
  onOpenCreateProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [healthFilter, setHealthFilter] = useState<string>('All');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const matchesHealth = healthFilter === 'All' || p.currentHealth === healthFilter;

    return matchesSearch && matchesType && matchesHealth;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Projects Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage capital projects, approve baselines, and monitor performance
          </p>
        </div>

        <button
          onClick={onOpenCreateProject}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Setup</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, name, client..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Project Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="All">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Industrial">Industrial</option>
            <option value="Institutional">Institutional</option>
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="All">All Health Statuses</option>
            <option value="On Track">On Track</option>
            <option value="Slight Delay">Slight Delay</option>
            <option value="Behind">Behind / Critical</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p, idx) => {
          const m = metricsMap[p.id];
          return (
            <div
              key={`${p.id}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Image & Status Tag */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={p.imageUrl || '/src/assets/images/building_riverside_residence_1792219353957.jpg'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-800 shadow-xs">
                      {p.code}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        p.currentHealth === 'On Track'
                          ? 'bg-emerald-500 text-white'
                          : p.currentHealth === 'Slight Delay'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {p.currentHealth}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base leading-tight drop-shadow-xs">{p.name}</h3>
                    <p className="text-xs text-slate-200 mt-0.5">{p.client} · {p.location}</p>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Contract Value</span>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {formatCurrency(p.contractAmount, p.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Approved Budget</span>
                    <span className="font-mono font-semibold text-slate-700 tabular-nums">
                      {formatCurrency(m?.budgetAtCompletion || p.contractAmount * 0.9, p.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">EVM Performance</span>
                    <div className="flex items-center gap-2 font-mono font-bold tabular-nums">
                      <span className={m?.costPerformanceIndex >= 1 ? 'text-emerald-600' : 'text-rose-600'}>
                        CPI: {m?.costPerformanceIndex.toFixed(2) || '1.00'}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className={m?.schedulePerformanceIndex >= 1 ? 'text-emerald-600' : 'text-amber-600'}>
                        SPI: {m?.schedulePerformanceIndex.toFixed(2) || '1.00'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-slate-500 font-medium">Project Manager</span>
                    <span className="font-semibold text-slate-800">{p.assignedPm}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    onSelectProject(p);
                    onNavigate('schedule');
                  }}
                  className="py-1.5 px-3 border border-slate-300 hover:bg-white text-slate-700 font-semibold rounded-lg transition-colors text-center"
                >
                  Schedule
                </button>
                <button
                  onClick={() => {
                    onSelectProject(p);
                    onNavigate('forecasting');
                  }}
                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
                >
                  Forecast
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
