import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompleteGoogleSignup from './pages/auth/CompleteGoogleSignup';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Dashboard from './pages/student/Dashboard';
import MessDetails from './pages/student/MessDetails';
import MyBookings from './pages/student/MyBookings';
import Profile from './pages/student/Profile';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentBillingPage from './pages/student/StudentBillingPage';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MessForm from './pages/owner/MessForm';
import ManageMess from './pages/owner/ManageMess';
import AttendancePage from './pages/owner/AttendancePage';
import BillingPage from './pages/owner/BillingPage';
import ReportingPage from './pages/owner/ReportingPage';
import StudentsPage from './pages/owner/StudentsPage';

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '14px' } }} />
        <Routes>
          {/* Auth pages render standalone, without the Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-google-signup" element={<CompleteGoogleSignup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Everything else shares the Navbar via MainLayout as a parent route */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/messes/:messId" element={<MessDetails />} />

            <Route
              path="/dashboard"
              element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/bookings/me"
              element={<ProtectedRoute allowedRoles={['student']}><MyBookings /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute allowedRoles={['student', 'owner']}><Profile /></ProtectedRoute>}
            />
            <Route
              path="/my-attendance"
              element={<ProtectedRoute allowedRoles={['student']}><StudentAttendancePage /></ProtectedRoute>}
            />
            <Route
              path="/my-bills"
              element={<ProtectedRoute allowedRoles={['student']}><StudentBillingPage /></ProtectedRoute>}
            />

            {/* Owner Routes */}
            <Route
              path="/owner/dashboard"
              element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/owner/students"
              element={<ProtectedRoute allowedRoles={['owner']}><StudentsPage /></ProtectedRoute>}
            />
            <Route
              path="/owner/attendance"
              element={<ProtectedRoute allowedRoles={['owner']}><AttendancePage /></ProtectedRoute>}
            />
            <Route
              path="/owner/billing"
              element={<ProtectedRoute allowedRoles={['owner']}><BillingPage /></ProtectedRoute>}
            />
            <Route
              path="/owner/reports"
              element={<ProtectedRoute allowedRoles={['owner']}><ReportingPage /></ProtectedRoute>}
            />
            <Route
              path="/owner/messes/new"
              element={<ProtectedRoute allowedRoles={['owner']}><MessForm /></ProtectedRoute>}
            />
            <Route
              path="/owner/messes/:messId"
              element={<ProtectedRoute allowedRoles={['owner']}><MessForm /></ProtectedRoute>}
            />
            <Route
              path="/owner/messes/:messId/manage"
              element={<ProtectedRoute allowedRoles={['owner']}><ManageMess /></ProtectedRoute>}
            />
            <Route
              path="/owner/messes/:messId/attendance"
              element={<ProtectedRoute allowedRoles={['owner']}><AttendancePage /></ProtectedRoute>}
            />
            <Route
              path="/owner/messes/:messId/billing"
              element={<ProtectedRoute allowedRoles={['owner']}><BillingPage /></ProtectedRoute>}
            />
            <Route
              path="/owner/messes/:messId/reports"
              element={<ProtectedRoute allowedRoles={['owner']}><ReportingPage /></ProtectedRoute>}
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;