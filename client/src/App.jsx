import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import DemoBanner from './components/common/DemoBanner';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaint from './pages/student/SubmitComplaint';
import MyComplaints from './pages/student/MyComplaints';
import ComplaintDetails from './pages/student/ComplaintDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllComplaints from './pages/admin/AllComplaints';
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-brand-500 selection:text-white">
            {/* Top Demo 1-Click Role Sandbox Banner */}
            <DemoBanner />

            {/* Main Navigation Bar */}
            <Navbar />

            {/* Application Main Body */}
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/submit"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <SubmitComplaint />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MyComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/complaints/:id"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ComplaintDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Admin & Staff Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <AllComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/complaints/:id"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <AdminComplaintDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/management"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DepartmentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CategoryManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
