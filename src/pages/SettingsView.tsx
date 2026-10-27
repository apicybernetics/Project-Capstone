import React, { useState } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  RefreshCw,
  Key,
  Lock,
  History,
  FileCheck,
  Camera,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChangePhotoModal } from '../components/modals/ChangePhotoModal';
import {
  isFirebaseConfigured,
  firebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
} from '../firebase/firebase';
import { dataStore } from '../services/dataService';
import { AuditLogEntry } from '../types';

interface SettingsViewProps {
  auditLogs: AuditLogEntry[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ auditLogs }) => {
  const { currentUser } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showProjectId, setShowProjectId] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(firebaseConfig.apiKey || '');
  const [projectId, setProjectId] = useState(firebaseConfig.projectId || 'project-management-outlook');
  const [authDomain, setAuthDomain] = useState(firebaseConfig.authDomain || 'project-management-outlook.firebaseapp.com');

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomFirebaseConfig({
      apiKey,
      projectId,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      storageBucket: `${projectId}.appspot.com`,
      messagingSenderId: '629313153131',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System Settings & Governance
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Firebase cloud infrastructure, role authorization matrix, and audit logs
        </p>
      </div>

      {/* User Profile & Personalization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={currentUser?.avatarUrl || '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg'}
              alt={currentUser?.displayName || 'User Avatar'}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shadow-sm ring-2 ring-blue-500/10"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              title="Change Photo"
              className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{currentUser?.displayName || 'Ian Tumulak'}</h3>
              <span className="text-[11px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                {currentUser?.role || 'Project Manager'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.email || 'icitumulak@gmail.com'}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-slate-400">Department:</span>
              <span className="font-medium text-slate-700">{currentUser?.department || 'Project Controls & Cost Management'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPhotoModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200/80 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Camera className="w-4 h-4 text-blue-600" />
          <span>Change Photo</span>
        </button>
      </div>

      {/* Cloud Firestore Integration Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cloud Firestore Infrastructure</h3>
              <p className="text-xs text-slate-500">
                Primary NoSQL cloud database for persistent project records
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isFirebaseConfigured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {isFirebaseConfigured ? 'Live Firebase Cloud' : 'Local Persistence Engine'}
          </span>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
          <p className="font-bold text-blue-900">Configured Firebase Project Target</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
            <div><span className="text-slate-500">Project Name:</span> <span className="font-semibold">Project Management Outlook</span></div>
            <div><span className="text-slate-500">Project ID:</span> <span className="font-mono font-semibold">project-management-outlook</span></div>
            <div><span className="text-slate-500">Project Number:</span> <span className="font-mono font-semibold">629313153131</span></div>
          </div>
        </div>

        <form onSubmit={handleSaveFirebase} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block font-semibold text-slate-700 mb-1">Firebase Project ID</label>
              <input
                type={showProjectId ? 'text' : 'password'}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="project-management-outlook"
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowProjectId(!showProjectId)}
                title={showProjectId ? 'Hide Firebase Project ID' : 'Show Firebase Project ID'}
                aria-label={showProjectId ? 'Hide Firebase Project ID' : 'Show Firebase Project ID'}
                className="absolute right-2.5 bottom-2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              >
                {showProjectId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <label className="block font-semibold text-slate-700 mb-1">Web API Key</label>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? 'Hide Web API Key' : 'Show Web API Key'}
                aria-label={showApiKey ? 'Hide Web API Key' : 'Show Web API Key'}
                className="absolute right-2.5 bottom-2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Key className="w-4 h-4" />
              <span>Save & Connect Firebase</span>
            </button>
            {localStorage.getItem('pm_custom_firebase_config') && (
              <button
                type="button"
                onClick={clearCustomFirebaseConfig}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Revert to Local Engine
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Role-Based Access Control (RBAC) Permission Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Role Title</th>
              <th className="py-2.5 px-4 text-center">Project Setup</th>
              <th className="py-2.5 px-4 text-center">Baseline Approval</th>
              <th className="py-2.5 px-4 text-center">Submit Updates</th>
              <th className="py-2.5 px-4 text-center">Billing & Finance</th>
              <th className="py-2.5 px-4 text-center">Project Closeout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">System Administrator</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">Project Manager</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-slate-400">Draft Only</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-slate-400">View Only</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">Project Engineer</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">Finance Officer</td>
              <td className="py-3 px-4 text-center text-slate-400">View</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-slate-400">View</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">Billing & Collection Officer</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
              <td className="py-3 px-4 text-center text-emerald-600 font-bold">Yes</td>
              <td className="py-3 px-4 text-center text-slate-400">No</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-900">Executive / Read-Only Viewer</td>
              <td className="py-3 px-4 text-center text-slate-400">View</td>
              <td className="py-3 px-4 text-center text-slate-400">View</td>
              <td className="py-3 px-4 text-center text-slate-400">View</td>
              <td className="py-3 px-4 text-center text-slate-400">View</td>
              <td className="py-3 px-4 text-center text-slate-400">View</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">System Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Immutable Log</span>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono font-semibold text-slate-600">
                    {log.projectCode}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{log.details}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Actor: <strong>{log.userName}</strong> ({log.userRole})
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Factory Reset */}
      <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-rose-900">Factory Reset Demo Environment</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            Restores all 5 projects, baselines, and monthly updates back to initial state.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dataStore.resetDemoData()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Local State</span>
        </button>
      </div>

      {/* Change Photo Modal */}
      <ChangePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
  );
};
