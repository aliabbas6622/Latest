import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddQuestion from './pages/AddQuestion';
import BulkUpload from './pages/BulkUpload';
import QuestionBank from './pages/QuestionBank';
import HelpCenter from './pages/HelpCenter';
import { Menu } from 'lucide-react';

// Import xlsx to ensure it's bundled/available if using build tools
// In CDN/Browser environment, this might be redundant but safe for TS
import * as XLSX from 'xlsx';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
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
              <Route path="/add" element={<AddQuestion />} />
              <Route path="/edit/:id" element={<AddQuestion />} />
              <Route path="/upload" element={<BulkUpload />} />
              <Route path="/bank" element={<QuestionBank />} />
              <Route path="/help" element={<HelpCenter />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;