import React, { useState } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  Database,
  ShieldCheck,
  LogOut,
  Workflow,
  CheckCircle,
  Building,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Project, UserRole, AppNotification } from '../../types';
import { isFirebaseConfigured } from '../../firebase/firebase';
import { ChangePhotoModal } from '../modals/ChangePhotoModal';

interface HeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project) => void;
  onOpenMobileMenu: () => void;
  onOpenWorkflowModal: () => void;
  onOpenConfigModal: () => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onOpenMobileMenu,
  onOpenWorkflowModal,
  onOpenConfigModal,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllRead,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
}) => {
  const { currentUser, switchRole, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const roles: UserRole[] = [
    'System Administrator',
    'Project Manager',
    'Project Engineer',
    'Finance Officer',
    'Billing and Collection Officer',
    'Executive / Read-Only Viewer',
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left Zone: Mobile toggle, Desktop collapse toggle & Project Selector Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectPicker(!showProjectPicker)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-left transition-colors text-xs sm:text-sm font-semibold text-slate-900 max-w-[160px] xs:max-w-[210px] sm:max-w-xs md:max-w-sm truncate"
          >
            <Building className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">
              {selectedProject ? `${selectedProject.name} (${selectedProject.code})` : 'All Projects Portfolio'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showProjectPicker && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Project
              </div>
              {projects.map((p, idx) => (
                <button
                  key={`${p.id}-${idx}`}
                  onClick={() => {
                    onSelectProject(p);
                    setShowProjectPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between ${
                    selectedProject?.id === p.id ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.code} · {p.client}</p>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      p.currentHealth === 'On Track'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.currentHealth === 'Slight Delay'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {p.currentHealth}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Zone: System Tools, Notifications & User Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Workflow Diagram modal trigger */}
        <button
          onClick={onOpenWorkflowModal}
          title="View PM Workflow Diagram"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Workflow className="w-4 h-4 text-blue-600" />
          <span>Workflow Map</span>
        </button>

        {/* Database backend status indicator - hidden to settings */}
        <button
          onClick={onOpenConfigModal}
          title="Click to view Firebase Configuration & Security Rules"
          className="hidden"
        >
          <Database className={`w-3.5 h-3.5 ${isFirebaseConfigured ? 'text-emerald-600' : 'text-blue-600'}`} />
          <span className="hidden sm:inline text-slate-700">
            {isFirebaseConfigured ? 'Firebase Cloud' : 'Local Persistence'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-blue-500'}`} />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                  {unreadNotifs.length > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            title="User Profile & Personalization"
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left border border-transparent hover:border-slate-200 group"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser?.avatarUrl || '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg'}
                alt={currentUser?.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity ring-1 ring-white">
                <Camera className="w-2 h-2" />
              </span>
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                {currentUser?.displayName || 'Ian Tumulak'}
              </p>
              <p className="text-[11px] text-blue-600 font-medium truncate max-w-[130px]">
                {currentUser?.role || 'Project Manager'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block group-hover:text-slate-600 transition-colors" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header with Direct Photo Change */}
              <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => {
                      setShowPhotoModal(true);
                      setShowUserMenu(false);
                    }}
                    title="Click to personalize profile photo"
                    className="relative group cursor-pointer shrink-0"
                  >
                    <img
                      src={currentUser?.avatarUrl || '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg'}
                      alt={currentUser?.displayName || 'User'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {currentUser?.email}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhotoModal(true);
                        setShowUserMenu(false);
                      }}
                      className="mt-1 text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Authenticated
                  </span>
                  <span className="text-slate-500 font-medium truncate max-w-[130px]">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Role Switcher Section */}
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                  Test Role-Based Permissions
                </p>
                <div className="space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between ${
                        currentUser?.role === r
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{r}</span>
                      {currentUser?.role === r && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-2 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Photo Personalization Modal */}
      <ChangePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </header>
  );
};
