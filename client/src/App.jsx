import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import Companies from './pages/student/Companies';
import CompanyDetail from './pages/student/CompanyDetail';
import Notifications from './pages/student/Notifications';
import Experiences from './pages/student/Experiences';
import Profile from './pages/student/Profile';

// Coordinator pages
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import ManageCompanies from './pages/coordinator/ManageCompanies';
import ManageNotifications from './pages/coordinator/ManageNotifications';
import ManageExperiences from './pages/coordinator/ManageExperiences';
import StudentDirectory from './pages/coordinator/StudentDirectory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 14,
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/companies" element={<ProtectedRoute allowedRoles={['student']}><Companies /></ProtectedRoute>} />
            <Route path="/student/companies/:id" element={<ProtectedRoute allowedRoles={['student']}><CompanyDetail /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><Notifications /></ProtectedRoute>} />
            <Route path="/student/experiences" element={<ProtectedRoute allowedRoles={['student']}><Experiences /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />

            {/* Coordinator routes */}
            <Route path="/coordinator/dashboard" element={<ProtectedRoute allowedRoles={['coordinator']}><CoordinatorDashboard /></ProtectedRoute>} />
            <Route path="/coordinator/companies" element={<ProtectedRoute allowedRoles={['coordinator']}><ManageCompanies /></ProtectedRoute>} />
            <Route path="/coordinator/notifications" element={<ProtectedRoute allowedRoles={['coordinator']}><ManageNotifications /></ProtectedRoute>} />
            <Route path="/coordinator/experiences" element={<ProtectedRoute allowedRoles={['coordinator']}><ManageExperiences /></ProtectedRoute>} />
            <Route path="/coordinator/students" element={<ProtectedRoute allowedRoles={['coordinator']}><StudentDirectory /></ProtectedRoute>} />

            {/* Catch-all: redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
