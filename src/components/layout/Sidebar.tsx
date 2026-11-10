import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CalendarRange,
  DollarSign,
  Receipt,
  AlertTriangle,
  FileText,
  FileBarChart,
  Settings,
  Sparkles,
  CheckCircle2,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'schedule', label: 'Schedule', icon: CalendarRange },
    { id: 'cost-finance', label: 'Cost & Finance', icon: DollarSign },
    { id: 'billing-collection', label: 'Billing & Collection', icon: Receipt },
    { id: 'forecasting', label: 'Forecasting & AI', icon: Sparkles },
    { id: 'risks-issues', label: 'Risks & Issues', icon: AlertTriangle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'closeout', label: 'Project Closeout', icon: CheckCircle2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0a2342] text-white flex flex-col shadow-2xl lg:shadow-none lg:sticky lg:top-0 lg:h-screen lg:self-start lg:shrink-0 liquid-sidebar ${
          // Mobile open/close
          isOpen
            ? 'translate-x-0 w-72 max-w-[85vw]'
            : '-translate-x-full lg:translate-x-0'
        } ${
          // Desktop expanded vs collapsed
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`flex items-center border-b border-white/10 shrink-0 liquid-item ${
            isCollapsed
              ? 'px-3.5 py-4 lg:justify-center justify-between'
              : 'px-4 sm:px-5 py-4 justify-between'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shrink-0 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 19h4V9H4v10zm6 0h4V5h-4v14zm6 0h4v-7h-4v7z" />
              </svg>
            </div>
            {/* Liquid collapsing brand title */}
            <div
              className={`overflow-hidden whitespace-nowrap liquid-item ${
                isCollapsed
                  ? 'lg:max-w-0 lg:opacity-0 lg:-translate-x-2'
                  : 'max-w-[200px] opacity-100 translate-x-0'
              }`}
            >
              <h1 className="font-bold text-sm sm:text-base tracking-tight leading-tight text-white whitespace-nowrap">
                Project Management
              </h1>
              <span className="text-[11px] font-bold text-blue-300 tracking-wider uppercase">
                Outlook
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center rounded-xl text-xs sm:text-sm font-medium liquid-item cursor-pointer overflow-hidden ${
                    isCollapsed
                      ? 'lg:justify-center px-3 py-2.5 sm:py-3'
                      : 'px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label={item.label}
                >
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                  </div>
                  {/* Liquid text label */}
                  <span
                    className={`overflow-hidden whitespace-nowrap liquid-item truncate ${
                      isCollapsed
                        ? 'lg:max-w-0 lg:opacity-0 lg:ml-0'
                        : 'max-w-[170px] opacity-100 ml-3'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>

                {/* Floating Tooltip when Collapsed on Desktop */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 items-center pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          className={`p-3 sm:p-4 border-t border-white/10 text-slate-400 liquid-item shrink-0 ${
            isCollapsed ? 'lg:p-2' : ''
          }`}
        >
          {/* Desktop Collapsed Compact View */}
          <div
            className={`hidden lg:flex flex-col items-center gap-2 py-1 overflow-hidden liquid-item ${
              isCollapsed
                ? 'max-h-24 opacity-100 scale-100'
                : 'max-h-0 opacity-0 scale-90 pointer-events-none'
            }`}
          >
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
              v3.8
            </span>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Expand sidebar (Ctrl+B)"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-blue-300" />
              </button>
            )}
          </div>

          {/* Desktop Expanded Detailed View */}
          <div
            className={`hidden lg:block text-xs overflow-hidden liquid-item ${
              isCollapsed
                ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                : 'max-h-36 opacity-100 translate-y-0'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-medium whitespace-nowrap">Enterprise Engine</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                v3.8
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 whitespace-nowrap">
              Compliant with ISO 21500 & EVM.
            </p>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer border border-white/5"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
                <span>Collapse Sidebar</span>
              </button>
            )}
          </div>

          {/* Mobile drawer footer always shows full info */}
          <div className="lg:hidden text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-medium">Enterprise Engine</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                v3.8
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Compliant with ISO 21500 & EVM Standard (ANSI/EIA-748).
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
