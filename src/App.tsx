/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import Settings from './pages/Settings';

import { useEffect } from 'react';

// Mock Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; 
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const ThemeManager = () => {
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      const root = document.documentElement;
      console.log('Applying theme:', isDark ? 'dark' : 'light');
      if (isDark) {
        root.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    };

    // Initial apply
    const savedTheme = localStorage.getItem('theme');
    const initialIsDark = savedTheme === 'dark';
    
    applyTheme(initialIsDark);
    
    // Use a small timeout to ensure all components have mounted and are listening
    const timeoutId = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('theme-updated', { detail: { isDarkMode: initialIsDark } }));
    }, 50);

    const handleThemeUpdate = (e: any) => {
      if (e.detail && typeof e.detail.isDarkMode === 'boolean') {
        applyTheme(e.detail.isDarkMode);
      }
    };

    window.addEventListener('theme-updated', handleThemeUpdate as any);
    return () => {
      window.removeEventListener('theme-updated', handleThemeUpdate as any);
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
};

export default function App() {
  return (
    <Router>
      <ThemeManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="project/:id" element={<ProjectBoard />} />
          <Route path="tasks" element={<ProjectBoard />} /> {/* Reuse for now */}
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

