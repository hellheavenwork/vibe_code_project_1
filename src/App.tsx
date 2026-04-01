/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Eagerly load auth pages (tiny, shown before JS-heavy app loads)
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy-load heavier pages to split the bundle
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const ProjectBoard   = lazy(() => import('./pages/ProjectBoard'));
const MyTasks        = lazy(() => import('./pages/MyTasks'));
const Settings       = lazy(() => import('./pages/Settings'));
const UserManagement = lazy(() => import('./pages/UserManagement'));

const PageFallback = () => (
  <div className="flex h-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
  </div>
);

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

    const savedTheme = localStorage.getItem('theme');
    const initialIsDark = savedTheme === 'dark';
    applyTheme(initialIsDark);

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
        {/* Public */}
        <Route path="/" element={<Suspense fallback={<PageFallback />}><LandingPage /></Suspense>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
          <Route path="project/:id" element={<Suspense fallback={<PageFallback />}><ProjectBoard /></Suspense>} />
          <Route path="tasks" element={<Suspense fallback={<PageFallback />}><MyTasks /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<PageFallback />}><UserManagement /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageFallback />}><Settings /></Suspense>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
