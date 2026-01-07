import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadManagement from './pages/UploadManagement';
import QuestionBank from './pages/QuestionBank';
import ManageInstitutes from './pages/ManageInstitutes';
import Notifications from './pages/Notifications';
import HelpCenter from './pages/HelpCenter';
import Login from './pages/Login';
import { Menu } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import xlsx to ensure it's bundled/available if using build tools
// In CDN/Browser environment, this might be redundant but safe for TS
import * as XLSX from 'xlsx';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgMain">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-bold text-textSecondary uppercase tracking-widest text-xs">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Test Supabase Connection on Mount
  useEffect(() => {
    const testConnection = async () => {
      console.log('Testing Supabase connection...');
      try {
        const { count, error } = await supabase.from('questions').select('*', { count: 'exact', head: true });
        if (error) {
          console.error('Supabase connection failed:', error.message);
        } else {
          console.log(`Supabase connected successfully. Found ${count} existing records.`);
        }
      } catch (err) {
        console.error('Unexpected error connecting to Supabase:', err);
      }
    };

    testConnection();
  }, []);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-bgMain">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 md:ml-0 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold font-heading text-primary">Aptivo</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<UploadManagement />} />
            <Route path="/edit/:id" element={<UploadManagement />} />
            <Route path="/upload" element={<UploadManagement />} />
            <Route path="/bank" element={<QuestionBank />} />
            <Route path="/institutes" element={<ManageInstitutes />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;