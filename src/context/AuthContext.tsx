/**
 * Authentication & Role-Based Access Control Context
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateAvatar: (avatarUrl: string) => void;
  // Role permission helpers
  canEditProject: boolean;
  canApproveBaseline: boolean;
  canSubmitUpdate: boolean;
  canManageBilling: boolean;
  canCloseoutProject: boolean;
  isReadOnly: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'u-1',
  email: 'icitumulak@gmail.com',
  displayName: 'Ian Tumulak',
  role: 'Project Manager',
  avatarUrl: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
  department: 'Project Management & Construction Controls',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Ensure the login page is always the first landing page when the user visits the site.
    // We check sessionStorage so refreshing within an active session remains authenticated,
    // but opening the site in a new tab/session starts directly on the Login page.
    const sessionUser = sessionStorage.getItem('pmo_active_session');
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('pmo_active_session', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('pmo_active_session');
      localStorage.removeItem('pmo_active_user');
    }
  }, [currentUser]);

  const login = async (email: string, role: UserRole = 'Project Manager') => {
    const user: UserProfile = {
      id: 'u-' + Math.random().toString(36).substring(2, 8),
      email,
      displayName: email.includes('@') ? email.split('@')[0].replace('.', ' ').toUpperCase() : 'Ian Tumulak',
      role,
      avatarUrl: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
      department: 'Capital Project Controls',
    };
    setCurrentUser(user);
    sessionStorage.setItem('pmo_active_session', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pmo_active_session');
    localStorage.removeItem('pmo_active_user');
  };

  const switchRole = (newRole: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      sessionStorage.setItem('pmo_active_session', JSON.stringify(updated));
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (currentUser) {
      const updated = { ...currentUser, avatarUrl };
      setCurrentUser(updated);
      sessionStorage.setItem('pmo_active_session', JSON.stringify(updated));
    }
  };

  const role = currentUser?.role;

  const canEditProject = role === 'System Administrator' || role === 'Project Manager';
  const canApproveBaseline = role === 'System Administrator' || role === 'Finance Officer';
  const canSubmitUpdate = role === 'System Administrator' || role === 'Project Manager' || role === 'Project Engineer';
  const canManageBilling = role === 'System Administrator' || role === 'Billing and Collection Officer' || role === 'Finance Officer';
  const canCloseoutProject = role === 'System Administrator' || role === 'Project Manager' || role === 'Finance Officer';
  const isReadOnly = role === 'Executive / Read-Only Viewer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRole,
        updateAvatar,
        canEditProject,
        canApproveBaseline,
        canSubmitUpdate,
        canManageBilling,
        canCloseoutProject,
        isReadOnly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
