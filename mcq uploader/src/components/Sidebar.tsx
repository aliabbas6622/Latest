import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Database,
  School,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/add', icon: Upload, label: 'Upload Questions' },
    { to: '/content', icon: FileText, label: 'Learning Content' },
    { to: '/bank', icon: Database, label: 'Question Bank' },
    ...(user?.role === 'SUPER_ADMIN' ? [
      { to: '/institutes', icon: School, label: 'Institutions' },
      { to: '/notifications', icon: Bell, label: 'Broadcasts' }
    ] : []),
  ];

  const bottomNavItems = [
    { to: '/help', icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:sticky md:top-0 md:h-screen md:z-auto
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2.5 rounded-xl shadow-inner ring-1 ring-primary/30">
              <LayoutDashboard className="w-7 h-7 text-teal-800" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black text-textMain tracking-tighter leading-tight">APTIVO</span>
              <span className="text-[10px] font-black text-primary tracking-widest uppercase leading-none">MCQ Creator</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-textMain"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose} // Close sidebar on nav click (mobile)
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group font-medium text-sm relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30 ${isActive
                  ? 'bg-primary/20 text-teal-900 shadow-sm font-semibold'
                  : 'text-textSecondary hover:bg-gray-50 hover:text-textMain'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-800' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/30">
          <p className="px-4 text-[10px] font-bold text-textSecondary uppercase tracking-widest opacity-60 mb-2">Support</p>
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-medium text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30 ${isActive
                  ? 'bg-primary/20 text-teal-900 shadow-sm font-semibold'
                  : 'text-textSecondary hover:bg-white hover:text-textMain'
                }`
              }
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-teal-900 font-bold text-sm shadow-sm ring-2 ring-white flex-shrink-0">
                {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-textMain truncate">{user?.user_metadata?.full_name || 'Admin User'}</p>
                <p className="text-[10px] font-medium text-textSecondary opacity-80 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;