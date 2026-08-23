import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import api from './api/axios';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Teacher pages
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherOverview from './pages/teacher/TeacherOverview';
import ClassroomsPage from './pages/teacher/ClassroomsPage';
import SessionsPage from './pages/teacher/SessionsPage';
import AnalyticsPage from './pages/teacher/AnalyticsPage';

// Student pages
import StudentLayout from './pages/student/StudentLayout';
import StudentOverview from './pages/student/StudentOverview';
import QRScannerPage from './pages/student/QRScannerPage';
import AttendancePage from './pages/student/AttendancePage';
import NotesPage from './pages/student/NotesPage';
import SchedulePage from './pages/student/SchedulePage';

/**
 * On auth pages (/login, /register), redirect already-logged-in users
 * directly to their dashboard so they never see the auth form again.
 */
const AuthGuard = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  // Ping health endpoint on load to wake up the backend (helpful for free tier hosting like Render)
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  return (
  <Routes>
    {/* ── Public ───────────────────────────────────────────────────── */}
    <Route path="/" element={<LandingPage />} />

    <Route
      path="/login"
      element={<AuthGuard><LoginPage /></AuthGuard>}
    />
    <Route
      path="/register"
      element={<AuthGuard><RegisterPage /></AuthGuard>}
    />

    {/* ── Teacher dashboard (protected) ────────────────────────────── */}
    <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
      <Route path="/dashboard/teacher" element={<TeacherLayout />}>
        <Route index element={<TeacherOverview />} />
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
    </Route>

    {/* ── Student dashboard (protected) ────────────────────────────── */}
    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
      <Route path="/dashboard/student" element={<StudentLayout />}>
        <Route index element={<StudentOverview />} />
        <Route path="scan" element={<QRScannerPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
      </Route>
    </Route>

    {/* ── Legacy short routes → redirect to new paths ──────────────── */}
    <Route path="/teacher/*" element={<Navigate to="/dashboard/teacher" replace />} />
    <Route path="/student/*" element={<Navigate to="/dashboard/student" replace />} />

    {/* ── 404 ──────────────────────────────────────────────────────── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: '"Source Sans Pro", Arial, sans-serif',
            fontSize: '14px',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
            style: {
              background: '#f0fdf4',
              color: '#14532d',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
            style: {
              background: '#fef2f2',
              color: '#7f1d1d',
              border: '1px solid #fecaca',
            },
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
