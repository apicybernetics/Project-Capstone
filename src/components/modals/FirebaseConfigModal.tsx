import React, { useState } from 'react';
import { X, Database, Shield, Key, RefreshCw, Check, Copy } from 'lucide-react';
import {
  isFirebaseConfigured,
  firebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
} from '../../firebase/firebase';
import { dataStore } from '../../services/dataService';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(firebaseConfig.apiKey || '');
  const [projectId, setProjectId] = useState(firebaseConfig.projectId || 'project-management-outlook');
  const [authDomain, setAuthDomain] = useState(firebaseConfig.authDomain || 'project-management-outlook.firebaseapp.com');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'rules' | 'reset'>('status');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomFirebaseConfig({
      apiKey,
      projectId,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      storageBucket: `${projectId}.appspot.com`,
    });
  };

  const copyEnvSample = () => {
    const text = `VITE_FIREBASE_API_KEY="YOUR_API_KEY"\nVITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"\nVITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"\nVITE_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com"\nVITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"\nVITE_FIREBASE_APP_ID="YOUR_APP_ID"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Firebase Backend & Architecture Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Firestore database, authentication, and security enforcement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Firestore Security Rules
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'reset'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Reset Demo Data
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto text-xs space-y-4">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isFirebaseConfigured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div>
                  <p className="font-bold text-sm">
                    {isFirebaseConfigured
                      ? 'Live Cloud Firestore Mode Active'
                      : 'Enterprise Local Persistence Engine Active'}
                  </p>
                  <p className="text-xs opacity-90 mt-0.5">
                    {isFirebaseConfigured
                      ? `Connected to Firebase project: ${firebaseConfig.projectId}`
                      : 'Operating with full browser local database persistence & initial demo data.'}
                  </p>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isFirebaseConfigured ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isFirebaseConfigured ? 'Connected' : 'Local Persistence'}
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Direct Firebase Web Credentials</label>
                  <button
                    type="button"
                    onClick={copyEnvSample}
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy .env Template</span>
                  </button>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Firebase Project ID</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="my-pm-project-123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Firebase Web API Key</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <Key className="w-4 h-4" />
                    <span>Apply Firebase Config</span>
                  </button>
                  {localStorage.getItem('pm_custom_firebase_config') && (
                    <button
                      type="button"
                      onClick={clearCustomFirebaseConfig}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Clear & Revert
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Production Firestore Security Rules (RBAC & Immutability)</span>
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                  firestore.rules
                </span>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isSystemAdmin() {
      return isAuthenticated() && getUserRole() == 'System Administrator';
    }
    function isProjectManager() {
      return isAuthenticated() && (getUserRole() == 'Project Manager' || isSystemAdmin());
    }

    match /projects/{projectId} {
      allow read: if isAuthenticated();
      allow create, update: if isProjectManager();
      allow delete: if isSystemAdmin();

      // Baselines: Once approved, baseline revisions are immutable!
      match /baselines/{baselineId} {
        allow read: if isAuthenticated();
        allow create: if isProjectManager();
        allow update: if isProjectManager() && !resource.data.isApproved;
        allow delete: if false; // Revisions cannot be erased
      }

      // Periodic Updates & Progress Reports
      match /updates/{updateId} {
        allow read: if isAuthenticated();
        allow create, update: if isProjectManager();
      }

      // Audit Logs are append-only and tamper-proof
      match /auditLogs/{logId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update, delete: if false;
      }
    }
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'reset' && (
            <div className="space-y-3 py-2">
              <p className="text-slate-700 leading-relaxed">
                Resetting demo data will restore the original enterprise dataset (including Riverside Residences RR-001, Metro Rail Expansion, Skyline Tower, baselines, and monthly updates).
              </p>
              <button
                type="button"
                onClick={() => dataStore.resetDemoData()}
                className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Local Data to Factory Seed</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
