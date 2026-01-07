import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { UserRole } from './types';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import RegisterInstitution from './pages/RegisterInstitution';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminQuestions from './pages/SuperAdminQuestions';
import SuperAdminMaterials from './pages/SuperAdminMaterials';
import InstitutionDashboard from './pages/InstitutionDashboard';
import InstitutionUniversities from './pages/InstitutionUniversities';
import StudentHome from './pages/StudentHome';
import StudentUnderstandTopics from './pages/StudentUnderstandTopics';
import StudentApplyTopics from './pages/StudentApplyTopics';
import StudentCurriculum from './pages/StudentCurriculum';
import StudentUnderstand from './pages/StudentUnderstand';
import StudentApply from './pages/StudentApply';
import StudentMistakes from './pages/StudentMistakes';
import StudentAnalysis from './pages/StudentAnalysis';
import InstitutionAnalysis from './pages/InstitutionAnalysis';
import SuperAdminAnalysis from './pages/SuperAdminAnalysis';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading Aptivo...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ModeProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/register-institution" element={<RegisterInstitution />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.INSTITUTION_ADMIN, UserRole.STUDENT]}>
                  <Profile />
                </ProtectedRoute>
              }
            />


            {/* Super Admin Routes */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/analysis"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <SuperAdminAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/questions"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <SuperAdminQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/materials"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <SuperAdminMaterials />
                </ProtectedRoute>
              }
            />

            {/* Institution Admin Routes */}
            <Route
              path="/institution/dashboard"
              element={
                <ProtectedRoute allowedRoles={[UserRole.INSTITUTION_ADMIN]}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/students"
              element={
                <ProtectedRoute allowedRoles={[UserRole.INSTITUTION_ADMIN]}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/analysis"
              element={
                <ProtectedRoute allowedRoles={[UserRole.INSTITUTION_ADMIN]}>
                  <InstitutionAnalysis />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            {/* Student Home - Mode Selection Landing */}
            <Route
              path="/student/home"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            {/* Redirect old dashboard to new home */}
            <Route
              path="/student/dashboard"
              element={<Navigate to="/student/home" replace />}
            />
            {/* Understand Mode Topic Selection */}
            <Route
              path="/student/understand/topics"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentUnderstandTopics />
                </ProtectedRoute>
              }
            />
            {/* Apply Mode Topic Selection */}
            <Route
              path="/student/apply/topics"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentApplyTopics />
                </ProtectedRoute>
              }
            />
            {/* Student Analysis (Apply Mode) */}
            <Route
              path="/student/analysis"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentAnalysis />
                </ProtectedRoute>
              }
            />
            {/* Mistake Log (Apply Mode) */}
            <Route
              path="/student/mistakes"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentMistakes />
                </ProtectedRoute>
              }
            />
            {/* Curriculum Gateway (Hybrid - approved) */}
            <Route
              path="/student/university/:univId"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentCurriculum />
                </ProtectedRoute>
              }
            />
            {/* Understand Mode Content (Mode A) */}
            <Route
              path="/student/learn/:univId/understand/:materialId"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentUnderstand />
                </ProtectedRoute>
              }
            />
            {/* Apply Mode Practice (Mode B) */}
            <Route
              path="/student/learn/:univId/apply/:topic"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentApply />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/courses"
              element={<Navigate to="/student/home" replace />}
            />

            <Route path="*" element={<div className="h-screen flex items-center justify-center text-xl text-slate-400">404 - Page Not Found</div>} />
          </Routes>
        </ModeProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;