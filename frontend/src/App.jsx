import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/student/Dashboard';
import MessDetails from './pages/student/MessDetails';
import MyBookings from './pages/student/MyBookings';
import Profile from './pages/student/Profile';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MessForm from './pages/owner/MessForm';
import ManageMess from './pages/owner/ManageMess';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '14px' } }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Auth pages render standalone, without the Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Everything else shares the Navbar via MainLayout as a parent route */}
          <Route element={<MainLayout />}>
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
              element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>}
            />

            <Route
              path="/owner/dashboard"
              element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>}
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
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
