/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './pages/LoginView';
import { DashboardView } from './pages/DashboardView';
import { ProjectsView } from './pages/ProjectsView';
import { ProjectSetupWizard } from './pages/ProjectSetupWizard';
import { ProjectUpdateView } from './pages/ProjectUpdateView';
import { ProcessingView } from './pages/ProcessingView';
import { ForecastingView } from './pages/ForecastingView';
import { ScheduleView } from './pages/ScheduleView';
import { CostFinanceView } from './pages/CostFinanceView';
import { BillingCollectionView } from './pages/BillingCollectionView';
import { RisksIssuesView } from './pages/RisksIssuesView';
import { DocumentsView } from './pages/DocumentsView';
import { ReportsView } from './pages/ReportsView';
import { ProjectCloseoutView } from './pages/ProjectCloseoutView';
import { SettingsView } from './pages/SettingsView';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { WorkflowModal } from './components/modals/WorkflowModal';
import { FirebaseConfigModal } from './components/modals/FirebaseConfigModal';

import { dataStore } from './services/dataService';
import { calculateEVMMetrics } from './services/financialService';
import {
  Project,
  ProjectBaseline,
  ProjectUpdate,
  ProjectDocument,
  RiskItem,
  IssueItem,
  AppNotification,
  AuditLogEntry,
  ProjectCloseout,
  EVMMetrics,
} from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();

  // Navigation & UI state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pmo_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pmo_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Domain data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeBaseline, setActiveBaseline] = useState<ProjectBaseline | null>(null);
  const [activeUpdates, setActiveUpdates] = useState<ProjectUpdate[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [closeout, setCloseout] = useState<ProjectCloseout | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<string, EVMMetrics>>({});

  // Reload data
  const loadData = async () => {
    const rawPrjs = await dataStore.getProjects();
    const seen = new Set<string>();
    const prjs = rawPrjs.filter((p) => {
      if (!p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    setProjects(prjs);

    const currentP = selectedProject
      ? prjs.find((p) => p.id === selectedProject.id) || prjs[0]
      : prjs[0];

    setSelectedProject(currentP || null);

    if (currentP) {
      if (currentP.activeBaselineId) {
        const b = await dataStore.getBaseline(currentP.activeBaselineId);
        setActiveBaseline(b);
      } else {
        setActiveBaseline(null);
      }

      const upds = await dataStore.getUpdatesByProjectId(currentP.id);
      setActiveUpdates(upds);

      const docs = await dataStore.getDocuments(currentP.id);
      setDocuments(docs);

      const rs = await dataStore.getRisks(currentP.id);
      setRisks(rs);

      const is = await dataStore.getIssues(currentP.id);
      setIssues(is);

      const cls = await dataStore.getCloseout(currentP.id);
      setCloseout(cls);
    }

    // Build metrics map for all projects
    const map: Record<string, EVMMetrics> = {};
    for (const p of prjs) {
      let b: ProjectBaseline | null = null;
      if (p.activeBaselineId) {
        b = await dataStore.getBaseline(p.activeBaselineId);
      }
      const pUpdates = await dataStore.getUpdatesByProjectId(p.id);
      map[p.id] = calculateEVMMetrics(p, b, pUpdates[0] || null);
    }
    setMetricsMap(map);

    const notifs = await dataStore.getNotifications();
    setNotifications(notifs);

    const logs = await dataStore.getAuditLogs();
    setAuditLogs(logs);
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected project changes, refresh project specific subcollections
  useEffect(() => {
    if (selectedProject) {
      (async () => {
        if (selectedProject.activeBaselineId) {
          const b = await dataStore.getBaseline(selectedProject.activeBaselineId);
          setActiveBaseline(b);
        } else {
          setActiveBaseline(null);
        }
        const upds = await dataStore.getUpdatesByProjectId(selectedProject.id);
        setActiveUpdates(upds);

        const docs = await dataStore.getDocuments(selectedProject.id);
        setDocuments(docs);

        const rs = await dataStore.getRisks(selectedProject.id);
        setRisks(rs);

        const is = await dataStore.getIssues(selectedProject.id);
        setIssues(is);

        const cls = await dataStore.getCloseout(selectedProject.id);
        setCloseout(cls);
      })();
    }
  }, [selectedProject?.id]);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const latestUpdate = activeUpdates[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={(p) => setSelectedProject(p)}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenWorkflowModal={() => setShowWorkflowModal(true)}
            onOpenConfigModal={() => setShowConfigModal(true)}
            notifications={notifications}
            onMarkNotificationAsRead={async (id) => {
              await dataStore.markNotificationAsRead(id);
              setNotifications(await dataStore.getNotifications());
            }}
            onMarkAllRead={async () => {
              await dataStore.markAllNotificationsAsRead();
              setNotifications(await dataStore.getNotifications());
            }}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={toggleSidebarCollapsed}
          />

          <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto">
            {/* View Switching */}
            {currentView === 'dashboard' && (
              <DashboardView
                projects={projects}
                metricsMap={metricsMap}
                onSelectProject={(p) => {
                  setSelectedProject(p);
                  setCurrentView('projects');
                }}
                onNavigate={(v) => setCurrentView(v)}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsView
                projects={projects}
                metricsMap={metricsMap}
                onSelectProject={(p) => setSelectedProject(p)}
                onNavigate={(v) => setCurrentView(v)}
                onOpenCreateProject={() => setCurrentView('projects-new')}
              />
            )}

            {currentView === 'projects-new' && (
              <ProjectSetupWizard
                onSaveProject={async (p, b) => {
                  if (currentUser) {
                    await dataStore.createProject(p, currentUser);
                    await dataStore.saveBaseline(b, currentUser);
                    await loadData();
                    setSelectedProject(p);
                    setCurrentView('projects');
                  }
                }}
                onCancel={() => setCurrentView('projects')}
              />
            )}

            {currentView === 'projects-update' && selectedProject && (
              <ProjectUpdateView
                project={selectedProject}
                baseline={activeBaseline}
                existingUpdates={activeUpdates}
                onSaveUpdate={async (u) => {
                  if (currentUser) {
                    await dataStore.submitUpdate(u, currentUser);
                    await loadData();
                  }
                }}
                onTriggerProcessing={() => setCurrentView('processing')}
              />
            )}

            {currentView === 'processing' && (
              <ProcessingView
                projectName={selectedProject?.name}
                projectCode={selectedProject?.code}
                onComplete={() => setCurrentView('forecasting')}
              />
            )}

            {currentView === 'forecasting' && selectedProject && (
              <ForecastingView
                project={selectedProject}
                baseline={activeBaseline}
                latestUpdate={latestUpdate}
                risks={risks}
                onNavigate={(v) => setCurrentView(v)}
              />
            )}

            {currentView === 'schedule' && selectedProject && (
              <ScheduleView
                project={selectedProject}
                baseline={activeBaseline}
                latestUpdate={latestUpdate}
                onNavigate={(v) => setCurrentView(v)}
              />
            )}

            {currentView === 'cost-finance' && selectedProject && (
              <CostFinanceView
                project={selectedProject}
                baseline={activeBaseline}
                latestUpdate={latestUpdate}
              />
            )}

            {currentView === 'billing-collection' && selectedProject && (
              <BillingCollectionView
                project={selectedProject}
                baseline={activeBaseline}
                latestUpdate={latestUpdate}
              />
            )}

            {currentView === 'risks-issues' && selectedProject && (
              <RisksIssuesView
                project={selectedProject}
                risks={risks}
                issues={issues}
                onAddRisk={async (r) => {
                  await dataStore.addRisk(r);
                  setRisks(await dataStore.getRisks(selectedProject.id));
                }}
                onAddIssue={async (i) => {
                  await dataStore.addIssue(i);
                  setIssues(await dataStore.getIssues(selectedProject.id));
                }}
              />
            )}

            {currentView === 'documents' && selectedProject && (
              <DocumentsView
                project={selectedProject}
                documents={documents}
                onUploadDocument={async (doc) => {
                  if (currentUser) {
                    await dataStore.addDocument(doc, currentUser);
                    setDocuments(await dataStore.getDocuments(selectedProject.id));
                  }
                }}
                onDeleteDocument={async (docId) => {
                  await dataStore.deleteDocument(selectedProject.id, docId);
                  setDocuments(await dataStore.getDocuments(selectedProject.id));
                }}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                projects={projects}
                selectedProject={selectedProject}
                baseline={activeBaseline}
                latestUpdate={latestUpdate}
              />
            )}

            {currentView === 'closeout' && selectedProject && (
              <ProjectCloseoutView
                project={selectedProject}
                closeout={closeout}
                onSaveCloseout={async (c) => {
                  if (currentUser) {
                    await dataStore.saveCloseout(c, currentUser);
                    await loadData();
                  }
                }}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView auditLogs={auditLogs} />
            )}
          </main>
        </div>
      </div>

      {/* Workflow Diagram Modal */}
      <WorkflowModal
        isOpen={showWorkflowModal}
        onClose={() => setShowWorkflowModal(false)}
        onJumpToStep={(stepId) => setCurrentView(stepId)}
      />

      {/* Firebase Config & Security Rules Modal */}
      <FirebaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
