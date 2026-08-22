import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
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

// Smart root redirect
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Root redirect */}
    <Route path="/" element={<RootRedirect />} />

    {/* Auth */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Teacher routes */}
    <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<TeacherOverview />} />
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
    </Route>

    {/* Student routes */}
    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentOverview />} />
        <Route path="scan" element={<QRScannerPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
      </Route>
    </Route>

    {/* 404 Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => {
  return (
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
};

export default App;
